import React from 'react';
import { Heart, MapPin, Phone, Mail, ShieldCheck } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
  onOpenDonationModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenDonationModal }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-slate-800">
          
          {/* Col 1: About */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-sm">
                <Heart className="w-5 h-5 fill-white text-white" />
              </div>
              <span className="font-serif font-bold text-xl text-white tracking-tight">YatimCare</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sistem Informasi Terpadu Yayasan Yatim Piatu untuk pendataan anak, pengelolaan donatur, pengeluaran transparan, dan bantuan pendidikan tepat sasaran.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Transparansi Publik & Terverifikasi</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Navigasi Utama</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigate('landing')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  Beranda & Profil
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('program')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  Program Penggalangan Dana
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('peta')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  Peta Sebaran Anak Yatim
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('transparansi')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  Laporan Transparansi Keuangan
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('pendaftaran-donatur')} className="hover:text-emerald-400 transition-colors cursor-pointer font-semibold text-emerald-400">
                  Pendaftaran Donatur Tetap
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('guardian-dash')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  Portal Pengajuan Wali
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Program Highlight */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Program Bantuan</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>• Orang Tua Asuh & Santunan Bulanan</li>
              <li>• Beasiswa Pendidikan & Seragam</li>
              <li>• Sembako & Nutrisi Sehat Keluarga</li>
              <li>• Bantuan Biaya Berobat & Kesehatan</li>
              <li>• Zakat, Infak & Sedekah Maal</li>
            </ul>
          </div>

          {/* Col 4: Contact & Office */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Sekretariat Yayasan</h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Jl. Mayor Abdurrahman No. 88, Sumedang Utara, Kabupaten Sumedang, Jawa Barat 45322</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>(0261) 201-9876 / 0812-3456-7890</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>layanan@yatimcare.org</span>
              </p>
            </div>
            <button
              onClick={onOpenDonationModal}
              className="mt-5 w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs shadow-sm transition-all cursor-pointer active:scale-98"
            >
              Berdonasi Sekarang
            </button>
          </div>

        </div>

        {/* Bottom copyright & privacy notice */}
        <div className="mt-8 flex flex-col md:flex-row items-center justify-between text-[11px] text-slate-500 gap-3">
          <p>© 2025 - 2026 Yayasan Peduli YatimCare Indonesia. Hak Cipta Dilindungi Undang-Undang.</p>
          <div className="flex items-center gap-4 font-medium">
            <span className="hover:text-slate-300 transition-colors cursor-pointer">Kebijakan Privasi Perlindungan Anak</span>
            <span>•</span>
            <span className="hover:text-slate-300 transition-colors cursor-pointer">Syarat & Ketentuan Transparansi</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
