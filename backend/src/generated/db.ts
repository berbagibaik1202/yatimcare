export class Decimal {
  private readonly raw: string;

  constructor(value: number | string | bigint | Decimal) {
    this.raw = value instanceof Decimal ? value.raw : String(value);
  }

  toString() {
    return this.raw;
  }

  valueOf() {
    return Number(this.raw);
  }

  toJSON() {
    return this.raw;
  }
}

type DecimalInstance = Decimal;

export class Prisma {
  static Decimal = Decimal;
}

export namespace Prisma {
  export type Decimal = DecimalInstance;
  export type JsonValue = unknown;
  export type InputJsonValue = JsonValue;
}

export const AccountStatus = {
  active: 'active',
  suspended: 'suspended'
} as const;

export const OrphanCategory = {
  yatim: 'yatim',
  piatu: 'piatu',
  yatim_piatu: 'yatim_piatu'
} as const;

export const VerificationStatus = {
  draft: 'draft',
  diajukan: 'diajukan',
  menunggu_verifikasi: 'menunggu_verifikasi',
  perlu_perbaikan: 'perlu_perbaikan',
  terverifikasi: 'terverifikasi',
  ditolak: 'ditolak',
  aktif: 'aktif',
  tidak_aktif: 'tidak_aktif',
  lulus: 'lulus'
} as const;

export type VerificationStatus = (typeof VerificationStatus)[keyof typeof VerificationStatus];

export const DonorType = {
  individu: 'individu',
  perusahaan: 'perusahaan',
  organisasi: 'organisasi',
  komunitas: 'komunitas',
  anonim: 'anonim'
} as const;

export const DonorVerificationStatus = {
  verified: 'verified',
  unverified: 'unverified'
} as const;

export const PaymentMethod = {
  transfer_bank: 'transfer_bank',
  qris: 'qris',
  e_wallet: 'e_wallet',
  tunai: 'tunai'
} as const;

export const DonationStatus = {
  menunggu_pembayaran: 'menunggu_pembayaran',
  menunggu_verifikasi: 'menunggu_verifikasi',
  berhasil: 'berhasil',
  ditolak: 'ditolak',
  dibatalkan: 'dibatalkan'
} as const;

export const ExpenseStatus = {
  diajukan: 'diajukan',
  disetujui: 'disetujui',
  ditolak: 'ditolak',
  dibayarkan: 'dibayarkan'
} as const;

export const AidStatus = {
  dijadwalkan: 'dijadwalkan',
  terproses: 'terproses',
  selesai: 'selesai',
  dibatalkan: 'dibatalkan'
} as const;

export const SurveyEligibility = {
  layak: 'layak',
  layak_catatan: 'layak_catatan',
  perlu_survei_ulang: 'perlu_survei_ulang',
  tidak_layak: 'tidak_layak'
} as const;

export const ChildDocumentType = {
  kk: 'kk',
  ktp_wali: 'ktp_wali',
  akta_lahir: 'akta_lahir',
  surat_kematian_ayah: 'surat_kematian_ayah',
  surat_kematian_ibu: 'surat_kematian_ibu',
  sktm: 'sktm',
  surat_sekolah: 'surat_sekolah'
} as const;

export const PhotoType = {
  anak: 'anak',
  rumah: 'rumah',
  kegiatan: 'kegiatan'
} as const;

export const ProgramCategory = {
  pendidikan: 'pendidikan',
  kesehatan: 'kesehatan',
  santunan: 'santunan',
  sembako: 'sembako',
  pembangunan: 'pembangunan',
  darurat: 'darurat'
} as const;

export const ProgramStatus = {
  aktif: 'aktif',
  selesai: 'selesai',
  draft: 'draft',
  dihentikan: 'dihentikan'
} as const;

export const DonationType = {
  umum: 'umum',
  pendidikan: 'pendidikan',
  santunan: 'santunan',
  zakat: 'zakat',
  infak: 'infak',
  sedekah: 'sedekah',
  program_khusus: 'program_khusus'
} as const;

export const ExpenseCategory = {
  bantuan_pendidikan: 'bantuan_pendidikan',
  santunan_bulanan: 'santunan_bulanan',
  sembako_makanan: 'sembako_makanan',
  kesehatan: 'kesehatan',
  perbaikan_rumah: 'perbaikan_rumah',
  operasional_yayasan: 'operasional_yayasan',
  administrasi_transport: 'administrasi_transport'
} as const;

export const NotificationChannel = {
  in_app: 'in_app',
  email: 'email',
  whatsapp: 'whatsapp'
} as const;
