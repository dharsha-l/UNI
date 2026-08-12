import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Building2, ClipboardList, FileStack, Brain,
  AlertTriangle, BookOpen, FileText, History, Settings, LogOut,
  Bell, Search, ChevronRight, Shield, Menu, X, Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/institutions', label: 'Institutions', icon: Building2 },
  { path: '/inspections', label: 'Inspections', icon: ClipboardList },
  { path: '/evidence', label: 'Evidence', icon: FileStack },
  { path: '/ai-analysis', label: 'AI Analysis', icon: Brain },
  { path: '/findings', label: 'Findings', icon: AlertTriangle },
  { path: '/regulations', label: 'Regulations', icon: BookOpen },
  { path: '/reports', label: 'Reports', icon: FileText },
  { path: '/history', label: 'Inspection History', icon: History },
  { path: '/monitoring', label: 'Monitoring', icon: Activity },
  { path: '/settings', label: 'Settings', icon: Settings },
];

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? 'w-60' : 'w-16'} flex-shrink-0 bg-[#0f172a] flex flex-col transition-all duration-300 ease-in-out`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Shield size={16} className="text-white" />
          </div>
          {sidebarOpen && (
            <div className="animate-fade-in overflow-hidden">
              <div className="text-white font-bold text-base leading-tight">InspectAI</div>
              <div className="text-slate-400 text-xs">AI-Assisted Inspection</div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto text-slate-400 hover:text-white transition-colors p-1"
          >
            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map(({ path, label, icon: Icon }) => {
            const active = location.pathname.startsWith(path);
            return (
              <Link
                key={path}
                to={path}
                className={`nav-item ${active ? 'active' : ''}`}
                title={!sidebarOpen ? label : undefined}
              >
                <Icon size={18} className="flex-shrink-0" />
                {sidebarOpen && <span className="animate-fade-in truncate">{label}</span>}
                {sidebarOpen && active && <ChevronRight size={14} className="ml-auto text-blue-400" />}
              </Link>
            );
          })}
        </nav>

        {/* User profile */}
        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.charAt(0) || 'I'}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0 animate-fade-in">
                <div className="text-white text-sm font-medium truncate">{user?.name}</div>
                <div className="text-slate-400 text-xs truncate">{user?.role}</div>
              </div>
            )}
            {sidebarOpen && (
              <button
                onClick={handleLogout}
                className="text-slate-400 hover:text-red-400 transition-colors p-1"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top nav */}
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-4 flex-shrink-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search institutions, inspections..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
            />
          </div>

          <div className="ml-auto flex items-center gap-3">
            {/* Current inspection context */}
            <div className="hidden md:flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-1.5">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse-soft" />
              <span className="text-xs font-medium text-blue-700">ABC Institute — INS-2026-001</span>
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* Inspector badge */}
            <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-1.5">
              <div className="w-7 h-7 bg-blue-700 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {user?.name?.charAt(0) || 'I'}
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-semibold text-slate-700">{user?.name}</div>
                <div className="text-xs text-slate-400">Inspector</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
