import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { requireCurrentUserRole } from '../../lib/authorization.js';
import { ApiError } from '../../lib/error.js';
import { hashPassword, mapUserRecord } from '../../lib/auth.js';

const router = Router();

const adminRoleSchema = z.enum(['super_admin', 'admin', 'bendahara', 'petugas']);
const userStatusSchema = z.enum(['active', 'suspended']);

const userCreateSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(5),
  role: adminRoleSchema,
  password: z.string().min(6),
  status: userStatusSchema.optional(),
  avatar: z.string().url().optional().or(z.literal('')).transform(value => (value && value.trim() ? value : undefined))
});

const userUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(5).optional(),
  role: adminRoleSchema.optional(),
  password: z.string().min(6).optional(),
  status: userStatusSchema.optional(),
  avatar: z.string().url().optional().or(z.literal('')).transform(value => (value && value.trim() ? value : undefined))
});

async function writeAuditLog(params: {
  actorUserId: string;
  action: string;
  entityId?: string;
  description: string;
  metadata?: Record<string, unknown>;
  req: Parameters<typeof requireCurrentUserRole>[0];
}) {
  await prisma.auditLog.create({
    data: {
      actorUserId: params.actorUserId,
      action: params.action,
      entityType: 'User',
      entityId: params.entityId,
      description: params.description,
      metadata: params.metadata ?? undefined,
      ipAddress: params.req.ip,
      userAgent: params.req.headers['user-agent'] ?? undefined
    }
  });
}

function canManageTargetRole(actorRole: string, targetRole?: string) {
  if (actorRole === 'super_admin') {
    return true;
  }

  return targetRole !== 'super_admin';
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const currentUser = await requireCurrentUserRole(req, res, ['super_admin', 'admin']);
    if (!currentUser) {
      return;
    }

    const users = await prisma.user.findMany({
      where: {
        role: {
          in: ['super_admin', 'admin', 'bendahara', 'petugas']
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      data: users.map(mapUserRecord)
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

    const input = userCreateSchema.parse(req.body);
    const normalizedEmail = input.email.toLowerCase().trim();
    const normalizedPhone = input.phone.trim();

    if (!canManageTargetRole(currentUser.role, input.role)) {
      throw new ApiError(403, 'Anda tidak dapat membuat akun super admin.');
    }

    const duplicate = await prisma.user.findFirst({
      where: {
        OR: [
          { email: normalizedEmail },
          { phone: normalizedPhone }
        ]
      }
    });

    if (duplicate) {
      throw new ApiError(409, 'Email atau nomor telepon sudah digunakan.');
    }

    const created = await prisma.user.create({
      data: {
        name: input.name.trim(),
        email: normalizedEmail,
        phone: normalizedPhone,
        role: input.role,
        passwordHash: hashPassword(input.password),
        status: input.status ?? 'active',
        avatar: input.avatar,
      }
    });

    await writeAuditLog({
      actorUserId: currentUser.id,
      action: 'CREATE_USER',
      entityId: created.id,
      description: `Membuat akun pengguna ${created.name} dengan role ${created.role}.`,
      metadata: {
        name: created.name,
        email: created.email,
        phone: created.phone,
        role: created.role,
        status: created.status
      },
      req
    });

    res.status(201).json({
      data: mapUserRecord(created)
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

    const target = await prisma.user.findUnique({
      where: { id: req.params.id }
    });

    if (!target) {
      throw new ApiError(404, 'User tidak ditemukan.');
    }

    const input = userUpdateSchema.parse(req.body);

    if (currentUser.id === target.id && (input.role !== undefined || input.status !== undefined)) {
      throw new ApiError(400, 'Anda tidak dapat mengubah role atau status akun sendiri.');
    }

    if (!canManageTargetRole(currentUser.role, input.role ?? target.role)) {
      throw new ApiError(403, 'Anda tidak dapat mengubah akun super admin.');
    }

    const nextEmail = input.email?.toLowerCase().trim();
    const nextPhone = input.phone?.trim();

    if (nextEmail) {
      const emailExists = await prisma.user.findFirst({
        where: {
          email: nextEmail,
          NOT: { id: target.id }
        }
      });

      if (emailExists) {
        throw new ApiError(409, 'Email sudah digunakan akun lain.');
      }
    }

    if (nextPhone) {
      const phoneExists = await prisma.user.findFirst({
        where: {
          phone: nextPhone,
          NOT: { id: target.id }
        }
      });

      if (phoneExists) {
        throw new ApiError(409, 'Nomor telepon sudah digunakan akun lain.');
      }
    }

    const updated = await prisma.user.update({
      where: { id: target.id },
      data: {
        name: input.name?.trim(),
        email: nextEmail,
        phone: nextPhone,
        role: input.role,
        status: input.status,
        avatar: input.avatar,
        passwordHash: input.password ? hashPassword(input.password) : undefined
      }
    });

    await writeAuditLog({
      actorUserId: currentUser.id,
      action: 'UPDATE_USER',
      entityId: updated.id,
      description: `Memperbarui akun pengguna ${updated.name}.`,
      metadata: {
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        role: updated.role,
        status: updated.status
      },
      req
    });

    res.json({
      data: mapUserRecord(updated)
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

    if (currentUser.id === req.params.id) {
      throw new ApiError(400, 'Anda tidak dapat menghapus akun sendiri.');
    }

    const target = await prisma.user.findUnique({
      where: { id: req.params.id }
    });

    if (!target) {
      throw new ApiError(404, 'User tidak ditemukan.');
    }

    if (!canManageTargetRole(currentUser.role, target.role)) {
      throw new ApiError(403, 'Anda tidak dapat menghapus akun super admin.');
    }

    await prisma.user.delete({
      where: { id: target.id }
    });

    await writeAuditLog({
      actorUserId: currentUser.id,
      action: 'DELETE_USER',
      entityId: target.id,
      description: `Menghapus akun pengguna ${target.name}.`,
      metadata: {
        name: target.name,
        email: target.email,
        phone: target.phone,
        role: target.role
      },
      req
    });

    res.status(204).send();
  })
);

export default router;
