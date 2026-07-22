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

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [selectedChildForModal, setSelectedChildForModal] = useState<Child | null>(null);
  const [selectedChildForPrint, setSelectedChildForPrint] = useState<Child | undefined>(undefined);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const [verificationNotes, setVerificationNotes] = useState('');

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

  const handleVerify = (childId: string, status: 'aktif' | 'ditolak' | 'perlu_perbaikan') => {
    db.verifyChild(childId, status, verificationNotes || `Status diperbarui menjadi ${status}`);
    onRefreshData();
    setSelectedChildForModal(null);
    setVerificationNotes('');
    alert(`Status verifikasi anak berhasil diubah menjadi: ${status.toUpperCase()}`);
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

      {/* Printable Biodata Modal */}
      <PrintReceiptModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        child={selectedChildForPrint}
      />

    </div>
  );
};
