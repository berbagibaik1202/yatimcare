import React from 'react';
import { db } from '../../services/dbStore';
import { exportToCSV, exportToPDF } from '../../utils/exportUtils';
import { ShieldCheck, Clock, UserCheck, Key, RefreshCw, FileSpreadsheet, Printer } from 'lucide-react';

interface AuditLogViewProps {
  onRefreshData: () => void;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ onRefreshData }) => {
  const auditLogs = db.getAuditLogs();

  const handleExportCSV = () => {
    const headers = [
      'Waktu Log',
      'Nama Pengguna',
      'Peran Pengguna',
      'Aksi Modul',
      'Detail Perubahan Data',
      'IP Address'
    ];

    const rows = auditLogs.map(l => [
      new Date(l.timestamp).toLocaleString('id-ID'),
      l.userName,
      l.userRole,
      l.action,
      l.details,
      l.ipAddress || '127.0.0.1'
    ]);

    exportToCSV('Audit_Log_Sistem_YatimCare', headers, rows);
  };

  const handleExportPDF = () => {
    const headers = [
      'Waktu',
      'Pengguna',
      'Peran',
      'Aksi',
      'Detail Perubahan',
      'IP'
    ];

    const rows = auditLogs.map(l => [
      new Date(l.timestamp).toLocaleString('id-ID'),
      l.userName,
      l.userRole.toUpperCase(),
      l.action,
      l.details,
      l.ipAddress || '127.0.0.1'
    ]);

    const summary = [
      { label: 'Total Log Terekam', value: `${auditLogs.length} Catatan` }
    ];

    exportToPDF(
      'LAPORAN AUDIT LOG AKTIVITAS SISTEM',
      'Catatan Riwayat Jejak Audit Akses dan Modifikasi Data Yayasan YatimCare',
      headers,
      rows,
      summary
    );
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-600" />
            <h2 className="font-serif font-bold text-xl text-slate-900">Jejak Audit Log Aktivitas Sistem</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Catatan riwayat aktivitas login, verifikasi data anak, perubahan donasi, dan approval pengeluaran.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Ekspor Audit Log ke Excel"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Cetak Audit Log ke PDF"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>Export PDF</span>
          </button>

          <button
            onClick={onRefreshData}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Audit</span>
          </button>
        </div>
      </div>

      {/* Log Timeline Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider bg-slate-50">
              <th className="p-3.5 rounded-l-xl">Waktu Transaksi</th>
              <th className="p-3.5">Pengguna / Peran</th>
              <th className="p-3.5">Aksi / Modul</th>
              <th className="p-3.5">Rincian Perubahan Data</th>
              <th className="p-3.5 text-right rounded-r-xl">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
            {auditLogs.map(log => (
              <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="p-3.5 font-mono text-slate-500 text-[11px]">
                  {new Date(log.timestamp).toLocaleString('id-ID')}
                </td>

                <td className="p-3.5">
                  <p className="font-bold text-slate-900">{log.userName}</p>
                  <span className="text-[10px] uppercase font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded-sm">
                    {log.userRole}
                  </span>
                </td>

                <td className="p-3.5">
                  <p className="font-bold text-slate-800">{log.action}</p>
                  <p className="text-[10px] text-slate-500">{log.module}</p>
                </td>

                <td className="p-3.5 text-slate-700 max-w-md">
                  {log.details}
                </td>

                <td className="p-3.5 text-right font-mono text-[10px] text-slate-400">
                  {log.ipAddress}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};
