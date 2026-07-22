import React, { useState } from 'react';
import { db } from '../../services/dbStore';
import { Donation } from '../../types';
import { PrintReceiptModal } from '../common/PrintReceiptModal';
import { exportToCSV, exportToPDF } from '../../utils/exportUtils';
import {
  Heart,
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  Search,
  Building2,
  Calendar,
  Eye,
  FileCheck,
  FileSpreadsheet
} from 'lucide-react';

interface DonationsManagerProps {
  onRefreshData: () => void;
}

export const DonationsManager: React.FC<DonationsManagerProps> = ({ onRefreshData }) => {
  const donations = db.getDonations();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedDonationForReceipt, setSelectedDonationForReceipt] = useState<Donation | undefined>(undefined);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  const filteredDonations = donations.filter(d => {
    const matchesSearch =
      d.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.transactionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.donorEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || d.paymentStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleVerify = async (id: string, status: 'berhasil' | 'ditolak') => {
    try {
      await db.verifyDonation(id, status);
      onRefreshData();
      alert(`Status transaksi donasi berhasil diubah menjadi: ${status.toUpperCase()}`);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Gagal memverifikasi donasi');
    }
  };

  const handlePrintReceipt = (donation: Donation) => {
    setSelectedDonationForReceipt(donation);
    setIsReceiptModalOpen(true);
  };

  const handleExportCSV = () => {
    const headers = [
      'No Transaksi',
      'Nama Donatur',
      'Email',
      'Kontak WA',
      'Program Donasi',
      'Metode Pembayaran',
      'Jumlah Nominal (Rp)',
      'Status Verifikasi',
      'Tanggal Transaksi'
    ];

    const rows = filteredDonations.map(d => [
      d.transactionNumber,
      d.isAnonymous ? `${d.donorName} (Hamba Allah)` : d.donorName,
      d.donorEmail,
      d.donorPhone || '-',
      d.programTitle,
      d.paymentMethod,
      d.amount,
      d.paymentStatus === 'berhasil' ? 'Terverifikasi Berhasil' : d.paymentStatus === 'menunggu_verifikasi' ? 'Menunggu Verifikasi' : 'Ditolak',
      new Date(d.donatedAt).toLocaleDateString('id-ID')
    ]);

    exportToCSV('Data_Mutasi_Donasi_Masuk_YatimCare', headers, rows);
  };

  const handleExportPDF = () => {
    const headers = [
      'No Transaksi',
      'Nama Donatur',
      'Program',
      'Metode',
      'Nominal',
      'Status'
    ];

    const rows = filteredDonations.map(d => [
      d.transactionNumber,
      d.isAnonymous ? 'Hamba Allah' : d.donorName,
      d.programTitle,
      d.paymentMethod,
      `Rp ${d.amount.toLocaleString('id-ID')}`,
      d.paymentStatus === 'berhasil' ? 'Terverifikasi' : d.paymentStatus === 'menunggu_verifikasi' ? 'Pending' : 'Ditolak'
    ]);

    const totalAmount = filteredDonations
      .filter(d => d.paymentStatus === 'berhasil')
      .reduce((sum, d) => sum + d.amount, 0);

    const summary = [
      { label: 'Total Transaksi', value: `${filteredDonations.length} Transaksi` },
      { label: 'Transaksi Terverifikasi', value: `${filteredDonations.filter(d => d.paymentStatus === 'berhasil').length} Transaksi` },
      { label: 'Total Nominal Terverifikasi', value: `Rp ${totalAmount.toLocaleString('id-ID')}` }
    ];

    exportToPDF(
      'LAPORAN MUTASI DONASI MASUK',
      'Rekapitulasi Transaksi Pembayaran Donasi Masuk Yayasan YatimCare',
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
            <h2 className="font-serif font-bold text-xl text-slate-900">Pengelolaan & Verifikasi Donasi Masuk</h2>
            <p className="text-xs text-slate-500">Mencatat, memverifikasi mutasi bank, dan menerbitkan kuitansi elektronik resmi untuk donatur.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800">
              Terverifikasi: {donations.filter(d => d.paymentStatus === 'berhasil').length}
            </span>
            <span className="px-3 py-1.5 rounded-full bg-amber-100 text-amber-800">
              Menunggu: {donations.filter(d => d.paymentStatus === 'menunggu_verifikasi').length}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari Donatur, Email, No Transaksi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          >
            <option value="all">Semua Status Transaksi</option>
            <option value="menunggu_verifikasi">Menunggu Verifikasi Bendahara</option>
            <option value="berhasil">Berhasil Terverifikasi</option>
            <option value="ditolak">Ditolak</option>
          </select>
        </div>
      </div>

      {/* Donations Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider bg-slate-50">
                <th className="p-3.5 rounded-l-xl">No. Transaksi</th>
                <th className="p-3.5">Nama Donatur</th>
                <th className="p-3.5">Program Tujuan</th>
                <th className="p-3.5">Nominal</th>
                <th className="p-3.5">Metode</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right rounded-r-xl">Aksi / Kuitansi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filteredDonations.map(don => (
                <tr key={don.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-slate-900">{don.transactionNumber}</td>
                  
                  <td className="p-3.5">
                    <p className="font-bold text-slate-900">{don.isAnonymous ? 'Hamba Allah (Anonim)' : don.donorName}</p>
                    <p className="text-[10px] text-slate-500">{don.donorEmail} • {don.donorPhone}</p>
                  </td>

                  <td className="p-3.5 max-w-xs truncate font-semibold text-slate-800">
                    {don.programTitle}
                  </td>

                  <td className="p-3.5 font-extrabold text-emerald-700">
                    Rp {don.amount.toLocaleString('id-ID')}
                  </td>

                  <td className="p-3.5 uppercase">{don.paymentMethod.replace('_', ' ')}</td>

                  <td className="p-3.5">
                    {don.paymentStatus === 'berhasil' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        <CheckCircle2 className="w-3 h-3" />
                        Terverifikasi
                      </span>
                    )}
                    {don.paymentStatus === 'menunggu_verifikasi' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                        <Clock className="w-3 h-3" />
                        Menunggu
                      </span>
                    )}
                    {don.paymentStatus === 'ditolak' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">
                        <XCircle className="w-3 h-3" />
                        Ditolak
                      </span>
                    )}
                  </td>

                  <td className="p-3.5 text-right space-x-1">
                    {don.paymentStatus === 'menunggu_verifikasi' ? (
                      <>
                        <button
                          onClick={() => handleVerify(don.id, 'berhasil')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                        >
                          Verifikasi
                        </button>
                        <button
                          onClick={() => handleVerify(don.id, 'ditolak')}
                          className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                        >
                          Tolak
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handlePrintReceipt(don)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-[11px] inline-flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5 text-emerald-700" />
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

      <PrintReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        donation={selectedDonationForReceipt}
      />

    </div>
  );
};
