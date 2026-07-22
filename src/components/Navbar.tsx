import React, { useState } from 'react';
import {
  Heart,
  Users,
  MapPin,
  PieChart,
  ShieldCheck,
  FileText,
  Building2,
  HandHeart,
  ChevronDown,
  UserCheck,
  LogOut,
  Sparkles,
  Award,
  BookOpen
} from 'lucide-react';
import { UserRole } from '../types';
import { db } from '../services/dbStore';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenDonationModal: () => void;
  onRefreshData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenDonationModal,
  onRefreshData
}) => {
  const currentUser = db.getCurrentUser();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const handleRoleChange = (role: UserRole) => {
    db.switchRole(role);
    setRoleMenuOpen(false);
    onRefreshData();
    // Default navigate to relevant tab
    if (role === 'donatur') setActiveTab('donor-dash');
    else if (role === 'wali') setActiveTab('guardian-dash');
    else if (role === 'super_admin' || role === 'admin' || role === 'bendahara' || role === 'petugas') setActiveTab('admin-dash');
    else setActiveTab('landing');
  };

  const roleLabels: Record<UserRole, { label: string; bg: string; color: string }> = {
    super_admin: { label: 'Super Admin', bg: 'bg-purple-100', color: 'text-purple-800' },
    admin: { label: 'Administrator', bg: 'bg-indigo-100', color: 'text-indigo-800' },
    bendahara: { label: 'Bendahara', bg: 'bg-amber-100', color: 'text-amber-800' },
    petugas: { label: 'Petugas Lapangan', bg: 'bg-blue-100', color: 'text-blue-800' },
    donatur: { label: 'Donatur', bg: 'bg-emerald-100', color: 'text-emerald-800' },
    wali: { label: 'Wali / Pengaju', bg: 'bg-rose-100', color: 'text-rose-800' },
    public: { label: 'Pengunjung Umum', bg: 'bg-slate-100', color: 'text-slate-700' }
  };

  const currentRoleInfo = roleLabels[currentUser?.role || 'public'];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 text-slate-800 shadow-xs">
      {/* Top Banner Notice */}
      <div className="bg-emerald-700 text-white text-xs py-1.5 px-4 text-center flex items-center justify-center gap-2 font-medium tracking-wide">
        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
        <span>Sistem Informasi Terpadu & Transparan Yayasan Yatim Piatu — Terdaftar & Terverifikasi Kemenkumham</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <button
            id="nav-logo-btn"
            onClick={() => setActiveTab('landing')}
            className="flex items-center gap-3 group text-left focus:outline-hidden cursor-pointer"
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <Heart className="w-5 h-5 fill-white text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-extrabold text-xl text-slate-900 tracking-tight">YatimCare</span>
                <span className="text-[9px] uppercase tracking-wider font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Yayasan
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Peduli Yatim & Transparan</p>
            </div>
          </button>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center gap-1.5">
            <button
              id="nav-beranda-btn"
              onClick={() => setActiveTab('landing')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'landing' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Beranda
            </button>

            <button
              id="nav-peta-btn"
              onClick={() => setActiveTab('peta')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'peta' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <MapPin className="w-4 h-4" />
              Peta Sebaran
            </button>

            <button
              id="nav-program-btn"
              onClick={() => setActiveTab('program')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'program' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <HandHeart className="w-4 h-4" />
              Program Donasi
            </button>

            <button
              id="nav-transparansi-btn"
              onClick={() => setActiveTab('transparansi')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'transparansi' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <PieChart className="w-4 h-4" />
              Transparansi
            </button>

            <button
              id="nav-daftar-donatur-btn"
              onClick={() => setActiveTab('pendaftaran-donatur')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'pendaftaran-donatur' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Daftar Donatur</span>
            </button>

            {/* Role specific portal shortcuts */}
            {currentUser?.role === 'wali' && (
              <button
                id="nav-wali-portal-btn"
                onClick={() => setActiveTab('guardian-dash')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'guardian-dash' ? 'bg-rose-600 text-white shadow-xs' : 'text-rose-700 bg-rose-50 hover:bg-rose-100'
                }`}
              >
                <Users className="w-4 h-4" />
                Portal Wali
              </button>
            )}

            {currentUser?.role === 'donatur' && (
              <button
                id="nav-donatur-portal-btn"
                onClick={() => setActiveTab('donor-dash')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'donor-dash' ? 'bg-emerald-700 text-white shadow-xs' : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                }`}
              >
                <Award className="w-4 h-4" />
                Dashboard Donatur
              </button>
            )}

            {(currentUser?.role === 'super_admin' || currentUser?.role === 'admin' || currentUser?.role === 'bendahara' || currentUser?.role === 'petugas') && (
              <button
                id="nav-admin-portal-btn"
                onClick={() => setActiveTab('admin-dash')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'admin-dash' ? 'bg-indigo-600 text-white shadow-xs' : 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Panel Pengurus
              </button>
            )}
          </nav>

          {/* Right Action & Role Switcher */}
          <div className="flex items-center gap-3">
            
            {/* Berdonasi Quick Button */}
            <button
              id="nav-berdonasi-modal-btn"
              onClick={onOpenDonationModal}
              className="px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-sm transition-all flex items-center gap-2 active:scale-98 cursor-pointer"
            >
              <Heart className="w-4 h-4 fill-slate-950" />
              <span>Berdonasi</span>
            </button>

            {/* Role Switcher Menu */}
            <div className="relative">
              <button
                id="role-switcher-toggle-btn"
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className={`px-3.5 py-1.5 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center gap-2 text-xs font-bold text-slate-800 transition-all cursor-pointer`}
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                <div className="text-left hidden sm:block">
                  <p className="text-[9px] text-slate-400 leading-tight uppercase font-semibold">Simulasi Peran</p>
                  <p className={`font-bold ${currentRoleInfo.color}`}>{currentRoleInfo.label}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-3xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">Ganti Peran Akses Demo</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Pilih simulasi peran pengguna untuk menguji semua fitur blueprint.</p>
                  </div>

                  <div className="py-2 space-y-1">
                    <button
                      id="role-btn-public"
                      onClick={() => handleRoleChange('public')}
                      className={`w-full text-left px-3.5 py-2 rounded-2xl text-xs font-semibold hover:bg-slate-50 flex items-center justify-between transition-colors cursor-pointer ${
                        !currentUser ? 'bg-slate-100 font-bold text-slate-900' : 'text-slate-700'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-slate-400" />
                        Pengunjung Umum (Publik)
                      </span>
                      {!currentUser && <span className="text-[10px] text-emerald-700 font-bold">Aktif</span>}
                    </button>

                    <button
                      id="role-btn-donatur"
                      onClick={() => handleRoleChange('donatur')}
                      className={`w-full text-left px-3.5 py-2 rounded-2xl text-xs font-semibold hover:bg-emerald-50 flex items-center justify-between transition-colors cursor-pointer ${
                        currentUser?.role === 'donatur' ? 'bg-emerald-50 font-bold text-emerald-800' : 'text-slate-700'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-600" />
                        Donatur (Hj. Ratna Pertiwi)
                      </span>
                      {currentUser?.role === 'donatur' && <span className="text-[10px] text-emerald-700 font-bold">Aktif</span>}
                    </button>

                    <button
                      id="role-btn-wali"
                      onClick={() => handleRoleChange('wali')}
                      className={`w-full text-left px-3.5 py-2 rounded-2xl text-xs font-semibold hover:bg-rose-50 flex items-center justify-between transition-colors cursor-pointer ${
                        currentUser?.role === 'wali' ? 'bg-rose-50 font-bold text-rose-800' : 'text-slate-700'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        Wali / Pengaju (Sri Mulyani)
                      </span>
                      {currentUser?.role === 'wali' && <span className="text-[10px] text-rose-700 font-bold">Aktif</span>}
                    </button>

                    <button
                      id="role-btn-petugas"
                      onClick={() => handleRoleChange('petugas')}
                      className={`w-full text-left px-3.5 py-2 rounded-2xl text-xs font-semibold hover:bg-blue-50 flex items-center justify-between transition-colors cursor-pointer ${
                        currentUser?.role === 'petugas' ? 'bg-blue-50 font-bold text-blue-800' : 'text-slate-700'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        Petugas Lapangan (Budi)
                      </span>
                      {currentUser?.role === 'petugas' && <span className="text-[10px] text-blue-700 font-bold">Aktif</span>}
                    </button>

                    <button
                      id="role-btn-bendahara"
                      onClick={() => handleRoleChange('bendahara')}
                      className={`w-full text-left px-3.5 py-2 rounded-2xl text-xs font-semibold hover:bg-amber-50 flex items-center justify-between transition-colors cursor-pointer ${
                        currentUser?.role === 'bendahara' ? 'bg-amber-50 font-bold text-amber-800' : 'text-slate-700'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        Bendahara (Siti Aminah, S.E.)
                      </span>
                      {currentUser?.role === 'bendahara' && <span className="text-[10px] text-amber-700 font-bold">Aktif</span>}
                    </button>

                    <button
                      id="role-btn-superadmin"
                      onClick={() => handleRoleChange('super_admin')}
                      className={`w-full text-left px-3.5 py-2 rounded-2xl text-xs font-semibold hover:bg-purple-50 flex items-center justify-between transition-colors cursor-pointer ${
                        currentUser?.role === 'super_admin' ? 'bg-purple-50 font-bold text-purple-800' : 'text-slate-700'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-500" />
                        Super Admin / Pimpinan
                      </span>
                      {currentUser?.role === 'super_admin' && <span className="text-[10px] text-purple-700 font-bold">Aktif</span>}
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
