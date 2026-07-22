import React, { useState } from 'react';
import { db } from '../../services/dbStore';
import { Donor } from '../../types';
import { exportToCSV, exportToPDF } from '../../utils/exportUtils';
import {
  Users,
  Search,
  FileSpreadsheet,
  Printer,
  UserCheck,
  Building,
  HandHeart,
  Award,
  Mail,
  Phone,
  Calendar,
  CheckCircle2
} from 'lucide-react';

interface DonorsListManagerProps {
  onRefreshData?: () => void;
}

export const DonorsListManager: React.FC<DonorsListManagerProps> = ({ onRefreshData }) => {
  const donors = db.getDonors();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filteredDonors = donors.filter(d => {
    const matchesSearch =
      d.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.donorNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.phone.includes(searchTerm) ||
      (d.institutionName && d.institutionName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = filterType === 'all' || d.donorType === filterType;

    return matchesSearch && matchesType;
  });

  const totalDonationAccumulated = filteredDonors.reduce((sum, d) => sum + (d.totalDonation || 0), 0);

  const handleExportCSV = () => {
    const headers = [
      'No Donatur',
      'Nama Donatur',
      'Kategori',
      'Instansi / Perusahaan',
      'Email',
      'Nomor Kontak (WA)',
      'Alamat',
      'Donatur Tetap / Rutin',
      'Total Terakumulasi (Rp)',
      'Jumlah Transaksi',
      'Tanggal Terdaftar'
    ];

    const rows = filteredDonors.map(d => [
      d.donorNumber,
      d.fullName,
      d.donorType === 'individu' ? 'Individu' : d.donorType === 'perusahaan' ? 'Perusahaan' : d.donorType === 'organisasi' ? 'Organisasi' : 'Komunitas',
      d.institutionName || '-',
      d.email,
      d.phone,
      d.address || '-',
      d.isRecurringDonor ? 'Ya (Donatur Tetap)' : 'Tidak (Insidental)',
      d.totalDonation || 0,
      d.transactionCount || 0,
      d.createdAt ? new Date(d.createdAt).toLocaleDateString('id-ID') : '-'
    ]);

    exportToCSV('Data_Donatur_YatimCare', headers, rows);
  };

  const handleExportPDF = () => {
    const headers = [
      'No Donatur',
      'Nama Donatur',
      'Kategori',
      'Email / Kontak',
      'Status Rutin',
      'Total Donasi',
      'Transaksi'
    ];

    const rows = filteredDonors.map(d => [
      d.donorNumber,
      d.fullName + (d.institutionName ? ` (${d.institutionName})` : ''),
      d.donorType.toUpperCase(),
      `${d.email}\n${d.phone}`,
      d.isRecurringDonor ? 'Donatur Tetap' : 'Insidental',
      `Rp ${(d.totalDonation || 0).toLocaleString('id-ID')}`,
      `${d.transactionCount || 0}x`
    ]);

    const summary = [
      { label: 'Total Donatur Terdata', value: `${filteredDonors.length} Donatur` },
      { label: 'Donatur Rutin / Tetap', value: `${filteredDonors.filter(d => d.isRecurringDonor).length} Donatur` },
      { label: 'Akumulasi Donasi', value: `Rp ${totalDonationAccumulated.toLocaleString('id-ID')}` }
    ];

    exportToPDF(
      'LAPORAN DATA DONATUR YAYASAN',
      'Rekapitulasi Profil dan Riwayat Komitmen Donatur YatimCare Sumedang',
      headers,
      rows,
      summary
    );
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Controls */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 text-slate-900">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif font-bold text-xl text-slate-900">Database & Profil Donatur</h2>
            <p className="text-xs text-slate-500">Mendata donatur tetap, instansi partner, serta akumulasi kontribusi kebaikan.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800">
              Total: {donors.length} Donatur
            </span>

            {/* Export Buttons */}
            <div className="flex items-center gap-1.5 ml-0 sm:ml-2">
              <button
                onClick={handleExportCSV}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                title="Ekspor Data Donatur ke Excel"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Export Excel</span>
              </button>

              <button
                onClick={handleExportPDF}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                title="Cetak Laporan Data Donatur ke PDF"
              >
                <Printer className="w-4 h-4 text-amber-300" />
                <span>Export PDF</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari Nama Donatur, No Donatur, Email, WA, Perusahaan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          >
            <option value="all">Semua Kategori Donatur</option>
            <option value="individu">Individu / Perorangan</option>
            <option value="perusahaan">Perusahaan / Korporasi</option>
            <option value="organisasi">Organisasi</option>
            <option value="komunitas">Komunitas</option>
          </select>
        </div>
      </div>

      {/* Donors Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 text-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="pb-3 px-2">ID Donatur</th>
                <th className="pb-3 px-2">Nama Donatur</th>
                <th className="pb-3 px-2">Kategori</th>
                <th className="pb-3 px-2">Kontak / Email</th>
                <th className="pb-3 px-2">Komitmen</th>
                <th className="pb-3 px-2 text-right">Total Donasi</th>
                <th className="pb-3 px-2 text-center">Transaksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredDonors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Tidak ada data donatur yang sesuai pencarian.
                  </td>
                </tr>
              ) : (
                filteredDonors.map(donor => (
                  <tr key={donor.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-2 font-mono font-bold text-slate-900 text-[11px]">
                      {donor.donorNumber}
                    </td>

                    <td className="py-3.5 px-2">
                      <p className="font-bold text-slate-900">{donor.fullName}</p>
                      {donor.institutionName && (
                        <p className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Building className="w-3 h-3 text-slate-400" />
                          <span>{donor.institutionName}</span>
                        </p>
                      )}
                    </td>

                    <td className="py-3.5 px-2 capitalize">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[10px]">
                        {donor.donorType}
                      </span>
                    </td>

                    <td className="py-3.5 px-2 space-y-0.5 text-[11px]">
                      <p className="text-slate-800 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{donor.email}</span>
                      </p>
                      <p className="text-slate-500 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{donor.phone}</span>
                      </p>
                    </td>

                    <td className="py-3.5 px-2">
                      {donor.isRecurringDonor ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Donatur Tetap
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-medium">
                          Insidental
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-2 text-right font-black text-emerald-700 text-xs">
                      Rp {(donor.totalDonation || 0).toLocaleString('id-ID')}
                    </td>

                    <td className="py-3.5 px-2 text-center font-bold text-slate-800">
                      {donor.transactionCount || 0}x
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
