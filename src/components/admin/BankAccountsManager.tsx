import React, { useMemo, useState } from 'react';
import { db } from '../../services/dbStore';
import { BankAccount } from '../../types';
import { PlusCircle, Edit, Trash2, X, Save, Building2, CheckCircle2, AlertTriangle, Banknote } from 'lucide-react';

interface BankAccountsManagerProps {
  onRefreshData: () => void;
}

type BankAccountFormState = {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  accountType: string;
  isActive: boolean;
};

const defaultFormState: BankAccountFormState = {
  bankName: '',
  accountNumber: '',
  accountHolder: '',
  accountType: 'Tabungan',
  isActive: true
};

export const BankAccountsManager: React.FC<BankAccountsManagerProps> = ({ onRefreshData }) => {
  const bankAccounts = db.getBankAccounts();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [formState, setFormState] = useState<BankAccountFormState>(defaultFormState);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const summary = useMemo(() => ({
    total: bankAccounts.length,
    active: bankAccounts.filter((account) => account.isActive).length
  }), [bankAccounts]);

  const openCreateEditor = () => {
    setSelectedAccount(null);
    setFormError(null);
    setFormState(defaultFormState);
    setIsEditorOpen(true);
  };

  const openEditEditor = (account: BankAccount) => {
    setSelectedAccount(account);
    setFormError(null);
    setFormState({
      bankName: account.bankName,
      accountNumber: account.accountNumber,
      accountHolder: account.accountHolder,
      accountType: account.accountType || 'Tabungan',
      isActive: account.isActive
    });
    setIsEditorOpen(true);
  };

  const closeEditor = () => {
    if (saving) {
      return;
    }

    setIsEditorOpen(false);
    setSelectedAccount(null);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const payload = {
      bankName: formState.bankName.trim(),
      accountNumber: formState.accountNumber.trim(),
      accountHolder: formState.accountHolder.trim(),
      accountType: formState.accountType.trim(),
      isActive: formState.isActive
    };

    if (!payload.bankName || !payload.accountNumber || !payload.accountHolder || !payload.accountType) {
      setFormError('Semua field rekening harus diisi.');
      return;
    }

    try {
      setSaving(true);

      if (selectedAccount) {
        await db.updateBankAccountRecord(selectedAccount.id, payload);
        alert('Rekening donasi berhasil diperbarui.');
      } else {
        await db.createBankAccountRecord(payload);
        alert('Rekening donasi berhasil ditambahkan.');
      }

      onRefreshData();
      closeEditor();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Gagal menyimpan rekening donasi');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (account: BankAccount) => {
    const confirmed = confirm(`Hapus rekening "${account.bankName} - ${account.accountNumber}"? Tindakan ini tidak bisa dibatalkan.`);
    if (!confirmed) {
      return;
    }

    try {
      await db.deleteBankAccountRecord(account.id);
      onRefreshData();
      alert('Rekening donasi berhasil dihapus.');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Gagal menghapus rekening donasi');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif font-bold text-xl text-slate-900">Daftar Rekening Donasi</h2>
            <p className="text-xs text-slate-500">
              Rekening aktif di sini akan dipakai di halaman publik dan modal donasi. Jika kosong, sistem memakai fallback dari pengaturan utama.
            </p>
          </div>

          <button
            onClick={openCreateEditor}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tambah Rekening</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
            <p className="text-[11px] uppercase font-bold text-slate-500">Total Rekening</p>
            <p className="text-2xl font-black text-slate-900">{summary.total}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
            <p className="text-[11px] uppercase font-bold text-slate-500">Rekening Aktif</p>
            <p className="text-2xl font-black text-emerald-700">{summary.active}</p>
          </div>
        </div>
      </div>

      {isEditorOpen && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="font-serif font-bold text-lg text-slate-900">
                {selectedAccount ? 'Edit Rekening Donasi' : 'Tambah Rekening Donasi'}
              </h3>
              <p className="text-xs text-slate-500">
                Lengkapi data rekening yang akan tampil pada donasi publik.
              </p>
            </div>
            <button
              type="button"
              onClick={closeEditor}
              className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {formError && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <label className="block space-y-2">
              <span className="text-sm font-bold text-slate-800">Nama Bank</span>
              <input
                type="text"
                value={formState.bankName}
                onChange={(e) => setFormState((prev) => ({ ...prev, bankName: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-bold text-slate-800">Nomor Rekening</span>
              <input
                type="text"
                value={formState.accountNumber}
                onChange={(e) => setFormState((prev) => ({ ...prev, accountNumber: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-bold text-slate-800">Nama Pemilik</span>
              <input
                type="text"
                value={formState.accountHolder}
                onChange={(e) => setFormState((prev) => ({ ...prev, accountHolder: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-bold text-slate-800">Jenis Rekening</span>
              <input
                type="text"
                value={formState.accountType}
                onChange={(e) => setFormState((prev) => ({ ...prev, accountType: e.target.value }))}
                placeholder="Contoh: Tabungan"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </label>

            <label className="lg:col-span-2 block space-y-2">
              <span className="text-sm font-bold text-slate-800">Status</span>
              <div className="h-[52px] flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4">
                <input
                  type="checkbox"
                  checked={formState.isActive}
                  onChange={(e) => setFormState((prev) => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded-md text-emerald-600 focus:ring-emerald-500 bg-white border-slate-300"
                />
                <span className="text-sm font-semibold text-slate-700">Aktifkan rekening ini</span>
              </div>
            </label>

            <div className="lg:col-span-2 flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={closeEditor}
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>Batal</span>
              </button>

              <button
                type="submit"
                disabled={saving}
                className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-bold rounded-2xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Menyimpan...' : selectedAccount ? 'Simpan Perubahan' : 'Tambah Rekening'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bankAccounts.map((account) => (
          <div key={account.id} className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-bold text-slate-900">{account.bankName}</h3>
                </div>
                <p className="font-mono text-base font-black text-emerald-700 tracking-wider">{account.accountNumber}</p>
                <p className="text-xs text-slate-500">a.n {account.accountHolder}</p>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                account.isActive
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {account.isActive ? 'Aktif' : 'Nonaktif'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
              <span className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 flex items-center gap-1.5">
                <Banknote className="w-3.5 h-3.5 text-slate-500" />
                {account.accountType}
              </span>
              {account.isPublic && (
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold">
                  Tampil di publik
                </span>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <p className="text-[11px] text-slate-500">
                Rekening ini dipakai di pilihan transfer donasi.
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditEditor(account)}
                  className="px-3 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => void handleDelete(account)}
                  className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus</span>
                </button>
              </div>
            </div>
          </div>
        ))}

        {bankAccounts.length === 0 && (
          <div className="md:col-span-2 bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs text-center text-slate-500">
            <CheckCircle2 className="w-8 h-8 mx-auto text-slate-400 mb-3" />
            <p className="font-semibold">Belum ada rekening donasi. Tambahkan rekening pertama untuk dipakai di form donasi.</p>
          </div>
        )}
      </div>
    </div>
  );
};
