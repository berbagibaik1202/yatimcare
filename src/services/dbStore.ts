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
} from '../types';
type BootstrapPayload = {
  users: User[];
  guardians: Guardian[];
  children: Child[];
  donors: Donor[];
  programs: Program[];
  donations: Donation[];
  expenses: Expense[];
  aidDistributions: AidDistribution[];
  surveys: Survey[];
  bankAccounts: BankAccount[];
  auditLogs: AuditLog[];
  news: NewsItem[];
  gallery: GalleryItem[];
  financialSummary: FinancialSummary;
  currentUser: User | null;
};

class DatabaseStore {
  private users: User[] = [];
  private guardians: Guardian[] = [];
  private children: Child[] = [];
  private donors: Donor[] = [];
  private programs: Program[] = [];
  private donations: Donation[] = [];
  private expenses: Expense[] = [];
  private aidDistributions: AidDistribution[] = [];
  private surveys: Survey[] = [];
  private bankAccounts: BankAccount[] = [];
  private auditLogs: AuditLog[] = [];
  private news: NewsItem[] = [];
  private gallery: GalleryItem[] = [];
  private currentUser: User | null = null;
  private financialSummary: FinancialSummary | null = null;
  private loadingPromise: Promise<void> | null = null;
  private loaded = false;

  constructor() {
  }

  public async load(force = false): Promise<void> {
    if (this.loaded && !force) {
      return;
    }

    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = fetch('/api/bootstrap', {
      credentials: 'include'
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Failed to load bootstrap data: ${response.status}`);
        }

        const payload = (await response.json()) as { data: BootstrapPayload };
        this.applyBootstrap(payload.data);
        this.loaded = true;
      })
      .catch((error) => {
        this.loaded = false;
        throw error;
      })
      .finally(() => {
        this.loadingPromise = null;
      });

    return this.loadingPromise;
  }

  private applyBootstrap(data: BootstrapPayload) {
    this.users = data.users ?? [];
    this.guardians = data.guardians ?? [];
    this.children = data.children ?? [];
    this.donors = data.donors ?? [];
    this.programs = data.programs ?? [];
    this.donations = data.donations ?? [];
    this.expenses = data.expenses ?? [];
    this.aidDistributions = data.aidDistributions ?? [];
    this.surveys = data.surveys ?? [];
    this.bankAccounts = data.bankAccounts ?? [];
    this.auditLogs = data.auditLogs ?? [];
    this.news = data.news ?? [];
    this.gallery = data.gallery ?? [];
    this.currentUser = data.currentUser ?? null;
    this.financialSummary = data.financialSummary ?? null;
  }

  private async requestJson<T>(path: string, init: RequestInit, fallbackMessage: string): Promise<T | undefined> {
    const response = await fetch(path, {
      credentials: 'include',
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init.headers ?? {})
      }
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(payload?.message ?? fallbackMessage);
    }

    return payload.data as T;
  }

  private persist() {
    // Backend is the source of truth; keep this as an in-memory no-op.
  }

  // --- AUTH & USER MANAGE ---
  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public async login(email: string, password: string): Promise<User> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(payload?.message ?? 'Login gagal');
    }

    await this.load(true);

    const user = this.currentUser;
    if (!user) {
      throw new Error('Sesi login tidak dapat dimuat ulang');
    }

    return user;
  }

  public async logout(): Promise<void> {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });

    this.currentUser = null;
    await this.load(true);
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

  public async updateChildRecord(id: string, updates: Partial<Child>): Promise<Child> {
    const data = await this.requestJson<Child>(`/api/children/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    }, 'Gagal memperbarui data anak');

    if (!data) {
      throw new Error('Gagal memperbarui data anak');
    }

    await this.load(true);
    return data;
  }

  public async verifyChildRecord(id: string, status: 'aktif' | 'ditolak' | 'perlu_perbaikan', notes?: string): Promise<Child> {
    const current = this.getChildById(id);
    if (!current) {
      throw new Error('Data anak tidak ditemukan');
    }

    return this.updateChildRecord(id, {
      status,
      verificationNotes: notes
    });
  }

  public async deleteChildRecord(id: string): Promise<void> {
    await this.requestJson<void>(`/api/children/${id}`, {
      method: 'DELETE'
    }, 'Gagal menghapus data anak');

    await this.load(true);
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

  public getDonorById(id: string): Donor | undefined {
    return this.donors.find(d => d.id === id);
  }

  public async updateDonorRecord(id: string, updates: Partial<Donor>): Promise<Donor> {
    const data = await this.requestJson<Donor>(`/api/donors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    }, 'Gagal memperbarui data donatur');

    if (!data) {
      throw new Error('Gagal memperbarui data donatur');
    }

    await this.load(true);
    return data;
  }

  public async deleteDonorRecord(id: string): Promise<void> {
    await this.requestJson<void>(`/api/donors/${id}`, {
      method: 'DELETE'
    }, 'Gagal menghapus data donatur');

    await this.load(true);
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
  }

  // --- RESET DEMO DATA ---
  public resetToDefault() {
    void this.load(true);
  }
}

export const db = new DatabaseStore();
