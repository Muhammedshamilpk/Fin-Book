import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Search, Command } from 'lucide-react';
import { useAuth } from '../../providers/AuthProvider';
import { cn } from '../../lib/utils';

export default function DashboardLayout() {
  const { user } = useAuth();
  const [searchValue, setSearchValue] = useState('');
  const location = useLocation();
  
  const now = new Date();
  const greeting = now.getHours() < 12 
    ? 'Good Morning' 
    : now.getHours() < 18 
      ? 'Good Afternoon' 
      : 'Good Evening';

  const roleTitle = user?.role === 'admin' 
    ? 'Financial Administrator' 
    : user?.role === 'analyst' 
      ? 'Financial Analyst' 
      : 'Dashboard Viewer';

  return (
    <div className="flex h-screen bg-[#080c14] text-slate-100 overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Modern SaaS Header */}
        <header className="h-16 border-b border-slate-800/60 bg-[#0d1117]/80 backdrop-blur-md flex items-center justify-between px-8 z-30 shrink-0">
          <div>
            <h2 className="text-sm font-medium text-slate-400">
              {greeting}, <span className="text-slate-100 font-semibold">{user?.name || 'Partner'}</span>
            </h2>
          </div>

          <div className="flex items-center gap-6">
            {/* Global Search Interface */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-800/40 border border-slate-700/50 rounded-lg w-64 group hover:border-slate-600/50 transition-all">
              <Search className="w-4 h-4 text-slate-500 group-hover:text-slate-400" />
              <input 
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search anything..."
                className="bg-transparent border-none text-sm text-slate-100 w-full focus:ring-0 placeholder:text-slate-500 outline-none"
              />
              <kbd className="hidden lg:flex items-center gap-1 px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-[10px] text-slate-500 font-mono">
                <Command className="w-2.5 h-2.5" /> K
              </kbd>
            </div>

            {/* User Profile Summary */}
            <div className="flex items-center gap-4 border-l border-slate-800 pl-6">
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block overflow-hidden max-w-[120px]">
                  <p className="text-xs font-semibold text-slate-200 truncate">{user?.name}</p>
                  <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tight truncate">{roleTitle}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-indigo-400 shadow-inner">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dash Main Viewport */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent relative">
          <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="container mx-auto p-8 max-w-7xl animate-in fade-in duration-700">
            {/* We pass the global search term to the outlet via context */}
            <Outlet context={{ searchTerm: searchValue }} />
          </div>
        </main>
      </div>
    </div>
  );
}
