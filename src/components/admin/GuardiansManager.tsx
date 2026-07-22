import React, { useMemo, useState } from 'react';
import { db } from '../../services/dbStore';
import { exportToCSV, exportToPDF } from '../../utils/exportUtils';
import { Users, Search, FileSpreadsheet, Printer, RefreshCw, Phone, MapPin, BadgeInfo, UsersRound } from 'lucide-react';

interface GuardiansManagerProps {
  onRefreshData?: () => void;
}

export const GuardiansManager: React.FC<GuardiansManagerProps> = ({ onRefreshData }) => {
  const guardians = db.getGuardians();
  const children = db.getChildren();
  const [searchTerm, setSearchTerm] = useState('');

  const guardianRows = useMemo(() => {
    const keyword = searchTerm.toLowerCase();

    return guardians
      .map((guardian) => {
        const matchedChildren = children.filter((child) => child.guardianId === guardian.id);
        return {
          guardian,
          childCount: matchedChildren.length,
          childNames: matchedChildren.map((child) => child.fullName)
        };
      })
      .filter(({ guardian, childCount, childNames }) => {
        const searchableText = [
          guardian.fullName,
          guardian.nik,
          guardian.relationship,
          guardian.occupation,
          guardian.phone,
          guardian.email,
          guardian.address,
          guardian.province,
          guardian.city,
          guardian.district,
          guardian.village,
          childCount.toString(),
          childNames.join(' ')
        ]
          .join(' ')
          .toLowerCase();

        return searchableText.includes(keyword);
      });
  }, [children, guardians, searchTerm]);

  const totalChildrenLinked = guardianRows.reduce((sum, row) => sum + row.childCount, 0);
  const totalIncome = guardianRows.reduce((sum, row) => sum + (row.guardian.monthlyIncome || 0), 0);

  const handleExportCSV = () => {
    const headers = [
      'Nama Wali',
      'NIK',
      'Hubungan',
      'Pekerjaan',
      'Penghasilan Bulanan',
      'Kontak',
      'Email',
      'Wilayah',
      'Jumlah Anak Binaan',
      'Nama Anak Binaan',
      'Tanggal Input'
    ];

    const rows = guardianRows.map(({ guardian, childCount, childNames }) => [
      guardian.fullName,
      guardian.nik,
      guardian.relationship,
      guardian.occupation,
      guardian.monthlyIncome || 0,
      guardian.phone,
      guardian.email,
      `${guardian.village}, ${guardian.district}, ${guardian.city}, ${guardian.province}`,
      childCount,
      childNames.length ? childNames.join(', ') : '-',
      guardian.createdAt ? new Date(guardian.createdAt).toLocaleDateString('id-ID') : '-'
    ]);

    exportToCSV('Data_Wali_YatimCare', headers, rows);
  };

  const handleExportPDF = () => {
    const headers = [
      'Nama Wali',
      'Hubungan',
      'Kontak',
      'Wilayah',
      'Jumlah Anak',
      'Penghasilan'
    ];

    const rows = guardianRows.map(({ guardian, childCount }) => [
      guardian.fullName,
      guardian.relationship,
      `${guardian.phone}\n${guardian.email}`,
      `${guardian.village}, ${guardian.district}`,
      String(childCount),
      `Rp ${(guardian.monthlyIncome || 0).toLocaleString('id-ID')}`
    ]);

    const summary = [
      { label: 'Total Wali Terdata', value: `${guardianRows.length} Wali` },
      { label: 'Total Anak Binaan Terhubung', value: `${totalChildrenLinked} Anak` },
      { label: 'Estimasi Penghasilan Bulanan', value: `Rp ${totalIncome.toLocaleString('id-ID')}` }
    ];

    exportToPDF(
      'LAPORAN DATA WALI YAYASAN',
      'Rekapitulasi data wali dan keterhubungan anak binaan YatimCare',
      headers,
      rows,
      summary
    );
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <UsersRound className="w-5 h-5 text-emerald-600" />
            <h2 className="font-serif font-bold text-xl text-slate-900">Database Data Wali</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Menampilkan data wali yang tersimpan di database dan terhubung ke anak binaan.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>Export PDF</span>
          </button>

          <button
            onClick={onRefreshData}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
          <p className="text-xs text-emerald-700 font-semibold">Total Wali</p>
          <p className="text-2xl font-black text-emerald-900">{guardians.length}</p>
        </div>
        <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
          <p className="text-xs text-sky-700 font-semibold">Anak Binaan Terhubung</p>
          <p className="text-2xl font-black text-sky-900">{totalChildrenLinked}</p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
          <p className="text-xs text-amber-700 font-semibold">Penghasilan Bulanan Tercatat</p>
          <p className="text-2xl font-black text-amber-900">Rp {totalIncome.toLocaleString('id-ID')}</p>
        </div>
      </div>

      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama wali, NIK, kontak, wilayah, atau nama anak..."
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="p-3.5 rounded-l-xl">Nama Wali</th>
                <th className="p-3.5">Kontak</th>
                <th className="p-3.5">Wilayah</th>
                <th className="p-3.5">Hubungan / Pekerjaan</th>
                <th className="p-3.5">Anak Binaan</th>
                <th className="p-3.5 text-right rounded-r-xl">Penghasilan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {guardianRows.length > 0 ? guardianRows.map(({ guardian, childCount, childNames }) => (
                <tr key={guardian.id} className="hover:bg-white transition-colors">
                  <td className="p-3.5">
                    <p className="font-bold text-slate-900">{guardian.fullName}</p>
                    <p className="text-[11px] text-slate-500 font-mono">{guardian.nik}</p>
                    <p className="text-[11px] text-slate-500">Input {new Date(guardian.createdAt).toLocaleDateString('id-ID')}</p>
                  </td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{guardian.phone}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">{guardian.email}</p>
                  </td>
                  <td className="p-3.5">
                    <div className="flex items-start gap-2 text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 mt-0.5" />
                      <span>{guardian.village}, {guardian.district}, {guardian.city}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">{guardian.province} {guardian.postalCode}</p>
                  </td>
                  <td className="p-3.5">
                    <p className="font-semibold text-slate-900">{guardian.relationship}</p>
                    <p className="text-[11px] text-slate-500">{guardian.occupation}</p>
                  </td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="font-bold text-slate-900">{childCount} anak</span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate max-w-[240px]">
                      {childNames.length ? childNames.join(', ') : 'Belum terhubung ke anak binaan'}
                    </p>
                  </td>
                  <td className="p-3.5 text-right font-bold text-slate-900">
                    Rp {(guardian.monthlyIncome || 0).toLocaleString('id-ID')}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <BadgeInfo className="w-6 h-6 text-slate-400" />
                      <p className="font-semibold">Tidak ada data wali yang cocok dengan pencarian.</p>
                      <p className="text-xs">Data yang tampil berasal dari database melalui bootstrap API.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
