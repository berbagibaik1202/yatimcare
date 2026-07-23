import React, { useMemo, useRef, useState } from 'react';
import { db } from '../../services/dbStore';
import { Program, ProgramCategory, ProgramStatus } from '../../types';
import {
  BookOpen,
  Search,
  PlusCircle,
  Edit,
  Trash2,
  X,
  Save,
  Image,
  Sparkles,
  Calendar,
  AlertTriangle,
  Heart,
  DollarSign,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { ImageWithFallback } from '../common/ImageWithFallback';

interface ProgramsManagerProps {
  onRefreshData: () => void;
}

type ProgramFormState = {
  title: string;
  category: ProgramCategory;
  description: string;
  targetAmount: string;
  startDate: string;
  endDate: string;
  thumbnail: string;
  status: ProgramStatus;
  isFeatured: boolean;
};

const categoryLabels: Record<ProgramCategory, string> = {
  pendidikan: 'Pendidikan',
  kesehatan: 'Kesehatan',
  santunan: 'Santunan',
  sembako: 'Sembako',
  pembangunan: 'Pembangunan',
  darurat: 'Darurat'
};

const statusLabels: Record<ProgramStatus, string> = {
  aktif: 'Aktif',
  selesai: 'Selesai',
  draft: 'Draft',
  dihentikan: 'Dihentikan'
};

const defaultThumbnail = 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80';

function formatDateInput(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}

export const ProgramsManager: React.FC<ProgramsManagerProps> = ({ onRefreshData }) => {
  const programs = db.getPrograms();
  const donations = db.getDonations();
  const expenses = db.getExpenses();
  const aidDistributions = db.getAidDistributions();
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProgramForEdit, setSelectedProgramForEdit] = useState<Program | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formState, setFormState] = useState<ProgramFormState>({
    title: '',
    category: 'santunan',
    description: '',
    targetAmount: '0',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().slice(0, 10),
    thumbnail: defaultThumbnail,
    status: 'aktif',
    isFeatured: true
  });

  const programUsage = useMemo(() => {
    const donationCounts = donations.reduce<Record<string, number>>((acc, donation) => {
      acc[donation.programId] = (acc[donation.programId] ?? 0) + 1;
      return acc;
    }, {});

    const expenseCounts = expenses.reduce<Record<string, number>>((acc, expense) => {
      if (!expense.programId) {
        return acc;
      }
      acc[expense.programId] = (acc[expense.programId] ?? 0) + 1;
      return acc;
    }, {});

    const aidCounts = aidDistributions.reduce<Record<string, number>>((acc, aid) => {
      if (!aid.programId) {
        return acc;
      }
      acc[aid.programId] = (acc[aid.programId] ?? 0) + 1;
      return acc;
    }, {});

    return programs.map(program => {
      const donationCount = donationCounts[program.id] ?? 0;
      const expenseCount = expenseCounts[program.id] ?? 0;
      const aidCount = aidCounts[program.id] ?? 0;

      return {
        program,
        donationCount,
        expenseCount,
        aidCount,
        totalUsage: donationCount + expenseCount + aidCount
      };
    });
  }, [aidDistributions, donations, expenses, programs]);

  const filteredPrograms = useMemo(() => {
    const keyword = searchTerm.toLowerCase();
    return programUsage.filter(({ program }) => {
      const searchableText = [
        program.programCode,
        program.title,
        program.slug,
        program.category,
        program.status,
        program.description
      ].join(' ').toLowerCase();

      return searchableText.includes(keyword);
    });
  }, [programUsage, searchTerm]);

  const summary = useMemo(() => ({
    total: programs.length,
    active: programs.filter(program => program.status === 'aktif').length,
    featured: programs.filter(program => program.isFeatured).length,
    totalTarget: programs.reduce((sum, program) => sum + program.targetAmount, 0)
  }), [programs]);

  const closeModal = () => {
    if (saving) {
      return;
    }

    setIsModalOpen(false);
    setSelectedProgramForEdit(null);
    setFormError(null);
  };

  const handleThumbnailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('File thumbnail harus berupa gambar.');
      e.target.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran gambar terlalu besar. Maksimal 2 MB.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      setFormState(prev => ({ ...prev, thumbnail: result }));
    };
    reader.readAsDataURL(file);
  };

  const handlePickThumbnail = () => {
    thumbnailInputRef.current?.click();
  };

  const handleClearThumbnail = () => {
    setFormState(prev => ({ ...prev, thumbnail: defaultThumbnail }));
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = '';
    }
  };

  const openCreateModal = () => {
    setSelectedProgramForEdit(null);
    setFormError(null);
    setFormState({
      title: '',
      category: 'santunan',
      description: '',
      targetAmount: '0',
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().slice(0, 10),
      thumbnail: defaultThumbnail,
      status: 'aktif',
      isFeatured: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (program: Program) => {
    setSelectedProgramForEdit(program);
    setFormError(null);
    setFormState({
      title: program.title,
      category: program.category,
      description: program.description,
      targetAmount: String(program.targetAmount),
      startDate: formatDateInput(program.startDate),
      endDate: formatDateInput(program.endDate),
      thumbnail: program.thumbnail,
      status: program.status,
      isFeatured: program.isFeatured
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const payload = {
      title: formState.title.trim(),
      category: formState.category,
      description: formState.description.trim(),
      targetAmount: Number(formState.targetAmount),
      startDate: formState.startDate,
      endDate: formState.endDate,
      thumbnail: formState.thumbnail.trim(),
      status: formState.status,
      isFeatured: formState.isFeatured
    };

    if (!payload.title || !payload.description || !payload.thumbnail) {
      setFormError('Semua field utama wajib diisi.');
      return;
    }

    if (!Number.isFinite(payload.targetAmount) || payload.targetAmount <= 0) {
      setFormError('Target dana harus lebih besar dari 0.');
      return;
    }

    if (new Date(payload.endDate) < new Date(payload.startDate)) {
      setFormError('Tanggal akhir program harus setelah tanggal mulai.');
      return;
    }

    try {
      setSaving(true);

      if (selectedProgramForEdit) {
        await db.updateProgramRecord(selectedProgramForEdit.id, payload);
        alert('Program donasi berhasil diperbarui.');
      } else {
        await db.createProgramRecord(payload);
        alert('Program donasi berhasil ditambahkan.');
      }

      onRefreshData();
      closeModal();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Gagal menyimpan program donasi');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (program: Program) => {
    const usage = programUsage.find(item => item.program.id === program.id);
    if ((usage?.totalUsage ?? 0) > 0) {
      alert('Program ini masih digunakan pada transaksi atau penyaluran. Ubah status menjadi dihentikan, bukan dihapus.');
      return;
    }

    const confirmDelete = confirm(`Hapus program "${program.title}"? Tindakan ini tidak bisa dibatalkan.`);
    if (!confirmDelete) {
      return;
    }

    try {
      await db.deleteProgramRecord(program.id);
      onRefreshData();
      alert('Program donasi berhasil dihapus.');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Gagal menghapus program donasi');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif font-bold text-xl text-slate-900">Program Donasi</h2>
            <p className="text-xs text-slate-500">Kelola program penggalangan dana yang tampil di halaman publik dan modal donasi.</p>
          </div>

          <button
            onClick={openCreateModal}
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tambah Program</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
            <p className="text-[11px] uppercase font-bold text-slate-500">Total Program</p>
            <p className="text-2xl font-black text-slate-900">{summary.total}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
            <p className="text-[11px] uppercase font-bold text-slate-500">Program Aktif</p>
            <p className="text-2xl font-black text-emerald-700">{summary.active}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
            <p className="text-[11px] uppercase font-bold text-slate-500">Program Unggulan</p>
            <p className="text-2xl font-black text-amber-700">{summary.featured}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
            <p className="text-[11px] uppercase font-bold text-slate-500">Total Target Dana</p>
            <p className="text-sm font-black text-slate-900">Rp {summary.totalTarget.toLocaleString('id-ID')}</p>
          </div>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari program, kategori, status, atau kode program..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredPrograms.map(({ program, totalUsage, donationCount, expenseCount, aidCount }) => (
          <div key={program.id} className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="relative h-48 bg-slate-100">
              <ImageWithFallback
                src={program.thumbnail}
                alt={program.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/10 to-transparent" />
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <span className="px-2.5 py-1 rounded-full bg-white/90 text-slate-800 text-[10px] font-bold">
                  {program.programCode}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                  {categoryLabels[program.category]}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  program.status === 'aktif'
                    ? 'bg-emerald-100 text-emerald-800'
                    : program.status === 'draft'
                      ? 'bg-amber-100 text-amber-800'
                      : program.status === 'selesai'
                        ? 'bg-sky-100 text-sky-800'
                        : 'bg-rose-100 text-rose-800'
                }`}>
                  {statusLabels[program.status]}
                </span>
              </div>
              {program.isFeatured && (
                <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Unggulan
                </div>
              )}
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="font-serif font-bold text-xl leading-tight">{program.title}</h3>
                <p className="text-[11px] text-slate-100 mt-1 line-clamp-2">{program.description}</p>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3">
                  <p className="text-[10px] uppercase font-bold text-slate-500">Target Dana</p>
                  <p className="font-black text-slate-900">Rp {program.targetAmount.toLocaleString('id-ID')}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3">
                  <p className="text-[10px] uppercase font-bold text-slate-500">Terkumpul</p>
                  <p className="font-black text-emerald-700">Rp {program.collectedAmount.toLocaleString('id-ID')}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3">
                  <p className="text-[10px] uppercase font-bold text-slate-500">Tersalurkan</p>
                  <p className="font-black text-indigo-700">Rp {program.distributedAmount.toLocaleString('id-ID')}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3">
                  <p className="text-[10px] uppercase font-bold text-slate-500">Donatur</p>
                  <p className="font-black text-slate-900">{program.donorCount} orang</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-600">
                <span className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  {new Date(program.startDate).toLocaleDateString('id-ID')} - {new Date(program.endDate).toLocaleDateString('id-ID')}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  {totalUsage} keterkaitan data
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                <div className="text-[11px] text-slate-500 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{donationCount} donasi, {expenseCount} pengeluaran, {aidCount} bantuan</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(program)}
                    className="px-3 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => void handleDelete(program)}
                    disabled={totalUsage > 0}
                    className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    title={totalUsage > 0 ? 'Program masih dipakai pada transaksi atau penyaluran' : 'Hapus program'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredPrograms.length === 0 && (
          <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs text-center text-slate-500">
            <BookOpen className="w-8 h-8 mx-auto text-slate-400 mb-3" />
            <p className="font-semibold">Tidak ada program yang cocok dengan pencarian.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-white rounded-[28px] shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h3 className="font-serif font-bold text-xl text-slate-900">
                  {selectedProgramForEdit ? 'Edit Program Donasi' : 'Tambah Program Donasi'}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedProgramForEdit ? 'Perbarui detail program yang tampil di aplikasi.' : 'Buat program baru untuk portal donasi dan halaman publik.'}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {formError && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <label className="block space-y-2 lg:col-span-2">
                  <span className="text-sm font-bold text-slate-800">Judul Program</span>
                  <input
                    type="text"
                    value={formState.title}
                    onChange={(e) => setFormState(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-bold text-slate-800">Kategori</span>
                  <select
                    value={formState.category}
                    onChange={(e) => setFormState(prev => ({ ...prev, category: e.target.value as ProgramCategory }))}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    {Object.entries(categoryLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-bold text-slate-800">Target Dana</span>
                  <input
                    type="number"
                    min="1"
                    value={formState.targetAmount}
                    onChange={(e) => setFormState(prev => ({ ...prev, targetAmount: e.target.value }))}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </label>

                <label className="block space-y-2 lg:col-span-2">
                  <span className="text-sm font-bold text-slate-800">Deskripsi Program</span>
                  <textarea
                    rows={4}
                    value={formState.description}
                    onChange={(e) => setFormState(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-bold text-slate-800">Tanggal Mulai</span>
                  <input
                    type="date"
                    value={formState.startDate}
                    onChange={(e) => setFormState(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-bold text-slate-800">Tanggal Akhir</span>
                  <input
                    type="date"
                    value={formState.endDate}
                    onChange={(e) => setFormState(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </label>

                <label className="block space-y-2 lg:col-span-2">
                  <span className="text-sm font-bold text-slate-800">Thumbnail Program</span>
                  <div className="grid grid-cols-1 lg:grid-cols-[160px_1fr] gap-3 items-start">
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-3">
                      <div className="w-full aspect-[4/3] rounded-2xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center">
                        {formState.thumbnail ? (
                          <img src={formState.thumbnail} alt="Thumbnail preview" className="w-full h-full object-cover" />
                        ) : (
                          <Image className="w-6 h-6 text-slate-400" />
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <input
                        ref={thumbnailInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailFileChange}
                        className="hidden"
                      />

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={handlePickThumbnail}
                          className="px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-2xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                        >
                          <Image className="w-4 h-4" />
                          <span>Pilih File Gambar</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleClearThumbnail}
                          className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                          <span>Reset Thumbnail</span>
                        </button>
                      </div>

                      <input
                        type="url"
                        value={formState.thumbnail}
                        onChange={(e) => setFormState(prev => ({ ...prev, thumbnail: e.target.value }))}
                        placeholder="Atau tempel URL gambar di sini"
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />

                      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-xs text-slate-500 leading-relaxed">
                        Upload gambar langsung akan disimpan sebagai data URL. Jika ingin memakai gambar dari internet, isi URL di bawah.
                      </div>
                    </div>
                  </div>
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-bold text-slate-800">Status</span>
                  <select
                    value={formState.status}
                    onChange={(e) => setFormState(prev => ({ ...prev, status: e.target.value as ProgramStatus }))}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-bold text-slate-800">Tampilkan di Halaman Publik</span>
                  <div className="h-[52px] flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4">
                    <input
                      type="checkbox"
                      checked={formState.isFeatured}
                      onChange={(e) => setFormState(prev => ({ ...prev, isFeatured: e.target.checked }))}
                      className="rounded-md text-emerald-600 focus:ring-emerald-500 bg-white border-slate-300"
                    />
                    <span className="text-sm font-semibold text-slate-700">Jadikan program unggulan</span>
                  </div>
                </label>
              </div>

              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-xs text-slate-500 leading-relaxed flex items-start gap-2">
                <FileText className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span>
                  Program yang diubah akan langsung dipakai oleh modal donasi, halaman publik, dan ringkasan keuangan setelah data disegarkan.
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  <span>Batal</span>
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-bold rounded-2xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Menyimpan...' : selectedProgramForEdit ? 'Simpan Perubahan' : 'Tambah Program'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
