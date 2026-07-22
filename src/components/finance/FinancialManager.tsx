import React, { useState } from 'react';
import { db } from '../../services/dbStore';
import { Expense, ExpenseStatus, FinancialSummary } from '../../types';
import { exportToCSV, exportToPDF } from '../../utils/exportUtils';
import {
  PieChart,
  PlusCircle,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Printer,
  FileText,
  DollarSign,
  X,
  FileSpreadsheet
} from 'lucide-react';

interface FinancialManagerProps {
  onRefreshData: () => void;
}

export const FinancialManager: React.FC<FinancialManagerProps> = ({ onRefreshData }) => {
  const financialSummary: FinancialSummary = db.getFinancialSummary();
  const expenses = db.getExpenses();
  const programs = db.getPrograms();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [purpose, setPurpose] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [amount, setAmount] = useState<number>(1000000);
  const [category, setCategory] = useState<any>('Santunan Bulanan');
  const [selectedProgramId, setSelectedProgramId] = useState<string>(programs[0]?.id || 'prg-1');
  const [description, setDescription] = useState('');

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const prog = programs.find(p => p.id === selectedProgramId);

    db.addExpense({
      programId: prog?.id,
      programTitle: prog?.title,
      category,
      transactionDate: new Date().toISOString().slice(0, 10),
      recipientName,
      amount,
      purpose,
      description,
      paymentMethod: 'transfer_bank',
      receiptFileUrl: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=400&q=80',
      submittedBy: db.getCurrentUser()?.name || 'Bendahara'
    });

    onRefreshData();
    setIsFormOpen(false);
    alert('Pengajuan pengeluaran dana berhasil dikirimkan!');
    setPurpose('');
    setRecipientName('');
  };

  const handleApproveExpense = (id: string, status: 'disetujui' | 'dibayarkan' | 'ditolak') => {
    db.approveExpense(id, status);
    onRefreshData();
    alert(`Status pengeluaran dana berhasil diperbarui menjadi: ${status.toUpperCase()}`);
  };

  const handleExportCSV = () => {
    const headers = [
      'No Bukti / Voucher',
      'Kategori Program',
      'Tujuan Pengeluaran / Peruntukan',
      'Penerima Manfaat / Vendor',
      'Nominal (Rp)',
      'Diajukan Oleh',
      'Disetujui Oleh',
      'Status',
      'Tanggal Transaksi'
    ];

    const rows = expenses.map(e => [
      e.expenseNumber,
      e.category,
      e.purpose,
      e.recipientName,
      e.amount,
      e.submittedBy,
      e.approvedBy || '-',
      e.status.toUpperCase(),
      e.transactionDate
    ]);

    exportToCSV('Buku_Kas_Pengeluaran_YatimCare', headers, rows);
  };

  const handleExportPDF = () => {
    const headers = [
      'No Bukti',
      'Kategori',
      'Keterangan / Tujuan',
      'Penerima',
      'Nominal',
      'Status'
    ];

    const rows = expenses.map(e => [
      e.expenseNumber,
      e.category,
      e.purpose,
      e.recipientName,
      `Rp ${e.amount.toLocaleString('id-ID')}`,
      e.status.toUpperCase()
    ]);

    const summary = [
      { label: 'Total Pemasukan Donasi', value: `Rp ${financialSummary.totalDonationReceived.toLocaleString('id-ID')}` },
      { label: 'Total Pengeluaran Kas', value: `Rp ${financialSummary.totalExpenseApproved.toLocaleString('id-ID')}` },
      { label: 'Saldo Kas Berjalan', value: `Rp ${financialSummary.currentBalance.toLocaleString('id-ID')}` }
    ];

    exportToPDF(
      'LAPORAN BUKU KAS & PENGELUARAN DANA',
      'Rekapitulasi Pengeluaran Kas Operasional & Penyaluran Bantuan Yayasan YatimCare',
      headers,
      rows,
      summary
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Financial Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Total Pemasukan Donasi (Buku Kas)</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold font-serif text-emerald-700">
            Rp {financialSummary.totalDonationReceived.toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] text-slate-500">Mutasi Terverifikasi</p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Total Pengeluaran Bantuan</span>
            <ArrowDownRight className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-extrabold font-serif text-slate-900">
            Rp {financialSummary.totalExpenseApproved.toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] text-slate-500">Disetujui & Dibayarkan</p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Saldo Kas Berjalan</span>
            <DollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold font-serif text-amber-700">
            Rp {financialSummary.currentBalance.toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] text-emerald-700 font-medium">Rumus: Pemasukan - Pengeluaran</p>
        </div>
      </div>

      {/* Header & Expense Controls */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif font-bold text-xl text-slate-900">Pembukuan Keuangan & Pengeluaran Dana</h2>
          <p className="text-xs text-slate-500 mt-0.5">Mencatat pengajuan pengeluaran bantuan, memverifikasi kuitansi, dan persetujuan ketua yayasan.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Ekspor Laporan Keuangan ke Excel"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Cetak Laporan Keuangan ke PDF"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>Export PDF</span>
          </button>

          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Ajukan Pengeluaran Dana</span>
          </button>
        </div>
      </div>

      {/* New Expense Form */}
      {isFormOpen && (
        <form onSubmit={handleCreateExpense} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900">Formulir Pengajuan Pengeluaran Kas Yayasan</h3>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Tutup Form"
              aria-label="Tutup Form"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Maksud / Tujuan Penggunaan *</label>
              <input
                type="text"
                required
                placeholder="Contoh: Pembelian Seragam Sekolah..."
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Penerima Dana / Vendor *</label>
              <input
                type="text"
                required
                placeholder="Nama penerima / Toko..."
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Nominal Biaya (Rp) *</label>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Kategori Pengeluaran *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              >
                <option value="Santunan Bulanan">Santunan Bulanan</option>
                <option value="Bantuan Pendidikan">Bantuan Pendidikan & Seragam</option>
                <option value="Sembako & Makanan">Sembako & Pangan Sehat</option>
                <option value="Kesehatan">Bantuan Kesehatan</option>
                <option value="Perbaikan Rumah">Perbaikan Tempat Tinggal</option>
                <option value="Operasional Yayasan">Operasional Yayasan</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Program Sumber Dana *</label>
              <select
                value={selectedProgramId}
                onChange={(e) => setSelectedProgramId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              >
                {programs.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="block font-medium text-slate-700 mb-1">Keterangan Rinci *</label>
              <textarea
                rows={2}
                required
                placeholder="Rincian peruntukan pengeluaran..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-600 text-white font-bold rounded-xl shadow-xs hover:bg-amber-700 cursor-pointer"
            >
              Kirimkan Pengajuan
            </button>
          </div>
        </form>
      )}

      {/* Expenses Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider bg-slate-50">
                <th className="p-3.5 rounded-l-xl">No. Pengeluaran</th>
                <th className="p-3.5">Maksud & Penerima</th>
                <th className="p-3.5">Kategori</th>
                <th className="p-3.5">Nominal</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right rounded-r-xl">Aksi Approval</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {expenses.map(exp => (
                <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-slate-900">{exp.expenseNumber}</td>
                  
                  <td className="p-3.5">
                    <p className="font-bold text-slate-900">{exp.purpose}</p>
                    <p className="text-[10px] text-slate-500">Penerima: {exp.recipientName} • Tgl: {exp.transactionDate}</p>
                  </td>

                  <td className="p-3.5 font-semibold text-slate-800">{exp.category}</td>

                  <td className="p-3.5 font-extrabold text-slate-900">
                    Rp {exp.amount.toLocaleString('id-ID')}
                  </td>

                  <td className="p-3.5">
                    {exp.status === 'dibayarkan' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        <CheckCircle2 className="w-3 h-3" />
                        Dibayarkan
                      </span>
                    )}
                    {exp.status === 'diajukan' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                        <Clock className="w-3 h-3" />
                        Diajukan
                      </span>
                    )}
                  </td>

                  <td className="p-3.5 text-right space-x-1">
                    {exp.status === 'diajukan' ? (
                      <>
                        <button
                          onClick={() => handleApproveExpense(exp.id, 'dibayarkan')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                        >
                          Setujui & Bayar
                        </button>
                        <button
                          onClick={() => handleApproveExpense(exp.id, 'ditolak')}
                          className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                        >
                          Tolak
                        </button>
                      </>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-semibold">Approved oleh {exp.approvedBy}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
