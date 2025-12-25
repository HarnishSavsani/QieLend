
import React from 'react';

const RatesPage: React.FC = () => {
  const rates = [
    { asset: 'QIE', supply: '18.2%', borrow: '2.5%', utilization: '42%' },
    { asset: 'USDT', supply: '12.5%', borrow: '14.1%', utilization: '88%' },
    { asset: 'USDC', supply: '11.8%', borrow: '13.4%', utilization: '85%' },
    { asset: 'BTC', supply: '4.2%', borrow: '6.5%', utilization: '21%' },
    { asset: 'ETH', supply: '5.1%', borrow: '7.2%', utilization: '28%' },
    { asset: 'DAI', supply: '10.5%', borrow: '12.0%', utilization: '74%' },
  ];

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
                          <div className="size-10 rounded-full bg-white/5 flex items-center justify-center font-bold text-white text-xs">{r.asset}</div>
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
