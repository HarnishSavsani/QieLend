import React, { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const LendPage: React.FC = () => {
  const { user } = useAuth();
  const [loans, setLoans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Listen to real-time updates for "pending" loans
    const q = query(collection(db, "loans"), where("status", "==", "pending"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loanData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      
      // Filter out user's own loans client-side to ensure they don't see themselves
      const filteredLoans = user 
        ? loanData.filter(loan => loan.borrowerId !== user.id)
        : loanData;

      setLoans(filteredLoans);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const [filterAsset, setFilterAsset] = useState<string>('ALL');
  const [filterRisk, setFilterRisk] = useState<string>('ALL');
  const [sortOption, setSortOption] = useState<string>('Newest');

  // Filter & Sort Logic
  const processedLoans = loans.filter(loan => {
      if (filterAsset !== 'ALL' && loan.asset !== filterAsset) return false;
      
      if (filterRisk !== 'ALL') {
          const risk = loan.ltv < 40 ? 'LOW' : loan.ltv < 65 ? 'MED' : 'HIGH';
          if (risk !== filterRisk) return false;
      }
      return true;
  }).sort((a, b) => {
      if (sortOption === 'Highest Yield') return b.apy - a.apy;
      if (sortOption === 'Lowest Risk') return a.ltv - b.ltv;
      // Default Newest (using createdAt seconds if available, else 0)
      return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
  });

  return (
    <div className="max-w-[1400px] mx-auto relative z-10 px-4 md:px-10 lg:px-20 py-8">
      <div className="flex flex-col lg:flex-row justify-between items-end gap-6 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-pink-500">pie_chart</span>
            <span className="text-xs font-bold text-pink-400 uppercase tracking-widest">Lender Hub</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white">Lending Marketplace</h1>
          <p className="text-white/60 mt-2">Fund peer-to-peer requests on QIE and earn high-yield APY.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* FILTER BAR */}
          <div className="flex flex-wrap items-center gap-3 p-1">
             {/* Asset Filter */}
             <div className="flex items-center gap-1 bg-[#1e0b2e]/60 border border-white/10 rounded-lg p-1">
                {['ALL', 'QIE', 'USDT', 'WBTC'].map(asset => (
                    <button
                        key={asset}
                        onClick={() => setFilterAsset(asset)}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${filterAsset === asset ? 'bg-pink-500 text-white shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                    >
                        {asset}
                    </button>
                ))}
             </div>

             {/* Risk Filter */}
             <select 
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value)}
                className="bg-[#1e0b2e]/60 border border-white/10 text-white/70 text-xs font-bold rounded-lg px-3 py-2 outline-none focus:border-pink-500/50"
             >
                <option value="ALL">All Risk Levels</option>
                <option value="LOW">Low Risk (LTV &lt; 40%)</option>
                <option value="MED">Medium Risk</option>
                <option value="HIGH">High Risk</option>
             </select>

             {/* Sort Filter */}
             <select 
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="bg-[#1e0b2e]/60 border border-white/10 text-white/70 text-xs font-bold rounded-lg px-3 py-2 outline-none focus:border-pink-500/50 ml-auto"
             >
                <option value="Newest">Newest Requests</option>
                <option value="Highest Yield">Highest Yield (APY)</option>
                <option value="Lowest Risk">Lowest Risk (LTV)</option>
             </select>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-[#1e0b2e]/20 rounded-2xl border border-white/5">
              <div className="size-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Syncing QIE Marketplace...</p>
            </div>
          ) : processedLoans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-[#1e0b2e]/20 rounded-2xl border border-white/5 text-center">
              <span className="material-symbols-outlined text-5xl text-white/20 mb-4">filter_list_off</span>
              <p className="text-white/60 font-bold">No loans match your filters.</p>
              <button onClick={() => { setFilterAsset('ALL'); setFilterRisk('ALL'); }} className="text-pink-400 text-sm font-bold mt-2 hover:underline">Clear Filters</button>
            </div>
          ) : (
            <div className="space-y-4">
              {processedLoans.map(loan => (
                <div key={loan.id} className="group relative bg-[#1e0b2e]/40 border border-white/10 rounded-2xl p-6 hover:bg-[#1e0b2e] hover:border-pink-500/30 transition-all duration-300">
                  <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="shrink-0 flex items-center gap-4">
                      <img src={loan.borrowerAvatar} className="size-12 rounded-full border border-pink-500/50" alt="" />
                      <div className="md:hidden">
                         <p className="text-white font-bold">{loan.borrowerName}</p>
                         <p className="text-[10px] text-white/40">Verified Borrower</p>
                      </div>
                    </div>
                    <div className="flex-grow grid grid-cols-2 md:grid-cols-4 gap-4 w-full text-center md:text-left">
                      <div>
                        <p className="text-[10px] text-white/40 mb-1">Borrowing</p>
                        <h3 className="text-lg font-bold text-white">{loan.amount.toLocaleString()} {loan.asset}</h3>
                      </div>
                      <div>
                        <p className="text-[10px] text-white/40 mb-1">Yield (APY)</p>
                        <h3 className="text-lg font-bold text-green-400">{loan.apy}%</h3>
                      </div>
                      <div>
                        <p className="text-[10px] text-white/40 mb-1">Term</p>
                        <h3 className="text-lg font-bold text-white">{loan.duration} Days</h3>
                      </div>
                      <div>
                        <p className="text-[10px] text-white/40 mb-1">Risk Factor</p>
                        <h3 className={`text-lg font-bold ${loan.ltv > 60 ? 'text-yellow-400' : 'text-green-400'}`}>{loan.ltv < 40 ? 'LOW' : loan.ltv < 65 ? 'MED' : 'HIGH'}</h3>
                      </div>
                    </div>
                    <div className="shrink-0 w-full md:w-auto flex flex-col gap-2">
                       <Link 
                         to={`/loan/${loan.id}`}
                         className="w-full block text-center px-8 py-3 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/50 font-bold hover:bg-purple-500 hover:text-white transition-all"
                       >
                          View Details
                       </Link>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                       <span className="text-white/60 text-xs">Collateral: <span className="text-white font-bold">{loan.collateralAmount} {loan.collateralAsset}</span></span>
                       {loan.contractLoanId !== undefined && (
                           <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-white/30">ID: #{loan.contractLoanId}</span>
                       )}
                    </div>
                    <div className="hidden md:block">
                      <span className="text-white/40 text-[10px]">Borrower: <span className="text-white font-bold">{loan.borrowerName}</span></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
           <div className="bg-[#1e0b2e]/60 border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Lender Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-black/20 rounded-xl">
                <span className="text-white/50 text-xs">Total Marketplace Volume</span>
                <span className="text-white font-bold">$1.2M</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-black/20 rounded-xl">
                <span className="text-white/50 text-xs">Average Yield</span>
                <span className="text-green-400 font-bold">12.4%</span>
              </div>
            </div>
            <p className="text-[10px] text-white/30 italic text-center mt-6 uppercase tracking-widest font-bold">Audited by QIE Security</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LendPage;
