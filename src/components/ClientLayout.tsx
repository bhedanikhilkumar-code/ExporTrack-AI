import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import AppIcon from './AppIcon';

const clientNavItems = [
  { to: '/client/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/client/shipments', label: 'My Shipments', icon: 'shipments' },
] as const;

export default function ClientLayout() {
  const { state: { isAuthenticated, user, theme }, logout, toggleTheme } = useAppContext();
  const location = useLocation();

  if (!isAuthenticated) return <Navigate to="/client/login" state={{ from: location }} replace />;
  if (user?.role !== 'Client') return <Navigate to="/dashboard" replace />;

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 font-sans antialiased text-slate-900 transition-colors duration-300 ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200/60 bg-white dark:border-slate-800/60 dark:bg-slate-900/95 backdrop-blur-md">
        <div className="flex h-16 items-center gap-3 px-6 border-b border-slate-200/60 dark:border-slate-800/60">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-md">
            <AppIcon name="shipments" className="h-5 w-5 text-white" strokeWidth={2} />
          </div>
          <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white" style={{ letterSpacing: '-0.04em' }}>
            Client Portal
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <div className="mb-2 px-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Navigation</div>
          {clientNavItems.map(item => {
            const isActive = location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200'
                }`}
              >
                <AppIcon name={item.icon as any} className={`h-5 w-5 transition-transform group-hover:scale-110 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-500 dark:group-hover:text-slate-300'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200/60 dark:border-slate-800/60">
          <button onClick={logout} className="w-full group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10 transition-all">
            <AppIcon name="user" className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="pl-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-slate-200/60 bg-white/80 px-4 shadow-sm backdrop-blur-md dark:border-slate-800/60 dark:bg-slate-900/80 sm:px-6">
          <div className="flex flex-1 items-center justify-end gap-x-4 lg:gap-x-6">
            <button onClick={toggleTheme} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-500 dark:hover:bg-slate-800 transition-colors">
              <AppIcon name={theme === 'dark' ? 'sun' : 'moon'} className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">{user?.name}</p>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{user?.role}</p>
              </div>
              <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 flex items-center justify-center font-bold">
                {user?.name.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
