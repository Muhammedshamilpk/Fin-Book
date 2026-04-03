import { useState } from 'react';
import { api } from '../lib/api';
import { 
  Shield, 
  Lock,
  KeyRound
} from 'lucide-react';

const SettingGroup = ({ title, icon: Icon, children }) => (
  <div className="bg-[#0d1117] border border-slate-800/80 rounded-2xl p-8 shadow-xl relative overflow-hidden space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="flex items-center gap-3 border-b border-slate-800 pb-5">
      <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
        <Icon size={20} />
      </div>
      <div>
        <h3 className="font-bold text-slate-100 tracking-tight">{title}</h3>
      </div>
    </div>
    <div className="space-y-6">
      {children}
    </div>
  </div>
);

export default function Settings() {
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      alert("Verification required.");
      return;
    }
    if (!newPassword || newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    setPasswordSaving(true);
    try {
      await api.patch('auth/password', { 
        current_password: currentPassword,
        password: newPassword 
      });
      alert("Password updated successfully.");
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      alert(err.response?.data?.detail || "Update failed.");
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-12 animate-in fade-in duration-700 mt-4 pb-20">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-extrabold text-slate-100 tracking-tight">Settings</h2>
      </div>

      <div className="space-y-8">
        <SettingGroup title="Password" icon={Shield}>
          <div className="space-y-6">
            <div className="p-6 bg-slate-950/40 border border-slate-800 rounded-2xl space-y-8 relative">
               
               {/* Current Password Field */}
               <div className="space-y-1.5">
                  <div className="flex items-center gap-2 mb-2">
                    <KeyRound className="w-3 h-3 text-indigo-400" />
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Current Password</label>
                  </div>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-slate-100 outline-none focus:border-indigo-500/60 transition-all"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
               </div>

               <div className="h-px bg-slate-800/60 w-full" />

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="w-3 h-3 text-emerald-400" />
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">New Password</label>
                    </div>
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-slate-100 outline-none focus:border-emerald-500/60 transition-all"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="w-3 h-3 text-emerald-400" />
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Confirm New Password</label>
                    </div>
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-slate-100 outline-none focus:border-emerald-500/60 transition-all"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
               </div>

               <div className="flex justify-end pt-4">
                 <button 
                   onClick={handlePasswordSave}
                   disabled={passwordSaving || !newPassword || !currentPassword}
                   className="w-full px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-[2px] transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98] disabled:opacity-30"
                 >
                   {passwordSaving ? "Updating..." : "Update Password"}
                 </button>
               </div>
            </div>
          </div>
        </SettingGroup>
      </div>
    </div>
  );
}
