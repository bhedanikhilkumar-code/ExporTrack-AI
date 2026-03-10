import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', short: 'DB' },
  { to: '/shipments/new', label: 'Create Shipment', short: 'CS' },
  { to: '/search', label: 'Search & Filter', short: 'SF' },
  { to: '/notifications', label: 'Notifications', short: 'NT' },
  { to: '/team', label: 'Profile & Team', short: 'TM' },
  { to: '/admin', label: 'Admin', short: 'AD' }
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
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-slate-200 bg-white px-5 py-6 md:block">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-700 font-bold text-white">EA</div>
          <div>
            <h1 className="text-lg font-semibold text-navy-800">ExporTrack-AI</h1>
            <p className="text-xs text-slate-500">Logistics Intelligence</p>
          </div>
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-700">
                {item.short}
              </span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Active Role</p>
          <p className="mt-1 font-semibold text-navy-700">{user?.role ?? 'Staff'}</p>
          <p className="mt-2 text-xs text-slate-500">{user?.email}</p>
        </div>
      </aside>

      <div className="md:pl-72">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 md:hidden"
                onClick={() => setMenuOpen((value) => !value)}
              >
                {menuOpen ? 'X' : 'Menu'}
              </button>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Current Page</p>
                <p className="text-sm font-semibold text-navy-800">{currentNav?.label ?? location.pathname}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <NavLink
                to="/notifications"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
              >
                Alerts
                <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700">{unreadCount}</span>
              </NavLink>
              <button
                type="button"
                onClick={logout}
                className="rounded-lg bg-navy-700 px-3 py-2 text-sm font-medium text-white hover:bg-navy-800"
              >
                Logout
              </button>
            </div>
          </div>
          {menuOpen ? (
            <nav className="border-t border-slate-200 bg-white px-4 pb-4 pt-2 md:hidden">
              <div className="grid grid-cols-2 gap-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `rounded-lg px-3 py-2 text-center text-sm font-medium ${
                        isActive ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-700'
                      }`
                    }
                  >
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
