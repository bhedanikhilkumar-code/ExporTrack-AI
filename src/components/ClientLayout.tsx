import { useState } from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import AppIcon from './AppIcon';
import { useScrollDirection } from '../hooks/useScrollDirection';

const clientNavItems = [
  { to: '/client/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/client/shipments', label: 'My Shipments', icon: 'shipments' },
] as const;

export default function ClientLayout() {
  const { state: { isAuthenticated, user, theme }, logout, toggleTheme } = useAppContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { isVisible: isHeaderVisible } = useScrollDirection();

  if (!isAuthenticated) return <Navigate to="/client/login" state={{ from: location }} replace />;
  if (user?.role !== 'Client') return <Navigate to="/dashboard" replace />;

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 font-sans antialiased text-slate-900 transition-colors duration-300 ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm lg:hidden animate-in fade-in"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200/60 bg-white/95 dark:border-slate-800/60 dark:bg-slate-950/95 backdrop-blur-xl transition-all duration-300 ease-out lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center justify-between px-5 border-b border-slate-200/60 dark:border-slate-800/60 bg-gradient-to-r from-white to-slate-50 dark:from-slate-950 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg ring-2 ring-indigo-100 dark:ring-indigo-900/50">
              <AppIcon name="shipments" className="h-5 w-5 text-white" strokeWidth={2} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white" style={{ letterSpacing: '-0.04em' }}>
                Client Portal
              </span>
              <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500 tracking-wider">DASHBOARD</span>
            </div>
          </div>
          <button onClick={closeSidebar} className="lg:hidden p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <AppIcon name="x" className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <div className="mb-3 px-3 text-[10px] font-black uppercase tracking-widest text-slate-400/70">Navigation</div>
          {clientNavItems.map((item, index) => {
            const isActive = location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={closeSidebar}
                className={`group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-300 ease-out hover:scale-[1.02] ${isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/25 scale-[1.02]'
                  : 'text-slate-500 hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-gradient-to-r dark:hover:from-slate-800 dark:hover:to-slate-900 dark:hover:text-slate-100'
                  }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/30 rounded-r-full" />
                )}
                <AppIcon
                  name={item.icon as any}
                  className={`h-5 w-5 shrink-0 transition-all duration-300 ${isActive ? 'text-white drop-shadow-md' : 'group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:scale-110'}`}
                />
                {item.label}
                {!isActive && (
                  <span className="absolute right-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-[-4px] transition-all duration-200 text-slate-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200/60 dark:border-slate-800/60 bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900">
          <button onClick={logout} className="w-full group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-rose-500 hover:bg-gradient-to-r hover:from-rose-50 hover:to-rose-100 dark:hover:bg-rose-900/20 transition-all duration-300 hover:scale-[1.02]">
            <div className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-900/30 group-hover:bg-rose-200 dark:group-hover:bg-rose-800/50 transition-colors">
              <AppIcon name="logout" className="h-4 w-4" />
            </div>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <header className={`sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-slate-200/60 bg-white/80 px-4 shadow-sm backdrop-blur-md dark:border-slate-800/60 dark:bg-slate-900/80 sm:px-6 transition-transform duration-300 ease-in-out ${isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
          }`}>
          <button
            type="button"
            className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 dark:border-slate-700 sm:h-10 sm:w-10"
            onClick={() => setIsSidebarOpen(true)}
          >
            <AppIcon name="menu" className="h-5 w-5" />
          </button>

          <div className="flex flex-1 items-center justify-end gap-x-4 lg:gap-x-6">
            <button onClick={toggleTheme} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-500 dark:hover:bg-slate-800 transition-colors active-press">
              <AppIcon name={theme === 'dark' ? 'sun' : 'moon'} className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">{user?.name}</p>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{user?.role}</p>
              </div>
              <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 flex items-center justify-center font-bold">
                {user?.name?.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <div key={location.pathname} className="page-wrapper page-transition-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
