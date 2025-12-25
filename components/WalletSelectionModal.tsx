
import React from 'react';
import { useAuth, WalletType } from '../context/AuthContext';

const WalletSelectionModal: React.FC = () => {
  const { isWalletModalOpen, closeWalletModal, connectWallet } = useAuth();

  if (!isWalletModalOpen) return null;

  const wallets: { id: WalletType; name: string; icon: string; color: string; desc: string }[] = [
    { 
      id: 'metamask', 
      name: 'MetaMask', 
      icon: 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg', 
      color: 'from-orange-500/20 to-orange-600/20',
      desc: 'The most popular crypto wallet extension.'
    },
    { 
      id: 'coinbase', 
      name: 'Coinbase Wallet', 
      icon: 'https://avatars.githubusercontent.com/u/18060234?s=280&v=4', 
      color: 'from-blue-500/20 to-blue-600/20',
      desc: 'Securely manage your assets with Coinbase.'
    },
    { 
      id: 'trust', 
      name: 'Trust Wallet', 
      icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png', 
      color: 'from-blue-400/20 to-blue-500/20',
      desc: 'Mobile-first wallet for multichain assets.'
    },
    { 
      id: 'qie', 
      name: 'QIE Wallet', 
      icon: 'https://play-lh.googleusercontent.com/BPg31CmP9i6Dpo0EZQjGceZGXe5uaKOShtz52vY5zW1_e0SpQBarSkP6TUIFk4WWkJI',
      color: 'from-purple-500/20 to-purple-600/20',
      desc: 'Native optimized wallet for QIE Chain.'
    }
  ];

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-background-dark/80 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={closeWalletModal}
      />
      
      <div className="relative w-full max-w-lg bg-surface-dark border border-white/10 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        <div className="p-8 md:p-10">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-black text-white">Connect Wallet</h2>
              <p className="text-white/40 text-sm mt-1">Select your preferred provider to continue</p>
            </div>
            <button 
              onClick={closeWalletModal}
              className="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {wallets.map((wallet) => (
              <button
                key={wallet.id}
                onClick={() => connectWallet(wallet.id)}
                className={`group flex items-center gap-5 p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-pink-500/30 hover:bg-white/10 transition-all text-left relative overflow-hidden`}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${wallet.color} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                
                <div className="size-14 shrink-0 bg-white/5 rounded-xl flex items-center justify-center p-2 relative z-10">
                  <img src={wallet.icon} alt={wallet.name} className="w-full h-full object-contain" />
                </div>
                
                <div className="flex-1 relative z-10">
                  <h3 className="text-lg font-bold text-white group-hover:text-pink-400 transition-colors">{wallet.name}</h3>
                  <p className="text-xs text-white/40 leading-relaxed mt-0.5">{wallet.desc}</p>
                </div>

                <span className="material-symbols-outlined text-white/20 group-hover:text-pink-500 group-hover:translate-x-1 transition-all relative z-10">chevron_right</span>
              </button>
            ))}
          </div>

          <div className="mt-10 p-5 rounded-2xl bg-white/5 border border-white/5 flex items-start gap-4">
            <span className="material-symbols-outlined text-pink-500 text-xl shrink-0 mt-0.5">info</span>
            <p className="text-[11px] text-white/40 leading-relaxed">
              By connecting a wallet, you agree to QieLend's <a href="#/terms" className="text-pink-400 hover:underline">Terms of Service</a> and acknowledge the risks associated with peer-to-peer decentralized lending.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletSelectionModal;
