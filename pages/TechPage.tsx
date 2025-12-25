
import React from 'react';
import techHero from '../src/assets/tech-hero.jpg';

const TechPage: React.FC = () => {
  return (
    <div className="bg-background-dark pb-24">
      <section className="py-20 px-4 md:px-10 lg:px-40">
        <div className="max-w-[1200px] mx-auto">
          <div className="inline-block px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-bold mb-6 uppercase tracking-widest">The Infrastructure</div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-8">Unrivaled Performance on QIE</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <TechMetric label="TPS" value="100,000+" desc="Transactions per second" />
            <TechMetric label="Finality" value="< 1s" desc="Deterministic finality" />
            <TechMetric label="Avg. Fee" value="$0.0001" desc="Ultra-low gas costs" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-8">
              <div className="p-8 rounded-2xl bg-white/5 border border-white/5 group hover:border-pink-500/30 transition-all">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <span className="material-symbols-outlined text-pink-500">auto_awesome</span>
                  Smart Liquidation Engine
                </h3>
                <p className="text-white/50 leading-relaxed">
                  Our proprietary engine monitors collateral prices via decentralized oracles every 500ms. Liquidation only occurs when the LTV exceeds the safety threshold, handled entirely by immutable smart contracts.
                </p>
              </div>
              <div className="p-8 rounded-2xl bg-white/5 border border-white/5 group hover:border-purple-500/30 transition-all">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <span className="material-symbols-outlined text-purple-500">hub</span>
                  Multi-Chain Bridge
                </h3>
                <p className="text-white/50 leading-relaxed">
                  Borrow against assets from Ethereum, Bitcoin, and Solana. QIE's native bridging technology ensures your cross-chain assets are wrapped securely with 1:1 backing.
                </p>
              </div>
            </div>
            <div className="glass-panel p-1 rounded-3xl overflow-hidden shadow-2xl">
              <img 
                src={techHero}
                alt="QIE Layer-1 Topology" 
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const TechMetric = ({ label, value, desc }: any) => (
  <div className="p-6 rounded-2xl bg-[#1e0b2e] border border-white/5 text-center">
    <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-3xl font-black text-white mb-1">{value}</p>
    <p className="text-xs text-white/40">{desc}</p>
  </div>
);

export default TechPage;
