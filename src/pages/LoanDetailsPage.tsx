
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../config/firebase';
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useAuth } from '../context/AuthContext';
import ProcessingModal from '../components/ProcessingModal';

const LoanDetailsPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, showToast } = useAuth();
  const [loan, setLoan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchLoan = async () => {
      if (!id) return;
      try {
        const docSnap = await getDoc(doc(db, "loans", id));
        if (docSnap.exists()) {
          setLoan({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLoan();
  }, [id]);

  const handleFund = async () => {
    if (!user || !loan || !id) return showToast("Please log in first", "info");
    if (loan.borrowerId === user.id) return showToast("You cannot fund your own loan request.", "error");
    
    setIsLoading(true);
    try {
      await updateDoc(doc(db, "loans", id), {
        status: 'active',
        lenderId: user.id,
        lenderName: `${user.firstName} ${user.lastName}`
      });
      setIsProcessing(true);
    } catch (err) {
      console.error(err);
      showToast("Funding failed. Blockchain congestion detected.", "error");
      setIsLoading(false);
    }
  };

  if (isLoading && !isProcessing) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="size-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!loan) return <div className="p-20 text-center text-white">Loan not found.</div>;

  const isSelfLoan = user?.id === loan.borrowerId;

  return (
    <div className="max-w-[1200px] mx-auto pt-8 pb-16 px-4 md:px-10 relative z-10">
      <ProcessingModal 
        isOpen={isProcessing} 
        onClose={() => navigate('/dashboard')} 
        title="Signing Contract" 
        subtitle="Escrowing funds and securing collateral on-chain..." 
      />

      <div className="flex items-center gap-2 text-[10px] text-white/50 mb-6 uppercase tracking-wider">
        <Link className="hover:text-pink-400" to="/lend">Marketplace</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-white">Loan #{loan.id.slice(0, 6)}</span>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-white/5 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-black text-white tracking-tight">{loan.amount.toLocaleString()} {loan.asset}</h1>
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
              loan.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'
            }`}>
              {loan.status.toUpperCase()}
            </span>
            {isSelfLoan && (
              <span className="bg-white/10 text-white/60 text-[10px] font-bold px-2 py-1 rounded border border-white/10">YOUR REQUEST</span>
            )}
          </div>
          <p className="text-sm text-white/60">Verified Request on QIE Protocol</p>
        </div>
        <div className="flex gap-3">
          {loan.status === 'pending' && (
            <button 
              disabled={isProcessing || isSelfLoan}
              onClick={handleFund}
              className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-sm shadow-lg transition-all ${
                isSelfLoan 
                ? 'bg-white/5 text-white/30 cursor-not-allowed border border-white/10' 
                : 'bg-gradient-primary text-white hover:scale-105 shadow-pink-500/20'
              }`}
            >
              {isProcessing ? <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : isSelfLoan ? 'Cannot Fund Own Loan' : 'Fund This Loan'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <InfoBox label="Principal" value={`${loan.amount} ${loan.asset}`} />
            <InfoBox label="Interest (APY)" value={`${loan.apy}%`} valueColor="text-green-400" />
            <InfoBox label="Term" value={`${loan.duration} Days`} />
            <InfoBox label="LTV Ratio" value={`${loan.ltv}%`} />
          </div>

          <div className="bg-[#1e0b2e]/60 border border-white/5 rounded-2xl p-8 relative overflow-hidden">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-400">verified_user</span> Collateral Assets
            </h3>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                 <div className="size-10 rounded-full bg-white/5 flex items-center justify-center">
                    <span className="material-symbols-outlined text-yellow-500">currency_bitcoin</span>
                 </div>
                 <div>
                    <span className="text-2xl font-black text-white">{loan.collateralAmount} {loan.collateralAsset}</span>
                    <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Locked for Lender Safety</p>
                 </div>
              </div>
            </div>
            <div className="mt-6 p-4 rounded-xl bg-pink-500/5 border border-pink-500/10 text-xs text-white/50 leading-relaxed">
              This collateral is automatically escrowed in a QIE Chain smart contract. If the borrower defaults, the collateral is liquidated to protect the lender's principal.
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#1e0b2e]/60 border border-white/5 rounded-2xl p-6">
            <h3 className="text-xs font-black text-white/30 uppercase tracking-widest mb-6">Borrower Stats</h3>
            <div className="flex items-center gap-4 mb-6">
              <img className="size-14 rounded-full border-2 border-pink-500/50" src={loan.borrowerAvatar} alt="Borrower" />
              <div>
                <p className="font-bold text-white text-lg">{loan.borrowerName}</p>
                <div className="flex items-center gap-1">
                   <span className="material-symbols-outlined text-[14px] text-green-400">verified</span>
                   <span className="text-[10px] text-green-400 font-bold uppercase">KYC Verified</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
               <div className="flex justify-between items-center text-sm">
                  <span className="text-white/40">Total Loans</span>
                  <span className="text-white font-bold">12</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                  <span className="text-white/40">Repayment Rate</span>
                  <span className="text-white font-bold">100%</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoBox = ({ label, value, valueColor = "text-white" }: any) => (
  <div className="bg-[#1e0b2e]/60 border border-white/5 rounded-2xl p-5">
    <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">{label}</p>
    <p className={`text-xl font-black ${valueColor}`}>{value}</p>
  </div>
);

export default LoanDetailsPage;
