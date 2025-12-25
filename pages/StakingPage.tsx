
import React from 'react';
import { useAuth } from '../context/AuthContext';

const StakingPage: React.FC = () => {
  const { showToast } = useAuth();

  const handleStake = () => {
    showToast("Staking functionality will be live once the QIE Governance contract is initialized.", "info");
  };

  return (
    <div className="bg-background-dark pb-24">
      <section className="relative py-24 px-4 md:px-10 lg:px-40 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="max-w-[1200px] mx-auto relative z-10">
          <div className="mb-12">
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6">QIE Staking</h1>
            <p className="text-xl text-white/60 leading-relaxed max-w-2xl">
              Lock your QIE tokens to secure the network, participate in governance, and earn the highest rewards in the ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="glass-panel p-8 rounded-3xl border-white/10">
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Current APR</p>
              <h3 className="text-4xl font-black text-green-400">18.5%</h3>
              <p className="text-xs text-white/30 mt-2">Dynamic rewards based on TVL</p>
            </div>
            <div className="glass-panel p-8 rounded-3xl border-white/10">
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Total QIE Staked</p>
              <h3 className="text-4xl font-black text-white">45.2M</h3>
              <p className="text-xs text-white/30 mt-2">~15% of circulating supply</p>
            </div>
            <div className="glass-panel p-8 rounded-3xl border-white/10">
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Lockup Period</p>
              <h3 className="text-4xl font-black text-pink-400">7 Days</h3>
              <p className="text-xs text-white/30 mt-2">Standard unbonding time</p>
            </div>
          </div>

          <div className="glass-panel rounded-[2.5rem] border-white/10 p-10 md:p-16 flex flex-col lg:flex-row gap-12 items-center bg-gradient-to-br from-surface-dark to-[#0f0518]">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-6">Start Earning Rewards</h2>
              <p className="text-white/50 mb-8 leading-relaxed">
                Staking QIE gives you "vQIE" power, which allows you to vote on protocol upgrades, asset additions, and interest rate adjustments.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-white/80">
                  <span className="material-symbols-outlined text-green-400">verified</span>
                  Compounding rewards every block
                </li>
                <li className="flex items-center gap-3 text-white/80">
                  <span className="material-symbols-outlined text-green-400">verified</span>
                  Governance voting rights
                </li>
                <li className="flex items-center gap-3 text-white/80">
                  <span className="material-symbols-outlined text-green-400">verified</span>
                  Early access to new lending pools
                </li>
              </ul>
              <button 
                onClick={handleStake}
                className="px-12 h-14 rounded-full bg-gradient-primary text-white font-bold text-lg shadow-xl hover:shadow-pink-500/40 transition-all"
              >
                Stake QIE Now
              </button>
            </div>
            <div className="size-64 md:size-80 flex items-center justify-center relative">
               <div className="absolute inset-0 bg-pink-500/20 blur-[80px] rounded-full animate-pulse"></div>
               <span className="material-symbols-outlined text-[120px] md:text-[180px] text-pink-500 relative z-10">diamond</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StakingPage;
