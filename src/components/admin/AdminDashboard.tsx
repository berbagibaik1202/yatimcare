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
    if (confirm('Apakah Anda yakin ingin mereset data demo ke konfigurasi awal?')) {
      db.resetToDefault();
      onRefreshData();
      alert('Data demo berhasil direset!');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-white">
      
      {/* Admin Header Banner */}
      <div className="bg-[#161616] text-white rounded-[40px] p-8 shadow-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#CCFF00]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/20 text-xs font-black uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-[#CCFF00]" />
            <span>Panel Pengurus Terpadu Yayasan YatimCare</span>
          </div>
          <h1 className="font-sans font-black text-2xl sm:text-3xl text-white">
            Pusat Pengelolaan Yayasan — {currentUser?.name || 'Administrator'}
          </h1>
          <p className="text-xs text-white/60 max-w-2xl leading-relaxed">
            Kelola verifikasi anak yatim, verifikasi mutasi donasi, pengajuan pengeluaran kas, laporan survei lapangan, dan audit aktivitas.
          </p>
        </div>

        <button
          onClick={handleResetData}
          className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-2xl border border-white/10 transition-all flex items-center gap-2 cursor-pointer shrink-0 relative z-10"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#CCFF00]" />
          <span>Reset Data Demo</span>
        </button>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
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
                  ? 'bg-[#CCFF00] text-black shadow-lg shadow-[#CCFF00]/15'
                  : 'bg-[#161616] text-white/70 border border-white/10 hover:bg-white/10 hover:text-white'
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
            <div className="p-6 bg-[#161616] rounded-[32px] border border-white/10 shadow-xl space-y-2">
              <span className="text-xs text-white/50 font-medium">Anak Terdaftar & Binaan</span>
              <p className="text-3xl font-black text-white">
                {summary.totalActiveChildren} <span className="text-xs font-normal text-white/50">Anak</span>
              </p>
              <p className="text-[11px] text-[#CCFF00] font-medium">Status Aktif Terverifikasi</p>
            </div>

            <div className="p-6 bg-[#161616] rounded-[32px] border border-white/10 shadow-xl space-y-2">
              <span className="text-xs text-white/50 font-medium">Perlu Verifikasi (Pending)</span>
              <p className="text-3xl font-black text-amber-400">
                {summary.pendingVerificationsCount} <span className="text-xs font-normal text-white/50">Berkas</span>
              </p>
              <p className="text-[11px] text-amber-300 font-medium">Data Anak & Donasi Baru</p>
            </div>

            <div className="p-6 bg-[#161616] rounded-[32px] border border-white/10 shadow-xl space-y-2">
              <span className="text-xs text-white/50 font-medium">Total Donasi Diterima</span>
              <p className="text-2xl font-black text-[#CCFF00]">
                Rp {summary.totalDonationReceived.toLocaleString('id-ID')}
              </p>
              <p className="text-[11px] text-white/50">{summary.totalActiveDonors} Donatur Terdaftar</p>
            </div>

            <div className="p-6 bg-[#161616] rounded-[32px] border border-white/10 shadow-xl space-y-2">
              <span className="text-xs text-white/50 font-medium">Saldo Kas Berjalan</span>
              <p className="text-2xl font-black text-indigo-400">
                Rp {summary.currentBalance.toLocaleString('id-ID')}
              </p>
              <p className="text-[11px] text-white/50">Pemasukan - Pengeluaran</p>
            </div>
          </div>

          <div className="bg-[#161616] rounded-[32px] p-6 border border-white/10 shadow-xl space-y-4">
            <h3 className="font-sans font-black text-lg text-white">Pintasan Pengelolaan Pengurus</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold">
              <button
                onClick={() => setActiveAdminSubTab('children')}
                className="p-5 rounded-2xl bg-[#1A1A1A] hover:bg-[#CCFF00]/10 hover:border-[#CCFF00]/30 border border-white/10 text-left transition-all cursor-pointer group"
              >
                <Users className="w-5 h-5 text-[#CCFF00] mb-2" />
                <p className="font-bold text-sm text-white group-hover:text-[#CCFF00]">Verifikasi Data Anak →</p>
                <p className="font-normal text-white/50 text-[11px] mt-0.5">Periksa pendaftaran anak baru & dokumen kependudukan.</p>
              </button>

              <button
                onClick={() => setActiveAdminSubTab('donations')}
                className="p-5 rounded-2xl bg-[#1A1A1A] hover:bg-[#CCFF00]/10 hover:border-[#CCFF00]/30 border border-white/10 text-left transition-all cursor-pointer group"
              >
                <DollarSign className="w-5 h-5 text-[#CCFF00] mb-2" />
                <p className="font-bold text-sm text-white group-hover:text-[#CCFF00]">Verifikasi Mutasi Donasi →</p>
                <p className="font-normal text-white/50 text-[11px] mt-0.5">Konfirmasi transaksi pembayaran masuk & kuitansi.</p>
              </button>

              <button
                onClick={() => setActiveAdminSubTab('finance')}
                className="p-5 rounded-2xl bg-[#1A1A1A] hover:bg-[#CCFF00]/10 hover:border-[#CCFF00]/30 border border-white/10 text-left transition-all cursor-pointer group"
              >
                <FileCheck className="w-5 h-5 text-[#CCFF00] mb-2" />
                <p className="font-bold text-sm text-white group-hover:text-[#CCFF00]">Persetujuan Pengeluaran →</p>
                <p className="font-normal text-white/50 text-[11px] mt-0.5">Akses persetujuan biaya operasional & bantuan.</p>
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
