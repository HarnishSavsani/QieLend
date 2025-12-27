
import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../config/firebase';
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useAuth } from '../context/AuthContext';

interface ActivityItem {
  id: string;
  category: 'Loan' | 'Wallet'; // High level category
  role: 'Borrower' | 'Lender' | 'Sender' | 'Receiver';
  asset: string;
  amount: number;
  status: string;
  date: Date;
  rawTimestamp: number; // For sorting
  details?: string;
}

const HistoryPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [filterAsset, setFilterAsset] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!user) return;

    setIsLoading(true);

    // 1. Fetch Loans (Borrower)
    const qBorrower = query(collection(db, "loans"), where("borrowerId", "==", user.id));
    
    // 2. Fetch Loans (Lender)
    const qLender = query(collection(db, "loans"), where("lenderId", "==", user.id));

    let borrowerLoans: ActivityItem[] = [];
    let lenderLoans: ActivityItem[] = [];

    const unsubBorrower = onSnapshot(qBorrower, (snap) => {
        borrowerLoans = snap.docs.map(doc => {
            const d = doc.data();
            
            if (d.type === 'wallet_tx') {
                 // Render as Wallet Transaction
                 return {
                    id: doc.id,
                    category: 'Wallet',
                    role: 'Sender',
                    asset: d.asset || 'QIE',
                    amount: Number(d.amount),
                    status: d.status,
                    date: d.createdAt?.toDate ? d.createdAt.toDate() : new Date(d.timestamp),
                    rawTimestamp: d.createdAt?.seconds || 0,
                    details: `To: ${d.to?.slice(0,6)}...${d.to?.slice(-4)}`
                 };
            }

            // Normal Loan
            return {
                id: doc.id,
                category: 'Loan',
                role: 'Borrower',
                asset: d.amountAsset || d.asset || 'QIE', // handle variations
                amount: Number(d.amount),
                status: d.status,
                date: d.createdAt?.toDate ? d.createdAt.toDate() : new Date(),
                rawTimestamp: d.createdAt?.seconds || 0,
                details: `Lender: ${d.lenderName || 'Pending'}`
            };
        });
        combineData();
    });

    const unsubLender = onSnapshot(qLender, (snap) => {
        lenderLoans = snap.docs.map(doc => {
            const d = doc.data();
            return {
                id: doc.id,
                category: 'Loan',
                role: 'Lender',
                asset: d.amountAsset || d.asset || 'QIE',
                amount: Number(d.amount),
                status: d.status,
                date: d.createdAt?.toDate ? d.createdAt.toDate() : new Date(),
                rawTimestamp: d.createdAt?.seconds || 0,
                details: `Borrower: ${d.borrowerName || 'Unknown'}`
            };
        });
        combineData();
    });

    const combineData = () => {
        const all = [...borrowerLoans, ...lenderLoans];
        all.sort((a, b) => b.rawTimestamp - a.rawTimestamp);
        setData(all);
        setIsLoading(false);
    };

    return () => {
        unsubBorrower();
        unsubLender();
    };
  }, [user]);

  // Derived Data (Filter & Search)
  const filteredData = useMemo(() => {
     return data.filter(item => {
         const matchesSearch = item.id.toLowerCase().includes(search.toLowerCase()) || 
                               item.details?.toLowerCase().includes(search.toLowerCase());
         const matchesRole = filterRole === 'All' || item.role === filterRole;
         const matchesAsset = filterAsset === 'All' || item.asset === filterAsset;
         const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
         
         return matchesSearch && matchesRole && matchesAsset && matchesStatus;
     });
  }, [data, search, filterRole, filterAsset, filterStatus]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const formatId = (id: string, cat: string) => {
      if (cat === 'Wallet') return `TX #${id.slice(0, 8)}...`;
      return `LN #${id.slice(0, 8)}...`;
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-10 py-8 lg:py-12 relative z-10 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">Activity History</h1>
          <p className="text-white/60">Comprehensive log of your loans, investments, and wallet transactions.</p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
          <div className="relative md:col-span-2 lg:col-span-2">
              <span className="material-symbols-outlined absolute left-3 top-3 text-white/30">search</span>
              <input 
                 type="text" 
                 placeholder="Search by ID or counterparty..." 
                 value={search}
                 onChange={e => setSearch(e.target.value)}
                 className="w-full bg-[#1e0b2e]/60 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:border-pink-500/50 outline-none"
              />
          </div>
          <FilterSelect value={filterRole} onChange={setFilterRole} options={['All', 'Borrower', 'Lender', 'Sender']} label="Role" />
          <FilterSelect value={filterAsset} onChange={setFilterAsset} options={['All', 'QIE', 'USDT', 'WBTC']} label="Asset" />
          <FilterSelect value={filterStatus} onChange={setFilterStatus} options={['All', 'active', 'repaid', 'defaulted', 'confirmed']} label="Status" />
      </div>

      <div className="bg-[#1e0b2e]/40 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md min-h-[400px]">
        {isLoading ? (
          <div className="p-20 text-center"><div className="size-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
        ) : filteredData.length === 0 ? (
          <div className="p-20 text-center text-white/30 flex flex-col items-center justify-center h-full">
            <span className="material-symbols-outlined text-4xl mb-4">history_off</span>
            <p className="font-bold text-sm">No activity found.</p>
            {search && <p className="text-xs mt-2 opacity-50">Try adjusting your filters.</p>}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#150720] border-b border-white/10">
                    <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-white/50">Details</th>
                    <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-white/50">Role</th>
                    <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-white/50">Asset</th>
                    <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-white/50 text-right">Amount</th>
                    <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-white/50 text-center">Status</th>
                    <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-white/50 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {paginatedData.map(item => (
                    <tr key={item.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                            <span className="text-white text-xs font-bold font-mono">{formatId(item.id, item.category)}</span>
                            <span className="text-[10px] text-white/40">{item.details}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`text-xs font-bold px-2 py-1 rounded border ${
                            item.role === 'Borrower' ? 'bg-pink-500/10 border-pink-500/20 text-pink-400' :
                            item.role === 'Lender' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' :
                            'bg-blue-500/10 border-blue-500/20 text-blue-400'
                        }`}>{item.role}</span>
                      </td>
                      <td className="py-4 px-6 text-white text-sm font-medium">{item.asset}</td>
                      <td className="py-4 px-6 text-right">
                        <p className="text-white font-bold text-sm">{item.amount.toLocaleString(undefined, { maximumFractionDigits: 4 })} <span className="text-[10px] text-white/40">{item.asset}</span></p>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="py-4 px-6 text-right">
                        <p className="text-white/60 text-xs">{item.date.toLocaleDateString()}</p>
                        <p className="text-white/30 text-[10px]">{item.date.toLocaleTimeString()}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center p-4 border-t border-white/10 bg-white/[0.02]">
                    <div className="text-xs text-white/40">
                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
                    </div>
                    <div className="flex gap-2">
                        <button 
                           onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                           disabled={currentPage === 1}
                           className="size-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-white"
                        >
                            <span className="material-symbols-outlined text-sm">chevron_left</span>
                        </button>
                        <span className="flex items-center justify-center px-3 text-xs font-bold text-white bg-white/5 rounded-lg border border-white/10">
                            Page {currentPage}
                        </span>
                        <button 
                           onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                           disabled={currentPage === totalPages}
                           className="size-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-white"
                        >
                            <span className="material-symbols-outlined text-sm">chevron_right</span>
                        </button>
                    </div>
                </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const FilterSelect = ({ value, onChange, options, label }: any) => (
    <div className="relative">
        <select 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-[#1e0b2e]/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-pink-500/50 outline-none cursor-pointer"
        >
            {options.map((opt: string) => (
                <option key={opt} value={opt} className="bg-[#1e0b2e]">{opt === 'All' ? `All ${label}s` : opt}</option>
            ))}
        </select>
        <span className="material-symbols-outlined absolute right-3 top-3 text-white/30 pointer-events-none text-sm">expand_more</span>
    </div>
);

const StatusBadge = ({ status }: { status: string }) => {
    let colorClass = 'bg-gray-500/10 border-gray-500/20 text-gray-400'; // Default
    
    if (status === 'active' || status === 'confirmed') colorClass = 'bg-green-500/10 border-green-500/20 text-green-400';
    if (status === 'repaid') colorClass = 'bg-blue-500/10 border-blue-500/20 text-blue-400';
    if (status === 'defaulted') colorClass = 'bg-red-500/10 border-red-500/20 text-red-400';
    if (status === 'pending') colorClass = 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400';

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${colorClass}`}>
            {status}
        </span>
    );
};

export default HistoryPage;
