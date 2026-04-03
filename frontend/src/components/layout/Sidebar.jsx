import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  BarChart3,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Wallet
} from 'lucide-react';
import { useAuth } from '../../providers/AuthProvider';
import { cn } from '../../lib/utils'; // Assuming cn for clean class handling

const NavItem = ({ to, icon: Icon, label, collapsed, active }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group text-sm relative",
          isActive
            ? "bg-slate-100/10 text-white font-medium"
            : "text-slate-400 hover:text-white hover:bg-slate-100/5"
        )
      }
    >
      <Icon className={cn("w-5 h-5 shrink-0", active ? "text-indigo-400" : "text-slate-400 group-hover:text-indigo-300")} />

      {!collapsed && (
        <span className="truncate whitespace-nowrap animate-in fade-in slide-in-from-left-2 underline-offset-4">
          {label}
        </span>
      )}

      {/* Tooltip for collapsed state */}
      {collapsed && (
        <div className="absolute left-full ml-3 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 border border-slate-700 shadow-xl">
          {label}
        </div>
      )}
    </NavLink>
  );
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar_collapsed');
    return saved === 'true';
  });

  const toggleSidebar = () => {
    setIsCollapsed(prev => {
      const newState = !prev;
      localStorage.setItem('sidebar_collapsed', String(newState));
      return newState;
    });
  };

  // Visibility logic based on user role
  const menuItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'analyst', 'viewer'] },
    { to: '/records', icon: ArrowLeftRight, label: 'Transactions', roles: ['admin', 'analyst', 'viewer'] },
    { to: '/analytics', icon: BarChart3, label: 'Analytics', roles: ['admin', 'analyst'] },
    { to: '/users', icon: Users, label: 'Users', roles: ['admin'] },
    { to: '/settings', icon: Settings, label: 'Settings', roles: ['admin', 'analyst', 'viewer'] }
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(user?.role));

  return (
    <aside
      className={cn(
        "relative h-screen bg-[#0d1117] border-r border-slate-800/60 flex flex-col transition-all duration-300 ease-in-out z-40",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Brand Logo */}
      <div className={cn("mt-6 mb-8 px-6 flex items-center gap-3", isCollapsed && "px-0 justify-center")}>
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
          <Wallet className="w-5 h-5 text-white" />
        </div>
        {!isCollapsed && (
          <h2 className="text-lg font-bold text-slate-100 tracking-tight animate-in fade-in duration-500">
            Fin Book
          </h2>
        )}
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 px-4 space-y-2">
        {filteredItems.map((item) => (
          <NavItem
            key={item.to}
            {...item}
            collapsed={isCollapsed}
            active={location.pathname === item.to}
          />
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-slate-800/40 mt-auto space-y-2">
        {!isCollapsed && (
          <div className="px-3 py-3 mb-2 bg-slate-800/30 rounded-xl border border-slate-700/30 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold ring-2 ring-indigo-500/10">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-200 truncate">{user?.name || 'User'}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">{user?.role}</p>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className={cn(
            "flex w-full items-center gap-3 px-3 py-2 text-sm text-slate-400 hover:text-rose-400 hover:bg-rose-400/5 rounded-lg transition-colors group",
            isCollapsed && "justify-center"
          )}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>

        {/* Collapse Toggle */}
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-indigo-400 transition-colors"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 mx-auto" />
          ) : (
            <div className="flex items-center gap-3">
              <ChevronLeft className="w-5 h-5" />
              <span className="text-xs font-medium">Collapse</span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
