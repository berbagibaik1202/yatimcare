import React, { useEffect, useState } from 'react';
import { db } from '../../services/dbStore';
import { Settings2, Save, Palette, RefreshCcw } from 'lucide-react';

interface AppSettingsManagerProps {
  onRefreshData: () => void;
}

export const AppSettingsManager: React.FC<AppSettingsManagerProps> = ({ onRefreshData }) => {
  const [appName, setAppName] = useState(db.getAppName());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setAppName(db.getAppName());
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextValue = appName.trim();
    if (!nextValue) {
      alert('Nama aplikasi tidak boleh kosong.');
      return;
    }

    try {
      setSaving(true);
      await db.updateSystemSetting('app_name', nextValue, 'Nama aplikasi utama yang ditampilkan di seluruh portal');
      onRefreshData();
      alert('Nama aplikasi berhasil diperbarui.');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Gagal memperbarui nama aplikasi');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif font-bold text-xl text-slate-900">Pengaturan Nama Aplikasi</h2>
            <p className="text-xs text-slate-500">Ubah label aplikasi yang tampil di navbar, header, dan area publik.</p>
          </div>

          <div className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold inline-flex items-center gap-2 self-start">
            <Settings2 className="w-4 h-4" />
            <span>Pengaturan Sistem</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-2">
              <Palette className="w-4 h-4 text-emerald-600" />
              <span>Nama Aplikasi Saat Ini</span>
            </div>
            <p className="text-2xl font-black text-slate-900">{db.getAppName()}</p>
          </div>

          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-2">
              <RefreshCcw className="w-4 h-4 text-amber-600" />
              <span>Dampak Perubahan</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Perubahan akan diperbarui di header aplikasi setelah data disegarkan dari backend.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <label className="block space-y-2">
          <span className="text-sm font-bold text-slate-800">Nama Aplikasi</span>
          <input
            type="text"
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            placeholder="Contoh: YatimCare"
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
        </label>

        <div className="flex items-center gap-2 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-bold rounded-2xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Menyimpan...' : 'Simpan Nama Aplikasi'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
