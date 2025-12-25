import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import networkDiagram from '../assets/blog-1.jpg';
import { useAuth } from '../context/AuthContext';

const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleProtectedAction = (path: string) => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      navigate(path);
    }
  };

  return (
    <div className="bg-background-dark">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center py-16 md:py-24 px-4 md:px-10 lg:px-40 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-pink-600/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>
        
        <div className="max-w-[1200px] w-full flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <div className="flex-1 flex flex-col gap-6 text-center lg:text-left z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 w-fit mx-auto lg:mx-0 backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
              <span className="text-xs font-medium text-pink-300 tracking-wide uppercase">Powered by QIE Blockchain</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-[-0.033em] text-white">
              Next-Gen Lending <br/>
              <span className="text-gradient">Faster. Safer. Smarter.</span>
            </h1>
            <h2 className="text-lg text-white/70 font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Experience instant P2P loans with minimal fees and maximum security. QIE technology ensures seamless transactions and unbeatable efficiency for your digital assets.
            </h2>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-4">
              <button 
                onClick={() => handleProtectedAction('/borrow')}
                className="flex items-center justify-center rounded-full h-12 px-8 bg-gradient-primary text-white text-base font-bold shadow-[0_0_20px_rgba(236,72,153,0.3)] hover:shadow-[0_0_30px_rgba(236,72,153,0.5)] hover:scale-105 transition-all duration-300"
              >
                Get Instant Loan
              </button>
              <button 
                onClick={() => handleProtectedAction('/lend')}
                className="flex items-center justify-center rounded-full h-12 px-8 bg-white/5 border border-white/20 text-white hover:bg-white/10 transition-colors text-base font-bold backdrop-blur-sm"
              >
                View Rates
              </button>
            </div>
          </div>

          <div className="w-full max-w-[480px] lg:w-[450px] shrink-0 z-10">
            <div className="rounded-2xl border border-white/10 bg-[#1e0b2e]/60 backdrop-blur-xl p-6 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none"></div>
              <div className="mb-6 flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Borrow Crypto</h3>
                  <p className="text-sm text-pink-300/80">QIE Network Optimized</p>
                </div>
                <div className="px-2 py-1 bg-gradient-primary rounded text-[10px] font-bold text-white uppercase tracking-wider">Live</div>
              </div>
              <div className="mb-5">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-white/80">I want to borrow</span>
                </div>
                <div className="relative h-14 bg-[#0f0518]/80 rounded-xl border border-white/10 flex items-center px-4 gap-2 focus-within:border-pink-500/50 transition-colors">
                  <input className="bg-transparent border-none text-white w-full focus:ring-0 text-xl font-bold p-0 placeholder-white/20" placeholder="0.00" type="number" defaultValue="5000" />
                  <div className="flex items-center gap-2 bg-white/5 rounded-lg px-2 py-1">
                    <span className="material-symbols-outlined text-pink-500 text-sm">attach_money</span>
                    <span className="text-sm font-bold text-white">USDT</span>
                  </div>
                </div>
              </div>
              <div className="mb-8">
                <div className="flex justify-between mb-3">
                  <span className="text-sm font-medium text-white/80">Duration</span>
                  <span className="text-sm font-bold text-pink-400">12 Months</span>
                </div>
                <div className="relative w-full h-2 bg-[#0f0518] rounded-full">
                  <div className="absolute h-full bg-gradient-primary rounded-full" style={{ width: '50%' }}></div>
                  <div className="absolute size-5 bg-white rounded-full shadow-[0_0_15px_rgba(236,72,153,0.8)] border-2 border-pink-500 cursor-pointer hover:scale-110 transition-transform top-1/2 -translate-y-1/2" style={{ left: '50%' }}></div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-[#2d1b42] to-[#1e0b2e] rounded-xl p-5 mb-6 border border-white/5">
                <div className="flex justify-between items-center mb-3 text-sm">
                  <span className="text-white/60">Collateral (BTC)</span>
                  <span className="font-bold text-white">0.21 BTC</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-white/10 text-sm">
                  <span className="text-white/60">QIE APR Benefit</span>
                  <span className="font-bold text-green-400">-1.5% Bonus</span>
                </div>
              </div>
              <button 
                onClick={() => handleProtectedAction('/borrow')}
                className="w-full h-14 rounded-xl bg-gradient-primary text-white font-bold text-lg shadow-lg flex items-center justify-center hover:shadow-pink-500/20 hover:-translate-y-0.5 transition-all"
              >
                Apply Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Ticker Section */}
      <div className="w-full bg-[#1e0b2e] border-y border-white/5 py-4 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#1e0b2e] via-transparent to-[#1e0b2e] z-10 pointer-events-none"></div>
        <div className="flex gap-16 whitespace-nowrap animate-marquee items-center justify-center px-4">
          <TickerItem symbol="BTC" supply="4.2%" borrow="6.5%" icon="currency_bitcoin" color="yellow-500" />
          <TickerItem symbol="ETH" supply="5.1%" borrow="7.2%" icon="token" color="blue-400" />
          <TickerItem symbol="USDT" supply="12.5%" borrow="14.1%" icon="monetization_on" color="green-400" />
          <TickerItem symbol="QIE" supply="18.2%" borrow="2.5%" icon="diamond" color="purple-500" />
          <TickerItem symbol="BTC" supply="4.2%" borrow="6.5%" icon="currency_bitcoin" color="yellow-500" />
          <TickerItem symbol="ETH" supply="5.1%" borrow="7.2%" icon="token" color="blue-400" />
          <TickerItem symbol="USDT" supply="12.5%" borrow="14.1%" icon="monetization_on" color="green-400" />
          <TickerItem symbol="QIE" supply="18.2%" borrow="2.5%" icon="diamond" color="purple-500" />
        </div>
      </div>

      {/* Why QieLend? Section */}
      <section className="py-24 px-4 md:px-10 lg:px-40 bg-background-dark relative">
        <div className="max-w-[1200px] mx-auto relative z-10 text-center">
          <div className="mb-20">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Why QieLend?</h2>
            <p className="text-white/60 max-w-2xl mx-auto text-lg">Powered by the revolutionary QIE blockchain, we offer features that traditional platforms simply cannot match.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard title="QIE Speed & Efficiency" desc="Forget waiting hours for confirmations. QIE technology enables near-instant loan settlements and collateral transfers." icon="speed" color="pink" />
            <FeatureCard title="Enhanced Security" desc="Leveraging QIE's advanced cryptographic protocols, your assets are protected by next-generation smart contract audits." icon="verified_user" color="purple" />
            <FeatureCard title="Superior Rates" desc="The low transaction costs of the QIE network allow us to pass savings directly to you, offering the most competitive APYs." icon="percent" color="pink" />
          </div>
        </div>
      </section>

      {/* The QIE Advantage Section */}
      <section className="py-24 px-4 md:px-10 lg:px-40 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row items-center gap-20">
          <div className="flex-1">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">The QIE Advantage</h2>
            <p className="text-white/50 text-lg mb-12">Seamless borrowing in 3 simple steps</p>
            
            <div className="space-y-12">
              <StepItem 
                number="1" 
                title="Connect & Deposit" 
                desc="Link your wallet and deposit crypto collateral. Supported by QIE multi-chain bridge for easy asset transfer." 
              />
              <StepItem 
                number="2" 
                title="Instant Approval" 
                desc="Our QIE-powered smart contracts verify collateral instantly. No credit checks, no waiting periods." 
              />
              <StepItem 
                number="3" 
                title="Receive Funds" 
                desc="Get USDT or stablecoins directly to your wallet. Repay anytime with ultra-low gas fees." 
              />
            </div>
          </div>
          
          <div className="flex-1 relative">
            <div className="relative z-10 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
              <img src={networkDiagram} alt="QIE Network Diagram" className="w-full h-auto opacity-40 grayscale group-hover:grayscale-0 transition-all duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-background-dark/80 via-transparent to-transparent"></div>
              
              {/* TVL Card Overlay */}
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[85%] glass-panel rounded-2xl p-6 border-white/20 shadow-2xl transform hover:scale-105 transition-transform duration-500">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Total Value Locked (TVL)</p>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-black text-white">$842,921,042.00</h3>
                  <div className="flex items-center gap-1 text-green-400 font-bold text-xs bg-green-400/10 px-2 py-1 rounded">
                    <span className="material-symbols-outlined text-[14px]">trending_up</span> +12.4%
                  </div>
                </div>
                <div className="flex gap-4 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-pink-500"></span>
                    <span className="text-[10px] text-white/60 font-medium">Audited by Certik</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-purple-500"></span>
                    <span className="text-[10px] text-white/60 font-medium">QR Verified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 md:px-10 lg:px-40 bg-background-dark">
        <div className="max-w-[1200px] mx-auto">
          <div className="relative rounded-[2.5rem] bg-[#1a0b2e] border border-white/10 p-12 md:p-20 text-center overflow-hidden group shadow-[0_0_50px_rgba(139,92,246,0.1)]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-primary opacity-10 blur-[100px]"></div>
            
            <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
              <div className="size-16 rounded-2xl bg-gradient-primary flex items-center justify-center mb-8 shadow-lg shadow-pink-500/20 group-hover:scale-110 transition-transform duration-500">
                <span className="material-symbols-outlined text-white text-3xl">rocket_launch</span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
                Unlock Your Crypto's Potential
              </h2>
              <p className="text-white/60 text-lg mb-10 leading-relaxed">
                Join the fastest growing P2P lending community powered by QIE technology. 
                Secure, efficient, and built for the future of finance.
              </p>
              
              <div className="flex flex-wrap gap-5 justify-center">
                <button 
                  onClick={() => handleProtectedAction('/dashboard')}
                  className="px-10 h-14 rounded-full bg-gradient-primary text-white font-bold flex items-center justify-center shadow-lg hover:shadow-pink-500/40 hover:-translate-y-1 transition-all duration-300"
                >
                  Create Account
                </button>
                <Link to="/whitepaper" className="px-10 h-14 rounded-full bg-white/5 border border-white/10 text-white font-bold flex items-center justify-center hover:bg-white/10 transition-all duration-300">
                  Read Whitepaper
                </Link>
              </div>
              
              <p className="mt-8 text-white/30 text-xs font-medium uppercase tracking-widest">
                No credit card required • Instant setup
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const TickerItem = ({ symbol, supply, borrow, icon, color }: any) => (
  <div className="flex items-center gap-3">
    <span className="font-bold text-white flex items-center gap-1">
      <span className={`material-symbols-outlined text-${color}`}>{icon}</span> {symbol}
    </span>
    <span className="text-pink-400 font-medium text-sm">Supply {supply}</span>
    <span className="text-white/20 text-xs">|</span>
    <span className="text-purple-300 font-medium text-sm">Borrow {borrow}</span>
  </div>
);

const FeatureCard = ({ title, desc, icon, color }: any) => (
  <div className="p-8 rounded-2xl bg-[#1e0b2e] border border-white/5 hover:border-pink-500/30 transition-all group hover:-translate-y-2 duration-300 shadow-xl text-left">
    <div className={`size-14 rounded-xl bg-gradient-to-br from-${color}-500/20 to-purple-600/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
      <span className={`material-symbols-outlined text-${color}-400 text-3xl`}>{icon}</span>
    </div>
    <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
    <p className="text-white/60 leading-relaxed text-sm">{desc}</p>
  </div>
);

const StepItem = ({ number, title, desc }: any) => (
  <div className="flex gap-6 group">
    <div className="shrink-0 relative">
      <div className="size-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-black text-sm relative z-10 shadow-lg group-hover:scale-110 transition-transform">
        {number}
      </div>
      {number !== '3' && (
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[1px] h-12 bg-gradient-to-b from-purple-500 to-transparent opacity-30"></div>
      )}
    </div>
    <div>
      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-pink-400 transition-colors">{title}</h3>
      <p className="text-white/40 text-sm leading-relaxed max-w-sm">{desc}</p>
    </div>
  </div>
);

export default LandingPage;
