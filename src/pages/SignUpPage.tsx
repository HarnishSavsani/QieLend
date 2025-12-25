
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SignUpPage: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signup, isLoading, showToast } = useAuth();
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (password.length < 8) {
        showToast("Password security: Must be at least 8 characters long.", 'error');
        return;
      }
      await signup(firstName, lastName, email, password);
      navigate('/dashboard');
    } catch (err: any) {
      // Errors are already handled by signup method in AuthContext using the global toast
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0518] flex flex-col relative overflow-hidden font-display">
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <header className="p-6 md:px-12 flex justify-between items-center z-10">
        <Link to="/" className="flex items-center gap-3">
          <div className="size-8 flex items-center justify-center bg-gradient-primary rounded-lg shadow-md">
            <span className="material-symbols-outlined text-white text-xl">diamond</span>
          </div>
          <h2 className="text-white text-xl font-bold tracking-tight">QieLend</h2>
        </Link>
        <Link to="/login" className="px-6 py-2 rounded-lg border border-pink-500/30 text-pink-500 hover:bg-pink-500 hover:text-white transition-all text-sm font-bold">
          Login
        </Link>
      </header>

      <main className="flex-grow flex items-center justify-center p-4 z-10 py-12">
        <div className="w-full max-w-[500px] bg-[#1e0b2e]/40 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-8 md:p-10 shadow-2xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Join QieLend</h1>
            <p className="text-white/40 text-sm">Start your P2P journey on the QIE network.</p>
          </div>

          <form className="space-y-6" onSubmit={handleSignUp}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/60 uppercase tracking-widest px-1">First Name</label>
                <input 
                  type="text" 
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Alex" 
                  className="w-full bg-[#0f0518]/50 border border-white/10 rounded-xl py-3.5 px-4 text-white focus:outline-none focus:border-pink-500/50 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/60 uppercase tracking-widest px-1">Last Name</label>
                <input 
                  type="text" 
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Smith" 
                  className="w-full bg-[#0f0518]/50 border border-white/10 rounded-xl py-3.5 px-4 text-white focus:outline-none focus:border-pink-500/50 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/60 uppercase tracking-widest px-1">Email</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@email.com" 
                className="w-full bg-[#0f0518]/50 border border-white/10 rounded-xl py-3.5 px-4 text-white focus:outline-none focus:border-pink-500/50 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/60 uppercase tracking-widest px-1">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters" 
                className="w-full bg-[#0f0518]/50 border border-white/10 rounded-xl py-3.5 px-4 text-white focus:outline-none focus:border-pink-500/50 transition-all"
              />
            </div>

            <button 
              disabled={isLoading}
              className={`w-full h-14 rounded-xl bg-gradient-primary text-white font-bold text-lg shadow-lg hover:shadow-pink-500/40 hover:-translate-y-0.5 transition-all flex items-center justify-center ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? <div className="size-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Create Account'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default SignUpPage;
