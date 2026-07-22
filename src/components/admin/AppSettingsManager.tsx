import React, { useEffect, useRef, useState } from 'react';
import { db } from '../../services/dbStore';
import { Settings2, Save, Palette, RefreshCcw, Image, Upload, Trash2 } from 'lucide-react';

interface AppSettingsManagerProps {
  onRefreshData: () => void;
}

export const AppSettingsManager: React.FC<AppSettingsManagerProps> = ({ onRefreshData }) => {
  const [appName, setAppName] = useState(db.getAppName());
  const [appLogoUrl, setAppLogoUrl] = useState(db.getAppLogoUrl() ?? '');
  const [saving, setSaving] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAppName(db.getAppName());
    setAppLogoUrl(db.getAppLogoUrl() ?? '');
  }, []);

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('File logo harus berupa gambar.');
      e.target.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran logo terlalu besar. Maksimal 2 MB.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      setAppLogoUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handlePickLogo = () => {
    logoInputRef.current?.click();
  };

  const handleClearLogo = () => {
    setAppLogoUrl('');
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextName = appName.trim();
    if (!nextName) {
      alert('Nama aplikasi tidak boleh kosong.');
      return;
    }

    try {
      setSaving(true);
      await db.updateSystemSetting('app_name', nextName, 'Nama aplikasi utama yang ditampilkan di seluruh portal');
      await db.updateSystemSetting('app_logo_url', appLogoUrl, 'Logo aplikasi utama yang ditampilkan di navbar dan portal');
      onRefreshData();
      alert('Nama dan logo aplikasi berhasil diperbarui.');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Gagal memperbarui pengaturan aplikasi');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif font-bold text-xl text-slate-900">Pengaturan Nama & Logo Aplikasi</h2>
            <p className="text-xs text-slate-500">Ubah label dan logo yang tampil di navbar, header, serta area publik.</p>
          </div>

          <div className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold inline-flex items-center gap-2 self-start">
            <Settings2 className="w-4 h-4" />
            <span>Pengaturan Sistem</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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

      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
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

        <div className="grid grid-cols-1 lg:grid-cols-[180px_1fr] gap-4 items-start">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-center min-h-[180px]">
            <div className="w-32 h-32 rounded-3xl bg-white border border-slate-200 shadow-xs overflow-hidden flex items-center justify-center">
              {appLogoUrl ? (
                <img
                  src={appLogoUrl}
                  alt="Logo aplikasi"
                  className="w-full h-full object-contain p-3"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-emerald-50 text-emerald-600">
                  <Image className="w-12 h-12" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Logo Aplikasi</h3>
              <p className="text-xs text-slate-500 mt-1">
                Upload gambar logo, lalu simpan. File akan disimpan sebagai data URL agar tetap tampil setelah refresh.
              </p>
            </div>

            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoFileChange}
              className="hidden"
            />

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handlePickLogo}
                className="px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-2xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Pilih Logo</span>
              </button>

              <button
                type="button"
                onClick={handleClearLogo}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus Logo</span>
              </button>
            </div>

            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-xs text-slate-500 leading-relaxed">
              Logo saat ini akan dipakai di navbar dan area branding utama. Jika kosong, sistem akan memakai ikon default.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-bold rounded-2xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Menyimpan...' : 'Simpan Nama & Logo'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
