import { Router } from 'express';
import { Prisma } from '../../generated/prisma.js';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { asyncHandler } from '../../lib/asyncHandler.js';

const router = Router();

const donationCreateSchema = z.object({
  donorId: z.string().optional(),
  donorName: z.string().min(1),
  donorEmail: z.string().email(),
  donorPhone: z.string().min(5),
  programId: z.string().min(1),
  programTitle: z.string().min(1),
  donationType: z.enum(['umum', 'pendidikan', 'santunan', 'zakat', 'infak', 'sedekah', 'program_khusus']),
  amount: z.coerce.number().positive(),
  paymentMethod: z.enum(['transfer_bank', 'qris', 'e_wallet', 'tunai']),
  destinationAccount: z.string().min(1),
  paymentReference: z.string().optional(),
  paymentProofUrl: z.string().optional(),
  isAnonymous: z.boolean().optional(),
  donorMessage: z.string().optional()
});

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const donations = await prisma.donation.findMany({
      orderBy: { donatedAt: 'desc' },
      include: {
        donor: true,
        program: true,
        verifiedBy: true
      }
    });

    res.json({ data: donations });
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const input = donationCreateSchema.parse(req.body);
    const year = new Date().getFullYear();
    const count = await prisma.donation.count();
    const transactionNumber = `TRX-${year}${String(count + 1).padStart(4, '0')}`;
    const donorCount = await prisma.donor.count();

    const donor =
      input.donorId
        ? await prisma.donor.findUnique({ where: { id: input.donorId } })
        : await prisma.donor.findUnique({ where: { email: input.donorEmail } });

    const donorRecord = donor
      ? donor
      : await prisma.donor.create({
          data: {
            donorNumber: `DNR-${year}-${String(donorCount + 1).padStart(3, '0')}`,
            fullName: input.donorName,
            donorType: 'individu',
            email: input.donorEmail,
            phone: input.donorPhone,
            isAnonymousDefault: input.isAnonymous ?? false,
            isRecurringDonor: false
          }
        });

    const created = await prisma.donation.create({
      data: {
        transactionNumber,
        donorId: donorRecord.id,
        donorName: input.donorName,
        donorEmail: input.donorEmail,
        donorPhone: input.donorPhone,
        programId: input.programId,
        programTitle: input.programTitle,
        donationType: input.donationType,
        amount: new Prisma.Decimal(input.amount),
        paymentMethod: input.paymentMethod,
        destinationAccount: input.destinationAccount,
        paymentReference: input.paymentReference,
        paymentProofUrl: input.paymentProofUrl,
        isAnonymous: input.isAnonymous ?? false,
        donorMessage: input.donorMessage,
        paymentStatus: 'menunggu_verifikasi'
      }
    });

    res.status(201).json({ data: created });
  })
);

export default router;
