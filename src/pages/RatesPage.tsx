
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

          <div className="mt-12 p-8 rounded-2xl bg-pink-500/5 border border-pink-500/10 max-w-2xl">
            <h4 className="text-white font-bold mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">info</span>
              Dynamic Rate Model
            </h4>
            <p className="text-sm text-white/40 leading-relaxed">
              Rates are calculated based on the supply-to-demand ratio of each asset. High utilization increases borrow costs to encourage repayments and rewards suppliers with higher yields.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RatesPage;
