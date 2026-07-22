export type UserRole = 'super_admin' | 'admin' | 'bendahara' | 'petugas' | 'donatur' | 'wali' | 'public';

export type OrphanCategory = 'yatim' | 'piatu' | 'yatim_piatu';

export type VerificationStatus = 'draft' | 'diajukan' | 'menunggu_verifikasi' | 'perlu_perbaikan' | 'terverifikasi' | 'ditolak' | 'aktif' | 'tidak_aktif' | 'lulus';

export type DonorType = 'individu' | 'perusahaan' | 'organisasi' | 'komunitas' | 'anonim';

export type PaymentMethod = 'transfer_bank' | 'qris' | 'e_wallet' | 'tunai';

export type DonationStatus = 'menunggu_pembayaran' | 'menunggu_verifikasi' | 'berhasil' | 'ditolak' | 'dibatalkan';

export type ExpenseStatus = 'diajukan' | 'disetujui' | 'ditolak' | 'dibayarkan';

export type AidStatus = 'dijadwalkan' | 'terproses' | 'selesai' | 'dibatalkan';

export type SurveyEligibility = 'layak' | 'layak_catatan' | 'perlu_survei_ulang' | 'tidak_layak';

export type ProgramCategory = 'pendidikan' | 'kesehatan' | 'santunan' | 'sembako' | 'pembangunan' | 'darurat';

export type ProgramStatus = 'aktif' | 'selesai' | 'draft' | 'dihentikan';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  status: 'active' | 'suspended';
  createdAt: string;
}

export interface Guardian {
  id: string;
  userId: string;
  fullName: string;
  nik: string;
  relationship: string; // Ayah, Ibu, Paman, Bibi, Nenek, Kakek, Pengurus
  occupation: string;
  monthlyIncome: number;
  phone: string;
  email: string;
  address: string;
  province: string;
  city: string;
  district: string;
  village: string;
  postalCode: string;
  createdAt: string;
}

export interface ChildDocument {
  id: string;
  childId: string;
  documentType: 'kk' | 'ktp_wali' | 'akta_lahir' | 'surat_kematian_ayah' | 'surat_kematian_ibu' | 'sktm' | 'surat_sekolah';
  title: string;
  filePath: string;
  verificationStatus: 'menunggu' | 'terverifikasi' | 'ditolak';
  notes?: string;
  uploadedAt: string;
}

export interface ChildPhoto {
  id: string;
  childId: string;
  photoType: 'anak' | 'rumah' | 'kegiatan';
  filePath: string;
  caption?: string;
  isPublic: boolean;
}

export interface Child {
  id: string;
  registrationNumber: string;
  guardianId: string;
  guardianName: string;
  guardianPhone: string;
  fullName: string;
  nickname: string;
  birthPlace: string;
  birthDate: string;
  gender: 'L' | 'P';
  orphanCategory: OrphanCategory;
  nik: string;
  familyCardNumber: string;
  birthCertificateNumber?: string;
  address: string;
  rt: string;
  rw: string;
  province: string;
  city: string;
  district: string;
  village: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  schoolName: string;
  educationLevel: 'TK' | 'SD' | 'SMP' | 'SMA/K' | 'Perguruan Tinggi' | 'Belum Sekolah';
  schoolGrade: string;
  studentNumber?: string;
  healthCondition: string;
  specialNeeds?: string;
  familyMembers: number;
  homeOwnershipStatus: 'Milik Sendiri' | 'Sewa' | 'Menumpang' | 'Lainnya';
  status: VerificationStatus;
  verificationNotes?: string;
  registeredAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  photoUrl: string;
  homePhotoUrl?: string;
  documents: ChildDocument[];
  totalAidReceived: number;
}

export interface Survey {
  id: string;
  childId: string;
  childName: string;
  officerId: string;
  officerName: string;
  surveyDate: string;
  economicCondition: string;
  homeCondition: string;
  educationCondition: string;
  healthCondition: string;
  documentMatch: boolean;
  latitude: number;
  longitude: number;
  recommendation: SurveyEligibility;
  notes: string;
  photos: string[];
}

export interface Donor {
  id: string;
  userId?: string;
  donorNumber: string;
  fullName: string;
  donorType: DonorType;
  institutionName?: string;
  email: string;
  phone: string;
  address?: string;
  isAnonymousDefault: boolean;
  isRecurringDonor: boolean;
  verificationStatus: 'verified' | 'unverified';
  totalDonation: number;
  transactionCount: number;
  lastDonationAt?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Program {
  id: string;
  programCode: string;
  title: string;
  slug: string;
  category: ProgramCategory;
  description: string;
  targetAmount: number;
  collectedAmount: number;
  distributedAmount: number;
  startDate: string;
  endDate: string;
  thumbnail: string;
  status: ProgramStatus;
  isFeatured: boolean;
  donorCount: number;
  createdAt: string;
}

export interface Donation {
  id: string;
  transactionNumber: string;
  donorId?: string;
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  programId: string;
  programTitle: string;
  donationType: 'umum' | 'pendidikan' | 'santunan' | 'zakat' | 'infak' | 'sedekah' | 'program_khusus';
  amount: number;
  paymentMethod: PaymentMethod;
  destinationAccount: string;
  paymentReference?: string;
  paymentProofUrl?: string;
  paymentStatus: DonationStatus;
  isAnonymous: boolean;
  donorMessage?: string;
  donatedAt: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface Expense {
  id: string;
  expenseNumber: string;
  programId?: string;
  programTitle?: string;
  category: 'Bantuan Pendidikan' | 'Santunan Bulanan' | 'Sembako & Makanan' | 'Kesehatan' | 'Perbaikan Rumah' | 'Operasional Yayasan' | 'Administrasi & Transport';
  transactionDate: string;
  recipientName: string;
  amount: number;
  purpose: string;
  description: string;
  paymentMethod: PaymentMethod;
  receiptFileUrl?: string;
  status: ExpenseStatus;
  submittedBy: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
}

export interface AidDistribution {
  id: string;
  distributionNumber: string;
  childId: string;
  childName: string;
  guardianName: string;
  programId?: string;
  programTitle?: string;
  aidType: 'Uang Tunai' | 'Sembako' | 'Perlengkapan Sekolah' | 'Biaya Kesehatan' | 'Beasiswa';
  distributionDate: string;
  amount: number;
  itemDescription: string;
  sourceOfFunds: string;
  officerId: string;
  officerName: string;
  location: string;
  receiptSignatureUrl?: string;
  photoUrl?: string;
  status: AidStatus;
  notes?: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  branch?: string;
  isActive: boolean;
  isPublic: boolean;
  logoUrl?: string;
}

export interface FinancialSummary {
  totalDonationReceived: number;
  totalExpenseApproved: number;
  currentBalance: number;
  totalActiveChildren: number;
  totalOrphanYatim: number;
  totalOrphanPiatu: number;
  totalOrphanYatimPiatu: number;
  totalActiveDonors: number;
  totalDistributedAid: number;
  pendingVerificationsCount: number;
}

export interface SystemSetting {
  key: string;
  value: string | number | boolean | null | Record<string, unknown> | Array<unknown>;
  description?: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  module: string;
  recordId?: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export interface NewsItem {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  thumbnail: string;
  category: 'Kegiatan' | 'Berita' | 'Penyaluran';
  publishedAt: string;
  author: string;
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  mediaUrl: string;
  category: 'Dokumentasi Penyaluran' | 'Survei Lapangan' | 'Kegiatan Yayasan';
  date: string;
}
