import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from '../context/AuthContext';
import ProcessingModal from '../components/ProcessingModal';

import { SUPPORTED_ASSETS } from '../config/constants';
import { fetchCryptoPrices, AssetPriceMap } from '../services/coingecko';
import { parseEther, Contract, formatEther } from 'ethers';
import { ERC20_ABI, CONTRACT_ADDRESSES } from '../config/blockchain';

import confetti from 'canvas-confetti';

const BorrowPage: React.FC = () => {
  const { user, showToast, lendingPoolContract, signer } = useAuth(); 
  const navigate = useNavigate();
  
  const [borrowAmount, setBorrowAmount] = useState(5000);
  const [borrowAsset, setBorrowAsset] = useState('USDT');
  const [collateralAmount, setCollateralAmount] = useState(0.5);
  const [collateralAsset, setCollateralAsset] = useState('BTC');
  const [ltv, setLtv] = useState(50);
  const [duration, setDuration] = useState('30');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [processStep, setProcessStep] = useState(''); // 'approving' | 'creating' | ''

  const [prices, setPrices] = useState<AssetPriceMap>({});
  const [userBalances, setUserBalances] = useState<{[key: string]: number}>({});
  const [showBorrowDropdown, setShowBorrowDropdown] = useState(false);
  const [showCollateralDropdown, setShowCollateralDropdown] = useState(false);

  const fireConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 21000 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  // Fetch Prices and Balances
  useEffect(() => {
      const loadData = async () => {
          const p = await fetchCryptoPrices();
          setPrices(p);
          
          if (signer) {
              const balances: {[key: string]: number} = {};
              const address = await signer.getAddress();
              
              // Load balances for all supported assets
              for (const asset of SUPPORTED_ASSETS) {
                  try {
                      if ((CONTRACT_ADDRESSES as any)[asset.symbol]) {
                          const tokenContract = new Contract((CONTRACT_ADDRESSES as any)[asset.symbol], ERC20_ABI, signer);
                          const bal = await tokenContract.balanceOf(address);
                          balances[asset.symbol] = parseFloat(formatEther(bal));
                      }
                  } catch (e) {
                      console.warn(`Failed to fetch balance for ${asset.symbol}`);
                  }
              }
              setUserBalances(balances);
          }
      };
      
      loadData();
      const interval = setInterval(loadData, 60000);
      return () => clearInterval(interval);
  }, [signer]);

  // Smart Default for Collateral (user feedback)
  useEffect(() => {
      if (Object.keys(userBalances).length > 0) {
          const currentBal = userBalances[collateralAsset] || 0;
          if (currentBal === 0) {
              const firstAvailable = SUPPORTED_ASSETS.find(a => (userBalances[a.symbol] || 0) > 0);
              if (firstAvailable) {
                  setCollateralAsset(firstAvailable.symbol);
              }
          }
      }
  }, [userBalances]);

  const borrowPrice = prices[borrowAsset] || SUPPORTED_ASSETS.find(a => a.symbol === borrowAsset)?.defaultPrice || 0;
  const collateralPrice = prices[collateralAsset] || SUPPORTED_ASSETS.find(a => a.symbol === collateralAsset)?.defaultPrice || 0;

  useEffect(() => {
    if (borrowPrice > 0 && collateralPrice > 0) {
        const borrowValueUsd = borrowAmount * borrowPrice;
        const requiredCollateralUsd = borrowValueUsd / (ltv / 100);
        const calculatedCollateral = requiredCollateralUsd / collateralPrice;
        setCollateralAmount(parseFloat(calculatedCollateral.toFixed(6)));
    }
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
    if (!user) return showToast("Please login to post loan requests.", 'info');
    if (!lendingPoolContract || !signer) return showToast("Wallet not connected.", 'error');
    if (borrowAsset === collateralAsset) return showToast("Borrow and Collateral assets must be different.", 'error');

    // Check Balance
    const currentBal = userBalances[collateralAsset] || 0;
    if (currentBal < collateralAmount) {
        return showToast(`Insufficient ${collateralAsset} balance. You have ${currentBal.toFixed(4)}.`, 'error');
    }

    setIsLoading(true);
    setProcessStep('approving');

    try {
        const tokenAddress = (CONTRACT_ADDRESSES as any)[collateralAsset];
        const collateralWei = parseEther(collateralAmount.toFixed(18));
        
        // 1. Check Allowance & Approve if needed
        const tokenContract = new Contract(tokenAddress, ERC20_ABI, signer);
        const owner = await signer.getAddress();
        const allowance = await tokenContract.allowance(owner, CONTRACT_ADDRESSES.LendingPool);
        
        if (allowance < collateralWei) {
            showToast(`Authorization required for ${collateralAmount} ${collateralAsset}. Please sign...`, 'info');
            const approveTx = await tokenContract.approve(CONTRACT_ADDRESSES.LendingPool, collateralWei);
            await approveTx.wait();
            showToast("Collateral authorized! Proceeding to Loan Creation...", 'success');
        }

        setProcessStep('creating');

        // 2. Create Loan
        const principalWei = parseEther(borrowAmount.toString());
        const interestAmount = (borrowAmount * (parseFloat(insights.apy) / 100));
        const interestWei = parseEther(interestAmount.toFixed(18)); 
        const durationSeconds = parseInt(duration) * 24 * 60 * 60;

        showToast("Sign to broadcast Loan Request...", 'info');
        const tx = await lendingPoolContract.createLoanRequest(
            principalWei, 
            durationSeconds, 
            interestWei,
            tokenAddress,
            collateralWei
        );
        
        showToast("Transaction sent! Waiting for confirmation...", 'info');
        
        const receipt = await tx.wait();
        
        // PARSE LOGS TO GET LOAN ID
        let contractLoanId = -1;
        try {
            const log = receipt.logs.find((l: any) => {
                try {
                   return lendingPoolContract.interface.parseLog(l)?.name === 'LoanCreated';
                } catch { return false; }
            });
            if (log) {
                const parsed = lendingPoolContract.interface.parseLog(log);
                contractLoanId = Number(parsed?.args[0]); 
                console.log("Captured Loan ID:", contractLoanId);
            }
        } catch (e) {
            console.error("Failed to parse loan ID logs", e);
        }

        // 3. Success & Fireworks
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 }
        });
        
        // Firebase record
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
            txHash: receipt.hash,
            blockNumber: receipt.blockNumber,
            contractLoanId: contractLoanId // Critical for lending
        });
        
        setIsProcessing(true);
        setIsSuccess(true);
        fireConfetti();

    } catch (error: any) {
        console.error("Transaction Error:", error);
        if (error.code === 'ACTION_REJECTED') {
            showToast("Request cancelled by user.", 'info');
        } else if (error.message?.includes("allowance")) { // Simplified check
             showToast("Approval failed. Cannot proceed without collateral authorization.", 'error');
        } else {
            showToast("Transaction failed. Check console for details.", 'error');
        }
    } finally {
        setIsLoading(false);
        setProcessStep('');
    }
  };

  const selectedBorrow = SUPPORTED_ASSETS.find(a => a.symbol === borrowAsset);
  const selectedCollateral = SUPPORTED_ASSETS.find(a => a.symbol === collateralAsset);
  
  // Filter available collateral assets based on balance > 0
  const availableCollateralAssets = SUPPORTED_ASSETS.filter(a => (userBalances[a.symbol] || 0) > 0);
  // Fallback to show all if none have balance (for browsing) or just show all but disable? 
  // User requested "only show token which are available".
  // Better to just map available ones, but if list is empty show all? 
  const collateralList = availableCollateralAssets.length > 0 ? availableCollateralAssets : SUPPORTED_ASSETS;

  return (
    <section className="relative z-10 px-4 py-8 md:px-10 lg:px-40 max-w-[1440px] mx-auto min-h-screen">
      <ProcessingModal 
        isOpen={isProcessing} 
        onClose={() => { setIsProcessing(false); setIsSuccess(false); navigate('/dashboard'); }} 
        title="Request Submitted" 
        subtitle="Your loan is live on the QIE Marketplace." 
        successTitle="Loan Request Added!"
        successMessage="Your collateral is locked, and your request is waiting for a lender. Good luck!"
        isSuccess={isSuccess}
      />

      {/* Header ... */}
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
                {/* Borrow Input */}
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
                            {SUPPORTED_ASSETS.filter(a => ['QIE', 'USDT', 'WBTC'].includes(a.symbol)).map(asset => (
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

                {/* Collateral Input */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-white/80 uppercase tracking-wide">Required Collateral</label>
                    <span className="text-[10px] text-pink-400 font-bold uppercase tracking-widest">Auto-Synced</span>
                  </div>
                  <div className="relative">
                    <div className="bg-[#0f0518]/50 border border-white/5 rounded-xl flex items-center p-2">
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
                          <div className="absolute top-full right-0 mt-2 w-56 bg-[#1e0b2e] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in zoom-in-95 fade-in duration-200 max-h-60 overflow-y-auto">
                            {collateralList.map(asset => (
                              <button
                                key={asset.symbol}
                                type="button"
                                onClick={() => { setCollateralAsset(asset.symbol); setShowCollateralDropdown(false); }}
                                className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 text-sm font-bold text-white/70 hover:text-white transition-colors border-b border-white/5 last:border-0"
                              >
                                <div className="flex items-center gap-3">
                                  <span className={`material-symbols-outlined text-sm ${asset.color}`}>{asset.icon}</span>
                                  {asset.symbol}
                                </div>
                                <span className="text-[10px] text-white/40 font-mono">
                                   {(userBalances[asset.symbol] || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sliders & Duration ... keep existing structure */}
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

              {/* Unified Action Button */}
              <button 
                disabled={isLoading}
                className="w-full h-16 rounded-2xl bg-gradient-primary text-white font-black text-xl shadow-xl hover:shadow-pink-500/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-50" 
                type="submit"
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                      <div className="size-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-lg uppercase tracking-wide">
                          {processStep === 'approving' ? `Approving ${collateralAsset}...` : 'Creating Request...'}
                      </span>
                  </div>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-2xl">rocket_launch</span> Post to Marketplace
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
           {/* Insight Cards (Keep Existing) */}
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
