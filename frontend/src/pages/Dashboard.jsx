import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Activity, 
  ArrowUpRight,
  PieChart as PieChartIcon,
  Calendar,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, BarChart, Bar 
} from 'recharts';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

const StatCard = ({ title, value, type, icon: Icon, loading }) => {
  const isPositive = type === 'income' || type === 'balance';
  
  return (
    <div className="bg-[#0d1117] border border-slate-800/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
      {/* Subtle indicator glow */}
      {isPositive && <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 blur-2xl rounded-full" />}
      
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{title}</p>
          {loading ? (
            <div className="h-8 w-24 bg-slate-800 animate-pulse rounded-md mt-2" />
          ) : (
            <h3 className="text-2xl font-extrabold text-slate-100 tracking-tight mt-1">
              {value}
            </h3>
          )}
        </div>
        <div className={cn(
          "p-2.5 rounded-xl border transition-colors",
          type === 'income' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
          type === 'expense' ? "bg-rose-500/10 border-rose-500/20 text-rose-400" :
          "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
        )}>
          <Icon className="w-5 h-5 shrink-0" />
        </div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [distribution, setDistribution] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [sumRes, trendRes, distRes] = await Promise.all([
          api.get('analytics/summary'),
          api.get('analytics/trends'),
          api.get('analytics/distribution')
        ]);
        setSummary(sumRes.data);
        setTrends(trendRes.data);
        setDistribution(distRes.data);
      } catch (err) {
        setError("Unable to sync financial data. Please check your connection.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center space-y-4">
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-full text-rose-500">
           <AlertCircle size={32} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-100">Sync Failure</h2>
          <p className="text-slate-500 max-w-sm mt-1">{error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-slate-800 text-slate-100 rounded-xl text-sm font-bold hover:bg-slate-700 transition-all"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {/* Header Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Total Income" 
          value={formatCurrency(summary?.total_income)} 
          type="income" 
          icon={TrendingUp} 
          loading={loading}
        />
        <StatCard 
          title="Total Expenses" 
          value={formatCurrency(summary?.total_expenses)} 
          type="expense" 
          icon={TrendingDown} 
          loading={loading}
        />
        <StatCard 
          title="Total Transactions" 
          value={summary?.transaction_count?.toLocaleString() || '0'} 
          type="activity" 
          icon={Activity} 
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cash Flow Main Chart (ReadOnly Insights) */}
        <div className="lg:col-span-2 bg-[#0d1117]/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div>
               <h3 className="text-lg font-bold text-slate-100 tracking-tight">Financial Timeline</h3>
               <p className="text-xs text-slate-500 mt-1 font-medium italic">Overview of income vs spending over time</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg shrink-0">
               <Calendar size={14} className="text-indigo-400" /> Auto-Synced
            </div>
          </div>
          
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#475569" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#475569" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#0d1117', border: '1px solid #1e293b', borderRadius: '12px' }}
                   itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Distribution Summary */}
        <div className="bg-[#0d1117]/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-8 shadow-2xl relative overflow-hidden flex flex-col">
          <div className="mb-8">
             <h3 className="text-lg font-bold text-slate-100 tracking-tight">Expense Split</h3>
             <p className="text-xs text-slate-500 mt-1 font-medium italic">Allocation of funds by category</p>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center relative">
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#06b6d4', '#8b5cf6'][index % 6]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Central Summary for Pie */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                 <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Categorized</p>
                 <p className="text-lg font-extrabold text-slate-100">{distribution.length}</p>
              </div>
            </div>

            {/* Custom Legend for cleaner SaaS look */}
            <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-3 w-full">
               {distribution.map((item, i) => (
                 <div key={item.name} className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#06b6d4', '#8b5cf6'][i % 6] }} />
                   <p className="text-[11px] font-bold text-slate-400 truncate">{item.name}</p>
                   <p className="text-[10px] font-bold text-slate-500 ml-auto">{item.value}%</p>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
