import React, { useEffect, useRef, useState } from 'react';
import { BankAccount, Program, PaymentMethod } from '../../types';
import { db } from '../../services/dbStore';
import { Heart, X, CheckCircle2, Copy, Building2, QrCode, Sparkles, Upload, Image, FileText, Trash2 } from 'lucide-react';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  programs: Program[];
  selectedProgramId?: string;
  onSuccess: () => void;
}

type DonationFlowStep = 'form' | 'detail' | 'proof' | 'submitted';

export const DonationModal: React.FC<DonationModalProps> = ({
  isOpen,
  onClose,
  programs,
  selectedProgramId,
  onSuccess
}) => {
  const currentUser = db.getCurrentUser();
  const bankAccounts = db.getDonationBankAccounts();
  const paymentAccounts = bankAccounts;

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
  const [selectedBank, setSelectedBank] = useState<string>(paymentAccounts[0]?.accountNumber || '');
  const [paymentReference, setPaymentReference] = useState<string>('');
  const [paymentProofUrl, setPaymentProofUrl] = useState<string>('');
  const [paymentProofName, setPaymentProofName] = useState<string>('');

  const [submittedTx, setSubmittedTx] = useState<any>(null);
  const [submittedBankInfo, setSubmittedBankInfo] = useState<BankAccount | null>(null);
  const [pendingDonation, setPendingDonation] = useState<any>(null);
  const [flowStep, setFlowStep] = useState<DonationFlowStep>('form');
  const [copiedAccount, setCopiedAccount] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const paymentProofInputRef = useRef<HTMLInputElement | null>(null);
  const refreshAfterSubmitTimerRef = useRef<number | null>(null);
  const paymentAccountSignature = paymentAccounts.map(account => account.accountNumber).join('|');
  const programSignature = programs.map(program => program.id).join('|');

  useEffect(() => {
    if (!paymentAccounts.length) {
      return;
    }

    const selectedStillAvailable = paymentAccounts.some(account => account.accountNumber === selectedBank);
    if (!selectedStillAvailable) {
      setSelectedBank(paymentAccounts[0].accountNumber);
    }
  }, [paymentAccountSignature, selectedBank]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setProgramId(selectedProgramId || programs[0]?.id || 'prg-1');
    setDonationType('santunan');
    setPresetAmount(100000);
    setCustomAmount('');
    setIsAnonymous(false);
    setIsRecurring(false);
    setDonorName(currentUser?.name || '');
    setDonorEmail(currentUser?.email || '');
    setDonorPhone(currentUser?.phone || '');
    setDonorMessage('');
    setPaymentMethod('transfer_bank');
    setSelectedBank(paymentAccounts[0]?.accountNumber || '');
    setPaymentReference('');
    setPaymentProofUrl('');
    setPaymentProofName('');
    setSubmittedTx(null);
    setSubmittedBankInfo(null);
    setPendingDonation(null);
    setFlowStep('form');
    setCopiedAccount(false);
    setIsSubmitting(false);
    if (refreshAfterSubmitTimerRef.current) {
      window.clearTimeout(refreshAfterSubmitTimerRef.current);
      refreshAfterSubmitTimerRef.current = null;
    }
  }, [
    currentUser?.email,
    currentUser?.name,
    currentUser?.phone,
    isOpen,
    paymentAccountSignature,
    programSignature,
    selectedProgramId
  ]);

  if (!isOpen) return null;

  const activeAmount = customAmount ? parseInt(customAmount, 10) || 0 : presetAmount;
  const currentProgram = programs.find(p => p.id === programId) || programs[0];
  const selectedBankInfo = paymentAccounts.find(account => account.accountNumber === selectedBank) || paymentAccounts[0] || null;

  const handleCloseModal = () => {
    if (refreshAfterSubmitTimerRef.current) {
      window.clearTimeout(refreshAfterSubmitTimerRef.current);
      refreshAfterSubmitTimerRef.current = null;
    }
    setFlowStep('form');
    setPendingDonation(null);
    setSubmittedTx(null);
    setSubmittedBankInfo(null);
    setPaymentReference('');
    setPaymentProofUrl('');
    setPaymentProofName('');
    onClose();
  };

  const handleOpenPaymentDetail = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeAmount < 10000) {
      alert('Minimal donasi adalah Rp 10.000');
      return;
    }

    if (!currentProgram) {
      alert('Program donasi belum tersedia.');
      return;
    }

    if (!selectedBankInfo) {
      alert('Rekening donasi belum diatur oleh admin.');
      return;
    }

    setPendingDonation({
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
      donorMessage,
      bankInfo: selectedBankInfo
    });
    setFlowStep('detail');
  };

  const handleConfirmPayment = () => {
    if (!pendingDonation) {
      alert('Data donasi belum siap.');
      return;
    }

    setFlowStep('proof');
  };

  const handleFinalizeDonation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pendingDonation) {
      alert('Data donasi belum siap.');
      return;
    }

    if (!paymentProofUrl) {
      alert('Silakan unggah bukti transfer terlebih dahulu.');
      return;
    }

    try {
      setIsSubmitting(true);
      const newDonation = await db.submitDonation({
        donorName: pendingDonation.donorName,
        donorEmail: pendingDonation.donorEmail,
        donorPhone: pendingDonation.donorPhone,
        programId: pendingDonation.programId,
        programTitle: pendingDonation.programTitle,
        donationType: pendingDonation.donationType,
        amount: pendingDonation.amount,
        paymentMethod: pendingDonation.paymentMethod,
        destinationAccount: pendingDonation.destinationAccount,
        paymentReference: paymentReference || undefined,
        paymentProofUrl: paymentProofUrl || undefined,
        isAnonymous: pendingDonation.isAnonymous,
        donorMessage: pendingDonation.donorMessage
      });

      setSubmittedTx(newDonation);
      setSubmittedBankInfo(pendingDonation.bankInfo);
      setFlowStep('submitted');
      if (refreshAfterSubmitTimerRef.current) {
        window.clearTimeout(refreshAfterSubmitTimerRef.current);
      }
      refreshAfterSubmitTimerRef.current = window.setTimeout(() => {
        onSuccess();
        refreshAfterSubmitTimerRef.current = null;
      }, 5000);
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

  const handlePaymentProofUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Bukti transfer harus berupa file gambar.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPaymentProofUrl(reader.result);
        setPaymentProofName(file.name);
      }
    };
    reader.onerror = () => {
      alert('Gagal membaca file bukti transfer.');
    };
    reader.readAsDataURL(file);
  };

  const clearPaymentProof = () => {
    setPaymentProofUrl('');
    setPaymentProofName('');
    if (paymentProofInputRef.current) {
      paymentProofInputRef.current.value = '';
    }
  };

  if (flowStep === 'detail' && pendingDonation) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
        <div className="bg-white text-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-8 animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                <Heart className="w-5 h-5 fill-white text-white" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-slate-900">Detail Donasi</h3>
                <p className="text-xs text-slate-500">Periksa ringkasan donasi sebelum melanjutkan pembayaran</p>
              </div>
            </div>
            <button
              onClick={handleCloseModal}
              className="p-2 hover:bg-slate-100 rounded-2xl text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              title="Tutup Modal"
              aria-label="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="pt-6 space-y-5">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-3xl flex items-center justify-center border border-emerald-200">
              <FileText className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h4 className="font-serif font-bold text-2xl text-slate-900">Anda akan melakukan donasi</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Untuk program <strong>{pendingDonation.programTitle}</strong> dengan nominal{' '}
                <strong>Rp {pendingDonation.amount.toLocaleString('id-ID')}</strong>.
                Silahkan lakukan transfer ke nomor rekening yang Anda pilih.
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 text-left">
              <div>
                <span className="text-xs text-slate-500 font-medium">Program Donasi</span>
                <p className="font-bold text-slate-900 mt-1">{pendingDonation.programTitle}</p>
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium">Nominal Donasi</span>
                <p className="font-black text-emerald-700 text-2xl mt-1">Rp {pendingDonation.amount.toLocaleString('id-ID')}</p>
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium">Rekening Tujuan</span>
                <div className="mt-2 flex items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-slate-200">
                  <div>
                    <p className="font-bold text-sm text-slate-900">{pendingDonation.bankInfo.bankName}</p>
                    <p className="font-mono text-base font-bold text-emerald-700">{pendingDonation.bankInfo.accountNumber}</p>
                    <p className="text-xs text-slate-500">a.n {pendingDonation.bankInfo.accountHolder}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(pendingDonation.bankInfo.accountNumber)}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setFlowStep('form');
                  setPendingDonation(null);
                }}
                className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-sm transition-all cursor-pointer"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={handleConfirmPayment}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm transition-all shadow-sm cursor-pointer"
              >
                Konfirmasi Bayar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (flowStep === 'proof' && pendingDonation) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
        <div className="bg-white text-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-8 animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                <Heart className="w-5 h-5 fill-white text-white" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-slate-900">Konfirmasi Bayar</h3>
                <p className="text-xs text-slate-500">Unggah bukti transfer setelah pembayaran dilakukan</p>
              </div>
            </div>
            <button
              onClick={handleCloseModal}
              className="p-2 hover:bg-slate-100 rounded-2xl text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              title="Tutup Modal"
              aria-label="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleFinalizeDonation} className="pt-6 space-y-5">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-left">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-700">Ringkasan Donasi</span>
              </div>
              <p className="text-sm text-slate-700">
                <strong>{pendingDonation.programTitle}</strong>
                <br />
                Nominal: <strong>Rp {pendingDonation.amount.toLocaleString('id-ID')}</strong>
                <br />
                Tujuan: <strong>{pendingDonation.bankInfo.bankName} {pendingDonation.bankInfo.accountNumber}</strong>
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Nomor Referensi Transfer (opsional)</label>
                <input
                  type="text"
                  placeholder="Masukkan referensi transfer jika ada"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Upload Bukti Transfer</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => paymentProofInputRef.current?.click()}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Pilih File</span>
                  </button>
                  <input
                    ref={paymentProofInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePaymentProofUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={clearPaymentProof}
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                    title="Hapus bukti transfer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {(paymentProofUrl || paymentProofName) && (
                <div className="p-3 bg-white rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-slate-700">
                    <Image className="w-4 h-4 text-emerald-600" />
                    <span>Pratinjau Bukti Transfer</span>
                  </div>
                  {paymentProofName && <p className="text-[11px] text-slate-500">{paymentProofName}</p>}
                  {paymentProofUrl && (
                    <img
                      src={paymentProofUrl}
                      alt="Pratinjau bukti transfer"
                      className="w-full max-h-48 object-contain rounded-xl border border-slate-100 bg-slate-50"
                    />
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setFlowStep('detail');
                  clearPaymentProof();
                }}
                className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-sm transition-all cursor-pointer"
              >
                Kembali
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-2xl font-bold text-sm shadow-sm transition-all cursor-pointer"
              >
                {isSubmitting ? 'Mengirim...' : 'Kirim Bukti Transfer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (flowStep === 'submitted' && submittedTx) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
        <div className="bg-white text-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-8 animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-slate-900">Donasi Terkirim</h3>
                <p className="text-xs text-slate-500">Bukti transfer telah diterima dan sedang divalidasi</p>
              </div>
            </div>
            <button
              onClick={handleCloseModal}
              className="p-2 hover:bg-slate-100 rounded-2xl text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              title="Tutup Modal"
              aria-label="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="pt-6 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-3xl flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>

            <div>
              <h4 className="font-serif font-bold text-2xl text-slate-900">Status donasi sedang kami validasi</h4>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                Tim admin akan memeriksa bukti transfer sebelum donasi dicatat ke buku kas.
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Kode Transaksi: <strong className="font-mono text-emerald-700">{submittedTx.transactionNumber}</strong>
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 text-left space-y-4">
              <div>
                <span className="text-xs text-slate-500 font-medium">Program Donasi</span>
                <p className="font-bold text-slate-900 mt-1">{submittedTx.programTitle}</p>
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium">Nominal</span>
                <p className="text-3xl font-black text-emerald-700 font-sans mt-0.5">
                  Rp {submittedTx.amount.toLocaleString('id-ID')}
                </p>
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium">Rekening Tujuan</span>
                <p className="font-bold text-slate-900 mt-1">
                  {submittedBankInfo?.bankName || pendingDonation?.bankInfo.bankName} {' '}
                  {submittedBankInfo?.accountNumber || pendingDonation?.bankInfo.accountNumber}
                </p>
                <p className="text-xs text-slate-500">
                  a.n {submittedBankInfo?.accountHolder || pendingDonation?.bankInfo.accountHolder}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCloseModal}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm transition-all shadow-sm cursor-pointer active:scale-98"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    );
  }

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
            onClick={handleCloseModal}
            className="p-2 hover:bg-slate-100 rounded-2xl text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            title="Tutup Modal"
            aria-label="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Step */}
        <form onSubmit={handleOpenPaymentDetail} className="pt-5 space-y-5">
            
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
                disabled={paymentAccounts.length === 0}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                {paymentAccounts.map((account) => (
                  <option key={account.accountNumber} value={account.accountNumber}>
                    {account.bankName} - {account.accountNumber} a.n {account.accountHolder}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">
                Rekening ini berasal dari data rekening yayasan dan menjadi tujuan transfer donasi.
              </p>
            </div>

            {/* Submit Action & Cancel */}
            <div className="pt-3 flex gap-2">
              <button
                type="button"
                onClick={handleCloseModal}
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
                <span>{isSubmitting ? 'Memproses...' : `Lanjut Bayar Rp ${activeAmount.toLocaleString('id-ID')}`}</span>
              </button>
            </div>

            <p className="text-[10px] text-center text-slate-400">
              Donasi disalurkan 100% secara transparan dan dicatat dalam pembukuan yayasan.
            </p>
          </form>

      </div>
    </div>
  );
};
