import 'dotenv/config';
import { PrismaClient, Prisma } from '../src/generated/prisma.js';
import { hashPassword } from '../src/lib/auth.js';

const prisma = new PrismaClient();

const d = (value: number) => new Prisma.Decimal(value);
const dt = (value: string) => new Date(value);
const demoPasswordHash = hashPassword('YatimCare123!');

async function clearDatabase() {
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.galleryItem.deleteMany();
  await prisma.newsItem.deleteMany();
  await prisma.childPhoto.deleteMany();
  await prisma.childDocument.deleteMany();
  await prisma.survey.deleteMany();
  await prisma.aidDistribution.deleteMany();
  await prisma.donation.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.bankAccount.deleteMany();
  await prisma.program.deleteMany();
  await prisma.child.deleteMany();
  await prisma.guardian.deleteMany();
  await prisma.donor.deleteMany();
  await prisma.user.deleteMany();
  await prisma.systemSetting.deleteMany();
}

async function main() {
  console.log('Seeding YatimCare database...');

  await clearDatabase();

  const seedUsers = [
      {
        id: 'usr-super-admin',
        name: 'Drs. H. Rahmat Hidayat, M.Ag.',
        email: 'admin@yayasan.org',
        phone: '081234567890',
        role: 'super_admin',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        status: 'active',
        createdAt: dt('2025-01-10T08:00:00Z')
      },
      {
        id: 'usr-admin-1',
        name: 'Hj. Siti Aminah, S.E.',
        email: 'admin2@yayasan.org',
        phone: '081398765432',
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
        status: 'active',
        createdAt: dt('2025-01-12T09:00:00Z')
      },
      {
        id: 'usr-bendahara',
        name: 'Siti Aminah, S.E. (Bendahara)',
        email: 'bendahara@yayasan.org',
        phone: '081399876543',
        role: 'bendahara',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
        status: 'active',
        createdAt: dt('2025-01-12T09:00:00Z')
      },
      {
        id: 'usr-petugas',
        name: 'Budi Santoso (Petugas Lapangan)',
        email: 'petugas@yayasan.org',
        phone: '081511223344',
        role: 'petugas',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
        status: 'active',
        createdAt: dt('2025-01-15T10:00:00Z')
      },
      {
        id: 'usr-donatur-1',
        name: 'Hj. Ratna Pertiwi',
        email: 'ratna.pertiwi@gmail.com',
        phone: '081288991122',
        role: 'donatur',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
        status: 'active',
        createdAt: dt('2025-01-20T11:00:00Z')
      },
      {
        id: 'usr-wali-1',
        name: 'Sri Mulyani (Wali Anak)',
        email: 'sri.mulyani.wali@gmail.com',
        phone: '085233445566',
        role: 'wali',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
        status: 'active',
        createdAt: dt('2025-02-01T14:00:00Z')
      },
      {
        id: 'usr-public',
        name: 'Publik',
        email: 'public@yatimcare.org',
        phone: '080000000000',
        role: 'public',
        status: 'active',
        createdAt: dt('2025-02-01T14:00:00Z')
      }
  ].map((user) => ({
      ...user,
      passwordHash: user.role === 'public' ? null : demoPasswordHash
    })) as unknown as Prisma.UserCreateManyInput[];

  await prisma.user.createMany({
    data: seedUsers
  });

  await prisma.guardian.createMany({
    data: [
      {
        id: 'gdn-1',
        userId: 'usr-wali-1',
        fullName: 'Sri Mulyani',
        nik: '3204125809750002',
        relationship: 'Ibu Kandung (Janda)',
        occupation: 'Buruh Cuci Harian',
        monthlyIncome: 900000,
        phone: '085233445566',
        email: 'sri.mulyani.wali@gmail.com',
        address: 'Jl. Pemuda No. 42, RT 03/RW 05, Desa Tanjungmedar',
        province: 'Jawa Barat',
        city: 'Sumedang',
        district: 'Tanjungmedar',
        village: 'Tanjungmedar',
        postalCode: '45354',
        createdAt: dt('2025-02-01T14:00:00Z')
      },
      {
        id: 'gdn-2',
        fullName: 'Mang Ujang Suherman',
        nik: '3204121203680001',
        relationship: 'Paman',
        occupation: 'Petani Penggarap',
        monthlyIncome: 1200000,
        phone: '081322114455',
        email: 'ujang.suherman@gmail.com',
        address: 'Dusun Cikembang RT 02/RW 01, Kelurahan Pasirangin',
        province: 'Jawa Barat',
        city: 'Sumedang',
        district: 'Cimalaka',
        village: 'Pasirangin',
        postalCode: '45353',
        createdAt: dt('2025-02-10T10:00:00Z')
      },
      {
        id: 'gdn-3',
        fullName: 'Nenek Aminah',
        nik: '3204120405600003',
        relationship: 'Nenek',
        occupation: 'Pedagang Kecil',
        monthlyIncome: 850000,
        phone: '082199887766',
        email: 'nenek.aminah@gmail.com',
        address: 'Dusun Sukamaju RT 04/RW 03',
        province: 'Jawa Barat',
        city: 'Sumedang',
        district: 'Conggeang',
        village: 'Sukamaju',
        postalCode: '45391',
        createdAt: dt('2025-02-22T08:30:00Z')
      }
    ]
  });

  await prisma.child.createMany({
    data: [
      {
        id: 'chd-1',
        registrationNumber: 'YCM-2025-001',
        guardianId: 'gdn-1',
        guardianName: 'Sri Mulyani',
        guardianPhone: '085233445566',
        fullName: 'Ahmad Rizky Pratama',
        nickname: 'Ahmad',
        birthPlace: 'Sumedang',
        birthDate: dt('2014-05-12T00:00:00Z'),
        gender: 'L',
        orphanCategory: 'yatim',
        nik: '3204121205140003',
        familyCardNumber: '3204122008120006',
        birthCertificateNumber: '474.1/102/2014',
        address: 'Jl. Pemuda No. 42, RT 03/RW 05',
        rt: '03',
        rw: '05',
        province: 'Jawa Barat',
        city: 'Sumedang',
        district: 'Tanjungmedar',
        village: 'Tanjungmedar',
        postalCode: '45354',
        latitude: d(-6.8273),
        longitude: d(107.9254),
        schoolName: 'SDN Tanjungmedar 1',
        educationLevel: 'SD',
        schoolGrade: 'Kelas 5',
        studentNumber: '1415102',
        healthCondition: 'Sehat, butuh kacamata minus',
        specialNeeds: 'Tidak Ada',
        familyMembers: 3,
        homeOwnershipStatus: 'Menumpang',
        status: 'aktif',
        verificationNotes: 'Dokumen lengkap, survei rumah terverifikasi layak menerima santunan bulanan.',
        registeredAt: dt('2025-02-01T15:30:00Z'),
        verifiedAt: dt('2025-02-05T09:00:00Z'),
        verifiedById: 'usr-super-admin',
        photoUrl: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=400&q=80',
        homePhotoUrl: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=400&q=80',
        totalAidReceived: d(500000)
      },
      {
        id: 'chd-2',
        registrationNumber: 'YCM-2025-002',
        guardianId: 'gdn-2',
        guardianName: 'Mang Ujang Suherman',
        guardianPhone: '081322114455',
        fullName: 'Siti Nurhaliza',
        nickname: 'Siti',
        birthPlace: 'Sumedang',
        birthDate: dt('2012-09-28T00:00:00Z'),
        gender: 'P',
        orphanCategory: 'yatim_piatu',
        nik: '3204126809120008',
        familyCardNumber: '3204121509120001',
        birthCertificateNumber: '474.1/889/2012',
        address: 'Dusun Cikembang RT 02/RW 01',
        rt: '02',
        rw: '01',
        province: 'Jawa Barat',
        city: 'Sumedang',
        district: 'Cimalaka',
        village: 'Pasirangin',
        postalCode: '45353',
        latitude: d(-6.8412),
        longitude: d(107.9411),
        schoolName: 'SMP Negeri 1 Cimalaka',
        educationLevel: 'SMP',
        schoolGrade: 'Kelas 8',
        studentNumber: '2122045',
        healthCondition: 'Sehat',
        specialNeeds: 'Prestasi Juara 2 Lomba Matematika',
        familyMembers: 2,
        homeOwnershipStatus: 'Menumpang',
        status: 'aktif',
        verificationNotes: 'Yatim Piatu, diasuh paman. Sangat membutuhkan beasiswa sekolah berkelanjutan.',
        registeredAt: dt('2025-02-10T11:00:00Z'),
        verifiedAt: dt('2025-02-12T14:20:00Z'),
        verifiedById: 'usr-super-admin',
        photoUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=400&q=80',
        homePhotoUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=400&q=80',
        totalAidReceived: d(850000)
      },
      {
        id: 'chd-3',
        registrationNumber: 'YCM-2025-003',
        guardianId: 'gdn-1',
        guardianName: 'Sri Mulyani',
        guardianPhone: '085233445566',
        fullName: 'Budi Kurniawan',
        nickname: 'Budi',
        birthPlace: 'Bandung',
        birthDate: dt('2017-03-15T00:00:00Z'),
        gender: 'L',
        orphanCategory: 'piatu',
        nik: '3204121503170004',
        familyCardNumber: '3204121008120005',
        address: 'Jl. Kartini No. 18, RT 01/RW 02',
        rt: '01',
        rw: '02',
        province: 'Jawa Barat',
        city: 'Sumedang',
        district: 'Sumedang Utara',
        village: 'Kotakaler',
        postalCode: '45322',
        latitude: d(-6.8588),
        longitude: d(107.9221),
        schoolName: 'SDN Kotakaler 2',
        educationLevel: 'SD',
        schoolGrade: 'Kelas 2',
        studentNumber: '1718091',
        healthCondition: 'Sehat',
        familyMembers: 2,
        homeOwnershipStatus: 'Sewa',
        status: 'aktif',
        verificationNotes: 'Terdaftar sebagai piatu dan masih membutuhkan dukungan rutin.',
        registeredAt: dt('2025-02-18T09:15:00Z'),
        verifiedAt: dt('2025-02-20T10:00:00Z'),
        verifiedById: 'usr-super-admin',
        photoUrl: 'https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?auto=format&fit=crop&w=400&q=80',
        totalAidReceived: d(0)
      },
      {
        id: 'chd-4',
        registrationNumber: 'YCM-2025-004',
        guardianId: 'gdn-3',
        guardianName: 'Nenek Aminah',
        guardianPhone: '082199887766',
        fullName: 'Dewi Anggraini',
        nickname: 'Dewi',
        birthPlace: 'Sumedang',
        birthDate: dt('2016-11-04T00:00:00Z'),
        gender: 'P',
        orphanCategory: 'yatim',
        nik: '3204124411160002',
        familyCardNumber: '3204121004160008',
        address: 'Dusun Sukamaju RT 04/RW 03',
        rt: '04',
        rw: '03',
        province: 'Jawa Barat',
        city: 'Sumedang',
        district: 'Conggeang',
        village: 'Sukamaju',
        postalCode: '45391',
        latitude: d(-6.7981),
        longitude: d(107.9812),
        schoolName: 'SDN Sukamaju',
        educationLevel: 'SD',
        schoolGrade: 'Kelas 3',
        healthCondition: 'Perlu pemeriksaan rutin gigi',
        familyMembers: 2,
        homeOwnershipStatus: 'Milik Sendiri',
        status: 'menunggu_verifikasi',
        verificationNotes: 'Menunggu survei lanjutan kondisi rumah dari petugas.',
        registeredAt: dt('2025-03-01T10:00:00Z'),
        photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
        totalAidReceived: d(0)
      }
    ]
  });

  await prisma.childDocument.createMany({
    data: [
      {
        id: 'doc-1',
        childId: 'chd-1',
        documentType: 'kk',
        title: 'Kartu Keluarga',
        filePath: '/docs/kk_ahmad.pdf',
        verificationStatus: 'terverifikasi',
        uploadedAt: dt('2025-02-01T15:35:00Z')
      },
      {
        id: 'doc-2',
        childId: 'chd-1',
        documentType: 'surat_kematian_ayah',
        title: 'Surat Kematian Ayah',
        filePath: '/docs/sk_ayah_ahmad.pdf',
        verificationStatus: 'terverifikasi',
        uploadedAt: dt('2025-02-01T15:36:00Z')
      },
      {
        id: 'doc-3',
        childId: 'chd-2',
        documentType: 'sktm',
        title: 'Surat Keterangan Tidak Mampu',
        filePath: '/docs/sktm_siti.pdf',
        verificationStatus: 'terverifikasi',
        uploadedAt: dt('2025-02-10T11:15:00Z')
      }
    ]
  });

  await prisma.childPhoto.createMany({
    data: [
      {
        id: 'ph-1',
        childId: 'chd-1',
        photoType: 'anak',
        filePath: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=400&q=80',
        caption: 'Foto Ahmad',
        isPublic: true
      },
      {
        id: 'ph-2',
        childId: 'chd-2',
        photoType: 'anak',
        filePath: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=400&q=80',
        caption: 'Foto Siti',
        isPublic: true
      },
      {
        id: 'ph-3',
        childId: 'chd-3',
        photoType: 'rumah',
        filePath: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=400&q=80',
        caption: 'Kondisi rumah Budi',
        isPublic: false
      }
    ]
  });

  await prisma.donor.createMany({
    data: [
      {
        id: 'dnr-1',
        userId: 'usr-donatur-1',
        donorNumber: 'DNR-2025-001',
        fullName: 'Hj. Ratna Pertiwi',
        donorType: 'individu',
        institutionName: 'PT Pertiwi Sejahtera',
        email: 'ratna.pertiwi@gmail.com',
        phone: '081288991122',
        address: 'Jl. Dago Asri No. 15, Bandung',
        isAnonymousDefault: false,
        isRecurringDonor: true,
        verificationStatus: 'verified',
        totalDonation: d(11000000),
        transactionCount: 2,
        lastDonationAt: dt('2025-03-08T10:00:00Z'),
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
        createdAt: dt('2025-01-20T11:00:00Z')
      },
      {
        id: 'dnr-2',
        donorNumber: 'DNR-2025-002',
        fullName: 'Komunitas Pemuda Hijrah Sumedang',
        donorType: 'komunitas',
        institutionName: 'Pemuda Hijrah',
        email: 'pemudahijrah.smd@gmail.com',
        phone: '085712345678',
        address: 'Sumedang Kota',
        isAnonymousDefault: false,
        isRecurringDonor: false,
        verificationStatus: 'verified',
        totalDonation: d(3500000),
        transactionCount: 1,
        lastDonationAt: dt('2025-03-04T16:00:00Z'),
        createdAt: dt('2025-02-01T09:00:00Z')
      },
      {
        id: 'dnr-3',
        donorNumber: 'DNR-2025-003',
        fullName: 'Hamba Allah',
        donorType: 'anonim',
        email: 'anonim@yatimcare.org',
        phone: '080000000000',
        isAnonymousDefault: true,
        isRecurringDonor: false,
        verificationStatus: 'verified',
        totalDonation: d(2500000),
        transactionCount: 1,
        lastDonationAt: dt('2025-03-02T11:20:00Z'),
        createdAt: dt('2025-02-05T08:00:00Z')
      },
      {
        id: 'dnr-4',
        donorNumber: 'DNR-2025-004',
        fullName: 'PT Maju Bersama',
        donorType: 'perusahaan',
        institutionName: 'PT Maju Bersama',
        email: 'csr@majubersama.co.id',
        phone: '02288776655',
        address: 'Bandung',
        isAnonymousDefault: false,
        isRecurringDonor: true,
        verificationStatus: 'verified',
        totalDonation: d(4000000),
        transactionCount: 1,
        lastDonationAt: dt('2025-03-03T13:30:00Z'),
        createdAt: dt('2025-02-12T08:00:00Z')
      }
    ]
  });

  await prisma.program.createMany({
    data: [
      {
        id: 'prg-1',
        programCode: 'PRG-2025-001',
        title: 'Orang Tua Asuh & Santunan Bulanan Anak Yatim 2025',
        slug: 'orang-tua-asuh-santunan-bulanan',
        category: 'santunan',
        description: 'Program penyediaan dana santunan rutin dan uang saku bulanan untuk pemenuhan gizi dan kebutuhan dasar anak-anak yatim dan piatu.',
        targetAmount: d(60000000),
        collectedAmount: d(0),
        distributedAmount: d(0),
        startDate: dt('2025-01-01T00:00:00Z'),
        endDate: dt('2025-12-31T23:59:59Z'),
        thumbnail: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=600&q=80',
        status: 'aktif',
        isFeatured: true,
        donorCount: 0
      },
      {
        id: 'prg-2',
        programCode: 'PRG-2025-002',
        title: 'Beasiswa Pendidikan & Seragam Sekolah Anak Yatim Piatu',
        slug: 'beasiswa-pendidikan-seragam-sekolah',
        category: 'pendidikan',
        description: 'Bantuan pelunasan SPP, pembelian buku pelajaran, tas, dan seragam sekolah lengkap.',
        targetAmount: d(40000000),
        collectedAmount: d(0),
        distributedAmount: d(0),
        startDate: dt('2025-01-15T00:00:00Z'),
        endDate: dt('2025-06-30T23:59:59Z'),
        thumbnail: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80',
        status: 'aktif',
        isFeatured: true,
        donorCount: 0
      },
      {
        id: 'prg-3',
        programCode: 'PRG-2025-003',
        title: 'Paket Sembako & Nutrisi Sehat Keluarga Dhuafa',
        slug: 'paket-sembako-nutrisi-sehat',
        category: 'sembako',
        description: 'Penyaluran beras, minyak goreng, telur, susu, dan vitamin bulanan untuk keluarga wali anak yang tergolong tidak mampu.',
        targetAmount: d(25000000),
        collectedAmount: d(0),
        distributedAmount: d(0),
        startDate: dt('2025-02-01T00:00:00Z'),
        endDate: dt('2025-05-31T23:59:59Z'),
        thumbnail: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=600&q=80',
        status: 'aktif',
        isFeatured: false,
        donorCount: 0
      }
    ]
  });

  await prisma.donation.createMany({
    data: [
      {
        id: 'don-1',
        transactionNumber: 'TRX-20250301-001',
        donorId: 'dnr-1',
        donorName: 'Hj. Ratna Pertiwi',
        donorEmail: 'ratna.pertiwi@gmail.com',
        donorPhone: '081288991122',
        programId: 'prg-1',
        programTitle: 'Orang Tua Asuh & Santunan Bulanan Anak Yatim 2025',
        donationType: 'santunan',
        amount: d(5000000),
        paymentMethod: 'transfer_bank',
        destinationAccount: 'BSI 7123456789 a.n Yayasan YatimCare',
        paymentReference: 'REF98210192',
        paymentProofUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80',
        paymentStatus: 'berhasil',
        isAnonymous: false,
        donorMessage: 'Semoga menjadi keberkahan dan penyemangat belajar untuk anak-anak yatim.',
        donatedAt: dt('2025-03-01T10:00:00Z'),
        verifiedById: 'usr-bendahara',
        verifiedAt: dt('2025-03-01T10:15:00Z')
      },
      {
        id: 'don-2',
        transactionNumber: 'TRX-20250302-002',
        donorId: 'dnr-3',
        donorName: 'Hamba Allah',
        donorEmail: 'anonim@yatimcare.org',
        donorPhone: '080000000000',
        programId: 'prg-2',
        programTitle: 'Beasiswa Pendidikan & Seragam Sekolah Anak Yatim Piatu',
        donationType: 'pendidikan',
        amount: d(2500000),
        paymentMethod: 'qris',
        destinationAccount: 'QRIS Yayasan YatimCare',
        paymentReference: 'QRIS-8821039',
        paymentStatus: 'berhasil',
        isAnonymous: true,
        donorMessage: 'Niat lillahi ta\'ala untuk pendidikan adik-adik.',
        donatedAt: dt('2025-03-02T11:20:00Z'),
        verifiedById: 'usr-bendahara',
        verifiedAt: dt('2025-03-02T11:25:00Z')
      },
      {
        id: 'don-3',
        transactionNumber: 'TRX-20250303-003',
        donorId: 'dnr-4',
        donorName: 'PT Maju Bersama',
        donorEmail: 'csr@majubersama.co.id',
        donorPhone: '02288776655',
        programId: 'prg-1',
        programTitle: 'Orang Tua Asuh & Santunan Bulanan Anak Yatim 2025',
        donationType: 'program_khusus',
        amount: d(4000000),
        paymentMethod: 'transfer_bank',
        destinationAccount: 'Bank Mandiri 1300098765432',
        paymentReference: 'MANDIRI-55412',
        paymentProofUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80',
        paymentStatus: 'berhasil',
        isAnonymous: false,
        donorMessage: 'Dukungan CSR bulanan untuk program santunan.',
        donatedAt: dt('2025-03-03T08:30:00Z'),
        verifiedById: 'usr-bendahara',
        verifiedAt: dt('2025-03-03T08:45:00Z')
      },
      {
        id: 'don-4',
        transactionNumber: 'TRX-20250304-004',
        donorId: 'dnr-2',
        donorName: 'Komunitas Pemuda Hijrah Sumedang',
        donorEmail: 'pemudahijrah.smd@gmail.com',
        donorPhone: '085712345678',
        programId: 'prg-3',
        programTitle: 'Paket Sembako & Nutrisi Sehat Keluarga Dhuafa',
        donationType: 'infak',
        amount: d(3500000),
        paymentMethod: 'transfer_bank',
        destinationAccount: 'BSI 7123456789 a.n Yayasan YatimCare',
        paymentReference: 'BSI-77331',
        paymentStatus: 'berhasil',
        isAnonymous: false,
        donorMessage: 'Untuk paket sembako dan vitamin anak-anak.',
        donatedAt: dt('2025-03-04T16:00:00Z'),
        verifiedById: 'usr-bendahara',
        verifiedAt: dt('2025-03-04T16:15:00Z')
      },
      {
        id: 'don-5',
        transactionNumber: 'TRX-20250308-005',
        donorId: 'dnr-1',
        donorName: 'Hj. Ratna Pertiwi',
        donorEmail: 'ratna.pertiwi@gmail.com',
        donorPhone: '081288991122',
        programId: 'prg-2',
        programTitle: 'Beasiswa Pendidikan & Seragam Sekolah Anak Yatim Piatu',
        donationType: 'pendidikan',
        amount: d(6000000),
        paymentMethod: 'qris',
        destinationAccount: 'QRIS Yayasan YatimCare',
        paymentReference: 'QRIS-8811222',
        paymentStatus: 'berhasil',
        isAnonymous: false,
        donorMessage: 'Tambahan dukungan untuk beasiswa semester ini.',
        donatedAt: dt('2025-03-08T10:00:00Z'),
        verifiedById: 'usr-bendahara',
        verifiedAt: dt('2025-03-08T10:10:00Z')
      },
      {
        id: 'don-6',
        transactionNumber: 'TRX-20250310-006',
        donorName: 'Drs. Hendra Wijaya',
        donorEmail: 'hendra.wijaya@hotmail.com',
        donorPhone: '081233445577',
        programId: 'prg-1',
        programTitle: 'Orang Tua Asuh & Santunan Bulanan Anak Yatim 2025',
        donationType: 'zakat',
        amount: d(1000000),
        paymentMethod: 'transfer_bank',
        destinationAccount: 'Bank Mandiri 1300098765432',
        paymentReference: 'MANDIRI-55413',
        paymentProofUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80',
        paymentStatus: 'menunggu_verifikasi',
        isAnonymous: false,
        donorMessage: 'Penyaluran zakat maal keluarga.',
        donatedAt: dt('2025-03-10T08:30:00Z')
      }
    ]
  });

  await prisma.expense.createMany({
    data: [
      {
        id: 'exp-1',
        expenseNumber: 'EXP-202502-001',
        programId: 'prg-1',
        programTitle: 'Orang Tua Asuh & Santunan Bulanan Anak Yatim 2025',
        category: 'santunan_bulanan',
        transactionDate: dt('2025-02-15T00:00:00Z'),
        recipientName: 'Wali Anak (Ahmad, Siti, Budi & 12 Anak Lainnya)',
        amount: d(2400000),
        purpose: 'Penyaluran Santunan Uang Saku Bulanan Februari 2025',
        description: 'Penyerahan uang tunai santunan untuk anak-anak terverifikasi di kantor yayasan.',
        paymentMethod: 'transfer_bank',
        receiptFileUrl: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=400&q=80',
        status: 'dibayarkan',
        submittedById: 'usr-petugas',
        approvedById: 'usr-super-admin',
        approvedAt: dt('2025-02-14T16:00:00Z')
      },
      {
        id: 'exp-2',
        expenseNumber: 'EXP-202502-002',
        programId: 'prg-2',
        programTitle: 'Beasiswa Pendidikan & Seragam Sekolah Anak Yatim Piatu',
        category: 'bantuan_pendidikan',
        transactionDate: dt('2025-02-20T00:00:00Z'),
        recipientName: 'Toko Seragam & Alat Tulis Berkah Sumedang',
        amount: d(3800000),
        purpose: 'Pembelian seragam dan perlengkapan sekolah',
        description: 'Pembelian seragam merah putih, tas, dan buku tulis untuk penerima beasiswa.',
        paymentMethod: 'transfer_bank',
        receiptFileUrl: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=400&q=80',
        status: 'disetujui',
        submittedById: 'usr-bendahara',
        approvedById: 'usr-super-admin',
        approvedAt: dt('2025-02-19T11:00:00Z')
      },
      {
        id: 'exp-3',
        expenseNumber: 'EXP-202503-003',
        programId: 'prg-3',
        programTitle: 'Paket Sembako & Nutrisi Sehat Keluarga Dhuafa',
        category: 'operasional_yayasan',
        transactionDate: dt('2025-03-05T00:00:00Z'),
        recipientName: 'Supplier Logistik Yayasan',
        amount: d(1500000),
        purpose: 'Biaya operasional dan transport distribusi',
        description: 'Transport petugas dan biaya distribusi paket sembako ke wilayah binaan.',
        paymentMethod: 'tunai',
        receiptFileUrl: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=400&q=80',
        status: 'diajukan',
        submittedById: 'usr-bendahara'
      }
    ]
  });

  await prisma.aidDistribution.createMany({
    data: [
      {
        id: 'aid-1',
        distributionNumber: 'AID-20250215-001',
        childId: 'chd-1',
        childName: 'Ahmad Rizky Pratama',
        guardianName: 'Sri Mulyani',
        programId: 'prg-1',
        programTitle: 'Orang Tua Asuh & Santunan Bulanan Anak Yatim 2025',
        aidType: 'Uang Tunai',
        distributionDate: dt('2025-02-15T00:00:00Z'),
        amount: d(500000),
        itemDescription: 'Santunan Tunai Bulan Februari 2025',
        sourceOfFunds: 'Donasi Program Orang Tua Asuh',
        officerId: 'usr-petugas',
        officerName: 'Budi Santoso',
        location: 'Kantor Yayasan YatimCare',
        photoUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=400&q=80',
        status: 'selesai',
        notes: 'Diterima langsung oleh wali anak.'
      },
      {
        id: 'aid-2',
        distributionNumber: 'AID-20250220-002',
        childId: 'chd-2',
        childName: 'Siti Nurhaliza',
        guardianName: 'Mang Ujang Suherman',
        programId: 'prg-2',
        programTitle: 'Beasiswa Pendidikan & Seragam Sekolah Anak Yatim Piatu',
        aidType: 'Perlengkapan Sekolah',
        distributionDate: dt('2025-02-20T00:00:00Z'),
        amount: d(850000),
        itemDescription: 'Seragam SMP, Tas Sekolah, Buku & Uang SPP 3 Bulan',
        sourceOfFunds: 'Donasi Beasiswa Pendidikan',
        officerId: 'usr-petugas',
        officerName: 'Budi Santoso',
        location: 'SMP Negeri 1 Cimalaka',
        photoUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=400&q=80',
        status: 'selesai',
        notes: 'Penyerahan disaksikan pihak sekolah.'
      },
      {
        id: 'aid-3',
        distributionNumber: 'AID-20250305-003',
        childId: 'chd-3',
        childName: 'Budi Kurniawan',
        guardianName: 'Sri Mulyani',
        programId: 'prg-3',
        programTitle: 'Paket Sembako & Nutrisi Sehat Keluarga Dhuafa',
        aidType: 'Sembako',
        distributionDate: dt('2025-03-05T00:00:00Z'),
        amount: d(1200000),
        itemDescription: 'Paket sembako bulanan dan susu anak',
        sourceOfFunds: 'Program Sembako',
        officerId: 'usr-petugas',
        officerName: 'Budi Santoso',
        location: 'Kantor Yayasan YatimCare',
        photoUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=400&q=80',
        status: 'terproses',
        notes: 'Siap disalurkan pada pekan berikutnya.'
      }
    ]
  });

  await prisma.survey.createMany({
    data: [
      {
        id: 'srv-1',
        childId: 'chd-1',
        childName: 'Ahmad Rizky Pratama',
        officerId: 'usr-petugas',
        officerName: 'Budi Santoso',
        surveyDate: dt('2025-02-04T09:00:00Z'),
        economicCondition: 'Penghasilan wali < Rp 1.000.000/bulan dari buruh cuci, menanggung 3 anggota keluarga.',
        homeCondition: 'Rumah bilik kayu menumpang di lahan kerabat, lantai semen kasar, atap seng ada bocor.',
        educationCondition: 'Anak rajin sekolah, nilai rata-rata 85, disiplin dan berakhlak baik.',
        healthCondition: 'Sehat, hanya mengeluhkan pandangan buram bila duduk di barisan belakang kelas.',
        documentMatch: true,
        latitude: d(-6.8273),
        longitude: d(107.9254),
        recommendation: 'layak',
        notes: 'Sangat direkomendasikan menerima santunan bulanan dan bantuan kacamata.',
        photos: [
          'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=400&q=80'
        ]
      },
      {
        id: 'srv-2',
        childId: 'chd-4',
        childName: 'Dewi Anggraini',
        officerId: 'usr-petugas',
        officerName: 'Budi Santoso',
        surveyDate: dt('2025-03-02T10:00:00Z'),
        economicCondition: 'Wali adalah nenek dengan penghasilan sangat terbatas dari berdagang kecil.',
        homeCondition: 'Rumah sederhana namun layak huni, perlu perbaikan pada bagian atap.',
        educationCondition: 'Aktif bersekolah dan butuh dukungan perlengkapan sekolah.',
        healthCondition: 'Perlu pemeriksaan gigi rutin.',
        documentMatch: false,
        latitude: d(-6.7981),
        longitude: d(107.9812),
        recommendation: 'layak_catatan',
        notes: 'Perlu survei ulang setelah dokumen lengkap.',
        photos: []
      }
    ]
  });

  await prisma.bankAccount.createMany({
    data: [
      {
        id: 'bnk-1',
        bankName: 'Bank Syariah Indonesia (BSI)',
        accountNumber: '7123456789',
        accountHolder: 'Yayasan Peduli YatimCare',
        accountType: 'Giro',
        isActive: true
      },
      {
        id: 'bnk-2',
        bankName: 'Bank Mandiri',
        accountNumber: '1300098765432',
        accountHolder: 'Yayasan Peduli YatimCare',
        accountType: 'Tabungan',
        isActive: true
      },
      {
        id: 'bnk-3',
        bankName: 'Bank BCA',
        accountNumber: '14800112233',
        accountHolder: 'Yayasan Peduli YatimCare',
        accountType: 'Tabungan',
        isActive: true
      }
    ]
  });

  await prisma.newsItem.createMany({
    data: [
      {
        id: 'news-1',
        title: 'Penyaluran Santunan & Beasiswa Bulan Februari 2025 Berjalan Lancar',
        slug: 'penyaluran-santunan-beasiswa-februari-2025',
        summary: 'Yayasan YatimCare telah menyalurkan santunan tunai dan beasiswa pendidikan kepada anak-anak binaan di Kabupaten Sumedang.',
        content: 'Alhamdulillah, pada hari Sabtu 15 Februari 2025, Yayasan YatimCare kembali melaksanakan kegiatan rutin penyaluran bantuan santunan bulanan dan beasiswa pendidikan.',
        coverImage: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=600&q=80',
        publishedAt: dt('2025-02-16T10:00:00Z'),
        isPublished: true,
        createdById: 'usr-super-admin'
      },
      {
        id: 'news-2',
        title: 'Pembukaan Pendaftaran Calon Penerima Manfaat Tahun Ajaran 2025/2026',
        slug: 'pembukaan-pendaftaran-penerima-manfaat-2025',
        summary: 'Wali anak yatim, piatu, atau masyarakat yang ingin mengajukan anak penerima bantuan dapat mengisi formulir online.',
        content: 'Dalam rangka memperluas jangkauan kebaikan, Yayasan YatimCare resmi membuka pendaftaran anak yatim/piatu kurang mampu.',
        coverImage: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80',
        publishedAt: dt('2025-02-01T08:00:00Z'),
        isPublished: true,
        createdById: 'usr-super-admin'
      }
    ]
  });

  await prisma.galleryItem.createMany({
    data: [
      {
        id: 'gal-1',
        title: 'Penyaluran Perlengkapan Sekolah di SMPN 1 Cimalaka',
        imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80',
        caption: 'Penyerahan beasiswa seragam dan buku sekolah untuk Siti Nurhaliza.',
        category: 'Dokumentasi Penyaluran',
        isPublic: true
      },
      {
        id: 'gal-2',
        title: 'Survei Lapangan Rumah Anak Yatim di Tanjungmedar',
        imageUrl: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=600&q=80',
        caption: 'Petugas lapangan Budi Santoso melakukan verifikasi kondisi tempat tinggal anak.',
        category: 'Survei Lapangan',
        isPublic: true
      },
      {
        id: 'gal-3',
        title: 'Kumpul Doa & Pengajian Bersama Anak-Anak Yatim',
        imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=600&q=80',
        caption: 'Pengajian rutin bulanan sekaligus penyerahan santunan tunai di Aula Yayasan.',
        category: 'Kegiatan Yayasan',
        isPublic: true
      }
    ]
  });

  await prisma.auditLog.createMany({
    data: [
      {
        id: 'log-1',
        actorUserId: 'usr-super-admin',
        action: 'VERIFIKASI_ANAK',
        entityType: 'Child',
        entityId: 'chd-1',
        description: 'Menyetujui verifikasi data anak Ahmad Rizky Pratama sebagai aktif',
        ipAddress: '180.252.12.84',
        createdAt: dt('2025-02-05T09:00:00Z')
      },
      {
        id: 'log-2',
        actorUserId: 'usr-bendahara',
        action: 'VERIFIKASI_DONASI',
        entityType: 'Donation',
        entityId: 'don-1',
        description: 'Mengonfirmasi donasi Rp 5.000.000 dari Hj. Ratna Pertiwi',
        ipAddress: '180.252.12.85',
        createdAt: dt('2025-03-01T10:15:00Z')
      }
    ]
  });

  await prisma.notification.createMany({
    data: [
      {
        id: 'ntf-1',
        userId: 'usr-super-admin',
        title: 'Donasi masuk berhasil diverifikasi',
        message: 'Transaksi TRX-20250301-001 telah diverifikasi oleh bendahara.',
        channel: 'in_app',
        isRead: false
      },
      {
        id: 'ntf-2',
        userId: 'usr-donatur-1',
        title: 'Terima kasih atas donasi Anda',
        message: 'Donasi Anda sudah tercatat pada program santunan bulanan.',
        channel: 'email',
        isRead: true,
        readAt: dt('2025-03-01T11:00:00Z')
      }
    ]
  });

  await prisma.systemSetting.createMany({
    data: [
      {
        key: 'app_name',
        value: JSON.stringify('YatimCare'),
        description: 'Nama aplikasi utama'
      },
      {
        key: 'app_logo_url',
        value: JSON.stringify(''),
        description: 'Logo aplikasi utama'
      },
      {
        key: 'foundation_name',
        value: JSON.stringify('Yayasan Peduli YatimCare'),
        description: 'Nama resmi yayasan'
      },
      {
        key: 'contact_phone',
        value: JSON.stringify('0812-3456-7890'),
        description: 'Nomor kontak utama yayasan'
      }
    ]
  });

  const successfulDonations = await prisma.donation.findMany({
    where: { paymentStatus: 'berhasil' }
  });

  const expenseItems = await prisma.expense.findMany({
    where: { status: { in: ['disetujui', 'dibayarkan'] } }
  });

  const aidItems = await prisma.aidDistribution.findMany({
    where: { status: 'selesai' }
  });

  const successfulByProgram = successfulDonations.reduce<Record<string, { amount: Prisma.Decimal; count: number }>>(
    (acc, donation) => {
      const current = acc[donation.programId] ?? { amount: d(0), count: 0 };
      current.amount = current.amount.add(donation.amount);
      current.count += 1;
      acc[donation.programId] = current;
      return acc;
    },
    {}
  );

  const distributedByProgram = [...expenseItems, ...aidItems].reduce<Record<string, Prisma.Decimal>>((acc, item) => {
    if (!item.programId) {
      return acc;
    }

    const current = acc[item.programId] ?? d(0);
    acc[item.programId] = current.add(item.amount);
    return acc;
  }, {});

  for (const [programId, stats] of Object.entries(successfulByProgram) as Array<
    [string, { amount: Prisma.Decimal; count: number }]
  >) {
    await prisma.program.update({
      where: { id: programId },
      data: {
        collectedAmount: stats.amount,
        donorCount: stats.count,
        distributedAmount: distributedByProgram[programId] ?? d(0)
      }
    });
  }

  const aidByChild = aidItems.reduce<Record<string, Prisma.Decimal>>((acc, item) => {
    const current = acc[item.childId] ?? d(0);
    acc[item.childId] = current.add(item.amount);
    return acc;
  }, {});

  for (const [childId, amount] of Object.entries(aidByChild)) {
    await prisma.child.update({
      where: { id: childId },
      data: { totalAidReceived: amount }
    });
  }

  console.log('Seed completed successfully.');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
