import React, { useState } from 'react';
import {
  Heart,
  UserCheck,
  Building,
  Users,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  HandHeart,
  Calendar,
  X,
  Lock,
  Award,
  DollarSign
} from 'lucide-react';
import { DonorType } from '../../types';
import { db } from '../../services/dbStore';

interface DonorRegistrationFormProps {
  onSuccess?: (donorId: string) => void;
  onNavigate?: (tab: string) => void;
  onOpenDonationModal?: () => void;
  onClose?: () => void;
  isModal?: boolean;
}

export const DonorRegistrationForm: React.FC<DonorRegistrationFormProps> = ({
  onSuccess,
  onNavigate,
  onOpenDonationModal,
  onClose,
  isModal = false
}) => {
  const [donorType, setDonorType] = useState<DonorType>('individu');
  const [fullName, setFullName] = useState<string>('');
  const [institutionName, setInstitutionName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  
  const [commitmentCategory, setCommitmentCategory] = useState<string>('Orang Tua Asuh (Santunan Rutin Yatim)');
  const [frequency, setFrequency] = useState<string>('Bulanan');
  const [selectedNominal, setSelectedNominal] = useState<number>(250000);
  const [customNominal, setCustomNominal] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');

  const [submittedDonor, setSubmittedDonor] = useState<{
    id: string;
    donorNumber: string;
    fullName: string;
    amount: number;
    email: string;
  } | null>(null);

  const nominalOptions = [100000, 250000, 500000, 1000000];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalAmount = selectedNominal === 0 ? (parseInt(customNominal) || 0) : selectedNominal;
    const finalName = donorType === 'individu' ? fullName : (institutionName || fullName);

    if (!finalName || !email || !phone) {
      alert('Mohon lengkapi Nama, Email, dan Nomor Kontak WhatsApp.');
      return;
    }

    const newDonor = db.registerDonor({
      fullName: finalName,
      donorType: donorType,
      institutionName: donorType !== 'individu' ? institutionName : undefined,
      email,
      phone,
      address: `${address} ${city ? `(${city})` : ''}`.trim(),
      isAnonymousDefault: isAnonymous,
      isRecurringDonor: true,
      commitmentAmount: finalAmount,
      commitmentFrequency: frequency,
      notes
    });

    setSubmittedDonor({
      id: newDonor.id,
      donorNumber: newDonor.donorNumber,
      fullName: newDonor.fullName,
      amount: finalAmount,
      email: newDonor.email
    });

    if (onSuccess) {
      onSuccess(newDonor.id);
    }
  };

  return (
    <div className={`w-full ${isModal ? '' : 'max-w-4xl mx-auto py-8 px-4 sm:px-6'}`}>
      <div className="bg-white rounded-[32px] border border-slate-200/80 shadow-xl overflow-hidden text-slate-900 relative">
        
        {/* Header Section */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-6 sm:p-8 relative overflow-hidden">
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
              title="Tutup Form"
              aria-label="Tutup Form"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 text-white border border-white/30 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Program Donatur Tetap & Orang Tua Asuh Yatim</span>
            </div>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-white">
              Form Pendaftaran Donatur Tetap
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-normal">
              Mari bergabung menjadi bagian dari kebaikan berkelanjutan untuk menjamin pendidikan, gizi, dan kebutuhan dasar adik-adik yatim/piatu binaan Yayasan YatimCare.
            </p>
          </div>
        </div>

        {/* Content Body */}
        {submittedDonor ? (
          /* SUCCESS STATE */
          <div className="p-8 sm:p-12 text-center space-y-6 animate-in fade-in duration-200">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold text-xs uppercase tracking-wider">
                ID DONATUR: {submittedDonor.donorNumber}
              </span>
              <h3 className="font-serif font-bold text-2xl text-slate-900 pt-2">
                Pendaftaran Donatur Berhasil!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                Jazakallah Khairan Katshiran, Bpk/Ibu <strong className="text-slate-900">{submittedDonor.fullName}</strong>. Data Anda telah resmi terdaftar sebagai Donatur Tetap YatimCare.
              </p>
            </div>

            {/* Digital Donor Pass Card */}
            <div className="max-w-md mx-auto bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 text-white rounded-3xl p-6 shadow-xl border border-emerald-600 text-left space-y-4 relative overflow-hidden">
              <div className="flex justify-between items-start border-b border-white/10 pb-3">
                <div>
                  <p className="text-[10px] text-emerald-300 uppercase font-bold tracking-wider">Kartu Donatur Digital</p>
                  <p className="font-bold text-sm text-white">{submittedDonor.fullName}</p>
                </div>
                <Award className="w-6 h-6 text-amber-300" />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-[10px] text-slate-400">Komitmen Rutin</p>
                  <p className="font-bold text-amber-300">Rp {submittedDonor.amount.toLocaleString('id-ID')} / bln</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Status Keanggotaan</p>
                  <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                    Aktif & Terverifikasi
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 text-[10px] text-slate-400 flex items-center justify-between">
                <span>{submittedDonor.email}</span>
                <span>YatimCare Sumedang</span>
              </div>
            </div>

            {/* Action Buttons after registration */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              {onOpenDonationModal && (
                <button
                  onClick={() => {
                    if (onClose) onClose();
                    onOpenDonationModal();
                  }}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-98"
                >
                  <Heart className="w-4 h-4 fill-white" />
                  <span>Salurkan Donasi Pertama Sekarang</span>
                </button>
              )}

              {onNavigate && (
                <button
                  onClick={() => {
                    if (onClose) onClose();
                    onNavigate('landing');
                  }}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-2xl transition-colors cursor-pointer"
                >
                  Kembali ke Beranda
                </button>
              )}

              {onClose && (
                <button
                  onClick={onClose}
                  className="px-5 py-3 text-slate-500 hover:text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                >
                  Selesai / Tutup
                </button>
              )}
            </div>
          </div>
        ) : (
          /* FORM STATE */
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 text-xs text-slate-700">
            
            {/* 1. Kategori Donatur */}
            <div className="space-y-2">
              <label className="font-bold text-slate-900 block text-xs uppercase tracking-wider">
                1. Kategori Donatur
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'individu', label: 'Individu', icon: UserCheck },
                  { id: 'perusahaan', label: 'Perusahaan', icon: Building },
                  { id: 'organisasi', label: 'Organisasi', icon: Users },
                  { id: 'komunitas', label: 'Komunitas', icon: HandHeart }
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setDonorType(item.id as DonorType)}
                      className={`py-3 px-3 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        donorType === item.id
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Informasi Kontak */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <label className="font-bold text-slate-900 block text-xs uppercase tracking-wider">
                2. Profil & Kontak Donatur
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {donorType === 'individu' ? 'Nama Lengkap *' : 'Nama Perusahaan / Organisasi *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder={donorType === 'individu' ? 'misal: H. Ahmad Subagja' : 'misal: PT Maju Bersama'}
                    className="w-full p-3 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-hidden bg-slate-50/50"
                  />
                </div>

                {donorType !== 'individu' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Nama Penanggung Jawab
                    </label>
                    <input
                      type="text"
                      value={institutionName}
                      onChange={e => setInstitutionName(e.target.value)}
                      placeholder="misal: Bpk. Kurniawan (Humas)"
                      className="w-full p-3 rounded-xl border border-slate-200 focus:border-emerald-600 outline-hidden bg-slate-50/50"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Alamat Email (Untuk Bukti Laporan) *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full p-3 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-hidden bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Nomor WhatsApp / Telepon *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="08123456789"
                    className="w-full p-3 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-hidden bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Kota / Kabupaten
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="misal: Sumedang / Bandung / Jakarta"
                    className="w-full p-3 rounded-xl border border-slate-200 focus:border-emerald-600 outline-hidden bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Alamat Lengkap (Opsional)
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Jalan, RT/RW, Kelurahan, Kecamatan"
                    className="w-full p-3 rounded-xl border border-slate-200 focus:border-emerald-600 outline-hidden bg-slate-50/50"
                  />
                </div>
              </div>
            </div>

            {/* 3. Komitmen Donasi Rutin */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <label className="font-bold text-slate-900 block text-xs uppercase tracking-wider">
                3. Komitmen Donasi & Program
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Program Pilihan
                  </label>
                  <select
                    value={commitmentCategory}
                    onChange={e => setCommitmentCategory(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 focus:border-emerald-600 outline-hidden bg-slate-50/50"
                  >
                    <option value="Orang Tua Asuh (Santunan Rutin Yatim)">Orang Tua Asuh (Santunan Rutin Yatim)</option>
                    <option value="Beasiswa Pendidikan Yatim & Piatu">Beasiswa Pendidikan Yatim & Piatu</option>
                    <option value="Paket Sembako & Nutrisi Gizi">Paket Sembako & Nutrisi Gizi</option>
                    <option value="Infaq & Zakat Terikat Yayasan">Infaq & Zakat Terikat Yayasan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Frekuensi Donasi
                  </label>
                  <select
                    value={frequency}
                    onChange={e => setFrequency(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 focus:border-emerald-600 outline-hidden bg-slate-50/50 font-semibold text-slate-800"
                  >
                    <option value="Bulanan">Setiap Bulan (Rutin)</option>
                    <option value="3 Bulanan">Setiap 3 Bulan (Triwulan)</option>
                    <option value="6 Bulanan">Setiap 6 Bulan (Semester)</option>
                    <option value="Tahunan">Setiap Tahun</option>
                  </select>
                </div>
              </div>

              {/* Nominal Buttons */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-2">
                  Pilih Nominal Komitmen Per Periode ({frequency})
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {nominalOptions.map(amt => (
                    <button
                      type="button"
                      key={amt}
                      onClick={() => {
                        setSelectedNominal(amt);
                        setCustomNominal('');
                      }}
                      className={`py-3 px-3 rounded-2xl border font-black text-xs transition-all cursor-pointer ${
                        selectedNominal === amt
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Rp {amt.toLocaleString('id-ID')}
                    </button>
                  ))}
                </div>

                <div className="mt-3">
                  <input
                    type="number"
                    value={customNominal}
                    onChange={e => {
                      setCustomNominal(e.target.value);
                      setSelectedNominal(0);
                    }}
                    placeholder="Atau masukkan nominal kustom lainnya (Rp)"
                    className="w-full p-3 rounded-xl border border-slate-200 focus:border-emerald-600 outline-hidden bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Anonymous Checkbox */}
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={e => setIsAnonymous(e.target.checked)}
                    className="w-4 h-4 rounded-md text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-slate-700">
                    Sembunyikan nama saya di laporan publik (Gunakan julukan Hamba Allah)
                  </span>
                </label>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Niat Doa / Pesan Kebaikan untuk Anak-Anak Yatim (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Tuliskan do'a atau harapan untuk anak-anak binaan..."
                  className="w-full p-3 rounded-xl border border-slate-200 focus:border-emerald-600 outline-hidden bg-slate-50/50 text-xs"
                />
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Batal / Tutup
                </button>
              )}

              <button
                type="submit"
                className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-98"
              >
                <UserCheck className="w-4 h-4" />
                <span>Daftar Jadi Donatur Tetap</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
