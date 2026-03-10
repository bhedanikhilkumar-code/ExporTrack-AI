interface StatusBadgeProps {
  value: string;
}

const statusMap: Record<string, string> = {
  Pending: 'border-amber-200 bg-amber-50 text-amber-700',
  Verified: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  Missing: 'border-rose-200 bg-rose-50 text-rose-700',
  Rejected: 'border-red-200 bg-red-50 text-red-700',
  'In Transit': 'border-sky-200 bg-sky-50 text-sky-700',
  'Under Verification': 'border-cyan-200 bg-cyan-50 text-cyan-700',
  'Awaiting Documents': 'border-violet-200 bg-violet-50 text-violet-700',
  'Customs Hold': 'border-orange-200 bg-orange-50 text-orange-700',
  Delivered: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  High: 'border-rose-200 bg-rose-50 text-rose-700',
  Medium: 'border-amber-200 bg-amber-50 text-amber-700',
  Low: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  Staff: 'border-slate-300 bg-slate-100 text-slate-700'
};

export default function StatusBadge({ value }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
        statusMap[value] ?? 'border-slate-200 bg-slate-100 text-slate-700'
      }`}
    >
      {value}
    </span>
  );
}
