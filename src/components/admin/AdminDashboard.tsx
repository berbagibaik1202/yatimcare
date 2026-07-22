import React, { useState } from 'react';
import { db } from '../../services/dbStore';
import { ChildrenManager } from './ChildrenManager';
import { SurveyManager } from './SurveyManager';
import { AidDistributionManager } from './AidDistributionManager';
import { DonationsManager } from '../donations/DonationsManager';
import { DonorsListManager } from './DonorsListManager';
import { FinancialManager } from '../finance/FinancialManager';
import { AuditLogView } from './AuditLogView';
import {
  ShieldCheck,
  Users,
  Heart,
  DollarSign,
  FileCheck,
  MapPin,
  PieChart,
  Clock,
  RotateCcw,
  UserCheck
} from 'lucide-react';

interface AdminDashboardProps {
  onRefreshData: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onRefreshData }) => {
  const [activeAdminSubTab, setActiveAdminSubTab] = useState<string>('overview');
  const currentUser = db.getCurrentUser();
  const summary = db.getFinancialSummary();

  const handleResetData = () => {
    if (confirm('Muat ulang data terbaru dari database?')) {
      db.resetToDefault();
      onRefreshData();
      alert('Data berhasil dimuat ulang dari database.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-900">
      
      {/* Admin Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white rounded-3xl p-8 shadow-md border border-emerald-600 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 text-white border border-white/30 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
            <span>Panel Pengurus Terpadu Yayasan YatimCare</span>
          </div>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-white">
            Pusat Pengelolaan Yayasan — {currentUser?.name || 'Administrator'}
          </h1>
          <p className="text-xs text-emerald-100 max-w-2xl leading-relaxed">
            Kelola verifikasi anak yatim, verifikasi mutasi donasi, pengajuan pengeluaran kas, laporan survei lapangan, dan audit aktivitas.
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

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4">
        {[
          { id: 'overview', label: 'Ringkasan Utama', icon: PieChart },
          { id: 'children', label: 'Data Anak & Verifikasi', icon: Users },
          { id: 'donors', label: 'Data Donatur', icon: UserCheck },
          { id: 'survey', label: 'Survei Lapangan', icon: MapPin },
          { id: 'aid', label: 'Penyaluran Bantuan', icon: Heart },
          { id: 'donations', label: 'Donasi Masuk', icon: DollarSign },
          { id: 'finance', label: 'Buku Kas & Pengeluaran', icon: FileCheck },
          { id: 'audit', label: 'Audit Log Aktivitas', icon: ShieldCheck }
        ].map(tab => {
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

      {/* SUB-TAB 1: OVERVIEW */}
      {activeAdminSubTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
              <span className="text-xs text-slate-500 font-medium">Anak Terdaftar & Binaan</span>
              <p className="text-3xl font-black text-slate-900">
                {summary.totalActiveChildren} <span className="text-xs font-normal text-slate-500">Anak</span>
              </p>
              <p className="text-[11px] text-emerald-700 font-medium">Status Aktif Terverifikasi</p>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
              <span className="text-xs text-slate-500 font-medium">Perlu Verifikasi (Pending)</span>
              <p className="text-3xl font-black text-amber-600">
                {summary.pendingVerificationsCount} <span className="text-xs font-normal text-slate-500">Berkas</span>
              </p>
              <p className="text-[11px] text-amber-700 font-medium">Data Anak & Donasi Baru</p>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
              <span className="text-xs text-slate-500 font-medium">Total Donasi Diterima</span>
              <p className="text-2xl font-black text-emerald-700">
                Rp {summary.totalDonationReceived.toLocaleString('id-ID')}
              </p>
              <p className="text-[11px] text-slate-500">{summary.totalActiveDonors} Donatur Terdaftar</p>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
              <span className="text-xs text-slate-500 font-medium">Saldo Kas Berjalan</span>
              <p className="text-2xl font-black text-indigo-700">
                Rp {summary.currentBalance.toLocaleString('id-ID')}
              </p>
              <p className="text-[11px] text-slate-500">Pemasukan - Pengeluaran</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-serif font-bold text-lg text-slate-900">Pintasan Pengelolaan Pengurus</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold">
              <button
                onClick={() => setActiveAdminSubTab('children')}
                className="p-5 rounded-2xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200 text-left transition-all cursor-pointer group"
              >
                <Users className="w-5 h-5 text-emerald-600 mb-2" />
                <p className="font-bold text-sm text-slate-900 group-hover:text-emerald-800">Verifikasi Data Anak →</p>
                <p className="font-normal text-slate-500 text-[11px] mt-0.5">Periksa pendaftaran anak baru & dokumen kependudukan.</p>
              </button>

              <button
                onClick={() => setActiveAdminSubTab('donations')}
                className="p-5 rounded-2xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200 text-left transition-all cursor-pointer group"
              >
                <DollarSign className="w-5 h-5 text-emerald-600 mb-2" />
                <p className="font-bold text-sm text-slate-900 group-hover:text-emerald-800">Verifikasi Mutasi Donasi →</p>
                <p className="font-normal text-slate-500 text-[11px] mt-0.5">Konfirmasi transaksi pembayaran masuk & kuitansi.</p>
              </button>

              <button
                onClick={() => setActiveAdminSubTab('finance')}
                className="p-5 rounded-2xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200 text-left transition-all cursor-pointer group"
              >
                <FileCheck className="w-5 h-5 text-emerald-600 mb-2" />
                <p className="font-bold text-sm text-slate-900 group-hover:text-emerald-800">Persetujuan Pengeluaran →</p>
                <p className="font-normal text-slate-500 text-[11px] mt-0.5">Akses persetujuan biaya operasional & bantuan.</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeAdminSubTab === 'children' && <ChildrenManager onRefreshData={onRefreshData} />}
      {activeAdminSubTab === 'donors' && <DonorsListManager onRefreshData={onRefreshData} />}
      {activeAdminSubTab === 'survey' && <SurveyManager onRefreshData={onRefreshData} />}
      {activeAdminSubTab === 'aid' && <AidDistributionManager onRefreshData={onRefreshData} />}
      {activeAdminSubTab === 'donations' && <DonationsManager onRefreshData={onRefreshData} />}
      {activeAdminSubTab === 'finance' && <FinancialManager onRefreshData={onRefreshData} />}
      {activeAdminSubTab === 'audit' && <AuditLogView onRefreshData={onRefreshData} />}

    </div>
  );
};
