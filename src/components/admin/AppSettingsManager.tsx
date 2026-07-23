import React, { useEffect, useRef, useState } from 'react';
import { db } from '../../services/dbStore';
import { Settings2, Save, Palette, RefreshCcw, Image, Upload, Trash2, Building2, Database, Download, RotateCcw } from 'lucide-react';

interface AppSettingsManagerProps {
  onRefreshData: () => void;
}

export const AppSettingsManager: React.FC<AppSettingsManagerProps> = ({ onRefreshData }) => {
  const [appName, setAppName] = useState(db.getAppName());
  const [appLogoUrl, setAppLogoUrl] = useState(db.getAppLogoUrl() ?? '');
  const [donationBankName, setDonationBankName] = useState<string>(() => {
    const value = db.getSystemSettingValue('donation_bank_name');
    return typeof value === 'string' ? value : '';
  });
  const [donationBankNumber, setDonationBankNumber] = useState<string>(() => {
    const value = db.getSystemSettingValue('donation_bank_number');
    return typeof value === 'string' ? value : '';
  });
  const [donationBankHolder, setDonationBankHolder] = useState<string>(() => {
    const value = db.getSystemSettingValue('donation_bank_holder');
    return typeof value === 'string' ? value : '';
  });
  const [saving, setSaving] = useState(false);
  const [backuping, setBackuping] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const restoreInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAppName(db.getAppName());
    setAppLogoUrl(db.getAppLogoUrl() ?? '');
    const bankName = db.getSystemSettingValue('donation_bank_name');
    const bankNumber = db.getSystemSettingValue('donation_bank_number');
    const bankHolder = db.getSystemSettingValue('donation_bank_holder');
    setDonationBankName(typeof bankName === 'string' ? bankName : '');
    setDonationBankNumber(typeof bankNumber === 'string' ? bankNumber : '');
    setDonationBankHolder(typeof bankHolder === 'string' ? bankHolder : '');
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

  const handleDownloadBackup = async () => {
    try {
      setBackuping(true);
      const backup = await db.exportDatabaseBackup();
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      const exportedAt = new Date(backup.exportedAt).toISOString().slice(0, 10);
      anchor.href = url;
      anchor.download = `yatimcare-backup-${exportedAt}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      alert('Backup database berhasil diunduh.');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Gagal membuat backup database');
    } finally {
      setBackuping(false);
    }
  };

  const handlePickRestoreFile = () => {
    restoreInputRef.current?.click();
  };

  const handleRestoreFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    const confirmed = window.confirm(
      'Restore akan mengganti data database saat ini dengan isi file backup. Lanjutkan?'
    );
    if (!confirmed) {
      e.target.value = '';
      return;
    }

    try {
      setRestoring(true);
      const raw = await file.text();
      const parsed = JSON.parse(raw) as Parameters<typeof db.restoreDatabaseBackup>[0];
      await db.restoreDatabaseBackup(parsed);
      onRefreshData();
      alert('Database berhasil dipulihkan dari backup.');
      window.location.reload();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Gagal memulihkan database dari backup');
    } finally {
      setRestoring(false);
      e.target.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextName = appName.trim();
    const nextBankName = donationBankName.trim();
    const nextBankNumber = donationBankNumber.trim();
    const nextBankHolder = donationBankHolder.trim();

    if (!nextName) {
      alert('Nama aplikasi tidak boleh kosong.');
      return;
    }

    if (!nextBankName || !nextBankNumber || !nextBankHolder) {
      alert('Data nomor rekening donasi harus diisi lengkap.');
      return;
    }

    try {
      setSaving(true);
      await db.updateSystemSetting('app_name', nextName, 'Nama aplikasi utama yang ditampilkan di seluruh portal');
      await db.updateSystemSetting('app_logo_url', appLogoUrl, 'Logo aplikasi utama yang ditampilkan di navbar dan portal');
      await db.updateSystemSetting('donation_bank_name', nextBankName, 'Nama bank fallback donasi');
      await db.updateSystemSetting('donation_bank_number', nextBankNumber, 'Nomor rekening fallback donasi');
      await db.updateSystemSetting('donation_bank_holder', nextBankHolder, 'Nama pemilik rekening fallback donasi');
      onRefreshData();
      alert('Pengaturan aplikasi dan rekening donasi berhasil diperbarui.');
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
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
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

          <div className="rounded-3xl border border-emerald-100 bg-emerald-50/60 p-4 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
              <Building2 className="w-4 h-4" />
              <span>Rekening Fallback Sistem</span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <label className="block space-y-2">
                <span className="text-xs font-semibold text-slate-700">Nama Bank</span>
                <input
                  type="text"
                  value={donationBankName}
                  onChange={(e) => setDonationBankName(e.target.value)}
                  placeholder="Contoh: BSI"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-xs font-semibold text-slate-700">Nomor Rekening</span>
                <input
                  type="text"
                  value={donationBankNumber}
                  onChange={(e) => setDonationBankNumber(e.target.value)}
                  placeholder="Contoh: 7123456789"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-xs font-semibold text-slate-700">Nama Pemilik Rekening</span>
                <input
                  type="text"
                  value={donationBankHolder}
                  onChange={(e) => setDonationBankHolder(e.target.value)}
                  placeholder="Contoh: Yayasan Peduli YatimCare"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </label>
            </div>
          </div>
        </div>

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

        <div className="rounded-3xl border border-amber-200 bg-amber-50/70 p-5 space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
                <Database className="w-4 h-4" />
                <span>Backup & Restore Database</span>
              </div>
              <p className="text-xs text-amber-900/80 mt-1">
                Backup akan mengunduh snapshot seluruh data. Restore akan menimpa isi database dengan file backup yang dipilih.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleDownloadBackup}
                disabled={backuping || restoring}
                className="px-4 py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white text-xs font-bold rounded-2xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{backuping ? 'Membuat Backup...' : 'Backup Database'}</span>
              </button>

              <input
                ref={restoreInputRef}
                type="file"
                accept="application/json,.json"
                onChange={handleRestoreFileChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={handlePickRestoreFile}
                disabled={backuping || restoring}
                className="px-4 py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white text-xs font-bold rounded-2xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{restoring ? 'Memulihkan...' : 'Restore Database'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] text-amber-900/80">
            <div className="rounded-2xl bg-white/80 border border-amber-200 p-3">
              Backup menyimpan users, anak, wali, donatur, program, donasi, pengeluaran, audit log, pengaturan, dan rekening.
            </div>
            <div className="rounded-2xl bg-white/80 border border-amber-200 p-3">
              Restore cocok dipakai saat migrasi server atau pemulihan data. Pastikan file backup berasal dari aplikasi ini.
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
