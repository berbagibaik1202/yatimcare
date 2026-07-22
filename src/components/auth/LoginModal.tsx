import React, { useEffect, useState } from 'react';
import { LogIn, Lock, Mail, ShieldCheck, UserCheck } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  loading?: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (email: string, password: string) => Promise<void>;
}

const demoAccounts = [
  { label: 'Super Admin', email: 'admin@yayasan.org' },
  { label: 'Bendahara', email: 'bendahara@yayasan.org' },
  { label: 'Petugas', email: 'petugas@yayasan.org' },
  { label: 'Donatur', email: 'ratna.pertiwi@gmail.com' },
  { label: 'Wali', email: 'sri.mulyani.wali@gmail.com' }
];

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  loading = false,
  error = null,
  onClose,
  onSubmit
}) => {
  const [email, setEmail] = useState('admin@yayasan.org');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setEmail('admin@yayasan.org');
      setPassword('');
      setLocalError(null);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLocalError(null);

    try {
      await onSubmit(email, password);
    } catch (submitError) {
      setLocalError(submitError instanceof Error ? submitError.message : 'Login gagal');
    }
  };

  const activeError = error ?? localError;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm px-4 py-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl overflow-hidden rounded-[32px] border border-white/10 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white p-8 sm:p-10 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.35),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(16,185,129,0.35),_transparent_30%)]" />
            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-100">
                <ShieldCheck className="h-4 w-4 text-amber-300" />
                <span>Login YatimCare</span>
              </div>

              <div className="space-y-3">
                <h2 className="font-serif text-3xl font-black tracking-tight text-white sm:text-4xl">
                  Masuk ke sistem dengan akun terverifikasi
                </h2>
                <p className="max-w-xl text-sm leading-relaxed text-emerald-100/90">
                  Gunakan email dan password akun yang sudah disiapkan di seed data. Setelah login, dashboard akan terbuka sesuai role pengguna.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {demoAccounts.map((account) => (
                  <button
                    key={account.email}
                    type="button"
                    onClick={() => {
                      setEmail(account.email);
                      setPassword('');
                    }}
                    className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-left text-xs font-semibold text-white transition-colors hover:bg-white/15"
                  >
                    <div className="flex items-center gap-2 text-emerald-100">
                      <UserCheck className="h-4 w-4" />
                      <span>{account.label}</span>
                    </div>
                    <div className="mt-1 text-[11px] text-emerald-100/75">{account.email}</div>
                  </button>
                ))}
              </div>

              <div className="rounded-3xl border border-white/15 bg-white/10 p-4 text-xs text-emerald-50">
                <p className="font-bold text-white">Password demo seed</p>
                <p className="mt-1 text-emerald-100/85">
                  <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-emerald-50">YatimCare123!</code>
                  {' '}untuk semua akun seeded yang bisa login.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-8 sm:p-10">
            <div className="space-y-5">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Akses Akun</p>
                <h3 className="text-2xl font-black text-slate-900">Login ke YatimCare</h3>
                <p className="text-sm text-slate-600">Masukkan kredensial akun resmi untuk membuka portal sesuai peran.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Email
                  </label>
                  <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 focus-within:border-emerald-500">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none"
                      placeholder="nama@yayasan.org"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Password
                  </label>
                  <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 focus-within:border-emerald-500">
                    <Lock className="h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none"
                      placeholder="Masukkan password"
                      autoComplete="current-password"
                      required
                    />
                  </div>
                </div>

                {activeError && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                    {activeError}
                  </div>
                )}

                <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-100"
                    disabled={loading}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>{loading ? 'Memproses...' : 'Masuk Sekarang'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
