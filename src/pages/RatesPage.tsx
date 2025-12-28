
import React from 'react';

import { SUPPORTED_ASSETS } from '../config/constants';

const RatesPage: React.FC = () => {
    // Generate rates based on supported assets to ensure consistency with the rest of the app
  const rates = SUPPORTED_ASSETS.map(asset => ({
      asset: asset.symbol,
      icon: asset.icon,
      // Mock protocol data for now
      supply: (Math.random() * 5 + 8).toFixed(1) + '%',
      borrow: (Math.random() * 5 + 10).toFixed(1) + '%',
      utilization: Math.floor(Math.random() * 60 + 20) + '%'
  }));

  return (
    <div className="bg-background-dark pb-24">
      <section className="py-20 px-4 md:px-10 lg:px-40">
        <div className="max-w-[1200px] mx-auto">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Market Rates</h1>
          <p className="text-white/60 mb-12 text-lg">Real-time supply and borrow rates optimized by QIE liquidity algorithms.</p>

          <div className="glass-panel rounded-3xl border-white/10 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/5">
                    <th className="py-6 px-8 text-xs font-bold uppercase tracking-widest text-white/40">Asset</th>
                    <th className="py-6 px-8 text-xs font-bold uppercase tracking-widest text-white/40">Supply APY</th>
                    <th className="py-6 px-8 text-xs font-bold uppercase tracking-widest text-white/40">Borrow APR</th>
                    <th className="py-6 px-8 text-xs font-bold uppercase tracking-widest text-white/40">Utilization</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {rates.map((r, i) => (
                    <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="py-6 px-8">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-white/50">{r.icon}</span>
                          <span className="font-bold text-white">{r.asset}</span>
                        </div>
                      </td>
                      <td className="py-6 px-8 text-green-400 font-bold">{r.supply}</td>
                      <td className="py-6 px-8 text-pink-400 font-bold">{r.borrow}</td>
                      <td className="py-6 px-8">
                         <div className="flex items-center gap-4">
                            <div className="flex-grow bg-white/10 h-1.5 rounded-full overflow-hidden">
                               <div className="bg-gradient-primary h-full" style={{ width: r.utilization }}></div>
                            </div>
                            <span className="text-white/40 text-xs font-bold w-10">{r.utilization}</span>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-2xl bg-pink-500/5 border border-pink-500/10">
              <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">token</span>
                QIE Tokenomics
              </h4>
              <ul className="space-y-3">
                <li className="flex justify-between text-sm">
                  <span className="text-white/60">Max Supply</span>
                  <span className="font-mono text-pink-400">150,000,565 QIE</span>
                </li>
                <li className="flex justify-between text-sm">
                  <span className="text-white/60">Halving Schedule</span>
                  <span className="font-mono text-white">Every 2 Years</span>
                </li>
                <li className="flex justify-between text-sm">
                  <span className="text-white/60">Circulating Emission</span>
                  <span className="font-mono text-green-400">1,808 QIE / Day</span>
                </li>
              </ul>
            </div>
            
            <div className="p-8 rounded-2xl bg-purple-500/5 border border-purple-500/10">
              <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">local_fire_department</span>
                Deflation Engine
              </h4>
              <p className="text-sm text-white/40 leading-relaxed mb-4">
                Every transaction on QieLend contributes to the protocol's scarcity. A portion of the gas fee is permanently removed from circulation.
              </p>
              <div className="text-xs font-mono bg-black/20 p-3 rounded border border-white/5 text-purple-300">
                Burned Fee = Base Fee × Gas Used
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RatesPage;
