import AppIcon from './AppIcon';

interface StatusBadgeProps {
  value: string;
}

type IconName = 'check' | 'clock' | 'warning' | 'cross' | 'shipments' | 'verification' | 'upload';

const statusMap: Record<string, { tone: string; dot: string; icon?: IconName }> = {
  Pending: { 
    tone: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20', 
    dot: 'bg-amber-500',
    icon: 'clock'
  },
  Verified: { 
    tone: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20', 
    dot: 'bg-emerald-500',
    icon: 'check'
  },
  Missing: { 
    tone: 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20', 
    dot: 'bg-rose-500',
    icon: 'warning'
  },
  Rejected: { 
    tone: 'bg-red-50 text-red-700 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20', 
    dot: 'bg-red-500',
    icon: 'cross'
  },
  'In Transit': { 
    tone: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20', 
    dot: 'bg-blue-500',
    icon: 'shipments'
  },
  'Under Verification': { 
    tone: 'bg-cyan-50 text-cyan-700 border-cyan-100 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/20', 
    dot: 'bg-cyan-500',
    icon: 'verification'
  },
  'Awaiting Documents': { 
    tone: 'bg-violet-50 text-violet-700 border-violet-100 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20', 
    dot: 'bg-violet-500',
    icon: 'upload'
  },
  'Customs Hold': { 
    tone: 'bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20', 
    dot: 'bg-orange-500',
    icon: 'warning'
  },
  Delivered: { 
    tone: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20', 
    dot: 'bg-emerald-500',
    icon: 'check'
  },
  High: { 
    tone: 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20', 
    dot: 'bg-rose-500' 
  },
  Medium: { 
    tone: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20', 
    dot: 'bg-amber-500' 
  },
  Low: { 
    tone: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20', 
    dot: 'bg-emerald-500' 
  },
  Admin: { 
    tone: 'bg-slate-900 text-white border-transparent dark:bg-teal-500/20 dark:text-teal-400 dark:border-teal-500/30', 
    dot: 'bg-white dark:bg-teal-400' 
  },
  Manager: { 
    tone: 'bg-slate-800 text-white border-transparent dark:bg-teal-500/10 dark:text-teal-300 dark:border-teal-500/20', 
    dot: 'bg-slate-300 dark:bg-teal-400' 
  },
  Staff: { 
    tone: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700', 
    dot: 'bg-slate-400' 
  }
};

export default function StatusBadge({ value }: StatusBadgeProps) {
  const styles = statusMap[value] || statusMap[value.split(' ')[0]] || { 
    tone: 'bg-slate-50 text-slate-500 border-slate-100 dark:bg-slate-900/50 dark:text-slate-500 dark:border-slate-800', 
    dot: 'bg-slate-300' 
  };

  return (
    <span className={`inline-flex shrink-0 items-center rounded-md border px-1.5 py-0.5 text-[10px] font-bold tracking-tight transition-all ${styles.tone}`}>
      {styles.icon ? (
        <AppIcon name={styles.icon as any} className="mr-1 h-3 w-3 opacity-80" />
      ) : (
        <span className={`mr-1.5 h-1 w-1 rounded-full ${styles.dot}`} aria-hidden />
      )}
      <span className="truncate">{value}</span>
    </span>
  );
}
