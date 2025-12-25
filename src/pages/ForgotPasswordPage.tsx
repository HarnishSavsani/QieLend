
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword(email);
      // Success toast handled by AuthContext
    } catch (err: any) {
      // Error toast handled by AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0518] flex flex-col relative overflow-hidden font-display">
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <header className="p-6 md:px-12 z-10">
        <Link to="/login" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm font-bold">
          <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Login
        </Link>
      </header>

      <main className="flex-grow flex items-center justify-center p-4 z-10">
        <div className="w-full max-w-[480px] bg-[#1e0b2e]/40 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-8 md:p-12 shadow-2xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-white mb-3">Reset Password</h1>
            <p className="text-white/40 text-sm">Enter your email and we'll send you a link to get back into your account if it exists in our records.</p>
          </div>

          <form className="space-y-6" onSubmit={handleReset}>
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/60 uppercase tracking-widest px-1">Email Address</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-white/30 text-xl group-focus-within:text-pink-400 transition-colors">mail</span>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com" 
                  className="w-full bg-[#0f0518]/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-pink-500/50 transition-all"
                />
              </div>
            </div>

            <button 
              disabled={loading}
              className={`w-full h-14 rounded-xl bg-gradient-primary text-white font-bold text-lg shadow-lg hover:shadow-pink-500/40 hover:-translate-y-0.5 transition-all flex items-center justify-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? <div className="size-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Send Reset Link'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ForgotPasswordPage;
