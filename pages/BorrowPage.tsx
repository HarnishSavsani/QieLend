
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from '../context/AuthContext';
import ProcessingModal from '../components/ProcessingModal';

const SUPPORTED_ASSETS = [
  { symbol: 'USDT', name: 'Tether', icon: 'monetization_on', color: 'text-green-400', price: 1 },
  { symbol: 'USDC', name: 'USD Coin', icon: 'payments', color: 'text-blue-400', price: 1 },
  { symbol: 'QIE', name: 'QIE Coin', icon: 'diamond', color: 'text-purple-400', price: 1.5 },
  { symbol: 'BTC', name: 'Bitcoin', icon: 'currency_bitcoin', color: 'text-yellow-500', price: 65000 },
  { symbol: 'ETH', name: 'Ethereum', icon: 'token', color: 'text-blue-500', price: 3500 },
];

const BorrowPage: React.FC = () => {
  const { user, showToast } = useAuth();
  const navigate = useNavigate();
  
  const [borrowAmount, setBorrowAmount] = useState(5000);
  const [borrowAsset, setBorrowAsset] = useState('USDT');
  const [collateralAmount, setCollateralAmount] = useState(0.5);
  const [collateralAsset, setCollateralAsset] = useState('BTC');
  const [ltv, setLtv] = useState(50);
  const [duration, setDuration] = useState('30');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [showBorrowDropdown, setShowBorrowDropdown] = useState(false);
  const [showCollateralDropdown, setShowCollateralDropdown] = useState(false);

  const borrowPrice = SUPPORTED_ASSETS.find(a => a.symbol === borrowAsset)?.price || 1;
  const collateralPrice = SUPPORTED_ASSETS.find(a => a.symbol === collateralAsset)?.price || 1;

  useEffect(() => {
    const borrowValueUsd = borrowAmount * borrowPrice;
    const requiredCollateralUsd = borrowValueUsd / (ltv / 100);
    const calculatedCollateral = requiredCollateralUsd / collateralPrice;
    setCollateralAmount(parseFloat(calculatedCollateral.toFixed(6)));
  }, [borrowAmount, borrowAsset, ltv, collateralAsset, borrowPrice, collateralPrice]);

  const insights = useMemo(() => {
    const baseApy = 8.5;
    const durationMultiplier = parseInt(duration) === 7 ? 0.9 : parseInt(duration) === 365 ? 1.4 : 1;
    const estimatedApy = (baseApy * durationMultiplier).toFixed(2);
    const liquidationThreshold = 0.85;
    const borrowValueUsd = borrowAmount * borrowPrice;
    const liqPrice = borrowValueUsd / (collateralAmount * liquidationThreshold);
    return {
      apy: estimatedApy,
      liqPrice: isFinite(liqPrice) ? liqPrice.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '0.00'
    };
  }, [borrowAmount, borrowPrice, collateralAmount, duration]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast("Please login to post loan requests.", 'info');
      return;
    }
    if (borrowAsset === collateralAsset) {
      showToast("Security Check: Borrow and Collateral assets must be different.", 'error');
      return;
    }
    
    setIsLoading(true);
    try {
      await addDoc(collection(db, "loans"), {
        borrowerId: user.id,
        borrowerName: `${user.firstName} ${user.lastName}`,
        borrowerAvatar: user.avatar,
        amount: borrowAmount,
        asset: borrowAsset,
        collateralAmount: collateralAmount,
        collateralAsset: collateralAsset,
        apy: parseFloat(insights.apy),
        duration: parseInt(duration),
        ltv: ltv,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      
      setIsProcessing(true); // Trigger Graphite animation
    } catch (error) {
      showToast("Failed to submit request. Check your connection.", 'error');
      setIsLoading(false);
    }
  };

  const selectedBorrow = SUPPORTED_ASSETS.find(a => a.symbol === borrowAsset);
  const selectedCollateral = SUPPORTED_ASSETS.find(a => a.symbol === collateralAsset);

  return (
    <section className="relative z-10 px-4 py-8 md:px-10 lg:px-40 max-w-[1440px] mx-auto min-h-screen">
      <ProcessingModal 
        isOpen={isProcessing} 
        onClose={() => navigate('/dashboard')} 
        title="Settling Request" 
        subtitle="Broadcasting your loan offer to QIE Match Engine..." 
      />

      <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">Create Loan Request</h1>
          <p className="text-white/60 text-lg">Set your terms. QIE Match Engine finds your lender.</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/10 backdrop-blur-sm">
          <div className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </div>
          <span className="text-xs font-bold text-white uppercase tracking-wide">QIE Match Engine: Live</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-[#1e0b2e]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-primary"></div>
            
            <form className="space-y-8" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-white/80 uppercase tracking-wide">I want to borrow</label>
                  <div className="relative">
                    <div className="bg-[#0f0518] border border-white/10 rounded-xl flex items-center p-2 focus-within:border-pink-500/50 transition-colors">
                      <input 
                        className="bg-transparent border-none text-white text-2xl font-bold w-full focus:ring-0 p-3 placeholder-white/20" 
                        type="number" 
                        value={borrowAmount}
                        onChange={(e) => setBorrowAmount(Math.max(0, Number(e.target.value)))}
                      />
                      <div className="relative">
                        <button 
                          type="button"
                          onClick={() => { setShowBorrowDropdown(!showBorrowDropdown); setShowCollateralDropdown(false); }}
                          className="flex items-center gap-2 bg-[#2d1b42] hover:bg-[#3d2b52] rounded-lg px-3 py-2 border border-white/5 transition-colors"
                        >
                          <span className={`material-symbols-outlined ${selectedBorrow?.color}`}>{selectedBorrow?.icon}</span>
                          <span className="font-bold text-white text-sm">{borrowAsset}</span>
                          <span className="material-symbols-outlined text-white/40 text-sm">expand_more</span>
                        </button>
                        
                        {showBorrowDropdown && (
                          <div className="absolute top-full right-0 mt-2 w-40 bg-[#1e0b2e] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in zoom-in-95 fade-in duration-200">
                            {SUPPORTED_ASSETS.map(asset => (
                              <button
                                key={asset.symbol}
                                type="button"
                                onClick={() => { setBorrowAsset(asset.symbol); setShowBorrowDropdown(false); }}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-sm font-bold text-white/70 hover:text-white transition-colors border-b border-white/5 last:border-0"
                              >
                                <span className={`material-symbols-outlined text-sm ${asset.color}`}>{asset.icon}</span>
                                {asset.symbol}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-white/80 uppercase tracking-wide">Required Collateral</label>
                    <span className="text-[10px] text-pink-400 font-bold uppercase tracking-widest">Auto-Synced</span>
                  </div>
                  <div className="relative">
                    <div className="bg-[#0f0518]/50 border border-white/5 rounded-xl flex items-center p-2 cursor-not-allowed opacity-80">
                      <input 
                        className="bg-transparent border-none text-white text-2xl font-bold w-full focus:ring-0 p-3" 
                        type="number" 
                        readOnly
                        value={collateralAmount}
                      />
                      <div className="relative">
                        <button 
                          type="button"
                          onClick={() => { setShowCollateralDropdown(!showCollateralDropdown); setShowBorrowDropdown(false); }}
                          className="flex items-center gap-2 bg-[#2d1b42] hover:bg-[#3d2b52] rounded-lg px-3 py-2 border border-white/5 transition-colors"
                        >
                          <span className={`material-symbols-outlined ${selectedCollateral?.color}`}>{selectedCollateral?.icon}</span>
                          <span className="font-bold text-white text-sm">{collateralAsset}</span>
                          <span className="material-symbols-outlined text-white/40 text-sm">expand_more</span>
                        </button>
                        
                        {showCollateralDropdown && (
                          <div className="absolute top-full right-0 mt-2 w-40 bg-[#1e0b2e] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in zoom-in-95 fade-in duration-200">
                            {SUPPORTED_ASSETS.map(asset => (
                              <button
                                key={asset.symbol}
                                type="button"
                                onClick={() => { setCollateralAsset(asset.symbol); setShowCollateralDropdown(false); }}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-sm font-bold text-white/70 hover:text-white transition-colors border-b border-white/5 last:border-0"
                              >
                                <span className={`material-symbols-outlined text-sm ${asset.color}`}>{asset.icon}</span>
                                {asset.symbol}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-4">
                    <label className="text-xs font-bold text-white/80 uppercase tracking-wide">Target LTV (Risk Level)</label>
                    <span className="text-xl font-bold text-pink-400">{ltv}%</span>
                  </div>
                  <input 
                    className="w-full h-2 bg-[#0f0518] rounded-lg appearance-none cursor-pointer accent-pink-500" 
                    max="80" min="10" type="range" 
                    value={ltv}
                    onChange={(e) => setLtv(Number(e.target.value))}
                  />
                  <div className="flex justify-between mt-2 text-[10px] text-white/30 font-bold">
                    <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-green-500"></span> CONSERVATIVE</span>
                    <span className="flex items-center gap-1">AGGRESSIVE <span className="size-1.5 rounded-full bg-red-500"></span></span>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-white/80 uppercase tracking-wide">Duration (Term)</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['7', '30', '90', '365'].map((d) => (
                      <button 
                        key={d}
                        type="button"
                        onClick={() => setDuration(d)}
                        className={`py-3 rounded-xl border text-sm font-bold transition-all ${
                          duration === d 
                            ? 'bg-gradient-primary text-white shadow-lg border-transparent scale-105' 
                            : 'bg-[#2d1b42] border-white/5 text-white/60 hover:bg-[#3d2b52]'
                        }`}
                      >
                        {d} Days
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                disabled={isLoading}
                className="w-full h-16 rounded-2xl bg-gradient-primary text-white font-black text-xl shadow-xl hover:shadow-pink-500/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-50" 
                type="submit"
              >
                {isLoading ? <div className="size-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div> : (
                  <>
                    <span className="material-symbols-outlined text-2xl">rocket_launch</span> Post to Marketplace
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
           <div className="bg-gradient-to-br from-[#2d1b42] to-[#1e0b2e] rounded-2xl p-6 border border-white/10 relative overflow-hidden shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-yellow-400">electric_bolt</span> Real-time Insight
            </h3>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-black/20 border border-white/5 group hover:border-pink-500/20 transition-colors">
                <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1">Estimated APY</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-black text-green-400">{insights.apy}%</p>
                  <span className="text-[10px] text-white/30">(Varies by term)</span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-black/20 border border-white/5 group hover:border-red-500/20 transition-colors">
                <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1">Liquidation Price</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-lg font-bold text-white">${insights.liqPrice}</p>
                  <span className="text-[10px] text-white/40">{collateralAsset}/USD</span>
                </div>
                <p className="text-[10px] text-white/20 mt-1">Loan defaults if asset hits this price</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BorrowPage;
