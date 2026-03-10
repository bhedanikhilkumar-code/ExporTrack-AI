interface StatusBadgeProps {
  value: string;
}

const statusMap: Record<string, { tone: string; dot: string }> = {
  Pending: { tone: 'border-amber-200 bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  Verified: { tone: 'border-emerald-200 bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  Missing: { tone: 'border-rose-200 bg-rose-50 text-rose-700', dot: 'bg-rose-500' },
  Rejected: { tone: 'border-red-200 bg-red-50 text-red-700', dot: 'bg-red-500' },
  'In Transit': { tone: 'border-sky-200 bg-sky-50 text-sky-700', dot: 'bg-sky-500' },
  'Under Verification': { tone: 'border-cyan-200 bg-cyan-50 text-cyan-700', dot: 'bg-cyan-500' },
  'Awaiting Documents': { tone: 'border-violet-200 bg-violet-50 text-violet-700', dot: 'bg-violet-500' },
  'Customs Hold': { tone: 'border-orange-200 bg-orange-50 text-orange-700', dot: 'bg-orange-500' },
  Delivered: { tone: 'border-emerald-200 bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  High: { tone: 'border-rose-200 bg-rose-50 text-rose-700', dot: 'bg-rose-500' },
  Medium: { tone: 'border-amber-200 bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  Low: { tone: 'border-emerald-200 bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  Admin: { tone: 'border-navy-100 bg-navy-50 text-navy-700', dot: 'bg-navy-600' },
  Manager: { tone: 'border-teal-200 bg-teal-50 text-teal-700', dot: 'bg-teal-600' },
  Staff: { tone: 'border-slate-300 bg-slate-100 text-slate-700', dot: 'bg-slate-500' },
  Deadline: { tone: 'border-amber-200 bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  'Missing Docs': { tone: 'border-rose-200 bg-rose-50 text-rose-700', dot: 'bg-rose-500' },
  'Approval Delay': { tone: 'border-orange-200 bg-orange-50 text-orange-700', dot: 'bg-orange-500' }
};

export default function StatusBadge({ value }: StatusBadgeProps) {
  const styles = statusMap[value] ?? { tone: 'border-slate-200 bg-slate-100 text-slate-700', dot: 'bg-slate-400' };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${styles.tone}`}>
      <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${styles.dot}`} aria-hidden />
      {value}
    </span>
  );
}

