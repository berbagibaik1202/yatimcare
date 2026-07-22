import React, { useMemo, useState } from 'react';
import { db } from '../../services/dbStore';
import { UserRole } from '../../types';
import { ShieldCheck, Search, Users, UserCog, Mail, Phone, Calendar } from 'lucide-react';

interface AdminUsersManagerProps {
  onRefreshData: () => void;
}

const roleLabels: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Administrator',
  bendahara: 'Bendahara',
  petugas: 'Petugas Lapangan',
  donatur: 'Donatur',
  wali: 'Wali',
  public: 'Publik'
};

export const AdminUsersManager: React.FC<AdminUsersManagerProps> = () => {
  const users = db.getUsers();
  const [searchTerm, setSearchTerm] = useState('');

  const adminUsers = useMemo(
    () => users.filter(user => ['super_admin', 'admin', 'bendahara', 'petugas'].includes(user.role)),
    [users]
  );

  const filteredUsers = adminUsers.filter(user => {
    const query = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.phone.includes(searchTerm) ||
      roleLabels[user.role].toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif font-bold text-xl text-slate-900">User Aplikasi Admin</h2>
            <p className="text-xs text-slate-500">Daftar akun pengelola sistem yang aktif di aplikasi YatimCare.</p>
          </div>

          <div className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold inline-flex items-center gap-2 self-start">
            <Users className="w-4 h-4" />
            <span>{adminUsers.length} Akun Admin</span>
          </div>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama, email, nomor HP, atau role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider bg-slate-50">
                <th className="p-3.5 rounded-l-xl">Nama</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Kontak</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 rounded-r-xl">Terdaftar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Tidak ada akun admin yang sesuai pencarian.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500">
                          <UserCog className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{user.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        {roleLabels[user.role]}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{user.email}</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{user.phone}</span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${user.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                        {user.status === 'active' ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(user.createdAt).toLocaleDateString('id-ID')}</span>
                      </div>
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
