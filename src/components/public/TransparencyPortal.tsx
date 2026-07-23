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
  const chartMonths = Array.from({ length: 6 }, (_value, index) => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - (5 - index));
    return date;
  });

  const monthKeyFormatter = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit'
  });
  const monthLabelFormatter = new Intl.DateTimeFormat('id-ID', {
    month: 'short',
    year: 'numeric'
  });

  const chartBuckets = chartMonths.map(date => {
    const key = monthKeyFormatter.format(date);
    return {
      key,
      month: monthLabelFormatter.format(date),
      Pemasukan: 0,
      Pengeluaran: 0
    };
  });

  const bucketIndex = new Map(chartBuckets.map((bucket, index) => [bucket.key, index]));

  successfulDonations.forEach(donation => {
    const donationDate = new Date(donation.donatedAt);
    const key = monthKeyFormatter.format(donationDate);
    const bucketIndexValue = bucketIndex.get(key);
    if (bucketIndexValue !== undefined) {
      chartBuckets[bucketIndexValue].Pemasukan += donation.amount;
    }
  });

  approvedExpenses.forEach(expense => {
    const expenseDate = new Date(expense.transactionDate);
    const key = monthKeyFormatter.format(expenseDate);
    const bucketIndexValue = bucketIndex.get(key);
    if (bucketIndexValue !== undefined) {
      chartBuckets[bucketIndexValue].Pengeluaran += expense.amount;
    }
  });

  const chartData = chartBuckets;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 text-slate-900">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white rounded-3xl p-8 sm:p-12 shadow-md border border-emerald-600 relative overflow-hidden">
        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-white border border-white/30 text-xs font-bold uppercase tracking-wider">
            <PieChart className="w-4 h-4 text-amber-300" />
            <span>Laporan Transparansi Keuangan Terbuka</span>
          </div>

          <h1 className="font-serif font-black text-3xl sm:text-4xl text-white tracking-tight">
            Akuntabilitas Publik & Keterbukaan Dana Donasi YatimCare
          </h1>

          <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed font-normal">
            Sebagai bentuk amanah, seluruh transaksi donasi disimpan terlebih dahulu sebagai pending, lalu dicatat ke laporan keuangan setelah divalidasi admin. Riwayatnya tetap dapat diverifikasi kuitansinya tanpa membuka data sensitif identitas anak.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-emerald-100 font-bold">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              Audit Sistem Otomatis
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-amber-300" />
              Perlindungan Privasi Anak Pasbita
            </span>
          </div>
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Total Donasi Masuk</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700">
            Rp {financialSummary.totalDonationReceived.toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] text-slate-500">{successfulDonations.length} Transaksi Diverifikasi</p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Total Pengeluaran Bantuan</span>
            <ArrowDownRight className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            Rp {financialSummary.totalExpenseApproved.toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] text-slate-500">{approvedExpenses.length} Alokasi Program Bantuan</p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Saldo Kas Berjalan</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600">
            Rp {financialSummary.currentBalance.toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] text-emerald-700 font-medium">Formula: Pemasukan - Pengeluaran</p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Anak Penerima Aktif</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            {financialSummary.totalActiveChildren} <span className="text-xs font-normal text-slate-500">Anak</span>
          </p>
          <p className="text-[11px] text-slate-500">Yatim, Piatu & Yatim Piatu</p>
        </div>
      </div>

      {/* Financial Trend Chart */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-sans font-black text-xl text-slate-900">Grafik Arus Kas Pemasukan vs Pengeluaran</h3>
            <p className="text-xs text-slate-500 mt-0.5">Perbandingan donasi dan pengeluaran berdasarkan transaksi terbaru yang tersimpan di database.</p>
          </div>
          <span className="text-xs font-bold px-3.5 py-1.5 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
            Rekonsiliasi Real-Time
          </span>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} style={{ fontSize: '11px', fill: '#64748b' }} />
              <YAxis
                tickLine={false}
                axisLine={false}
                style={{ fontSize: '11px', fill: '#64748b' }}
                tickFormatter={(val) => `Rp ${(val/1000000).toFixed(0)}Jt`}
              />
              <Tooltip
                formatter={(value: any) => [`Rp ${Number(value).toLocaleString('id-ID')}`, '']}
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', color: '#0f172a', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="Pemasukan" fill="#059669" radius={[8, 8, 0, 0]} barSize={24} />
              <Bar dataKey="Pengeluaran" fill="#94a3b8" radius={[8, 8, 0, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cashbook Logs Grid (Pemasukan & Pengeluaran) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Income / Donations Log */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <h3 className="font-sans font-black text-base text-slate-900">Buku Kas Donasi Masuk (Verifikasi)</h3>
            </div>
            <span className="text-xs font-bold text-slate-500">{successfulDonations.length} Transaksi</span>
          </div>

          <div className="space-y-3">
            {successfulDonations.map(don => (
              <div key={don.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-900">
                    {don.isAnonymous ? 'Hamba Allah (Anonim)' : don.donorName}
                  </p>
                  <p className="text-[11px] text-slate-600">{don.programTitle}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{don.transactionNumber} • {new Date(don.donatedAt).toLocaleDateString('id-ID')}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-emerald-700 text-sm">
                    +Rp {don.amount.toLocaleString('id-ID')}
                  </p>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold uppercase mt-0.5">
                    {don.paymentMethod.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Expense / Aid Distribution Log */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <h3 className="font-sans font-black text-base text-slate-900">Buku Pengeluaran & Penyaluran</h3>
            </div>
            <span className="text-xs font-bold text-slate-500">{approvedExpenses.length} Alokasi</span>
          </div>

          <div className="space-y-3">
            {approvedExpenses.map(exp => (
              <div key={exp.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-900">{exp.purpose}</p>
                  <p className="text-[11px] text-slate-600">Penerima: {exp.recipientName}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{exp.expenseNumber} • {exp.transactionDate}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-slate-900 text-sm">
                    -Rp {exp.amount.toLocaleString('id-ID')}
                  </p>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold mt-0.5">
                    {exp.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Child Privacy Guarantee Banner */}
      <div className="p-6 bg-emerald-50/80 rounded-3xl border border-emerald-200 text-xs text-slate-700 space-y-2 text-center max-w-3xl mx-auto shadow-xs">
        <div className="flex items-center justify-center gap-2 font-black text-slate-900">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Komitmen Perlindungan Privasi & Keselamatan Anak Yatim Piatu</span>
        </div>
        <p className="leading-relaxed">
          Sesuai standar etik, NIK lengkap, nomor Kartu Keluarga, alamat rumah rinci, dan dokumen asli anak tidak dipublikasikan secara umum. Seluruh akses verifikasi dokumen dibatasi hanya untuk Pengurus & Auditor resmi Yayasan.
        </p>
      </div>

    </div>
  );
};
