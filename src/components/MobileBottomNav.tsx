import { NavLink } from 'react-router-dom';
import AppIcon from './AppIcon';

interface MobileNavItem {
  to: string;
  label: string;
  icon: any;
  isCenter?: boolean;
}

const mobileNavItems: MobileNavItem[] = [
  { to: '/dashboard', label: 'Home', icon: 'home' },
  { to: '/analytics', label: 'Analytics', icon: 'bar-chart' },
  { to: '/shipments/create', label: 'Create', icon: 'plus', isCenter: true },
  { to: '/shipments', label: 'Shipments', icon: 'shipments' },
  { to: '/team-workspace', label: 'Team', icon: 'users' },
];

export default function MobileBottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-slate-200/60 bg-white/80 px-2 pb-safe-bottom pt-2 backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-950/80 md:hidden shadow-[0_-1px_10px_rgba(0,0,0,0.05)]">
      {mobileNavItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 py-1 transition-all duration-200 ${
              item.isCenter 
                ? '!-mt-8 h-14 w-14 rounded-full bg-slate-900 dark:bg-teal-500 text-white shadow-lg active:scale-95'
                : isActive
                ? 'text-slate-900 dark:text-teal-400'
                : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
            }`
          }
        >
          <div className={`${item.isCenter ? 'flex h-10 w-10 items-center justify-center' : ''}`}>
            <AppIcon 
              name={item.icon} 
              className={`${item.isCenter ? 'h-6 w-6' : 'h-5 w-5'}`} 
              strokeWidth={item.isCenter ? 3 : 2}
            />
          </div>
          {!item.isCenter && (
            <span className="text-[10px] font-bold uppercase tracking-tight">
              {item.label}
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
