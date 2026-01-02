import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import BorrowPage from './pages/BorrowPage';
import LendPage from './pages/LendPage';
import WalletPage from './pages/WalletPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import LoanDetailsPage from './pages/LoanDetailsPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import AboutPage from './pages/AboutPage';
import TechPage from './pages/TechPage';
import HelpCenterPage from './pages/HelpCenterPage';
import DevelopersPage from './pages/DevelopersPage';
import SecurityAuditPage from './pages/SecurityAuditPage';
import ContactPage from './pages/ContactPage';
import StakingPage from './pages/StakingPage';
import RatesPage from './pages/RatesPage';
import BlogPage from './pages/BlogPage';
import CareersPage from './pages/CareersPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import CookiePolicyPage from './pages/CookiePolicyPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WalletSelectionModal from './components/WalletSelectionModal';

const Toast = () => {
  const { toast, hideToast } = useAuth();
  if (!toast.visible) return null;

  const styles = {
    success: 'bg-green-500/10 border-green-500/20 text-green-400',
    error: 'bg-red-500/10 border-red-500/20 text-red-400',
    info: 'bg-blue-500/10 border-blue-500/20 text-blue-400'
  };

  const icons = {
    success: 'check_circle',
    error: 'error',
    info: 'info'
  };

  return (
    <div className="fixed bottom-8 right-8 z-[11000] w-full max-sm:max-w-[calc(100%-2rem)] max-w-sm px-4 animate-in slide-in-from-right-10 fade-in duration-500">
      <div className={`${styles[toast.type]} border border-white/10 backdrop-blur-2xl p-5 rounded-2xl flex items-start gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden`}>
        <div className="absolute top-0 left-0 w-1 h-full bg-current opacity-50"></div>
        <span className="material-symbols-outlined mt-0.5 shrink-0">{icons[toast.type]}</span>
        <div className="flex-1">
           <p className="text-sm font-bold leading-tight mb-1">{toast.type === 'error' ? 'Action Required' : 'Notification'}</p>
           <p className="text-xs font-medium opacity-80 leading-relaxed">{toast.message}</p>
        </div>
        <button onClick={hideToast} className="text-white/20 hover:text-white transition-colors shrink-0">
          <span className="material-symbols-outlined text-sm">close</span>
        </button>
      </div>
    </div>
  );
};

const ProtectedRoute = ({ children }: React.PropsWithChildren<{}>) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="size-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { user, openWalletModal, signer } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-background-dark text-white selection:bg-pink-500 selection:text-white">
      <ScrollToTop />
      <Toast />
      <WalletSelectionModal />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        
        <Route
          path="*"
          element={
            <>
              <Navbar isConnected={!!signer} onConnect={openWalletModal} />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/tech" element={<TechPage />} />
                  <Route path="/help" element={<HelpCenterPage />} />
                  <Route path="/devs" element={<DevelopersPage />} />
                  <Route path="/security" element={<SecurityAuditPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/staking" element={<StakingPage />} />
                  <Route path="/rates" element={<RatesPage />} />
                  <Route path="/blog" element={<BlogPage />} />
                  <Route path="/careers" element={<CareersPage />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route path="/cookies" element={<CookiePolicyPage />} />
                  
                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/borrow" element={<ProtectedRoute><BorrowPage /></ProtectedRoute>} />
                  <Route path="/lend" element={<ProtectedRoute><LendPage /></ProtectedRoute>} />
                  <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
                  <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                  <Route path="/loan/:id" element={<ProtectedRoute><LoanDetailsPage /></ProtectedRoute>} />
                  <Route path="/profile/:userId" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                </Routes>
              </main>
              <Footer />
            </>
          }
        />
      </Routes>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

export default App;
