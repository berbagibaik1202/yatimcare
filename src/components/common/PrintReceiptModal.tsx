import React from 'react';
import { Donation, Child } from '../../types';
import { Printer, Download, X, Heart, ShieldCheck, CheckCircle2, FileText, Image } from 'lucide-react';

interface PrintReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  donation?: Donation;
  child?: Child;
}

export const PrintReceiptModal: React.FC<PrintReceiptModalProps> = ({
  isOpen,
  onClose,
  donation,
  child
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl border border-slate-100 relative my-8 animate-in zoom-in-95 duration-200">
        
        {/* Modal Controls Bar */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-lg">
              {donation ? 'Kuitansi Resmi Donasi YatimCare' : 'Lembar Biodata Resmi Anak YatimCare'}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              title="Tutup Modal"
              aria-label="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div className="pt-6 space-y-6 print:p-0 print:m-0" id="printable-receipt">
          
          {/* Header Document */}
          <div className="flex items-start justify-between pb-6 border-b-2 border-slate-900">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-700 flex items-center justify-center text-white font-bold text-xl">
                YC
              </div>
              <div>
                <h2 className="font-serif font-bold text-2xl text-slate-900">Yayasan Peduli YatimCare</h2>
                <p className="text-xs text-slate-600 font-medium">Sistem Informasi Pengelolaan Yatim Piatu Terpadu</p>
                <p className="text-[11px] text-slate-500">Izin Kemenkumham No. AHU-0012984.AH.01.04 Tahun 2024</p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase tracking-wider">
                {donation ? 'KUITANSI RESMI' : 'DOKUMEN RESMI'}
              </span>
              <p className="text-xs font-mono font-bold text-slate-700 mt-2">
                {donation ? donation.transactionNumber : child?.registrationNumber}
              </p>
              <p className="text-[11px] text-slate-500">Tanggal: {new Date().toLocaleDateString('id-ID')}</p>
            </div>
          </div>

          {/* Donation Receipt Format */}
          {donation && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Telah Diterima Dari</p>
                <p className="text-base font-bold text-slate-900">
                  {donation.isAnonymous ? 'Hamba Allah (Anonim)' : donation.donorName}
                </p>
                <p className="text-xs text-slate-600">{donation.donorEmail} • {donation.donorPhone}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-500 font-medium">Program Tujuan:</span>
                  <p className="font-bold text-slate-800 mt-1">{donation.programTitle}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-500 font-medium">Jenis Donasi:</span>
                  <p className="font-bold text-slate-800 uppercase mt-1">{donation.donationType}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-500 font-medium">Metode Pembayaran:</span>
                  <p className="font-bold text-slate-800 uppercase mt-1">{donation.paymentMethod.replace('_', ' ')}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-500 font-medium">Status Verifikasi:</span>
                  <p className="font-bold text-emerald-700 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    BERHASIL TERVERIFIKASI
                  </p>
                </div>
              </div>

              {(donation.paymentReference || donation.paymentProofUrl) && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>Referensi Pembayaran & Bukti Transfer</span>
                  </div>

                  {donation.paymentReference && (
                    <div className="p-3 bg-slate-50 rounded-xl text-xs">
                      <span className="text-slate-500 font-medium">Referensi Pembayaran:</span>
                      <p className="font-mono font-bold text-slate-900 mt-1 break-all">{donation.paymentReference}</p>
                    </div>
                  )}

                  {donation.paymentProofUrl && (
                    <div className="p-3 bg-slate-50 rounded-xl text-xs">
                      <div className="flex items-center gap-2 text-slate-500 font-medium mb-2">
                        <Image className="w-4 h-4 text-emerald-600" />
                        <span>Bukti Transfer</span>
                      </div>
                      <img
                        src={donation.paymentProofUrl}
                        alt="Bukti transfer"
                        className="w-full max-h-72 object-contain rounded-xl border border-slate-200 bg-white"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Total Amount Display Box */}
              <div className="p-6 bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-2xl shadow-md flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase font-medium text-emerald-200">Jumlah Donasi Diterima</p>
                  <p className="text-3xl font-extrabold font-serif mt-1">
                    Rp {donation.amount.toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center">
                  <Heart className="w-8 h-8 fill-emerald-300 text-emerald-300" />
                </div>
              </div>

              {donation.donorMessage && (
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 italic">
                  "{donation.donorMessage}"
                </div>
              )}
            </div>
          )}

          {/* Child Biodata Format */}
          {child && (
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <img
                  src={child.photoUrl}
                  alt={child.fullName}
                  className="w-28 h-36 rounded-2xl object-cover border-2 border-slate-300 shadow-sm"
                />
                <div className="space-y-1 text-xs text-slate-700">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                    Kategori {child.orphanCategory.replace('_', ' ')}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900">{child.fullName}</h3>
                  <p><strong>Nomor Registrasi:</strong> {child.registrationNumber}</p>
                  <p><strong>NIK:</strong> {child.nik}</p>
                  <p><strong>Tempat, Tgl Lahir:</strong> {child.birthPlace}, {child.birthDate}</p>
                  <p><strong>Pendidikan:</strong> {child.schoolName} ({child.educationLevel} - {child.schoolGrade})</p>
                  <p><strong>Alamat:</strong> {child.address}, Desa {child.village}, Kec. {child.district}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <p className="text-slate-500">Nama Wali / Pengasuh:</p>
                  <p className="font-bold text-slate-900">{child.guardianName}</p>
                </div>
                <div>
                  <p className="text-slate-500">Kontak Wali:</p>
                  <p className="font-bold text-slate-900">{child.guardianPhone}</p>
                </div>
                <div>
                  <p className="text-slate-500">Status Rumah:</p>
                  <p className="font-bold text-slate-900">{child.homeOwnershipStatus}</p>
                </div>
                <div>
                  <p className="text-slate-500">Total Bantuan Diterima:</p>
                  <p className="font-bold text-emerald-700">Rp {child.totalAidReceived.toLocaleString('id-ID')}</p>
                </div>
              </div>
            </div>
          )}

          {/* Official Signatures */}
          <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <p className="text-slate-500 font-medium">Petugas / Bendahara Yayasan</p>
              <div className="h-16 flex items-center justify-center font-serif italic text-slate-400 text-sm">
                [ Tanda Tangan Digital & Stempel ]
              </div>
              <p className="font-bold text-slate-900">Siti Aminah, S.E.</p>
              <p className="text-[10px] text-slate-500">Bendahara Pengurus</p>
            </div>
            <div>
              <p className="text-slate-500 font-medium">Ketua Yayasan YatimCare</p>
              <div className="h-16 flex items-center justify-center font-serif italic text-slate-400 text-sm">
                [ Terverifikasi Sistem ]
              </div>
              <p className="font-bold text-slate-900">Drs. H. Rahmat Hidayat, M.Ag.</p>
              <p className="text-[10px] text-slate-500">Ketua Yayasan</p>
            </div>
          </div>

          <div className="text-center pt-4 text-[10px] text-slate-400 border-t border-slate-100">
            Dokumen ini diterbitkan secara otomatis oleh Sistem Informasi YatimCare dan sah sebagai bukti resmi.
          </div>

        </div>

        {/* Bottom Actions for Modal (Hidden in Print) */}
        <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end gap-2 print:hidden">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Tutup Dokumen
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Simpan PDF</span>
          </button>
        </div>

      </div>
    </div>
  );
};
