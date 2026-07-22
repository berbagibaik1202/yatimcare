import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/db.js';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { requireCurrentUserRole } from '../../lib/authorization.js';

const router = Router();

const systemSettingSchema = z.object({
  value: z.any(),
  description: z.string().optional()
});

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const currentUser = await requireCurrentUserRole(req, res, ['super_admin', 'admin']);
    if (!currentUser) {
      return;
    }

    const settings = await prisma.systemSetting.findMany({
      orderBy: { key: 'asc' }
    });

    res.json({
      data: settings.map((setting: { key: string; value: unknown; description: string | null; updatedAt: Date }) => ({
        key: setting.key,
        value: setting.value,
        description: setting.description ?? undefined,
        updatedAt: setting.updatedAt.toISOString()
      }))
    });
  })
);

router.put(
  '/:key',
  asyncHandler(async (req, res) => {
    const currentUser = await requireCurrentUserRole(req, res, ['super_admin', 'admin']);
    if (!currentUser) {
      return;
    }

    const input = systemSettingSchema.parse(req.body);

    const updated = await prisma.systemSetting.upsert({
      where: { key: req.params.key },
      create: {
        key: req.params.key,
        value: input.value,
        description: input.description
      },
      update: {
        value: input.value,
        description: input.description
      }
    });

    res.json({
      data: {
        key: updated.key,
        value: updated.value,
        description: updated.description ?? undefined,
        updatedAt: updated.updatedAt.toISOString()
      }
    });
  })
);

export default router;
