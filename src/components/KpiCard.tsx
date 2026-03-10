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

export default function KpiCard({ title, value, subtitle, accent }: KpiCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
      <div className={`mb-4 h-1.5 w-full rounded-full bg-gradient-to-r ${accents[accent]}`} />
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-semibold text-navy-800">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
    </article>
  );
}
