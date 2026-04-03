import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useOutletContext } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Trash2, 
  Plus, 
  Calendar, 
  X, 
  Loader2, 
  ArrowUpRight, 
  ArrowDownRight,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Eye,
  Info
} from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

const TypeBadge = ({ type }) => (
  <div className={cn(
    "px-2 py-1 rounded-full text-[10px] font-bold border uppercase tracking-widest flex items-center gap-1 w-fit transition-all",
    type === 'income' 
      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_12px_-4px_rgba(16,185,129,0.2)]' 
      : 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_12px_-4px_rgba(244,63,94,0.2)]'
  )}>
    {type === 'income' ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
    {type}
  </div>
);

export default function Records() {
  const { user } = useAuth();
  const { searchTerm: globalSearch } = useOutletContext();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRecord, setNewRecord] = useState({ amount: '', type: 'expense', category: '', date: format(new Date(), 'yyyy-MM-dd'), notes: '' });

  const isViewer = user?.role === 'viewer';

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('records/');
      setRecords(data);
    } catch (e) {
      console.error("Failed to fetch records", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('records/', newRecord);
      fetchRecords();
      setShowAddModal(false);
      setNewRecord({ amount: '', type: 'expense', category: '', date: format(new Date(), 'yyyy-MM-dd'), notes: '' });
    } catch (e) {
      alert("Error adding record");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Archiving this transaction will permanently remove it. Continue?")) return;
    try {
      await api.delete(`records/${id}/`);
      fetchRecords();
    } catch (e) {
      alert("Error deleting record");
    }
  };

  const filteredRecords = records.filter(r => {
    const matchesSearch = r.category.toLowerCase().includes((globalSearch || '').toLowerCase()) || (r.notes?.toLowerCase() || '').includes((globalSearch || '').toLowerCase());
    const matchesType = filterType === 'all' || r.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-3">
             <Eye className="text-indigo-500" size={28} /> History
          </h2>
        </div>
        
        {!isViewer && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 active:scale-95"
          >
            <Plus size={18} /> New Transaction
          </button>
        )}
      </div>

      {/* Modern Filter Shelf */}
      <div className="bg-[#0d1117]/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2">Refine Results</p>
        
        <div className="flex items-center gap-2 p-1 bg-slate-900 rounded-xl border border-slate-700/50 w-full md:w-auto">
          {['all', 'income', 'expense'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all",
                filterType === t 
                  ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/30" 
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/5 blur-[100px] -z-10 rounded-full" />
        
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/30">
              <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Entry Date</th>
              <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Description & Category</th>
              <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
              <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Amount</th>
              {!isViewer && <th className="px-8 py-5 text-right text-[10px] font-bold text-slate-500 uppercase tracking-widest">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {loading ? (
              <tr><td colSpan={isViewer ? 4 : 5} className="py-24 text-center"><Loader2 size={24} className="animate-spin text-slate-600 mx-auto" /></td></tr>
            ) : filteredRecords.length === 0 ? (
              <tr><td colSpan={isViewer ? 4 : 5} className="py-24 text-center space-y-3">
                 <div className="p-4 bg-slate-800/40 rounded-full w-fit mx-auto text-slate-600"><Info size={28} /></div>
                 <p className="text-slate-500 font-medium italic">No transactions found matching your criteria.</p>
              </td></tr>
            ) : (
              filteredRecords.map((r) => (
                <tr key={r.id} className="group hover:bg-slate-800/20 transition-all">
                  <td className="px-8 py-5">
                    <p className="text-xs font-bold text-slate-400 group-hover:text-slate-200 transition-colors">
                      {format(new Date(r.date), 'MMM dd, yyyy')}
                    </p>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 shadow-sm",
                        r.type === 'income' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                      )}>
                        {r.category[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-100 truncate">{r.notes || 'No description provided'}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{r.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <TypeBadge type={r.type} />
                  </td>
                  <td className="px-8 py-5">
                    <p className={cn(
                      "text-sm font-extrabold tracking-tight",
                      r.type === 'income' ? 'text-emerald-400' : 'text-slate-100'
                    )}>
                      {r.type === 'income' ? '+' : '-'}${r.amount.toLocaleString()}
                    </p>
                  </td>
                  {!isViewer && (
                    <td className="px-8 py-5 text-right">
                      <button 
                        onClick={() => handleDelete(r.id)}
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-400/5 rounded-lg transition-all"
                        title="Archive Transaction"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal (Logic kept for Admin/Analyst) */}
      {showAddModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-[#0d1117] border border-slate-800 rounded-2xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-100 mb-6">New Transaction</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <input required type="number" step="0.01" placeholder="Amount ($)" className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-indigo-500/60" value={newRecord.amount} onChange={e => setNewRecord({...newRecord, amount: e.target.value})} />
              <select className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-indigo-500/60" value={newRecord.type} onChange={e => setNewRecord({...newRecord, type: e.target.value})}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="Category" className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-indigo-500/60" value={newRecord.category} onChange={e => setNewRecord({...newRecord, category: e.target.value})} />
                <input required type="date" className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-indigo-500/60" value={newRecord.date} onChange={e => setNewRecord({...newRecord, date: e.target.value})} />
              </div>
              <textarea 
                placeholder="Description/Notes" 
                rows={3}
                className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-indigo-500/60 resize-none" 
                value={newRecord.notes} 
                onChange={e => setNewRecord({...newRecord, notes: e.target.value})} 
              />
              <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 active:scale-95 transition-all">
                Add Entry
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
