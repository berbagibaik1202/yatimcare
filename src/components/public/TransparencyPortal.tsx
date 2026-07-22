import React from 'react';
import { db } from '../../services/dbStore';
import { FinancialSummary, Donation, Expense } from '../../types';
import {
  PieChart,
  ShieldCheck,
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  FileText,
  Lock,
  Download,
  Award
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

interface TransparencyPortalProps {
  onOpenDonationModal: () => void;
}

export const TransparencyPortal: React.FC<TransparencyPortalProps> = ({ onOpenDonationModal }) => {
  const financialSummary: FinancialSummary = db.getFinancialSummary();
  const successfulDonations: Donation[] = db.getDonations().filter(d => d.paymentStatus === 'berhasil');
  const approvedExpenses: Expense[] = db.getExpenses().filter(e => e.status === 'dibayarkan' || e.status === 'disetujui');

  // Chart dataset for monthly summary
  const chartData = [
    { month: 'Nov 2024', Pemasukan: 18000000, Pengeluaran: 12000000 },
    { month: 'Des 2024', Pemasukan: 22000000, Pengeluaran: 15500000 },
    { month: 'Jan 2025', Pemasukan: 28000000, Pengeluaran: 19000000 },
    { month: 'Feb 2025', Pemasukan: 32000000, Pengeluaran: 22500000 },
    { month: 'Mar 2025', Pemasukan: financialSummary.totalDonationReceived, Pengeluaran: financialSummary.totalExpenseApproved }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 text-white">
      
      {/* Header Banner */}
      <div className="bg-[#161616] text-white rounded-[40px] p-8 sm:p-12 shadow-2xl border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#CCFF00]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/20 text-xs font-black uppercase tracking-wider">
            <PieChart className="w-4 h-4 text-[#CCFF00]" />
            <span>Laporan Transparansi Keuangan Terbuka</span>
          </div>

          <h1 className="font-sans font-black text-3xl sm:text-4xl text-white tracking-tight">
            Akuntabilitas Publik & Keterbukaan Dana Donasi YatimCare
          </h1>

          <p className="text-white/70 text-xs sm:text-sm leading-relaxed font-normal">
            Sebagai bentuk amanah, seluruh transaksi donasi masuk dan pengeluaran bantuan dicatat secara cermat, dapat diverifikasi kuitansinya, dan dipublikasikan tanpa membuka data sensitif identitas anak.
          </p>

          <div className="pt-2 flex items-center gap-4 text-xs text-[#CCFF00] font-bold">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#CCFF00]" />
              Audit Sistem Otomatis
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-[#CCFF00]" />
              Perlindungan Privasi Anak Pasbita
            </span>
          </div>
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 bg-[#161616] rounded-[32px] border border-white/10 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-white/50 font-medium">
            <span>Total Donasi Masuk</span>
            <ArrowUpRight className="w-4 h-4 text-[#CCFF00]" />
          </div>
          <p className="text-2xl font-black text-[#CCFF00]">
            Rp {financialSummary.totalDonationReceived.toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] text-white/50">{successfulDonations.length} Transaksi Diverifikasi</p>
        </div>

        <div className="p-6 bg-[#161616] rounded-[32px] border border-white/10 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-white/50 font-medium">
            <span>Total Pengeluaran Bantuan</span>
            <ArrowDownRight className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-black text-white">
            Rp {financialSummary.totalExpenseApproved.toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] text-white/50">{approvedExpenses.length} Alokasi Program Bantuan</p>
        </div>

        <div className="p-6 bg-[#161616] rounded-[32px] border border-white/10 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-white/50 font-medium">
            <span>Saldo Kas Berjalan</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-300">
            Rp {financialSummary.currentBalance.toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] text-[#CCFF00] font-medium">Formula: Pemasukan - Pengeluaran</p>
        </div>

        <div className="p-6 bg-[#161616] rounded-[32px] border border-white/10 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-white/50 font-medium">
            <span>Anak Penerima Aktif</span>
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-white">
            {financialSummary.totalActiveChildren} <span className="text-xs font-normal text-white/50">Anak</span>
          </p>
          <p className="text-[11px] text-white/50">Yatim, Piatu & Yatim Piatu</p>
        </div>
      </div>

      {/* Financial Trend Chart */}
      <div className="bg-[#161616] rounded-[32px] p-6 sm:p-8 border border-white/10 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-sans font-black text-xl text-white">Grafik Arus Kas Pemasukan vs Pengeluaran</h3>
            <p className="text-xs text-white/50 mt-0.5">Perbandingan pertumbuhan donasi yang diterima dan realisasi pengeluaran bantuan.</p>
          </div>
          <span className="text-xs font-bold px-3.5 py-1.5 bg-[#CCFF00]/10 text-[#CCFF00] rounded-full border border-[#CCFF00]/20">
            Rekonsiliasi Real-Time
          </span>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2a2a2a" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} style={{ fontSize: '11px', fill: '#888' }} />
              <YAxis
                tickLine={false}
                axisLine={false}
                style={{ fontSize: '11px', fill: '#888' }}
                tickFormatter={(val) => `Rp ${(val/1000000).toFixed(0)}Jt`}
              />
              <Tooltip
                formatter={(value: any) => [`Rp ${Number(value).toLocaleString('id-ID')}`, '']}
                contentStyle={{ backgroundColor: '#1A1A1A', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="Pemasukan" fill="#CCFF00" radius={[8, 8, 0, 0]} barSize={24} />
              <Bar dataKey="Pengeluaran" fill="#444444" radius={[8, 8, 0, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cashbook Logs Grid (Pemasukan & Pengeluaran) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Income / Donations Log */}
        <div className="bg-[#161616] rounded-[32px] p-6 border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#CCFF00]" />
              <h3 className="font-sans font-black text-base text-white">Buku Kas Donasi Masuk (Verifikasi)</h3>
            </div>
            <span className="text-xs font-bold text-white/50">{successfulDonations.length} Transaksi</span>
          </div>

          <div className="space-y-3">
            {successfulDonations.map(don => (
              <div key={don.id} className="p-4 bg-[#1A1A1A] rounded-2xl border border-white/10 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <p className="font-bold text-white">
                    {don.isAnonymous ? 'Hamba Allah (Anonim)' : don.donorName}
                  </p>
                  <p className="text-[11px] text-white/60">{don.programTitle}</p>
                  <p className="text-[10px] text-white/40 font-mono">{don.transactionNumber} • {new Date(don.donatedAt).toLocaleDateString('id-ID')}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-[#CCFF00] text-sm">
                    +Rp {don.amount.toLocaleString('id-ID')}
                  </p>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/20 text-[10px] font-bold uppercase mt-0.5">
                    {don.paymentMethod.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Expense / Aid Distribution Log */}
        <div className="bg-[#161616] rounded-[32px] p-6 border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <h3 className="font-sans font-black text-base text-white">Buku Pengeluaran & Penyaluran</h3>
            </div>
            <span className="text-xs font-bold text-white/50">{approvedExpenses.length} Alokasi</span>
          </div>

          <div className="space-y-3">
            {approvedExpenses.map(exp => (
              <div key={exp.id} className="p-4 bg-[#1A1A1A] rounded-2xl border border-white/10 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <p className="font-bold text-white">{exp.purpose}</p>
                  <p className="text-[11px] text-white/60">Penerima: {exp.recipientName}</p>
                  <p className="text-[10px] text-white/40 font-mono">{exp.expenseNumber} • {exp.transactionDate}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-white text-sm">
                    -Rp {exp.amount.toLocaleString('id-ID')}
                  </p>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/10 text-white/70 border border-white/10 text-[10px] font-bold mt-0.5">
                    {exp.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Child Privacy Guarantee Banner */}
      <div className="p-6 bg-[#161616] rounded-[32px] border border-white/10 text-xs text-white/60 space-y-2 text-center max-w-3xl mx-auto shadow-xl">
        <div className="flex items-center justify-center gap-2 font-black text-white">
          <ShieldCheck className="w-4 h-4 text-[#CCFF00]" />
          <span>Komitmen Perlindungan Privasi & Keselamatan Anak Yatim Piatu</span>
        </div>
        <p className="leading-relaxed">
          Sesuai standar etik, NIK lengkap, nomor Kartu Keluarga, alamat rumah rinci, dan dokumen asli anak tidak dipublikasikan secara umum. Seluruh akses verifikasi dokumen dibatasi hanya untuk Pengurus & Auditor resmi Yayasan.
        </p>
      </div>

    </div>
  );
};
