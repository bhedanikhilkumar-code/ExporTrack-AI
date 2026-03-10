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

const icons: Record<KpiCardProps['accent'], string> = {
  navy: '📦',
  teal: '🔔',
  rose: '⚠️',
  amber: '🕒',
  emerald: '✅'
};

export default function KpiCard({ title, value, subtitle, accent }: KpiCardProps) {
  return (
    <article className="card-surface p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="mb-3 flex items-center justify-between">
        <div className={`h-1.5 w-24 rounded-full bg-gradient-to-r ${accents[accent]}`} />
        <span className="text-lg" aria-hidden>
          {icons[accent]}
        </span>
      </div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      <p className="mt-1.5 text-3xl font-bold tracking-tight text-navy-800">{value}</p>
      <p className="mt-1.5 text-sm text-slate-600">{subtitle}</p>
    </article>
  );
}

