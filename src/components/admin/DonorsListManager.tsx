import React, { useState } from 'react';
import { db } from '../../services/dbStore';
import { Donor } from '../../types';
import { exportToCSV, exportToPDF } from '../../utils/exportUtils';
import {
  Users,
  Search,
  FileSpreadsheet,
  Printer,
  UserCheck,
  Building,
  HandHeart,
  Award,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  Edit,
  Trash2,
  X
} from 'lucide-react';

interface DonorsListManagerProps {
  onRefreshData?: () => void;
}

export const DonorsListManager: React.FC<DonorsListManagerProps> = ({ onRefreshData }) => {
  const donors = db.getDonors();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedDonorForEdit, setSelectedDonorForEdit] = useState<Donor | null>(null);
  const [donorEditForm, setDonorEditForm] = useState({
    fullName: '',
    donorType: 'individu' as Donor['donorType'],
    institutionName: '',
    email: '',
    phone: '',
    address: '',
    isAnonymousDefault: false,
    isRecurringDonor: false
  });

  const filteredDonors = donors.filter(d => {
    const matchesSearch =
      d.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.donorNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.phone.includes(searchTerm) ||
      (d.institutionName && d.institutionName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = filterType === 'all' || d.donorType === filterType;

    return matchesSearch && matchesType;
  });

  const totalDonationAccumulated = filteredDonors.reduce((sum, d) => sum + (d.totalDonation || 0), 0);

  const openEditDonorModal = (donor: Donor) => {
    setDonorEditForm({
      fullName: donor.fullName,
      donorType: donor.donorType,
      institutionName: donor.institutionName || '',
      email: donor.email,
      phone: donor.phone,
      address: donor.address || '',
      isAnonymousDefault: donor.isAnonymousDefault,
      isRecurringDonor: donor.isRecurringDonor
    });
    setSelectedDonorForEdit(donor);
  };

  const closeEditDonorModal = () => {
    setSelectedDonorForEdit(null);
  };

  const handleSaveDonorEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDonorForEdit) {
      return;
    }

    try {
      await db.updateDonorRecord(selectedDonorForEdit.id, {
        fullName: donorEditForm.fullName,
        donorType: donorEditForm.donorType,
        institutionName: donorEditForm.institutionName || undefined,
        email: donorEditForm.email,
        phone: donorEditForm.phone,
        address: donorEditForm.address,
        isAnonymousDefault: donorEditForm.isAnonymousDefault,
        isRecurringDonor: donorEditForm.isRecurringDonor
      });

      onRefreshData?.();
      setSelectedDonorForEdit(null);
      alert('Data donatur berhasil diperbarui.');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Gagal memperbarui data donatur');
    }
  };

  const handleDeleteDonor = async (donor: Donor) => {
    const confirmDelete = confirm(`Hapus data donatur "${donor.fullName}"? Tindakan ini tidak bisa dibatalkan.`);
    if (!confirmDelete) {
      return;
    }

    try {
      await db.deleteDonorRecord(donor.id);
      onRefreshData?.();
      alert('Data donatur berhasil dihapus.');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Gagal menghapus data donatur');
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'No Donatur',
      'Nama Donatur',
      'Kategori',
      'Instansi / Perusahaan',
      'Email',
      'Nomor Kontak (WA)',
      'Alamat',
      'Donatur Tetap / Rutin',
      'Total Terakumulasi (Rp)',
      'Jumlah Transaksi',
      'Tanggal Terdaftar'
    ];

    const rows = filteredDonors.map(d => [
      d.donorNumber,
      d.fullName,
      d.donorType === 'individu' ? 'Individu' : d.donorType === 'perusahaan' ? 'Perusahaan' : d.donorType === 'organisasi' ? 'Organisasi' : 'Komunitas',
      d.institutionName || '-',
      d.email,
      d.phone,
      d.address || '-',
      d.isRecurringDonor ? 'Ya (Donatur Tetap)' : 'Tidak (Insidental)',
      d.totalDonation || 0,
      d.transactionCount || 0,
      d.createdAt ? new Date(d.createdAt).toLocaleDateString('id-ID') : '-'
    ]);

    exportToCSV('Data_Donatur_YatimCare', headers, rows);
  };

  const handleExportPDF = () => {
    const headers = [
      'No Donatur',
      'Nama Donatur',
      'Kategori',
      'Email / Kontak',
      'Status Rutin',
      'Total Donasi',
      'Transaksi'
    ];

    const rows = filteredDonors.map(d => [
      d.donorNumber,
      d.fullName + (d.institutionName ? ` (${d.institutionName})` : ''),
      d.donorType.toUpperCase(),
      `${d.email}\n${d.phone}`,
      d.isRecurringDonor ? 'Donatur Tetap' : 'Insidental',
      `Rp ${(d.totalDonation || 0).toLocaleString('id-ID')}`,
      `${d.transactionCount || 0}x`
    ]);

    const summary = [
      { label: 'Total Donatur Terdata', value: `${filteredDonors.length} Donatur` },
      { label: 'Donatur Rutin / Tetap', value: `${filteredDonors.filter(d => d.isRecurringDonor).length} Donatur` },
      { label: 'Akumulasi Donasi', value: `Rp ${totalDonationAccumulated.toLocaleString('id-ID')}` }
    ];

    exportToPDF(
      'LAPORAN DATA DONATUR YAYASAN',
      'Rekapitulasi Profil dan Riwayat Komitmen Donatur YatimCare Sumedang',
      headers,
      rows,
      summary
    );
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Controls */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 text-slate-900">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif font-bold text-xl text-slate-900">Database & Profil Donatur</h2>
            <p className="text-xs text-slate-500">Mendata donatur tetap, instansi partner, serta akumulasi kontribusi kebaikan.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800">
              Total: {donors.length} Donatur
            </span>

            {/* Export Buttons */}
            <div className="flex items-center gap-1.5 ml-0 sm:ml-2">
              <button
                onClick={handleExportCSV}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                title="Ekspor Data Donatur ke Excel"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Export Excel</span>
              </button>

              <button
                onClick={handleExportPDF}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                title="Cetak Laporan Data Donatur ke PDF"
              >
                <Printer className="w-4 h-4 text-amber-300" />
                <span>Export PDF</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari Nama Donatur, No Donatur, Email, WA, Perusahaan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          >
            <option value="all">Semua Kategori Donatur</option>
            <option value="individu">Individu / Perorangan</option>
            <option value="perusahaan">Perusahaan / Korporasi</option>
            <option value="organisasi">Organisasi</option>
            <option value="komunitas">Komunitas</option>
          </select>
        </div>
      </div>

      {/* Donors Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 text-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="pb-3 px-2">ID Donatur</th>
                <th className="pb-3 px-2">Nama Donatur</th>
                <th className="pb-3 px-2">Kategori</th>
                <th className="pb-3 px-2">Kontak / Email</th>
                <th className="pb-3 px-2">Komitmen</th>
                <th className="pb-3 px-2 text-right">Total Donasi</th>
                <th className="pb-3 px-2 text-center">Transaksi</th>
                <th className="pb-3 px-2 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredDonors.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Tidak ada data donatur yang sesuai pencarian.
                  </td>
                </tr>
              ) : (
                filteredDonors.map(donor => (
                  <tr key={donor.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-2 font-mono font-bold text-slate-900 text-[11px]">
                      {donor.donorNumber}
                    </td>

                    <td className="py-3.5 px-2">
                      <p className="font-bold text-slate-900">{donor.fullName}</p>
                      {donor.institutionName && (
                        <p className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Building className="w-3 h-3 text-slate-400" />
                          <span>{donor.institutionName}</span>
                        </p>
                      )}
                    </td>

                    <td className="py-3.5 px-2 capitalize">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[10px]">
                        {donor.donorType}
                      </span>
                    </td>

                    <td className="py-3.5 px-2 space-y-0.5 text-[11px]">
                      <p className="text-slate-800 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{donor.email}</span>
                      </p>
                      <p className="text-slate-500 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{donor.phone}</span>
                      </p>
                    </td>

                    <td className="py-3.5 px-2">
                      {donor.isRecurringDonor ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Donatur Tetap
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-medium">
                          Insidental
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-2 text-right font-black text-emerald-700 text-xs">
                      Rp {(donor.totalDonation || 0).toLocaleString('id-ID')}
                    </td>

                    <td className="py-3.5 px-2 text-center font-bold text-slate-800">
                      {donor.transactionCount || 0}x
                    </td>

                    <td className="py-3.5 px-2 text-right space-x-1">
                      <button
                        onClick={() => openEditDonorModal(donor)}
                        className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                        title="Ubah Data Donatur"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteDonor(donor)}
                        className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                        title="Hapus Donatur"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedDonorForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <form onSubmit={handleSaveDonorEdit} className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-serif font-bold text-lg text-slate-900">Ubah Data Donatur</h3>
                <p className="text-xs text-slate-500">Perbarui profil dan komitmen donatur.</p>
              </div>
              <button
                type="button"
                onClick={closeEditDonorModal}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                aria-label="Tutup Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <label className="space-y-1.5">
                <span className="font-bold text-slate-700">Nama Donatur</span>
                <input
                  value={donorEditForm.fullName}
                  onChange={(e) => setDonorEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </label>

              <label className="space-y-1.5">
                <span className="font-bold text-slate-700">Kategori</span>
                <select
                  value={donorEditForm.donorType}
                  onChange={(e) => setDonorEditForm(prev => ({ ...prev, donorType: e.target.value as Donor['donorType'] }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="individu">Individu</option>
                  <option value="perusahaan">Perusahaan</option>
                  <option value="organisasi">Organisasi</option>
                  <option value="komunitas">Komunitas</option>
                  <option value="anonim">Anonim</option>
                </select>
              </label>

              <label className="space-y-1.5">
                <span className="font-bold text-slate-700">Instansi / Perusahaan</span>
                <input
                  value={donorEditForm.institutionName}
                  onChange={(e) => setDonorEditForm(prev => ({ ...prev, institutionName: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </label>

              <label className="space-y-1.5">
                <span className="font-bold text-slate-700">Email</span>
                <input
                  type="email"
                  value={donorEditForm.email}
                  onChange={(e) => setDonorEditForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </label>

              <label className="space-y-1.5">
                <span className="font-bold text-slate-700">Nomor Kontak</span>
                <input
                  value={donorEditForm.phone}
                  onChange={(e) => setDonorEditForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </label>

              <label className="sm:col-span-2 space-y-1.5">
                <span className="font-bold text-slate-700">Alamat</span>
                <textarea
                  rows={3}
                  value={donorEditForm.address}
                  onChange={(e) => setDonorEditForm(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </label>

              <label className="flex items-center gap-2 text-slate-700 font-bold">
                <input
                  type="checkbox"
                  checked={donorEditForm.isRecurringDonor}
                  onChange={(e) => setDonorEditForm(prev => ({ ...prev, isRecurringDonor: e.target.checked }))}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                Donatur Tetap
              </label>

              <label className="flex items-center gap-2 text-slate-700 font-bold">
                <input
                  type="checkbox"
                  checked={donorEditForm.isAnonymousDefault}
                  onChange={(e) => setDonorEditForm(prev => ({ ...prev, isAnonymousDefault: e.target.checked }))}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                Default Anonim
              </label>
            </div>

            <div className="flex gap-2 pt-2 text-xs">
              <button
                type="button"
                onClick={closeEditDonorModal}
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
    </div>
  );
};
