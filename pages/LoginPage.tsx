
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, googleLogin, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      // Errors handled by context toast
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await googleLogin();
      navigate('/dashboard');
    } catch (err: any) {
      // Errors handled by context toast
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0518] flex flex-col relative overflow-hidden font-display">
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <header className="p-6 md:px-12 flex justify-between items-center z-10">
        <Link to="/" className="flex items-center gap-3">
          <div className="size-8 flex items-center justify-center bg-gradient-primary rounded-lg shadow-md">
            <span className="material-symbols-outlined text-white text-xl">diamond</span>
          </div>
          <h2 className="text-white text-xl font-bold tracking-tight">QieLend</h2>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-white/40 text-sm hidden sm:inline">New to QieLend?</span>
          <Link to="/signup" className="px-6 py-2 rounded-lg border border-pink-500/30 text-pink-500 hover:bg-pink-500 hover:text-white transition-all text-sm font-bold">
            Get Started
          </Link>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-4 z-10">
        <div className="w-full max-w-[440px] bg-[#1e0b2e]/40 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-8 md:p-10 shadow-2xl relative">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-white mb-2">Login</h1>
            <p className="text-white/40 text-sm">Secure access to your P2P dashboard</p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/60 uppercase tracking-widest px-1">Email</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-white/30 text-xl group-focus-within:text-pink-400 transition-colors">mail</span>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com" 
                  className="w-full bg-[#0f0518]/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-pink-500/50 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold text-white/60 uppercase tracking-widest">Password</label>
                <Link to="/forgot-password" tabIndex={-1} className="text-pink-500 text-[10px] font-bold uppercase hover:underline">Forgot?</Link>
              </div>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-white/30 text-xl group-focus-within:text-pink-400 transition-colors">lock</span>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full bg-[#0f0518]/50 border border-white/10 rounded-xl py-4 pl-12 pr-12 text-white placeholder-white/20 focus:outline-none focus:border-pink-500/50 transition-all"
                />
              </div>
            </div>

            <button 
              disabled={isLoading}
              className={`w-full h-14 rounded-xl bg-gradient-primary text-white font-bold text-lg shadow-lg hover:shadow-pink-500/40 hover:-translate-y-0.5 transition-all flex items-center justify-center ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? <div className="size-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Sign In'}
            </button>
          </form>

          <div className="relative my-8 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <span className="relative bg-[#1e0b2e]/0 px-4 text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Social Access</span>
          </div>

          <button onClick={handleGoogleLogin} className="w-full flex items-center justify-center gap-3 h-12 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all mb-4">
            <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="w-5 h-5" alt="Google" />
            <span className="text-sm font-bold">Continue with Google</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
