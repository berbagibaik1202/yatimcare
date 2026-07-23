import React from 'react';
import {
  Heart,
  Users,
  ShieldCheck,
  TrendingUp,
  HandHeart,
  BookOpen,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Building2,
  Sparkles,
  PieChart,
  ChevronRight,
  PhoneCall,
  UserCheck,
  Award,
  Calendar
} from 'lucide-react';
import { Program, Child, NewsItem, FinancialSummary } from '../../types';
import { db } from '../../services/dbStore';
import { CountUpNumber } from '../common/CountUpNumber';
import { ImageWithFallback } from '../common/ImageWithFallback';

interface PublicLandingProps {
  onOpenDonationModal: (programId?: string) => void;
  onNavigate: (tab: string) => void;
  onRefreshData: () => void;
}

export const PublicLanding: React.FC<PublicLandingProps> = ({
  onOpenDonationModal,
  onNavigate
}) => {
  const financialSummary: FinancialSummary = db.getFinancialSummary();
  const programs: Program[] = db.getPrograms();
  const activeChildren: Child[] = db.getChildren().filter(c => c.status === 'aktif');
  const newsList: NewsItem[] = db.getNews();
  const bankAccounts = db.getBankAccounts();

  return (
    <div className="space-y-12 pb-16 pt-4">
      
      {/* HERO BENTO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-[36px] p-8 sm:p-12 overflow-hidden shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Sistem Informasi Terpadu & Transparan Yayasan Yatim Piatu</span>
              </div>

              <h1 className="font-serif font-extrabold text-3xl sm:text-4xl lg:text-5xl leading-tight tracking-tight text-white">
                Menebar Senyum & Harapan Masa Depan untuk <span className="text-amber-300 underline decoration-amber-300/40 underline-offset-8">Sesama</span>
              </h1>

              <p className="text-emerald-100 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
                Platform terpusat untuk mendata anak yatim/piatu secara valid, mengelola donasi secara akuntabel, dan menyalurkan santunan serta beasiswa pendidikan secara terbuka.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  id="hero-berdonasi-btn"
                  onClick={() => onOpenDonationModal()}
                  className="px-6 py-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-sm rounded-2xl shadow-lg transition-all flex items-center gap-2.5 cursor-pointer active:scale-98"
                >
                  <Heart className="w-5 h-5 fill-slate-950" />
                  <span>Salurkan Donasi</span>
                </button>

                <button
                  id="hero-daftar-donatur-btn"
                  onClick={() => onNavigate('pendaftaran-donatur')}
                  className="px-6 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-2xl border border-emerald-400/30 shadow-lg transition-all flex items-center gap-2.5 cursor-pointer active:scale-98"
                >
                  <UserCheck className="w-5 h-5 text-amber-300" />
                  <span>Daftar Donatur Tetap</span>
                </button>

                <button
                  id="hero-pengajuan-btn"
                  onClick={() => onNavigate('guardian-dash')}
                  className="px-6 py-4 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-2xl border border-white/20 backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Users className="w-4 h-4 text-emerald-300" />
                  <span>Pengajuan Anak Baru</span>
                </button>
              </div>

              {/* Security Badge */}
              <div className="pt-4 flex items-center gap-6 text-xs text-emerald-200/80 border-t border-emerald-700/50">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-300" />
                  <span>Audit Keuangan Terbuka</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-300" />
                  <span>Validasi NIK & Survei Rumah</span>
                </div>
              </div>
            </div>

            {/* Right Card Summary Bento */}
            <div className="lg:col-span-5">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[28px] p-6 sm:p-8 space-y-6 shadow-lg text-white">
                <div className="flex items-center justify-between pb-4 border-b border-white/15">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-300">Ringkasan Real-Time</span>
                  <span className="text-[10px] bg-amber-400/20 text-amber-200 border border-amber-400/30 px-2.5 py-1 rounded-full font-mono font-bold">2026 Live</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white/10 border border-white/10">
                    <p className="text-xs text-emerald-200 font-medium">Anak Terdaftar</p>
                    <CountUpNumber
                      value={financialSummary.totalActiveChildren}
                      className="text-2xl font-black text-white mt-1 inline-flex items-baseline gap-1"
                      suffix=" Anak"
                    />
                    <p className="text-[11px] text-amber-300 mt-1 font-semibold">Yatim, Piatu & YP</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/10 border border-white/10">
                    <p className="text-xs text-emerald-200 font-medium">Total Donatur</p>
                    <CountUpNumber
                      value={financialSummary.totalActiveDonors}
                      className="text-2xl font-black text-white mt-1 inline-flex items-baseline gap-1"
                      suffix=" Orang"
                    />
                    <p className="text-[11px] text-amber-300 mt-1 font-semibold">Aktif & Dermawan</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/10 border border-white/10 col-span-2">
                    <p className="text-xs text-emerald-200 font-medium">Total Dana Bantuan Disalurkan</p>
                    <CountUpNumber
                      value={financialSummary.totalDistributedAid}
                      className="text-3xl font-black text-amber-300 mt-1 inline-flex items-baseline gap-1"
                      prefix="Rp "
                    />
                    <div className="mt-3 w-full bg-black/20 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-full rounded-full" style={{ width: '88%' }} />
                    </div>
                    <p className="text-[10px] text-emerald-200 mt-1.5 text-right font-medium">88% Dana Terpakai Langsung untuk Bantuan</p>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('transparansi')}
                  className="w-full py-3 bg-white/15 hover:bg-white/25 text-amber-300 border border-white/20 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Buka Laporan Transparansi Keuangan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* STATS BREAKDOWN STRIP BENTO */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs text-center space-y-1">
            <CountUpNumber value={financialSummary.totalOrphanYatim} className="text-3xl font-black text-slate-900" />
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Anak Yatim</p>
            <p className="text-[11px] text-slate-500">Ayah Meninggal Dunia</p>
          </div>
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs text-center space-y-1">
            <CountUpNumber value={financialSummary.totalOrphanPiatu} className="text-3xl font-black text-slate-900" />
            <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">Anak Piatu</p>
            <p className="text-[11px] text-slate-500">Ibu Meninggal Dunia</p>
          </div>
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs text-center space-y-1">
            <CountUpNumber value={financialSummary.totalOrphanYatimPiatu} className="text-3xl font-black text-slate-900" />
            <p className="text-xs font-bold text-rose-700 uppercase tracking-wider">Anak Yatim Piatu</p>
            <p className="text-[11px] text-slate-500">Kedua Orang Tua Meninggal</p>
          </div>
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs text-center space-y-1">
            <CountUpNumber
              value={financialSummary.currentBalance / 1000000}
              decimals={1}
              prefix="Rp "
              suffix=" Jt"
              className="text-3xl font-black text-emerald-700"
            />
            <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">Saldo Kas Tersedia</p>
            <p className="text-[11px] text-slate-500">Siap Penyaluran Berikutnya</p>
          </div>
        </div>
      </div>

      {/* DONOR REGISTRATION PROMOTIONAL BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white rounded-3xl p-8 sm:p-10 border border-emerald-600 shadow-md flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="space-y-4 max-w-2xl text-left relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 text-white border border-white/30 text-xs font-bold uppercase tracking-wider">
              <Award className="w-4 h-4 text-amber-300" />
              <span>Program Orang Tua Asuh & Donatur Rutin</span>
            </div>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-white">
              Ingin Menjadi Donatur Tetap atau Orang Tua Asuh Anak Yatim?
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed font-normal">
              Daftarkan diri Anda atau instansi Anda sekarang. Dapatkan akses dashboard laporan perkembangan anak binaan, bukti kuitansi digital, dan kepastian penyaluran bantuan tepat sasaran setiap bulannya.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-emerald-100">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-300" /> Santunan Pendidikan & Gizi
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-300" /> Kuitansi & Laporan Transparan
              </span>
            </div>
          </div>

          <div className="shrink-0 relative z-10">
            <button
              id="banner-pendaftaran-donatur-btn"
              onClick={() => onNavigate('pendaftaran-donatur')}
              className="px-8 py-4 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl shadow-md transition-all flex items-center gap-2.5 cursor-pointer active:scale-98"
            >
              <UserCheck className="w-5 h-5 text-slate-950" />
              <span>Form Pendaftaran Donatur →</span>
            </button>
          </div>
        </div>
      </section>

      {/* FEATURED PROGRAMS SECTION BENTO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider">
              <HandHeart className="w-4 h-4 text-emerald-600" />
              <span>Program Penggalangan Dana Utama</span>
            </div>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-slate-900 mt-1 tracking-tight">
              Bantu Wujudkan Masa Depan Mereka
            </h2>
          </div>

          <button
            onClick={() => onNavigate('program')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Lihat Semua Program</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {programs.map(prog => {
            const pct = Math.min(100, Math.round((prog.collectedAmount / prog.targetAmount) * 100));
            return (
              <div
                key={prog.id}
                className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-48 overflow-hidden">
                    <ImageWithFallback
                      src={prog.thumbnail}
                      alt={prog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-emerald-300 border border-white/10 text-[10px] font-bold uppercase tracking-wider">
                      {prog.category}
                    </span>
                  </div>

                  <div className="p-6 space-y-4">
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2">
                      {prog.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {prog.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 pt-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 font-medium">Terkumpul:</span>
                        <CountUpNumber
                          value={prog.collectedAmount}
                          prefix="Rp "
                          className="font-bold text-emerald-700"
                        />
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-500">
                        <span>
                          Target: <CountUpNumber value={prog.targetAmount} prefix="Rp " />
                        </span>
                        <CountUpNumber value={pct} suffix="%" className="font-bold text-slate-700" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <button
                    onClick={() => onOpenDonationModal(prog.id)}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <Heart className="w-3.5 h-3.5 fill-white" />
                    <span>Donasi Sekarang</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ANONYMIZED PUBLIC ORPHAN SHOWCASE BENTO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="bg-white rounded-[32px] p-8 sm:p-10 border border-slate-200/80 shadow-xs space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase text-emerald-700 tracking-wider">Anak Penerima Manfaat</span>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-slate-900">
              Adik-Adik Yatim & Piatu yang Membutuhkan Dukungan
            </h2>
            <p className="text-xs text-slate-500">
              Data identitas lengkap, alamat presisi, NIK, dan dokumen anak dilindungi sesuai regulasi privasi perlindungan anak.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeChildren.slice(0, 3).map(child => (
              <div key={child.id} className="bg-slate-50 rounded-3xl p-5 border border-slate-200/80 shadow-xs flex gap-4 items-center">
                <img
                  src={child.photoUrl}
                  alt={child.nickname}
                  className="w-20 h-24 rounded-2xl object-cover shrink-0 border border-slate-200 shadow-xs"
                />
                <div className="space-y-1.5 text-xs text-slate-700">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[9px] uppercase tracking-wider">
                    Kategori {child.orphanCategory.replace('_', ' ')}
                  </span>
                  <h4 className="font-bold text-sm text-slate-900">{child.nickname} ({child.educationLevel})</h4>
                  <p className="text-slate-500 text-[11px]">{child.schoolName}</p>
                  <p className="flex items-center gap-1 text-[11px] text-slate-600">
                    <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>Kec. {child.district}, Sumedang</span>
                  </p>
                  <button
                    onClick={() => onOpenDonationModal()}
                    className="mt-2 px-3 py-1 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl font-bold text-[11px] transition-colors cursor-pointer"
                  >
                    Sponsori Santunan →
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-2">
            <button
              onClick={() => onNavigate('peta')}
              className="px-6 py-3 bg-emerald-600 text-white rounded-2xl text-xs font-bold hover:bg-emerald-700 transition-colors inline-flex items-center gap-2 cursor-pointer shadow-sm active:scale-98"
            >
              <MapPin className="w-4 h-4 text-white" />
              <span>Buka Peta Digital Sebaran Lengkap</span>
            </button>
          </div>
        </div>
      </section>

      {/* OFFICIAL BANK ACCOUNTS BENTO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-[32px] p-8 sm:p-12 shadow-xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative overflow-hidden">
          <div className="md:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/20 text-xs font-semibold uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5" />
              <span>Rekening Resmi Yayasan</span>
            </div>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-white">
              Salurkan Infaq & Zakat Langsung ke Rekening Resmi
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Semua transaksi yang dikirimkan ke rekening yayasan akan diterbitkan bukti kuitansi elektronik resmi setelah diverifikasi oleh Bendahara.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {bankAccounts.map(b => (
                <div key={b.id} className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                  <p className="text-[11px] text-amber-300 font-bold uppercase tracking-wider">{b.bankName}</p>
                  <p className="font-mono font-bold text-base text-white tracking-wider mt-0.5">{b.accountNumber}</p>
                  <p className="text-[10px] text-slate-300">a.n {b.accountHolder}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-5 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-3xl p-6 space-y-4 shadow-lg text-left">
            <h3 className="font-serif font-bold text-lg text-white">Butuh Informasi / Konsultasi?</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Tim pengurus dan petugas layanan YatimCare siap membantu proses pendaftaran anak yatim, verifikasi donasi, atau kunjungan sekretariat.
            </p>

            <div className="space-y-2 text-xs font-medium text-slate-200">
              <p className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-amber-300" />
                <span>Layanan WA: 0812-3456-7890</span>
              </p>
              <p className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                <span>Email: layanan@yatimcare.org</span>
              </p>
            </div>

            <button
              onClick={() => onOpenDonationModal()}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-2xl text-xs font-bold transition-all shadow-md cursor-pointer active:scale-98"
            >
              Konfirmasi Donasi Anda
            </button>
          </div>

        </div>
      </section>

      {/* LATEST NEWS & ACTIVITIES BENTO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Dokumentasi & Berita</span>
            <h2 className="font-serif font-bold text-2xl text-slate-900 mt-0.5">Kabar Kegiatan Yayasan</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {newsList.map(item => (
            <div key={item.id} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-5 items-start group hover:shadow-md transition-all">
              <img
                src={item.thumbnail}
                alt={item.title}
                className="w-full sm:w-40 h-36 rounded-2xl object-cover shrink-0 group-hover:scale-105 transition-transform duration-300"
              />
              <div className="space-y-2 text-xs text-slate-600">
                <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-bold text-[9px] uppercase tracking-wider">
                  {item.category}
                </span>
                <h3 className="font-bold text-base text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors">
                  {item.title}
                </h3>
                <p className="line-clamp-2 text-[11px] leading-relaxed text-slate-500">
                  {item.summary}
                </p>
                <p className="text-[10px] text-slate-400 font-medium pt-1">
                  {new Date(item.publishedAt).toLocaleDateString('id-ID')} • oleh {item.author}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
