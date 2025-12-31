
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  signInWithPopup,
  sendPasswordResetEmail
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, onSnapshot, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from '../config/firebase';
import defaultAvatar from '../assets/default-avatar.svg';
import { User } from '../types/types';

import { BrowserProvider, Signer, Contract } from 'ethers';
import { QIE_CHAIN_CONFIG, CONTRACT_ADDRESSES, LENDING_POOL_ABI, TRUST_SCORE_ABI } from '../config/blockchain';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  walletAddress?: string;
  avatar: string;
  trustScore: number;
  createdAt: string;
}

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
  visible: boolean;
}

export type WalletType = 'metamask' | 'coinbase' | 'trust' | 'qie';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  toast: ToastState;
  isWalletModalOpen: boolean;
  // Web3 State
  provider: BrowserProvider | null;
  signer: Signer | null;
  lendingPoolContract: Contract | null;
  trustScoreContract: Contract | null;
  
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
  openWalletModal: () => void;
  closeWalletModal: () => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  googleLogin: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  connectWallet: (type: WalletType) => Promise<void>;
  disconnectWallet: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [toast, setToast] = useState<ToastState>({ message: '', type: 'info', visible: false });

  // Web3 State
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<Signer | null>(null);
  const [lendingPoolContract, setLendingPoolContract] = useState<Contract | null>(null);
  const [trustScoreContract, setTrustScoreContract] = useState<Contract | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type, visible: true });
    setTimeout(() => hideToast(), 6000);
  };

  const hideToast = () => setToast(prev => ({ ...prev, visible: false }));
  const openWalletModal = () => setIsWalletModalOpen(true);
  const closeWalletModal = () => setIsWalletModalOpen(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const unsubProfile = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setUser(docSnap.data() as UserProfile);
          }
          setIsLoading(false);
        }, (error) => {
          console.error("Profile sync error:", error);
          setIsLoading(false);
        });
        return () => unsubProfile();
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Reconnect wallet on reload if already connected in Firebase
  useEffect(() => {
    const initWeb3 = async () => {
        if ((window as any).ethereum) {
            const tempProvider = new BrowserProvider((window as any).ethereum);
            setProvider(tempProvider);
            
            // Only attempt to get signer if we are already authorized (have accounts)
            try {
                const accounts = await tempProvider.send("eth_accounts", []);
                if (accounts.length > 0) {
                    const _signer = await tempProvider.getSigner();
                    setSigner(_signer);
                    const lendingPool = new Contract(CONTRACT_ADDRESSES.LendingPool, LENDING_POOL_ABI, _signer);
                    const trustScore = new Contract(CONTRACT_ADDRESSES.TrustToken, TRUST_SCORE_ABI, _signer);
                    setLendingPoolContract(lendingPool);
                    setTrustScoreContract(trustScore);
                }
            } catch (e) {
                // User not connected or error, just ignore
                console.debug("Auto-connect check failed or no accounts:", e);
            }
        }
    };
    initWeb3();
  }, []);

  // Listen for MetaMask Account Changes
  useEffect(() => {
    const eth = (window as any).ethereum;
    if (eth) {
        const handleAccountsChanged = async (accounts: string[]) => {
            if (accounts.length > 0) {
                const newAddress = accounts[0];
                // If the user is logged in, sync this new address to their profile
                if (user && user.walletAddress !== newAddress) {
                    await updateProfile({ walletAddress: newAddress });
                    showToast(`Switched account to ${newAddress.slice(0,6)}...`, "info");
                    
                    // Update Signer
                    if (provider) {
                        const _signer = await provider.getSigner();
                        setSigner(_signer);
                        // Recreate contracts with new signer
                        const lendingPool = new Contract(CONTRACT_ADDRESSES.LendingPool, LENDING_POOL_ABI, _signer);
                        const trustScore = new Contract(CONTRACT_ADDRESSES.TrustToken, TRUST_SCORE_ABI, _signer);
                        setLendingPoolContract(lendingPool);
                        setTrustScoreContract(trustScore);
                    }
                }
            } else {
                // User disconnected in MetaMask
                 if (user?.walletAddress) {
                    await updateProfile({ walletAddress: undefined }); // Clear wallet in DB
                    setSigner(null);
                    showToast("Wallet disconnected.", "info");
                 }
            }
        };

        const handleChainChanged = () => {
             // Recommended by MetaMask to reload page on chain change
            window.location.reload();
        };

        eth.on('accountsChanged', handleAccountsChanged);
        eth.on('chainChanged', handleChainChanged);

        return () => {
            if (eth.removeListener) {
                eth.removeListener('accountsChanged', handleAccountsChanged);
                eth.removeListener('chainChanged', handleChainChanged);
            }
        };
    }
  }, [user, provider]);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      let msg = "Invalid email or password.";
      if (error.code === 'auth/user-not-found') msg = "No account found with this email.";
      if (error.code === 'auth/wrong-password') msg = "Incorrect password.";
      showToast(msg, 'error');
      throw error;
    }
  };

  const signup = async (firstName: string, lastName: string, email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newProfile: UserProfile = {
        id: userCredential.user.uid,
        firstName,
        lastName,
        email,
        avatar: `https://api.dicebear.com/7.x/thumbs/svg?seed=${firstName.trim()}${lastName.trim()}`,
        trustScore: 100,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, "users", userCredential.user.uid), newProfile);
      setUser(newProfile);
      showToast("Account created successfully!", "success");
    } catch (error: any) {
      showToast(error.message || "Signup failed.", "error");
      throw error;
    }
  };

  const googleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const userDoc = await getDoc(doc(db, "users", result.user.uid));
      if (!userDoc.exists()) {
        const names = (result.user.displayName || "User").split(" ");
        const newProfile: UserProfile = {
          id: result.user.uid,
          firstName: names[0],
          lastName: names.length > 1 ? names[names.length - 1] : "",
          email: result.user.email || "",
          avatar: result.user.photoURL || `https://api.dicebear.com/7.x/thumbs/svg?seed=${names.join('')}`,
          trustScore: 100,
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, "users", result.user.uid), newProfile);
        setUser(newProfile);
      }
      showToast("Google Sign-in successful!", "success");
    } catch (error) {
      showToast("Google Login failed.", "error");
      throw error;
    }
  };

  const disconnectWallet = async () => {
    setSigner(null);
    setLendingPoolContract(null);
    setTrustScoreContract(null);
    if (!user) return;
    try {
      await updateDoc(doc(db, "users", user.id), { walletAddress: null });
      showToast("Wallet disconnected successfully.", "info");
    } catch (error) {
      console.error("Disconnect error:", error);
    }
  };

  const logout = async () => {
    // For security, disconnect wallet on logout
    if (user?.walletAddress) {
      await updateDoc(doc(db, "users", user.id), { walletAddress: null });
    }
    await signOut(auth);
    setSigner(null);
    setLendingPoolContract(null);
    setTrustScoreContract(null);
    setUser(null);
    showToast("Logged out and session secured.");
  };

  const resetPassword = async (email: string) => {
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        showToast("No account found with this email address.", "error");
        return;
      }
      await sendPasswordResetEmail(auth, email);
      showToast("Password reset link sent to your email.", "success");
    } catch (error) {
      showToast("Failed to send reset link.", "error");
      throw error;
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const userRef = doc(db, "users", user.id);
    await updateDoc(userRef, data);
  };

  const connectWallet = async (type: WalletType) => {
    if (!user) {
      showToast("Please login first to link your wallet.", "info");
      return;
    }

    // Helper for display names
    const walletNames: Record<string, string> = {
        metamask: 'MetaMask',
        coinbase: 'Coinbase Wallet',
        trust: 'Trust Wallet',
        qie: 'QIE Wallet'
    };

    let eth = (window as any).ethereum;
    let selectedProvider = null;
    
    // Scenario A: EIP-6963 (Multiple Wallets Installed)
    if (eth?.providers?.length) {
        if (type === 'metamask') {
            selectedProvider = eth.providers.find((p: any) => p.isMetaMask);
        } else if (type === 'coinbase') {
            selectedProvider = eth.providers.find((p: any) => p.isCoinbaseWallet);
        } else if (type === 'trust') {
            selectedProvider = eth.providers.find((p: any) => p.isTrust);
        }
    } 
    // Scenario B: Single Wallet Installed (Legacy)
    else if (eth) {
        if (type === 'metamask' && eth.isMetaMask) selectedProvider = eth;
        else if (type === 'coinbase' && eth.isCoinbaseWallet) selectedProvider = eth;
        else if (type === 'trust' && eth.isTrust) selectedProvider = eth;
        // If type is generic or QIE, we might accept the default, but let's be strict for majors
    }

    // Special handling: If user wants MetaMask but only Coinbase is installed (or vice versa), fail
    if (!selectedProvider) {
        showToast(`${walletNames[type]} is not installed!`, "error");
        return;
    }

    try {
      const _provider = new BrowserProvider(selectedProvider);

      // SECURITY: Force permission prompt to ensure user sees the "Connect" dialog every time
      try {
          await selectedProvider.request({
              method: 'wallet_requestPermissions',
              params: [{ eth_accounts: {} }]
          });
      } catch (permError: any) {
             if (permError.code === 4001) throw new Error("User rejected connection request.");
             // Continue if method not supported
      }
      
      // 1. Request Accounts
      await _provider.send("eth_requestAccounts", []);
      
      // Use selectedProvider for all subsequent requests to avoid confusion
      const _signer = await _provider.getSigner();
      const address = await _signer.getAddress();

      // 2. Check Network
      const network = await _provider.getNetwork();
      const requiredChainId = BigInt(QIE_CHAIN_CONFIG.chainId); // 31337 or 28

      if (network.chainId !== requiredChainId) {
          try {
              await selectedProvider.request({
                  method: 'wallet_switchEthereumChain',
                  params: [{ chainId: '0x' + requiredChainId.toString(16) }],
              });
          } catch (switchError: any) {
              if (switchError.code === 4902) {
                  await selectedProvider.request({
                      method: 'wallet_addEthereumChain',
                      params: [{
                          chainId: '0x' + requiredChainId.toString(16),
                          chainName: QIE_CHAIN_CONFIG.chainName,
                          nativeCurrency: QIE_CHAIN_CONFIG.nativeCurrency,
                          rpcUrls: QIE_CHAIN_CONFIG.rpcUrls,
                      }],
                  });
              } else {
                  throw switchError;
              }
          }
      }

      // 3. Initialize Contracts
      const lendingPool = new Contract(CONTRACT_ADDRESSES.LendingPool, LENDING_POOL_ABI, _signer);
      const trustScore = new Contract(CONTRACT_ADDRESSES.TrustToken, TRUST_SCORE_ABI, _signer);

      setProvider(_provider);
      setSigner(_signer);
      setLendingPoolContract(lendingPool);
      setTrustScoreContract(trustScore);

      // 4. Update Firebase
      await updateProfile({ walletAddress: address });
      showToast(`Wallet ${address.slice(0, 6)}... connected!`, "success");
      closeWalletModal();
      
    } catch (error: any) {
      console.error("Wallet connection failed:", error);
      showToast("Failed to connect wallet: " + (error.message || "Unknown error"), "error");
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading,
      toast,
      isWalletModalOpen,
      provider,
      signer,
      lendingPoolContract,
      trustScoreContract,
      showToast,
      hideToast,
      openWalletModal,
      closeWalletModal,
      login, 
      signup, 
      googleLogin,
      logout,
      resetPassword,
      updateProfile,
      connectWallet,
      disconnectWallet
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
