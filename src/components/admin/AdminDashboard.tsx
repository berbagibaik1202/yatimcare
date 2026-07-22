import React, { useEffect, useMemo, useState } from 'react';
import { db } from '../../services/dbStore';
import { ChildrenManager } from './ChildrenManager';
import { GuardiansManager } from './GuardiansManager';
import { ProgramsManager } from './ProgramsManager';
import { SurveyManager } from './SurveyManager';
import { AidDistributionManager } from './AidDistributionManager';
import { DonationsManager } from '../donations/DonationsManager';
import { DonorsListManager } from './DonorsListManager';
import { AdminUsersManager } from './AdminUsersManager';
import { AppSettingsManager } from './AppSettingsManager';
import { FinancialManager } from '../finance/FinancialManager';
import { AuditLogView } from './AuditLogView';
import {
  ShieldCheck,
  Users,
  Heart,
  DollarSign,
  FileCheck,
  BookOpen,
  MapPin,
  PieChart,
  RotateCcw,
  UserCheck,
  UsersRound,
  Settings2,
  Shield
} from 'lucide-react';

interface AdminDashboardProps {
  onRefreshData: () => void;
}

type AdminTabId = 'overview' | 'children' | 'guardians' | 'programs' | 'donors' | 'survey' | 'aid' | 'donations' | 'finance' | 'audit' | 'users' | 'settings';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onRefreshData }) => {
  const [activeAdminSubTab, setActiveAdminSubTab] = useState<AdminTabId>('overview');
  const currentUser = db.getCurrentUser();
  const summary = db.getFinancialSummary();
  const isTreasurer = currentUser?.role === 'bendahara';
  const canManageAdminUsers = currentUser?.role === 'super_admin' || currentUser?.role === 'admin';

  const adminTabs = useMemo(
    () =>
      (isTreasurer
        ? [
            { id: 'overview', label: 'Ringkasan Keuangan', icon: PieChart },
            { id: 'donors', label: 'Data Donatur', icon: UserCheck },
            { id: 'aid', label: 'Penyaluran Bantuan', icon: Heart },
            { id: 'donations', label: 'Donasi Masuk', icon: DollarSign },
            { id: 'finance', label: 'Buku Kas & Pengeluaran', icon: FileCheck }
          ]
        : [
            { id: 'overview', label: 'Ringkasan Utama', icon: PieChart },
            { id: 'children', label: 'Data Anak & Verifikasi', icon: Users },
            { id: 'guardians', label: 'Data Wali', icon: UsersRound },
            { id: 'programs', label: 'Program Donasi', icon: BookOpen },
            { id: 'donors', label: 'Data Donatur', icon: UserCheck },
            { id: 'survey', label: 'Survei Lapangan', icon: MapPin },
            { id: 'aid', label: 'Penyaluran Bantuan', icon: Heart },
            { id: 'donations', label: 'Donasi Masuk', icon: DollarSign },
            { id: 'finance', label: 'Buku Kas & Pengeluaran', icon: FileCheck },
            { id: 'audit', label: 'Audit Log Aktivitas', icon: ShieldCheck },
            ...(canManageAdminUsers ? [
              { id: 'users', label: 'User Aplikasi', icon: Shield },
              { id: 'settings', label: 'Nama Aplikasi', icon: Settings2 }
            ] : [])
          ]) as Array<{ id: AdminTabId; label: string; icon: React.ComponentType<{ className?: string }> }>,
    [canManageAdminUsers, isTreasurer]
  );

  useEffect(() => {
    if (!adminTabs.some(tab => tab.id === activeAdminSubTab)) {
      setActiveAdminSubTab('overview');
    }
  }, [activeAdminSubTab, adminTabs]);

  const handleResetData = () => {
    if (confirm('Muat ulang data terbaru dari database?')) {
      db.resetToDefault();
      onRefreshData();
      alert('Data berhasil dimuat ulang dari database.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-900">
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white rounded-3xl p-8 shadow-md border border-emerald-600 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 text-white border border-white/30 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
            <span>{isTreasurer ? 'Panel Bendahara Yayasan YatimCare' : 'Panel Pengurus Terpadu Yayasan YatimCare'}</span>
          </div>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-white">
            Pusat Pengelolaan Yayasan - {currentUser?.name || 'Administrator'}
          </h1>
          <p className="text-xs text-emerald-100 max-w-2xl leading-relaxed">
            {isTreasurer
              ? 'Kelola mutasi donasi, pengeluaran kas, laporan keuangan, dan penyaluran bantuan.'
              : 'Kelola verifikasi anak yatim, verifikasi mutasi donasi, pengajuan pengeluaran kas, laporan survei lapangan, dan audit aktivitas.'}
          </p>
        </div>

        <button
          onClick={handleResetData}
          className="px-5 py-3 bg-white/20 hover:bg-white/30 text-white text-xs font-bold rounded-2xl border border-white/30 transition-all flex items-center gap-2 cursor-pointer shrink-0 relative z-10"
        >
          <RotateCcw className="w-3.5 h-3.5 text-amber-300" />
          <span>Muat Ulang Data</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4">
        {adminTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeAdminSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveAdminSubTab(tab.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeAdminSubTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
              <span className="text-xs text-slate-500 font-medium">Total Donasi Diterima</span>
              <p className="text-2xl font-black text-emerald-700">
                Rp {summary.totalDonationReceived.toLocaleString('id-ID')}
              </p>
              <p className="text-[11px] text-slate-500">
                {isTreasurer ? 'Fokus pada dana masuk yang sudah terverifikasi' : `${summary.totalActiveDonors} Donatur Terdaftar`}
              </p>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
              <span className="text-xs text-slate-500 font-medium">Total Pengeluaran Kas</span>
              <p className="text-2xl font-black text-rose-700">
                Rp {summary.totalExpenseApproved.toLocaleString('id-ID')}
              </p>
              <p className="text-[11px] text-slate-500">Pengeluaran disetujui atau dibayarkan</p>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
              <span className="text-xs text-slate-500 font-medium">Saldo Kas Berjalan</span>
              <p className="text-2xl font-black text-indigo-700">
                Rp {summary.currentBalance.toLocaleString('id-ID')}
              </p>
              <p className="text-[11px] text-slate-500">Pemasukan - Pengeluaran</p>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
              <span className="text-xs text-slate-500 font-medium">Total Donatur Terdaftar</span>
              <p className="text-3xl font-black text-slate-900">
                {summary.totalActiveDonors} <span className="text-xs font-normal text-slate-500">Donatur</span>
              </p>
              <p className="text-[11px] text-slate-500">Profil donatur aktif di sistem</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-serif font-bold text-lg text-slate-900">
              {isTreasurer ? 'Pintasan Keuangan Bendahara' : 'Pintasan Pengelolaan Pengurus'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-bold">
              {!isTreasurer && (
                <button
                  onClick={() => setActiveAdminSubTab('children')}
                  className="p-5 rounded-2xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200 text-left transition-all cursor-pointer group"
                >
                  <Users className="w-5 h-5 text-emerald-600 mb-2" />
                  <p className="font-bold text-sm text-slate-900 group-hover:text-emerald-800">Verifikasi Data Anak &gt;</p>
                  <p className="font-normal text-slate-500 text-[11px] mt-0.5">Periksa pendaftaran anak baru dan dokumen kependudukan.</p>
                </button>
              )}

              {!isTreasurer && (
                <button
                  onClick={() => setActiveAdminSubTab('guardians')}
                  className="p-5 rounded-2xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200 text-left transition-all cursor-pointer group"
                >
                  <UsersRound className="w-5 h-5 text-emerald-600 mb-2" />
                  <p className="font-bold text-sm text-slate-900 group-hover:text-emerald-800">Data Wali &gt;</p>
                  <p className="font-normal text-slate-500 text-[11px] mt-0.5">Lihat daftar wali dan anak binaan yang terhubung.</p>
                </button>
              )}

              <button
                onClick={() => setActiveAdminSubTab('donations')}
                className="p-5 rounded-2xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200 text-left transition-all cursor-pointer group"
              >
                <DollarSign className="w-5 h-5 text-emerald-600 mb-2" />
                <p className="font-bold text-sm text-slate-900 group-hover:text-emerald-800">Verifikasi Mutasi Donasi &gt;</p>
                <p className="font-normal text-slate-500 text-[11px] mt-0.5">Konfirmasi transaksi pembayaran masuk dan kuitansi.</p>
              </button>

              <button
                onClick={() => setActiveAdminSubTab('finance')}
                className="p-5 rounded-2xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200 text-left transition-all cursor-pointer group"
              >
                <FileCheck className="w-5 h-5 text-emerald-600 mb-2" />
                <p className="font-bold text-sm text-slate-900 group-hover:text-emerald-800">Persetujuan Pengeluaran &gt;</p>
                <p className="font-normal text-slate-500 text-[11px] mt-0.5">Akses persetujuan biaya operasional dan bantuan.</p>
              </button>

              {!isTreasurer && (
                <button
                  onClick={() => setActiveAdminSubTab('survey')}
                  className="p-5 rounded-2xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200 text-left transition-all cursor-pointer group"
                >
                  <MapPin className="w-5 h-5 text-emerald-600 mb-2" />
                  <p className="font-bold text-sm text-slate-900 group-hover:text-emerald-800">Survei Lapangan &gt;</p>
                  <p className="font-normal text-slate-500 text-[11px] mt-0.5">Pantau hasil survey lapangan petugas.</p>
                </button>
              )}

              {!isTreasurer && (
                <button
                  onClick={() => setActiveAdminSubTab('audit')}
                  className="p-5 rounded-2xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200 text-left transition-all cursor-pointer group"
                >
                  <ShieldCheck className="w-5 h-5 text-emerald-600 mb-2" />
                  <p className="font-bold text-sm text-slate-900 group-hover:text-emerald-800">Audit Log Aktivitas &gt;</p>
                  <p className="font-normal text-slate-500 text-[11px] mt-0.5">Riwayat aktivitas pengguna dan sistem.</p>
                </button>
              )}

              {canManageAdminUsers && (
                <>
                  <button
                    onClick={() => setActiveAdminSubTab('programs')}
                    className="p-5 rounded-2xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200 text-left transition-all cursor-pointer group"
                  >
                    <BookOpen className="w-5 h-5 text-emerald-600 mb-2" />
                    <p className="font-bold text-sm text-slate-900 group-hover:text-emerald-800">Program Donasi &gt;</p>
                    <p className="font-normal text-slate-500 text-[11px] mt-0.5">Kelola 3 program utama dan program baru lainnya.</p>
                  </button>

                  <button
                    onClick={() => setActiveAdminSubTab('users')}
                    className="p-5 rounded-2xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200 text-left transition-all cursor-pointer group"
                  >
                    <Shield className="w-5 h-5 text-emerald-600 mb-2" />
                    <p className="font-bold text-sm text-slate-900 group-hover:text-emerald-800">User Aplikasi -&gt;</p>
                    <p className="font-normal text-slate-500 text-[11px] mt-0.5">Lihat daftar akun admin dan staf aplikasi.</p>
                  </button>

                  <button
                    onClick={() => setActiveAdminSubTab('settings')}
                    className="p-5 rounded-2xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200 text-left transition-all cursor-pointer group"
                  >
                    <Settings2 className="w-5 h-5 text-emerald-600 mb-2" />
                    <p className="font-bold text-sm text-slate-900 group-hover:text-emerald-800">Nama Aplikasi -&gt;</p>
                    <p className="font-normal text-slate-500 text-[11px] mt-0.5">Atur nama yang tampil di seluruh aplikasi.</p>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {activeAdminSubTab === 'children' && !isTreasurer && <ChildrenManager onRefreshData={onRefreshData} />}
      {activeAdminSubTab === 'guardians' && !isTreasurer && <GuardiansManager onRefreshData={onRefreshData} />}
      {activeAdminSubTab === 'programs' && canManageAdminUsers && <ProgramsManager onRefreshData={onRefreshData} />}
      {activeAdminSubTab === 'donors' && <DonorsListManager onRefreshData={onRefreshData} />}
      {activeAdminSubTab === 'survey' && !isTreasurer && <SurveyManager onRefreshData={onRefreshData} />}
      {activeAdminSubTab === 'aid' && <AidDistributionManager onRefreshData={onRefreshData} />}
      {activeAdminSubTab === 'donations' && <DonationsManager onRefreshData={onRefreshData} />}
      {activeAdminSubTab === 'finance' && <FinancialManager onRefreshData={onRefreshData} />}
      {activeAdminSubTab === 'audit' && !isTreasurer && <AuditLogView onRefreshData={onRefreshData} />}
      {activeAdminSubTab === 'users' && canManageAdminUsers && <AdminUsersManager onRefreshData={onRefreshData} />}
      {activeAdminSubTab === 'settings' && canManageAdminUsers && <AppSettingsManager onRefreshData={onRefreshData} />}
    </div>
  );
};
