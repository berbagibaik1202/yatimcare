import React, { useState } from 'react';
import { db } from '../../services/dbStore';
import { Survey, SurveyEligibility } from '../../types';
import { exportToCSV, exportToPDF } from '../../utils/exportUtils';
import {
  FileText,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Calendar,
  UserCheck,
  Building,
  X,
  FileSpreadsheet,
  Printer
} from 'lucide-react';

interface SurveyManagerProps {
  onRefreshData: () => void;
}

export const SurveyManager: React.FC<SurveyManagerProps> = ({ onRefreshData }) => {
  const surveys = db.getSurveys();
  const childrenList = db.getChildren();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState(childrenList[0]?.id || 'chd-1');
  const [economicCondition, setEconomicCondition] = useState('');
  const [homeCondition, setHomeCondition] = useState('');
  const [educationCondition, setEducationCondition] = useState('');
  const [recommendation, setRecommendation] = useState<SurveyEligibility>('layak');
  const [notes, setNotes] = useState('');

  const handleCreateSurvey = (e: React.FormEvent) => {
    e.preventDefault();
    const child = childrenList.find(c => c.id === selectedChildId);
    if (!child) return;

    db.addSurvey({
      childId: child.id,
      childName: child.fullName,
      officerId: 'usr-3',
      officerName: 'Budi Santoso',
      surveyDate: new Date().toISOString().slice(0, 10),
      economicCondition,
      homeCondition,
      educationCondition,
      healthCondition: 'Sehat',
      documentMatch: true,
      latitude: child.latitude,
      longitude: child.longitude,
      recommendation,
      notes,
      photos: [child.homePhotoUrl || 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=400&q=80']
    });

    onRefreshData();
    setIsFormOpen(false);
    alert('Hasil survei lapangan berhasil disimpan ke dalam rekam data anak.');
  };

  const handleExportCSV = () => {
    const headers = [
      'Tanggal Kunjungan',
      'Nama Anak',
      'Petugas Surveyor',
      'Kondisi Rumah',
      'Kondisi Ekonomi',
      'Rekomendasi Kelayakan',
      'Catatan / Penilaian'
    ];

    const rows = surveys.map(s => [
      s.surveyDate,
      s.childName,
      s.officerName,
      s.homeCondition,
      s.economicCondition,
      s.recommendation === 'layak' ? 'Layak Utuh' : s.recommendation === 'layak_catatan' ? 'Layak dengan Catatan' : s.recommendation === 'perlu_survei_ulang' ? 'Survei Ulang' : 'Tidak Layak',
      s.notes
    ]);

    exportToCSV('Laporan_Survei_Lapangan_YatimCare', headers, rows);
  };

  const handleExportPDF = () => {
    const headers = [
      'Tanggal',
      'Nama Anak',
      'Surveyor',
      'Kondisi Rumah',
      'Ekonomi',
      'Rekomendasi'
    ];

    const rows = surveys.map(s => [
      s.surveyDate,
      s.childName,
      s.officerName,
      s.homeCondition,
      s.economicCondition,
      s.recommendation === 'layak' ? 'Layak Utuh' : s.recommendation === 'layak_catatan' ? 'Layak w/ Catatan' : s.recommendation === 'perlu_survei_ulang' ? 'Survei Ulang' : 'Tidak Layak'
    ]);

    const summary = [
      { label: 'Total Survei Terlaksana', value: `${surveys.length} Kunjungan` },
      { label: 'Layak Diberi Bantuan', value: `${surveys.filter(s => s.recommendation === 'layak' || s.recommendation === 'layak_catatan').length} Anak` }
    ];

    exportToPDF(
      'LAPORAN HASIL SURVEI LAPANGAN',
      'Hasil Verifikasi & Penilaian Lapangan Kunjungan Rumah Anak Binaan YatimCare',
      headers,
      rows,
      summary
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif font-bold text-xl text-slate-900">Catatan & Hasil Survei Lapangan</h2>
          <p className="text-xs text-slate-500 mt-0.5">Penilaian kondisi tempat tinggal, ekonomi, dan rekomendasi kelayakan dari petugas lapangan.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Ekspor Laporan Survei ke Excel"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Cetak Laporan Survei ke PDF"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>Export PDF</span>
          </button>

          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Input Survei Baru</span>
          </button>
        </div>
      </div>

      {/* New Survey Form */}
      {isFormOpen && (
        <form onSubmit={handleCreateSurvey} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900">Formulir Laporan Kunjungan Rumah</h3>
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
              <label className="block font-medium text-slate-700 mb-1">Pilih Anak yang Disurvei *</label>
              <select
                value={selectedChildId}
                onChange={(e) => setSelectedChildId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                {childrenList.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.fullName} ({c.district})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Rekomendasi Kelayakan *</label>
              <select
                value={recommendation}
                onChange={(e) => setRecommendation(e.target.value as SurveyEligibility)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value="layak">Sangat Layak Menerima Bantuan</option>
                <option value="layak_catatan">Layak dengan Catatan Khusus</option>
                <option value="perlu_survei_ulang">Perlu Kunjungan Ulang</option>
                <option value="tidak_layak">Tidak Layak Menerima Bantuan</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">Kondisi Ekonomi Keluarga & Pekerjaan Wali *</label>
              <input
                type="text"
                required
                placeholder="Deskripsikan penghasilan dan penanggung keluarga..."
                value={economicCondition}
                onChange={(e) => setEconomicCondition(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">Kondisi Fisik Rumah & Bangunan *</label>
              <input
                type="text"
                required
                placeholder="Contoh: Dinding bilik bambu, atap bocor, menumpang..."
                value={homeCondition}
                onChange={(e) => setHomeCondition(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">Catatan Tambahan / Rekomendasi Program *</label>
              <textarea
                rows={2}
                required
                placeholder="Saran program bantuan yang tepat (Santunan, Beasiswa, Sembako)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
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
              className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl shadow-xs hover:bg-blue-700 cursor-pointer"
            >
              Simpan Hasil Survei
            </button>
          </div>
        </form>
      )}

      {/* Survey Logs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {surveys.map(srv => (
          <div key={srv.id} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                  Survei Lapangan
                </span>
                <h3 className="font-bold text-slate-900 text-base mt-1">{srv.childName}</h3>
                <p className="text-[11px] text-slate-500">{srv.surveyDate} • Petugas: {srv.officerName}</p>
              </div>

              <span className={`px-3 py-1 rounded-full font-bold text-xs ${
                srv.recommendation === 'layak' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {srv.recommendation.toUpperCase().replace('_', ' ')}
              </span>
            </div>

            <div className="space-y-2 text-slate-700">
              <p><strong>Ekonomi:</strong> {srv.economicCondition}</p>
              <p><strong>Kondisi Rumah:</strong> {srv.homeCondition}</p>
              <p><strong>Catatan Officer:</strong> {srv.notes}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
