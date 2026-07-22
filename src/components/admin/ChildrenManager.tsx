import React, { useState } from 'react';
import { db } from '../../services/dbStore';
import { Child, VerificationStatus, OrphanCategory } from '../../types';
import { PrintReceiptModal } from '../common/PrintReceiptModal';
import { exportToCSV, exportToPDF } from '../../utils/exportUtils';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  Eye,
  FileText,
  AlertTriangle,
  PlusCircle,
  MapPin,
  ShieldCheck,
  Edit,
  Trash2,
  X,
  Download,
  FileSpreadsheet
} from 'lucide-react';

interface ChildrenManagerProps {
  onRefreshData: () => void;
}

export const ChildrenManager: React.FC<ChildrenManagerProps> = ({ onRefreshData }) => {
  const childrenList = db.getChildren();
  const guardiansList = db.getGuardians();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [isCreateChildModalOpen, setIsCreateChildModalOpen] = useState(false);
  const [selectedChildForModal, setSelectedChildForModal] = useState<Child | null>(null);
  const [selectedChildForEdit, setSelectedChildForEdit] = useState<Child | null>(null);
  const [selectedChildForPrint, setSelectedChildForPrint] = useState<Child | undefined>(undefined);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const [verificationNotes, setVerificationNotes] = useState('');
  const [childCreateForm, setChildCreateForm] = useState({
    guardianId: '',
    guardianName: '',
    guardianPhone: '',
    fullName: '',
    nickname: '',
    birthPlace: '',
    birthDate: '',
    gender: 'L' as 'L' | 'P',
    orphanCategory: 'yatim' as OrphanCategory,
    nik: '',
    familyCardNumber: '',
    birthCertificateNumber: '',
    address: '',
    rt: '00',
    rw: '00',
    province: 'Jawa Barat',
    city: 'Sumedang',
    district: '',
    village: '',
    postalCode: '',
    latitude: '0',
    longitude: '0',
    schoolName: '',
    educationLevel: 'SD',
    schoolGrade: '',
    studentNumber: '',
    healthCondition: '',
    specialNeeds: '',
    familyMembers: '1',
    homeOwnershipStatus: 'Menumpang',
    status: 'diajukan' as VerificationStatus,
    verificationNotes: '',
    photoUrl: '',
    homePhotoUrl: ''
  });
  const [childEditForm, setChildEditForm] = useState({
    fullName: '',
    guardianName: '',
    guardianPhone: '',
    orphanCategory: 'yatim' as OrphanCategory,
    schoolName: '',
    schoolGrade: '',
    address: '',
    village: '',
    district: '',
    status: 'menunggu_verifikasi' as VerificationStatus,
    verificationNotes: ''
  });

  const filteredChildren = childrenList.filter(child => {
    const matchesSearch =
      child.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      child.nik.includes(searchTerm) ||
      child.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      child.schoolName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = filterCategory === 'all' || child.orphanCategory === filterCategory;
    const matchesStatus = filterStatus === 'all' || child.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const initializeChildCreateForm = () => {
    const defaultGuardian = guardiansList[0];
    setChildCreateForm({
      guardianId: defaultGuardian?.id ?? '',
      guardianName: defaultGuardian?.fullName ?? '',
      guardianPhone: defaultGuardian?.phone ?? '',
      fullName: '',
      nickname: '',
      birthPlace: '',
      birthDate: '',
      gender: 'L',
      orphanCategory: 'yatim',
      nik: '',
      familyCardNumber: '',
      birthCertificateNumber: '',
      address: '',
      rt: '00',
      rw: '00',
      province: 'Jawa Barat',
      city: 'Sumedang',
      district: defaultGuardian?.district ?? '',
      village: defaultGuardian?.village ?? '',
      postalCode: defaultGuardian?.postalCode ?? '',
      latitude: '0',
      longitude: '0',
      schoolName: '',
      educationLevel: 'SD',
      schoolGrade: '',
      studentNumber: '',
      healthCondition: '',
      specialNeeds: '',
      familyMembers: '1',
      homeOwnershipStatus: 'Menumpang',
      status: 'diajukan',
      verificationNotes: '',
      photoUrl: '',
      homePhotoUrl: ''
    });
  };

  const openCreateChildModal = () => {
    if (guardiansList.length === 0) {
      alert('Data wali belum tersedia. Tambahkan data wali terlebih dahulu.');
      return;
    }

    initializeChildCreateForm();
    setIsCreateChildModalOpen(true);
  };

  const closeCreateChildModal = () => {
    setIsCreateChildModalOpen(false);
  };

  const handleChildGuardianChange = (guardianId: string) => {
    const guardian = guardiansList.find(item => item.id === guardianId);
    setChildCreateForm(prev => ({
      ...prev,
      guardianId,
      guardianName: guardian?.fullName ?? '',
      guardianPhone: guardian?.phone ?? '',
      district: guardian?.district ?? prev.district,
      village: guardian?.village ?? prev.village,
      postalCode: guardian?.postalCode ?? prev.postalCode
    }));
  };

  const handleCreateChild = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await db.createChildRecord({
        guardianId: childCreateForm.guardianId,
        guardianName: childCreateForm.guardianName,
        guardianPhone: childCreateForm.guardianPhone || undefined,
        fullName: childCreateForm.fullName,
        nickname: childCreateForm.nickname || undefined,
        birthPlace: childCreateForm.birthPlace,
        birthDate: childCreateForm.birthDate,
        gender: childCreateForm.gender,
        orphanCategory: childCreateForm.orphanCategory,
        nik: childCreateForm.nik,
        familyCardNumber: childCreateForm.familyCardNumber,
        birthCertificateNumber: childCreateForm.birthCertificateNumber || undefined,
        address: childCreateForm.address,
        rt: childCreateForm.rt,
        rw: childCreateForm.rw,
        province: childCreateForm.province,
        city: childCreateForm.city,
        district: childCreateForm.district,
        village: childCreateForm.village,
        postalCode: childCreateForm.postalCode,
        latitude: Number(childCreateForm.latitude),
        longitude: Number(childCreateForm.longitude),
        schoolName: childCreateForm.schoolName,
        educationLevel: childCreateForm.educationLevel as Child['educationLevel'],
        schoolGrade: childCreateForm.schoolGrade || undefined,
        studentNumber: childCreateForm.studentNumber || undefined,
        healthCondition: childCreateForm.healthCondition,
        specialNeeds: childCreateForm.specialNeeds || undefined,
        familyMembers: Number(childCreateForm.familyMembers),
        homeOwnershipStatus: childCreateForm.homeOwnershipStatus as Child['homeOwnershipStatus'],
        status: childCreateForm.status,
        verificationNotes: childCreateForm.verificationNotes || undefined,
        photoUrl: childCreateForm.photoUrl || undefined,
        homePhotoUrl: childCreateForm.homePhotoUrl || undefined
      });

      onRefreshData();
      setIsCreateChildModalOpen(false);
      alert('Data anak berhasil ditambahkan.');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Gagal menambahkan data anak');
    }
  };

  const openEditChildModal = (child: Child) => {
    setChildEditForm({
      fullName: child.fullName,
      guardianName: child.guardianName,
      guardianPhone: child.guardianPhone || '',
      orphanCategory: child.orphanCategory,
      schoolName: child.schoolName,
      schoolGrade: child.schoolGrade || '',
      address: child.address,
      village: child.village,
      district: child.district,
      status: child.status,
      verificationNotes: child.verificationNotes || ''
    });
    setSelectedChildForEdit(child);
  };

  const closeEditChildModal = () => {
    setSelectedChildForEdit(null);
  };

  const handleVerify = async (childId: string, status: 'aktif' | 'ditolak' | 'perlu_perbaikan') => {
    try {
      await db.verifyChildRecord(childId, status, verificationNotes || `Status diperbarui menjadi ${status}`);
      onRefreshData();
      setSelectedChildForModal(null);
      setVerificationNotes('');
      alert(`Status verifikasi anak berhasil diubah menjadi: ${status.toUpperCase()}`);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Gagal memperbarui status anak');
    }
  };

  const handleSaveChildEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChildForEdit) {
      return;
    }

    try {
      await db.updateChildRecord(selectedChildForEdit.id, {
        fullName: childEditForm.fullName,
        guardianName: childEditForm.guardianName,
        guardianPhone: childEditForm.guardianPhone,
        orphanCategory: childEditForm.orphanCategory,
        schoolName: childEditForm.schoolName,
        schoolGrade: childEditForm.schoolGrade,
        address: childEditForm.address,
        village: childEditForm.village,
        district: childEditForm.district,
        status: childEditForm.status,
        verificationNotes: childEditForm.verificationNotes
      });

      onRefreshData();
      setSelectedChildForEdit(null);
      alert('Data anak berhasil diperbarui.');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Gagal memperbarui data anak');
    }
  };

  const handleDeleteChild = async (child: Child) => {
    const confirmDelete = confirm(`Hapus data anak "${child.fullName}"? Tindakan ini tidak bisa dibatalkan.`);
    if (!confirmDelete) {
      return;
    }

    try {
      await db.deleteChildRecord(child.id);
      onRefreshData();
      setSelectedChildForModal(null);
      alert('Data anak berhasil dihapus.');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Gagal menghapus data anak');
    }
  };

  const handlePrintBiodata = (child: Child) => {
    setSelectedChildForPrint(child);
    setIsPrintModalOpen(true);
  };

  const handleExportCSV = () => {
    const headers = [
      'No Registrasi',
      'Nama Lengkap',
      'NIK',
      'Nomor KK',
      'Kategori',
      'Jenis Kelamin',
      'Jenjang Pendidikan',
      'Sekolah',
      'Kelas',
      'Nama Wali',
      'Kontak Wali',
      'Alamat',
      'Kecamatan/Desa',
      'Status Verifikasi'
    ];

    const rows = filteredChildren.map(c => [
      c.registrationNumber,
      c.fullName,
      c.nik,
      c.familyCardNumber,
      c.orphanCategory === 'yatim' ? 'Yatim' : c.orphanCategory === 'piatu' ? 'Piatu' : 'Yatim Piatu',
      c.gender === 'L' ? 'Laki-Laki' : 'Perempuan',
      c.educationLevel,
      c.schoolName,
      c.schoolGrade,
      c.guardianName,
      c.guardianPhone,
      c.address,
      `${c.district}/${c.village}`,
      c.status === 'aktif' ? 'Terverifikasi Aktif' : c.status === 'menunggu_verifikasi' ? 'Menunggu Verifikasi' : c.status === 'perlu_perbaikan' ? 'Perlu Perbaikan' : 'Ditolak'
    ]);

    exportToCSV('Data_Anak_Binaan_YatimCare', headers, rows);
  };

  const handleExportPDF = () => {
    const headers = [
      'No Reg',
      'Nama Anak',
      'Kategori',
      'Pendidikan',
      'Sekolah',
      'Nama Wali',
      'Kontak Wali',
      'Status'
    ];

    const rows = filteredChildren.map(c => [
      c.registrationNumber,
      c.fullName,
      c.orphanCategory === 'yatim' ? 'Yatim' : c.orphanCategory === 'piatu' ? 'Piatu' : 'Yatim Piatu',
      c.educationLevel,
      `${c.schoolName} (${c.schoolGrade})`,
      c.guardianName,
      c.guardianPhone,
      c.status === 'aktif' ? 'Aktif' : c.status === 'menunggu_verifikasi' ? 'Pending' : c.status === 'perlu_perbaikan' ? 'Perbaikan' : 'Ditolak'
    ]);

    const summary = [
      { label: 'Total Anak Terdata', value: `${filteredChildren.length} Anak` },
      { label: 'Terverifikasi Aktif', value: `${filteredChildren.filter(c => c.status === 'aktif').length} Anak` },
      { label: 'Menunggu Verifikasi', value: `${filteredChildren.filter(c => c.status === 'menunggu_verifikasi').length} Anak` }
    ];

    exportToPDF(
      'LAPORAN DATA ANAK BINAAN YATIM & PIATU',
      'Rekapitulasi Data Anak Penerima Manfaat Yayasan YatimCare Sumedang',
      headers,
      rows,
      summary
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Search & Filter Controls */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif font-bold text-xl text-slate-900">Manajemen & Verifikasi Data Anak Yatim/Piatu</h2>
            <p className="text-xs text-slate-500">Mendata, memeriksa kelengkapan berkas kependudukan, dan menyetujui penerima manfaat.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800">
              Total: {childrenList.length} Anak
            </span>
            <span className="px-3 py-1.5 rounded-full bg-amber-100 text-amber-800">
              Menunggu: {childrenList.filter(c => c.status === 'menunggu_verifikasi').length}
            </span>

            <button
              onClick={openCreateChildModal}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="Tambah Data Anak"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Tambah Anak</span>
            </button>

            {/* Export Action Buttons */}
            <div className="flex items-center gap-1.5 ml-0 sm:ml-2">
              <button
                onClick={handleExportCSV}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                title="Ekspor ke Excel / CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Export Excel</span>
              </button>

              <button
                onClick={handleExportPDF}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                title="Ekspor ke PDF / Print"
              >
                <Printer className="w-3.5 h-3.5 text-amber-300" />
                <span>Export PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari Nama, NIK, KK, atau No Reg..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          >
            <option value="all">Semua Kategori Yatim/Piatu</option>
            <option value="yatim">Yatim (Ayah Meninggal)</option>
            <option value="piatu">Piatu (Ibu Meninggal)</option>
            <option value="yatim_piatu">Yatim Piatu (Ayah & Ibu)</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          >
            <option value="all">Semua Status Verifikasi</option>
            <option value="aktif">Terverifikasi Aktif</option>
            <option value="menunggu_verifikasi">Menunggu Verifikasi</option>
            <option value="perlu_perbaikan">Perlu Perbaikan</option>
            <option value="ditolak">Ditolak</option>
          </select>
        </div>
      </div>

      {/* Children Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider bg-slate-50">
                <th className="p-3.5 rounded-l-xl">No. Registrasi / NIK</th>
                <th className="p-3.5">Nama Anak</th>
                <th className="p-3.5">Kategori</th>
                <th className="p-3.5">Sekolah / Kelas</th>
                <th className="p-3.5">Wali / Kontak</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right rounded-r-xl">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filteredChildren.map(child => (
                <tr key={child.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5">
                    <p className="font-mono font-bold text-slate-900">{child.registrationNumber}</p>
                    <p className="text-[10px] text-slate-400 font-mono">NIK: {child.nik}</p>
                  </td>

                  <td className="p-3.5">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={child.photoUrl}
                        alt={child.fullName}
                        className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-200"
                      />
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{child.fullName}</p>
                        <p className="text-[10px] text-slate-500">{child.birthPlace}, {child.birthDate}</p>
                      </div>
                    </div>
                  </td>

                  <td className="p-3.5">
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                      {child.orphanCategory.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="p-3.5">
                    <p className="font-semibold text-slate-800">{child.schoolName}</p>
                    <p className="text-[10px] text-slate-500">{child.educationLevel} • {child.schoolGrade}</p>
                  </td>

                  <td className="p-3.5">
                    <p className="font-bold text-slate-900">{child.guardianName}</p>
                    <p className="text-[10px] text-slate-500">{child.guardianPhone}</p>
                  </td>

                  <td className="p-3.5">
                    {child.status === 'aktif' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        Aktif
                      </span>
                    )}
                    {child.status === 'menunggu_verifikasi' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                        <Clock className="w-3 h-3" />
                        Menunggu
                      </span>
                    )}
                    {child.status === 'ditolak' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                        <XCircle className="w-3 h-3" />
                        Ditolak
                      </span>
                    )}
                  </td>

                  <td className="p-3.5 text-right space-x-1">
                    <button
                      onClick={() => setSelectedChildForModal(child)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      Detail / Verifikasi
                    </button>
                    <button
                      onClick={() => openEditChildModal(child)}
                      className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                      title="Ubah Data"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteChild(child)}
                      className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                      title="Hapus Data"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handlePrintBiodata(child)}
                      className="px-2 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                      title="Cetak Biodata"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Child Modal */}
      {isCreateChildModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <form onSubmit={handleCreateChild} className="bg-white rounded-3xl max-w-5xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-serif font-bold text-lg text-slate-900">Tambah Data Anak</h3>
                <p className="text-xs text-slate-500">Isi data dasar anak dan wali agar langsung tersimpan ke database.</p>
              </div>
              <button
                type="button"
                onClick={closeCreateChildModal}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                aria-label="Tutup Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <label className="space-y-1.5 lg:col-span-2">
                <span className="font-bold text-slate-700">Wali / Guardian</span>
                <select
                  value={childCreateForm.guardianId}
                  onChange={(e) => handleChildGuardianChange(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  {guardiansList.map(guardian => (
                    <option key={guardian.id} value={guardian.id}>
                      {guardian.fullName} - {guardian.relationship}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1.5">
                <span className="font-bold text-slate-700">Nama Wali</span>
                <input
                  value={childCreateForm.guardianName}
                  onChange={(e) => setChildCreateForm(prev => ({ ...prev, guardianName: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </label>
              <label className="space-y-1.5">
                <span className="font-bold text-slate-700">Kontak Wali</span>
                <input
                  value={childCreateForm.guardianPhone}
                  onChange={(e) => setChildCreateForm(prev => ({ ...prev, guardianPhone: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </label>
              <label className="space-y-1.5 lg:col-span-2">
                <span className="font-bold text-slate-700">Nama Anak</span>
                <input
                  value={childCreateForm.fullName}
                  onChange={(e) => setChildCreateForm(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </label>
              <label className="space-y-1.5">
                <span className="font-bold text-slate-700">Nama Panggilan</span>
                <input
                  value={childCreateForm.nickname}
                  onChange={(e) => setChildCreateForm(prev => ({ ...prev, nickname: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </label>
              <label className="space-y-1.5">
                <span className="font-bold text-slate-700">Tempat Lahir</span>
                <input
                  value={childCreateForm.birthPlace}
                  onChange={(e) => setChildCreateForm(prev => ({ ...prev, birthPlace: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </label>
              <label className="space-y-1.5">
                <span className="font-bold text-slate-700">Tanggal Lahir</span>
                <input
                  type="date"
                  value={childCreateForm.birthDate}
                  onChange={(e) => setChildCreateForm(prev => ({ ...prev, birthDate: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </label>
              <label className="space-y-1.5">
                <span className="font-bold text-slate-700">Jenis Kelamin</span>
                <select
                  value={childCreateForm.gender}
                  onChange={(e) => setChildCreateForm(prev => ({ ...prev, gender: e.target.value as 'L' | 'P' }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </label>
              <label className="space-y-1.5">
                <span className="font-bold text-slate-700">Kategori</span>
                <select
                  value={childCreateForm.orphanCategory}
                  onChange={(e) => setChildCreateForm(prev => ({ ...prev, orphanCategory: e.target.value as OrphanCategory }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="yatim">Yatim</option>
                  <option value="piatu">Piatu</option>
                  <option value="yatim_piatu">Yatim Piatu</option>
                </select>
              </label>
              <label className="space-y-1.5">
                <span className="font-bold text-slate-700">NIK</span>
                <input
                  value={childCreateForm.nik}
                  onChange={(e) => setChildCreateForm(prev => ({ ...prev, nik: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </label>
              <label className="space-y-1.5">
                <span className="font-bold text-slate-700">No KK</span>
                <input
                  value={childCreateForm.familyCardNumber}
                  onChange={(e) => setChildCreateForm(prev => ({ ...prev, familyCardNumber: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </label>
              <label className="space-y-1.5 lg:col-span-3">
                <span className="font-bold text-slate-700">Alamat</span>
                <textarea
                  rows={3}
                  value={childCreateForm.address}
                  onChange={(e) => setChildCreateForm(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </label>
              <label className="space-y-1.5">
                <span className="font-bold text-slate-700">RT</span>
                <input
                  value={childCreateForm.rt}
                  onChange={(e) => setChildCreateForm(prev => ({ ...prev, rt: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </label>
              <label className="space-y-1.5">
                <span className="font-bold text-slate-700">RW</span>
                <input
                  value={childCreateForm.rw}
                  onChange={(e) => setChildCreateForm(prev => ({ ...prev, rw: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </label>
              <label className="space-y-1.5">
                <span className="font-bold text-slate-700">Provinsi</span>
                <input
                  value={childCreateForm.province}
                  onChange={(e) => setChildCreateForm(prev => ({ ...prev, province: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </label>
              <label className="space-y-1.5">
                <span className="font-bold text-slate-700">Kota / Kabupaten</span>
                <input
                  value={childCreateForm.city}
                  onChange={(e) => setChildCreateForm(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </label>
              <label className="space-y-1.5">
                <span className="font-bold text-slate-700">Kecamatan</span>
                <input
                  value={childCreateForm.district}
                  onChange={(e) => setChildCreateForm(prev => ({ ...prev, district: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </label>
              <label className="space-y-1.5">
                <span className="font-bold text-slate-700">Desa / Kelurahan</span>
                <input
                  value={childCreateForm.village}
                  onChange={(e) => setChildCreateForm(prev => ({ ...prev, village: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </label>
              <label className="space-y-1.5">
                <span className="font-bold text-slate-700">Kode Pos</span>
                <input
                  value={childCreateForm.postalCode}
                  onChange={(e) => setChildCreateForm(prev => ({ ...prev, postalCode: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </label>
              <label className="space-y-1.5">
                <span className="font-bold text-slate-700">Latitude</span>
                <input
                  value={childCreateForm.latitude}
                  onChange={(e) => setChildCreateForm(prev => ({ ...prev, latitude: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </label>
              <label className="space-y-1.5">
                <span className="font-bold text-slate-700">Longitude</span>
                <input
                  value={childCreateForm.longitude}
                  onChange={(e) => setChildCreateForm(prev => ({ ...prev, longitude: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </label>
              <label className="space-y-1.5">
                <span className="font-bold text-slate-700">Sekolah</span>
                <input
                  value={childCreateForm.schoolName}
                  onChange={(e) => setChildCreateForm(prev => ({ ...prev, schoolName: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </label>
              <label className="space-y-1.5">
                <span className="font-bold text-slate-700">Jenjang</span>
                <select
                  value={childCreateForm.educationLevel}
                  onChange={(e) => setChildCreateForm(prev => ({ ...prev, educationLevel: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="Belum Sekolah">Belum Sekolah</option>
                  <option value="TK">TK</option>
                  <option value="SD">SD</option>
                  <option value="SMP">SMP</option>
                  <option value="SMA/K">SMA/K</option>
                  <option value="Perguruan Tinggi">Perguruan Tinggi</option>
                </select>
              </label>
              <label className="space-y-1.5">
                <span className="font-bold text-slate-700">Kelas</span>
                <input
                  value={childCreateForm.schoolGrade}
                  onChange={(e) => setChildCreateForm(prev => ({ ...prev, schoolGrade: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </label>
              <label className="space-y-1.5">
                <span className="font-bold text-slate-700">Kondisi Kesehatan</span>
                <input
                  value={childCreateForm.healthCondition}
                  onChange={(e) => setChildCreateForm(prev => ({ ...prev, healthCondition: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </label>
              <label className="space-y-1.5">
                <span className="font-bold text-slate-700">Jumlah Keluarga</span>
                <input
                  type="number"
                  min="1"
                  value={childCreateForm.familyMembers}
                  onChange={(e) => setChildCreateForm(prev => ({ ...prev, familyMembers: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </label>
              <label className="space-y-1.5">
                <span className="font-bold text-slate-700">Status Hunian</span>
                <select
                  value={childCreateForm.homeOwnershipStatus}
                  onChange={(e) => setChildCreateForm(prev => ({ ...prev, homeOwnershipStatus: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="Milik Sendiri">Milik Sendiri</option>
                  <option value="Sewa">Sewa</option>
                  <option value="Menumpang">Menumpang</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </label>
              <label className="sm:col-span-3 space-y-1.5">
                <span className="font-bold text-slate-700">Catatan Verifikasi</span>
                <textarea
                  rows={3}
                  value={childCreateForm.verificationNotes}
                  onChange={(e) => setChildCreateForm(prev => ({ ...prev, verificationNotes: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </label>
            </div>

            <div className="flex gap-2 pt-2 text-xs">
              <button
                type="button"
                onClick={closeCreateChildModal}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Simpan Anak
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Verification & Detail Modal */}
      {selectedChildForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <img
                  src={selectedChildForModal.photoUrl}
                  alt={selectedChildForModal.fullName}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs"
                />
                <div>
                  <h3 className="font-serif font-bold text-lg text-slate-900">{selectedChildForModal.fullName}</h3>
                  <p className="text-xs text-slate-500 font-mono">{selectedChildForModal.registrationNumber} • NIK: {selectedChildForModal.nik}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedChildForModal(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                title="Tutup Modal"
                aria-label="Tutup Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <span className="text-slate-500 font-medium">Kategori Yatim:</span>
                <p className="font-bold text-slate-900 uppercase mt-0.5">{selectedChildForModal.orphanCategory.replace('_', ' ')}</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Tempat, Tgl Lahir:</span>
                <p className="font-bold text-slate-900 mt-0.5">{selectedChildForModal.birthPlace}, {selectedChildForModal.birthDate}</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Sekolah / Pendidikan:</span>
                <p className="font-bold text-slate-900 mt-0.5">{selectedChildForModal.schoolName} ({selectedChildForModal.schoolGrade})</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Wali / Pengasuh:</span>
                <p className="font-bold text-slate-900 mt-0.5">{selectedChildForModal.guardianName} ({selectedChildForModal.guardianPhone})</p>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 font-medium">Alamat Lengkap Tempat Tinggal:</span>
                <p className="font-bold text-slate-900 mt-0.5">
                  {selectedChildForModal.address}, Desa {selectedChildForModal.village}, Kecamatan {selectedChildForModal.district}, {selectedChildForModal.city}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block font-bold text-slate-800">Catatan Verifikasi Admin / Hasil Survei Lapangan:</label>
              <textarea
                rows={2}
                placeholder="Masukkan pertimbangan kelayakan penerima bantuan..."
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div className="flex gap-2 pt-2 text-xs">
              <button
                type="button"
                onClick={() => setSelectedChildForModal(null)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
              >
                Tutup
              </button>
              <button
                onClick={() => handleVerify(selectedChildForModal.id, 'aktif')}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Setujui & Verifikasi Aktif
              </button>
              <button
                onClick={() => handleVerify(selectedChildForModal.id, 'perlu_perbaikan')}
                className="py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Perlu Perbaikan
              </button>
              <button
                onClick={() => handleVerify(selectedChildForModal.id, 'ditolak')}
                className="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Tolak
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Child Modal */}
      {selectedChildForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <form onSubmit={handleSaveChildEdit} className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-serif font-bold text-lg text-slate-900">Ubah Data Anak</h3>
                <p className="text-xs text-slate-500">Perbarui data inti yang tampil di portal admin.</p>
              </div>
              <button
                type="button"
                onClick={closeEditChildModal}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                title="Tutup Modal"
                aria-label="Tutup Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <label className="space-y-1.5">
                <span className="font-bold text-slate-700">Nama Anak</span>
                <input
                  value={childEditForm.fullName}
                  onChange={(e) => setChildEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </label>
              <label className="space-y-1.5">
                <span className="font-bold text-slate-700">Kategori</span>
                <select
                  value={childEditForm.orphanCategory}
                  onChange={(e) => setChildEditForm(prev => ({ ...prev, orphanCategory: e.target.value as OrphanCategory }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="yatim">Yatim</option>
                  <option value="piatu">Piatu</option>
                  <option value="yatim_piatu">Yatim Piatu</option>
                </select>
              </label>
              <label className="space-y-1.5">
                <span className="font-bold text-slate-700">Nama Wali</span>
                <input
                  value={childEditForm.guardianName}
                  onChange={(e) => setChildEditForm(prev => ({ ...prev, guardianName: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </label>
              <label className="space-y-1.5">
                <span className="font-bold text-slate-700">Kontak Wali</span>
                <input
                  value={childEditForm.guardianPhone}
                  onChange={(e) => setChildEditForm(prev => ({ ...prev, guardianPhone: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </label>
              <label className="space-y-1.5">
                <span className="font-bold text-slate-700">Sekolah</span>
                <input
                  value={childEditForm.schoolName}
                  onChange={(e) => setChildEditForm(prev => ({ ...prev, schoolName: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </label>
              <label className="space-y-1.5">
                <span className="font-bold text-slate-700">Kelas</span>
                <input
                  value={childEditForm.schoolGrade}
                  onChange={(e) => setChildEditForm(prev => ({ ...prev, schoolGrade: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </label>
              <label className="sm:col-span-2 space-y-1.5">
                <span className="font-bold text-slate-700">Alamat</span>
                <textarea
                  value={childEditForm.address}
                  onChange={(e) => setChildEditForm(prev => ({ ...prev, address: e.target.value }))}
                  rows={3}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </label>
              <label className="space-y-1.5">
                <span className="font-bold text-slate-700">Desa</span>
                <input
                  value={childEditForm.village}
                  onChange={(e) => setChildEditForm(prev => ({ ...prev, village: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </label>
              <label className="space-y-1.5">
                <span className="font-bold text-slate-700">Kecamatan</span>
                <input
                  value={childEditForm.district}
                  onChange={(e) => setChildEditForm(prev => ({ ...prev, district: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </label>
              <label className="space-y-1.5">
                <span className="font-bold text-slate-700">Status</span>
                <select
                  value={childEditForm.status}
                  onChange={(e) => setChildEditForm(prev => ({ ...prev, status: e.target.value as VerificationStatus }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="menunggu_verifikasi">Menunggu Verifikasi</option>
                  <option value="aktif">Aktif</option>
                  <option value="perlu_perbaikan">Perlu Perbaikan</option>
                  <option value="ditolak">Ditolak</option>
                </select>
              </label>
              <label className="sm:col-span-2 space-y-1.5">
                <span className="font-bold text-slate-700">Catatan Verifikasi</span>
                <textarea
                  value={childEditForm.verificationNotes}
                  onChange={(e) => setChildEditForm(prev => ({ ...prev, verificationNotes: e.target.value }))}
                  rows={3}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </label>
            </div>

            <div className="flex gap-2 pt-2 text-xs">
              <button
                type="button"
                onClick={closeEditChildModal}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Printable Biodata Modal */}
      <PrintReceiptModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        child={selectedChildForPrint}
      />

    </div>
  );
};
