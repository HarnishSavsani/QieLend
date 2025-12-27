
import React, { useEffect, useState } from 'react';

interface ProcessingModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  successTitle?: string;
  successMessage?: string;
  isSuccess?: boolean; // NEW: External control for success state
}

const ProcessingModal: React.FC<ProcessingModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  subtitle,
  successTitle = 'Settled!',
  successMessage = 'Transaction confirmed on QIE Chain',
  isSuccess = false // Default to false
}) => {
  const [showCheck, setShowCheck] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setShowCheck(false);
    } else if (isSuccess) {
      // Only show check when explicitly told transaction succeeded
      setShowCheck(true);
    }
  }, [isOpen, isSuccess]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background-dark/90 backdrop-blur-xl animate-in fade-in duration-500" />
      
      <div className="relative w-full max-w-sm text-center">
        <div className="mb-8 relative flex justify-center items-center h-[120px]">
          {!showCheck ? (
             <div className="size-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
          ) : (
             <div className="size-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center animate-in zoom-in duration-300 shadow-xl shadow-green-500/30">
                 <span className="material-symbols-outlined text-white text-5xl font-bold">check</span>
             </div>
          )}
        </div>

        <h2 className="text-2xl font-black text-white mb-2 animate-in slide-in-from-bottom-2 fade-in duration-700">
          {showCheck ? successTitle : title}
        </h2>
        <p className="text-white/50 text-sm animate-in slide-in-from-bottom-4 fade-in duration-1000">
          {showCheck ? successMessage : subtitle}
        </p>

        {showCheck && (
          <button 
            onClick={onClose}
            className="mt-10 px-8 py-3 rounded-xl bg-white/10 border border-white/10 text-white font-bold text-sm hover:bg-white/20 transition-all animate-in fade-in zoom-in duration-500"
          >
            Return to Dashboard
          </button>
        )}
      </div>

      <style>{`
        @keyframes draw {
          from { stroke-dashoffset: 100; }
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
};

export default ProcessingModal;
