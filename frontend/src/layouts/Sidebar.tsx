import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';
import {
  LayoutDashboard, BookOpen, Mic2, History, FileText,
  MessageSquare, User, Info, Brain, X, Sparkles, Sun, Moon,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface NavGroup {
  title: string;
  items: {
    to: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[];
}

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { currentSession, profile, theme, toggleTheme } = useApp();

  // Smart destination for Mock Interview
  const mockInterviewPath = currentSession?.id && currentSession.status === 'active'
    ? `/interview/${currentSession.id}`
    : profile
    ? '/prepare/setup'
    : '/prepare';

  const NAV_GROUPS: NavGroup[] = [
    {
      title: 'Workspace',
      items: [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/prepare', label: 'Setup Profile', icon: BookOpen },
        { to: mockInterviewPath, label: 'Mock Interview', icon: Mic2, badge: currentSession?.status === 'active' ? 'Active' : undefined },
        { to: '/history', label: 'Interview History', icon: History },
        { to: currentSession?.id ? `/reports/${currentSession.id}` : '/history', label: 'Performance Report', icon: FileText },
      ],
    },
    {
      title: 'AI Coaching',
      items: [
        { to: '/chat', label: 'AI Assistant', icon: MessageSquare, badge: 'AI' },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { to: '/profile', label: 'Candidate Profile', icon: User },
        { to: '/about', label: 'About & System', icon: Info },
      ],
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={clsx(
          'fixed top-0 left-0 h-full w-64 bg-slate-900 text-slate-300 border-r border-slate-800/80 z-40',
          'flex flex-col transition-transform duration-200 ease-in-out select-none',
          'lg:translate-x-0 lg:static lg:z-auto shadow-2xl lg:shadow-none',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-800">
          <NavLink to="/" className="flex items-center gap-3 group" onClick={onClose}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-900/40 ring-1 ring-white/10 group-hover:scale-105 transition-transform">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white tracking-tight text-sm">AI Interview</span>
                <span className="text-[10px] uppercase font-semibold tracking-wider bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded border border-indigo-500/30">Coach</span>
              </div>
              <p className="text-[11px] text-slate-400 font-normal">Career Preparation</p>
            </div>
          </NavLink>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Groups */}
        <nav className="flex-1 py-4 px-3 space-y-6 overflow-y-auto custom-scrollbar">
          {NAV_GROUPS.map((group) => (
            <div key={group.title} className="space-y-1">
              <div className="px-3 pb-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {group.title}
              </div>
              {group.items.map(({ to, label, icon: Icon, badge }) => (
                <NavLink
                  key={to + label}
                  to={to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group',
                      isActive
                        ? 'bg-indigo-600/90 text-white font-semibold shadow-sm shadow-indigo-950 ring-1 ring-white/10'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                    )
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 flex-shrink-0 text-slate-400 group-hover:text-white transition-colors" />
                    <span className="truncate">{label}</span>
                  </div>
                  {badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* User / Agent Footprint + Theme Toggle */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-semibold text-slate-400">Interface Theme</span>
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 text-xs transition-colors cursor-pointer"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[10px] font-bold">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-[10px] font-bold">Dark Mode</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-2.5 border border-slate-700/50 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium text-slate-200 truncate">IBM watsonx</p>
              <p className="text-[10px] text-slate-400 truncate">Orchestrate Agent</p>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20" title="Connected" />
          </div>
        </div>
      </aside>
    </>
  );
}
