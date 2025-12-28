
import React from 'react';

const DevelopersPage: React.FC = () => {
  return (
    <div className="bg-background-dark pb-24">
      <section className="py-20 px-4 md:px-10 lg:px-40">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-end gap-10 mb-20">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">Build the Future <br/> of <span className="text-gradient">Open Finance</span></h1>
              <p className="text-lg text-white/50 leading-relaxed">
                Integrate QieLend's liquidity directly into your dApps. Our SDKs and APIs make it simple to borrow, lend, and query rates on-chain.
              </p>
            </div>
            <div className="flex gap-4">
              <button className="px-8 h-12 rounded-full bg-gradient-primary text-white font-bold shadow-lg">API Documentation</button>
              <button className="px-8 h-12 rounded-full bg-white/5 border border-white/10 text-white font-bold">GitHub Repo</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            <div className="bg-[#1e0b2e] border border-white/10 rounded-3xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Network Configuration</h3>
              <div className="flex flex-col gap-4 mb-8">
                 <div className="p-4 rounded-xl bg-white/5">
                    <p className="text-pink-400 text-xs font-bold uppercase tracking-widest mb-2">Mainnet (Chain ID: 1990)</p>
                    <code className="text-white/70 text-sm block break-all">https://rpc1mainnet.qie.digital/</code>
                    <code className="text-white/70 text-sm block">Currency: QIEV3</code>
                 </div>
                 <div className="p-4 rounded-xl bg-white/5">
                    <p className="text-purple-400 text-xs font-bold uppercase tracking-widest mb-2">Testnet (Chain ID: 1983)</p>
                    <code className="text-white/70 text-sm block break-all">https://rpc1testnet.qie.digital/</code>
                    <code className="text-white/70 text-sm block">Faucets Available</code>
                 </div>
              </div>

              <h3 className="text-2xl font-bold text-white mb-6">Deploy with Hardhat</h3>
              <div className="bg-[#0f0518] rounded-2xl p-6 font-mono text-sm text-pink-400 border border-white/5 overflow-x-auto">
                <pre>
{`// hardhat.config.js
module.exports = {
  solidity: "0.8.20",
  networks: {
    qie: {
      url: "https://rpc1mainnet.qie.digital/",
      chainId: 1990,
      accounts: [PRIVATE_KEY]
    }
  }
};`}
                </pre>
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <DevCard title="Bug Bounty Program" desc="Earn up to $100k for discovering critical vulnerabilities." icon="bug_report" />
              <DevCard title="Developer Grants" desc="Funding available for dApps that utilize QieLend liquidity." icon="auto_graph" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const DevCard = ({ title, desc, icon }: any) => (
  <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all flex gap-5 items-center">
    <div className="size-14 rounded-xl bg-pink-500/10 flex items-center justify-center shrink-0">
      <span className="material-symbols-outlined text-pink-500 text-3xl">{icon}</span>
    </div>
    <div>
      <h4 className="font-bold text-white mb-1">{title}</h4>
      <p className="text-white/40 text-sm">{desc}</p>
    </div>
  </div>
);

export default DevelopersPage;
