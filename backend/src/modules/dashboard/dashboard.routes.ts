import { Router } from 'express';
import { prisma } from '../../lib/prisma.js';
import { toNumber } from '../../lib/format.js';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { requireCurrentUserRole } from '../../lib/authorization.js';

const router = Router();

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const currentUser = await requireCurrentUserRole(_req, res, ['super_admin', 'admin', 'bendahara']);
    if (!currentUser) {
      return;
    }

    const hideChildData = currentUser.role === 'bendahara';

    const [
      totalChildren,
      totalYatim,
      totalPiatu,
      totalYatimPiatu,
      totalDonors,
      donationSummary,
      expenseSummary,
      aidSummary,
      recentLogs
    ] = await Promise.all([
      hideChildData ? Promise.resolve(0) : prisma.child.count(),
      hideChildData ? Promise.resolve(0) : prisma.child.count({ where: { orphanCategory: 'yatim' } }),
      hideChildData ? Promise.resolve(0) : prisma.child.count({ where: { orphanCategory: 'piatu' } }),
      hideChildData ? Promise.resolve(0) : prisma.child.count({ where: { orphanCategory: 'yatim_piatu' } }),
      prisma.donor.count(),
      prisma.donation.aggregate({
        where: { paymentStatus: 'berhasil' },
        _sum: { amount: true }
      }),
      prisma.expense.aggregate({
        where: { status: { in: ['disetujui', 'dibayarkan'] } },
        _sum: { amount: true }
      }),
      prisma.aidDistribution.aggregate({
        where: { status: 'selesai' },
        _sum: { amount: true }
      }),
      hideChildData
        ? Promise.resolve([])
        : prisma.auditLog.findMany({
            take: 8,
            orderBy: { createdAt: 'desc' }
          })
    ]);

    const donationReceived = toNumber(donationSummary._sum.amount);
    const expensePaid = toNumber(expenseSummary._sum.amount);

    res.json({
      data: {
        totalChildren,
        totalYatim,
        totalPiatu,
        totalYatimPiatu,
        totalDonors,
        donationReceived,
        expensePaid,
        balance: donationReceived - expensePaid,
        aidDistributed: toNumber(aidSummary._sum.amount),
        recentLogs
      }
    });
  })
);

export default router;
