import React, { useEffect, useState } from 'react';
import { BankAccount, Program, PaymentMethod } from '../../types';
import { db } from '../../services/dbStore';
import { Heart, X, CheckCircle2, Copy, Building2, QrCode, Sparkles } from 'lucide-react';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  programs: Program[];
  selectedProgramId?: string;
  onSuccess: () => void;
}

export const DonationModal: React.FC<DonationModalProps> = ({
  isOpen,
  onClose,
  programs,
  selectedProgramId,
  onSuccess
}) => {
  const currentUser = db.getCurrentUser();
  const bankAccounts = db.getDonationBankAccounts();
  const fallbackBank: BankAccount = {
    id: 'fallback-donation-bank',
    bankName: 'BSI',
    accountNumber: '7123456789',
    accountHolder: 'Yayasan YatimCare',
    accountType: 'Tabungan',
    isActive: true,
    isPublic: true,
  };
  const paymentAccounts = bankAccounts.length > 0 ? bankAccounts : [fallbackBank];

  const [programId, setProgramId] = useState<string>(selectedProgramId || programs[0]?.id || 'prg-1');
  const [donationType, setDonationType] = useState<'santunan' | 'pendidikan' | 'sembako' | 'zakat' | 'infak' | 'sedekah'>('santunan');
  const [presetAmount, setPresetAmount] = useState<number>(100000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  
  const [donorName, setDonorName] = useState<string>(currentUser?.name || '');
  const [donorEmail, setDonorEmail] = useState<string>(currentUser?.email || '');
  const [donorPhone, setDonorPhone] = useState<string>(currentUser?.phone || '');
  const [donorMessage, setDonorMessage] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('transfer_bank');
  const [selectedBank, setSelectedBank] = useState<string>(paymentAccounts[0]?.accountNumber || fallbackBank.accountNumber);

  const [submittedTx, setSubmittedTx] = useState<any>(null);
  const [submittedBankInfo, setSubmittedBankInfo] = useState<typeof fallbackBank | null>(null);
  const [copiedAccount, setCopiedAccount] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const paymentAccountSignature = paymentAccounts.map(account => account.accountNumber).join('|');

  useEffect(() => {
    if (!paymentAccounts.length) {
      return;
    }

    const selectedStillAvailable = paymentAccounts.some(account => account.accountNumber === selectedBank);
    if (!selectedStillAvailable) {
      setSelectedBank(paymentAccounts[0].accountNumber);
    }
  }, [paymentAccountSignature, selectedBank]);

  if (!isOpen) return null;

  const activeAmount = customAmount ? parseInt(customAmount, 10) || 0 : presetAmount;
  const currentProgram = programs.find(p => p.id === programId) || programs[0];
  const selectedBankInfo = paymentAccounts.find(account => account.accountNumber === selectedBank) || paymentAccounts[0] || fallbackBank;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeAmount < 10000) {
      alert('Minimal donasi adalah Rp 10.000');
      return;
    }

    if (!currentProgram) {
      alert('Program donasi belum tersedia.');
      return;
    }

    try {
      setIsSubmitting(true);
      const newDonation = await db.submitDonation({
        donorName: isAnonymous ? 'Hamba Allah' : (donorName || 'Donatur YatimCare'),
        donorEmail: donorEmail || 'donatur@gmail.com',
        donorPhone: donorPhone || '081234567890',
        programId: currentProgram.id,
        programTitle: currentProgram.title,
        donationType: donationType as any,
        amount: activeAmount,
        paymentMethod,
        destinationAccount: `${selectedBankInfo.bankName} ${selectedBankInfo.accountNumber} a.n ${selectedBankInfo.accountHolder}`,
        isAnonymous,
        donorMessage
      });

      setSubmittedTx(newDonation);
      setSubmittedBankInfo(selectedBankInfo);
      onSuccess();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Gagal mengirim donasi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-8 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <Heart className="w-5 h-5 fill-white text-white" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-slate-900">Formulir Donasi YatimCare</h3>
              <p className="text-xs text-slate-500">Salurkan infak & santunan untuk kebahagiaan adik-adik yatim</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-2xl text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            title="Tutup Modal"
            aria-label="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Confirmation Screen after Submission */}
        {submittedTx ? (
          <div className="pt-6 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-3xl flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>

            <div>
              <h4 className="font-serif font-bold text-2xl text-slate-900">Instruksi Pembayaran Donasi</h4>
              <p className="text-xs text-slate-500 mt-1">
                Kode Transaksi: <strong className="font-mono text-emerald-700">{submittedTx.transactionNumber}</strong>
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80 text-left space-y-4">
              <div>
                <span className="text-xs text-slate-500 font-medium">Total Nominal Pembayaran</span>
                <p className="text-3xl font-black text-emerald-700 font-sans mt-0.5">
                  Rp {submittedTx.amount.toLocaleString('id-ID')}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200">
                <span className="text-xs text-slate-500 font-medium">Rekening Tujuan Yayasan</span>
                <div className="mt-2 flex items-center justify-between p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs">
                  <div>
                    <p className="font-bold text-sm text-slate-900">
                      {submittedBankInfo?.bankName || selectedBankInfo.bankName}
                    </p>
                    <p className="font-mono text-base font-bold text-emerald-700">
                      {submittedBankInfo?.accountNumber || selectedBankInfo.accountNumber}
                    </p>
                    <p className="text-xs text-slate-500">
                      a.n {submittedBankInfo?.accountHolder || selectedBankInfo.accountHolder}
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(submittedBankInfo?.accountNumber || selectedBankInfo.accountNumber)}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedAccount ? 'Tersalin!' : 'Salin'}</span>
                  </button>
                </div>
              </div>

              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 font-medium">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Pembayaran akan diverifikasi otomatis oleh Bendahara dalam 1x24 jam.</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm transition-all shadow-sm cursor-pointer active:scale-98"
              >
                Tutup & Lihat Riwayat
              </button>
            </div>
          </div>
        ) : (
          /* Form Step */
          <form onSubmit={handleSubmit} className="pt-5 space-y-5">
            
            {/* Choose Program */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Program Penggalangan Dana</label>
              <select
                value={programId}
                onChange={(e) => setProgramId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                {programs.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.title} (Terkumpul Rp {(p.collectedAmount/1000000).toFixed(1)}Jt)
                  </option>
                ))}
              </select>
            </div>

            {/* Donation Type & Nominal */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Pilih Nominal Donasi</label>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {[50000, 100000, 250000, 500000, 1000000, 2500000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setPresetAmount(amt);
                      setCustomAmount('');
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      activeAmount === amt && !customAmount
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Rp {(amt/1000).toLocaleString('id-ID')}rb
                  </button>
                ))}
              </div>

              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">Rp</span>
                <input
                  type="number"
                  placeholder="Nominal Donasi Lainnya (Min. 10.000)"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Category selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Niat & Jenis Akad Donasi</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'santunan', label: 'Santunan Yatim' },
                  { id: 'pendidikan', label: 'Beasiswa' },
                  { id: 'zakat', label: 'Zakat Maal' },
                  { id: 'infak', label: 'Infak Umum' },
                  { id: 'sedekah', label: 'Sedekah Subuh' },
                  { id: 'sembako', label: 'Paket Sembako' }
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setDonationType(item.id as any)}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                      donationType === item.id
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Donor Information */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Informasi Donatur</span>
                <label className="flex items-center gap-1.5 text-xs text-slate-500 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded-md text-emerald-600 focus:ring-emerald-500 bg-slate-50 border-slate-300"
                  />
                  <span>Sembunyikan nama (Hamba Allah)</span>
                </label>
              </div>

              {!isAnonymous && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Nama Lengkap Anda"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Alamat Email"
                    value={donorEmail}
                    onChange={(e) => setDonorEmail(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              )}

              <textarea
                rows={2}
                placeholder="Pesan, harapan, atau doa untuk anak-anak yatim..."
                value={donorMessage}
                onChange={(e) => setDonorMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            {/* Payment Method Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Metode Pembayaran</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('transfer_bank')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all ${
                    paymentMethod === 'transfer_bank'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  <span>Transfer Bank Syariah (BSI/Mandiri)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('qris')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all ${
                    paymentMethod === 'qris'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-emerald-600" />
                  <span>QRIS & E-Wallet (Gopay/OVO)</span>
                </button>
              </div>
            </div>

            {/* Target Bank Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Pilih Nomor Rekening Tujuan</label>
              <select
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                {paymentAccounts.map((account) => (
                  <option key={account.accountNumber} value={account.accountNumber}>
                    {account.bankName} - {account.accountNumber} a.n {account.accountHolder}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">
                Rekening ini diambil dari pengaturan admin dan menjadi tujuan transfer donasi.
              </p>
            </div>

            {/* Submit Action & Cancel */}
            <div className="pt-3 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="py-3.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-xs transition-all cursor-pointer"
              >
                Batal / Tutup
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-2xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
              >
                <Heart className="w-4 h-4 fill-white text-white" />
                <span>{isSubmitting ? 'Memproses...' : `Lanjutkan Pembayaran Rp ${activeAmount.toLocaleString('id-ID')}`}</span>
              </button>
            </div>

            <p className="text-[10px] text-center text-slate-400">
              Donasi disalurkan 100% secara transparan dan dicatat dalam pembukuan yayasan.
            </p>

          </form>
        )}

      </div>
    </div>
  );
};
