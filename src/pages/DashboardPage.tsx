import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import KpiCard from '../components/KpiCard';
import StatusBadge from '../components/StatusBadge';
import AppIcon from '../components/AppIcon';
import { useAppContext } from '../context/AppContext';
import AiDelayPrediction from '../components/AiDelayPrediction';
import AiLogisticsAssistant from '../components/AiLogisticsAssistant';

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

  const recentShipments = [...shipments].sort((a, b) => b.shipmentDate.localeCompare(a.shipmentDate)).slice(0, 7);
  const priorityAlerts = [...notifications].filter((n) => !n.read).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);

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
    .sort((a, b) => b.time.localeCompare(a.time))
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
      const month = s.shipmentDate.slice(0, 7); // YYYY-MM
      activity[month] = (activity[month] || 0) + 1;
    });
    return Object.entries(activity)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6);
  }, [shipments]);

  return (
    <div className="page-stack">
      {/* ── Dashboard Header ── */}
      <div
        className="relative mb-6 overflow-hidden rounded-2xl border border-navy-800/10"
        style={{
          background: 'linear-gradient(135deg, #0f2137 0%, #112c45 40%, #0e3a4a 70%, #0d9488 100%)'
        }}
      >
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #14b8a6 0%, transparent 70%)' }}
        />
        <div className="relative px-6 py-7 md:px-9 md:py-9 transition-all duration-700">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-teal-400/30 bg-teal-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-teal-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-400" />
            {dateLabel}
          </span>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <h2 className="text-3xl font-extrabold tracking-tight md:text-3xl text-white">Operations Dashboard</h2>
              <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-slate-300">Live command center for shipment health and document compliance.</p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2.5">
              <Link to="/shipments/create" className="inline-flex items-center gap-2 rounded-xl border border-teal-300/40 bg-teal-500/20 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-teal-500/30">Create Shipment</Link>
            </div>
          </div>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard title="Total Shipments" value={totalShipments} subtitle="Across active lanes" accent="navy" />
        <KpiCard title="Pending Documents" value={pendingDocs} subtitle="Need verification" accent="amber" />
        <KpiCard title="Verified Documents" value={verifiedDocs} subtitle="Compliance files" accent="emerald" />
        <KpiCard title="Rejected / Missing" value={rejectedOrMissing} subtitle="Blockers" accent="rose" />
        <KpiCard title="Active Alerts" value={unreadAlerts} subtitle="Unread reminders" accent="teal" />
      </section>

      {/* ── Visual Analytics Section ── */}
      <section className="grid gap-6 md:grid-cols-3">
        {/* Distribution by Country */}
        <article className="card-panel">
          <h3 className="text-sm font-bold text-navy-800 uppercase tracking-wider mb-4">Shipments by Country</h3>
          <div className="space-y-4">
            {countryDist.map(([country, count]) => (
              <div key={country}>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-slate-600">{country}</span>
                  <span className="text-navy-800">{count} Shipments</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-teal-600 rounded-full transition-all duration-1000" style={{ width: `${(count / totalShipments) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </article>

        {/* Verification Donut SVG */}
        <article className="card-panel flex flex-col items-center">
          <h3 className="w-full text-sm font-bold text-navy-800 dark:text-teal-400 uppercase tracking-wider mb-4">Verification Health</h3>
          <div className="relative w-40 h-40">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="16" fill="transparent" stroke="currentColor" strokeWidth="3.5" className="text-slate-100 dark:text-slate-800" />
              {docStats.reduce(({ offset, elements }, stat) => {
                const element = (
                  <circle key={stat.label} cx="18" cy="18" r="16" fill="transparent" stroke={stat.color} strokeWidth="3.5" strokeDasharray={`${stat.pct} 100`} strokeDashoffset={-offset} className="transition-all duration-1000" />
                );
                return { offset: offset + stat.pct, elements: [...elements, element] };
              }, { offset: 0, elements: [] as React.ReactNode[] }).elements}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-navy-800 dark:text-white">{complianceRate}%</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tight">Ready</span>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2 w-full">
            {docStats.map(stat => (
              <div key={stat.label} className="text-center">
                <div className="w-2 h-2 rounded-full mx-auto mb-1" style={{ backgroundColor: stat.color }} />
                <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase">{stat.label}</p>
                <p className="text-xs font-bold text-navy-800 dark:text-slate-200">{stat.value}</p>
              </div>
            ))}
          </div>
        </article>

        {/* Monthly Activity SVG Graph */}
        <article className="card-panel">
          <h3 className="text-sm font-bold text-navy-800 dark:text-teal-400 uppercase tracking-wider mb-2">Monthly Activity</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-medium">Shipments per month (Last 6 months)</p>
          <div className="h-32 w-full">
             <svg viewBox="0 0 100 40" className="w-full h-full" preserveAspectRatio="none">
               <path d={`M ${monthlyActivity.map(([, count], i) => `${(i / (monthlyActivity.length - 1)) * 100},${40 - (count / 5) * 30}`).join(' L ')}`} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-teal-600 dark:text-teal-400" />
               <path d={`M 0,40 ${monthlyActivity.map(([, count], i) => `${(i / (monthlyActivity.length - 1)) * 100},${40 - (count / 5) * 30}`).join(' L ')} L 100,40 Z`} fill="url(#gradient-activity)" />
               <defs>
                 <linearGradient id="gradient-activity" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0d9488" stopOpacity="0.15" /><stop offset="100%" stopColor="#0d9488" stopOpacity="0" /></linearGradient>
               </defs>
             </svg>
          </div>
          <div className="mt-3 flex justify-between">
             {monthlyActivity.map(([month]) => (
               <span key={month} className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
                 {new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' })}
               </span>
             ))}
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <article className="card-panel surface-glow">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div><h3 className="card-title">Executive Snapshot</h3><p className="card-subtitle">Operational health across shipments.</p></div>
            <Link to="/shipments" className="btn-secondary btn-sm">View All</Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
             <div className="card-muted bg-navy-50/60"><p className="eyebrow text-navy-600">Active Shipments</p><p className="metric-value">{activeShipments}</p></div>
             <div className="card-muted bg-teal-50/70"><p className="eyebrow text-teal-700">Compliance</p><p className="metric-value">{complianceRate}%</p></div>
             <div className="card-muted bg-rose-50/60"><p className="eyebrow text-rose-700">Delayed</p><p className="metric-value">{delayedShipments}</p></div>
          </div>
        </article>
        <article className="card-panel">
          <h3 className="card-title text-base font-bold text-navy-800 mb-4">Unread Notifications</h3>
          <div className="space-y-3">
            {priorityAlerts.slice(0, 3).map(n => (
              <div key={n.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <p className="text-xs font-bold text-navy-800">{n.title}</p>
                <p className="text-[11px] text-slate-500 mt-1">{n.message}</p>
              </div>
            ))}
            {priorityAlerts.length === 0 && <p className="text-xs text-slate-500 italic">No unread alerts.</p>}
          </div>
        </article>
      </section>

      {/* ── AI Predictions Spotlight ── */}
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-slide-up">
         <div className="lg:col-span-1 flex flex-col justify-center">
            <div className="flex items-center gap-3 text-navy-800 dark:text-teal-400 mb-2">
               <div className="p-2 rounded-xl bg-navy-100 dark:bg-teal-900/30">
                  <AppIcon name="ai-extract" className="h-6 w-6" />
               </div>
               <h3 className="text-lg font-bold">AI Risk Watch</h3>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Real-time neural monitoring of global shipping lanes and supply chain anomalies.</p>
         </div>
         {shipments.filter(s => s.status !== 'Delivered').slice(0, 3).map(s => (
            <AiDelayPrediction key={s.id} shipmentId={s.id} />
         ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <article className="card-panel">
          <div className="mb-4 flex items-center justify-between"><h3 className="card-title text-base font-bold">Recent Shipments</h3></div>
          <div className="table-shell"><table className="data-table min-w-[700px]">
            <thead><tr><th>ID</th><th>Client</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {recentShipments.map(s => (
                <tr key={s.id}>
                  <td className="font-bold text-navy-700">{s.id}</td>
                  <td className="text-xs">{s.clientName}</td>
                  <td className="text-xs">{s.shipmentDate}</td>
                  <td><StatusBadge value={s.status} /></td>
                  <td><Link to={`/shipments/${s.id}`} className="text-xs font-bold text-teal-600 hover:underline">Details</Link></td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </article>
        <article className="card-panel"><h3 className="card-title text-base font-bold mb-4">Operations Timeline</h3>
           <div className="space-y-3">
             {activityTimeline.slice(0, 5).map(item => (
               <div key={item.id} className="timeline-item">
                 <p className="text-[11px] font-bold text-navy-800">{item.title}</p>
                 <p className="text-[10px] text-slate-500">{item.detail}</p>
               </div>
             ))}
           </div>
        </article>
      </section>
      {/* ── AI Assistant & Analytics ── */}
      <section className="grid gap-6 lg:grid-cols-[1fr_2fr] animate-slide-up mt-6">
         <AiLogisticsAssistant />
         
         <article className="card-panel bg-navy-900 border-none text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
               <AppIcon name="shipments" className="h-40 w-40" />
            </div>
            <div className="relative">
               <h3 className="text-xl font-black uppercase tracking-tighter mb-2">Network Health Index</h3>
               <p className="text-sm text-navy-200 mb-8">Aggregated intelligence from global logistics lanes.</p>
               
               <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                     { label: 'Lane Stability', val: '94%', trend: '+2%' },
                     { label: 'Doc Accuracy', val: '98%', trend: '+0.5%' },
                     { label: 'Risk Mitigation', val: '87%', trend: '+4%' },
                     { label: 'Avg Lead Time', val: '12.4d', trend: '-1.2d' }
                  ].map(stat => (
                     <div key={stat.label} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                        <p className="text-[10px] font-bold uppercase text-navy-300 mb-1">{stat.label}</p>
                        <p className="text-2xl font-black">{stat.val}</p>
                        <p className="text-xs font-bold text-teal-400 mt-1">{stat.trend}</p>
                     </div>
                  ))}
               </div>

               <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
                  <div className="flex gap-4">
                     <div className="text-center">
                        <p className="text-[9px] font-bold uppercase text-navy-400 italic">Processing</p>
                        <p className="text-xs font-bold">4.2 TB/Day</p>
                     </div>
                     <div className="text-center">
                        <p className="text-[9px] font-bold uppercase text-navy-400 italic">Nodes Active</p>
                        <p className="text-xs font-bold">12 Active Regions</p>
                     </div>
                  </div>
                  <button className="btn-primary bg-teal-500 hover:bg-teal-600 border-none px-6">Strategic Report</button>
               </div>
            </div>
         </article>
      </section>
    </div>
  );
}
