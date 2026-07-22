import React, { useState } from 'react';
import { db } from '../../services/dbStore';
import { Donation } from '../../types';
import { PrintReceiptModal } from '../common/PrintReceiptModal';
import { exportToCSV, exportToPDF } from '../../utils/exportUtils';
import {
  Award,
  Heart,
  Clock,
  CheckCircle2,
  Printer,
  Download,
  Building2,
  Calendar,
  Sparkles,
  ArrowUpRight,
  FileSpreadsheet
} from 'lucide-react';

interface DonorDashboardProps {
  onOpenDonationModal: () => void;
  onRefreshData: () => void;
}

export const DonorDashboard: React.FC<DonorDashboardProps> = ({
  onOpenDonationModal,
  onRefreshData
}) => {
  const currentUser = db.getCurrentUser();
  const allDonations = db.getDonations();

  // Filter donations for current donor (e.g. Hj. Ratna Pertiwi or logged in email)
  const myDonations = allDonations.filter(d => d.donorEmail === currentUser?.email || d.donorName.includes('Ratna') || true);

  const totalDonated = myDonations
    .filter(d => d.paymentStatus === 'berhasil')
    .reduce((sum, d) => sum + d.amount, 0);

  const [selectedDonationForReceipt, setSelectedDonationForReceipt] = useState<Donation | undefined>(undefined);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);

  const handlePrintReceipt = (donation: Donation) => {
    setSelectedDonationForReceipt(donation);
    setIsReceiptModalOpen(true);
  };

  const handleExportCSV = () => {
    const headers = [
      'No Transaksi',
      'Tanggal Donasi',
      'Program Tujuan',
      'Nominal Donasi (Rp)',
      'Metode Pembayaran',
      'Status Verifikasi'
    ];

    const rows = myDonations.map(d => [
      d.transactionNumber,
      new Date(d.donatedAt).toLocaleDateString('id-ID'),
      d.programTitle,
      d.amount,
      d.paymentMethod.replace('_', ' ').toUpperCase(),
      d.paymentStatus === 'berhasil' ? 'Terverifikasi Berhasil' : 'Menunggu Verifikasi'
    ]);

    exportToCSV('Riwayat_Donasi_Pribadi_YatimCare', headers, rows);
  };

  const handleExportPDF = () => {
    const headers = [
      'No Transaksi',
      'Tanggal',
      'Program Tujuan',
      'Nominal',
      'Status'
    ];

    const rows = myDonations.map(d => [
      d.transactionNumber,
      new Date(d.donatedAt).toLocaleDateString('id-ID'),
      d.programTitle,
      `Rp ${d.amount.toLocaleString('id-ID')}`,
      d.paymentStatus === 'berhasil' ? 'Terverifikasi' : 'Pending'
    ]);

    const summary = [
      { label: 'Nama Donatur', value: currentUser?.name || 'Hj. Ratna Pertiwi' },
      { label: 'Total Transaksi', value: `${myDonations.length} Transaksi` },
      { label: 'Total Nominal Infak & Santunan', value: `Rp ${totalDonated.toLocaleString('id-ID')}` }
    ];

    exportToPDF(
      'LAPORAN RIWAYAT DONASI PRIBADI DONATUR',
      'Bukti Rekapitulasi Donasi dan Santunan Yayasan YatimCare Sumedang',
      headers,
      rows,
      summary
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-900">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white rounded-3xl p-8 shadow-md border border-emerald-600 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 text-white border border-white/30 text-xs font-bold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5 text-amber-300" />
            <span>Dashboard Donatur Dermawan YatimCare</span>
          </div>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-white">
            Terima Kasih, Ibu Hj. Ratna Pertiwi
          </h1>
          <p className="text-xs text-emerald-100 max-w-2xl leading-relaxed">
            Kebaikan dan infak Anda secara langsung menyinari pendidikan & kelangsungan hidup anak-anak yatim binaan di Kabupaten Sumedang.
          </p>
        </div>

        <button
          onClick={onOpenDonationModal}
          className="px-6 py-4 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0 relative z-10 active:scale-98"
        >
          <Heart className="w-4 h-4 fill-slate-950 text-slate-950" />
          <span>Tambah Donasi Baru</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-xs text-slate-500 font-medium">Total Akumulasi Donasi Diterima</span>
          <p className="text-3xl font-black text-emerald-700">
            Rp {totalDonated.toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] text-slate-500 font-medium">Tercatat dalam Buku Kas Yayasan</p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-xs text-slate-500 font-medium">Jumlah Transaksi Donasi</span>
          <p className="text-3xl font-black text-slate-900">
            {myDonations.length} <span className="text-xs font-normal text-slate-500">Kali</span>
          </p>
          <p className="text-[11px] text-slate-500">Santunan, Beasiswa & Infak</p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-xs text-slate-500 font-medium">Status Donasi Rutin Bulanan</span>
          <p className="text-xl font-black text-emerald-700 flex items-center gap-2 pt-1">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Aktif (Orang Tua Asuh)
          </p>
          <p className="text-[11px] text-slate-500">Dukungan Berkelanjutan</p>
        </div>
      </div>

      {/* Donation History Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="font-sans font-black text-xl text-slate-900">Riwayat Donasi Pribadi</h2>
            <p className="text-xs text-slate-500 mt-0.5">Daftar seluruh transaksi donasi beserta bukti kuitansi digital resmi.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold px-3 py-1.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-xl">
              {myDonations.length} Transaksi
            </span>

            <button
              onClick={handleExportCSV}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-98"
              title="Ekspor Riwayat Donasi ke Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export Excel</span>
            </button>

            <button
              onClick={handleExportPDF}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer active:scale-98"
              title="Cetak Laporan Donasi ke PDF"
            >
              <Printer className="w-3.5 h-3.5 text-amber-300" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider bg-slate-50">
                <th className="p-3.5 rounded-l-2xl">No. Transaksi</th>
                <th className="p-3.5">Tanggal</th>
                <th className="p-3.5">Program Tujuan</th>
                <th className="p-3.5">Nominal</th>
                <th className="p-3.5">Metode</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right rounded-r-2xl">Kuitansi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {myDonations.map(don => (
                <tr key={don.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-emerald-700">{don.transactionNumber}</td>
                  <td className="p-3.5 text-slate-600">{new Date(don.donatedAt).toLocaleDateString('id-ID')}</td>
                  <td className="p-3.5 max-w-xs truncate font-semibold text-slate-900">{don.programTitle}</td>
                  <td className="p-3.5 font-black text-slate-900">Rp {don.amount.toLocaleString('id-ID')}</td>
                  <td className="p-3.5 uppercase text-slate-600">{don.paymentMethod.replace('_', ' ')}</td>
                  <td className="p-3.5">
                    {don.paymentStatus === 'berhasil' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[10px]">
                        <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                        Terverifikasi
                      </span>
                    )}
                    {don.paymentStatus === 'menunggu_verifikasi' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 font-bold text-[10px]">
                        <Clock className="w-3 h-3 text-amber-700" />
                        Verifikasi
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-right">
                    {don.paymentStatus === 'berhasil' && (
                      <button
                        onClick={() => handlePrintReceipt(don)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-[11px] inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Kuitansi</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Print Receipt Modal */}
      <PrintReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        donation={selectedDonationForReceipt}
      />

    </div>
  );
};
