
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  isConnected: boolean;
  onConnect: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isConnected, onConnect }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Borrow', path: '/borrow' },
    { name: 'Lend', path: '/lend' },
    { name: 'Wallet', path: '/wallet' },
    { name: 'History', path: '/history' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleConnectClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    onConnect();
  };

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 whitespace-nowrap border-b border-white/5 bg-[#0f0518]/90 backdrop-blur-md px-4 py-3 lg:px-8"
    >
      <div className="max-w-[1600px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-3 text-white">
            <div className="size-9 flex items-center justify-center bg-gradient-primary rounded-lg shadow-lg shadow-purple-500/20">
              <span className="material-symbols-outlined text-white text-xl">diamond</span>
            </div>
            <h2 className="text-white text-lg font-bold tracking-tight">QieLend</h2>
          </Link>
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors py-2 ${
                  isActive(link.path)
                    ? 'text-pink-500 border-b-2 border-pink-500'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-white/20'}`}></div>
            <span className="text-xs font-medium text-white/80">QIE Testnet</span>
          </button>

          <div className="flex items-center gap-3 pl-4 border-l border-white/10">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] text-white/50 font-medium uppercase tracking-wider">
                    {isConnected ? 'Wallet Active' : 'Account Connected'}
                  </p>
                  <p className="text-sm font-bold text-pink-300">
                    {isConnected 
                      ? `${user?.walletAddress?.slice(0, 6)}...${user?.walletAddress?.slice(-4)}` 
                      : user?.firstName}
                  </p>
                </div>
                
                {!isConnected && (
                  <button 
                    onClick={handleConnectClick}
                    className="px-4 h-9 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all text-xs font-bold flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">account_balance_wallet</span>
                    Connect Wallet
                  </button>
                )}

                <div className="relative group">
                  <button className="size-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 p-0.5 cursor-pointer hover:scale-105 transition-transform">
                    <img
                      alt="User"
                      className="rounded-full bg-[#1e0b2e] w-full h-full object-cover"
                      src={user?.avatar}
                    />
                  </button>
                  <div className="absolute top-full right-0 mt-2 w-48 bg-[#1e0b2e] border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-2 flex flex-col gap-1">
                    <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                      <span className="material-symbols-outlined text-sm">dashboard</span> Dashboard
                    </Link>
                    <Link to="/settings" className="flex items-center gap-3 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                      <span className="material-symbols-outlined text-sm">settings</span> Settings
                    </Link>
                    <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors w-full text-left border-t border-white/5 pt-2 mt-1">
                      <span className="material-symbols-outlined text-sm">logout</span> Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                <Link 
                  to="/login"
                  className="px-6 h-10 rounded-full bg-transparent border border-white/20 text-white flex items-center hover:bg-white/10 transition-colors text-sm font-bold"
                >
                  Login
                </Link>
                <button 
                  onClick={handleConnectClick}
                  className="px-6 h-10 rounded-full bg-gradient-primary text-white hover:shadow-lg hover:shadow-pink-500/30 transition-all text-sm font-bold"
                >
                  Connect Wallet
                </button>
              </div>
            )}
          </div>

          <button 
            className="md:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className="material-symbols-outlined">{isMobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-background-dark border-b border-white/5 py-4 px-6 flex flex-col gap-4 z-40 animate-in slide-in-from-top">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`text-base font-medium ${
                isActive(link.path) ? 'text-pink-500' : 'text-white/70'
              }`}
            >
              {link.name}
            </Link>
          ))}
          {isAuthenticated ? (
             <button onClick={handleLogout} className="text-red-400 font-bold text-left">Logout</button>
          ) : (
            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-white/70">Login</Link>
          )}
        </div>
      )}
    </motion.header>
  );
};

export default Navbar;
