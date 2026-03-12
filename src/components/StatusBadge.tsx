interface StatusBadgeProps {
  value: string;
}

const statusMap: Record<string, { tone: string; dot: string }> = {
  Pending: { 
    tone: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/30 dark:bg-amber-900/20 dark:text-amber-400', 
    dot: 'bg-amber-500' 
  },
  Verified: { 
    tone: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/30 dark:bg-emerald-900/20 dark:text-emerald-400', 
    dot: 'bg-emerald-500' 
  },
  Missing: { 
    tone: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/30 dark:bg-rose-900/20 dark:text-rose-400', 
    dot: 'bg-rose-500' 
  },
  Rejected: { 
    tone: 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-400', 
    dot: 'bg-red-500' 
  },
  'In Transit': { 
    tone: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/30 dark:bg-sky-900/20 dark:text-sky-400', 
    dot: 'bg-sky-500' 
  },
  'Under Verification': { 
    tone: 'border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-900/30 dark:bg-cyan-900/20 dark:text-cyan-400', 
    dot: 'bg-cyan-500' 
  },
  'Awaiting Documents': { 
    tone: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/30 dark:bg-violet-900/20 dark:text-violet-400', 
    dot: 'bg-violet-500' 
  },
  'Customs Hold': { 
    tone: 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/30 dark:bg-orange-900/20 dark:text-orange-400', 
    dot: 'bg-orange-500' 
  },
  Delivered: { 
    tone: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/30 dark:bg-emerald-900/20 dark:text-emerald-400', 
    dot: 'bg-emerald-500' 
  },
  High: { 
    tone: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/30 dark:bg-rose-900/20 dark:text-rose-400', 
    dot: 'bg-rose-500' 
  },
  Medium: { 
    tone: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/30 dark:bg-amber-900/20 dark:text-amber-400', 
    dot: 'bg-amber-500' 
  },
  Low: { 
    tone: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/30 dark:bg-emerald-900/20 dark:text-emerald-400', 
    dot: 'bg-emerald-500' 
  },
  Admin: { 
    tone: 'border-navy-100 bg-navy-50 text-navy-700 dark:border-teal-900/40 dark:bg-teal-900/20 dark:text-teal-400', 
    dot: 'bg-navy-600 dark:bg-teal-400' 
  },
  Manager: { 
    tone: 'border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-900/40 dark:bg-teal-900/20 dark:text-teal-400', 
    dot: 'bg-teal-600 dark:bg-teal-400' 
  },
  Staff: { 
    tone: 'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300', 
    dot: 'bg-slate-500' 
  },
  Deadline: { 
    tone: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/30 dark:bg-amber-900/20 dark:text-amber-400', 
    dot: 'bg-amber-500' 
  },
  'Missing Docs': { 
    tone: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/30 dark:bg-rose-900/20 dark:text-rose-400', 
    dot: 'bg-rose-500' 
  },
  'Approval Delay': { 
    tone: 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/30 dark:bg-orange-900/20 dark:text-orange-400', 
    dot: 'bg-orange-500' 
  }
};

export default function StatusBadge({ value }: StatusBadgeProps) {
  const styles = statusMap[value] ?? { tone: 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300', dot: 'bg-slate-400' };

  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${styles.tone}`}>
      <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${styles.dot}`} aria-hidden />
      {value}
    </span>
  );
}
