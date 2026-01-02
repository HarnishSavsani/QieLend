import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../config/firebase';
import { doc, onSnapshot, collection, query, where, getDocs } from "firebase/firestore";
import { useUserStats } from '../hooks/useUserStats';

const ProfilePage: React.FC = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBorrowed: 0,
    totalLent: 0
  });
  const [borrowingHistory, setBorrowingHistory] = useState<any[]>([]);
  const [lendingHistory, setLendingHistory] = useState<any[]>([]);
  
  // Filter State
  const [borrowFilter, setBorrowFilter] = useState<string>('all');
  const [lendFilter, setLendFilter] = useState<string>('all');
  
  const statusFilters = ['all', 'pending', 'active', 'repaid', 'defaulted'];

  // 1. Fetch User Profile
  useEffect(() => {
    if (!userId) return;

    // Real-time listener for User Profile
    const unsubscribe = onSnapshot(doc(db, "users", userId), (docSnap) => {
        if (docSnap.exists()) {
            setUser(docSnap.data());
        } else {
            setUser(null); // Triggers not found UI
            setIsLoading(false);
        }
    }, (err) => {
        console.error("Failed to subscribe:", err);
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  // 2. Use Hook for Trust Score (Contract Only)
  // We pass the wallet address from the user profile once loaded
  const { trustScore, loading: scoreLoading } = useUserStats(user?.walletAddress);

  // 3. Fetch History & Calculate Totals
  useEffect(() => {
    if (!user || !userId) return;

    const fetchHistory = async () => {
      try {
        // Fetch Borrowing History
        const borrowQuery = query(collection(db, "loans"), where("borrowerId", "==", userId));
        const borrowSnap = await getDocs(borrowQuery);
        const borrowLoans = borrowSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setBorrowingHistory(borrowLoans);

        // Fetch Lending History
        const lendQuery = query(collection(db, "loans"), where("lenderId", "==", userId));
        const lendSnap = await getDocs(lendQuery);
        const lendLoans = lendSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setLendingHistory(lendLoans);

        // Calculate Totals
        const totalBorrowed = borrowLoans.reduce((acc, l: any) => acc + Number(l.amount || 0), 0);
        const totalLent = lendLoans.reduce((acc, l: any) => acc + Number(l.amount || 0), 0);
        
        setStats({
          totalBorrowed,
          totalLent
        });

      } catch (e) {
        console.error("Failed to fetch profile history:", e);
      }
      setIsLoading(false);
    };

    fetchHistory();
  }, [user, userId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="size-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-white/20 mb-4">person_off</span>
          <p className="text-white/40">User not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-10 py-8 lg:py-12 relative z-10">
      {/* Back Navigation */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-white/60 hover:text-pink-400 transition-colors mb-6 group"
      >
        <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
        <span className="text-sm font-bold">Back</span>
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-10">
        <img 
          src={user.avatar} 
          alt={`${user.firstName} ${user.lastName}`}
          className="size-24 rounded-full border-4 border-pink-500/50"
        />
        <div>
          <h1 className="text-3xl font-black text-white mb-2">{user.firstName} {user.lastName}</h1>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-white/40 font-mono bg-white/5 px-3 py-1 rounded-full">
              {user.walletAddress ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}` : 'No Wallet Linked'}
            </span>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-green-400">verified</span>
              <span className="text-[10px] text-green-400 font-bold uppercase">KYC Verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard 
          label="Trust Score" 
          value={scoreLoading ? "..." : (trustScore !== null ? `${trustScore}/100` : "N/A")} 
          color={(trustScore || 0) >= 80 ? 'text-green-400' : (trustScore || 0) >= 50 ? 'text-yellow-400' : 'text-red-400'}
        />
        <StatCard label="Total Borrowed" value={`${stats.totalBorrowed.toLocaleString()} QIE`} />
        <StatCard label="Total Lent" value={`${stats.totalLent.toLocaleString()} QIE`} />
        <StatCard label="Total Loans" value={borrowingHistory.length.toString()} />
      </div>

      {/* History Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Borrowing History */}
        <div className="bg-[#1e0b2e]/60 border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-pink-400">gavel</span>
              Borrowing History
            </h3>
            <select
              value={borrowFilter}
              onChange={(e) => setBorrowFilter(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-bold text-white/80 focus:border-pink-500 outline-none cursor-pointer appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '14px', paddingRight: '28px' }}
            >
              {statusFilters.map((status) => (
                <option key={status} value={status} className="bg-[#1e0b2e] text-white">
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
          {borrowingHistory.filter(l => borrowFilter === 'all' || l.status === borrowFilter).length === 0 ? (
            <div className="p-10 text-center text-white/30 text-sm">No {borrowFilter === 'all' ? '' : borrowFilter} loans found.</div>
          ) : (
            <div className="divide-y divide-white/5 max-h-[300px] overflow-y-auto">
              {borrowingHistory
                .filter(l => borrowFilter === 'all' || l.status === borrowFilter)
                .map((loan: any) => (
                <Link to={`/loan/${loan.id}`} key={loan.id} className="block p-4 hover:bg-white/5 transition-colors">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-bold">{loan.amount} {loan.asset}</p>
                      <p className="text-[10px] text-white/40">{loan.duration} Days @ {loan.apy}% APY</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                      loan.status === 'repaid' ? 'bg-green-500/10 text-green-400' :
                      loan.status === 'active' ? 'bg-blue-500/10 text-blue-400' :
                      loan.status === 'defaulted' ? 'bg-red-500/10 text-red-400' :
                      'bg-yellow-500/10 text-yellow-400'
                    }`}>
                      {loan.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Lending History */}
        <div className="bg-[#1e0b2e]/60 border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-400">payments</span>
              Lending History
            </h3>
            <select
              value={lendFilter}
              onChange={(e) => setLendFilter(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-bold text-white/80 focus:border-purple-500 outline-none cursor-pointer appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '14px', paddingRight: '28px' }}
            >
              {statusFilters.map((status) => (
                <option key={status} value={status} className="bg-[#1e0b2e] text-white">
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
          {lendingHistory.filter(l => lendFilter === 'all' || l.status === lendFilter).length === 0 ? (
            <div className="p-10 text-center text-white/30 text-sm">No {lendFilter === 'all' ? '' : lendFilter} investments found.</div>
          ) : (
            <div className="divide-y divide-white/5 max-h-[300px] overflow-y-auto">
              {lendingHistory
                .filter(l => lendFilter === 'all' || l.status === lendFilter)
                .map((loan: any) => (
                <Link to={`/loan/${loan.id}`} key={loan.id} className="block p-4 hover:bg-white/5 transition-colors">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-bold">{loan.amount} {loan.asset}</p>
                      <p className="text-[10px] text-white/40">To: {loan.borrowerName}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                      loan.status === 'repaid' ? 'bg-green-500/10 text-green-400' :
                      loan.status === 'active' ? 'bg-blue-500/10 text-blue-400' :
                      loan.status === 'defaulted' ? 'bg-red-500/10 text-red-400' :
                      'bg-yellow-500/10 text-yellow-400'
                    }`}>
                      {loan.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, color = "text-white" }: { label: string, value: string, color?: string }) => (
  <div className="bg-[#1e0b2e]/60 border border-white/5 rounded-2xl p-5">
    <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">{label}</p>
    <p className={`text-xl font-black ${color}`}>{value}</p>
  </div>
);

export default ProfilePage;
