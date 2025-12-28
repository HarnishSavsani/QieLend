
import React from 'react';

const SecurityAuditPage: React.FC = () => {
  return (
    <div className="bg-background-dark pb-24">
      <section className="py-20 px-4 md:px-10 lg:px-40">
        <div className="max-w-[1200px] mx-auto text-center mb-20">
          <div className="size-20 rounded-3xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-8">
            <span className="material-symbols-outlined text-green-400 text-4xl">verified_user</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-6">Secured by BFT Consensus</h1>
          <p className="text-lg text-white/50 max-w-2xl mx-auto">
            Built on Tendermint Core, the QIE blockchain provides Byzantine Fault Tolerance with instant finality. Our smart contracts add a second layer of immutable security.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
           <AuditLogo name="CertiK" date="March 2025" score="98/100" />
           <AuditLogo name="Hacken" date="Feb 2025" score="Passed" />
           <AuditLogo name="Quantstamp" date="Jan 2025" score="Gold" />
           <AuditLogo name="Runtime Verification" date="Dec 2023" score="Audited" />
        </div>

        <div className="glass-panel rounded-3xl p-10 max-w-4xl mx-auto border-white/10">
          <h3 className="text-2xl font-bold text-white mb-8">Live Protocol Health</h3>
          <div className="space-y-6">
            <HealthItem label="Smart Contract Integrity" status="Secure" />
            <HealthItem label="Liquidity Buffer" status="125% Overflow" />
            <HealthItem label="Oracle Connectivity" status="12/12 Live" />
            <HealthItem label="Emergency Pause System" status="Operational" />
          </div>
        </div>
      </section>
    </div>
  );
};

const AuditLogo = ({ name, date, score }: any) => (
  <div className="p-8 rounded-2xl bg-white/5 border border-white/5 text-center group hover:bg-white/10 transition-all">
    <div className="h-10 flex items-center justify-center mb-6">
       <span className="text-2xl font-black text-white/20 group-hover:text-white transition-colors uppercase italic">{name}</span>
    </div>
    <p className="text-xs font-bold text-white/40 mb-1">Completed {date}</p>
    <p className="text-lg font-bold text-green-400">{score}</p>
  </div>
);

const HealthItem = ({ label, status }: any) => (
  <div className="flex justify-between items-center py-4 border-b border-white/5 last:border-0">
    <span className="text-white/70 font-medium">{label}</span>
    <div className="flex items-center gap-2">
      <span className="size-2 rounded-full bg-green-500 animate-pulse"></span>
      <span className="text-green-400 font-bold text-sm uppercase tracking-wider">{status}</span>
    </div>
  </div>
);

export default SecurityAuditPage;
