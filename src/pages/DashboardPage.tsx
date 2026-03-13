import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import KpiCard from '../components/KpiCard';
import StatusBadge from '../components/StatusBadge';
import AppIcon from '../components/AppIcon';
import { useAppContext } from '../context/AppContext';
import AiDelayPrediction from '../components/AiDelayPrediction';
import AiLogisticsAssistant from '../components/AiLogisticsAssistant';
import ShipmentAnalytics from '../components/ShipmentAnalytics';

export default function DashboardPage() {
  const {
    state: { shipments, notifications }
  } = useAppContext();

  const allDocuments = shipments.flatMap((shipment) => shipment.documents);
  const totalShipments = shipments.length;
  const activeShipments = shipments.filter((shipment) => shipment.status !== 'Delivered').length;
  const delayedShipments = shipments.filter((shipment) => shipment.delayed).length;
  const pendingDocs = allDocuments.filter((doc) => doc.status === 'Pending').length;
  const verifiedDocs = allDocuments.filter((doc) => doc.status === 'Verified').length;
  const rejectedOrMissing = allDocuments.filter((doc) => doc.status === 'Rejected' || doc.status === 'Missing').length;
  const unreadAlerts = notifications.filter((n) => !n.read).length;
  const complianceRate = allDocuments.length ? Math.round((verifiedDocs / allDocuments.length) * 100) : 0;

  const recentShipments = [...shipments].sort((a, b) => (b.shipmentDate || '').localeCompare(a.shipmentDate || '')).slice(0, 7);
  const priorityAlerts = [...notifications].filter((n) => !n.read).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')).slice(0, 5);

  const blockedDocs = shipments
    .flatMap((shipment) =>
      shipment.documents
        .filter((d) => d.status === 'Missing' || d.status === 'Rejected')
        .map((d) => ({ shipmentId: shipment.id, client: shipment.clientName, type: d.type, status: d.status }))
    )
    .slice(0, 6);

  const verificationRows = recentShipments.map((shipment) => {
    const requiredCount = 7;
    const verifiedCount = shipment.documents.filter((d) => d.status === 'Verified').length;
    const pct = Math.round((verifiedCount / requiredCount) * 100);
    return {
      id: shipment.id,
      client: shipment.clientName,
      pct,
      verifiedCount,
      requiredCount,
      status: shipment.status,
      pending: shipment.documents.filter((d) => d.status === 'Pending').length,
      blocked: shipment.documents.filter((d) => d.status === 'Missing' || d.status === 'Rejected').length
    };
  });

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
    ...shipments.flatMap((shipment) =>
      shipment.comments.slice(0, 1).map((comment) => ({
        id: `ACT-COM-${comment.id}`,
        time: comment.createdAt,
        title: `${shipment.id} • ${comment.author}`,
        detail: comment.message,
        type: 'Collaboration'
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

  const now = new Date();
  const dateLabel = now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  const countryDist = useMemo(() => {
    const counts: Record<string, number> = {};
    shipments.forEach((s) => {
      counts[s.destinationCountry] = (counts[s.destinationCountry] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [shipments]);

  const docStats = useMemo(() => {
    const total = allDocuments.length || 1;
    return [
      { label: 'Verified', value: verifiedDocs, color: '#0d9488', pct: (verifiedDocs / total) * 100 },
      { label: 'Pending', value: pendingDocs, color: '#f59e0b', pct: (pendingDocs / total) * 100 },
      { label: 'Blocked', value: rejectedOrMissing, color: '#e11d48', pct: (rejectedOrMissing / total) * 100 }
    ];
  }, [allDocuments.length, verifiedDocs, pendingDocs, rejectedOrMissing]);

  const monthlyActivity = useMemo(() => {
    const activity: Record<string, number> = {};
    shipments.forEach((s) => {
      const month = (s.shipmentDate || '').slice(0, 7); // YYYY-MM
      activity[month] = (activity[month] || 0) + 1;
    });
    return Object.entries(activity)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6);
  }, [shipments]);

  return (
    <div className="page-stack">
      {/* ── Dashboard Header ── */}
      <header className="dashboard-grid-header">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Operations Overview</h1>
          <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
            Welcome back. Here's what's happening with your shipments today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 dark:border-slate-800 dark:bg-slate-900">
            <div className="h-2 w-2 animate-pulse rounded-full bg-teal-500" />
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{dateLabel}</span>
          </div>
          <Link to="/create-shipment" className="btn-primary inline-flex items-center gap-2">
            <AppIcon name="create" className="h-4 w-4" />
            New Shipment
          </Link>
        </div>
      </header>

      {/* ── KPI Section ── */}
      <section className="dashboard-grid-kpi">
        <KpiCard title="Total Shipments" value={totalShipments} subtitle="Across all lanes" accent="slate" />
        <KpiCard title="Active Shipments" value={activeShipments} subtitle="Currently in transit" accent="teal" />
        <KpiCard title="Pending Docs" value={pendingDocs} subtitle="Awaiting review" accent="amber" />
        <KpiCard title="Compliance Rate" value={`${complianceRate}%`} subtitle="Verified documents" accent="indigo" />
        <KpiCard title="Active Alerts" value={unreadAlerts} subtitle="Requires attention" accent="rose" />
      </section>

      {/* ── Analytics Dashboard ── */}
      <ShipmentAnalytics
        monthlyData={monthlyActivity.map(([month, count]) => ({
          month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' }),
          value: count
        }))}
        totalShipments={totalShipments}
        activeShipments={activeShipments}
        complianceRate={complianceRate}
        delayedShipments={delayedShipments}
      />

      <div className="dashboard-grid-section">
        {/* Verification Status */}
        <article className="card-premium">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Document Health</h3>
            <AppIcon name="shield" className="h-4 w-4 text-slate-400" />
          </div>
          <div className="flex flex-col items-center">
            <div className="relative mb-8 h-48 w-48">
              <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                <circle cx="18" cy="18" r="16" fill="transparent" stroke="currentColor" strokeWidth="2.5" className="text-slate-100 dark:text-slate-800" />
                {docStats.reduce(({ offset, elements }, stat) => {
                  const element = (
                    <circle key={stat.label} cx="18" cy="18" r="16" fill="transparent" stroke={stat.color} strokeWidth="3" strokeDasharray={`${stat.pct} 100`} strokeDashoffset={-offset} className="transition-all duration-1000" />
                  );
                  return { offset: offset + stat.pct, elements: [...elements, element] };
                }, { offset: 0, elements: [] as React.ReactNode[] }).elements}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">{complianceRate}%</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Compliant</span>
              </div>
            </div>
            <div className="grid w-full grid-cols-3 gap-2">
              {docStats.map(stat => (
                <div key={stat.label} className="rounded-lg bg-slate-50 p-3 text-center dark:bg-slate-800/30">
                  <div className="mx-auto mb-2 h-1.5 w-6 rounded-full" style={{ backgroundColor: stat.color }} />
                  <p className="text-[10px] font-bold uppercase text-slate-400">{stat.label}</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-200">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </article>

        {/* Lane Distribution */}
        <article className="card-premium">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Top Lanes</h3>
            <AppIcon name="shipments" className="h-4 w-4 text-slate-400" />
          </div>
          <div className="space-y-5">
            {countryDist.map(([country, count]) => (
              <div key={country} className="group">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{country}</span>
                  <span className="text-[11px] font-bold text-slate-500">{count} Shipments</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full bg-teal-500 transition-all duration-1000 group-hover:bg-teal-400"
                    style={{ width: `${(count / totalShipments) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        {/* AI Logistics Assistant */}
        <AiLogisticsAssistant />
      </div>

      <div className="dashboard-grid-wide">
        {/* Recent Activity */}
        <article className="card-premium xl:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Live Logistics Feed</h3>
              <p className="text-[11px] text-slate-400">Real-time collaboration and document events</p>
            </div>
            <Link to="/shipments" className="text-xs font-bold text-teal-600 hover:text-teal-500 transition-colors">
              View All Pipeline
            </Link>
          </div>
          <div className="space-y-4">
            {activityTimeline.slice(0, 6).map((item, idx) => (
              <div key={item.id} className="relative flex gap-4">
                {idx !== 5 && (
                  <div className="absolute left-[15px] top-8 h-[calc(100%-24px)] w-px bg-slate-100 dark:bg-slate-800" />
                )}
                <div className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white text-white shadow-sm dark:border-slate-800 ${item.type === 'Document' ? 'bg-indigo-500' : item.type === 'Alert' ? 'bg-rose-500' : 'bg-teal-500'
                  }`}>
                  <AppIcon name={item.type === 'Document' ? 'upload' : item.type === 'Alert' ? 'bell' : 'team'} className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</p>
                    <time className="text-[10px] font-medium text-slate-400">{item.time}</time>
                  </div>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </article>

        {/* AI Predictions Spotlight */}
        <div className="card-premium">
          <div className="mb-6 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-teal-400 dark:bg-teal-500/10 shadow-sm">
              <AppIcon name="ai-extract" className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Predictive Intelligence</h3>
              <p className="text-[11px] font-medium text-slate-500">Neural Risk Assessment</p>
            </div>
          </div>
          <div className="space-y-4">
            {shipments.filter(s => s.status !== 'Delivered').slice(0, 3).map(s => (
              <AiDelayPrediction key={s.id} shipmentId={s.id} />
            ))}
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Network Stability</span>
                <span className="text-[10px] font-bold text-teal-500">OPTIMAL</span>
              </div>
              <div className="flex gap-1">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className={`h-4 flex-1 rounded-sm ${i > 8 ? 'bg-slate-200 dark:bg-slate-800' : 'bg-teal-500/40 animate-pulse'}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Recent Shipments Table ── */}
      <article className="card-premium overflow-hidden">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Recent Shipments</h3>
          <button
            onClick={() => {
              const csvContent = ['ID,Client,Date,Status'];
              recentShipments.forEach(s => {
                csvContent.push(`"${s.id}","${s.clientName}","${s.shipmentDate}","${s.status}"`);
              });
              const element = document.createElement('a');
              element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent.join('\n')));
              element.setAttribute('download', `shipments-${new Date().toISOString().split('T')[0]}.csv`);
              element.style.display = 'none';
              document.body.appendChild(element);
              element.click();
              document.body.removeChild(element);
            }}
            className="btn-secondary btn-sm">Export Report</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">ID</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Client</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Departure</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-widest text-slate-400">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentShipments.map(s => (
                <tr key={s.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="px-4 py-4">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{s.id}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{s.clientName}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-xs font-medium text-slate-500">{s.shipmentDate}</span>
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge value={s.status} />
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Link to={`/shipments/${s.id}`} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:border-teal-500/50 hover:text-teal-600 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-teal-500/50 transition-all">
                      <AppIcon name="chevron-right" className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </div>
  );
}
