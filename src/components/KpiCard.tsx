import AppIcon from './AppIcon';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  accent: 'navy' | 'teal' | 'rose' | 'amber' | 'emerald' | 'slate' | 'indigo';
}

const colorMap: Record<KpiCardProps['accent'], string> = {
  navy: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400',
  teal: 'text-teal-600 bg-teal-50 dark:bg-teal-900/20 dark:text-teal-400',
  rose: 'text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400',
  amber: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400',
  emerald: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400',
  slate: 'text-slate-600 bg-slate-50 dark:bg-slate-800 dark:text-slate-300',
  indigo: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400'
};

const icons: Record<KpiCardProps['accent'], any> = {
  navy: 'shipments',
  teal: 'notifications',
  rose: 'warning',
  amber: 'clock',
  emerald: 'check',
  slate: 'dashboard',
  indigo: 'shield'
};

export default function KpiCard({ title, value, subtitle, accent }: KpiCardProps) {
  return (
    <article className="kpi-card group">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl transition-all group-hover:scale-110 ${colorMap[accent]}`}>
            <AppIcon name={icons[accent]} className="h-5 w-5" />
          </span>
          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-slate-500 transition-colors">{title}</span>
            <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{value}</p>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-slate-50 pt-3 dark:border-slate-800/50">
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{subtitle}</p>
          <div className="flex h-1.5 w-1.5 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>
    </article>
  );
}

