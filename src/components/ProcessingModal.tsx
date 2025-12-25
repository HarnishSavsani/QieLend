
import React, { useEffect, useState } from 'react';

interface ProcessingModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  successTitle?: string;
  successMessage?: string;
}

const ProcessingModal: React.FC<ProcessingModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  subtitle,
  successTitle = 'Settled!',
  successMessage = 'Transaction confirmed on QIE Chain'
}) => {
  const [showCheck, setShowCheck] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setShowCheck(true), 1500);
      return () => clearTimeout(timer);
    } else {
      setShowCheck(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background-dark/90 backdrop-blur-xl animate-in fade-in duration-500" />
      
      <div className="relative w-full max-w-sm text-center">
        <div className="mb-8 relative flex justify-center">
          {/* Graphite Sketch Animation */}
          <svg width="120" height="120" viewBox="0 0 120 120" className="drop-shadow-[0_0_15px_rgba(217,70,239,0.3)]">
            <circle 
              cx="60" cy="60" r="54" 
              fill="none" 
              stroke="rgba(255,255,255,0.05)" 
              strokeWidth="2"
            />
            <circle 
              cx="60" cy="60" r="54" 
              fill="none" 
              stroke="url(#graphiteGradient)" 
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="339"
              strokeDashoffset={showCheck ? "0" : "339"}
              className="transition-all duration-[2000ms] ease-out"
            />
            {showCheck && (
              <path 
                d="M35 60 L52 77 L85 44" 
                fill="none" 
                stroke="#d946ef" 
                strokeWidth="6" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                strokeDasharray="100"
                strokeDashoffset="0"
                className="animate-[draw_1s_ease-out_forwards]"
              />
            )}
            <defs>
              <linearGradient id="graphiteGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#d946ef" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
          
          {!showCheck && (
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="size-16 border-b-2 border-pink-500 rounded-full animate-spin"></div>
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
