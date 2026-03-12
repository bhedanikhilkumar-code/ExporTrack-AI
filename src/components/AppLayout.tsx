import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import AppIcon from './AppIcon';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/shipments', label: 'Shipments', icon: 'shipments' },
  { to: '/shipments/create', label: 'Create Shipment', icon: 'create' },
  { to: '/documents/upload', label: 'Upload Docs', icon: 'upload' },
  { to: '/ai-extraction', label: 'AI Extraction', icon: 'ai-extract' },
  { to: '/verification', label: 'Verification', icon: 'verification' },
  { to: '/notifications', label: 'Notifications', icon: 'notifications' },
  { to: '/team', label: 'Team', icon: 'team' }
] as const;

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const {
    state: { user, notifications, theme },
    logout,
    toggleTheme
  } = useAppContext();

  const unreadCount = notifications.filter((notification) => !notification.read).length;
  const currentNav = navItems.find((item) => location.pathname.startsWith(item.to));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-slate-200 bg-white/95 px-5 py-6 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 md:block">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-700 font-bold text-white shadow-soft dark:bg-teal-600">EA</div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-navy-800 dark:text-slate-100">ExporTrack-AI</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Logistics Intelligence</p>
          </div>
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `focus-ring flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'surface-glow border border-teal-100 bg-teal-50 text-teal-700 dark:border-teal-900/30 dark:bg-teal-900/20 dark:text-teal-400'
                    : 'border border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                }`
              }
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                <AppIcon name={item.icon} className="h-4 w-4" />
              </span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/30">
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Active Role</p>
          <p className="mt-1 font-semibold text-navy-700 dark:text-teal-400">{user?.role ?? 'Staff'}</p>
          <p className="mt-2 break-all text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
          <div className="mt-3 rounded-lg border border-teal-100 bg-white px-2.5 py-2 dark:border-teal-900/30 dark:bg-slate-800">
            <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Unread Alerts</p>
            <p className="mt-0.5 text-sm font-semibold text-teal-700 dark:text-teal-400">{unreadCount}</p>
          </div>
        </div>
      </aside>

      <div className="md:pl-72">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400 md:hidden"
                onClick={() => setMenuOpen((value) => !value)}
              >
                {menuOpen ? (
                  <span className="text-base font-semibold">X</span>
                ) : (
                  <span className="space-y-1">
                    <span className="block h-0.5 w-4 rounded bg-slate-600 dark:bg-slate-400" />
                    <span className="block h-0.5 w-4 rounded bg-slate-600 dark:bg-slate-400" />
                    <span className="block h-0.5 w-4 rounded bg-slate-600 dark:bg-slate-400" />
                  </span>
                )}
              </button>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500">ExporTrack</p>
                <p className="text-sm font-bold text-navy-800 dark:text-slate-100 md:text-base">{currentNav?.label ?? location.pathname}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="focus-ring flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-teal-400 dark:hover:bg-slate-700 transition-all active:scale-95"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                <AppIcon name={theme === 'dark' ? 'sun' : 'moon'} className="h-5 w-5" />
              </button>
              
              <NavLink to="/notifications" className="btn-secondary btn-sm md:text-sm">
                Alerts
                <span className="ml-1 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">{unreadCount}</span>
              </NavLink>
              <button type="button" onClick={logout} className="btn-primary btn-sm md:text-sm px-4">
                Logout
              </button>
            </div>
          </div>
          {menuOpen ? (
            <nav className="border-t border-slate-200 bg-white px-4 pb-4 pt-3 dark:border-slate-800 dark:bg-slate-900 md:hidden">
              <div className="grid grid-cols-2 gap-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `focus-ring flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium ${
                        isActive 
                          ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400' 
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                      }`
                    }
                  >
                    <AppIcon name={item.icon} className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </nav>
          ) : null}
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
