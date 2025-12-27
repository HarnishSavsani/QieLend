
import React, { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, query, where, onSnapshot, getDocs } from "firebase/firestore";
import { useAuth } from '../context/AuthContext';

const HistoryPage: React.FC = () => {
  const { user } = useAuth();
  const [loans, setLoans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // We listen to both roles. 
    // In a real production app, we would use a unified "transactions" collection or a composite index.
    const qBorrower = query(collection(db, "loans"), where("borrowerId", "==", user.id));
    const qLender = query(collection(db, "loans"), where("lenderId", "==", user.id));

    let borrowerLoans: any[] = [];
    let lenderLoans: any[] = [];

    const unsubBorrower = onSnapshot(qBorrower, (snapshot) => {
      borrowerLoans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), role: 'Borrower' }));
      combineAndSort();
    });

    const unsubLender = onSnapshot(qLender, (snapshot) => {
      lenderLoans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), role: 'Lender' }));
      combineAndSort();
    });

    const combineAndSort = () => {
        const combined = [...borrowerLoans, ...lenderLoans];
        // Sort by timestamp if available, else by ID
        combined.sort((a, b) => {
           const timeA = a.createdAt?.seconds || 0;
           const timeB = b.createdAt?.seconds || 0;
           return timeB - timeA;
        });
        setLoans(combined);
        setIsLoading(false);
    };

    return () => {
      unsubBorrower();
      unsubLender();
    };
  }, [user]);

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-10 py-8 lg:py-12 relative z-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">Loan Activity</h1>
          <p className="text-white/60">Real-time history of your peer-to-peer interactions on QIE Chain.</p>
        </div>
      </div>

      <div className="bg-[#1e0b2e]/40 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
        {isLoading ? (
          <div className="p-20 text-center"><div className="size-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
        ) : loans.length === 0 ? (
          <div className="p-20 text-center text-white/30 flex flex-col items-center">
            <span className="material-symbols-outlined text-4xl mb-4">history</span>
            <p className="font-bold text-sm">No activity recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#150720] border-b border-white/10">
                  <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-white/50">Loan ID</th>
                  <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-white/50">Role</th>
                  <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-white/50">Asset</th>
                  <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-white/50 text-right">Amount</th>
                  <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-white/50">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loans.map(tx => (
                  <tr key={tx.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6">
                      <p className="text-white/40 text-[10px] font-mono">#ID...{tx.id.slice(-6)}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`text-sm font-bold ${tx.role === 'Borrower' ? 'text-pink-400' : 'text-purple-400'}`}>{tx.role}</span>
                    </td>
                    <td className="py-4 px-6 text-white text-sm">{tx.asset}</td>
                    <td className="py-4 px-6 text-right">
                      <p className="text-white font-bold text-sm">{tx.amount.toLocaleString()} {tx.asset}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase ${
                        tx.status === 'repaid' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 
                        tx.status === 'active' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 
                        tx.status === 'defaulted' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 
                        'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
