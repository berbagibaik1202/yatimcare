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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-white">
      
      {/* Header Banner */}
      <div className="bg-[#161616] text-white rounded-[40px] p-8 shadow-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#CCFF00]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/20 text-xs font-black uppercase tracking-wider">
            <Award className="w-3.5 h-3.5 text-[#CCFF00]" />
            <span>Dashboard Donatur Dermawan YatimCare</span>
          </div>
          <h1 className="font-sans font-black text-2xl sm:text-3xl text-white">
            Terima Kasih, Ibu Hj. Ratna Pertiwi
          </h1>
          <p className="text-xs text-white/60 max-w-2xl leading-relaxed">
            Kebaikan dan infak Anda secara langsung menyinari pendidikan & kelangsungan hidup anak-anak yatim binaan di Kabupaten Sumedang.
          </p>
        </div>

        <button
          onClick={onOpenDonationModal}
          className="px-6 py-4 bg-[#CCFF00] hover:bg-[#b8e600] text-black font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-[#CCFF00]/15 transition-all flex items-center gap-2 cursor-pointer shrink-0 relative z-10 active:scale-98"
        >
          <Heart className="w-4 h-4 fill-black" />
          <span>Tambah Donasi Baru</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 bg-[#161616] rounded-[32px] border border-white/10 shadow-xl space-y-2">
          <span className="text-xs text-white/50 font-medium">Total Akumulasi Donasi Diterima</span>
          <p className="text-3xl font-black text-[#CCFF00]">
            Rp {totalDonated.toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] text-white/50 font-medium">Tercatat dalam Buku Kas Yayasan</p>
        </div>

        <div className="p-6 bg-[#161616] rounded-[32px] border border-white/10 shadow-xl space-y-2">
          <span className="text-xs text-white/50 font-medium">Jumlah Transaksi Donasi</span>
          <p className="text-3xl font-black text-white">
            {myDonations.length} <span className="text-xs font-normal text-white/50">Kali</span>
          </p>
          <p className="text-[11px] text-white/50">Santunan, Beasiswa & Infak</p>
        </div>

        <div className="p-6 bg-[#161616] rounded-[32px] border border-white/10 shadow-xl space-y-2">
          <span className="text-xs text-white/50 font-medium">Status Donasi Rutin Bulanan</span>
          <p className="text-xl font-black text-[#CCFF00] flex items-center gap-2 pt-1">
            <Sparkles className="w-5 h-5 text-[#CCFF00]" />
            Aktif (Orang Tua Asuh)
          </p>
          <p className="text-[11px] text-white/50">Dukungan Berkelanjutan</p>
        </div>
      </div>

      {/* Donation History Table */}
      <div className="bg-[#161616] rounded-[32px] p-6 sm:p-8 border border-white/10 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <h2 className="font-sans font-black text-xl text-white">Riwayat Donasi Pribadi</h2>
            <p className="text-xs text-white/50 mt-0.5">Daftar seluruh transaksi donasi beserta bukti kuitansi digital resmi.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold px-3 py-1.5 bg-white/10 text-white border border-white/10 rounded-xl">
              {myDonations.length} Transaksi
            </span>

            <button
              onClick={handleExportCSV}
              className="px-3.5 py-1.5 bg-[#CCFF00] hover:bg-[#b8e600] text-black font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-98"
              title="Ekspor Riwayat Donasi ke Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-black" />
              <span>Export Excel</span>
            </button>

            <button
              onClick={handleExportPDF}
              className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer active:scale-98"
              title="Cetak Laporan Donasi ke PDF"
            >
              <Printer className="w-3.5 h-3.5 text-[#CCFF00]" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 text-white/50 font-bold uppercase tracking-wider bg-[#1A1A1A]">
                <th className="p-3.5 rounded-l-2xl">No. Transaksi</th>
                <th className="p-3.5">Tanggal</th>
                <th className="p-3.5">Program Tujuan</th>
                <th className="p-3.5">Nominal</th>
                <th className="p-3.5">Metode</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right rounded-r-2xl">Kuitansi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium text-white">
              {myDonations.map(don => (
                <tr key={don.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-[#CCFF00]">{don.transactionNumber}</td>
                  <td className="p-3.5 text-white/80">{new Date(don.donatedAt).toLocaleDateString('id-ID')}</td>
                  <td className="p-3.5 max-w-xs truncate font-semibold text-white">{don.programTitle}</td>
                  <td className="p-3.5 font-black text-[#CCFF00]">Rp {don.amount.toLocaleString('id-ID')}</td>
                  <td className="p-3.5 uppercase text-white/70">{don.paymentMethod.replace('_', ' ')}</td>
                  <td className="p-3.5">
                    {don.paymentStatus === 'berhasil' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/20 font-bold text-[10px]">
                        <CheckCircle2 className="w-3 h-3 text-[#CCFF00]" />
                        Terverifikasi
                      </span>
                    )}
                    {don.paymentStatus === 'menunggu_verifikasi' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold text-[10px]">
                        <Clock className="w-3 h-3" />
                        Verifikasi
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-right">
                    {don.paymentStatus === 'berhasil' && (
                      <button
                        onClick={() => handlePrintReceipt(don)}
                        className="px-3 py-1.5 bg-[#CCFF00] hover:bg-[#b8e600] text-black rounded-xl font-bold text-[11px] inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
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
