import {
  User,
  UserRole,
  Guardian,
  Child,
  Donor,
  DonorType,
  Program,
  ProgramCategory,
  ProgramStatus,
  Donation,
  Expense,
  AidDistribution,
  Survey,
  BankAccount,
  AuditLog,
  NewsItem,
  GalleryItem,
  FinancialSummary,
  SystemSetting,
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
  systemSettings: SystemSetting[];
  financialSummary: FinancialSummary;
  currentUser: User | null;
};

type DatabaseBackupPayload = {
  version: number;
  exportedAt: string;
  snapshot: Record<string, unknown>;
};

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();

function resolveApiUrl(path: string) {
  if (!apiBaseUrl) {
    return path;
  }

  const normalizedBase = apiBaseUrl.replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

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
  private systemSettings: SystemSetting[] = [];
  private currentUser: User | null = null;
  private financialSummary: FinancialSummary | null = null;
  private loadingPromise: Promise<void> | null = null;
  private loaded = false;

  constructor() {
  }

  private apiUrl(path: string) {
    return resolveApiUrl(path);
  }

  public async load(force = false): Promise<void> {
    if (this.loaded && !force) {
      return;
    }

    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = fetch(this.apiUrl('/api/bootstrap'), {
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
    this.systemSettings = data.systemSettings ?? [];
    this.currentUser = data.currentUser ?? null;
    this.financialSummary = data.financialSummary ?? null;
  }

  private async requestJson<T>(path: string, init: RequestInit, fallbackMessage: string): Promise<T | undefined> {
    const response = await fetch(this.apiUrl(path), {
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
    const response = await fetch(this.apiUrl('/api/auth/login'), {
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
    await fetch(this.apiUrl('/api/auth/logout'), {
      method: 'POST',
      credentials: 'include'
    });

    this.currentUser = null;
    await this.load(true);
  }

  public getUsers(): User[] {
    return this.users;
  }

  public async createUserRecord(userData: {
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    password: string;
    status?: User['status'];
    avatar?: string;
  }): Promise<User> {
    const data = await this.requestJson<User>('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    }, 'Gagal menambahkan user aplikasi');

    if (!data) {
      throw new Error('Gagal menambahkan user aplikasi');
    }

    await this.load(true);
    return data;
  }

  public async updateUserRecord(
    id: string,
    updates: Partial<{
      name: string;
      email: string;
      phone: string;
      role: UserRole;
      password: string;
      status: User['status'];
      avatar?: string;
    }>
  ): Promise<User> {
    const data = await this.requestJson<User>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    }, 'Gagal memperbarui user aplikasi');

    if (!data) {
      throw new Error('Gagal memperbarui user aplikasi');
    }

    await this.load(true);
    return data;
  }

  public async deleteUserRecord(id: string): Promise<void> {
    await this.requestJson<void>(`/api/users/${id}`, {
      method: 'DELETE'
    }, 'Gagal menghapus user aplikasi');

    await this.load(true);
  }

  public getSystemSettings(): SystemSetting[] {
    return this.systemSettings;
  }

  public getSystemSettingValue(key: string): SystemSetting['value'] | undefined {
    return this.systemSettings.find(setting => setting.key === key)?.value;
  }

  public getAppName(): string {
    const appName = this.getSystemSettingValue('app_name');
    if (typeof appName === 'string' && appName.trim()) {
      return appName;
    }

    return 'YatimCare';
  }

  public getAppLogoUrl(): string | undefined {
    const appLogoUrl = this.getSystemSettingValue('app_logo_url');
    if (typeof appLogoUrl === 'string' && appLogoUrl.trim()) {
      return appLogoUrl;
    }

    return undefined;
  }

  public getDonationBankInfo(): { bankName: string; accountNumber: string; accountHolder: string; accountType?: string } | undefined {
    const bankName = this.getSystemSettingValue('donation_bank_name');
    const accountNumber = this.getSystemSettingValue('donation_bank_number');
    const accountHolder = this.getSystemSettingValue('donation_bank_holder');

    if (
      typeof bankName === 'string' && bankName.trim() &&
      typeof accountNumber === 'string' && accountNumber.trim() &&
      typeof accountHolder === 'string' && accountHolder.trim()
    ) {
      return {
        bankName: bankName.trim(),
        accountNumber: accountNumber.trim(),
        accountHolder: accountHolder.trim(),
        accountType: 'Tabungan'
      };
    }

    const firstActiveBank = this.bankAccounts.find(account => account.isActive);
    if (firstActiveBank) {
      return {
        bankName: firstActiveBank.bankName,
        accountNumber: firstActiveBank.accountNumber,
        accountHolder: firstActiveBank.accountHolder,
        accountType: firstActiveBank.accountType
      };
    }

    return undefined;
  }

  public getDonationBankAccounts(): BankAccount[] {
    const activeBankAccounts = this.bankAccounts.filter(account => account.isActive);
    const primaryAccount = this.getDonationBankInfo();

    const accounts: BankAccount[] = [];

    if (primaryAccount) {
      accounts.push({
        id: 'system-donation-bank',
        bankName: primaryAccount.bankName,
        accountNumber: primaryAccount.accountNumber,
        accountHolder: primaryAccount.accountHolder,
        accountType: primaryAccount.accountType ?? 'Tabungan',
        branch: undefined,
        isActive: true,
        isPublic: true,
        logoUrl: undefined
      });
    }

    for (const account of activeBankAccounts) {
      if (accounts.some((item) => item.accountNumber === account.accountNumber)) {
        continue;
      }

      accounts.push({
        ...account,
        branch: undefined,
        isPublic: true,
        logoUrl: undefined
      });
    }

    return accounts;
  }

  public async updateSystemSetting(
    key: string,
    value: SystemSetting['value'],
    description?: string
  ): Promise<SystemSetting> {
    const data = await this.requestJson<SystemSetting>(`/api/settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value, description })
    }, 'Gagal memperbarui pengaturan sistem');

    if (!data) {
      throw new Error('Gagal memperbarui pengaturan sistem');
    }

    await this.load(true);
    return data;
  }

  public async exportDatabaseBackup(): Promise<DatabaseBackupPayload> {
    const response = await fetch(this.apiUrl('/api/backup'), {
      credentials: 'include'
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload?.message ?? 'Gagal membuat backup database');
    }

    return payload.data as DatabaseBackupPayload;
  }

  public async restoreDatabaseBackup(backupPayload: DatabaseBackupPayload): Promise<void> {
    const response = await fetch(this.apiUrl('/api/backup/restore'), {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(backupPayload)
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload?.message ?? 'Gagal memulihkan backup database');
    }

    await this.load(true);
  }

  // --- NEWS ---
  public async createNewsRecord(newsData: {
    title: string;
    summary: string;
    content: string;
    coverImage?: string;
    publishedAt?: string;
    isPublished?: boolean;
  }): Promise<NewsItem> {
    const data = await this.requestJson<NewsItem>('/api/news', {
      method: 'POST',
      body: JSON.stringify(newsData)
    }, 'Gagal menambahkan konten berita');

    if (!data) {
      throw new Error('Gagal menambahkan konten berita');
    }

    await this.load(true);
    return data;
  }

  public async updateNewsRecord(
    id: string,
    updates: Partial<{
      title: string;
      summary: string;
      content: string;
      coverImage?: string;
      publishedAt?: string;
      isPublished?: boolean;
    }>
  ): Promise<NewsItem> {
    const data = await this.requestJson<NewsItem>(`/api/news/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    }, 'Gagal memperbarui konten berita');

    if (!data) {
      throw new Error('Gagal memperbarui konten berita');
    }

    await this.load(true);
    return data;
  }

  public async deleteNewsRecord(id: string): Promise<void> {
    await this.requestJson<void>(`/api/news/${id}`, {
      method: 'DELETE'
    }, 'Gagal menghapus konten berita');

    await this.load(true);
  }

  // --- CHILDREN ---
  public getChildren(): Child[] {
    return this.children;
  }

  public getChildById(id: string): Child | undefined {
    return this.children.find(c => c.id === id);
  }

  public async createChildRecord(childData: {
    guardianId: string;
    guardianName: string;
    guardianPhone?: string;
    fullName: string;
    nickname?: string;
    birthPlace: string;
    birthDate: string;
    gender: 'L' | 'P';
    orphanCategory: Child['orphanCategory'];
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
    educationLevel: Child['educationLevel'];
    schoolGrade?: string;
    studentNumber?: string;
    healthCondition: string;
    specialNeeds?: string;
    familyMembers: number;
    homeOwnershipStatus: Child['homeOwnershipStatus'];
    status?: Child['status'];
    verificationNotes?: string;
    photoUrl?: string;
    homePhotoUrl?: string;
  }): Promise<Child> {
    const data = await this.requestJson<Child>('/api/children', {
      method: 'POST',
      body: JSON.stringify(childData)
    }, 'Gagal menambahkan data anak');

    if (!data) {
      throw new Error('Gagal menambahkan data anak');
    }

    await this.load(true);
    return data;
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

  public async createDonorRecord(donorData: {
    fullName: string;
    donorType: DonorType;
    institutionName?: string;
    email: string;
    phone: string;
    address?: string;
    isAnonymousDefault?: boolean;
    isRecurringDonor?: boolean;
  }): Promise<Donor> {
    const data = await this.requestJson<Donor>('/api/donors', {
      method: 'POST',
      body: JSON.stringify(donorData)
    }, 'Gagal menambahkan data donatur');

    if (!data) {
      throw new Error('Gagal menambahkan data donatur');
    }

    await this.load(true);
    return data;
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

  public async submitDonation(donationData: Omit<Donation, 'id' | 'transactionNumber' | 'paymentStatus' | 'donatedAt'>): Promise<Donation> {
    const data = await this.requestJson<Donation>('/api/public/donations', {
      method: 'POST',
      body: JSON.stringify(donationData)
    }, 'Gagal mengirim donasi');

    if (!data) {
      throw new Error('Gagal mengirim donasi');
    }

    await this.load(true);
    return data;
  }

  public async verifyDonation(id: string, status: 'berhasil' | 'ditolak'): Promise<Donation> {
    const data = await this.requestJson<Donation>(`/api/donations/${id}/verify`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }, 'Gagal memverifikasi donasi');

    if (!data) {
      throw new Error('Gagal memverifikasi donasi');
    }

    await this.load(true);
    return data;
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

  public async createProgramRecord(programData: {
    title: string;
    category: ProgramCategory;
    description: string;
    targetAmount: number;
    startDate: string;
    endDate: string;
    thumbnail: string;
    status?: ProgramStatus;
    isFeatured?: boolean;
  }): Promise<Program> {
    const data = await this.requestJson<Program>('/api/programs', {
      method: 'POST',
      body: JSON.stringify(programData)
    }, 'Gagal menambahkan program donasi');

    if (!data) {
      throw new Error('Gagal menambahkan program donasi');
    }

    await this.load(true);
    return data;
  }

  public async updateProgramRecord(
    id: string,
    updates: Partial<{
      title: string;
      category: ProgramCategory;
      description: string;
      targetAmount: number;
      startDate: string;
      endDate: string;
      thumbnail: string;
      status: ProgramStatus;
      isFeatured: boolean;
    }>
  ): Promise<Program> {
    const data = await this.requestJson<Program>(`/api/programs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    }, 'Gagal memperbarui program donasi');

    if (!data) {
      throw new Error('Gagal memperbarui program donasi');
    }

    await this.load(true);
    return data;
  }

  public async deleteProgramRecord(id: string): Promise<void> {
    await this.requestJson<void>(`/api/programs/${id}`, {
      method: 'DELETE'
    }, 'Gagal menghapus program donasi');

    await this.load(true);
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

  public async createBankAccountRecord(bankData: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    accountType: string;
    isActive?: boolean;
  }): Promise<BankAccount> {
    const data = await this.requestJson<BankAccount>('/api/bank-accounts', {
      method: 'POST',
      body: JSON.stringify(bankData)
    }, 'Gagal menambahkan rekening donasi');

    if (!data) {
      throw new Error('Gagal menambahkan rekening donasi');
    }

    await this.load(true);
    return data;
  }

  public async updateBankAccountRecord(
    id: string,
    updates: Partial<{
      bankName: string;
      accountNumber: string;
      accountHolder: string;
      accountType: string;
      isActive: boolean;
    }>
  ): Promise<BankAccount> {
    const data = await this.requestJson<BankAccount>(`/api/bank-accounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    }, 'Gagal memperbarui rekening donasi');

    if (!data) {
      throw new Error('Gagal memperbarui rekening donasi');
    }

    await this.load(true);
    return data;
  }

  public async deleteBankAccountRecord(id: string): Promise<void> {
    await this.requestJson<void>(`/api/bank-accounts/${id}`, {
      method: 'DELETE'
    }, 'Gagal menghapus rekening donasi');

    await this.load(true);
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
