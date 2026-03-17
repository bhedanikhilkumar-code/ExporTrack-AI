import AppIcon from './AppIcon';

interface StatusBadgeProps {
  value: string;
}

type IconName = 'check' | 'clock' | 'warning' | 'cross' | 'shipments' | 'verification' | 'upload' | 'team' | 'user' | 'shield';

const statusMap: Record<string, { tone: string; dot: string; icon?: IconName }> = {
  Pending: {
    tone: 'bg-amber-50/80 text-amber-700 border-amber-200/60 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
    dot: 'bg-amber-500',
    icon: 'clock'
  },
  Verified: {
    tone: 'bg-emerald-50/80 text-emerald-700 border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    dot: 'bg-emerald-500',
    icon: 'check'
  },
  Missing: {
    tone: 'bg-rose-50/80 text-rose-700 border-rose-200/60 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20',
    dot: 'bg-rose-500',
    icon: 'warning'
  },
  Rejected: {
    tone: 'bg-red-50/80 text-red-700 border-red-200/60 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
    dot: 'bg-red-500',
    icon: 'cross'
  },
  'Shipment Created': {
    tone: 'bg-slate-50/80 text-slate-700 border-slate-200/60 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20',
    dot: 'bg-slate-500',
    icon: 'clock'
  },
  // New automation statuses
  'Draft': {
    tone: 'bg-slate-50/80 text-slate-700 border-slate-200/60 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20',
    dot: 'bg-slate-500',
    icon: 'clock'
  },
  'Booked': {
    tone: 'bg-blue-50/80 text-blue-700 border-blue-200/60 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
    dot: 'bg-blue-500',
    icon: 'shipments'
  },
  'Driver Assigned': {
    tone: 'bg-indigo-50/80 text-indigo-700 border-indigo-200/60 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20',
    dot: 'bg-indigo-500',
    icon: 'team'
  },
  'Picked Up': {
    tone: 'bg-blue-50/80 text-blue-700 border-blue-200/60 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
    dot: 'bg-blue-500',
    icon: 'shipments'
  },
  'In Transit': {
    tone: 'bg-teal-50/80 text-teal-700 border-teal-200/60 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/20',
    dot: 'bg-teal-500',
    icon: 'shipments'
  },
  // New automation status - Customs Clearance
  'Customs Clearance': {
    tone: 'bg-purple-50/80 text-purple-700 border-purple-200/60 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20',
    dot: 'bg-purple-500',
    icon: 'shield'
  },
  'Reached Hub': {
    tone: 'bg-cyan-50/80 text-cyan-700 border-cyan-200/60 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/20',
    dot: 'bg-cyan-500',
    icon: 'verification'
  },
  'Out For Delivery': {
    tone: 'bg-blue-50/80 text-blue-700 border-blue-200/60 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
    dot: 'bg-blue-500',
    icon: 'shipments'
  },
  Delivered: {
    tone: 'bg-emerald-50/80 text-emerald-700 border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    dot: 'bg-emerald-500',
    icon: 'check'
  },
  'Delayed': {
    tone: 'bg-rose-50/80 text-rose-700 border-rose-200/60 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20',
    dot: 'bg-rose-500',
    icon: 'warning'
  },
  High: {
    tone: 'bg-rose-50/80 text-rose-700 border-rose-200/60 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20',
    dot: 'bg-rose-500'
  },
  Medium: {
    tone: 'bg-amber-50/80 text-amber-700 border-amber-200/60 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
    dot: 'bg-amber-500'
  },
  Low: {
    tone: 'bg-emerald-50/80 text-emerald-700 border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    dot: 'bg-emerald-500'
  },
  Admin: {
    tone: 'bg-slate-900 border-transparent text-white dark:bg-teal-500/20 dark:text-teal-400 dark:border-teal-500/30',
    dot: 'bg-white dark:bg-teal-400'
  },
  Manager: {
    tone: 'bg-slate-800 border-transparent text-white dark:bg-teal-500/10 dark:text-teal-300 dark:border-teal-500/20',
    dot: 'bg-slate-300 dark:bg-teal-400'
  },
  Staff: {
    tone: 'bg-slate-100/80 text-slate-600 border-slate-200/60 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
    dot: 'bg-slate-400'
  },
  Client: {
    tone: 'bg-indigo-50/80 text-indigo-700 border-indigo-200/60 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20',
    dot: 'bg-indigo-500'
  }
};

export default function StatusBadge({ value }: StatusBadgeProps) {
  const styles = statusMap[value] || statusMap[value.split(' ')[0]] || {
    tone: 'bg-slate-50 text-slate-500 border-slate-100 dark:bg-slate-900/50 dark:text-slate-500 dark:border-slate-800',
    dot: 'bg-slate-300'
  };

  const isLive = ['In Transit', 'Out For Delivery', 'Driver Assigned'].includes(value);

  return (
    <span className={`inline-flex shrink-0 items-center rounded-md border px-2 py-0.5 text-[10px] sm:text-[9px] font-black tracking-widest uppercase shadow-sm transition-all duration-300 ${styles.tone}`}>
      {styles.icon ? (
        <div className={`relative flex items-center justify-center mr-1.5 ${isLive ? 'animate-status-pulse' : ''}`}>
          <AppIcon name={styles.icon as any} className="h-3 w-3" strokeWidth={2.5} />
        </div>
      ) : (
        <span className={`mr-2 h-1.5 w-1.5 rounded-full ring-2 ring-white/10 dark:ring-black/10 ${styles.dot} ${isLive ? 'animate-status-pulse' : ''}`} aria-hidden />
      )}
      <span className="truncate leading-none">{value}</span>
    </span>
  );
}
