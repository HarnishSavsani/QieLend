
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  signInWithPopup,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc, setDoc, updateDoc, onSnapshot, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { auth, db } from '../firebase';

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
        avatar: `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${firstName}`,
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
          avatar: result.user.photoURL || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${names[0]}`,
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
    try {
      let provider: any = null;
      const eth = (window as any).ethereum;
      if (type === 'qie') provider = (window as any).qie;
      else if (eth) provider = eth;

      if (!provider) {
        showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} wallet not found.`, "error");
        return;
      }

      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) {
        const walletAddress = accounts[0];
        await updateProfile({ walletAddress });
        showToast(`Wallet ${walletAddress.slice(0, 6)}... connected!`, "success");
        closeWalletModal();
      }
    } catch (error: any) {
      showToast("Connection failed. Check your wallet extension.", "error");
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading,
      toast,
      isWalletModalOpen,
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
