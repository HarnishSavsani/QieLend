
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import defaultAvatar from '../src/assets/default-avatar.svg';

type TabType = 'profile' | 'security' | 'notifications' | 'wallets';

const SettingsPage: React.FC = () => {
  const { user, updateProfile, disconnectWallet, showToast, openWalletModal } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Notification states
  const [notifSettings, setNotifSettings] = useState({
    emailLoans: true,
    liquidation: true,
    repayment: true,
    marketing: false
  });

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage('');
    try {
      const newAvatar = defaultAvatar;
      await updateProfile({ firstName, lastName, avatar: newAvatar });
      setSaveMessage('Profile and Avatar updated!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      setSaveMessage('Error updating profile.');
    }
    setIsSaving(false);
  };

  const handleUpdatePassword = () => {
    showToast("Password update request sent. Please check your email for instructions.", "success");
  };

  const handle2FA = () => {
    showToast("Two-Factor Authentication development is in progress.", "info");
  };

  const toggleNotif = (key: keyof typeof notifSettings) => {
    setNotifSettings(prev => ({ ...prev, [key]: !prev[key] }));
    showToast("Notification preference updated.", "info");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-10 lg:px-20 py-8">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Account Settings</h1>
          <p className="text-white/50">Manage your profile details and platform security preferences.</p>
        </div>
        {saveMessage && (
          <div className="px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold animate-in fade-in slide-in-from-right-4">
            {saveMessage}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-3">
          <div className="bg-[#1e0b2e]/60 border border-white/10 rounded-2xl p-4">
            <nav className="space-y-1">
              <NavItem 
                icon="person" 
                label="My Profile" 
                active={activeTab === 'profile'} 
                onClick={() => setActiveTab('profile')} 
              />
              <NavItem 
                icon="shield" 
                label="Security" 
                active={activeTab === 'security'} 
                onClick={() => setActiveTab('security')} 
              />
              <NavItem 
                icon="notifications" 
                label="Notifications" 
                active={activeTab === 'notifications'} 
                onClick={() => setActiveTab('notifications')} 
              />
              <NavItem 
                icon="account_balance_wallet" 
                label="Connected Wallet" 
                active={activeTab === 'wallets'} 
                onClick={() => setActiveTab('wallets')} 
              />
            </nav>
            <div className="mt-8 pt-6 border-t border-white/10 px-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Plan: Spark (Free)</span>
                <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-400 text-[10px] font-bold">Active</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-9 space-y-6">
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="bg-[#1e0b2e]/60 border border-white/10 rounded-2xl p-6 md:p-8 animate-in fade-in duration-300">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Personal Information</h2>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 rounded-xl bg-gradient-primary text-white font-bold text-sm shadow-lg hover:shadow-pink-500/20 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {isSaving ? <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Save Changes'}
                </button>
              </div>
              
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex flex-col items-center gap-3">
                  <div className="size-24 rounded-full border-2 border-pink-500 overflow-hidden bg-surface-dark flex items-center justify-center">
                    <img className="w-full h-full object-cover" src={user?.avatar} alt="Profile" />
                  </div>
                  <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest text-center">Auto-Avatar<br/>(Change name to update)</span>
                </div>
                
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-white/80">First Name</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-white/30 text-[20px]">badge</span>
                      <input 
                        className="w-full bg-[#0f0518]/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm focus:border-pink-500/50 outline-none transition-all" 
                        type="text" 
                        value={firstName} 
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-white/80">Last Name</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-white/30 text-[20px]">badge</span>
                      <input 
                        className="w-full bg-[#0f0518]/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm focus:border-pink-500/50 outline-none transition-all" 
                        type="text" 
                        value={lastName} 
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 opacity-50 cursor-not-allowed">
                    <label className="text-xs font-medium text-white/80">Email Address (Locked)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-white/30 text-[20px]">mail</span>
                      <input 
                        className="w-full bg-[#0f0518]/30 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-white/50 text-sm" 
                        type="email" 
                        disabled 
                        value={user?.email} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </form>
          )}

          {activeTab === 'security' && (
            <div className="bg-[#1e0b2e]/60 border border-white/10 rounded-2xl p-6 md:p-8 animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-pink-400">lock</span> Security Settings
              </h2>
              <div className="space-y-6">
                <div className="p-5 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-white text-sm">Update Password</h4>
                    <p className="text-xs text-white/40">Secure your account with a new password.</p>
                  </div>
                  <button 
                    onClick={handleUpdatePassword}
                    className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs font-bold hover:bg-white/10 transition-all"
                  >
                    Change
                  </button>
                </div>
                <div className="p-5 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-white text-sm">Two-Factor Authentication</h4>
                    <p className="text-xs text-white/40">Add an extra layer of security to your logins.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-white/20 font-bold uppercase">Disabled</span>
                    <button 
                      onClick={handle2FA}
                      className="px-4 py-2 rounded-lg bg-pink-500 text-white text-xs font-bold hover:bg-pink-600 transition-all"
                    >
                      Enable
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-[#1e0b2e]/60 border border-white/10 rounded-2xl p-6 md:p-8 animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-pink-400">notifications</span> Notification Preferences
              </h2>
              <div className="space-y-4">
                <NotificationToggle 
                  label="Email Alerts for New Loans" 
                  active={notifSettings.emailLoans} 
                  onClick={() => toggleNotif('emailLoans')}
                />
                <NotificationToggle 
                  label="Price Liquidation Warnings" 
                  active={notifSettings.liquidation} 
                  onClick={() => toggleNotif('liquidation')}
                />
                <NotificationToggle 
                  label="Successful Repayment Notifications" 
                  active={notifSettings.repayment} 
                  onClick={() => toggleNotif('repayment')}
                />
                <NotificationToggle 
                  label="Marketing Updates" 
                  active={notifSettings.marketing} 
                  onClick={() => toggleNotif('marketing')}
                />
              </div>
            </div>
          )}

          {activeTab === 'wallets' && (
            <div className="bg-[#1e0b2e]/60 border border-white/10 rounded-2xl p-6 md:p-8 animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-pink-400">account_balance_wallet</span> Connected Wallet
              </h2>
              
              {user?.walletAddress ? (
                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-pink-500/10 to-purple-600/10 border border-pink-500/20">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-white/5 flex items-center justify-center">
                           <span className="material-symbols-outlined text-pink-400">verified</span>
                        </div>
                        <div>
                           <p className="text-xs text-white/40 font-bold uppercase tracking-widest">Active Connection</p>
                           <p className="text-white font-mono font-bold">{user.walletAddress.slice(0, 10)}...{user.walletAddress.slice(-10)}</p>
                        </div>
                      </div>
                      <button 
                        onClick={disconnectWallet}
                        className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500 hover:text-white transition-all"
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold text-center">Secured by QIE Protocol</p>
                </div>
              ) : (
                <div className="p-10 text-center border-2 border-dashed border-white/10 rounded-2xl">
                   <p className="text-white/40 mb-4">No wallet connected to this account.</p>
                   <button 
                    onClick={openWalletModal}
                    className="px-6 py-2 rounded-xl bg-gradient-primary text-white font-bold text-sm shadow-lg hover:scale-105 transition-all"
                   >
                    Connect New Wallet
                   </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const NavItem = ({ icon, label, active = false, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${active ? 'bg-gradient-primary text-white shadow-lg' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}
  >
    <span className="material-symbols-outlined text-[20px]">{icon}</span>
    {label}
  </button>
);

const NotificationToggle = ({ label, active = false, onClick }: any) => (
  <div className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/5">
    <span className="text-sm text-white/80 font-medium">{label}</span>
    <button 
      onClick={onClick}
      className={`w-10 h-6 rounded-full relative transition-colors ${active ? 'bg-pink-500' : 'bg-white/10'}`}
    >
      <div className={`absolute top-1 size-4 rounded-full bg-white transition-all ${active ? 'right-1' : 'left-1'}`}></div>
    </button>
  </div>
);

export default SettingsPage;
