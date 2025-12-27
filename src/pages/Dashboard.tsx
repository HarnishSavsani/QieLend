
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../config/firebase';
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useAuth } from '../context/AuthContext';
import { MOCK_TRANSACTIONS } from '../config/constants';

import { formatEther, Contract, JsonRpcProvider } from 'ethers';
import { CONTRACT_ADDRESSES, TRUST_SCORE_ABI, QIE_CHAIN_CONFIG } from '../config/blockchain';

const Dashboard: React.FC = () => {
  const { user, provider } = useAuth();
  const [myLoans, setMyLoans] = useState<any[]>([]);
  const [myInvestments, setMyInvestments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [balance, setBalance] = useState<string>("0.0");
  const [trustScore, setTrustScore] = useState<number>(100);

  useEffect(() => {
    if (provider && user?.walletAddress) {
      const fetchBalance = async () => {
        try {
          const bal = await provider.getBalance(user.walletAddress!);
          setBalance(formatEther(bal));
        } catch (err) {
          console.error("Error fetching balance:", err);
        }
      };
      fetchBalance();
      
      // Fetch on-chain trust score (with Firebase fallback)
      const fetchTrustScore = async () => {
        try {
          const rpcProvider = new JsonRpcProvider(QIE_CHAIN_CONFIG.rpcUrls[0]);
          const trustContract = new Contract(CONTRACT_ADDRESSES.TrustToken, TRUST_SCORE_ABI, rpcProvider);
          const score = await trustContract.getScore(user.walletAddress);
          setTrustScore(Math.min(100, Number(score)));
        } catch (err) {
          console.error("Error fetching on-chain trust score, using Firebase cache:", err);
          // Fallback to Firebase cached value if available
          if (user?.trustScore !== undefined) {
            setTrustScore(user.trustScore);
          }
        }
      };
      fetchTrustScore();
    }
  }, [provider, user?.walletAddress]);

  useEffect(() => {
    if (!user) return;

    const qBorrowed = query(collection(db, "loans"), where("borrowerId", "==", user.id));
    const unsubBorrowed = onSnapshot(qBorrowed, (snapshot) => {
      setMyLoans(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const qInvested = query(collection(db, "loans"), where("lenderId", "==", user.id));
    const unsubInvested = onSnapshot(qInvested, (snapshot) => {
      setMyInvestments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setIsLoading(false);
    });

    return () => {
      unsubBorrowed();
      unsubInvested();
    };
  }, [user]);

  const totalBorrowed = myLoans.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const totalInvested = myInvestments.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 lg:px-8 py-8 overflow-x-hidden min-h-[calc(100vh-80px)]">
      {/* Background Blurs wrapped in a clip container */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] -translate-y-1/4 translate-x-1/4"></div>
      </div>
      
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Welcome back, {user?.firstName}! 👋</h1>
            <p className="text-white/50 text-sm">Here is your real-time QIE portfolio overview.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/borrow" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-primary text-white text-sm font-bold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all">
              <span className="material-symbols-outlined text-lg">add</span> New Loan Request
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SummaryCard title="Wallet Balance" value={`${parseFloat(balance).toFixed(4)} QIE`} icon="account_balance_wallet" iconColor="text-blue-400" />
          <SummaryCard title="Net Borrowed" value={`$${totalBorrowed.toLocaleString()}`} icon="credit_card" iconColor="text-pink-500" />
          <SummaryCard title="Invested Capital" value={`$${totalInvested.toLocaleString()}`} subValue="Active Earnings" icon="savings" iconColor="text-purple-500" />
          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group bg-gradient-to-br from-[#1e0b2e] to-[#2d1b42]">
            <div className="absolute -right-6 -top-6 bg-gradient-primary w-24 h-24 blur-[40px] rounded-full opacity-40"></div>
            <p className="text-white/50 text-sm font-medium mb-1">QIE Trust Score</p>
            <div className="flex items-end gap-2 mb-2">
              <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-pink-200">{trustScore}</h3>
              <span className="text-sm font-bold text-pink-400 mb-1.5">/ 100</span>
            </div>
            <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
               <div className="bg-gradient-primary h-full" style={{ width: `${trustScore}%` }}></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-pink-400">gavel</span> My Borrowing
                </h3>
                <Link className="text-xs text-pink-300 hover:text-white transition-colors" to="/history">View All</Link>
              </div>
              {isLoading ? (
                <div className="p-10 flex justify-center"><div className="size-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div></div>
              ) : myLoans.length === 0 ? (
                <div className="p-10 text-center text-white/30 text-sm">No active loan requests.</div>
              ) : (
                myLoans.map(loan => (
                  <Link to={`/loan/${loan.id}`} key={loan.id} className="block p-5 border-b border-white/5 hover:bg-white/5 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`size-10 rounded-full flex items-center justify-center ${
                          loan.status === 'repaid' ? 'bg-green-500/20 text-green-400' : 
                          loan.status === 'active' ? 'bg-blue-500/20 text-blue-400' : 
                          loan.status === 'defaulted' ? 'bg-red-500/20 text-red-400' : 
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          <span className="material-symbols-outlined">{
                            loan.status === 'repaid' ? 'check_circle' : 
                            loan.status === 'active' ? 'play_circle' : 
                            loan.status === 'defaulted' ? 'error' : 
                            'hourglass_top'
                          }</span>
                        </div>
                        <div>
                          <h4 className="text-white font-bold">{loan.amount.toLocaleString()} {loan.asset}</h4>
                          <p className="text-xs text-white/50">Status: <span className={`capitalize ${
                            loan.status === 'repaid' ? 'text-green-400' : 
                            loan.status === 'active' ? 'text-blue-400' : 
                            loan.status === 'defaulted' ? 'text-red-400' : 
                            'text-yellow-400'
                          }`}>{loan.status}</span></p>
                        </div>
                      </div>
                      <div className="text-right">
                         <p className="text-xs text-white/40">Collateral</p>
                         <p className="text-sm font-bold text-white">{loan.collateralAmount} {loan.collateralAsset}</p>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>

            <div className="glass-panel rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-purple-400">payments</span> My Lending Portfolio
                </h3>
              </div>
              {isLoading ? (
                <div className="p-10 flex justify-center"><div className="size-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div></div>
              ) : myInvestments.length === 0 ? (
                <div className="p-10 text-center text-white/30 text-sm">You haven't funded any loans yet.</div>
              ) : (
                myInvestments.map(loan => (
                  <Link to={`/loan/${loan.id}`} key={loan.id} className="block p-5 border-b border-white/5 hover:bg-white/5 transition-colors">
                     <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                           <img src={loan.borrowerAvatar} className="size-8 rounded-full" alt="" />
                           <div>
                              <p className="text-sm font-bold text-white">Lending to {loan.borrowerName}</p>
                              <p className="text-[10px] text-white/40">{loan.amount} {loan.asset} @ {loan.apy}% APY</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <span className={`text-xs font-bold ${
                             loan.status === 'active' ? 'text-green-400' : 
                             loan.status === 'repaid' ? 'text-blue-400' : 
                             loan.status === 'defaulted' ? 'text-red-400' : 'text-white/50'
                           }`}>
                             {loan.status === 'active' ? 'Earning' : 
                              loan.status === 'repaid' ? 'Repaid' : 
                              loan.status === 'defaulted' ? 'Defaulted' : loan.status}
                           </span>
                        </div>
                     </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-2xl">
              <h3 className="text-lg font-bold text-white mb-6">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <Link to="/lend" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[#0f0518] border border-white/5 hover:border-pink-500/30 transition-all group text-center">
                  <span className="material-symbols-outlined text-pink-400 group-hover:scale-110 transition-transform">search</span>
                  <span className="text-[10px] font-bold uppercase text-white/60">Find Loans</span>
                </Link>
                <Link to="/wallet" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[#0f0518] border border-white/5 hover:border-pink-500/30 transition-all group text-center">
                  <span className="material-symbols-outlined text-purple-400 group-hover:scale-110 transition-transform">account_balance_wallet</span>
                  <span className="text-[10px] font-bold uppercase text-white/60">Wallet</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ title, value, subValue, subDesc, icon, iconColor = "text-white" }: any) => (
  <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
    <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${iconColor}`}>
      <span className="material-symbols-outlined text-6xl">{icon}</span>
    </div>
    <p className="text-white/50 text-sm font-medium mb-1">{title}</p>
    <h3 className="text-3xl font-black text-white mb-2">{value}</h3>
    {subValue && (
      <div className="flex items-center gap-2">
        <span className="text-purple-300 font-bold text-sm">{subValue}</span>
        <span className="text-white/40 text-[10px]">{subDesc}</span>
      </div>
    )}
    {!subValue && subDesc && <p className="text-[10px] text-white/40">{subDesc}</p>}
  </div>
);

export default Dashboard;
