import React, { useState } from 'react';
import { db } from '../../services/dbStore';
import { Child, OrphanCategory, Guardian, AidDistribution } from '../../types';
import {
  Users,
  PlusCircle,
  FileCheck,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  MapPin,
  Upload,
  Phone,
  FileText,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

interface GuardianPortalProps {
  onRefreshData: () => void;
}

export const GuardianPortal: React.FC<GuardianPortalProps> = ({ onRefreshData }) => {
  const currentUser = db.getCurrentUser();
  const allChildren = db.getChildren();
  const aidDistributions = db.getAidDistributions();

  // Filter children submitted by current guardian/user or mock list
  const guardianChildren = allChildren.filter(c => c.guardianPhone === currentUser?.phone || c.guardianName.toLowerCase().includes('sri') || true);

  const [activeTab, setActiveTab] = useState<'list' | 'form'>('list');
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // Form State
  const [guardianName, setGuardianName] = useState(currentUser?.name || 'Sri Mulyani');
  const [guardianNik, setGuardianNik] = useState('3204125809750002');
  const [guardianRelationship, setGuardianRelationship] = useState('Ibu Kandung');
  const [guardianOccupation, setGuardianOccupation] = useState('Buruh Harian');
  const [guardianIncome, setGuardianIncome] = useState<number>(900000);
  const [guardianPhone, setGuardianPhone] = useState(currentUser?.phone || '085233445566');

  // Child Data
  const [childFullName, setChildFullName] = useState('');
  const [childNickname, setChildNickname] = useState('');
  const [childNik, setChildNik] = useState('');
  const [familyCardNumber, setFamilyCardNumber] = useState('');
  const [orphanCategory, setOrphanCategory] = useState<OrphanCategory>('yatim');
  const [birthPlace, setBirthPlace] = useState('Sumedang');
  const [birthDate, setBirthDate] = useState('2015-06-10');
  const [gender, setGender] = useState<'L' | 'P'>('L');
  const [schoolName, setSchoolName] = useState('SDN Tanjungmedar 1');
  const [educationLevel, setEducationLevel] = useState<'TK' | 'SD' | 'SMP' | 'SMA/K' | 'Perguruan Tinggi' | 'Belum Sekolah'>('SD');
  const [schoolGrade, setSchoolGrade] = useState('Kelas 4');
  const [address, setAddress] = useState('Jl. Pemuda No. 42, RT 03/RW 05');
  const [district, setDistrict] = useState('Tanjungmedar');
  const [city, setCity] = useState('Sumedang');
  const [latitude, setLatitude] = useState<number>(-6.8273);
  const [longitude, setLongitude] = useState<number>(107.9254);
  const [homeOwnershipStatus, setHomeOwnershipStatus] = useState<'Milik Sendiri' | 'Sewa' | 'Menumpang' | 'Lainnya'>('Menumpang');

  // Check NIK duplication dynamically
  const handleNikChange = (value: string) => {
    setChildNik(value);
    if (value.length >= 16) {
      const existing = db.checkDuplicateNIK(value);
      if (existing) {
        setDuplicateWarning(`NIK ${value} sudah terdaftar dalam sistem atas nama: ${existing.fullName} (${existing.registrationNumber}).`);
      } else {
        setDuplicateWarning(null);
      }
    } else {
      setDuplicateWarning(null);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (duplicateWarning) {
      alert('Terdapat peringatan NIK ganda. Silakan periksa kembali NIK anak.');
      return;
    }

    db.addChild({
      guardianId: 'gdn-1',
      guardianName,
      guardianPhone,
      fullName: childFullName,
      nickname: childNickname || childFullName.split(' ')[0],
      birthPlace,
      birthDate,
      gender,
      orphanCategory,
      nik: childNik,
      familyCardNumber,
      address,
      rt: '03',
      rw: '05',
      province: 'Jawa Barat',
      city,
      district,
      village: 'Tanjungmedar',
      postalCode: '45354',
      latitude,
      longitude,
      schoolName,
      educationLevel,
      schoolGrade,
      healthCondition: 'Sehat',
      familyMembers: 3,
      homeOwnershipStatus,
      status: 'menunggu_verifikasi',
      verificationNotes: 'Pengajuan baru dari portal wali. Menunggu verifikasi berkas dan survei lapangan.',
      registeredAt: new Date().toISOString(),
      photoUrl: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=400&q=80',
      documents: [
        {
          id: `doc-${Date.now()}`,
          childId: '',
          documentType: 'kk',
          title: 'Kartu Keluarga Unggahan Wali',
          filePath: '/docs/kk_upload.pdf',
          verificationStatus: 'menunggu',
          uploadedAt: new Date().toISOString()
        }
      ]
    });

    onRefreshData();
    alert('Pengajuan pendaftaran anak berhasil dikirim! Petugas lapangan akan melakukan verifikasi berkas & survei.');
    setActiveTab('list');
    
    // Reset form
    setChildFullName('');
    setChildNik('');
    setFamilyCardNumber('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-900">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white rounded-3xl p-8 shadow-md border border-emerald-600 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 text-white border border-white/30 text-xs font-bold uppercase tracking-wider">
            <Users className="w-3.5 h-3.5 text-amber-300" />
            <span>Portal Pengajuan & Wali Anak Yatim Piatu</span>
          </div>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-white">
            Selamat Datang, Ibu {currentUser?.name || 'Sri Mulyani'}
          </h1>
          <p className="text-xs text-emerald-100 max-w-2xl leading-relaxed">
            Daftarkan anak yatim/piatu yang berada dalam pengasuhan Anda untuk mendapatkan bantuan santunan bulanan, beasiswa sekolah, dan perlengkapan pendidikan.
          </p>
        </div>

        <div className="flex gap-2 relative z-10">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-5 py-3 rounded-2xl font-black text-xs transition-all cursor-pointer ${
              activeTab === 'list' ? 'bg-amber-400 text-slate-950 shadow-md' : 'bg-white/20 hover:bg-white/30 text-white border border-white/30'
            }`}
          >
            Daftar Pengajuan ({guardianChildren.length})
          </button>
          <button
            onClick={() => setActiveTab('form')}
            className={`px-5 py-3 rounded-2xl font-black text-xs transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'form' ? 'bg-amber-400 text-slate-950 shadow-md' : 'bg-white/20 hover:bg-white/30 text-white border border-white/30'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Pengajuan Baru</span>
          </button>
        </div>
      </div>

      {/* TAB CONTENT: LIST OF SUBMITTED APPLICATIONS */}
      {activeTab === 'list' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-sans font-black text-xl text-slate-900">Status Pendaftaran & Bantuan Anak Binaan</h2>
            <span className="text-xs text-slate-500 font-medium">Terakhir diperbarui: Hari ini</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {guardianChildren.map(child => {
              const childAids = aidDistributions.filter(a => a.childId === child.id);

              return (
                <div key={child.id} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 text-slate-900">
                  
                  {/* Top info */}
                  <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <img
                        src={child.photoUrl}
                        alt={child.fullName}
                        className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-xs"
                      />
                      <div>
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-black uppercase tracking-wider">
                          {child.orphanCategory.replace('_', ' ')}
                        </span>
                        <h3 className="font-bold text-slate-900 text-base mt-0.5">{child.fullName}</h3>
                        <p className="text-xs text-slate-500">{child.schoolName} ({child.schoolGrade})</p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="text-right">
                      {child.status === 'aktif' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                          Terverifikasi Aktif
                        </span>
                      )}
                      {child.status === 'menunggu_verifikasi' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold">
                          <Clock className="w-3.5 h-3.5 text-amber-700" />
                          Proses Verifikasi
                        </span>
                      )}
                      {child.status === 'ditolak' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold">
                          <XCircle className="w-3.5 h-3.5 text-rose-700" />
                          Ditolak
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Verification Notes */}
                  {child.verificationNotes && (
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs text-slate-700">
                      <strong className="text-emerald-700 font-bold">Catatan Petugas:</strong> {child.verificationNotes}
                    </div>
                  )}

                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                      <span className="text-slate-500 font-medium">Nomor Registrasi:</span>
                      <p className="font-mono font-bold text-emerald-800 mt-0.5">{child.registrationNumber}</p>
                    </div>
                    <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200">
                      <span className="text-slate-500 font-medium">Total Bantuan Diterima:</span>
                      <p className="font-black text-emerald-800 mt-0.5">Rp {child.totalAidReceived.toLocaleString('id-ID')}</p>
                    </div>
                  </div>

                  {/* History of Aid */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 mb-2">Riwayat Penyaluran Bantuan Terbaru:</h4>
                    {childAids.length > 0 ? (
                      <div className="space-y-2">
                        {childAids.map(aid => (
                          <div key={aid.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                            <div>
                              <p className="font-bold text-slate-900">{aid.aidType} — {aid.itemDescription}</p>
                              <p className="text-[10px] text-slate-500">{aid.distributionDate} • Petugas: {aid.officerName}</p>
                            </div>
                            <span className="font-bold text-emerald-800">Rp {aid.amount.toLocaleString('id-ID')}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">Belum ada penyaluran bantuan tercatat untuk anak ini.</p>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT: FORM PENGAJUAN ANAK BARU */}
      {activeTab === 'form' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="font-serif font-bold text-xl text-slate-900">Formulir Pendaftaran Anak Penerima Bantuan Baru</h2>
            <p className="text-xs text-slate-500 mt-0.5">Harap mengisikan data secara benar sesuai Kartu Keluarga & Akta Kelahiran asli.</p>
          </div>

          {/* Duplicate NIK Warning Alert */}
          {duplicateWarning && (
            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 flex items-start gap-3 text-xs text-rose-900">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Deteksi Sistem: Data Ganda Ditemukan!</strong>
                <p className="mt-0.5">{duplicateWarning}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-6 text-xs">
            
            {/* SECTION 1: DATA WALI */}
            <div className="space-y-3 p-5 bg-slate-50 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider text-emerald-800">1. Data Wali / Pengaju Bantuan</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Nama Lengkap Wali *</label>
                  <input
                    type="text"
                    required
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">NIK Wali (16 Digit) *</label>
                  <input
                    type="text"
                    required
                    maxLength={16}
                    value={guardianNik}
                    onChange={(e) => setGuardianNik(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Hubungan Dengan Anak *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Ibu Kandung (Janda), Paman, Nenek"
                    value={guardianRelationship}
                    onChange={(e) => setGuardianRelationship(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Pekerjaan Wali *</label>
                  <input
                    type="text"
                    required
                    value={guardianOccupation}
                    onChange={(e) => setGuardianOccupation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Estimasi Penghasilan Bulanan *</label>
                  <input
                    type="number"
                    required
                    value={guardianIncome}
                    onChange={(e) => setGuardianIncome(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Nomor Telepon / WhatsApp Wali *</label>
                  <input
                    type="text"
                    required
                    value={guardianPhone}
                    onChange={(e) => setGuardianPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: DATA ANAK */}
            <div className="space-y-3 p-5 bg-slate-50 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider text-emerald-800">2. Data Identitas Anak</h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Nama Lengkap Anak *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama lengkap sesuai KK"
                    value={childFullName}
                    onChange={(e) => setChildFullName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">NIK Anak (16 Digit) *</label>
                  <input
                    type="text"
                    required
                    maxLength={16}
                    placeholder="3204xxxxxxxxxxxx"
                    value={childNik}
                    onChange={(e) => handleNikChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Nomor Kartu Keluarga *</label>
                  <input
                    type="text"
                    required
                    maxLength={16}
                    placeholder="3204xxxxxxxxxxxx"
                    value={familyCardNumber}
                    onChange={(e) => setFamilyCardNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Kategori Anak Yatim/Piatu *</label>
                  <select
                    value={orphanCategory}
                    onChange={(e) => setOrphanCategory(e.target.value as OrphanCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="yatim">Yatim (Ayah Meninggal)</option>
                    <option value="piatu">Piatu (Ibu Meninggal)</option>
                    <option value="yatim_piatu">Yatim Piatu (Ayah & Ibu Meninggal)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Tempat Lahir *</label>
                  <input
                    type="text"
                    required
                    value={birthPlace}
                    onChange={(e) => setBirthPlace(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Tanggal Lahir *</label>
                  <input
                    type="date"
                    required
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Nama Sekolah / Madrasah *</label>
                  <input
                    type="text"
                    required
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Jenjang Pendidikan *</label>
                  <select
                    value={educationLevel}
                    onChange={(e) => setEducationLevel(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="SD">SD / MI</option>
                    <option value="SMP">SMP / MTs</option>
                    <option value="SMA/K">SMA / SMK / MA</option>
                    <option value="TK">TK / PAUD</option>
                    <option value="Belum Sekolah">Belum Sekolah</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Kelas *</label>
                  <input
                    type="text"
                    required
                    value={schoolGrade}
                    onChange={(e) => setSchoolGrade(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: LOKASI & ALAMAT */}
            <div className="space-y-3 p-5 bg-slate-50 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider text-emerald-800">3. Alamat & Titik Lokasi Tempat Tinggal</h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-medium text-slate-700 mb-1">Alamat Lengkap (Jalan / Dusun / RT / RW) *</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Kecamatan *</label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Kabupaten / Kota *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Status Tempat Tinggal *</label>
                  <select
                    value={homeOwnershipStatus}
                    onChange={(e) => setHomeOwnershipStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="Menumpang">Menumpang Lahan Kerabat</option>
                    <option value="Sewa">Sewa / Kontrak</option>
                    <option value="Milik Sendiri">Milik Sendiri</option>
                  </select>
                </div>
              </div>
            </div>

            {/* UPLOAD DOCUMENT SIMULATION */}
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-slate-800 space-y-2">
              <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-emerald-700" />
                Upload Dokumen Persyaratan (Kartu Keluarga & Surat Kematian)
              </span>
              <p className="text-[11px] text-slate-600">
                Sistem secara otomatis melampirkan berkas digital standar awal. Petugas survei lapangan akan membawa dokumen fisik verifikasi saat kunjungan rumah.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={!!duplicateWarning}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold rounded-xl shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2 text-sm"
              >
                <span>Kirimkan Pengajuan Pendaftaran Anak</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
};
