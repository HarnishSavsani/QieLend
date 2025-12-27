
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../config/firebase';
import { doc, getDoc, updateDoc, onSnapshot, collection, query, where, getDocs } from "firebase/firestore";
import { useAuth } from '../context/AuthContext';
import ProcessingModal from '../components/ProcessingModal';

import { parseEther, Contract, formatEther, JsonRpcProvider } from 'ethers';
import { ERC20_ABI, CONTRACT_ADDRESSES, TRUST_SCORE_ABI, QIE_CHAIN_CONFIG } from '../config/blockchain';

import confetti from 'canvas-confetti';

const LoanDetailsPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, showToast, lendingPoolContract, signer } = useAuth();
  const [loan, setLoan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [borrower, setBorrower] = useState<any>(null);
  const [lender, setLender] = useState<any>(null);
  
  // Borrower Stats (Dynamic)
  const [borrowerStats, setBorrowerStats] = useState({
    trustScore: 100,
    totalLoans: 0,
    repaymentRate: 100
  });

  // Modal State
  const [modalTitle, setModalTitle] = useState("Processing Transaction");
  const [modalSubtitle, setModalSubtitle] = useState("Please confirm in your wallet...");
  const [successTitle, setSuccessTitle] = useState("Success!");
  const [successSubtitle, setSuccessSubtitle] = useState("Transaction confirmed.");

  useEffect(() => {
    if (!id) return;

    // Real-time listener for the Loan Document
    const unsubscribe = onSnapshot(doc(db, "loans", id), async (docSnap) => {
        if (docSnap.exists()) {
             const loanData: any = { id: docSnap.id, ...docSnap.data() };
             setLoan(loanData);
             
             // Fetch Borrower Profile
             if (loanData.borrowerId) {
                  const userSnap = await getDoc(doc(db, "users", loanData.borrowerId));
                  if (userSnap.exists()) {
                      const borrowerData = userSnap.data();
                      setBorrower(borrowerData);
                      
                      // Fetch On-Chain Trust Score (with Firebase cache fallback)
                      try {
                          const rpcProvider = new JsonRpcProvider(QIE_CHAIN_CONFIG.rpcUrls[0]);
                          const trustContract = new Contract(CONTRACT_ADDRESSES.TrustToken, TRUST_SCORE_ABI, rpcProvider);
                          const score = await trustContract.getScore(borrowerData.walletAddress);
                          
                          // Fetch Loan History for Stats
                          const loansQuery = query(collection(db, "loans"), where("borrowerId", "==", loanData.borrowerId));
                          const loansSnap = await getDocs(loansQuery);
                          const allLoans = loansSnap.docs.map(d => d.data());
                          
                          const totalLoans = allLoans.length;
                          const repaidLoans = allLoans.filter(l => l.status === 'repaid').length;
                          const defaultedLoans = allLoans.filter(l => l.status === 'defaulted').length;
                          const completedLoans = repaidLoans + defaultedLoans;
                          const repaymentRate = completedLoans > 0 ? Math.round((repaidLoans / completedLoans) * 100) : 100;
                          
                          setBorrowerStats({
                              trustScore: Math.min(100, Number(score)),
                              totalLoans,
                              repaymentRate
                          });
                      } catch (e) {
                          console.error("Failed to fetch on-chain stats, using Firebase cache:", e);
                          // Fallback to Firebase cached values if available
                          setBorrowerStats({
                              trustScore: borrowerData.trustScore ?? 100,
                              totalLoans: 0, // Will be updated below if we can at least query loans
                              repaymentRate: borrowerData.repaymentRate ?? 100
                          });
                      }
                  }
             }
             
             // Fetch Lender Profile if loan is funded
             if (loanData.lenderId) {
               const lenderSnap = await getDoc(doc(db, "users", loanData.lenderId));
               if (lenderSnap.exists()) {
                 setLender(lenderSnap.data());
               }
             }
        } else {
             setLoan(null);
        }
        setIsLoading(false);
    }, (err) => {
        console.error("Failed to subscribe to loan:", err);
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

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

  const handleFund = async () => {
    if (!user || !loan || !id) return showToast("Please log in first", "info");
    if (loan.borrowerId === user.id) return showToast("You cannot fund your own loan request.", "error");
    
    // Setup Modal for Funding
    setModalTitle("Funding Loan");
    setModalSubtitle("QIE Tokens being transferred to escrow...");
    setSuccessTitle("Investment Active!");
    setSuccessSubtitle("You have funded this loan. Earnings start now.");
    setIsProcessing(true);

    try {
        // ... (Existing Fund Logic managed in Lending Page mostly, but here for redundancy)
        // Check LendingPage logic for guidance
         if (!lendingPoolContract) throw new Error("Contract not loaded");
         
         const amountWei = parseEther(loan.amount.toString());
         const tx = await lendingPoolContract.fundLoan(loan.contractLoanId, { value: amountWei });
         
         await tx.wait();

         await updateDoc(doc(db, "loans", id), {
            status: 'active',
            lenderId: user.id,
            lenderName: `${user.firstName} ${user.lastName}`,
            fundedAt: new Date().toISOString()
         });
         
         fireConfetti(); // Fire after confirmation
         setIsSuccess(true);
         
         // Modal stays open with success message
    } catch (err: any) {
      console.error(err);
      showToast("Funding failed: " + err.message, "error");
      setIsProcessing(false); // Close modal on error
    }
  };

  const handleRepay = async () => {
      if (!user) return showToast("Please connect your wallet first.", "error");
      if (!lendingPoolContract || !loan) return showToast("Contract or loan not loaded.", "error");
      
      // Setup Modal for Repayment
      setModalTitle("Repaying Loan");
      setModalSubtitle("Returning principal + interest to lender...");
      setSuccessTitle("Debt Settled!");
      setSuccessSubtitle("Loan repaid successfully. Your collateral is now unlocked.");
      setIsProcessing(true);

      try {
          // Fetch the EXACT values from the smart contract to avoid precision issues
          const onChainLoan = await lendingPoolContract.getLoan(loan.contractLoanId);
          // `onChainLoan.amount` and `onChainLoan.interest` are already in Wei (BigInt)
          const totalWei = onChainLoan.amount + onChainLoan.interest;

          showToast(`Repaying ${formatEther(totalWei)} QIE...`, "info");
          
          const tx = await lendingPoolContract.repayLoan(loan.contractLoanId, { value: totalWei });
          await tx.wait();

          // Update loan status
          await updateDoc(doc(db, "loans", loan.id), { 
            status: 'repaid',
            repaidAt: new Date().toISOString()
          });
          
          // Sync borrower's trust score and repayment rate to Firebase
          try {
            const rpcProvider = new JsonRpcProvider(QIE_CHAIN_CONFIG.rpcUrls[0]);
            const trustContract = new Contract(CONTRACT_ADDRESSES.TrustToken, TRUST_SCORE_ABI, rpcProvider);
            const newScore = await trustContract.getScore(borrower?.walletAddress || user?.walletAddress);
            
            // Recalculate repayment rate with the now-repaid loan
            const loansQuery = query(collection(db, "loans"), where("borrowerId", "==", loan.borrowerId));
            const loansSnap = await getDocs(loansQuery);
            const allLoans = loansSnap.docs.map(d => d.data());
            const repaidLoans = allLoans.filter(l => l.status === 'repaid').length;
            const defaultedLoans = allLoans.filter(l => l.status === 'defaulted').length;
            const completedLoans = repaidLoans + defaultedLoans;
            const repaymentRate = completedLoans > 0 ? Math.round((repaidLoans / completedLoans) * 100) : 100;
            
            // Update borrower's user document with synced values
            await updateDoc(doc(db, "users", loan.borrowerId), {
              trustScore: Math.min(100, Number(newScore)),
              repaymentRate: repaymentRate
            });
          } catch (syncError) {
            console.error("Failed to sync borrower stats:", syncError);
          }
          
          fireConfetti(); // Fire after confirmation
          setIsSuccess(true);
          
      } catch (e: any) {
          console.error("Repayment Error:", e);
          showToast("Repayment failed: " + (e.reason || e.shortMessage || e.message), "error");
          setIsProcessing(false);
      }
  };

  const handleDefault = async () => {
      if (!lendingPoolContract || !loan) return;
      
      // TODO: UNCOMMENT THIS TIME CHECK FOR PRODUCTION
      // Time Check (Commented out for testing)
      /*
      if (loan.fundedAt) {
          const startTime = new Date(loan.fundedAt).getTime();
          const durationMs = (loan.duration || 0) * 24 * 60 * 60 * 1000;
          const endTime = startTime + durationMs;
          const now = Date.now();
          const remaining = endTime - now;

          if (remaining > 0) {
              const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
              const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
              const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
              const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
              
              const timeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;
              return showToast(`Loan not yet defaulted. ${timeString} remaining.`, "error");
          }
      }
      */

      setModalTitle("Checking Default");
      setModalSubtitle("Verifying loan status on-chain...");
      setSuccessTitle("Collateral Claimed");
      setSuccessSubtitle("Liquidation successful. Assets transferred to your wallet.");
      setIsProcessing(true);

      try {
          showToast("Checking logic for default...", "info");
          const tx = await lendingPoolContract.checkDefault(loan.contractLoanId);
          await tx.wait();

          // Update loan status
          await updateDoc(doc(db, "loans", loan.id), { 
            status: 'defaulted',
            defaultedAt: new Date().toISOString()
          });
          
          // Sync borrower's trust score and repayment rate to Firebase
          try {
            const rpcProvider = new JsonRpcProvider(QIE_CHAIN_CONFIG.rpcUrls[0]);
            const trustContract = new Contract(CONTRACT_ADDRESSES.TrustToken, TRUST_SCORE_ABI, rpcProvider);
            const newScore = await trustContract.getScore(borrower?.walletAddress);
            
            // Recalculate repayment rate with the now-defaulted loan
            const loansQuery = query(collection(db, "loans"), where("borrowerId", "==", loan.borrowerId));
            const loansSnap = await getDocs(loansQuery);
            const allLoans = loansSnap.docs.map(d => d.data());
            const repaidLoans = allLoans.filter(l => l.status === 'repaid').length;
            const defaultedLoans = allLoans.filter(l => l.status === 'defaulted').length;
            const completedLoans = repaidLoans + defaultedLoans;
            const repaymentRate = completedLoans > 0 ? Math.round((repaidLoans / completedLoans) * 100) : 100;
            
            // Update borrower's user document with synced values
            await updateDoc(doc(db, "users", loan.borrowerId), {
              trustScore: Math.min(100, Number(newScore)),
              repaymentRate: repaymentRate
            });
          } catch (syncError) {
            console.error("Failed to sync borrower stats:", syncError);
          }
          
          fireConfetti(); // Fire after confirmation
          setIsSuccess(true);
      } catch (e: any) {
          console.error(e);
          if (e.message?.includes("Loan not active")) showToast("Loan is not active.", "error");
          else showToast("Default conditions not met (Time remaining?)", "error");
          setIsProcessing(false);
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
        onClose={() => { setIsProcessing(false); setIsSuccess(false); navigate('/dashboard'); }} 
        title={modalTitle}
        subtitle={modalSubtitle}
        successTitle={successTitle}
        successMessage={successSubtitle}
        isSuccess={isSuccess}
      />

      <div className="flex items-center gap-2 text-[10px] text-white/50 mb-6 uppercase tracking-wider">
        <Link className="hover:text-pink-400" to="/lend">Marketplace</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-white">Loan #{loan.id.slice(0, 6)}</span>
      </div>

      {/* ACTION AREA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-white/5 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-black text-white tracking-tight">{loan.amount.toLocaleString()} {loan.asset}</h1>
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
              loan.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
              loan.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
              loan.status === 'repaid' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
              'bg-red-500/10 text-red-500 border-red-500/20'
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
          {/* FUNDING LOGIC */}
          {loan.status === 'pending' && !isSelfLoan && (
            <button 
              disabled={isProcessing}
              onClick={handleFund}
              className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-sm shadow-lg transition-all bg-gradient-primary text-white hover:scale-105 shadow-pink-500/20"
            >
              {isProcessing ? <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Fund This Loan'}
            </button>
          )}

          {/* REPAYMENT LOGIC (Borrower Only) */}
          {loan.status === 'active' && isSelfLoan && (
             <button 
               disabled={isProcessing}
               onClick={handleRepay}
               className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-sm shadow-lg transition-all bg-green-600 hover:bg-green-500 text-white hover:scale-105 shadow-green-500/20"
             >
               {isProcessing ? <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Repay Loan (Principal + Interest)'}
             </button>
          )}

          {/* LIQUIDATION LOGIC (Lender Only) */}
          {loan.status === 'active' && user?.id === loan.lenderId && (
             <button 
               disabled={isProcessing}
               onClick={handleDefault}
               className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-sm shadow-lg transition-all bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/50 hover:scale-105"
             >
               {isProcessing ? <div className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : 'Check Default & Claim Collateral'}
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
                <Link to={`/profile/${loan.borrowerId}`} className="font-bold text-white text-lg hover:text-pink-400 transition-colors cursor-pointer">
                  {loan.borrowerName}
                </Link>
                <div className="flex items-center gap-1">
                   <span className="material-symbols-outlined text-[14px] text-green-400">verified</span>
                   <span className="text-[10px] text-green-400 font-bold uppercase">KYC Verified</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
               <div className="flex justify-between items-center text-sm">
                  <span className="text-white/40">Trust Score</span>
                  <span className={`font-bold ${borrowerStats.trustScore >= 80 ? 'text-green-400' : borrowerStats.trustScore >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {borrowerStats.trustScore} / 100
                  </span>
               </div>
               <div className="flex justify-between items-center text-sm">
                  <span className="text-white/40">Total Loans</span>
                  <span className="text-white font-bold">{borrowerStats.totalLoans}</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                  <span className="text-white/40">Repayment Rate</span>
                  <span className={`font-bold ${borrowerStats.repaymentRate >= 80 ? 'text-green-400' : borrowerStats.repaymentRate >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {borrowerStats.repaymentRate}%
                  </span>
               </div>
            </div>
          </div>

          {/* Loan Timeline */}
          <div className="bg-[#1e0b2e]/60 border border-white/5 rounded-2xl p-6">
            <h3 className="text-xs font-black text-white/30 uppercase tracking-widest mb-4">Loan Timeline</h3>
            <div className="space-y-3">
              {loan.createdAt && (
                <TimelineItem 
                  icon="schedule_send" 
                  label="Request Submitted" 
                  timestamp={loan.createdAt?.seconds ? new Date(loan.createdAt.seconds * 1000).toISOString() : loan.createdAt} 
                />
              )}
              {loan.fundedAt && (
                <TimelineItem 
                  icon="account_balance" 
                  label="Loan Funded" 
                  timestamp={loan.fundedAt} 
                />
              )}
              {loan.repaidAt && (
                <TimelineItem 
                  icon="task_alt" 
                  label="Loan Settled" 
                  timestamp={loan.repaidAt} 
                />
              )}
              {loan.defaultedAt && (
                <TimelineItem 
                  icon="gpp_bad" 
                  label="Declared Default" 
                  timestamp={loan.defaultedAt} 
                />
              )}
            </div>
          </div>

          {/* Lender Stats - Show only when loan is funded */}
          {loan.lenderId && lender && (
            <div className="bg-[#1e0b2e]/60 border border-white/5 rounded-2xl p-6">
              <h3 className="text-xs font-black text-white/30 uppercase tracking-widest mb-6">Lender Details</h3>
              <div className="flex items-center gap-4 mb-4">
                <img className="size-14 rounded-full border-2 border-purple-500/50" src={lender.avatar} alt="Lender" />
                <div>
                  <Link to={`/profile/${loan.lenderId}`} className="font-bold text-white text-lg hover:text-purple-400 transition-colors cursor-pointer">
                    {loan.lenderName}
                  </Link>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-green-400">verified</span>
                    <span className="text-[10px] text-green-400 font-bold uppercase">KYC Verified</span>
                  </div>
                </div>
              </div>
              {loan.fundedAt && (
                <p className="text-xs text-white/40">Funded on {new Date(loan.fundedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              )}
            </div>
          )}
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

const TimelineItem = ({ icon, label, timestamp }: { icon: string; label: string; timestamp: string }) => {
  const date = new Date(timestamp);
  const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formattedTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
      <div className="size-8 rounded-full bg-pink-500/10 flex items-center justify-center">
        <span className="material-symbols-outlined text-pink-400 text-sm">{icon}</span>
      </div>
      <div className="flex-grow">
        <p className="text-sm font-bold text-white">{label}</p>
        <p className="text-[10px] text-white/40">{formattedDate} at {formattedTime}</p>
      </div>
    </div>
  );
};

export default LoanDetailsPage;
