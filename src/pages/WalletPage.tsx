
import React, { useState, useEffect } from 'react';
import { SUPPORTED_ASSETS } from '../config/constants';
import { useAuth } from '../context/AuthContext';
import { formatEther, parseEther, JsonRpcProvider, Contract } from 'ethers';
import { QIE_CHAIN_CONFIG, CONTRACT_ADDRESSES, ERC20_ABI } from '../config/blockchain';

// Helper Component for Faucet
const FaucetButton = ({ symbol, address }: { symbol: string, address: string }) => {
    const { signer, showToast } = useAuth();
    const [loading, setLoading] = useState(false);

    const mint = async () => {
        if (!signer) return showToast("Connect wallet first", "error");
        setLoading(true);
        try {
            const contract = new Contract(address, ERC20_ABI, signer);
            // Mint 1000 Tokens (assuming 18 decimals)
            const tx = await contract.mint(await signer.getAddress(), parseEther("1000"));
            await tx.wait();
            showToast(`Minted 1000 ${symbol} successfully!`, "success");
        } catch (e: any) {
            console.error(e);
            showToast("Mint failed: " + e.message, "error");
        } finally {
            setLoading(false);
        }
    };

    const addToWallet = async () => {
        const ethereum = (window as any).ethereum;
        if (!ethereum) return showToast("MetaMask not found", "error");
        try {
            await ethereum.request({
                method: 'wallet_watchAsset',
                params: {
                    type: 'ERC20',
                    options: {
                        address: address,
                        symbol: symbol,
                        decimals: 18,
                    },
                },
            });
            showToast(`${symbol} added to wallet!`, "success");
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <button 
                onClick={mint}
                disabled={loading}
                className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition-all flex items-center justify-center gap-2"
            >
                {loading ? <span className="animate-spin material-symbols-outlined text-[14px]">progress_activity</span> : <span className="material-symbols-outlined text-[14px]">water_drop</span>}
                Get {symbol}
            </button>
            <button 
                onClick={addToWallet}
                className="size-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/40 hover:text-orange-400 transition-colors"
                title="Add to MetaMask"
            >
                <span className="material-symbols-outlined text-[16px]">add_circle</span>
            </button>
        </div>
    );
};

const WalletPage: React.FC = () => {
  const { user, openWalletModal, showToast, provider } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [qieBalance, setQieBalance] = useState('0.00');

  const fetchBalance = async () => {
    if (user?.walletAddress) {
        try {
            // Direct RPC provider to bypass MetaMask throttling
            const rpcProvider = new JsonRpcProvider(QIE_CHAIN_CONFIG.rpcUrls[0]);
            const bal = await rpcProvider.getBalance(user.walletAddress);
            setQieBalance(formatEther(bal));
        } catch (e: any) {
            console.error("Failed to fetch balance", e);
        }
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [provider, user?.walletAddress]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchBalance();
    setTimeout(() => {
      setIsRefreshing(false);
      showToast("Blockchain data refreshed.", "success");
    }, 500);
  };

  const handleSend = () => {
    showToast("Transaction signing triggered. Confirm in your wallet extension.", "info");
  };

  // Demo valuation
  const totalUsdValuation = (parseFloat(qieBalance) * 1.0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-10 lg:px-20 py-8 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Assets</h1>
          <p className="text-white/60">Live blockchain data for your connected account.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleRefresh}
            className={`group flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white font-medium text-sm ${isRefreshing ? 'opacity-50' : ''}`}
          >
            <span className={`material-symbols-outlined text-pink-400 ${isRefreshing ? 'animate-spin' : ''}`}>sync</span> Refresh Data
          </button>
          {!user?.walletAddress && (
            <button 
              onClick={openWalletModal}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-primary text-white font-bold text-sm shadow-lg hover:shadow-pink-500/20 transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span> Link Wallet
            </button>
          )}
        </div>
      </div>

      {!user?.walletAddress ? (
        <div className="py-20 flex flex-col items-center justify-center glass-panel rounded-3xl border-dashed border-white/10 text-center px-6">
          <div className="size-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-white/20 text-5xl">wallet</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Wallet Disconnected</h2>
          <p className="text-white/40 max-w-md mb-8">You must link your external wallet (MetaMask, Trust, etc.) to see your real crypto balances and manage your P2P assets.</p>
          <button 
            onClick={openWalletModal}
            className="px-10 h-14 rounded-2xl bg-gradient-primary text-white font-bold text-lg shadow-xl hover:scale-105 transition-all"
          >
            Connect Now
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            <div className="lg:col-span-2 rounded-2xl p-6 bg-[#1e0b2e]/60 border border-white/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <span className="material-symbols-outlined text-[120px] text-white">shield</span>
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1">
                   <p className="text-white/60 text-sm font-medium">Public Key Address</p>
                   <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Blockchain Verified</span>
                </div>
                <p className="text-pink-400 font-mono text-sm mb-4 bg-black/20 px-3 py-1 rounded inline-block border border-white/5 break-all">
                    {user.walletAddress}
                </p>
                <div className="flex items-baseline gap-2 mb-4">
                  <h2 className="text-4xl md:text-5xl font-bold text-white">${totalUsdValuation}</h2>
                  <span className="text-white/30 text-xs font-bold uppercase tracking-widest">Total Net Worth</span>
                </div>
                <div className="flex flex-wrap gap-4 mt-4">
                  <ActionButton icon="add" label="Receive" color="green" />
                  <ActionButton icon="send" label="Send" color="blue" />
                  <ActionButton icon="swap_horiz" label="Convert" color="purple" />
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-1 rounded-2xl p-6 bg-gradient-to-br from-[#2d1b42] to-[#1e0b2e] border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">Governance</h3>
                    <p className="text-xs text-white/50">Staking Power</p>
                  </div>
                  <div className="size-8 rounded-lg bg-pink-500 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-lg">how_to_vote</span>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-black/30 border border-white/5 mb-6">
                  <p className="text-[10px] text-white/60 leading-relaxed italic mb-0">
                    Stake your QIE here to earn "vQIE" voting power. This allows you to vote on protocol changes and earn bonus interest.
                  </p>
                </div>

                <button className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all font-semibold text-sm">
                  Stake My QIE
                </button>
              </div>


              {/* TESTNET FAUCET MOVED FROM HERE */}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-[#1e0b2e]/60 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                 <h3 className="text-xl font-bold text-white">Live Portfolio</h3>
                 <span className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Fetched via RPC</span>
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-white/40 text-[10px] uppercase tracking-wider">
                    <th className="p-4 font-medium">Asset Name</th>
                    <th className="p-4 font-medium">Network</th>
                    <th className="p-4 font-medium text-right">Wallet Balance</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-white/5">
                  <tr className="group hover:bg-white/5 transition-colors">
                    <td className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="size-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-[10px]">QIE</div>
                            <span className="font-bold text-white">QIE Coin</span>
                        </div>
                    </td>
                    <td className="p-4"><span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/10 font-bold uppercase">QIE MAINNET</span></td>
                    <td className="p-4 text-right font-bold text-white">{qieBalance}</td>
                  </tr>
                  <tr className="opacity-30">
                    <td className="p-4"><div className="flex items-center gap-3"><div className="size-8 rounded-full bg-white/5 flex items-center justify-center text-white font-bold text-[10px]">USDT</div><span className="font-bold text-white">Tether</span></div></td>
                    <td className="p-4 text-[10px] text-white/40">ETHEREUM</td>
                    <td className="p-4 text-right font-bold text-white">0.00</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-[#1e0b2e]/60 border border-white/10 rounded-2xl p-6 shadow-xl h-fit">
               <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-white">Testnet Faucet</h3>
                  <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded font-bold uppercase">Dev Only</span>
               </div>
               <p className="text-xs text-white/40 mb-6">Mint free tokens to test the protocol.</p>
               
               <div className="space-y-4">
                  <FaucetButton symbol="USDT" address={CONTRACT_ADDRESSES.USDT} />
                  <FaucetButton symbol="WBTC" address={CONTRACT_ADDRESSES.WBTC} />
               </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const ActionButton = ({ icon, label, color }: any) => (
  <button className="flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-sm transition-all text-white font-semibold text-xs">
    <div className={`p-1.5 rounded-full bg-${color}-500/20 text-${color}-400`}>
      <span className="material-symbols-outlined text-[16px]">{icon}</span>
    </div>
    {label}
  </button>
);

export default WalletPage;
