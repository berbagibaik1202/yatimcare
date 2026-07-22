import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { asyncHandler } from '../../lib/asyncHandler.js';

const router = Router();

const donorCreateSchema = z.object({
  fullName: z.string().min(1),
  donorType: z.enum(['individu', 'perusahaan', 'organisasi', 'komunitas', 'anonim']),
  institutionName: z.string().optional(),
  email: z.string().email(),
  phone: z.string().min(5),
  address: z.string().optional(),
  isAnonymousDefault: z.boolean().optional(),
  isRecurringDonor: z.boolean().optional()
});

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const donors = await prisma.donor.findMany({
      orderBy: { createdAt: 'desc' },
      include: { donations: { take: 5, orderBy: { donatedAt: 'desc' } } }
    });

    res.json({ data: donors });
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const input = donorCreateSchema.parse(req.body);
    const year = new Date().getFullYear();
    const count = await prisma.donor.count();
    const donorNumber = `DNR-${year}-${String(count + 1).padStart(3, '0')}`;

    const created = await prisma.donor.create({
      data: {
        donorNumber,
        fullName: input.fullName,
        donorType: input.donorType,
        institutionName: input.institutionName,
        email: input.email,
        phone: input.phone,
        address: input.address,
        isAnonymousDefault: input.isAnonymousDefault ?? false,
        isRecurringDonor: input.isRecurringDonor ?? false
      }
    });

    res.status(201).json({ data: created });
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const input = donorCreateSchema.partial().parse(req.body);

    const updated = await prisma.donor.update({
      where: { id: req.params.id },
      data: {
        fullName: input.fullName,
        donorType: input.donorType,
        institutionName: input.institutionName,
        email: input.email,
        phone: input.phone,
        address: input.address,
        isAnonymousDefault: input.isAnonymousDefault,
        isRecurringDonor: input.isRecurringDonor
      }
    });

    res.json({ data: updated });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await prisma.donor.delete({
      where: { id: req.params.id }
    });

    res.status(204).send();
  })
);

export default router;
