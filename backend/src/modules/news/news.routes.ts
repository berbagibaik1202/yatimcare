import { Router, type Request } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/db.js';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { requireCurrentUserRole } from '../../lib/authorization.js';
import { ApiError } from '../../lib/error.js';

const router = Router();

const newsSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  content: z.string().min(1),
  coverImage: z
    .string()
    .optional()
    .or(z.literal(''))
    .transform((value) => (typeof value === 'string' && value.trim() ? value.trim() : undefined)),
  publishedAt: z.coerce.date().optional(),
  isPublished: z.boolean().optional()
});

const newsUpdateSchema = newsSchema.partial();

function slugify(value: string) {
  const slug = value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');

  return slug || 'berita';
}

async function generateUniqueSlug(title: string, excludeId?: string) {
  const baseSlug = slugify(title);
  let candidate = baseSlug;
  let index = 2;

  while (
    await prisma.newsItem.findFirst({
      where: {
        slug: candidate,
        ...(excludeId ? { NOT: { id: excludeId } } : {})
      }
    })
  ) {
    candidate = `${baseSlug}-${index}`;
    index += 1;
  }

  return candidate;
}

function mapNewsItem(item: any) {
  const publishedAt = item.publishedAt ?? item.createdAt;

  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    summary: item.summary,
    content: item.content,
    thumbnail: item.coverImage ?? 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
    category: item.isPublished ? 'Berita' : 'Kegiatan',
    publishedAt: publishedAt.toISOString(),
    author: item.createdBy?.name ?? 'Tim YatimCare',
    isPublished: item.isPublished,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString()
  };
}

async function writeAuditLog(params: {
  actorUserId: string;
  action: string;
  entityId?: string;
  description: string;
  metadata?: Record<string, unknown>;
  req: Request;
}) {
  await prisma.auditLog.create({
    data: {
      actorUserId: params.actorUserId,
      action: params.action,
      entityType: 'NewsItem',
      entityId: params.entityId,
      description: params.description,
      metadata: params.metadata ?? undefined,
      ipAddress: params.req.ip,
      userAgent: params.req.headers['user-agent'] ?? undefined
    }
  });
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const currentUser = await requireCurrentUserRole(req, res, ['super_admin', 'admin']);
    if (!currentUser) {
      return;
    }

    const news = await prisma.newsItem.findMany({
      orderBy: { createdAt: 'desc' },
      include: { createdBy: true }
    });

    res.json({
      data: news.map(mapNewsItem)
    });
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const currentUser = await requireCurrentUserRole(req, res, ['super_admin', 'admin']);
    if (!currentUser) {
      return;
    }

    const input = newsSchema.parse(req.body);
    const title = input.title.trim();
    const summary = input.summary.trim();
    const content = input.content.trim();
    const slug = await generateUniqueSlug(title);

    const created = await prisma.newsItem.create({
      data: {
        title,
        slug,
        summary,
        content,
        coverImage: input.coverImage,
        publishedAt: input.publishedAt ?? (input.isPublished ?? true ? new Date() : null),
        isPublished: input.isPublished ?? true,
        createdById: currentUser.id
      },
      include: {
        createdBy: true
      }
    });

    await writeAuditLog({
      actorUserId: currentUser.id,
      action: 'CREATE_NEWS',
      entityId: created.id,
      description: `Membuat konten berita ${created.title}.`,
      metadata: {
        slug: created.slug,
        isPublished: created.isPublished
      },
      req
    });

    res.status(201).json({
      data: mapNewsItem(created)
    });
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const currentUser = await requireCurrentUserRole(req, res, ['super_admin', 'admin']);
    if (!currentUser) {
      return;
    }

    const target = await prisma.newsItem.findUnique({
      where: { id: req.params.id },
      include: { createdBy: true }
    });

    if (!target) {
      throw new ApiError(404, 'Konten berita tidak ditemukan.');
    }

    const input = newsUpdateSchema.parse(req.body);
    const nextTitle = input.title?.trim();
    const nextSlug = nextTitle && nextTitle !== target.title ? await generateUniqueSlug(nextTitle, target.id) : undefined;
    const nextSummary = input.summary?.trim();
    const nextContent = input.content?.trim();
    const nextCoverImage = input.coverImage?.trim();
    const nextIsPublished = input.isPublished ?? target.isPublished;
    const nextPublishedAt =
      input.publishedAt ?? (nextIsPublished && !target.publishedAt ? new Date() : undefined);

    const updated = await prisma.newsItem.update({
      where: { id: target.id },
      data: {
        title: nextTitle,
        slug: nextSlug,
        summary: nextSummary,
        content: nextContent,
        coverImage: nextCoverImage,
        publishedAt: nextPublishedAt,
        isPublished: input.isPublished
      },
      include: {
        createdBy: true
      }
    });

    await writeAuditLog({
      actorUserId: currentUser.id,
      action: 'UPDATE_NEWS',
      entityId: updated.id,
      description: `Memperbarui konten berita ${updated.title}.`,
      metadata: {
        slug: updated.slug,
        isPublished: updated.isPublished
      },
      req
    });

    res.json({
      data: mapNewsItem(updated)
    });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const currentUser = await requireCurrentUserRole(req, res, ['super_admin', 'admin']);
    if (!currentUser) {
      return;
    }

    const target = await prisma.newsItem.findUnique({
      where: { id: req.params.id }
    });

    if (!target) {
      throw new ApiError(404, 'Konten berita tidak ditemukan.');
    }

    await prisma.newsItem.delete({
      where: { id: target.id }
    });

    await writeAuditLog({
      actorUserId: currentUser.id,
      action: 'DELETE_NEWS',
      entityId: target.id,
      description: `Menghapus konten berita ${target.title}.`,
      metadata: {
        slug: target.slug
      },
      req
    });

    res.status(204).send();
  })
);

export default router;
