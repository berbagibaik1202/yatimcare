import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/db.js';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { requireCurrentUserRole } from '../../lib/authorization.js';
import { ApiError } from '../../lib/error.js';

const router = Router();

const bankAccountSchema = z.object({
  bankName: z.string().min(1),
  accountNumber: z.string().min(1),
  accountHolder: z.string().min(1),
  accountType: z.string().min(1),
  isActive: z.boolean().optional()
});

function mapBankAccount(bankAccount: {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  accountType: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: bankAccount.id,
    bankName: bankAccount.bankName,
    accountNumber: bankAccount.accountNumber,
    accountHolder: bankAccount.accountHolder,
    accountType: bankAccount.accountType,
    branch: undefined,
    isActive: bankAccount.isActive,
    isPublic: true,
    logoUrl: undefined,
    createdAt: bankAccount.createdAt.toISOString(),
    updatedAt: bankAccount.updatedAt.toISOString()
  };
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const currentUser = await requireCurrentUserRole(req, res, ['super_admin', 'admin']);
    if (!currentUser) {
      return;
    }

    const bankAccounts = await prisma.bankAccount.findMany({
      orderBy: { createdAt: 'asc' }
    });

    res.json({
      data: bankAccounts.map(mapBankAccount)
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

    const input = bankAccountSchema.parse(req.body);
    const accountNumber = input.accountNumber.trim();

    const existing = await prisma.bankAccount.findFirst({
      where: { accountNumber }
    });

    if (existing) {
      throw new ApiError(409, 'Nomor rekening sudah digunakan.');
    }

    const created = await prisma.bankAccount.create({
      data: {
        bankName: input.bankName.trim(),
        accountNumber,
        accountHolder: input.accountHolder.trim(),
        accountType: input.accountType.trim(),
        isActive: input.isActive ?? true
      }
    });

    res.status(201).json({
      data: mapBankAccount(created)
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

    const target = await prisma.bankAccount.findUnique({
      where: { id: req.params.id }
    });

    if (!target) {
      throw new ApiError(404, 'Rekening tidak ditemukan.');
    }

    const input = bankAccountSchema.partial().parse(req.body);
    const nextAccountNumber = input.accountNumber?.trim();

    if (nextAccountNumber && nextAccountNumber !== target.accountNumber) {
      const existing = await prisma.bankAccount.findFirst({
        where: { accountNumber: nextAccountNumber }
      });

      if (existing && existing.id !== target.id) {
        throw new ApiError(409, 'Nomor rekening sudah digunakan.');
      }
    }

    const updated = await prisma.bankAccount.update({
      where: { id: target.id },
      data: {
        bankName: input.bankName?.trim(),
        accountNumber: nextAccountNumber,
        accountHolder: input.accountHolder?.trim(),
        accountType: input.accountType?.trim(),
        isActive: input.isActive
      }
    });

    res.json({
      data: mapBankAccount(updated)
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

    const target = await prisma.bankAccount.findUnique({
      where: { id: req.params.id }
    });

    if (!target) {
      throw new ApiError(404, 'Rekening tidak ditemukan.');
    }

    await prisma.bankAccount.delete({
      where: { id: target.id }
    });

    res.status(204).send();
  })
);

export default router;
