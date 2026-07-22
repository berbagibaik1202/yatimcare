import React, { useMemo, useState } from 'react';
import { db } from '../../services/dbStore';
import { User, UserRole } from '../../types';
import {
  Search,
  Users,
  UserCog,
  Mail,
  Phone,
  Calendar,
  PlusCircle,
  Edit,
  Trash2,
  X,
  Save,
  Image,
  AlertTriangle
} from 'lucide-react';

interface AdminUsersManagerProps {
  onRefreshData: () => void;
}

type AdminUserFormState = {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: User['status'];
  avatar: string;
  password: string;
};

const roleLabels: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Administrator',
  bendahara: 'Bendahara',
  petugas: 'Petugas Lapangan',
  donatur: 'Donatur',
  wali: 'Wali',
  public: 'Publik'
};

export const AdminUsersManager: React.FC<AdminUsersManagerProps> = ({ onRefreshData }) => {
  const currentUser = db.getCurrentUser();
  const users = db.getUsers();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formState, setFormState] = useState<AdminUserFormState>({
    name: '',
    email: '',
    phone: '',
    role: 'admin',
    status: 'active',
    avatar: '',
    password: ''
  });

  const allowedRoles = useMemo<UserRole[]>(
    () => (currentUser?.role === 'super_admin'
      ? ['super_admin', 'admin', 'bendahara', 'petugas']
      : ['admin', 'bendahara', 'petugas']),
    [currentUser?.role]
  );

  const adminUsers = useMemo(
    () => users.filter(user => allowedRoles.includes(user.role)),
    [allowedRoles, users]
  );

  const filteredUsers = useMemo(() => {
    const query = searchTerm.toLowerCase();

    return adminUsers.filter(user => {
      const matchesSearch =
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.phone.includes(searchTerm) ||
        roleLabels[user.role].toLowerCase().includes(query);

      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [adminUsers, roleFilter, searchTerm]);

  const stats = useMemo(() => ({
    total: adminUsers.length,
    active: adminUsers.filter(user => user.status === 'active').length,
    suspended: adminUsers.filter(user => user.status === 'suspended').length
  }), [adminUsers]);

  const availableRoleOptions = useMemo(() => {
    const baseRoles: UserRole[] = currentUser?.role === 'super_admin'
      ? ['super_admin', 'admin', 'bendahara', 'petugas']
      : ['admin', 'bendahara', 'petugas'];

    return baseRoles.map(role => ({ value: role, label: roleLabels[role] }));
  }, [currentUser?.role]);

  const openCreateModal = () => {
    setFormError(null);
    setSelectedUserForEdit(null);
    setFormState({
      name: '',
      email: '',
      phone: '',
      role: currentUser?.role === 'super_admin' ? 'admin' : 'admin',
      status: 'active',
      avatar: '',
      password: ''
    });
    setIsCreateModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setFormError(null);
    setSelectedUserForEdit(user);
    setFormState({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      avatar: user.avatar ?? '',
      password: ''
    });
    setIsCreateModalOpen(true);
  };

  const closeModal = () => {
    if (saving) {
      return;
    }

    setIsCreateModalOpen(false);
    setSelectedUserForEdit(null);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    try {
      setSaving(true);

      const payload = {
        name: formState.name.trim(),
        email: formState.email.trim(),
        phone: formState.phone.trim(),
        role: formState.role,
        status: formState.status,
        avatar: formState.avatar.trim() || undefined
      };

      if (selectedUserForEdit) {
        const updatePayload: Parameters<typeof db.updateUserRecord>[1] = {
          ...payload
        };

        if (formState.password.trim()) {
          updatePayload.password = formState.password.trim();
        }

        await db.updateUserRecord(selectedUserForEdit.id, updatePayload);
        alert('User aplikasi berhasil diperbarui.');
      } else {
        if (!formState.password.trim()) {
          throw new Error('Password wajib diisi saat membuat user baru.');
        }

        await db.createUserRecord({
          ...payload,
          password: formState.password.trim()
        });
        alert('User aplikasi berhasil ditambahkan.');
      }

      onRefreshData();
      closeModal();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Gagal menyimpan user aplikasi');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (currentUser?.id === user.id) {
      alert('Anda tidak dapat menghapus akun sendiri.');
      return;
    }

    const confirmDelete = confirm(`Hapus akun "${user.name}"? Tindakan ini tidak bisa dibatalkan.`);
    if (!confirmDelete) {
      return;
    }

    try {
      await db.deleteUserRecord(user.id);
      onRefreshData();
      alert('User aplikasi berhasil dihapus.');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Gagal menghapus user aplikasi');
    }
  };

  const isEditingSelf = selectedUserForEdit?.id === currentUser?.id;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif font-bold text-xl text-slate-900">User Aplikasi Admin</h2>
            <p className="text-xs text-slate-500">Kelola akun pengelola sistem yang dapat masuk ke portal admin YatimCare.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold inline-flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{stats.total} Akun Admin</span>
            </span>

            <button
              onClick={openCreateModal}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="Tambah User"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Tambah User</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
            <p className="text-[11px] uppercase font-bold text-slate-500">Aktif</p>
            <p className="text-2xl font-black text-emerald-700">{stats.active}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
            <p className="text-[11px] uppercase font-bold text-slate-500">Suspended</p>
            <p className="text-2xl font-black text-rose-700">{stats.suspended}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
            <p className="text-[11px] uppercase font-bold text-slate-500">Role Tersedia</p>
            <p className="text-sm font-bold text-slate-900">{availableRoleOptions.map(role => role.label).join(', ')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as 'all' | UserRole)}
            className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          >
            <option value="all">Semua Role Admin</option>
            {allowedRoles.map(role => (
              <option key={role} value={role}>{roleLabels[role]}</option>
            ))}
          </select>
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
                <th className="p-3.5">Terdaftar</th>
                <th className="p-3.5 text-right rounded-r-xl">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Tidak ada akun admin yang sesuai pencarian.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-slate-100 overflow-hidden flex items-center justify-center text-slate-500 shrink-0">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            <UserCog className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 flex items-center gap-2">
                            <span>{user.name}</span>
                            {currentUser?.id === user.id && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">Anda</span>
                            )}
                          </p>
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
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="px-3 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => void handleDeleteUser(user)}
                          disabled={currentUser?.id === user.id}
                          className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-white rounded-[28px] shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h3 className="font-serif font-bold text-xl text-slate-900">
                  {selectedUserForEdit ? 'Edit User Aplikasi' : 'Tambah User Aplikasi'}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedUserForEdit ? 'Perbarui data akun pengelola sistem.' : 'Buat akun pengelola sistem baru dengan role yang sesuai.'}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {formError && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block space-y-2">
                  <span className="text-sm font-bold text-slate-800">Nama Lengkap</span>
                  <input
                    type="text"
                    value={formState.name}
                    onChange={(e) => setFormState(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-bold text-slate-800">Email</span>
                  <input
                    type="email"
                    value={formState.email}
                    onChange={(e) => setFormState(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-bold text-slate-800">Nomor HP</span>
                  <input
                    type="text"
                    value={formState.phone}
                    onChange={(e) => setFormState(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-bold text-slate-800">Role</span>
                  <select
                    value={formState.role}
                    onChange={(e) => setFormState(prev => ({ ...prev, role: e.target.value as UserRole }))}
                    disabled={isEditingSelf}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden disabled:opacity-70"
                  >
                    {availableRoleOptions.map(role => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                  {isEditingSelf && (
                    <p className="text-[11px] text-slate-500">Role akun sendiri tidak dapat diubah dari halaman ini.</p>
                  )}
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-bold text-slate-800">Status</span>
                  <select
                    value={formState.status}
                    onChange={(e) => setFormState(prev => ({ ...prev, status: e.target.value as User['status'] }))}
                    disabled={isEditingSelf}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden disabled:opacity-70"
                  >
                    <option value="active">Aktif</option>
                    <option value="suspended">Suspended</option>
                  </select>
                  {isEditingSelf && (
                    <p className="text-[11px] text-slate-500">Status akun sendiri tidak dapat diubah dari halaman ini.</p>
                  )}
                </label>

                <label className="block space-y-2 md:col-span-2">
                  <span className="text-sm font-bold text-slate-800">Avatar URL</span>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                      {formState.avatar ? (
                        <img src={formState.avatar} alt="Avatar preview" className="w-full h-full object-cover" />
                      ) : (
                        <Image className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <input
                      type="url"
                      value={formState.avatar}
                      onChange={(e) => setFormState(prev => ({ ...prev, avatar: e.target.value }))}
                      placeholder="https://..."
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </label>

                <label className="block space-y-2 md:col-span-2">
                  <span className="text-sm font-bold text-slate-800">
                    {selectedUserForEdit ? 'Password Baru' : 'Password'}
                  </span>
                  <input
                    type="password"
                    value={formState.password}
                    onChange={(e) => setFormState(prev => ({ ...prev, password: e.target.value }))}
                    placeholder={selectedUserForEdit ? 'Kosongkan jika tidak diubah' : 'Minimal 6 karakter'}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </label>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
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
                  <span>{saving ? 'Menyimpan...' : selectedUserForEdit ? 'Simpan Perubahan' : 'Tambah User'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
