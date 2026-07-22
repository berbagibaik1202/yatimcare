import { Router } from 'express';
import { Prisma } from '../../generated/db.js';
import { prisma } from '../../lib/db.js';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { requireCurrentUserRole } from '../../lib/authorization.js';
import { ApiError } from '../../lib/error.js';

const router = Router();

type BackupSnapshot = {
  users: Array<Record<string, unknown>>;
  guardians: Array<Record<string, unknown>>;
  children: Array<Record<string, unknown>>;
  childDocuments: Array<Record<string, unknown>>;
  childPhotos: Array<Record<string, unknown>>;
  surveys: Array<Record<string, unknown>>;
  donors: Array<Record<string, unknown>>;
  programs: Array<Record<string, unknown>>;
  donations: Array<Record<string, unknown>>;
  expenses: Array<Record<string, unknown>>;
  aidDistributions: Array<Record<string, unknown>>;
  bankAccounts: Array<Record<string, unknown>>;
  auditLogs: Array<Record<string, unknown>>;
  notifications: Array<Record<string, unknown>>;
  news: Array<Record<string, unknown>>;
  gallery: Array<Record<string, unknown>>;
  systemSettings: Array<Record<string, unknown>>;
};

type BackupPayload = {
  version: number;
  exportedAt: string;
  snapshot: BackupSnapshot;
};

function serializeDecimal(value: Prisma.Decimal | null | undefined) {
  return value === null || value === undefined ? undefined : Number(value);
}

function serializeDate(value: Date | null | undefined) {
  return value ? value.toISOString() : undefined;
}

function mapBackupPayload(payload: BackupPayload) {
  return {
    version: payload.version,
    exportedAt: payload.exportedAt,
    snapshot: payload.snapshot
  };
}

function restoreDate(value: unknown) {
  if (typeof value !== 'string' && !(value instanceof Date)) {
    return undefined;
  }

  const nextDate = new Date(value);
  return Number.isNaN(nextDate.getTime()) ? undefined : nextDate;
}

function restoreDecimal(value: unknown) {
  if (typeof value === 'number' || typeof value === 'string') {
    return new Prisma.Decimal(value);
  }

  return undefined;
}

async function clearDatabase(tx: any) {
  const transactional = tx as typeof prisma;

  await transactional.childPhoto.deleteMany();
  await transactional.childDocument.deleteMany();
  await transactional.survey.deleteMany();
  await transactional.aidDistribution.deleteMany();
  await transactional.donation.deleteMany();
  await transactional.expense.deleteMany();
  await transactional.child.deleteMany();
  await transactional.guardian.deleteMany();
  await transactional.program.deleteMany();
  await transactional.donor.deleteMany();
  await transactional.bankAccount.deleteMany();
  await transactional.notification.deleteMany();
  await transactional.auditLog.deleteMany();
  await transactional.newsItem.deleteMany();
  await transactional.galleryItem.deleteMany();
  await transactional.systemSetting.deleteMany();
  await transactional.user.deleteMany();
}

async function buildBackupSnapshot(): Promise<BackupPayload> {
  const [
    users,
    guardians,
    children,
    childDocuments,
    childPhotos,
    surveys,
    donors,
    programs,
    donations,
    expenses,
    aidDistributions,
    bankAccounts,
    auditLogs,
    notifications,
    news,
    gallery,
    systemSettings
  ] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.guardian.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.child.findMany({ orderBy: { registeredAt: 'asc' } }),
    prisma.childDocument.findMany({ orderBy: { uploadedAt: 'asc' } }),
    prisma.childPhoto.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.survey.findMany({ orderBy: { surveyDate: 'asc' } }),
    prisma.donor.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.program.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.donation.findMany({ orderBy: { donatedAt: 'asc' } }),
    prisma.expense.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.aidDistribution.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.bankAccount.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.auditLog.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.notification.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.newsItem.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.galleryItem.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.systemSetting.findMany({ orderBy: { key: 'asc' } })
  ]);

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    snapshot: {
      users: users.map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar ?? undefined,
        passwordHash: user.passwordHash ?? undefined,
        status: user.status,
        createdAt: serializeDate(user.createdAt),
        updatedAt: serializeDate(user.updatedAt)
      })),
      guardians: guardians.map((guardian: any) => ({
        id: guardian.id,
        userId: guardian.userId ?? undefined,
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
        createdAt: serializeDate(guardian.createdAt),
        updatedAt: serializeDate(guardian.updatedAt)
      })),
      children: children.map((child: any) => ({
        id: child.id,
        registrationNumber: child.registrationNumber,
        guardianId: child.guardianId,
        guardianName: child.guardianName,
        guardianPhone: child.guardianPhone ?? undefined,
        fullName: child.fullName,
        nickname: child.nickname ?? undefined,
        birthPlace: child.birthPlace,
        birthDate: serializeDate(child.birthDate),
        gender: child.gender,
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
        latitude: serializeDecimal(child.latitude),
        longitude: serializeDecimal(child.longitude),
        schoolName: child.schoolName,
        educationLevel: child.educationLevel,
        schoolGrade: child.schoolGrade ?? undefined,
        studentNumber: child.studentNumber ?? undefined,
        healthCondition: child.healthCondition,
        specialNeeds: child.specialNeeds ?? undefined,
        familyMembers: child.familyMembers,
        homeOwnershipStatus: child.homeOwnershipStatus,
        status: child.status,
        verificationNotes: child.verificationNotes ?? undefined,
        registeredAt: serializeDate(child.registeredAt),
        verifiedAt: serializeDate(child.verifiedAt),
        verifiedById: child.verifiedById ?? undefined,
        photoUrl: child.photoUrl ?? undefined,
        homePhotoUrl: child.homePhotoUrl ?? undefined,
        totalAidReceived: serializeDecimal(child.totalAidReceived),
        createdAt: serializeDate(child.createdAt),
        updatedAt: serializeDate(child.updatedAt)
      })),
      childDocuments: childDocuments.map((document: any) => ({
        id: document.id,
        childId: document.childId,
        documentType: document.documentType,
        title: document.title,
        filePath: document.filePath,
        verificationStatus: document.verificationStatus,
        notes: document.notes ?? undefined,
        uploadedAt: serializeDate(document.uploadedAt),
        updatedAt: serializeDate(document.updatedAt)
      })),
      childPhotos: childPhotos.map((photo: any) => ({
        id: photo.id,
        childId: photo.childId,
        photoType: photo.photoType,
        filePath: photo.filePath,
        caption: photo.caption ?? undefined,
        isPublic: photo.isPublic,
        createdAt: serializeDate(photo.createdAt),
        updatedAt: serializeDate(photo.updatedAt)
      })),
      surveys: surveys.map((survey: any) => ({
        id: survey.id,
        childId: survey.childId,
        childName: survey.childName,
        officerId: survey.officerId,
        officerName: survey.officerName,
        surveyDate: serializeDate(survey.surveyDate),
        economicCondition: survey.economicCondition,
        homeCondition: survey.homeCondition,
        educationCondition: survey.educationCondition,
        healthCondition: survey.healthCondition,
        documentMatch: survey.documentMatch,
        latitude: serializeDecimal(survey.latitude),
        longitude: serializeDecimal(survey.longitude),
        recommendation: survey.recommendation,
        notes: survey.notes,
        photos: survey.photos ?? undefined,
        createdAt: serializeDate(survey.createdAt),
        updatedAt: serializeDate(survey.updatedAt)
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
        totalDonation: serializeDecimal(donor.totalDonation),
        transactionCount: donor.transactionCount,
        lastDonationAt: serializeDate(donor.lastDonationAt),
        avatarUrl: donor.avatarUrl ?? undefined,
        createdAt: serializeDate(donor.createdAt),
        updatedAt: serializeDate(donor.updatedAt)
      })),
      programs: programs.map((program: any) => ({
        id: program.id,
        programCode: program.programCode,
        title: program.title,
        slug: program.slug,
        category: program.category,
        description: program.description,
        targetAmount: serializeDecimal(program.targetAmount),
        collectedAmount: serializeDecimal(program.collectedAmount),
        distributedAmount: serializeDecimal(program.distributedAmount),
        startDate: serializeDate(program.startDate),
        endDate: serializeDate(program.endDate),
        thumbnail: program.thumbnail,
        status: program.status,
        isFeatured: program.isFeatured,
        donorCount: program.donorCount,
        createdAt: serializeDate(program.createdAt),
        updatedAt: serializeDate(program.updatedAt)
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
        amount: serializeDecimal(donation.amount),
        paymentMethod: donation.paymentMethod,
        destinationAccount: donation.destinationAccount,
        paymentReference: donation.paymentReference ?? undefined,
        paymentProofUrl: donation.paymentProofUrl ?? undefined,
        paymentStatus: donation.paymentStatus,
        isAnonymous: donation.isAnonymous,
        donorMessage: donation.donorMessage ?? undefined,
        donatedAt: serializeDate(donation.donatedAt),
        verifiedById: donation.verifiedById ?? undefined,
        verifiedAt: serializeDate(donation.verifiedAt),
        createdAt: serializeDate(donation.createdAt),
        updatedAt: serializeDate(donation.updatedAt)
      })),
      expenses: expenses.map((expense: any) => ({
        id: expense.id,
        expenseNumber: expense.expenseNumber,
        programId: expense.programId ?? undefined,
        programTitle: expense.programTitle ?? undefined,
        category: expense.category,
        transactionDate: serializeDate(expense.transactionDate),
        recipientName: expense.recipientName,
        amount: serializeDecimal(expense.amount),
        purpose: expense.purpose,
        description: expense.description,
        paymentMethod: expense.paymentMethod,
        receiptFileUrl: expense.receiptFileUrl ?? undefined,
        status: expense.status,
        submittedById: expense.submittedById,
        approvedById: expense.approvedById ?? undefined,
        approvedAt: serializeDate(expense.approvedAt),
        createdAt: serializeDate(expense.createdAt),
        updatedAt: serializeDate(expense.updatedAt)
      })),
      aidDistributions: aidDistributions.map((aid: any) => ({
        id: aid.id,
        distributionNumber: aid.distributionNumber,
        childId: aid.childId,
        childName: aid.childName,
        guardianName: aid.guardianName,
        programId: aid.programId ?? undefined,
        programTitle: aid.programTitle ?? undefined,
        aidType: aid.aidType,
        distributionDate: serializeDate(aid.distributionDate),
        amount: serializeDecimal(aid.amount),
        itemDescription: aid.itemDescription,
        sourceOfFunds: aid.sourceOfFunds,
        officerId: aid.officerId,
        officerName: aid.officerName,
        location: aid.location,
        receiptSignatureUrl: aid.receiptSignatureUrl ?? undefined,
        photoUrl: aid.photoUrl ?? undefined,
        status: aid.status,
        notes: aid.notes ?? undefined,
        createdAt: serializeDate(aid.createdAt),
        updatedAt: serializeDate(aid.updatedAt)
      })),
      bankAccounts: bankAccounts.map((bankAccount: any) => ({
        id: bankAccount.id,
        bankName: bankAccount.bankName,
        accountNumber: bankAccount.accountNumber,
        accountHolder: bankAccount.accountHolder,
        accountType: bankAccount.accountType,
        isActive: bankAccount.isActive,
        createdAt: serializeDate(bankAccount.createdAt),
        updatedAt: serializeDate(bankAccount.updatedAt)
      })),
      auditLogs: auditLogs.map((log: any) => ({
        id: log.id,
        actorUserId: log.actorUserId ?? undefined,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId ?? undefined,
        description: log.description,
        metadata: log.metadata ?? undefined,
        ipAddress: log.ipAddress ?? undefined,
        userAgent: log.userAgent ?? undefined,
        createdAt: serializeDate(log.createdAt)
      })),
      notifications: notifications.map((notification: any) => ({
        id: notification.id,
        userId: notification.userId ?? undefined,
        title: notification.title,
        message: notification.message,
        channel: notification.channel,
        isRead: notification.isRead,
        readAt: serializeDate(notification.readAt),
        createdAt: serializeDate(notification.createdAt),
        updatedAt: serializeDate(notification.updatedAt)
      })),
      news: news.map((item: any) => ({
        id: item.id,
        title: item.title,
        slug: item.slug,
        summary: item.summary,
        content: item.content,
        coverImage: item.coverImage ?? undefined,
        publishedAt: serializeDate(item.publishedAt),
        isPublished: item.isPublished,
        createdById: item.createdById ?? undefined,
        createdAt: serializeDate(item.createdAt),
        updatedAt: serializeDate(item.updatedAt)
      })),
      gallery: gallery.map((item: any) => ({
        id: item.id,
        title: item.title,
        imageUrl: item.imageUrl,
        caption: item.caption ?? undefined,
        category: item.category,
        isPublic: item.isPublic,
        createdAt: serializeDate(item.createdAt),
        updatedAt: serializeDate(item.updatedAt)
      })),
      systemSettings: systemSettings.map((setting: any) => ({
        key: setting.key,
        value: setting.value,
        description: setting.description ?? undefined,
        updatedAt: serializeDate(setting.updatedAt)
      }))
    }
  };
}

async function restoreSnapshot(snapshot: BackupSnapshot) {
  await prisma.$transaction(async (tx: any) => {
    const transactional = tx as typeof prisma;

    await clearDatabase(transactional);

    if (snapshot.users?.length) {
      await transactional.user.createMany({
        data: snapshot.users.map((user) => ({
          id: String(user.id),
          name: String(user.name),
          email: String(user.email),
          phone: String(user.phone),
          role: user.role as any,
          avatar: typeof user.avatar === 'string' ? user.avatar : undefined,
          passwordHash: typeof user.passwordHash === 'string' ? user.passwordHash : undefined,
          status: user.status as any,
          createdAt: restoreDate(user.createdAt) ?? new Date(),
          updatedAt: restoreDate(user.updatedAt) ?? new Date()
        }))
      });
    }

    if (snapshot.guardians?.length) {
      await transactional.guardian.createMany({
        data: snapshot.guardians.map((guardian) => ({
          id: String(guardian.id),
          userId: typeof guardian.userId === 'string' ? guardian.userId : undefined,
          fullName: String(guardian.fullName),
          nik: String(guardian.nik),
          relationship: String(guardian.relationship),
          occupation: String(guardian.occupation),
          monthlyIncome: Number(guardian.monthlyIncome ?? 0),
          phone: String(guardian.phone),
          email: String(guardian.email),
          address: String(guardian.address),
          province: String(guardian.province),
          city: String(guardian.city),
          district: String(guardian.district),
          village: String(guardian.village),
          postalCode: String(guardian.postalCode),
          createdAt: restoreDate(guardian.createdAt) ?? new Date(),
          updatedAt: restoreDate(guardian.updatedAt) ?? new Date()
        }))
      });
    }

    if (snapshot.donors?.length) {
      await transactional.donor.createMany({
        data: snapshot.donors.map((donor) => ({
          id: String(donor.id),
          userId: typeof donor.userId === 'string' ? donor.userId : undefined,
          donorNumber: String(donor.donorNumber),
          fullName: String(donor.fullName),
          donorType: donor.donorType as any,
          institutionName: typeof donor.institutionName === 'string' ? donor.institutionName : undefined,
          email: String(donor.email),
          phone: String(donor.phone),
          address: typeof donor.address === 'string' ? donor.address : undefined,
          isAnonymousDefault: Boolean(donor.isAnonymousDefault),
          isRecurringDonor: Boolean(donor.isRecurringDonor),
          verificationStatus: donor.verificationStatus as any,
          totalDonation: restoreDecimal(donor.totalDonation) ?? new Prisma.Decimal(0),
          transactionCount: Number(donor.transactionCount ?? 0),
          lastDonationAt: restoreDate(donor.lastDonationAt),
          avatarUrl: typeof donor.avatarUrl === 'string' ? donor.avatarUrl : undefined,
          createdAt: restoreDate(donor.createdAt) ?? new Date(),
          updatedAt: restoreDate(donor.updatedAt) ?? new Date()
        }))
      });
    }

    if (snapshot.programs?.length) {
      await transactional.program.createMany({
        data: snapshot.programs.map((program) => ({
          id: String(program.id),
          programCode: String(program.programCode),
          title: String(program.title),
          slug: String(program.slug),
          category: program.category as any,
          description: String(program.description),
          targetAmount: restoreDecimal(program.targetAmount) ?? new Prisma.Decimal(0),
          collectedAmount: restoreDecimal(program.collectedAmount) ?? new Prisma.Decimal(0),
          distributedAmount: restoreDecimal(program.distributedAmount) ?? new Prisma.Decimal(0),
          startDate: restoreDate(program.startDate) ?? new Date(),
          endDate: restoreDate(program.endDate) ?? new Date(),
          thumbnail: String(program.thumbnail),
          status: program.status as any,
          isFeatured: Boolean(program.isFeatured),
          donorCount: Number(program.donorCount ?? 0),
          createdAt: restoreDate(program.createdAt) ?? new Date(),
          updatedAt: restoreDate(program.updatedAt) ?? new Date()
        }))
      });
    }

    if (snapshot.bankAccounts?.length) {
      await transactional.bankAccount.createMany({
        data: snapshot.bankAccounts.map((bankAccount) => ({
          id: String(bankAccount.id),
          bankName: String(bankAccount.bankName),
          accountNumber: String(bankAccount.accountNumber),
          accountHolder: String(bankAccount.accountHolder),
          accountType: String(bankAccount.accountType),
          isActive: Boolean(bankAccount.isActive),
          createdAt: restoreDate(bankAccount.createdAt) ?? new Date(),
          updatedAt: restoreDate(bankAccount.updatedAt) ?? new Date()
        }))
      });
    }

    if (snapshot.children?.length) {
      await transactional.child.createMany({
        data: snapshot.children.map((child) => ({
          id: String(child.id),
          registrationNumber: String(child.registrationNumber),
          guardianId: String(child.guardianId),
          guardianName: String(child.guardianName),
          guardianPhone: typeof child.guardianPhone === 'string' ? child.guardianPhone : undefined,
          fullName: String(child.fullName),
          nickname: typeof child.nickname === 'string' ? child.nickname : undefined,
          birthPlace: String(child.birthPlace),
          birthDate: restoreDate(child.birthDate) ?? new Date(),
          gender: String(child.gender),
          orphanCategory: child.orphanCategory as any,
          nik: String(child.nik),
          familyCardNumber: String(child.familyCardNumber),
          birthCertificateNumber: typeof child.birthCertificateNumber === 'string' ? child.birthCertificateNumber : undefined,
          address: String(child.address),
          rt: String(child.rt),
          rw: String(child.rw),
          province: String(child.province),
          city: String(child.city),
          district: String(child.district),
          village: String(child.village),
          postalCode: String(child.postalCode),
          latitude: restoreDecimal(child.latitude) ?? new Prisma.Decimal(0),
          longitude: restoreDecimal(child.longitude) ?? new Prisma.Decimal(0),
          schoolName: String(child.schoolName),
          educationLevel: String(child.educationLevel),
          schoolGrade: typeof child.schoolGrade === 'string' ? child.schoolGrade : undefined,
          studentNumber: typeof child.studentNumber === 'string' ? child.studentNumber : undefined,
          healthCondition: String(child.healthCondition),
          specialNeeds: typeof child.specialNeeds === 'string' ? child.specialNeeds : undefined,
          familyMembers: Number(child.familyMembers ?? 0),
          homeOwnershipStatus: String(child.homeOwnershipStatus),
          status: child.status as any,
          verificationNotes: typeof child.verificationNotes === 'string' ? child.verificationNotes : undefined,
          registeredAt: restoreDate(child.registeredAt) ?? new Date(),
          verifiedAt: restoreDate(child.verifiedAt),
          verifiedById: typeof child.verifiedById === 'string' ? child.verifiedById : undefined,
          photoUrl: typeof child.photoUrl === 'string' ? child.photoUrl : undefined,
          homePhotoUrl: typeof child.homePhotoUrl === 'string' ? child.homePhotoUrl : undefined,
          totalAidReceived: restoreDecimal(child.totalAidReceived) ?? new Prisma.Decimal(0),
          createdAt: restoreDate(child.createdAt) ?? new Date(),
          updatedAt: restoreDate(child.updatedAt) ?? new Date()
        }))
      });
    }

    if (snapshot.childDocuments?.length) {
      await transactional.childDocument.createMany({
        data: snapshot.childDocuments.map((document) => ({
          id: String(document.id),
          childId: String(document.childId),
          documentType: document.documentType as any,
          title: String(document.title),
          filePath: String(document.filePath),
          verificationStatus: document.verificationStatus as any,
          notes: typeof document.notes === 'string' ? document.notes : undefined,
          uploadedAt: restoreDate(document.uploadedAt) ?? new Date(),
          updatedAt: restoreDate(document.updatedAt) ?? new Date()
        }))
      });
    }

    if (snapshot.childPhotos?.length) {
      await transactional.childPhoto.createMany({
        data: snapshot.childPhotos.map((photo) => ({
          id: String(photo.id),
          childId: String(photo.childId),
          photoType: photo.photoType as any,
          filePath: String(photo.filePath),
          caption: typeof photo.caption === 'string' ? photo.caption : undefined,
          isPublic: Boolean(photo.isPublic),
          createdAt: restoreDate(photo.createdAt) ?? new Date(),
          updatedAt: restoreDate(photo.updatedAt) ?? new Date()
        }))
      });
    }

    if (snapshot.surveys?.length) {
      await transactional.survey.createMany({
        data: snapshot.surveys.map((survey) => ({
          id: String(survey.id),
          childId: String(survey.childId),
          childName: String(survey.childName),
          officerId: String(survey.officerId),
          officerName: String(survey.officerName),
          surveyDate: restoreDate(survey.surveyDate) ?? new Date(),
          economicCondition: String(survey.economicCondition),
          homeCondition: String(survey.homeCondition),
          educationCondition: String(survey.educationCondition),
          healthCondition: String(survey.healthCondition),
          documentMatch: Boolean(survey.documentMatch),
          latitude: restoreDecimal(survey.latitude) ?? new Prisma.Decimal(0),
          longitude: restoreDecimal(survey.longitude) ?? new Prisma.Decimal(0),
          recommendation: survey.recommendation as any,
          notes: String(survey.notes ?? ''),
          photos: survey.photos ?? undefined,
          createdAt: restoreDate(survey.createdAt) ?? new Date(),
          updatedAt: restoreDate(survey.updatedAt) ?? new Date()
        }))
      });
    }

    if (snapshot.donations?.length) {
      await transactional.donation.createMany({
        data: snapshot.donations.map((donation) => ({
          id: String(donation.id),
          transactionNumber: String(donation.transactionNumber),
          donorId: typeof donation.donorId === 'string' ? donation.donorId : undefined,
          donorName: String(donation.donorName),
          donorEmail: String(donation.donorEmail),
          donorPhone: String(donation.donorPhone),
          programId: String(donation.programId),
          programTitle: String(donation.programTitle),
          donationType: donation.donationType as any,
          amount: restoreDecimal(donation.amount) ?? new Prisma.Decimal(0),
          paymentMethod: donation.paymentMethod as any,
          destinationAccount: String(donation.destinationAccount),
          paymentReference: typeof donation.paymentReference === 'string' ? donation.paymentReference : undefined,
          paymentProofUrl: typeof donation.paymentProofUrl === 'string' ? donation.paymentProofUrl : undefined,
          paymentStatus: donation.paymentStatus as any,
          isAnonymous: Boolean(donation.isAnonymous),
          donorMessage: typeof donation.donorMessage === 'string' ? donation.donorMessage : undefined,
          donatedAt: restoreDate(donation.donatedAt) ?? new Date(),
          verifiedById: typeof donation.verifiedById === 'string' ? donation.verifiedById : undefined,
          verifiedAt: restoreDate(donation.verifiedAt),
          createdAt: restoreDate(donation.createdAt) ?? new Date(),
          updatedAt: restoreDate(donation.updatedAt) ?? new Date()
        }))
      });
    }

    if (snapshot.expenses?.length) {
      await transactional.expense.createMany({
        data: snapshot.expenses.map((expense) => ({
          id: String(expense.id),
          expenseNumber: String(expense.expenseNumber),
          programId: typeof expense.programId === 'string' ? expense.programId : undefined,
          programTitle: typeof expense.programTitle === 'string' ? expense.programTitle : undefined,
          category: expense.category as any,
          transactionDate: restoreDate(expense.transactionDate) ?? new Date(),
          recipientName: String(expense.recipientName),
          amount: restoreDecimal(expense.amount) ?? new Prisma.Decimal(0),
          purpose: String(expense.purpose),
          description: String(expense.description),
          paymentMethod: expense.paymentMethod as any,
          receiptFileUrl: typeof expense.receiptFileUrl === 'string' ? expense.receiptFileUrl : undefined,
          status: expense.status as any,
          submittedById: String(expense.submittedById),
          approvedById: typeof expense.approvedById === 'string' ? expense.approvedById : undefined,
          approvedAt: restoreDate(expense.approvedAt),
          createdAt: restoreDate(expense.createdAt) ?? new Date(),
          updatedAt: restoreDate(expense.updatedAt) ?? new Date()
        }))
      });
    }

    if (snapshot.aidDistributions?.length) {
      await transactional.aidDistribution.createMany({
        data: snapshot.aidDistributions.map((aid) => ({
          id: String(aid.id),
          distributionNumber: String(aid.distributionNumber),
          childId: String(aid.childId),
          childName: String(aid.childName),
          guardianName: String(aid.guardianName),
          programId: typeof aid.programId === 'string' ? aid.programId : undefined,
          programTitle: typeof aid.programTitle === 'string' ? aid.programTitle : undefined,
          aidType: String(aid.aidType),
          distributionDate: restoreDate(aid.distributionDate) ?? new Date(),
          amount: restoreDecimal(aid.amount) ?? new Prisma.Decimal(0),
          itemDescription: String(aid.itemDescription),
          sourceOfFunds: String(aid.sourceOfFunds),
          officerId: String(aid.officerId),
          officerName: String(aid.officerName),
          location: String(aid.location),
          receiptSignatureUrl: typeof aid.receiptSignatureUrl === 'string' ? aid.receiptSignatureUrl : undefined,
          photoUrl: typeof aid.photoUrl === 'string' ? aid.photoUrl : undefined,
          status: aid.status as any,
          notes: typeof aid.notes === 'string' ? aid.notes : undefined,
          createdAt: restoreDate(aid.createdAt) ?? new Date(),
          updatedAt: restoreDate(aid.updatedAt) ?? new Date()
        }))
      });
    }

    if (snapshot.notifications?.length) {
      await transactional.notification.createMany({
        data: snapshot.notifications.map((notification) => ({
          id: String(notification.id),
          userId: typeof notification.userId === 'string' ? notification.userId : undefined,
          title: String(notification.title),
          message: String(notification.message),
          channel: notification.channel as any,
          isRead: Boolean(notification.isRead),
          readAt: restoreDate(notification.readAt),
          createdAt: restoreDate(notification.createdAt) ?? new Date(),
          updatedAt: restoreDate(notification.updatedAt) ?? new Date()
        }))
      });
    }

    if (snapshot.news?.length) {
      await transactional.newsItem.createMany({
        data: snapshot.news.map((item) => ({
          id: String(item.id),
          title: String(item.title),
          slug: String(item.slug),
          summary: String(item.summary),
          content: String(item.content),
          coverImage: typeof item.coverImage === 'string' ? item.coverImage : undefined,
          publishedAt: restoreDate(item.publishedAt),
          isPublished: Boolean(item.isPublished),
          createdById: typeof item.createdById === 'string' ? item.createdById : undefined,
          createdAt: restoreDate(item.createdAt) ?? new Date(),
          updatedAt: restoreDate(item.updatedAt) ?? new Date()
        }))
      });
    }

    if (snapshot.gallery?.length) {
      await transactional.galleryItem.createMany({
        data: snapshot.gallery.map((item) => ({
          id: String(item.id),
          title: String(item.title),
          imageUrl: String(item.imageUrl),
          caption: typeof item.caption === 'string' ? item.caption : undefined,
          category: String(item.category),
          isPublic: Boolean(item.isPublic),
          createdAt: restoreDate(item.createdAt) ?? new Date(),
          updatedAt: restoreDate(item.updatedAt) ?? new Date()
        }))
      });
    }

    if (snapshot.auditLogs?.length) {
      await transactional.auditLog.createMany({
        data: snapshot.auditLogs.map((log) => ({
          id: String(log.id),
          actorUserId: typeof log.actorUserId === 'string' ? log.actorUserId : undefined,
          action: String(log.action),
          entityType: String(log.entityType),
          entityId: typeof log.entityId === 'string' ? log.entityId : undefined,
          description: String(log.description),
          metadata: log.metadata ?? undefined,
          ipAddress: typeof log.ipAddress === 'string' ? log.ipAddress : undefined,
          userAgent: typeof log.userAgent === 'string' ? log.userAgent : undefined,
          createdAt: restoreDate(log.createdAt) ?? new Date()
        }))
      });
    }

    if (snapshot.systemSettings?.length) {
      await transactional.systemSetting.createMany({
        data: snapshot.systemSettings.map((setting) => ({
          key: String(setting.key),
          value: setting.value as Prisma.InputJsonValue,
          description: typeof setting.description === 'string' ? setting.description : undefined,
          updatedAt: restoreDate(setting.updatedAt) ?? new Date()
        }))
      });
    }
  });
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const currentUser = await requireCurrentUserRole(req, res, ['super_admin', 'admin']);
    if (!currentUser) {
      return;
    }

    const backup = await buildBackupSnapshot();

    await prisma.auditLog.create({
      data: {
        actorUserId: currentUser.id,
        action: 'BACKUP_DATABASE',
        entityType: 'System',
        description: 'Membuat backup database aplikasi.',
        metadata: {
          version: backup.version,
          exportedAt: backup.exportedAt
        },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] ?? undefined
      }
    });

    res.json({ data: mapBackupPayload(backup) });
  })
);

router.post(
  '/restore',
  asyncHandler(async (req, res) => {
    const currentUser = await requireCurrentUserRole(req, res, ['super_admin', 'admin']);
    if (!currentUser) {
      return;
    }

    const body = req.body as { snapshot?: BackupSnapshot; data?: BackupSnapshot; version?: number } | undefined;
    const snapshot = body?.snapshot ?? body?.data ?? body;

    if (!snapshot || typeof snapshot !== 'object') {
      throw new ApiError(400, 'Format backup tidak valid.');
    }

    await restoreSnapshot(snapshot as BackupSnapshot);

    const restoredCurrentUser = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { id: true }
    });

    await prisma.auditLog.create({
      data: {
        actorUserId: restoredCurrentUser?.id,
        action: 'RESTORE_DATABASE',
        entityType: 'System',
        description: 'Memulihkan database dari file backup.',
        metadata: {
          restoredAt: new Date().toISOString()
        },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] ?? undefined
      }
    });

    res.json({
      data: {
        restoredAt: new Date().toISOString(),
        restoredBy: currentUser.name
      }
    });
  })
);

export default router;
