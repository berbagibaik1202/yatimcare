import React, { useState } from 'react';
import { db } from '../../services/dbStore';
import { AidDistribution, AidStatus } from '../../types';
import { exportToCSV, exportToPDF } from '../../utils/exportUtils';
import {
  HandHeart,
  PlusCircle,
  CheckCircle2,
  Calendar,
  User,
  Package,
  MapPin,
  X,
  FileSpreadsheet,
  Printer
} from 'lucide-react';

interface AidDistributionManagerProps {
  onRefreshData: () => void;
}

export const AidDistributionManager: React.FC<AidDistributionManagerProps> = ({ onRefreshData }) => {
  const aidList = db.getAidDistributions();
  const childrenList = db.getChildren().filter(c => c.status === 'aktif');
  const programs = db.getPrograms();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState(childrenList[0]?.id || 'chd-1');
  const [selectedProgramId, setSelectedProgramId] = useState(programs[0]?.id || 'prg-1');
  const [aidType, setAidType] = useState<'Uang Tunai' | 'Sembako' | 'Perlengkapan Sekolah' | 'Biaya Kesehatan' | 'Beasiswa'>('Uang Tunai');
  const [amount, setAmount] = useState<number>(500000);
  const [itemDescription, setItemDescription] = useState('Santunan Uang Saku Bulanan');
  const [location, setLocation] = useState('Kantor Yayasan YatimCare');

  const handleCreateAid = (e: React.FormEvent) => {
    e.preventDefault();
    const child = childrenList.find(c => c.id === selectedChildId);
    const prog = programs.find(p => p.id === selectedProgramId);
    if (!child) return;

    db.addAidDistribution({
      childId: child.id,
      childName: child.fullName,
      guardianName: child.guardianName,
      programId: prog?.id,
      programTitle: prog?.title,
      aidType,
      distributionDate: new Date().toISOString().slice(0, 10),
      amount,
      itemDescription,
      sourceOfFunds: prog ? prog.title : 'Kas Santunan Yayasan',
      officerId: 'usr-3',
      officerName: 'Budi Santoso',
      location,
      status: 'selesai',
      notes: `Diserahkan langsung kepada wali (${child.guardianName}).`
    });

    onRefreshData();
    setIsFormOpen(false);
    alert('Penyaluran bantuan berhasil dicatat & riwayat anak diperbarui!');
  };

  const handleExportCSV = () => {
    const headers = [
      'Tanggal Penyaluran',
      'Nama Anak Penerima',
      'Nama Wali',
      'Program / Sumber Dana',
      'Jenis Bantuan',
      'Deskripsi Item',
      'Nominal Nilai (Rp)',
      'Petugas Penyerah',
      'Lokasi Penyerahan'
    ];

    const rows = aidList.map(a => [
      a.distributionDate,
      a.childName,
      a.guardianName,
      a.programTitle || a.sourceOfFunds,
      a.aidType,
      a.itemDescription,
      a.amount,
      a.officerName,
      a.location
    ]);

    exportToCSV('Laporan_Penyaluran_Bantuan_YatimCare', headers, rows);
  };

  const handleExportPDF = () => {
    const headers = [
      'Tanggal',
      'Anak Penerima',
      'Wali',
      'Bantuan',
      'Nilai / Nominal',
      'Lokasi'
    ];

    const rows = aidList.map(a => [
      a.distributionDate,
      a.childName,
      a.guardianName,
      `${a.aidType} (${a.itemDescription})`,
      `Rp ${a.amount.toLocaleString('id-ID')}`,
      a.location
    ]);

    const totalVal = aidList.reduce((sum, a) => sum + a.amount, 0);

    const summary = [
      { label: 'Total Penyaluran Bantuan', value: `${aidList.length} Kali` },
      { label: 'Nilai Total Disalurkan', value: `Rp ${totalVal.toLocaleString('id-ID')}` }
    ];

    exportToPDF(
      'LAPORAN PENYALURAN BANTUAN & SANTUNAN',
      'Rekapitulasi Penyerahan Santunan, Beasiswa, dan Paket Sembako YatimCare',
      headers,
      rows,
      summary
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif font-bold text-xl text-slate-900">Pencatatan Penyaluran Bantuan & Santunan</h2>
          <p className="text-xs text-slate-500 mt-0.5">Rekam jejak penyerahan dana santunan, beasiswa, dan paket sembako kepada anak penerima manfaat.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Ekspor Laporan Penyaluran ke Excel"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Cetak Laporan Penyaluran ke PDF"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>Export PDF</span>
          </button>

          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Salurkan Bantuan Baru</span>
          </button>
        </div>
      </div>

      {/* New Aid Distribution Form */}
      {isFormOpen && (
        <form onSubmit={handleCreateAid} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900">Form Penyerahan Bantuan Anak</h3>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Tutup Form"
              aria-label="Tutup Form"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Pilih Anak Penerima Manfaat *</label>
              <select
                value={selectedChildId}
                onChange={(e) => setSelectedChildId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                {childrenList.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.fullName} ({c.schoolName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Program Sumber Dana *</label>
              <select
                value={selectedProgramId}
                onChange={(e) => setSelectedProgramId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                {programs.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Jenis Bantuan *</label>
              <select
                value={aidType}
                onChange={(e) => setAidType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                <option value="Uang Tunai">Uang Tunai (Santunan)</option>
                <option value="Beasiswa">Beasiswa Pendidikan & SPP</option>
                <option value="Perlengkapan Sekolah">Perlengkapan & Seragam Sekolah</option>
                <option value="Sembako">Sembako & Bahan Pangan</option>
                <option value="Biaya Kesehatan">Bantuan Berobat & Kesehatan</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Nilai Bantuan (Nominal Rp) *</label>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Rincian Barang / Keterangan *</label>
              <input
                type="text"
                required
                value={itemDescription}
                onChange={(e) => setItemDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Lokasi Penyerahan *</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow-xs hover:bg-emerald-700 cursor-pointer"
            >
              Simpan Penyaluran
            </button>
          </div>
        </form>
      )}

      {/* Aid Distributions Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider bg-slate-50">
                <th className="p-3.5 rounded-l-xl">No. Penyaluran</th>
                <th className="p-3.5">Penerima Manfaat</th>
                <th className="p-3.5">Jenis Bantuan</th>
                <th className="p-3.5">Nilai Bantuan</th>
                <th className="p-3.5">Tanggal & Lokasi</th>
                <th className="p-3.5 rounded-r-xl">Petugas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {aidList.map(aid => (
                <tr key={aid.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-slate-900">{aid.distributionNumber}</td>
                  <td className="p-3.5">
                    <p className="font-bold text-slate-900">{aid.childName}</p>
                    <p className="text-[10px] text-slate-500">Wali: {aid.guardianName}</p>
                  </td>
                  <td className="p-3.5">
                    <span className="font-semibold text-slate-800">{aid.aidType}</span>
                    <p className="text-[10px] text-slate-500">{aid.itemDescription}</p>
                  </td>
                  <td className="p-3.5 font-extrabold text-emerald-700">Rp {aid.amount.toLocaleString('id-ID')}</td>
                  <td className="p-3.5">
                    <p className="font-semibold text-slate-800">{aid.distributionDate}</p>
                    <p className="text-[10px] text-slate-500">{aid.location}</p>
                  </td>
                  <td className="p-3.5 font-medium text-slate-700">{aid.officerName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
