import { useMemo, useState, useEffect, memo } from 'react';
import { Link } from 'react-router-dom';
import KpiCard from '../components/KpiCard';
import StatusBadge from '../components/StatusBadge';
import AppIcon from '../components/AppIcon';
import { useAppContext } from '../context/AppContext';
import AiDelayPrediction from '../components/AiDelayPrediction';
import AiLogisticsAssistant from '../components/AiLogisticsAssistant';
import ShipmentAnalytics from '../components/ShipmentAnalytics';
import { SkeletonKpiCard, SkeletonChart, SkeletonTable, SkeletonCard } from '../components/SkeletonLoader';

/* ─── Sub-Components ─────────────────────────────────────────────────── */
const DashboardKpiCard = memo(({ title, value, icon, accent, suffix, subtitle }: any) => (
  <KpiCard title={title} value={value} icon={icon} accent={accent} suffix={suffix} subtitle={subtitle} />
));
DashboardKpiCard.displayName = 'DashboardKpiCard';

export default function DashboardPage() {
  const {
    state: { shipments, notifications },
    getAnalytics,
    hasPermission
  } = useAppContext();

  const [loading, setLoading] = useState(true);

  // Simulate initial load for UX polish
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const analyticsData = useMemo(() => getAnalytics(), [shipments, getAnalytics]);

  const {
    unreadAlerts,
    recentShipments,
  } = useMemo(() => {
    const unread = notifications.filter((n) => !n.read).length;
    const recent = [...shipments].sort((a, b) => (b.shipmentDate || '').localeCompare(a.shipmentDate || '')).slice(0, 7);

    return {
      unreadAlerts: unread,
      recentShipments: recent,
    };
  }, [shipments, notifications]);

  const now = new Date();
  const dateLabel = now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  if (loading) {
    return (
      <main className="page-stack">
        <header className="dashboard-grid-header">
          <div className="space-y-2">
            <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-96 animate-pulse rounded bg-slate-100 dark:bg-slate-800/50" />
          </div>
        </header>
        <section className="dashboard-grid-kpi animate-in slide-in-from-bottom-2 duration-500 fade-in">
          {[...Array(5)].map((_, i) => <SkeletonKpiCard key={i} />)}
        </section>
        <div className="dashboard-chart-container animate-in slide-in-from-bottom-4 duration-700 fade-in">
          <SkeletonChart />
        </div>
        <div className="dashboard-grid-section">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="dashboard-grid-table">
          <SkeletonTable />
        </div>
      </main>
    );
  }

  const activityTimeline = [
    ...shipments.flatMap((shipment) =>
      shipment.documents.slice(0, 2).map((doc) => ({
        id: `ACT-DOC-${doc.id}`,
        time: doc.uploadedAt,
        title: `${shipment.id} • ${doc.type}`,
        detail: `${doc.status} by ${doc.uploadedBy}`,
        type: 'Document'
      }))
    ),
    ...notifications.slice(0, 4).map((alert) => ({
      id: `ACT-NT-${alert.id}`,
      time: alert.createdAt,
      title: `${alert.shipmentId} • ${alert.title}`,
      detail: alert.message,
      type: 'Alert'
    }))
  ]
    .sort((a, b) => (b.time || '').localeCompare(a.time || ''))
    .slice(0, 10);

  return (
    <main className="page-stack">
      {/* ── Dashboard Header ── */}
      <header className="dashboard-grid-header">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white" style={{ letterSpacing: '-0.03em' }}>Enterprise Logistics Hub</h1>
          <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
            Advanced analytics and AI-powered logistics insights.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200/60 bg-white/80 backdrop-blur-sm px-3.5 py-2 dark:border-slate-800/60 dark:bg-slate-900/80 shadow-sm">
            <div className="h-2 w-2 animate-pulse rounded-full bg-teal-500 shadow-[0_0_6px_rgb(13_148_136/0.4)]" />
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">{dateLabel}</span>
          </div>
          {hasPermission('create_shipments') && (
            <Link to="/shipments/create" className="btn-primary inline-flex items-center gap-2">
              <AppIcon name="create" className="h-4 w-4" />
              New Shipment
            </Link>
          )}
        </div>
      </header>

      {/* ── KPI Section ── */}
      <section className="dashboard-grid-kpi">
        <DashboardKpiCard title="Total Volume" value={analyticsData.totalShipments} subtitle="Shipments processed" accent="indigo" icon="shipments" />
        <DashboardKpiCard title="On-Time Rate" value={analyticsData.onTimeDeliveryRate} subtitle="Compliance benchmark" accent="teal" icon="check" suffix="%" />
        <DashboardKpiCard title="Delayed Units" value={analyticsData.delayedShipments} subtitle="Requires attention" accent="rose" icon="warning" />
        <DashboardKpiCard title="Avg. Lead Time" value={analyticsData.averageDeliveryTime} subtitle="Global average" accent="amber" icon="clock" suffix="d" />
        <DashboardKpiCard title="Active Alerts" value={unreadAlerts} subtitle="Unread notifications" accent="slate" icon="bell" />
      </section>

      {/* ── Analytics Dashboard ── */}
      <ShipmentAnalytics data={analyticsData} />

      <div className="dashboard-grid-section">
        {/* AI Logistics Assistant */}
        <AiLogisticsAssistant />
        
        {/* Recent Activity */}
        <article className="card-premium lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="section-title text-sm font-bold uppercase tracking-wider text-slate-500">Logistics Event Stream</h3>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">Real-time system events and notifications</p>
            </div>
            <Link to="/shipments" className="text-xs font-bold text-teal-600 hover:text-teal-500 transition-colors group inline-flex items-center gap-1">
              View All
              <AppIcon name="chevron-right" className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="space-y-4">
            {activityTimeline.slice(0, 5).map((item, idx) => (
              <div key={item.id} className="relative flex gap-4">
                {idx !== 4 && (
                  <div className="absolute left-[15px] top-8 h-[calc(100%-24px)] w-px bg-slate-100 dark:bg-slate-800" />
                )}
                <div className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white text-white shadow-sm dark:border-slate-800 ${item.type === 'Document' ? 'bg-indigo-500' : 'bg-rose-500'
                  }`}>
                  <AppIcon name={item.type === 'Document' ? 'upload' : 'bell'} className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</p>
                    <time className="text-[10px] font-semibold tracking-wide text-slate-400 tabular-nums">{item.time.split('T')[0]}</time>
                  </div>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div className="dashboard-grid-wide">
        {/* AI Predictions Spotlight */}
        <div className="card-premium">
          <div className="mb-6 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-teal-400 dark:bg-teal-500/10 shadow-sm">
              <AppIcon name="ai-extract" className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Neural Risk Analysis</h3>
              <p className="text-[11px] font-medium text-slate-500">Predictive Delay Modeling</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {shipments.filter(s => s.status !== 'Delivered').slice(0, 3).map(s => (
              <AiDelayPrediction key={s.id} shipmentId={s.id} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent Shipments Table ── */}
      <article className="dashboard-grid-table card-premium overflow-hidden">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="section-title text-sm font-bold uppercase tracking-wider text-slate-500">Pipeline Monitoring</h3>
          <button className="btn-secondary btn-sm">Export Global Report</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">ID</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Client</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-widest text-slate-400">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentShipments.map(s => (
                <tr key={s.id} className="group table-row-premium hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-4">
                    <span className="text-xs font-bold text-slate-900 dark:text-white tabular-nums">{s.id}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{s.clientName}</span>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge value={s.status} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2.5">
                       <Link to={`/shipments/${s.id}/tracking`} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-teal-200 bg-teal-50 text-teal-600 hover:bg-teal-100 hover:text-teal-700 dark:border-teal-900/50 dark:bg-teal-900/20 dark:hover:bg-teal-900/40 transition-all font-bold group" title="Live Tracking">
                         <span className="relative flex h-3 w-3">
                           <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75"></span>
                           <span className="relative inline-flex h-full w-full rounded-full bg-teal-500"></span>
                         </span>
                       </Link>
                       <Link to={`/shipments/${s.id}`} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:border-teal-500/50 hover:text-teal-600 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-teal-500/50 transition-all">
                         <AppIcon name="chevron-right" className="h-3.5 w-3.5" />
                       </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </main>
  );
}
