import { Router } from 'express';
import { Prisma, VerificationStatus } from '../../generated/db.js';
import { z } from 'zod';
import { prisma } from '../../lib/db.js';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { requireCurrentUserRole } from '../../lib/authorization.js';

const router = Router();

const childUpdateStatus = z.enum([
  'draft',
  'diajukan',
  'menunggu_verifikasi',
  'perlu_perbaikan',
  'terverifikasi',
  'ditolak',
  'aktif',
  'tidak_aktif',
  'lulus'
]);

const childCreateSchema = z.object({
  guardianId: z.string().min(1),
  guardianName: z.string().min(1),
  guardianPhone: z.string().optional(),
  fullName: z.string().min(1),
  nickname: z.string().optional(),
  birthPlace: z.string().min(1),
  birthDate: z.coerce.date(),
  gender: z.enum(['L', 'P']),
  orphanCategory: z.enum(['yatim', 'piatu', 'yatim_piatu']),
  nik: z.string().min(8),
  familyCardNumber: z.string().min(8),
  birthCertificateNumber: z.string().optional(),
  address: z.string().min(1),
  rt: z.string().min(1),
  rw: z.string().min(1),
  province: z.string().min(1),
  city: z.string().min(1),
  district: z.string().min(1),
  village: z.string().min(1),
  postalCode: z.string().min(1),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  schoolName: z.string().min(1),
  educationLevel: z.string().min(1),
  schoolGrade: z.string().optional(),
  studentNumber: z.string().optional(),
  healthCondition: z.string().min(1),
  specialNeeds: z.string().optional(),
  familyMembers: z.coerce.number().int().min(1),
  homeOwnershipStatus: z.string().min(1),
  status: childUpdateStatus.optional(),
  verificationNotes: z.string().optional(),
  photoUrl: z.string().optional(),
  homePhotoUrl: z.string().optional()
});

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const currentUser = await requireCurrentUserRole(_req, res, ['super_admin', 'admin', 'petugas']);
    if (!currentUser) {
      return;
    }

    const children = await prisma.child.findMany({
      orderBy: { registeredAt: 'desc' },
      include: {
        guardian: true,
        documents: true,
        photos: true
      }
    });

    res.json({ data: children });
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const currentUser = await requireCurrentUserRole(req, res, ['super_admin', 'admin', 'petugas']);
    if (!currentUser) {
      return;
    }

    const input = childCreateSchema.parse(req.body);
    const year = new Date().getFullYear();
    const count = await prisma.child.count();
    const registrationNumber = `YCM-${year}-${String(count + 1).padStart(3, '0')}`;

    const created = await prisma.child.create({
      data: {
        registrationNumber,
        guardianId: input.guardianId,
        guardianName: input.guardianName,
        guardianPhone: input.guardianPhone,
        fullName: input.fullName,
        nickname: input.nickname,
        birthPlace: input.birthPlace,
        birthDate: input.birthDate,
        gender: input.gender,
        orphanCategory: input.orphanCategory,
        nik: input.nik,
        familyCardNumber: input.familyCardNumber,
        birthCertificateNumber: input.birthCertificateNumber,
        address: input.address,
        rt: input.rt,
        rw: input.rw,
        province: input.province,
        city: input.city,
        district: input.district,
        village: input.village,
        postalCode: input.postalCode,
        latitude: new Prisma.Decimal(input.latitude),
        longitude: new Prisma.Decimal(input.longitude),
        schoolName: input.schoolName,
        educationLevel: input.educationLevel,
        schoolGrade: input.schoolGrade,
        studentNumber: input.studentNumber,
        healthCondition: input.healthCondition,
        specialNeeds: input.specialNeeds,
        familyMembers: input.familyMembers,
        homeOwnershipStatus: input.homeOwnershipStatus,
        status: (input.status as VerificationStatus | undefined) ?? 'diajukan',
        verificationNotes: input.verificationNotes,
        photoUrl: input.photoUrl,
        homePhotoUrl: input.homePhotoUrl
      }
    });

    res.status(201).json({ data: created });
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const currentUser = await requireCurrentUserRole(req, res, ['super_admin', 'admin', 'petugas']);
    if (!currentUser) {
      return;
    }

    const input = childCreateSchema.partial().parse(req.body);
    const shouldMarkVerified = input.status !== undefined;
    const updated = await prisma.child.update({
      where: { id: req.params.id },
      data: {
        ...input,
        latitude: input.latitude !== undefined ? new Prisma.Decimal(input.latitude) : undefined,
        longitude: input.longitude !== undefined ? new Prisma.Decimal(input.longitude) : undefined,
        status: input.status as VerificationStatus | undefined,
        verifiedAt: shouldMarkVerified ? new Date() : undefined,
        verifiedById: shouldMarkVerified ? currentUser?.id : undefined
      }
    });

    res.json({ data: updated });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const currentUser = await requireCurrentUserRole(req, res, ['super_admin', 'admin', 'petugas']);
    if (!currentUser) {
      return;
    }

    await prisma.child.delete({
      where: { id: req.params.id }
    });

    res.status(204).send();
  })
);

export default router;
