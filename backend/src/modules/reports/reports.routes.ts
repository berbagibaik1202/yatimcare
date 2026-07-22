import { Router } from 'express';
import { prisma } from '../../lib/db.js';
import { toNumber } from '../../lib/format.js';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { requireCurrentUserRole } from '../../lib/authorization.js';

const router = Router();

router.get(
  '/finance',
  asyncHandler(async (_req, res) => {
    const currentUser = await requireCurrentUserRole(_req, res, ['super_admin', 'admin', 'bendahara']);
    if (!currentUser) {
      return;
    }

    const [income, expense, donationsByStatus, expensesByStatus] = await Promise.all([
      prisma.donation.aggregate({
        where: { paymentStatus: 'berhasil' },
        _sum: { amount: true }
      }),
      prisma.expense.aggregate({
        where: { status: { in: ['disetujui', 'dibayarkan'] } },
        _sum: { amount: true }
      }),
      prisma.donation.groupBy({
        by: ['paymentStatus'],
        _count: { _all: true }
      }),
      prisma.expense.groupBy({
        by: ['status'],
        _count: { _all: true }
      })
    ]);

    res.json({
      data: {
        income: toNumber(income._sum.amount),
        expense: toNumber(expense._sum.amount),
        balance: toNumber(income._sum.amount) - toNumber(expense._sum.amount),
        donationsByStatus,
        expensesByStatus
      }
    });
  })
);

export default router;
