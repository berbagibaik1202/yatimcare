import {
  User,
  Guardian,
  Child,
  Donor,
  DonorType,
  Program,
  Donation,
  Expense,
  AidDistribution,
  Survey,
  BankAccount,
  AuditLog,
  NewsItem,
  GalleryItem,
  FinancialSummary,
  UserRole
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_GUARDIANS,
  INITIAL_CHILDREN,
  INITIAL_DONORS,
  INITIAL_PROGRAMS,
  INITIAL_DONATIONS,
  INITIAL_EXPENSES,
  INITIAL_AID_DISTRIBUTIONS,
  INITIAL_SURVEYS,
  INITIAL_BANK_ACCOUNTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_NEWS,
  INITIAL_GALLERY
} from '../data/mockData';

const STORAGE_KEYS = {
  USERS: 'yatimcare_users_v1',
  GUARDIANS: 'yatimcare_guardians_v1',
  CHILDREN: 'yatimcare_children_v1',
  DONORS: 'yatimcare_donors_v1',
  PROGRAMS: 'yatimcare_programs_v1',
  DONATIONS: 'yatimcare_donations_v1',
  EXPENSES: 'yatimcare_expenses_v1',
  AID_DISTRIBUTIONS: 'yatimcare_aid_v1',
  SURVEYS: 'yatimcare_surveys_v1',
  BANK_ACCOUNTS: 'yatimcare_banks_v1',
  AUDIT_LOGS: 'yatimcare_audit_v1',
  NEWS: 'yatimcare_news_v1',
  GALLERY: 'yatimcare_gallery_v1',
  CURRENT_USER: 'yatimcare_current_user_v1'
};

function loadStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Error loading ${key} from storage`, e);
    return defaultValue;
  }
}

function saveStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to storage`, e);
  }
}

class DatabaseStore {
  private users: User[];
  private guardians: Guardian[];
  private children: Child[];
  private donors: Donor[];
  private programs: Program[];
  private donations: Donation[];
  private expenses: Expense[];
  private aidDistributions: AidDistribution[];
  private surveys: Survey[];
  private bankAccounts: BankAccount[];
  private auditLogs: AuditLog[];
  private news: NewsItem[];
  private gallery: GalleryItem[];
  private currentUser: User | null;

  constructor() {
    this.users = loadStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
    this.guardians = loadStorage(STORAGE_KEYS.GUARDIANS, INITIAL_GUARDIANS);
    this.children = loadStorage(STORAGE_KEYS.CHILDREN, INITIAL_CHILDREN);
    this.donors = loadStorage(STORAGE_KEYS.DONORS, INITIAL_DONORS);
    this.programs = loadStorage(STORAGE_KEYS.PROGRAMS, INITIAL_PROGRAMS);
    this.donations = loadStorage(STORAGE_KEYS.DONATIONS, INITIAL_DONATIONS);
    this.expenses = loadStorage(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
    this.aidDistributions = loadStorage(STORAGE_KEYS.AID_DISTRIBUTIONS, INITIAL_AID_DISTRIBUTIONS);
    this.surveys = loadStorage(STORAGE_KEYS.SURVEYS, INITIAL_SURVEYS);
    this.bankAccounts = loadStorage(STORAGE_KEYS.BANK_ACCOUNTS, INITIAL_BANK_ACCOUNTS);
    this.auditLogs = loadStorage(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    this.news = loadStorage(STORAGE_KEYS.NEWS, INITIAL_NEWS);
    this.gallery = loadStorage(STORAGE_KEYS.GALLERY, INITIAL_GALLERY);
    
    // Default current user to Super Admin for seamless testing or read from storage
    const storedUser = loadStorage<User | null>(STORAGE_KEYS.CURRENT_USER, null);
    this.currentUser = storedUser || this.users[0];
  }

  // Persist State Helper
  private persist() {
    saveStorage(STORAGE_KEYS.USERS, this.users);
    saveStorage(STORAGE_KEYS.GUARDIANS, this.guardians);
    saveStorage(STORAGE_KEYS.CHILDREN, this.children);
    saveStorage(STORAGE_KEYS.DONORS, this.donors);
    saveStorage(STORAGE_KEYS.PROGRAMS, this.programs);
    saveStorage(STORAGE_KEYS.DONATIONS, this.donations);
    saveStorage(STORAGE_KEYS.EXPENSES, this.expenses);
    saveStorage(STORAGE_KEYS.AID_DISTRIBUTIONS, this.aidDistributions);
    saveStorage(STORAGE_KEYS.SURVEYS, this.surveys);
    saveStorage(STORAGE_KEYS.BANK_ACCOUNTS, this.bankAccounts);
    saveStorage(STORAGE_KEYS.AUDIT_LOGS, this.auditLogs);
    saveStorage(STORAGE_KEYS.NEWS, this.news);
    saveStorage(STORAGE_KEYS.GALLERY, this.gallery);
    saveStorage(STORAGE_KEYS.CURRENT_USER, this.currentUser);
  }

  // --- AUTH & USER MANAGE ---
  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public switchRole(role: UserRole) {
    if (role === 'public') {
      this.currentUser = null;
    } else {
      const found = this.users.find(u => u.role === role);
      if (found) {
        this.currentUser = found;
      } else {
        // create temporary mock user for role
        const newUser: User = {
          id: `usr-${Date.now()}`,
          name: `Pengguna ${role.toUpperCase()}`,
          email: `${role}@yatimcare.org`,
          phone: '081200001111',
          role: role,
          status: 'active',
          createdAt: new Date().toISOString()
        };
        this.users.push(newUser);
        this.currentUser = newUser;
      }
    }
    this.persist();
    this.logAudit('SWITCH_ROLE', 'Sistem', `Mengubah tampilan peran aktif menjadi: ${role}`);
  }

  public getUsers(): User[] {
    return this.users;
  }

  // --- CHILDREN ---
  public getChildren(): Child[] {
    return this.children;
  }

  public getChildById(id: string): Child | undefined {
    return this.children.find(c => c.id === id);
  }

  public addChild(childData: Omit<Child, 'id' | 'registrationNumber' | 'totalAidReceived'>): Child {
    const regNum = `YCM-${new Date().getFullYear()}-${String(this.children.length + 1).padStart(3, '0')}`;
    const newChild: Child = {
      ...childData,
      id: `chd-${Date.now()}`,
      registrationNumber: regNum,
      totalAidReceived: 0,
      documents: childData.documents || []
    };
    this.children.unshift(newChild);
    this.persist();
    this.logAudit('TAMBAH_ANAK', 'Data Anak', `Menambahkan pendaftaran anak baru: ${newChild.fullName} (${regNum})`);
    return newChild;
  }

  public updateChild(id: string, updates: Partial<Child>): Child | undefined {
    const index = this.children.findIndex(c => c.id === id);
    if (index !== -1) {
      this.children[index] = { ...this.children[index], ...updates };
      this.persist();
      this.logAudit('EDIT_ANAK', 'Data Anak', `Memperbarui data anak: ${this.children[index].fullName}`);
      return this.children[index];
    }
    return undefined;
  }

  public verifyChild(id: string, status: 'aktif' | 'ditolak' | 'perlu_perbaikan', notes?: string) {
    const child = this.getChildById(id);
    if (child) {
      child.status = status;
      child.verificationNotes = notes;
      child.verifiedAt = new Date().toISOString();
      child.verifiedBy = this.currentUser?.name || 'Admin';
      this.persist();
      this.logAudit('VERIFIKASI_ANAK', 'Data Anak', `Memverifikasi status anak ${child.fullName} menjadi: ${status}`);
    }
  }

  public checkDuplicateNIK(nik: string): Child | undefined {
    return this.children.find(c => c.nik === nik);
  }

  // --- GUARDIANS ---
  public getGuardians(): Guardian[] {
    return this.guardians;
  }

  public addGuardian(guardian: Omit<Guardian, 'id' | 'createdAt'>): Guardian {
    const newGuardian: Guardian = {
      ...guardian,
      id: `gdn-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.guardians.push(newGuardian);
    this.persist();
    return newGuardian;
  }

  // --- DONORS & DONATIONS ---
  public getDonors(): Donor[] {
    return this.donors;
  }

  public registerDonor(donorData: {
    fullName: string;
    donorType: DonorType;
    institutionName?: string;
    email: string;
    phone: string;
    address?: string;
    isAnonymousDefault?: boolean;
    isRecurringDonor?: boolean;
    commitmentAmount?: number;
    commitmentFrequency?: string;
    notes?: string;
  }): Donor {
    const donorNum = `DNR-${new Date().getFullYear()}-${String(this.donors.length + 1).padStart(3, '0')}`;
    const newDonor: Donor = {
      id: `dnr-${Date.now()}`,
      donorNumber: donorNum,
      fullName: donorData.fullName,
      donorType: donorData.donorType,
      institutionName: donorData.institutionName,
      email: donorData.email,
      phone: donorData.phone,
      address: donorData.address,
      isAnonymousDefault: !!donorData.isAnonymousDefault,
      isRecurringDonor: donorData.isRecurringDonor ?? true,
      verificationStatus: 'verified',
      totalDonation: 0,
      transactionCount: 0,
      createdAt: new Date().toISOString()
    };

    // check if donor with email already exists
    const existingIndex = this.donors.findIndex(d => d.email.toLowerCase() === donorData.email.toLowerCase());
    if (existingIndex !== -1) {
      this.donors[existingIndex] = {
        ...this.donors[existingIndex],
        ...newDonor,
        id: this.donors[existingIndex].id,
        donorNumber: this.donors[existingIndex].donorNumber,
        totalDonation: this.donors[existingIndex].totalDonation,
        transactionCount: this.donors[existingIndex].transactionCount
      };
      this.persist();
      this.logAudit('REGISTER_DONOR', 'Donatur', `Memperbarui pendaftaran donatur: ${donorData.fullName} (${this.donors[existingIndex].donorNumber})`);
      return this.donors[existingIndex];
    } else {
      this.donors.unshift(newDonor);
      this.persist();
      this.logAudit('REGISTER_DONOR', 'Donatur', `Mendaftarkan donatur baru: ${donorData.fullName} (${donorNum})`);
      return newDonor;
    }
  }

  public getDonations(): Donation[] {
    return this.donations;
  }

  public addDonation(donationData: Omit<Donation, 'id' | 'transactionNumber' | 'paymentStatus' | 'donatedAt'>): Donation {
    const trxNum = `TRX-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(this.donations.length + 1).padStart(3, '0')}`;
    const newDonation: Donation = {
      ...donationData,
      id: `don-${Date.now()}`,
      transactionNumber: trxNum,
      paymentStatus: 'menunggu_verifikasi',
      donatedAt: new Date().toISOString()
    };

    // Link or create donor if not exists
    let donor = this.donors.find(d => d.email === donationData.donorEmail);
    if (!donor) {
      donor = {
        id: `dnr-${Date.now()}`,
        donorNumber: `DNR-${new Date().getFullYear()}-${String(this.donors.length + 1).padStart(3, '0')}`,
        fullName: donationData.donorName,
        donorType: donationData.isAnonymous ? 'anonim' : 'individu',
        email: donationData.donorEmail,
        phone: donationData.donorPhone,
        isAnonymousDefault: donationData.isAnonymous,
        isRecurringDonor: false,
        verificationStatus: 'verified',
        totalDonation: 0,
        transactionCount: 0,
        createdAt: new Date().toISOString()
      };
      this.donors.push(donor);
    }

    this.donations.unshift(newDonation);
    this.persist();
    this.logAudit('SUBMIT_DONASI', 'Donasi', `Mengirimkan donasi baru Rp ${donationData.amount.toLocaleString('id-ID')} (${trxNum})`);
    return newDonation;
  }

  public verifyDonation(id: string, status: 'berhasil' | 'ditolak') {
    const donation = this.donations.find(d => d.id === id);
    if (donation) {
      donation.paymentStatus = status;
      donation.verifiedBy = this.currentUser?.name || 'Bendahara';
      donation.verifiedAt = new Date().toISOString();

      if (status === 'berhasil') {
        // Update donor stats
        const donor = this.donors.find(d => d.email === donation.donorEmail);
        if (donor) {
          donor.totalDonation += donation.amount;
          donor.transactionCount += 1;
          donor.lastDonationAt = new Date().toISOString();
        }
        // Update program collected amount
        const program = this.programs.find(p => p.id === donation.programId);
        if (program) {
          program.collectedAmount += donation.amount;
          program.donorCount += 1;
        }
      }

      this.persist();
      this.logAudit('VERIFIKASI_DONASI', 'Donasi', `Memverifikasi pembayaran donasi ${donation.transactionNumber} (${status})`);
    }
  }

  // --- EXPENSES ---
  public getExpenses(): Expense[] {
    return this.expenses;
  }

  public addExpense(expenseData: Omit<Expense, 'id' | 'expenseNumber' | 'status' | 'createdAt'>): Expense {
    const expNum = `EXP-${new Date().toISOString().slice(0, 7).replace(/-/g, '')}-${String(this.expenses.length + 1).padStart(3, '0')}`;
    const newExpense: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
      expenseNumber: expNum,
      status: 'diajukan',
      createdAt: new Date().toISOString()
    };
    this.expenses.unshift(newExpense);
    this.persist();
    this.logAudit('AJUKAN_PENGELUARAN', 'Pengeluaran', `Mengajukan pengeluaran dana Rp ${expenseData.amount.toLocaleString('id-ID')} (${expNum})`);
    return newExpense;
  }

  public approveExpense(id: string, status: 'disetujui' | 'dibayarkan' | 'ditolak') {
    const expense = this.expenses.find(e => e.id === id);
    if (expense) {
      expense.status = status;
      expense.approvedBy = this.currentUser?.name || 'Admin';
      expense.approvedAt = new Date().toISOString();

      if (status === 'dibayarkan' && expense.programId) {
        const program = this.programs.find(p => p.id === expense.programId);
        if (program) {
          program.distributedAmount += expense.amount;
        }
      }

      this.persist();
      this.logAudit('APPROVE_PENGELUARAN', 'Pengeluaran', `Persetujuan pengeluaran ${expense.expenseNumber} status: ${status}`);
    }
  }

  // --- PROGRAMS ---
  public getPrograms(): Program[] {
    return this.programs;
  }

  public addProgram(program: Omit<Program, 'id' | 'programCode' | 'collectedAmount' | 'distributedAmount' | 'donorCount' | 'createdAt'>): Program {
    const newProg: Program = {
      ...program,
      id: `prg-${Date.now()}`,
      programCode: `PRG-${new Date().getFullYear()}-${String(this.programs.length + 1).padStart(3, '0')}`,
      collectedAmount: 0,
      distributedAmount: 0,
      donorCount: 0,
      createdAt: new Date().toISOString()
    };
    this.programs.unshift(newProg);
    this.persist();
    this.logAudit('TAMBAH_PROGRAM', 'Program Donasi', `Membuat program penggalangan dana baru: ${newProg.title}`);
    return newProg;
  }

  // --- AID DISTRIBUTIONS ---
  public getAidDistributions(): AidDistribution[] {
    return this.aidDistributions;
  }

  public addAidDistribution(aidData: Omit<AidDistribution, 'id' | 'distributionNumber'>): AidDistribution {
    const aidNum = `AID-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(this.aidDistributions.length + 1).padStart(3, '0')}`;
    const newAid: AidDistribution = {
      ...aidData,
      id: `aid-${Date.now()}`,
      distributionNumber: aidNum
    };
    this.aidDistributions.unshift(newAid);

    // Update child's total aid received
    const child = this.getChildById(aidData.childId);
    if (child) {
      child.totalAidReceived += aidData.amount;
    }

    this.persist();
    this.logAudit('PENYALURAN_BANTUAN', 'Penyaluran Bantuan', `Penyaluran bantuan ${aidData.aidType} senilai Rp ${aidData.amount.toLocaleString('id-ID')} kepada ${aidData.childName}`);
    return newAid;
  }

  // --- SURVEYS ---
  public getSurveys(): Survey[] {
    return this.surveys;
  }

  public addSurvey(surveyData: Omit<Survey, 'id'>): Survey {
    const newSurvey: Survey = {
      ...surveyData,
      id: `srv-${Date.now()}`
    };
    this.surveys.unshift(newSurvey);
    this.persist();
    this.logAudit('INPUT_SURVEI', 'Survei Lapangan', `Memasukkan hasil survei lapangan untuk anak: ${surveyData.childName}`);
    return newSurvey;
  }

  // --- BANK ACCOUNTS ---
  public getBankAccounts(): BankAccount[] {
    return this.bankAccounts;
  }

  // --- NEWS & GALLERY ---
  public getNews(): NewsItem[] {
    return this.news;
  }

  public getGallery(): GalleryItem[] {
    return this.gallery;
  }

  // --- FINANCIAL SUMMARY & CALCULATIONS ---
  public getFinancialSummary(): FinancialSummary {
    const totalDonationReceived = this.donations
      .filter(d => d.paymentStatus === 'berhasil')
      .reduce((sum, d) => sum + d.amount, 0);

    const totalExpenseApproved = this.expenses
      .filter(e => e.status === 'dibayarkan' || e.status === 'disetujui')
      .reduce((sum, e) => sum + e.amount, 0);

    const currentBalance = totalDonationReceived - totalExpenseApproved;

    const activeChildren = this.children.filter(c => c.status === 'aktif');
    const totalOrphanYatim = activeChildren.filter(c => c.orphanCategory === 'yatim').length;
    const totalOrphanPiatu = activeChildren.filter(c => c.orphanCategory === 'piatu').length;
    const totalOrphanYatimPiatu = activeChildren.filter(c => c.orphanCategory === 'yatim_piatu').length;

    const totalDistributedAid = this.aidDistributions
      .filter(a => a.status === 'selesai')
      .reduce((sum, a) => sum + a.amount, 0);

    const pendingVerificationsCount = this.children.filter(c => c.status === 'menunggu_verifikasi' || c.status === 'diajukan').length +
      this.donations.filter(d => d.paymentStatus === 'menunggu_verifikasi').length;

    return {
      totalDonationReceived,
      totalExpenseApproved,
      currentBalance,
      totalActiveChildren: activeChildren.length,
      totalOrphanYatim,
      totalOrphanPiatu,
      totalOrphanYatimPiatu,
      totalActiveDonors: this.donors.length,
      totalDistributedAid,
      pendingVerificationsCount
    };
  }

  // --- AUDIT LOGS ---
  public getAuditLogs(): AuditLog[] {
    return this.auditLogs;
  }

  private logAudit(action: string, module: string, details: string, recordId?: string) {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      userId: this.currentUser?.id || 'sys',
      userName: this.currentUser?.name || 'Pengunjung Publik',
      userRole: this.currentUser?.role || 'public',
      action,
      module,
      recordId,
      details,
      ipAddress: '180.252.12.90',
      timestamp: new Date().toISOString()
    };
    this.auditLogs.unshift(newLog);
    saveStorage(STORAGE_KEYS.AUDIT_LOGS, this.auditLogs);
  }

  // --- RESET DEMO DATA ---
  public resetToDefault() {
    this.users = INITIAL_USERS;
    this.guardians = INITIAL_GUARDIANS;
    this.children = INITIAL_CHILDREN;
    this.donors = INITIAL_DONORS;
    this.programs = INITIAL_PROGRAMS;
    this.donations = INITIAL_DONATIONS;
    this.expenses = INITIAL_EXPENSES;
    this.aidDistributions = INITIAL_AID_DISTRIBUTIONS;
    this.surveys = INITIAL_SURVEYS;
    this.bankAccounts = INITIAL_BANK_ACCOUNTS;
    this.auditLogs = INITIAL_AUDIT_LOGS;
    this.news = INITIAL_NEWS;
    this.gallery = INITIAL_GALLERY;
    this.currentUser = INITIAL_USERS[0];
    this.persist();
  }
}

export const db = new DatabaseStore();
