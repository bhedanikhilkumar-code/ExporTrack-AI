import { NavLink } from 'react-router-dom';
import AppIcon from './AppIcon';

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
  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-950 border-r border-slate-200/60 dark:border-slate-800/60 transform transition-transform duration-300 ease-in-out md:hidden shadow-2xl flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl shadow-md overflow-hidden bg-white">
              <img src="/logo.png" alt="ExporTrack-AI Logo" className="h-full w-full object-cover" />
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
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-teal-500/10 dark:text-teal-400 shadow-md'
                    : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/50'
                }`
              }
            >
              <AppIcon name={item.icon} className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
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
