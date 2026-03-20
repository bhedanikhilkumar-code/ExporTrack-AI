import { useNavigate } from 'react-router-dom';
import AppIcon from './AppIcon';
import { useScrollDirection } from '../hooks/useScrollDirection';

export default function MobileFAB() {
  const navigate = useNavigate();
  const isVisible = useScrollDirection();

  return (
    <button
      onClick={() => navigate('/shipments/create')}
      className={`fixed right-6 z-40 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-900/20 active:scale-95 active:shadow-sm dark:bg-teal-500 dark:shadow-teal-500/20 transition-all duration-200 active-press md:hidden border border-white/10 ${
        isVisible ? 'bottom-24 opacity-100 translate-y-0' : 'bottom-24 opacity-0 translate-y-20 pointer-events-none'
      }`}
      aria-label="Create Shipment"
    >
      <div className="absolute inset-0 rounded-full animate-ping bg-slate-900/20 dark:bg-teal-500/20" />
      <AppIcon name="plus" className="h-6 w-6 relative z-10" strokeWidth={3} />
    </button>
  );
}
