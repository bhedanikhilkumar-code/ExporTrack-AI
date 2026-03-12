import AppIcon from './AppIcon';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  accent: 'navy' | 'teal' | 'rose' | 'amber' | 'emerald';
}

const accents: Record<KpiCardProps['accent'], string> = {
  navy: 'from-navy-800 to-navy-600',
  teal: 'from-teal-600 to-teal-500',
  rose: 'from-rose-600 to-rose-500',
  amber: 'from-amber-600 to-amber-500',
  emerald: 'from-emerald-600 to-emerald-500'
};

const iconWrap: Record<KpiCardProps['accent'], string> = {
  navy: 'bg-navy-50 text-navy-700',
  teal: 'bg-teal-50 text-teal-700',
  rose: 'bg-rose-50 text-rose-700',
  amber: 'bg-amber-50 text-amber-700',
  emerald: 'bg-emerald-50 text-emerald-700'
};

const icons: Record<KpiCardProps['accent'], 'shipments' | 'notifications' | 'warning' | 'clock' | 'check'> = {
  navy: 'shipments',
  teal: 'notifications',
  rose: 'warning',
  amber: 'clock',
  emerald: 'check'
};

export default function KpiCard({ title, value, subtitle, accent }: KpiCardProps) {
  return (
    <article className="card-premium card-hover">
      <div className="mb-3 flex items-center justify-between">
        <div className={`h-1.5 w-24 rounded-full bg-gradient-to-r ${accents[accent]}`} />
        <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition-transform duration-200 hover-lift ${iconWrap[accent]}`} aria-hidden>
          <AppIcon name={icons[accent]} className="h-4 w-4" />
        </span>
      </div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{title}</p>
      <p className="mt-1.5 text-3xl font-bold tracking-tight text-navy-800 dark:text-slate-100 md:text-[32px]">{value}</p>
      <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>
    </article>
  );
}

