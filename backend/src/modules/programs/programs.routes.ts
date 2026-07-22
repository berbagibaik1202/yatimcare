import { Router, type Request } from 'express';
import { z } from 'zod';
import { Prisma } from '../../generated/db.js';
import { prisma } from '../../lib/db.js';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { requireCurrentUserRole } from '../../lib/authorization.js';
import { ApiError } from '../../lib/error.js';
import { toNumber } from '../../lib/format.js';

const router = Router();

const programCategorySchema = z.enum(['pendidikan', 'kesehatan', 'santunan', 'sembako', 'pembangunan', 'darurat']);
const programStatusSchema = z.enum(['aktif', 'selesai', 'draft', 'dihentikan']);

const programCreateSchema = z.object({
  title: z.string().min(1),
  category: programCategorySchema,
  description: z.string().min(1),
  targetAmount: z.coerce.number().positive(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  thumbnail: z.string().min(1),
  status: programStatusSchema.optional(),
  isFeatured: z.boolean().optional()
});

const programUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  category: programCategorySchema.optional(),
  description: z.string().min(1).optional(),
  targetAmount: z.coerce.number().positive().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  thumbnail: z.string().min(1).optional(),
  status: programStatusSchema.optional(),
  isFeatured: z.boolean().optional()
});

function slugify(value: string) {
  const slug = value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');

  return slug || 'program';
}

async function generateUniqueSlug(title: string, excludeId?: string) {
  const baseSlug = slugify(title);
  let candidate = baseSlug;
  let index = 2;

  while (await prisma.program.findFirst({
    where: {
      slug: candidate,
      ...(excludeId ? { NOT: { id: excludeId } } : {})
    }
  })) {
    candidate = `${baseSlug}-${index}`;
    index += 1;
  }

  return candidate;
}

async function generateProgramCode() {
  const count = await prisma.program.count();
  return `PRG-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;
}

function mapProgram(program: {
  id: string;
  programCode: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  targetAmount: Prisma.Decimal;
  collectedAmount: Prisma.Decimal;
  distributedAmount: Prisma.Decimal;
  startDate: Date;
  endDate: Date;
  thumbnail: string;
  status: string;
  isFeatured: boolean;
  donorCount: number;
  createdAt: Date;
}) {
  return {
    id: program.id,
    programCode: program.programCode,
    title: program.title,
    slug: program.slug,
    category: program.category,
    description: program.description,
    targetAmount: toNumber(program.targetAmount),
    collectedAmount: toNumber(program.collectedAmount),
    distributedAmount: toNumber(program.distributedAmount),
    startDate: program.startDate.toISOString(),
    endDate: program.endDate.toISOString(),
    thumbnail: program.thumbnail,
    status: program.status,
    isFeatured: program.isFeatured,
    donorCount: program.donorCount,
    createdAt: program.createdAt.toISOString()
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
      entityType: 'Program',
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

    const programs = await prisma.program.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      data: programs.map(mapProgram)
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

    const input = programCreateSchema.parse(req.body);
    if (input.endDate < input.startDate) {
      throw new ApiError(400, 'Tanggal akhir program harus setelah tanggal mulai.');
    }

    const created = await prisma.program.create({
      data: {
        programCode: await generateProgramCode(),
        title: input.title.trim(),
        slug: await generateUniqueSlug(input.title),
        category: input.category,
        description: input.description.trim(),
        targetAmount: new Prisma.Decimal(input.targetAmount),
        startDate: input.startDate,
        endDate: input.endDate,
        thumbnail: input.thumbnail.trim(),
        status: input.status ?? 'aktif',
        isFeatured: input.isFeatured ?? false
      }
    });

    await writeAuditLog({
      actorUserId: currentUser.id,
      action: 'CREATE_PROGRAM',
      entityId: created.id,
      description: `Membuat program donasi ${created.title}.`,
      metadata: {
        programCode: created.programCode,
        title: created.title,
        category: created.category,
        status: created.status
      },
      req
    });

    res.status(201).json({
      data: mapProgram(created)
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

    const target = await prisma.program.findUnique({
      where: { id: req.params.id }
    });

    if (!target) {
      throw new ApiError(404, 'Program tidak ditemukan.');
    }

    const input = programUpdateSchema.parse(req.body);
    const nextTitle = input.title?.trim();
    const nextDescription = input.description?.trim();
    const nextThumbnail = input.thumbnail?.trim();
    const nextSlug = nextTitle && nextTitle !== target.title ? await generateUniqueSlug(nextTitle, target.id) : undefined;

    if (input.startDate && input.endDate && input.endDate < input.startDate) {
      throw new ApiError(400, 'Tanggal akhir program harus setelah tanggal mulai.');
    }

    const updated = await prisma.program.update({
      where: { id: target.id },
      data: {
        title: nextTitle,
        slug: nextSlug,
        category: input.category,
        description: nextDescription,
        targetAmount: input.targetAmount !== undefined ? new Prisma.Decimal(input.targetAmount) : undefined,
        startDate: input.startDate,
        endDate: input.endDate,
        thumbnail: nextThumbnail,
        status: input.status,
        isFeatured: input.isFeatured
      }
    });

    await writeAuditLog({
      actorUserId: currentUser.id,
      action: 'UPDATE_PROGRAM',
      entityId: updated.id,
      description: `Memperbarui program donasi ${updated.title}.`,
      metadata: {
        programCode: updated.programCode,
        title: updated.title,
        category: updated.category,
        status: updated.status
      },
      req
    });

    res.json({
      data: mapProgram(updated)
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

    const target = await prisma.program.findUnique({
      where: { id: req.params.id }
    });

    if (!target) {
      throw new ApiError(404, 'Program tidak ditemukan.');
    }

    const [donationCount, expenseCount, aidCount] = await Promise.all([
      prisma.donation.count({ where: { programId: target.id } }),
      prisma.expense.count({ where: { programId: target.id } }),
      prisma.aidDistribution.count({ where: { programId: target.id } })
    ]);

    if (donationCount + expenseCount + aidCount > 0) {
      throw new ApiError(409, 'Program tidak dapat dihapus karena masih digunakan pada transaksi atau penyaluran.');
    }

    await prisma.program.delete({
      where: { id: target.id }
    });

    await writeAuditLog({
      actorUserId: currentUser.id,
      action: 'DELETE_PROGRAM',
      entityId: target.id,
      description: `Menghapus program donasi ${target.title}.`,
      metadata: {
        programCode: target.programCode,
        title: target.title
      },
      req
    });

    res.status(204).send();
  })
);

export default router;
