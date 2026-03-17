import AppIcon from './AppIcon';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  accent: 'navy' | 'teal' | 'rose' | 'amber' | 'emerald' | 'slate' | 'indigo';
  icon?: any;
  suffix?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

const colorMap: Record<KpiCardProps['accent'], { icon: string; gradient: string }> = {
  navy: {
    icon: 'text-blue-600 dark:text-blue-400',
    gradient: 'from-blue-500/10 to-blue-600/5 dark:from-blue-500/15 dark:to-blue-600/5'
  },
  teal: {
    icon: 'text-teal-600 dark:text-teal-400',
    gradient: 'from-teal-500/10 to-teal-600/5 dark:from-teal-500/15 dark:to-teal-600/5'
  },
  rose: {
    icon: 'text-rose-600 dark:text-rose-400',
    gradient: 'from-rose-500/10 to-rose-600/5 dark:from-rose-500/15 dark:to-rose-600/5'
  },
  amber: {
    icon: 'text-amber-600 dark:text-amber-400',
    gradient: 'from-amber-500/10 to-amber-600/5 dark:from-amber-500/15 dark:to-amber-600/5'
  },
  emerald: {
    icon: 'text-emerald-600 dark:text-emerald-400',
    gradient: 'from-emerald-500/10 to-emerald-600/5 dark:from-emerald-500/15 dark:to-emerald-600/5'
  },
  slate: {
    icon: 'text-slate-600 dark:text-slate-300',
    gradient: 'from-slate-500/10 to-slate-600/5 dark:from-slate-500/15 dark:to-slate-600/5'
  },
  indigo: {
    icon: 'text-indigo-600 dark:text-indigo-400',
    gradient: 'from-indigo-500/10 to-indigo-600/5 dark:from-indigo-500/15 dark:to-indigo-600/5'
  }
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

export default function KpiCard({ title, value, subtitle, accent, icon, suffix, trend }: KpiCardProps) {
  const colors = colorMap[accent];
  return (
    <article className="kpi-card group glass-premium hover-elevate-subtle cursor-default p-4 sm:p-5 transition-all duration-500">
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex items-center justify-between">
          <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${colors.gradient} spring-transition duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-lg ring-1 ring-inset ring-slate-900/5 dark:ring-white/10`}>
            <AppIcon name={icon || icons[accent]} className={`h-5 w-5 ${colors.icon} spring-transition duration-300 group-hover:scale-110`} />
          </span>
          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 group-hover:text-slate-500 dark:group-hover:text-slate-300 transition-colors">{title}</span>
            <div className="flex items-baseline gap-1">
              <p className="text-2xl font-extrabold tracking-tight tabular-nums text-slate-900 dark:text-white" style={{ letterSpacing: '-0.03em' }}>{value}</p>
              {suffix && <span className="text-xs font-bold text-slate-400 tabular-nums">{suffix}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100/80 pt-3 dark:border-slate-800/50">
          <div className="flex flex-col gap-0.5">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{subtitle}</p>
            {trend && (
              <div className={`flex items-center gap-1 text-[10px] font-bold ${trend.isPositive ? 'text-teal-500' : 'text-rose-500'}`}>
                <AppIcon name={trend.isPositive ? 'trend-up' : 'trend-down'} className="h-3 w-3" strokeWidth={3} />
                <span>{trend.value}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2"> {/* Added this wrapper div */}
            <button className="h-10 w-10 shrink-0 rounded-xl bg-slate-800 flex items-center justify-center border border-teal-500 shadow-[0_0_20px_-3px_rgba(20,184,166,0.6)] relative overflow-hidden group-hover:shadow-[0_0_30px_-3px_rgba(20,184,166,0.8)] transition-all duration-700 active-press">
              <div className="absolute inset-0 bg-teal-400/20 animate-pulse" />
              <AppIcon name="ai-extract" className="h-5 w-5 text-teal-400 relative z-10 animate-glow" strokeWidth={2.5} />
            </button>
            <div className="flex items-center gap-1">
              <div className="h-1 w-1 rounded-full bg-teal-500/50 animate-pulse" />
              <span className="text-[9px] font-bold text-teal-600/50 dark:text-teal-400/50 uppercase">Live</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
