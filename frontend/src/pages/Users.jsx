import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../lib/api';
import { 
  Users as UsersIcon, 
  UserPlus, 
  Trash2, 
  ShieldCheck, 
  Filter,
  Search,
  Loader2,
  X,
  Mail,
  MoreVertical,
  Check
} from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

const ROLE_COLORS = {
  admin: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  analyst: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  viewer: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
};

function AddUserModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'viewer'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('users/', form);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create user. Ensure you have the Service Role Key set.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0d1117] border border-slate-800 rounded-2xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <UserPlus size={22} className="text-indigo-500" /> Create Team Member
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-100"><X size={20} /></button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Full Name</label>
            <input 
              required
              className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-indigo-500/60 transition-colors"
              placeholder="e.g. John Doe"
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Email Address</label>
            <input 
              required
              type="email"
              className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-indigo-500/60"
              placeholder="john@example.com"
              value={form.email}
              onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Initial Password</label>
            <input 
              required
              type="password"
              className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-indigo-500/60"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Account Role</label>
            <select 
              className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-indigo-500/60"
              value={form.role}
              onChange={(e) => setForm(prev => ({ ...prev, role: e.target.value }))}
            >
              <option value="viewer">Viewer</option>
              <option value="analyst">Analyst</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <div className="pt-4 flex gap-3">
             <button 
                type="button" 
                onClick={onClose}
                className="flex-1 py-3 bg-slate-800 text-slate-400 rounded-xl text-sm font-bold hover:bg-slate-700 transition-all border border-slate-700"
              >
                Cancel
              </button>
             <button 
                type="submit" 
                disabled={loading}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                Create Member
              </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const { user: currentUser } = useAuth();
  const { searchTerm } = useOutletContext();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('users/');
      setUsers(data);
    } catch (e) {
      console.error("Failed to load users", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes((searchTerm || '').toLowerCase()) ||
    u.email?.toLowerCase().includes((searchTerm || '').toLowerCase())
  );

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.patch(`users/${userId}/role`, { role: newRole });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      setEditingRole(null);
    } catch (e) {
      alert(e.response?.data?.detail || "Failed to update role");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Remove this user from access?')) return;
    try {
      await api.delete(`users/${userId}/`);
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (e) {
      alert(e.response?.data?.detail || "Failed to delete user");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-3">
             <UsersIcon className="text-indigo-500" /> Team Access
          </h2>
          <p className="text-sm text-slate-500">Manage your organization's administrators, analysts and viewers.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2"
        >
          <UserPlus size={18} /> Invite Member
        </button>
      </div>

      {/* Modern Dashboard Stats bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border border-slate-800/80 rounded-2xl bg-[#0d1117]/60">
        <div className="px-4 border-r border-slate-800 last:border-0">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Seats</p>
          <p className="text-xl font-bold text-slate-100 mt-1">{users.length}</p>
        </div>
        <div className="px-4 border-r border-slate-800 last:border-0">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Admins</p>
          <p className="text-xl font-bold text-indigo-400 mt-1">{users.filter(u => u.role === 'admin').length}</p>
        </div>
        <div className="px-4 border-r border-slate-800 last:border-0">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Analysts</p>
          <p className="text-xl font-bold text-emerald-400 mt-1">{users.filter(u => u.role === 'analyst').length}</p>
        </div>
        <div className="px-4 last:border-0">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Viewers</p>
          <p className="text-xl font-bold text-slate-400 mt-1">{users.filter(u => u.role === 'viewer').length}</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#0d1117]/80 backdrop-blur-md border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[80px] -z-10 rounded-full" />
        
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/30">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">User Profile</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Permissions</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {loading ? (
              <tr><td colSpan={4} className="py-20 text-center"><Loader2 size={24} className="animate-spin text-slate-600 mx-auto" /></td></tr>
            ) : filteredUsers.length === 0 ? (
              <tr><td colSpan={4} className="py-20 text-center text-slate-400 font-medium">
                {searchTerm ? `No results found for "${searchTerm}"` : "No team members found."}
              </td></tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u.id} className="group hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-indigo-400 shrink-0">
                        {u.name?.[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-100 truncate flex items-center gap-2">
                          {u.name} {u.id === currentUser?.id && <span className="text-[10px] bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase">You</span>}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    {editingRole === u.id ? (
                      <div className="flex items-center gap-2">
                         <select 
                           className="bg-slate-900 border border-slate-700 rounded-lg text-xs font-semibold px-2 py-1 text-slate-200 outline-none"
                           defaultValue={u.role}
                           onChange={(e) => handleRoleChange(u.id, e.target.value)}
                         >
                           <option value="viewer">Viewer</option>
                           <option value="analyst">Analyst</option>
                           <option value="admin">Admin</option>
                         </select>
                         <button onClick={() => setEditingRole(null)} className="text-slate-500 hover:text-slate-100"><X size={14} /></button>
                      </div>
                    ) : (
                      <button 
                         onClick={() => setEditingRole(u.id)}
                         className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-bold border capitalize transition-all",
                          ROLE_COLORS[u.role] || ROLE_COLORS.viewer
                        )}
                      >
                        {u.role}
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-emerald-500">
                       <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" /> Active
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    {u.id !== currentUser?.id && (
                      <button 
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-400/5 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && <AddUserModal onClose={() => setShowModal(false)} onSuccess={fetchUsers} />}
    </div>
  );
}
