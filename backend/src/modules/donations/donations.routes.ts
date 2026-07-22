import { Router } from 'express';
import { Prisma } from '../../generated/prisma.js';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { requireCurrentUserRole } from '../../lib/authorization.js';

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

const donationVerifySchema = z.object({
  status: z.enum(['berhasil', 'ditolak'])
});

function mapDonationRecord(donation: any) {
  return {
    id: donation.id,
    transactionNumber: donation.transactionNumber,
    donorId: donation.donorId ?? undefined,
    donorName: donation.donorName,
    donorEmail: donation.donorEmail,
    donorPhone: donation.donorPhone,
    programId: donation.programId,
    programTitle: donation.programTitle,
    donationType: donation.donationType,
    amount: Number(donation.amount),
    paymentMethod: donation.paymentMethod,
    destinationAccount: donation.destinationAccount,
    paymentReference: donation.paymentReference ?? undefined,
    paymentProofUrl: donation.paymentProofUrl ?? undefined,
    paymentStatus: donation.paymentStatus,
    isAnonymous: donation.isAnonymous,
    donorMessage: donation.donorMessage ?? undefined,
    donatedAt: donation.donatedAt.toISOString(),
    verifiedBy: donation.verifiedBy?.name ?? undefined,
    verifiedAt: donation.verifiedAt?.toISOString()
  };
}

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const currentUser = await requireCurrentUserRole(_req, res, ['super_admin', 'admin', 'bendahara']);
    if (!currentUser) {
      return;
    }

    const donations = await prisma.donation.findMany({
      orderBy: { donatedAt: 'desc' },
      include: {
        donor: true,
        program: true,
        verifiedBy: true
      }
    });

    res.json({ data: donations.map(mapDonationRecord) });
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const currentUser = await requireCurrentUserRole(req, res, ['super_admin', 'admin', 'bendahara']);
    if (!currentUser) {
      return;
    }

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

    const donation = await prisma.donation.findUnique({
      where: { id: created.id },
      include: {
        verifiedBy: true
      }
    });

    await prisma.auditLog.create({
      data: {
        actorUserId: currentUser.id,
        action: 'SUBMIT_DONASI',
        entityType: 'Donation',
        entityId: created.id,
        description: `Mengirimkan donasi baru Rp ${input.amount.toLocaleString('id-ID')} (${transactionNumber})`,
        metadata: {
          amount: input.amount,
          transactionNumber,
          paymentMethod: input.paymentMethod,
          destinationAccount: input.destinationAccount
        }
      }
    });

    res.status(201).json({ data: mapDonationRecord(donation ?? created) });
  })
);

router.patch(
  '/:id/verify',
  asyncHandler(async (req, res) => {
    const currentUser = await requireCurrentUserRole(req, res, ['super_admin', 'admin', 'bendahara']);
    if (!currentUser) {
      return;
    }

    const input = donationVerifySchema.parse(req.body);
    const donationId = req.params.id;
    const verifiedAt = new Date();

    const updated = await prisma.$transaction(async (tx: any) => {
      const transactional = tx as typeof prisma;

      const donation = await transactional.donation.findUnique({
        where: { id: donationId },
        include: {
          donor: true,
          program: true,
          verifiedBy: true
        }
      });

      if (!donation) {
        throw new Error('Donasi tidak ditemukan');
      }

      const previousStatus = donation.paymentStatus;
      const wasSuccessful = previousStatus === 'berhasil';
      const willBeSuccessful = input.status === 'berhasil';
      const amount = donation.amount;

      if (wasSuccessful !== willBeSuccessful) {
        if (donation.donor) {
          const donorTotal = Number(donation.donor.totalDonation);
          const nextTotal = willBeSuccessful
            ? donorTotal + Number(amount)
            : Math.max(0, donorTotal - Number(amount));

          const nextTransactionCount = willBeSuccessful
            ? donation.donor.transactionCount + 1
            : Math.max(0, donation.donor.transactionCount - 1);

          await transactional.donor.update({
            where: { id: donation.donor.id },
            data: {
              totalDonation: new Prisma.Decimal(nextTotal),
              transactionCount: nextTransactionCount,
              lastDonationAt: willBeSuccessful ? verifiedAt : donation.donor.lastDonationAt
            }
          });
        }

        const program = await transactional.program.findUnique({ where: { id: donation.programId } });
        if (program) {
          const nextCollected = willBeSuccessful
            ? Number(program.collectedAmount) + Number(amount)
            : Math.max(0, Number(program.collectedAmount) - Number(amount));

          const nextDonorCount = willBeSuccessful
            ? program.donorCount + 1
            : Math.max(0, program.donorCount - 1);

          await transactional.program.update({
            where: { id: donation.programId },
            data: {
              collectedAmount: new Prisma.Decimal(nextCollected),
              donorCount: nextDonorCount
            }
          });
        }
      }

      const verifiedDonation = await transactional.donation.update({
        where: { id: donationId },
        data: {
          paymentStatus: input.status,
          verifiedById: currentUser.id,
          verifiedAt
        },
        include: {
          donor: true,
          program: true,
          verifiedBy: true
        }
      });

      await transactional.auditLog.create({
        data: {
          actorUserId: currentUser.id,
          action: 'VERIFIKASI_DONASI',
          entityType: 'Donation',
          entityId: verifiedDonation.id,
          description:
            input.status === 'berhasil'
              ? `Memverifikasi donasi ${verifiedDonation.transactionNumber} sebagai berhasil dan menambah saldo Rp ${Number(amount).toLocaleString('id-ID')}`
              : `Menolak donasi ${verifiedDonation.transactionNumber}`,
          metadata: {
            previousStatus,
            nextStatus: input.status,
            amount: Number(amount),
            balanceImpact: input.status === 'berhasil' ? 'increase' : 'none',
            transactionNumber: verifiedDonation.transactionNumber
          }
        }
      });

      return verifiedDonation;
    });

    res.json({ data: mapDonationRecord(updated) });
  })
);

export default router;
