import { NavLink, useLocation } from 'react-router-dom';
import AppIcon from './AppIcon';

// Helper function for route matching - supports nested routes
const isRouteActive = (pathname: string, itemPath: string): boolean => {
  const current = pathname.toLowerCase().trim();
  const target = itemPath.toLowerCase().trim();

  // Debug logging
  console.log("PATH:", current, "| CHECK:", target);

  // 1. Exact match
  if (current === target) return true;

  // 2. Special cases for redirected routes
  // Upload Docs: /documents/upload redirects to /shipments/:id/upload
  if (target === '/documents/upload' && /^\/shipments\/[^/]+\/upload/.test(current)) {
    return true;
  }

  // Verification: /verification redirects to /shipments/:id/checklist
  if (target === '/verification' && /^\/shipments\/[^/]+\/checklist/.test(current)) {
    return true;
  }

  // 3. Avoid overlapping highlights for "Shipments" parent tab
  if (target === '/shipments') {
    // Be active for /shipments or /shipments/123, but NOT for nested tabs (create/upload/checklist)
    return /^\/shipments(\/[^/]+)?\/?$/.test(current) && !current.includes('/create');
  }

  if (target === '/shipments/create') {
    return current.startsWith('/shipments/create') || current.startsWith('/shipments/new');
  }

  // 4. Fallback for other nested routes
  if (current.startsWith(target) && target !== '/') {
    return true;
  }

  return false;
};

interface NavItem {
  to: string;
  label: string;
  icon: any;
}

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: readonly NavItem[];
}

export default function MobileSidebar({ isOpen, onClose, navItems }: MobileSidebarProps) {
  const location = useLocation();

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-950 border-r border-slate-200/60 dark:border-slate-800/60 transform transition-transform duration-300 ease-in-out md:hidden shadow-2xl flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl shadow-md overflow-hidden bg-white">
              <img src="/logo.svg" alt="ExporTrack-AI Logo" className="h-full w-full object-cover" />
            </div>
            <h1 className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              ExporTrack<span className="text-teal-600 dark:text-teal-400">AI</span>
            </h1>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <AppIcon name="x" className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const isActive = isRouteActive(location.pathname, item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={`group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-300 ease-in-out min-h-[48px] overflow-hidden ${isActive
                    ? 'bg-gradient-to-r from-slate-900 to-slate-800 text-white dark:from-slate-800 dark:to-slate-900 shadow-lg shadow-slate-900/20'
                    : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/50 hover:scale-[1.02]'
                  }`}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-teal-400 to-emerald-500 rounded-r-full shadow-lg shadow-teal-500/50" />
                )}
                <AppIcon
                  name={item.icon}
                  className={`h-5 w-5 shrink-0 transition-all duration-300 ${isActive
                      ? 'text-teal-400 scale-110 drop-shadow-lg'
                      : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                    }`}
                />
                <span className={isActive ? 'text-white' : ''}>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200/60 dark:border-slate-800/60">
          <p className="text-[10px] font-bold text-center text-slate-400 uppercase tracking-widest">
            ExporTrack AI v1.0.4
          </p>
        </div>
      </aside>
    </>
  );
}
