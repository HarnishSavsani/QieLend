
import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <div className="bg-background-dark pb-20">
      <section className="relative py-24 px-4 md:px-10 lg:px-40 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-purple-600/10 to-transparent pointer-events-none"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6">Democratizing Finance</h1>
          <p className="text-xl text-white/60 leading-relaxed">
            QieLend is built on the belief that financial services should be transparent, efficient, and accessible to everyone. By leveraging the QIE Blockchain, we're removing the middleman and returning value to the users.
          </p>
        </div>
      </section>

      <section className="px-4 md:px-10 lg:px-40 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center max-w-[1200px] mx-auto">
          <div>
            <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
            <p className="text-white/50 text-lg leading-relaxed mb-6">
              To create a global liquidity layer where digital assets can be utilized without friction. We aim to become the standard for peer-to-peer lending on the QIE network, offering institutional-grade security to retail users.
            </p>
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <span className="material-symbols-outlined text-pink-500">check_circle</span>
                <p className="text-white/80 font-medium">100% On-Chain Transparency</p>
              </div>
              <div className="flex gap-4 items-start">
                <span className="material-symbols-outlined text-pink-500">check_circle</span>
                <p className="text-white/80 font-medium">Zero-Counterparty Risk</p>
              </div>
              <div className="flex gap-4 items-start">
                <span className="material-symbols-outlined text-pink-500">check_circle</span>
                <p className="text-white/80 font-medium">Community-Owned Governance</p>
              </div>
            </div>
          </div>
          <div className="glass-panel p-8 rounded-3xl border-pink-500/20 shadow-2xl relative">
            <div className="absolute -top-4 -right-4 size-24 bg-pink-500/20 blur-2xl rounded-full"></div>
            <h3 className="text-2xl font-bold text-white mb-4">Why We Started</h3>
            <p className="text-white/40 leading-relaxed italic">
              "We saw a gap in the DeFi ecosystem. Centralized exchanges were too risky, and traditional P2P platforms were too slow. QIE technology gave us the tools to build something better—a platform that is actually owned by its users."
            </p>
            <div className="mt-8 flex items-center gap-4">
              <div className="size-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600"></div>
              <div>
                <p className="text-white font-bold">The QieLend Founding Team</p>
                <p className="text-white/30 text-xs">Web3 Pioneers & Security Experts</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
