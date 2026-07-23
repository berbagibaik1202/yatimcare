import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { PublicLanding } from './components/public/PublicLanding';
import { TransparencyPortal } from './components/public/TransparencyPortal';
import { OrphanMap } from './components/common/OrphanMap';
import { GuardianPortal } from './components/guardian/GuardianPortal';
import { DonorDashboard } from './components/donor/DonorDashboard';
import { DonorRegistrationForm } from './components/donor/DonorRegistrationForm';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { DonationModal } from './components/donations/DonationModal';
import { LoginModal } from './components/auth/LoginModal';
import { db } from './services/dbStore';
import { ImageWithFallback } from './components/common/ImageWithFallback';
import { Heart, Sparkles, MapPin, HandHeart } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [isDonationModalOpen, setIsDonationModalOpen] = useState<boolean>(false);
  const [selectedProgramForDonation, setSelectedProgramForDonation] = useState<string | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [isDataReady, setIsDataReady] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isAuthSubmitting, setIsAuthSubmitting] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    db.load()
      .then(() => {
        if (mounted) {
          setIsDataReady(true);
        }
      })
      .catch((error: unknown) => {
        if (mounted) {
          setLoadError(error instanceof Error ? error.message : 'Gagal memuat data backend');
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleRefreshData = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleOpenDonationModal = (programId?: string) => {
    setSelectedProgramForDonation(programId);
    setIsDonationModalOpen(true);
  };

  const handleOpenLogin = () => {
    setAuthError(null);
    setIsLoginModalOpen(true);
  };

  const handleLogin = async (email: string, password: string) => {
    setIsAuthSubmitting(true);
    setAuthError(null);

    try {
      const user = await db.login(email, password);
      handleRefreshData();
      setIsLoginModalOpen(false);

      if (user.role === 'donatur') {
        setActiveTab('donor-dash');
      } else if (user.role === 'wali') {
        setActiveTab('guardian-dash');
      } else if (user.role === 'super_admin' || user.role === 'admin' || user.role === 'bendahara' || user.role === 'petugas') {
        setActiveTab('admin-dash');
      } else {
        setActiveTab('landing');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login gagal';
      setAuthError(message);
      throw error;
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await db.logout();
    setActiveTab('landing');
    setAuthError(null);
    setIsLoginModalOpen(false);
    handleRefreshData();
  };

  const childrenData = db.getChildren();
  const programs = db.getPrograms();

  if (!isDataReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white px-6">
        <div className="max-w-md w-full space-y-4 text-center">
          <div className="h-3 w-3 rounded-full bg-emerald-400 mx-auto animate-pulse" />
          <h1 className="text-2xl font-bold">Memuat data YatimCare</h1>
          <p className="text-sm text-slate-300">
            Menyambungkan frontend ke database melalui backend API.
          </p>
          {loadError && (
            <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-left text-sm text-rose-100">
              {loadError}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div key={refreshKey} className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-emerald-600 selection:text-white">
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenDonationModal={() => handleOpenDonationModal()}
        onRefreshData={handleRefreshData}
        onOpenLogin={handleOpenLogin}
        onLogout={handleLogout}
      />

      {/* Main Page View Area */}
      <main className="flex-grow">
        {activeTab === 'landing' && (
          <PublicLanding
            onOpenDonationModal={handleOpenDonationModal}
            onNavigate={setActiveTab}
            onRefreshData={handleRefreshData}
          />
        )}

        {activeTab === 'peta' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <OrphanMap
              childrenData={childrenData}
              showSensitiveData={db.getCurrentUser()?.role !== 'public'}
            />
          </div>
        )}

        {activeTab === 'program' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-[32px] p-8 sm:p-10 shadow-xl space-y-4 relative overflow-hidden">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 text-xs font-semibold">
                <HandHeart className="w-4 h-4 text-emerald-300" />
                <span>Program Penggalangan Dana YatimCare</span>
              </div>
              <h1 className="font-serif font-bold text-3xl sm:text-4xl text-white tracking-tight">
                Salurkan Bantuan Terbaik untuk Program Khusus
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl leading-relaxed">
                Pilih program santunan bulanan, beasiswa pendidikan, paket sembako, atau program bantuan kesehatan untuk adik-adik binaan.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {programs.map(prog => {
                const pct = Math.min(100, Math.round((prog.collectedAmount / prog.targetAmount) * 100));
                return (
                  <div key={prog.id} className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
                    <div>
                      <div className="relative h-48 overflow-hidden">
                        <ImageWithFallback src={prog.thumbnail} alt={prog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-emerald-300 border border-white/10 text-[10px] font-bold uppercase tracking-wider">
                          {prog.category}
                        </span>
                      </div>
                      <div className="p-6 space-y-3">
                        <h3 className="font-bold text-lg text-slate-900 group-hover:text-emerald-700 transition-colors">{prog.title}</h3>
                        <p className="text-xs text-slate-600 leading-relaxed">{prog.description}</p>
                        
                        <div className="space-y-1.5 pt-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Terkumpul:</span>
                            <span className="font-bold text-emerald-700">Rp {prog.collectedAmount.toLocaleString('id-ID')}</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <div className="flex justify-between text-[11px] text-slate-500">
                            <span>Target: Rp {prog.targetAmount.toLocaleString('id-ID')}</span>
                            <span className="font-bold text-slate-700">{pct}%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 pt-0">
                      <button
                        onClick={() => handleOpenDonationModal(prog.id)}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-sm transition-all cursor-pointer active:scale-98"
                      >
                        Donasi Sekarang
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'transparansi' && (
          <TransparencyPortal onOpenDonationModal={() => handleOpenDonationModal()} />
        )}

        {activeTab === 'pendaftaran-donatur' && (
          <div className="py-6">
            <DonorRegistrationForm
              onSuccess={() => handleRefreshData()}
              onNavigate={setActiveTab}
              onOpenDonationModal={() => handleOpenDonationModal()}
            />
          </div>
        )}

        {activeTab === 'guardian-dash' && (
          <GuardianPortal onRefreshData={handleRefreshData} />
        )}

        {activeTab === 'donor-dash' && (
          <DonorDashboard
            onOpenDonationModal={() => handleOpenDonationModal()}
            onRefreshData={handleRefreshData}
          />
        )}

        {activeTab === 'admin-dash' && (
          <AdminDashboard onRefreshData={handleRefreshData} />
        )}
      </main>

      {/* Global Footer */}
      <Footer
        onNavigate={setActiveTab}
        onOpenDonationModal={() => handleOpenDonationModal()}
      />

      {/* Global Donation Modal */}
      <DonationModal
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
        programs={programs}
        selectedProgramId={selectedProgramForDonation}
        onSuccess={handleRefreshData}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        loading={isAuthSubmitting}
        error={authError}
        onClose={() => {
          setIsLoginModalOpen(false);
          setAuthError(null);
        }}
        onSubmit={handleLogin}
      />

    </div>
  );
}
