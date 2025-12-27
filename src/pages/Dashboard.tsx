
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../config/firebase';
import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";
import { useAuth } from '../context/AuthContext';
import { MOCK_TRANSACTIONS } from '../config/constants';

import { formatEther, Contract, JsonRpcProvider } from 'ethers';
import { CONTRACT_ADDRESSES, TRUST_SCORE_ABI, QIE_CHAIN_CONFIG } from '../config/blockchain';

const Dashboard: React.FC = () => {
  const { user, provider } = useAuth();
  const [myLoans, setMyLoans] = useState<any[]>([]);
  const [myInvestments, setMyInvestments] = useState<any[]>([]);
  
  const [loadingLoans, setLoadingLoans] = useState(true);
  const [loadingInvestments, setLoadingInvestments] = useState(true);
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
      setLoadingLoans(false);
    });

    const qInvested = query(collection(db, "loans"), where("lenderId", "==", user.id));
    const unsubInvested = onSnapshot(qInvested, (snapshot) => {
      setMyInvestments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoadingInvestments(false);
    });

    return () => {
      unsubBorrowed();
      unsubInvested();
    };
  }, [user]);

  // DERIVED DATA: Separate actual Loans from Wallet Transactions (Piggyback strategy)
  // DERIVED DATA: Separate actual Loans from Wallet Transactions (Piggyback strategy)
  const realLoans = myLoans.filter(d => d.type !== 'wallet_tx');
  const walletTxs = myLoans.filter(d => d.type === 'wallet_tx')
                               .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const totalBorrowed = realLoans.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
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

        <div className="flex flex-col gap-6">
          
          {/* Row 1: Borrowing (50%) & Lending (50%) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* My Borrowing */}
              <div className="glass-panel rounded-2xl overflow-hidden flex flex-col max-h-[400px]">
                <div className="p-6 border-b border-white/5 flex justify-between items-center shrink-0">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-pink-400">gavel</span> Borrowing
                  </h3>
                  <Link className="text-xs text-pink-300 hover:text-white transition-colors" to="/history">View All</Link>
                </div>
                <div className="overflow-y-auto overflow-x-hidden custom-scrollbar flex-1">
                    {loadingLoans ? (
                      <div className="p-10 flex justify-center"><div className="size-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div></div>
                    ) : realLoans.length === 0 ? (
                      <div className="p-10 text-center text-white/30 text-sm">No active loan requests.</div>
                    ) : (
                      realLoans.map(loan => (
                        <Link to={`/loan/${loan.id}`} key={loan.id} className="block p-5 border-b border-white/5 hover:bg-white/5 transition-colors">
                          <div className="flex justify-between items-center">
                              <div className="flex items-center gap-4">
                                  {/* Icon Container */}
                                  <div className={`size-10 rounded-full flex items-center justify-center shrink-0 ${
                                      loan.status === 'repaid' ? 'bg-green-500/10 text-green-400' : 
                                      loan.status === 'active' ? 'bg-blue-500/10 text-blue-400' : 
                                      loan.status === 'defaulted' ? 'bg-red-500/10 text-red-500' :
                                      'bg-yellow-500/10 text-yellow-400'
                                  }`}>
                                      <span className="material-symbols-outlined text-[20px]">{
                                          loan.status === 'repaid' ? 'check' : 
                                          loan.status === 'active' ? 'play_arrow' : 
                                          loan.status === 'defaulted' ? 'error' :
                                          'hourglass_empty'
                                      }</span>
                                  </div>
                                  <div>
                                      <h4 className="text-white font-bold text-sm">{loan.amount.toLocaleString()} {loan.asset}</h4>
                                      <p className="text-[10px] text-white/40">Collateral: {loan.collateralAmount} {loan.collateralAsset}</p>
                                  </div>
                              </div>
                              <div className="text-right">
                                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${
                                      loan.status === 'repaid' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                                      loan.status === 'active' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 
                                      loan.status === 'defaulted' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                      'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                  }`}>{loan.status}</span>
                              </div>
                          </div>
                        </Link>
                      ))
                    )}
                </div>
              </div>

              {/* My Lending */}
              <div className="glass-panel rounded-2xl overflow-hidden flex flex-col max-h-[400px]">
                <div className="p-6 border-b border-white/5 flex justify-between items-center shrink-0">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-purple-400">payments</span> Lending
                  </h3>
                  <Link className="text-xs text-pink-300 hover:text-white transition-colors" to="/history">View All</Link>
                </div>
                <div className="overflow-y-auto overflow-x-hidden custom-scrollbar flex-1">
                    {loadingInvestments ? (
                      <div className="p-10 flex justify-center"><div className="size-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div></div>
                    ) : myInvestments.length === 0 ? (
                      <div className="p-10 text-center text-white/30 text-sm">You haven't funded any loans yet.</div>
                    ) : (
                      myInvestments.map(loan => (
                        <Link to={`/loan/${loan.id}`} key={loan.id} className="block p-5 border-b border-white/5 hover:bg-white/5 transition-colors">
                           <div className="flex justify-between items-center">
                              <div className="flex items-center gap-4">
                                 {/* Icon Container */}
                                 <div className="size-10 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0 border border-purple-500/20">
                                     <span className="font-bold text-purple-400 text-sm">{loan.borrowerName?.charAt(0)}</span>
                                 </div>
                                 <div className="overflow-hidden">
                                    <p className="text-sm font-bold text-white truncate">To: {loan.borrowerName}</p>
                                    <p className="text-[10px] text-white/40 truncate">{loan.amount} {loan.asset} @ {loan.apy}%</p>
                                 </div>
                              </div>
                              <div className="text-right">
                                 <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${
                                   loan.status === 'active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                                   loan.status === 'repaid' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 
                                   loan.status === 'defaulted' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                   'bg-white/10 text-white/50 border border-white/10'
                                 }`}>
                                   {loan.status === 'active' ? 'Earning' : loan.status}
                                 </span>
                              </div>
                           </div>
                        </Link>
                      ))
                    )}
                </div>
              </div>
          </div>

          {/* Row 2: Wallet Activity (70%) & Quick Actions (30%) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Wallet Activity (lg:col-span-2 = 67%) */}
              <div className="lg:col-span-2 glass-panel rounded-2xl overflow-hidden flex flex-col max-h-[300px]">
                 <div className="p-6 border-b border-white/5 flex justify-between items-center shrink-0">
                   <h3 className="text-lg font-bold text-white flex items-center gap-2">
                     <span className="material-symbols-outlined text-green-400">history</span> Wallet Activity
                   </h3>
                   <Link className="text-xs text-pink-300 hover:text-white transition-colors" to="/history">View All</Link>
                 </div>
                 <div className="overflow-y-auto overflow-x-hidden custom-scrollbar flex-1">
                     {loadingLoans ? (
                       <div className="p-10 flex justify-center"><div className="size-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div></div>
                     ) : walletTxs.length === 0 ? (
                       <div className="p-10 text-center text-white/30 text-sm">No recent transactions.</div>
                     ) : (
                       walletTxs.map(tx => (
                         <div key={tx.id} className="block p-5 border-b border-white/5 hover:bg-white/5 transition-colors">
                            <div className="flex justify-between items-center">
                               <div className="flex items-center gap-4">
                                  {/* Icon Container */}
                                  <div className="size-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                                     <span className="material-symbols-outlined text-[20px] text-white/60">arrow_outward</span>
                                  </div>
                                  <div>
                                     <p className="text-sm font-bold text-white">Sent {tx.amount} {tx.asset}</p>
                                     <p className="text-[10px] text-white/40">To: {tx.to?.slice(0, 6)}...{tx.to?.slice(-4)}</p>
                                  </div>
                               </div>
                               <div className="text-right">
                                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border ${
                                      tx.status === 'confirmed' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-white/10 text-white/50 border-white/10'
                                  }`}>
                                    {tx.status}
                                  </span>
                                  <p className="text-[10px] text-white/30 mt-1">{new Date(tx.timestamp).toLocaleDateString()}</p>
                               </div>
                            </div>
                         </div>
                       ))
                     )}
                 </div>
              </div>

              {/* Quick Actions (lg:col-span-1 = 33%) */}
              <div className="lg:col-span-1 glass-panel p-6 rounded-2xl flex flex-col justify-center">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-yellow-400">bolt</span> Quick Actions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                  <Link to="/lend" className="flex items-center gap-4 p-4 rounded-xl bg-[#0f0518] border border-white/5 hover:border-pink-500/30 transition-all group">
                    <div className="size-10 rounded-full bg-pink-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-pink-400">search</span>
                    </div>
                    <span className="text-sm font-bold text-white/80">Find Loans</span>
                  </Link>
                  <Link to="/borrow" className="flex items-center gap-4 p-4 rounded-xl bg-[#0f0518] border border-white/5 hover:border-pink-500/30 transition-all group">
                    <div className="size-10 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-blue-400">add_circle</span>
                    </div>
                    <span className="text-sm font-bold text-white/80">Request Loan</span>
                  </Link>
                  <Link to="/wallet" className="flex items-center gap-4 p-4 rounded-xl bg-[#0f0518] border border-white/5 hover:border-pink-500/30 transition-all group">
                    <div className="size-10 rounded-full bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-purple-400">account_balance_wallet</span>
                    </div>
                    <span className="text-sm font-bold text-white/80">Wallet</span>
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
