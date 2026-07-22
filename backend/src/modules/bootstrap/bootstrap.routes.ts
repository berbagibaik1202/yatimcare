import { Router } from 'express';
import { prisma } from '../../lib/prisma.js';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { toNumber } from '../../lib/format.js';
import { getCurrentUserFromRequest } from '../../lib/auth.js';

const router = Router();

function mapAuditLog(log: any) {
  return {
    id: log.id,
    userId: log.actorUserId ?? 'sys',
    userName: log.actorUser?.name ?? 'Sistem',
    userRole: log.actorUser?.role ?? 'public',
    action: log.action,
    module: log.entityType,
    recordId: log.entityId ?? undefined,
    details: log.description,
    ipAddress: log.ipAddress ?? '-',
    timestamp: log.createdAt.toISOString()
  };
}

function mapNewsItem(item: any) {
  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    summary: item.summary,
    content: item.content,
    thumbnail: item.coverImage ?? 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
    category: item.isPublished ? 'Berita' : 'Kegiatan',
    publishedAt: (item.publishedAt ?? item.createdAt).toISOString(),
    author: item.createdBy?.name ?? 'Tim YatimCare',
    isPublished: item.isPublished,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString()
  };
}

function mapGalleryItem(item: any) {
  return {
    id: item.id,
    title: item.title,
    description: item.caption ?? '',
    mediaUrl: item.imageUrl,
    category: 'Kegiatan Yayasan',
    date: item.createdAt.toISOString()
  };
}

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const currentUser = await getCurrentUserFromRequest(_req);

    const [
      users,
      guardians,
      children,
      donors,
      programs,
      donations,
      expenses,
      aidDistributions,
      surveys,
      bankAccounts,
      auditLogs,
      news,
      gallery,
      systemSettings
    ] = await Promise.all([
      prisma.user.findMany({ orderBy: { createdAt: 'asc' } }),
      prisma.guardian.findMany({ orderBy: { createdAt: 'asc' } }),
      prisma.child.findMany({
        orderBy: { registeredAt: 'desc' },
        include: {
          documents: true,
          photos: true
        }
      }),
      prisma.donor.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.program.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.donation.findMany({
        orderBy: { donatedAt: 'desc' },
        include: { donor: true, program: true, verifiedBy: true }
      }),
      prisma.expense.findMany({
        orderBy: { createdAt: 'desc' },
        include: { program: true, submittedBy: true, approvedBy: true }
      }),
      prisma.aidDistribution.findMany({
        orderBy: { createdAt: 'desc' },
        include: { child: true, program: true, officer: true }
      }),
      prisma.survey.findMany({
        orderBy: { surveyDate: 'desc' },
        include: { child: true, officer: true }
      }),
      prisma.bankAccount.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        include: { actorUser: true }
      }),
      prisma.newsItem.findMany({
        orderBy: { createdAt: 'desc' },
        include: { createdBy: true }
      }),
      prisma.galleryItem.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.systemSetting.findMany({ orderBy: { key: 'asc' } })
    ]);

    const hideSensitiveData = currentUser?.role === 'bendahara';
    const visibleGuardians = hideSensitiveData ? [] : guardians;
    const visibleChildren = hideSensitiveData ? [] : children;
    const visibleSurveys = hideSensitiveData ? [] : surveys;
    const visibleAuditLogs = hideSensitiveData ? [] : auditLogs;

    const successfulDonations = donations.filter((donation: any) => donation.paymentStatus === 'berhasil');
    const approvedExpenses = expenses.filter((expense: any) => expense.status === 'dibayarkan' || expense.status === 'disetujui');
    const activeChildren = visibleChildren.filter((child: any) => child.status === 'aktif');
    const visibleNews = currentUser ? news : news.filter((item: any) => item.isPublished);

    res.json({
      data: {
        users: users.map((user: any) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          avatar: user.avatar ?? undefined,
          status: user.status,
          createdAt: user.createdAt.toISOString()
        })),
        guardians: visibleGuardians.map((guardian: any) => ({
          id: guardian.id,
          userId: guardian.userId ?? '',
          fullName: guardian.fullName,
          nik: guardian.nik,
          relationship: guardian.relationship,
          occupation: guardian.occupation,
          monthlyIncome: guardian.monthlyIncome,
          phone: guardian.phone,
          email: guardian.email,
          address: guardian.address,
          province: guardian.province,
          city: guardian.city,
          district: guardian.district,
          village: guardian.village,
          postalCode: guardian.postalCode,
          createdAt: guardian.createdAt.toISOString()
        })),
        children: visibleChildren.map((child: any) => ({
          id: child.id,
          registrationNumber: child.registrationNumber,
          guardianId: child.guardianId,
          guardianName: child.guardianName,
          guardianPhone: child.guardianPhone ?? '',
          fullName: child.fullName,
          nickname: child.nickname ?? child.fullName,
          birthPlace: child.birthPlace,
          birthDate: child.birthDate.toISOString().slice(0, 10),
          gender: child.gender as 'L' | 'P',
          orphanCategory: child.orphanCategory,
          nik: child.nik,
          familyCardNumber: child.familyCardNumber,
          birthCertificateNumber: child.birthCertificateNumber ?? undefined,
          address: child.address,
          rt: child.rt,
          rw: child.rw,
          province: child.province,
          city: child.city,
          district: child.district,
          village: child.village,
          postalCode: child.postalCode,
          latitude: Number(child.latitude),
          longitude: Number(child.longitude),
          schoolName: child.schoolName,
          educationLevel: child.educationLevel as any,
          schoolGrade: child.schoolGrade ?? '',
          studentNumber: child.studentNumber ?? undefined,
          healthCondition: child.healthCondition,
          specialNeeds: child.specialNeeds ?? undefined,
          familyMembers: child.familyMembers,
          homeOwnershipStatus: child.homeOwnershipStatus as any,
          status: child.status,
          verificationNotes: child.verificationNotes ?? undefined,
          registeredAt: child.registeredAt.toISOString(),
          verifiedAt: child.verifiedAt?.toISOString(),
          verifiedBy: child.verifiedById ?? undefined,
          photoUrl: child.photoUrl ?? 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=400&q=80',
          homePhotoUrl: child.homePhotoUrl ?? undefined,
          documents: child.documents.map((document: any) => ({
            id: document.id,
            childId: document.childId,
            documentType: document.documentType,
            title: document.title,
            filePath: document.filePath,
            verificationStatus: document.verificationStatus === 'terverifikasi' ? 'terverifikasi' : document.verificationStatus === 'ditolak' ? 'ditolak' : 'menunggu',
            notes: document.notes ?? undefined,
            uploadedAt: document.uploadedAt.toISOString()
          })),
          totalAidReceived: Number(child.totalAidReceived)
        })),
        donors: donors.map((donor: any) => ({
          id: donor.id,
          userId: donor.userId ?? undefined,
          donorNumber: donor.donorNumber,
          fullName: donor.fullName,
          donorType: donor.donorType,
          institutionName: donor.institutionName ?? undefined,
          email: donor.email,
          phone: donor.phone,
          address: donor.address ?? undefined,
          isAnonymousDefault: donor.isAnonymousDefault,
          isRecurringDonor: donor.isRecurringDonor,
          verificationStatus: donor.verificationStatus,
          totalDonation: Number(donor.totalDonation),
          transactionCount: donor.transactionCount,
          lastDonationAt: donor.lastDonationAt?.toISOString(),
          avatarUrl: donor.avatarUrl ?? undefined,
          createdAt: donor.createdAt.toISOString()
        })),
        programs: programs.map((program: any) => ({
          id: program.id,
          programCode: program.programCode,
          title: program.title,
          slug: program.slug,
          category: program.category,
          description: program.description,
          targetAmount: Number(program.targetAmount),
          collectedAmount: Number(program.collectedAmount),
          distributedAmount: Number(program.distributedAmount),
          startDate: program.startDate.toISOString(),
          endDate: program.endDate.toISOString(),
          thumbnail: program.thumbnail,
          status: program.status,
          isFeatured: program.isFeatured,
          donorCount: program.donorCount,
          createdAt: program.createdAt.toISOString()
        })),
        donations: donations.map((donation: any) => ({
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
        })),
        expenses: expenses.map((expense: any) => ({
          id: expense.id,
          expenseNumber: expense.expenseNumber,
          programId: expense.programId ?? undefined,
          programTitle: expense.programTitle ?? undefined,
          category: expense.category.replace(/_/g, ' ') as any,
          transactionDate: expense.transactionDate.toISOString().slice(0, 10),
          recipientName: expense.recipientName,
          amount: Number(expense.amount),
          purpose: expense.purpose,
          description: expense.description,
          paymentMethod: expense.paymentMethod,
          receiptFileUrl: expense.receiptFileUrl ?? undefined,
          status: expense.status,
          submittedBy: expense.submittedBy.name,
          approvedBy: expense.approvedBy?.name ?? undefined,
          approvedAt: expense.approvedAt?.toISOString(),
          createdAt: expense.createdAt.toISOString()
        })),
        aidDistributions: aidDistributions.map((aid: any) => ({
          id: aid.id,
          distributionNumber: aid.distributionNumber,
          childId: aid.childId,
          childName: aid.childName,
          guardianName: aid.guardianName,
          programId: aid.programId ?? undefined,
          programTitle: aid.programTitle ?? undefined,
          aidType: aid.aidType as any,
          distributionDate: aid.distributionDate.toISOString().slice(0, 10),
          amount: Number(aid.amount),
          itemDescription: aid.itemDescription,
          sourceOfFunds: aid.sourceOfFunds,
          officerId: aid.officerId,
          officerName: aid.officerName,
          location: aid.location,
          receiptSignatureUrl: aid.receiptSignatureUrl ?? undefined,
          photoUrl: aid.photoUrl ?? undefined,
          status: aid.status,
          notes: aid.notes ?? undefined
        })),
        surveys: visibleSurveys.map((survey: any) => ({
          id: survey.id,
          childId: survey.childId,
          childName: survey.childName,
          officerId: survey.officerId,
          officerName: survey.officerName,
          surveyDate: survey.surveyDate.toISOString(),
          economicCondition: survey.economicCondition,
          homeCondition: survey.homeCondition,
          educationCondition: survey.educationCondition,
          healthCondition: survey.healthCondition,
          documentMatch: survey.documentMatch,
          latitude: Number(survey.latitude),
          longitude: Number(survey.longitude),
          recommendation: survey.recommendation,
          notes: survey.notes,
          photos: survey.photos ?? []
        })),
        bankAccounts: bankAccounts.map((bankAccount: any) => ({
          id: bankAccount.id,
          bankName: bankAccount.bankName,
          accountNumber: bankAccount.accountNumber,
          accountHolder: bankAccount.accountHolder,
          branch: undefined,
          isActive: bankAccount.isActive,
          isPublic: true,
          logoUrl: undefined
        })),
        auditLogs: visibleAuditLogs.map((entry: any) => mapAuditLog(entry)),
        news: visibleNews.map((item: any) => mapNewsItem(item)),
        gallery: gallery.map((item: any) => mapGalleryItem(item)),
        systemSettings: systemSettings.map((setting: any) => ({
          key: setting.key,
          value: setting.value,
          description: setting.description ?? undefined,
          updatedAt: setting.updatedAt.toISOString()
        })),
        financialSummary: {
          totalDonationReceived: successfulDonations.reduce((sum: number, donation: any) => sum + toNumber(donation.amount), 0),
          totalExpenseApproved: approvedExpenses.reduce((sum: number, expense: any) => sum + toNumber(expense.amount), 0),
          currentBalance:
            successfulDonations.reduce((sum: number, donation: any) => sum + toNumber(donation.amount), 0) -
            approvedExpenses.reduce((sum: number, expense: any) => sum + toNumber(expense.amount), 0),
          totalActiveChildren: activeChildren.length,
          totalOrphanYatim: visibleChildren.filter((child: any) => child.orphanCategory === 'yatim').length,
          totalOrphanPiatu: visibleChildren.filter((child: any) => child.orphanCategory === 'piatu').length,
          totalOrphanYatimPiatu: visibleChildren.filter((child: any) => child.orphanCategory === 'yatim_piatu').length,
          totalActiveDonors: donors.length,
          totalDistributedAid: aidDistributions
            .filter((aid: any) => aid.status === 'selesai')
            .reduce((sum: number, aid: any) => sum + toNumber(aid.amount), 0),
          pendingVerificationsCount:
            visibleChildren.filter((child: any) => child.status === 'menunggu_verifikasi' || child.status === 'diajukan').length +
            donations.filter((donation: any) => donation.paymentStatus === 'menunggu_verifikasi').length
        },
        currentUser
      }
    });
  })
);

export default router;
