import { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import AppIcon from '../components/AppIcon';
import {
  computeAnalytics,
  computeMonthlyTrend,
  computeCarrierPerformance,
  computeDeliveryDistribution,
  computeDailyTrend,
} from '../services/analyticsService';

/* ─── Helpers ────────────────────────────────────────────────────────── */
const COLORS = {
  teal: { gradient: 'from-teal-500 to-teal-600', bg: 'bg-teal-500/10', text: 'text-teal-600 dark:text-teal-400', bar: '#14b8a6' },
  blue: { gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', bar: '#3b82f6' },
  amber: { gradient: 'from-amber-500 to-amber-600', bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', bar: '#f59e0b' },
  rose: { gradient: 'from-rose-500 to-rose-600', bg: 'bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400', bar: '#f43f5e' },
  indigo: { gradient: 'from-indigo-500 to-indigo-600', bg: 'bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400', bar: '#6366f1' },
  emerald: { gradient: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', bar: '#10b981' },
};

const CARRIER_COLORS = ['#14b8a6', '#3b82f6', '#8b5cf6', '#f59e0b', '#f43f5e', '#10b981'];
const DIST_COLORS = ['#06b6d4', '#14b8a6', '#3b82f6', '#8b5cf6', '#f43f5e'];

/* ─── Main Page ──────────────────────────────────────────────────────── */
export default function AnalyticsDashboardPage() {
  const { state: { shipments } } = useAppContext();

  const metrics = useMemo(() => computeAnalytics(shipments), [shipments]);
  const monthlyTrend = useMemo(() => computeMonthlyTrend(shipments), [shipments]);
  const carrierPerf = useMemo(() => computeCarrierPerformance(shipments), [shipments]);
  const deliveryDist = useMemo(() => computeDeliveryDistribution(shipments), [shipments]);
  const dailyTrend = useMemo(() => computeDailyTrend(shipments), [shipments]);

  const maxDaily = Math.max(...dailyTrend.map(d => d.shipments), 1);

  const maxMonthly = Math.max(...monthlyTrend.map(m => m.shipments), 1);
  const maxCarrier = Math.max(...carrierPerf.map(c => c.shipments), 1);
  const maxDist = Math.max(...deliveryDist.map(d => d.count), 1);

  const kpiCards = [
    { title: 'Total Shipments', value: metrics.totalShipments, icon: 'shipments' as const, accent: COLORS.blue, suffix: '' },
    { title: 'Active Shipments', value: metrics.inTransitShipments + metrics.awaitingDocsShipments, icon: 'clock' as const, accent: COLORS.amber, suffix: '' },
    { title: 'Delivered', value: metrics.deliveredShipments, icon: 'check' as const, accent: COLORS.emerald, suffix: '' },
    { title: 'Delayed', value: metrics.delayedShipments, icon: 'warning' as const, accent: COLORS.rose, suffix: '' },
    { title: 'Doc Health', value: metrics.onTimeDeliveryRate, icon: 'shield' as const, accent: COLORS.teal, suffix: '%' },
    { title: 'Avg Lead Time', value: metrics.averageDeliveryTimeDays, icon: 'clock' as const, accent: COLORS.indigo, suffix: 'd' },
  ];

  return (
    <main className="page-stack">
      {/* ── Page Header ── */}
      <header className="dashboard-grid-header">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white" style={{ letterSpacing: '-0.03em' }}>
            Shipment Analytics
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
            Performance insights across all logistics operations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200/60 bg-white/80 backdrop-blur-sm px-3.5 py-2 dark:border-slate-800/60 dark:bg-slate-900/80 shadow-sm">
            <div className="h-2 w-2 animate-pulse rounded-full bg-teal-500 shadow-[0_0_6px_rgb(13_148_136/0.4)]" />
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Live Data</span>
          </div>
        </div>
      </header>

      {/* ── KPI Cards ── */}
      <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiCards.map(card => (
          <div
            key={card.title}
            className="relative overflow-hidden bg-white dark:bg-slate-900/80 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 flex flex-col gap-3 group shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-slate-100/50 to-transparent dark:from-slate-800/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <div className="relative">
              <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl shadow-sm transition-transform group-hover:scale-110 ${card.accent.bg} ${card.accent.text}`}>
                <AppIcon name={card.icon} className="h-5 w-5" strokeWidth={2.5} />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{card.title}</p>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1" style={{ letterSpacing: '-0.03em' }}>
                {card.value}{card.suffix}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* ── Charts Grid ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ── Daily Shipment Activity (Bar Chart) ── */}
        <article className="card-premium relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <div className="relative">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="section-title text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-slate-100">Daily Activity</h3>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 ml-4 uppercase tracking-wide">Last 7 Days</p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 shadow-sm">
                <AppIcon name="clock" className="h-5 w-5" strokeWidth={2.5} />
              </div>
            </div>

            <div className="flex items-end justify-between gap-1 h-40 px-1 pb-2">
              {dailyTrend.map((d, i) => {
                const heightPct = (d.shipments / maxDaily) * 100;
                return (
                  <div key={i} className="group/bar relative flex flex-1 flex-col items-center gap-2 h-full justify-end">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-md bg-slate-900 px-2 py-1 text-[9px] font-bold text-white opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none">
                      {d.shipments}
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-lg relative overflow-hidden h-full flex items-end">
                      <div 
                        className="w-full bg-amber-500 group-hover/bar:bg-amber-400 transition-all duration-500 ease-out rounded-t-lg"
                        style={{ height: `${Math.max(heightPct, 5)}%` }}
                      />
                    </div>
                    <span className="text-[9px] font-black uppercase text-slate-400">{d.date}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </article>

        {/* ── Monthly Shipment Trend (Line Chart) ── */}
        <article className="card-premium relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <div className="relative">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="section-title text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-slate-100">Monthly Shipment Trend</h3>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 ml-4 uppercase tracking-wide">Last 6 Months</p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400 shadow-sm">
                <AppIcon name="trend-up" className="h-5 w-5" strokeWidth={2.5} />
              </div>
            </div>

            {/* SVG Line Chart */}
            <div className="relative h-52 w-full">
              <svg viewBox="0 0 600 200" className="w-full h-full" preserveAspectRatio="none">
                {/* Grid lines */}
                {[0, 50, 100, 150].map(y => (
                  <line key={y} x1="0" y1={y} x2="600" y2={y} stroke="currentColor" strokeWidth="0.5" className="text-slate-200 dark:text-slate-800" />
                ))}

                {/* Gradient fill */}
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.02" />
                  </linearGradient>
                </defs>

                {/* Area */}
                <path
                  d={`M${monthlyTrend.map((m, i) => {
                    const x = (i / (monthlyTrend.length - 1)) * 560 + 20;
                    const y = 180 - (m.shipments / maxMonthly) * 160;
                    return `${x},${y}`;
                  }).join(' L')} L${560 + 20},180 L20,180 Z`}
                  fill="url(#trendGradient)"
                />

                {/* Line */}
                <polyline
                  points={monthlyTrend.map((m, i) => {
                    const x = (i / (monthlyTrend.length - 1)) * 560 + 20;
                    const y = 180 - (m.shipments / maxMonthly) * 160;
                    return `${x},${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#14b8a6"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Delayed line */}
                <polyline
                  points={monthlyTrend.map((m, i) => {
                    const x = (i / (monthlyTrend.length - 1)) * 560 + 20;
                    const y = 180 - (m.delayed / maxMonthly) * 160;
                    return `${x},${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="2"
                  strokeDasharray="6,4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.7"
                />

                {/* Dots */}
                {monthlyTrend.map((m, i) => {
                  const x = (i / (monthlyTrend.length - 1)) * 560 + 20;
                  const y = 180 - (m.shipments / maxMonthly) * 160;
                  return (
                    <g key={i}>
                      <circle cx={x} cy={y} r="5" fill="#14b8a6" stroke="white" strokeWidth="2" className="dark:stroke-slate-900" />
                    </g>
                  );
                })}
              </svg>

              {/* X Labels */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-between px-3">
                {monthlyTrend.map((m, i) => (
                  <span key={i} className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">{m.month}</span>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6 mt-6 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-6 rounded-full bg-teal-500" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Shipments</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-6 rounded-full bg-rose-500 opacity-70" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 3px, white 3px, white 5px)' }} />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Delayed</span>
              </div>
            </div>
          </div>
        </article>

        {/* ── Carrier Performance (Bar Chart) ── */}
        <article className="card-premium relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <div className="relative">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="section-title text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-slate-100">Carrier Performance</h3>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 ml-4 uppercase tracking-wide">Shipments by Carrier</p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 shadow-sm">
                <AppIcon name="shipments" className="h-5 w-5" strokeWidth={2.5} />
              </div>
            </div>

            {/* Horizontal Bar Chart */}
            <div className="space-y-4">
              {carrierPerf.slice(0, 5).map((c, idx) => {
                const pct = (c.shipments / maxCarrier) * 100;
                const onTimePct = c.shipments > 0 ? Math.round((c.onTime / c.shipments) * 100) : 0;
                return (
                  <div key={c.carrier} className="group/bar">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CARRIER_COLORS[idx % CARRIER_COLORS.length] }} />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{c.carrier}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-slate-400">{c.shipments} shipments</span>
                        <span className={`text-[10px] font-bold ${onTimePct >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>{onTimePct}% on-time</span>
                      </div>
                    </div>
                    <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out group-hover/bar:brightness-110"
                        style={{
                          width: `${Math.max(pct, 8)}%`,
                          backgroundColor: CARRIER_COLORS[idx % CARRIER_COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
              <div className="text-center">
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Carriers</p>
                <p className="text-lg font-extrabold text-slate-900 dark:text-white">{carrierPerf.length}</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Best On-Time</p>
                <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                  {carrierPerf.length > 0 ? carrierPerf.reduce((best, c) => {
                    const rate = c.shipments > 0 ? c.onTime / c.shipments : 0;
                    return rate > (best.shipments > 0 ? best.onTime / best.shipments : 0) ? c : best;
                  }).carrier : '—'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Avg Transit</p>
                <p className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {carrierPerf.length > 0 ? Math.round(carrierPerf.reduce((s, c) => s + c.avgDays, 0) / carrierPerf.length) : 0}d
                </p>
              </div>
            </div>
          </div>
        </article>
      </div>

      {/* ── Delivery Time Distribution ── */}
      <article className="card-premium relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        <div className="relative">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="section-title text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-slate-100">Delivery Time Distribution</h3>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 ml-4 uppercase tracking-wide">Histogram of shipment durations</p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 shadow-sm">
              <AppIcon name="clock" className="h-5 w-5" strokeWidth={2.5} />
            </div>
          </div>

          {/* Vertical Bars */}
          <div className="flex items-end justify-between gap-2 md:gap-4 h-48 px-2 md:px-6">
            {deliveryDist.map((d, idx) => {
              const heightPct = (d.count / maxDist) * 100;
              return (
                <div key={d.range} className="group/bar relative flex flex-1 flex-col items-center gap-2 h-full justify-end">
                  {/* Tooltip */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 rounded-lg bg-slate-900 dark:bg-slate-800 border border-slate-800 dark:border-slate-700 px-3 py-1.5 text-[10px] font-black text-white opacity-0 transition-all duration-200 group-hover/bar:opacity-100 group-hover/bar:-translate-y-1 z-10 shadow-xl pointer-events-none whitespace-nowrap">
                    {d.count} shipments
                  </div>
                  <div className="relative w-full flex items-end justify-center h-full">
                    <div
                      className="w-full max-w-[56px] rounded-t-lg transition-all duration-500 ease-out group-hover/bar:brightness-110"
                      style={{
                        height: `${Math.max(heightPct, 10)}%`,
                        backgroundColor: DIST_COLORS[idx % DIST_COLORS.length],
                      }}
                    />
                  </div>
                  <div className="flex flex-col items-center mt-1">
                    <span className="text-[9px] md:text-[10px] font-bold text-slate-400 dark:text-slate-500 group-hover/bar:text-slate-900 dark:group-hover/bar:text-slate-300 transition-colors text-center whitespace-nowrap">
                      {d.range}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Stats */}
          <div className="grid grid-cols-3 gap-6 mt-8 pt-6 border-t border-slate-200/60 dark:border-slate-800/60">
            <div className="flex flex-col items-center text-center">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Total Tracked</span>
              <span className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                {deliveryDist.reduce((s, d) => s + d.count, 0)}
              </span>
            </div>
            <div className="relative flex flex-col items-center text-center">
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 h-8 w-px bg-slate-200/60 dark:bg-slate-800/60" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Peak Range</span>
              <span className="mt-1 text-lg font-extrabold text-indigo-600 dark:text-indigo-400 tracking-tight">
                {deliveryDist.reduce((best, d) => d.count > best.count ? d : best).range}
              </span>
              <div className="absolute -right-3 top-1/2 -translate-y-1/2 h-8 w-px bg-slate-200/60 dark:bg-slate-800/60" />
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Fast Delivery</span>
              <span className="mt-1 flex items-center gap-1 text-lg font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
                <AppIcon name="trend-up" className="h-4 w-4" strokeWidth={3} />
                {deliveryDist[0].count + deliveryDist[1].count}
              </span>
            </div>
          </div>
        </div>
      </article>

      {/* ── Additional Analytics: Success Rate & Lead Time ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <article className="card-premium flex flex-col items-center justify-center py-10 overflow-hidden relative group">
           <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
           <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-8 self-start ml-2">Delivery Success Rate</h3>
           <div className="relative h-48 w-48">
              <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                <circle cx="18" cy="18" r="16" fill="transparent" stroke="currentColor" strokeWidth="3" className="text-slate-100 dark:text-slate-800" />
                <circle 
                  cx="18" cy="18" r="16" fill="transparent" 
                  stroke="currentColor" strokeWidth="3" 
                  strokeDasharray={`${metrics.onTimeDeliveryRate} 100`} 
                  className="text-emerald-500 transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-slate-900 dark:text-white">{metrics.onTimeDeliveryRate}%</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">On-Time Performance</span>
              </div>
           </div>
           <div className="mt-8 flex gap-8">
              <div className="text-center">
                <p className="text-[10px] font-bold uppercase text-slate-400">Target</p>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-300">95%</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-bold uppercase text-slate-400">Deviation</p>
                <p className={`text-lg font-bold ${metrics.onTimeDeliveryRate >= 95 ? 'text-emerald-500' : 'text-amber-500'}`}>
                   {metrics.onTimeDeliveryRate - 95 > 0 ? '+' : ''}{metrics.onTimeDeliveryRate - 95}%
                </p>
              </div>
           </div>
        </article>

        <article className="card-premium flex flex-col p-6 overflow-hidden relative group">
           <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
           <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-6">Lead Time Optimization</h3>
           <div className="space-y-6 flex-1 flex flex-col justify-center">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Average Transit</span>
                  <span className="text-xs font-bold text-indigo-600">{metrics.averageDeliveryTimeDays} Days</span>
                </div>
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                   <div 
                    className="h-full bg-indigo-500 transition-all duration-1000" 
                    style={{ width: `${Math.min((metrics.averageDeliveryTimeDays / 20) * 100, 100)}%` }} 
                   />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">In-Port Dwell</p>
                    <p className="text-xl font-black text-slate-900 dark:text-slate-100">1.2d</p>
                 </div>
                 <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Customs Clearance</p>
                    <p className="text-xl font-black text-slate-900 dark:text-slate-100">0.8d</p>
                 </div>
              </div>
           </div>
        </article>
      </div>

      {/* ── Status Breakdown Mini-Cards ── */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Delivered', value: metrics.deliveredShipments, icon: 'check' as const, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'In Transit', value: metrics.inTransitShipments, icon: 'shipments' as const, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-500/10' },
          { label: 'Awaiting Docs', value: metrics.awaitingDocsShipments, icon: 'clock' as const, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Customs Hold', value: metrics.customsHoldShipments, icon: 'shield' as const, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/10' },
        ].map(stat => (
          <div key={stat.label} className="bg-white dark:bg-slate-900/80 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 flex items-center gap-4 group shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-100/50 to-transparent dark:from-slate-800/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <div className={`relative flex h-12 w-12 items-center justify-center rounded-xl shadow-sm ${stat.bg} ${stat.color}`}>
              <AppIcon name={stat.icon} className="h-6 w-6" strokeWidth={2} />
            </div>
            <div className="relative">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{stat.label}</p>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white" style={{ letterSpacing: '-0.03em' }}>{stat.value}</p>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
