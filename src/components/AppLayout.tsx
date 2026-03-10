import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import AppIcon from './AppIcon';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/shipments', label: 'Shipments', icon: 'shipments' },
  { to: '/shipments/create', label: 'Create Shipment', icon: 'create' },
  { to: '/documents/upload', label: 'Upload Docs', icon: 'upload' },
  { to: '/verification', label: 'Verification', icon: 'verification' },
  { to: '/notifications', label: 'Notifications', icon: 'notifications' },
  { to: '/team', label: 'Team', icon: 'team' }
] as const;

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const {
    state: { user, notifications },
    logout
  } = useAppContext();

  const unreadCount = notifications.filter((notification) => !notification.read).length;
  const currentNav = navItems.find((item) => location.pathname.startsWith(item.to));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-slate-200 bg-white/95 px-5 py-6 backdrop-blur md:block">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-700 font-bold text-white shadow-soft">EA</div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-navy-800">ExporTrack-AI</h1>
            <p className="text-xs text-slate-500">Logistics Intelligence Platform</p>
          </div>
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `focus-ring flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
                  isActive
                    ? 'surface-glow border border-teal-100 bg-teal-50 text-teal-700'
                    : 'border border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <AppIcon name={item.icon} className="h-4 w-4" />
              </span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Active Role</p>
          <p className="mt-1 font-semibold text-navy-700">{user?.role ?? 'Staff'}</p>
          <p className="mt-2 break-all text-xs text-slate-500">{user?.email}</p>
          <div className="mt-3 rounded-lg border border-teal-100 bg-white px-2.5 py-2">
            <p className="text-[11px] uppercase tracking-wide text-slate-500">Unread Alerts</p>
            <p className="mt-0.5 text-sm font-semibold text-teal-700">{unreadCount}</p>
          </div>
        </div>
      </aside>

      <div className="md:pl-72">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 md:hidden"
                onClick={() => setMenuOpen((value) => !value)}
              >
                {menuOpen ? (
                  <span className="text-base font-semibold">X</span>
                ) : (
                  <span className="space-y-1">
                    <span className="block h-0.5 w-4 rounded bg-slate-600" />
                    <span className="block h-0.5 w-4 rounded bg-slate-600" />
                    <span className="block h-0.5 w-4 rounded bg-slate-600" />
                  </span>
                )}
              </button>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Current Page</p>
                <p className="text-sm font-semibold text-navy-800 md:text-base">{currentNav?.label ?? location.pathname}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <NavLink to="/notifications" className="btn-secondary btn-sm md:text-sm">
                Alerts
                <span className="ml-1 rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-700">{unreadCount}</span>
              </NavLink>
              <button type="button" onClick={logout} className="btn-primary btn-sm md:text-sm">
                Logout
              </button>
            </div>
          </div>
          {menuOpen ? (
            <nav className="border-t border-slate-200 bg-white px-4 pb-4 pt-3 md:hidden">
              <div className="grid grid-cols-2 gap-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `focus-ring flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium ${
                        isActive ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-700'
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
