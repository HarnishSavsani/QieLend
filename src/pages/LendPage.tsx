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
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-[#1e0b2e]/20 rounded-2xl border border-white/5">
              <div className="size-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Syncing QIE Marketplace...</p>
            </div>
          ) : loans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-[#1e0b2e]/20 rounded-2xl border border-white/5 text-center">
              <span className="material-symbols-outlined text-5xl text-white/20 mb-4">search_off</span>
              <p className="text-white/60 font-bold">No external loan requests found.</p>
              <p className="text-white/30 text-sm mt-2">Check back later or invite others to the platform!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {loans.map(loan => (
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
