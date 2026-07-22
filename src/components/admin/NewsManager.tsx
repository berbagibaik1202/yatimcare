import React, { useMemo, useRef, useState } from 'react';
import { db } from '../../services/dbStore';
import { NewsItem } from '../../types';
import {
  Newspaper,
  Search,
  PlusCircle,
  Edit,
  Trash2,
  X,
  Save,
  Image,
  Upload,
  FileText,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Eye
} from 'lucide-react';

interface NewsManagerProps {
  onRefreshData: () => void;
}

type NewsFormState = {
  title: string;
  summary: string;
  content: string;
  coverImage: string;
  publishedAt: string;
  isPublished: boolean;
};

const defaultCoverImage = 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80';

function formatDateTimeInput(value?: string) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export const NewsManager: React.FC<NewsManagerProps> = ({ onRefreshData }) => {
  const newsList = db.getNews();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNewsForEdit, setSelectedNewsForEdit] = useState<NewsItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formState, setFormState] = useState<NewsFormState>({
    title: '',
    summary: '',
    content: '',
    coverImage: defaultCoverImage,
    publishedAt: formatDateTimeInput(new Date().toISOString()),
    isPublished: true
  });

  const filteredNews = useMemo(() => {
    const keyword = searchTerm.toLowerCase();
    return newsList.filter((item) => {
      return [
        item.title,
        item.slug,
        item.summary,
        item.content,
        item.author,
        item.category
      ]
        .join(' ')
        .toLowerCase()
        .includes(keyword);
    });
  }, [newsList, searchTerm]);

  const summary = useMemo(() => ({
    total: newsList.length,
    published: newsList.filter((item) => item.isPublished ?? true).length,
    drafts: newsList.filter((item) => !item.isPublished).length
  }), [newsList]);

  const closeModal = () => {
    if (saving) {
      return;
    }

    setIsModalOpen(false);
    setSelectedNewsForEdit(null);
    setFormError(null);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('File gambar harus berupa image.');
      e.target.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran gambar terlalu besar. Maksimal 2 MB.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      setFormState((prev) => ({ ...prev, coverImage: result }));
    };
    reader.readAsDataURL(file);
  };

  const handlePickImage = () => {
    imageInputRef.current?.click();
  };

  const handleClearImage = () => {
    setFormState((prev) => ({ ...prev, coverImage: defaultCoverImage }));
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const openCreateModal = () => {
    setSelectedNewsForEdit(null);
    setFormError(null);
    setFormState({
      title: '',
      summary: '',
      content: '',
      coverImage: defaultCoverImage,
      publishedAt: formatDateTimeInput(new Date().toISOString()),
      isPublished: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: NewsItem) => {
    setSelectedNewsForEdit(item);
    setFormError(null);
    setFormState({
      title: item.title,
      summary: item.summary,
      content: item.content,
      coverImage: item.thumbnail || defaultCoverImage,
      publishedAt: formatDateTimeInput(item.publishedAt),
      isPublished: item.isPublished ?? true
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const payload = {
      title: formState.title.trim(),
      summary: formState.summary.trim(),
      content: formState.content.trim(),
      coverImage: formState.coverImage.trim(),
      publishedAt: formState.publishedAt ? new Date(formState.publishedAt).toISOString() : undefined,
      isPublished: formState.isPublished
    };

    if (!payload.title || !payload.summary || !payload.content || !payload.coverImage) {
      setFormError('Semua field utama berita wajib diisi.');
      return;
    }

    try {
      setSaving(true);

      if (selectedNewsForEdit) {
        await db.updateNewsRecord(selectedNewsForEdit.id, payload);
        alert('Konten berita berhasil diperbarui.');
      } else {
        await db.createNewsRecord(payload);
        alert('Konten berita berhasil ditambahkan.');
      }

      onRefreshData();
      closeModal();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Gagal menyimpan konten berita');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: NewsItem) => {
    const confirmDelete = confirm(`Hapus konten berita "${item.title}"? Tindakan ini tidak bisa dibatalkan.`);
    if (!confirmDelete) {
      return;
    }

    try {
      await db.deleteNewsRecord(item.id);
      onRefreshData();
      alert('Konten berita berhasil dihapus.');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Gagal menghapus konten berita');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif font-bold text-xl text-slate-900">Konten Berita & Dokumentasi</h2>
            <p className="text-xs text-slate-500">Kelola artikel berita dan dokumentasi yang tampil pada landing page publik.</p>
          </div>

          <button
            onClick={openCreateModal}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tambah Berita</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
            <p className="text-[11px] uppercase font-bold text-slate-500">Total Konten</p>
            <p className="text-2xl font-black text-slate-900">{summary.total}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
            <p className="text-[11px] uppercase font-bold text-slate-500">Dipublikasikan</p>
            <p className="text-2xl font-black text-emerald-700">{summary.published}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
            <p className="text-[11px] uppercase font-bold text-slate-500">Draft</p>
            <p className="text-2xl font-black text-amber-700">{summary.drafts}</p>
          </div>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari judul, slug, author, atau isi berita..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredNews.map((item) => (
          <article key={item.id} className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
            <div className="relative h-52 bg-slate-100">
              <img
                src={item.thumbnail}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/10 to-transparent" />
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <span className="px-2.5 py-1 rounded-full bg-white/90 text-slate-800 text-[10px] font-bold">
                  {item.category}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  item.isPublished ?? true
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {item.isPublished ?? true ? 'Dipublikasikan' : 'Draft'}
                </span>
              </div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="font-serif font-bold text-xl leading-tight">{item.title}</h3>
                <p className="text-[11px] text-slate-100 mt-1 line-clamp-2">{item.summary}</p>
              </div>
            </div>

            <div className="p-5 space-y-4 flex-1 flex flex-col">
              <p className="text-xs text-slate-600 leading-relaxed line-clamp-4">{item.content}</p>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3">
                  <p className="text-[10px] uppercase font-bold text-slate-500">Penulis</p>
                  <p className="font-bold text-slate-900">{item.author}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3">
                  <p className="text-[10px] uppercase font-bold text-slate-500">Terbit</p>
                  <p className="font-bold text-slate-900">
                    {new Date(item.publishedAt).toLocaleDateString('id-ID')}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                <span className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  {item.slug}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  {item.createdAt ? new Date(item.createdAt).toLocaleDateString('id-ID') : '-'}
                </span>
              </div>

              <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  onClick={() => openEditModal(item)}
                  className="px-3 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => void handleDelete(item)}
                  className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus</span>
                </button>
              </div>
            </div>
          </article>
        ))}

        {filteredNews.length === 0 && (
          <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs text-center text-slate-500">
            <Newspaper className="w-8 h-8 mx-auto text-slate-400 mb-3" />
            <p className="font-semibold">Tidak ada konten berita yang cocok dengan pencarian.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-white rounded-[28px] shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h3 className="font-serif font-bold text-xl text-slate-900">
                  {selectedNewsForEdit ? 'Edit Konten Berita' : 'Tambah Konten Berita'}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedNewsForEdit ? 'Perbarui artikel berita yang tampil di landing page.' : 'Buat berita baru untuk dokumentasi dan publikasi yayasan.'}
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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <label className="block space-y-2 lg:col-span-2">
                  <span className="text-sm font-bold text-slate-800">Judul Berita</span>
                  <input
                    type="text"
                    value={formState.title}
                    onChange={(e) => setFormState((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </label>

                <label className="block space-y-2 lg:col-span-2">
                  <span className="text-sm font-bold text-slate-800">Ringkasan</span>
                  <textarea
                    rows={3}
                    value={formState.summary}
                    onChange={(e) => setFormState((prev) => ({ ...prev, summary: e.target.value }))}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </label>

                <label className="block space-y-2 lg:col-span-2">
                  <span className="text-sm font-bold text-slate-800">Isi Berita</span>
                  <textarea
                    rows={7}
                    value={formState.content}
                    onChange={(e) => setFormState((prev) => ({ ...prev, content: e.target.value }))}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-bold text-slate-800">Tanggal Publikasi</span>
                  <input
                    type="datetime-local"
                    value={formState.publishedAt}
                    onChange={(e) => setFormState((prev) => ({ ...prev, publishedAt: e.target.value }))}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-bold text-slate-800">Status Publikasi</span>
                  <div className="h-[52px] flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4">
                    <input
                      type="checkbox"
                      checked={formState.isPublished}
                      onChange={(e) => setFormState((prev) => ({ ...prev, isPublished: e.target.checked }))}
                      className="rounded-md text-emerald-600 focus:ring-emerald-500 bg-slate-50 border-slate-300"
                    />
                    <span className="text-sm text-slate-700 font-medium">Tampilkan di halaman publik</span>
                  </div>
                </label>

                <label className="block space-y-2 lg:col-span-2">
                  <span className="text-sm font-bold text-slate-800">Gambar Berita</span>
                  <div className="grid grid-cols-1 lg:grid-cols-[160px_1fr] gap-3 items-start">
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-3">
                      <div className="w-full aspect-[4/3] rounded-2xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center">
                        {formState.coverImage ? (
                          <img src={formState.coverImage} alt="Preview berita" className="w-full h-full object-cover" />
                        ) : (
                          <Image className="w-6 h-6 text-slate-400" />
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={handlePickImage}
                          className="px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-2xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                        >
                          <Upload className="w-4 h-4" />
                          <span>Pilih File Gambar</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleClearImage}
                          className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                          <span>Reset Gambar</span>
                        </button>
                      </div>

                      <input
                        type="url"
                        value={formState.coverImage}
                        onChange={(e) => setFormState((prev) => ({ ...prev, coverImage: e.target.value }))}
                        placeholder="Atau tempel URL gambar di sini"
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />

                      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-xs text-slate-500 leading-relaxed">
                        Upload gambar akan disimpan sebagai data URL. Jika punya link gambar dari internet, isi URL di bawah.
                      </div>
                    </div>
                  </div>
                </label>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-bold rounded-2xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Menyimpan...' : 'Simpan Konten Berita'}</span>
                </button>

                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>Batal</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
