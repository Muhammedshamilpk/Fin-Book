import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, Legend, ComposedChart, Line
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  Activity,
  ArrowUpRight, 
  ArrowDownRight,
  Loader2,
  ShieldCheck,
  Zap,
  Target,
  ArrowRight,
  TrendingDown
} from 'lucide-react';
import { cn } from '../lib/utils';

const COLORS = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#06b6d4', '#8b5cf6'];

const ComparisonCard = ({ title, current, delta, type = 'income' }) => {
  const isPositive = delta >= 0;
  return (
    <div className="bg-[#0b0f17] border border-slate-800/60 rounded-2xl p-6 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 blur-3xl -z-10" />
      <div className="flex flex-col gap-4">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">{title}</p>
        <div className="flex items-end justify-between">
           <h4 className="text-3xl font-black text-slate-100 tracking-tighter">${current.toLocaleString()}</h4>
           <div className={cn(
             "px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5 mb-1 opacity-80",
             isPositive ? (type === 'income' ? "text-emerald-400" : "text-rose-400") : (type === 'income' ? "text-rose-400" : "text-emerald-400")
           )}>
             {isPositive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
             {isPositive ? '+' : ''}{delta}%
           </div>
        </div>
        <div className="w-full bg-slate-800/40 h-1.5 rounded-full overflow-hidden">
           <div 
             className={cn("h-full transition-all duration-1000", type === 'income' ? "bg-emerald-500/60" : "bg-rose-500/60")} 
             style={{ width: `${Math.min(Math.abs(delta) + 20, 100)}%` }} 
           />
        </div>
      </div>
    </div>
  );
};

export default function Analytics() {
  const [data, setData] = useState({ 
    summary: null, 
    trends: [], 
    distribution: [], 
    health: null,
    insights: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeepAnalytics = async () => {
      try {
        setLoading(true);
        const [sum, trend, dist, health, ins] = await Promise.all([
          api.get('analytics/summary'),
          api.get('analytics/trends'),
          api.get('analytics/distribution'),
          api.get('analytics/health-score'),
          api.get('analytics/pro-insights')
        ]);
        setData({ 
          summary: sum.data, 
          trends: trend.data, 
          distribution: dist.data, 
          health: health.data,
          insights: ins.data
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDeepAnalytics();
  }, []);

  if (loading) return (
     <div className="h-[70vh] flex flex-col items-center justify-center gap-6">
        <div className="relative">
           <div className="w-20 h-20 border-4 border-indigo-600/10 border-t-indigo-600 rounded-full animate-spin" />
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <Zap className="text-indigo-400 animate-pulse" size={24} />
           </div>
        </div>
        <div className="text-center space-y-1">
           <p className="text-sm font-black text-slate-100 uppercase tracking-[4px]">Synthesizing</p>
           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Compiling Deep Portfolio Metrics...</p>
        </div>
     </div>
  );

  const { summary, trends, distribution, health, insights } = data;
  
  const savingsRate = (summary?.total_income || 0) > 0 
    ? Math.round((( (summary?.total_income || 0) - (summary?.total_expenses || 0)) / summary.total_income) * 100)
    : 0;

  const lastMonthIncome = summary?.last_month?.income || 0;
  const lastMonthExpense = summary?.last_month?.expense || 0;

  const incomeDelta = lastMonthIncome > 0 
    ? Math.round((( (summary?.total_income || 0) - lastMonthIncome) / lastMonthIncome) * 100) 
    : 0;

  const expenseDelta = lastMonthExpense > 0 
    ? Math.round((( (summary?.total_expenses || 0) - lastMonthExpense) / lastMonthExpense) * 100) 
    : 0;

  // Projected wealth (simple calculation)
  const monthlySavings = ((summary?.total_income || 0) - (summary?.total_expenses || 0)) || 0;
  const projections = Array.from({ length: 6 }, (_, i) => ({
     name: `Month ${i+1}`,
     wealth: (summary?.net_balance || 0) + (monthlySavings * (i+1))
  }));

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 mt-4 pb-20">
      {/* Dynamic Command Title */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-4 border-b border-slate-800/80">
        <div className="space-y-1.5">
           <div className="flex items-center gap-3">
             <div className="bg-indigo-600 rounded-lg p-2 text-white shadow-lg shadow-indigo-600/20">
               <Activity size={24} />
             </div>
             <h2 className="text-4xl font-black text-slate-100 tracking-tighter">Insights</h2>
           </div>
        </div>
      </div>

      {/* Intelligence Banner */}
      {insights && insights.length > 0 && (
        <div className={cn(
          "rounded-3xl p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl transition-all duration-700",
          insights[0].color === 'emerald' ? "bg-emerald-600" :
          insights[0].color === 'rose' ? "bg-rose-600" :
          insights[0].color === 'amber' ? "bg-amber-600" :
          "bg-indigo-600"
        )}>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-3xl -z-10 rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="space-y-2 relative z-10">
              <h3 className="text-2xl font-black text-white flex items-center gap-3">
                <Zap className={cn("fill-white text-white", insights[0].color === 'amber' ? "text-yellow-200 fill-yellow-200" : "")} /> {insights[0].title}
              </h3>
              <p className="text-white/90 max-w-lg text-sm font-medium leading-relaxed">
                 {insights[0].message}
              </p>
          </div>
          <button className="px-8 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/30 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all">Action Plan</button>
        </div>
      )}

      {/* MoM Pulse & Health Score */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-8">
           <div className="bg-[#0b0f17] border border-slate-800 rounded-3xl p-8 relative overflow-hidden group text-center shadow-xl">
              <div className="mb-6 space-y-1">
                 <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Vital Score</p>
                 <h4 className="text-sm font-bold text-slate-300">Financial Vitality Rating</h4>
              </div>
              <div className="relative w-40 h-40 mx-auto group-hover:scale-110 transition-all duration-700">
                 <div className="absolute inset-0 border-[10px] border-slate-800/40 rounded-full" />
                 <div 
                   className="absolute inset-0 border-[10px] border-indigo-500 rounded-full border-t-transparent border-l-transparent" 
                   style={{ transform: `rotate(${((health?.score || 0) * 3.6) - 45}deg)` }}
                 />
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <h2 className="text-5xl font-black text-slate-100 tracking-tighter">{health?.score}</h2>
                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{health?.rating}</p>
                 </div>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-4">
                 <div className="p-3 bg-slate-900/40 rounded-2xl border border-slate-800/60">
                    <p className="text-[9px] font-bold text-slate-500 uppercase">Efficiency</p>
                    <p className="text-sm font-black text-slate-200 mt-0.5">{health?.breakdown.savings_efficiency}%</p>
                 </div>
                 <div className="p-3 bg-slate-900/40 rounded-2xl border border-slate-800/60">
                    <p className="text-[9px] font-bold text-slate-500 uppercase">Indexing</p>
                    <p className="text-sm font-black text-slate-200 mt-0.5">{health?.breakdown.diversification_index}%</p>
                 </div>
              </div>
           </div>
        </div>

        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8">
           <ComparisonCard 
              title="Income Evolution" 
              current={summary?.total_income || 0} 
              delta={incomeDelta}
              type="income"
           />
           <ComparisonCard 
              title="Expense Evolution" 
              current={summary?.total_expenses || 0} 
              delta={expenseDelta}
              type="expense"
           />
           <div className="bg-[#0b0f17] border border-slate-800/60 rounded-2xl p-6 flex items-center justify-between shadow-lg">
              <div className="space-y-3">
                 <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                      <TrendingUp size={16} />
                    </div>
                    <span className="text-xs font-bold text-slate-300">Savings Target Achievement</span>
                 </div>
                 <h4 className="text-2xl font-black text-slate-100 tracking-tighter ml-1">On Track <span className="text-xs text-slate-500 font-medium">to $50k annual</span></h4>
              </div>
              <ArrowRight size={24} className="text-slate-700" />
           </div>
           <div className="bg-[#0b0f17] border border-slate-800/60 rounded-2xl p-6 flex items-center justify-between shadow-lg">
              <div className="space-y-3">
                 <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                      <Target size={16} />
                    </div>
                    <span className="text-xs font-bold text-slate-300">Spending Diversification</span>
                 </div>
                 <h4 className="text-2xl font-black text-slate-100 tracking-tighter ml-1">{distribution.length} Categories <span className="text-xs text-slate-500 font-medium">Analyzed</span></h4>
              </div>
              <ArrowRight size={24} className="text-slate-700" />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
         {/* Predictive Wealth Forecaster */}
         <div className="bg-[#0b0f17] border border-slate-800 rounded-3xl p-10 flex flex-col shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/[0.03] blur-[100px] pointer-events-none" />
            <div className="mb-12 flex items-center justify-between">
               <div className="space-y-1">
                  <h4 className="text-xl font-black text-slate-100 tracking-tighter">6-Month Wealth Forecaster</h4>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[2px]">Predictive outcome based on current velocity</p>
               </div>
               <button className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-indigo-400 group-hover:scale-125 transition-all duration-700">
                  <TrendingUp size={20} />
               </button>
            </div>
            
            <div className="flex-1 h-[320px]">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={projections} barGap={12}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                    <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} dx={-10} tickFormatter={(v) => `$${kFormatter(v)}`} />
                    <Tooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} contentStyle={{ backgroundColor: '#0d1117', border: '1px solid #1e293b', borderRadius: '16px', fontSize: '11px', fontWeight: 'bold' }} />
                    <Bar dataKey="wealth" radius={[8, 8, 0, 0]}>
                       {projections.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={index === 5 ? '#6366f1' : '#1e293b'} fillOpacity={index === 5 ? 1 : 0.6} />
                       ))}
                    </Bar>
                 </BarChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Deep Weighting (Pie with Detailed labels) */}
         <div className="bg-[#0b0f17] border border-slate-800 rounded-3xl p-10 flex flex-col shadow-2xl overflow-hidden relative">
            <div className="mb-10 text-center space-y-1">
               <h4 className="text-xl font-black text-slate-100 tracking-tighter">Categorization Weighting</h4>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-[2px]">Deep auditing of outflow diversification</p>
            </div>
            
            <div className="flex-1 min-h-[300px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2 items-center gap-10">
               <div className="relative h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie data={distribution} cx="50%" cy="50%" innerRadius={85} outerRadius={110} paddingAngle={4} dataKey="value">
                         {distribution.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                         ))}
                       </Pie>
                       <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                     <p className="text-[8px] font-black text-slate-500 uppercase tracking-[6px] ml-1.5 mb-1 text-center">Audited</p>
                     <h3 className="text-4xl font-black text-slate-100 tracking-tighter leading-none">100%</h3>
                  </div>
               </div>

               <div className="space-y-4">
                  {distribution.slice(0, 5).map((item, i) => (
                    <div key={item.name} className="flex flex-col gap-2 p-4 bg-slate-900/60 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all cursor-default relative group">
                       <div className="absolute inset-y-0 left-0 w-1 rounded-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-all" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                             <span className="text-[10px] font-black text-slate-100 uppercase tracking-widest">{item.name}</span>
                          </div>
                          <span className="text-xs font-black text-slate-300">{item.value}%</span>
                       </div>
                       <div className="text-[10px] text-slate-500 font-bold ml-3.5 leading-none tracking-tight underline decoration-slate-800 underline-offset-4">
                          ${item.amount.toLocaleString()} Allocated Total
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function kFormatter(num) {
    return Math.abs(num) > 999 ? Math.sign(num)*((Math.abs(num)/1000).toFixed(1)) + 'k' : Math.sign(num)*Math.abs(num);
}
