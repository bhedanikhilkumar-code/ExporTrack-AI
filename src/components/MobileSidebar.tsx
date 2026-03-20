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
      {/* Overlay with blur effect */}
      <div
        className={`fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-md transition-all duration-300 md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={onClose}
      />

      {/* Drawer - Slide in from left with animation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-slate-950 border-r border-slate-200/60 dark:border-slate-800/60 transform transition-all duration-300 ease-out md:hidden shadow-2xl flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-slate-200/60 dark:border-slate-800/60 bg-gradient-to-r from-white to-slate-50 dark:from-slate-950 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl shadow-lg ring-2 ring-slate-100 dark:ring-slate-800 overflow-hidden bg-white">
              <img src="/logo.svg" alt="ExporTrack-AI Logo" className="h-full w-full object-cover" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                ExporTrack<span className="text-teal-600 dark:text-teal-400">AI</span>
              </h1>
              <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500 tracking-wider">LOGISTICS</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <AppIcon name="x" className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          {navItems.map((item, index) => {
            const isActive = isRouteActive(location.pathname, item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={`group relative flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold transition-all duration-300 ease-out min-h-[52px] overflow-hidden ${isActive
                  ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg shadow-teal-600/25 scale-[1.02]'
                  : 'text-slate-500 hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:text-slate-400 dark:hover:bg-gradient-to-r dark:hover:from-slate-800 dark:hover:to-slate-900 hover:scale-[1.02]'
                  }`}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/30 rounded-r-full" />
                )}
                {/* Glow effect */}
                {isActive && (
                  <div className="absolute inset-0 bg-white/10 animate-pulse" />
                )}
                <div className="relative z-10 flex items-center gap-3">
                  <AppIcon
                    name={item.icon}
                    className={`h-5 w-5 shrink-0 transition-all duration-300 ${isActive
                      ? 'text-white drop-shadow-md'
                      : 'text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 group-hover:scale-110'
                      }`}
                  />
                  <span className={isActive ? 'text-white' : ''}>{item.label}</span>
                </div>
                {/* Arrow indicator */}
                {!isActive && (
                  <span className="absolute right-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-[-4px] transition-all duration-200 text-slate-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200/60 dark:border-slate-800/60 bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900">
          <p className="text-[10px] font-bold text-center text-slate-400 uppercase tracking-widest">
            ExporTrack AI v1.0.4 • Powered by AI
          </p>
        </div>
      </aside>
    </>
  );
}
