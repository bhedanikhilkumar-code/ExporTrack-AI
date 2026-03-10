import { Link } from 'react-router-dom';
import KpiCard from '../components/KpiCard';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { useAppContext } from '../context/AppContext';

export default function DashboardPage() {
  const {
    state: { shipments, notifications }
  } = useAppContext();

  const allDocuments = shipments.flatMap((shipment) => shipment.documents);
  const totalShipments = shipments.length;
  const pendingDocs = allDocuments.filter((doc) => doc.status === 'Pending').length;
  const verifiedDocs = allDocuments.filter((doc) => doc.status === 'Verified').length;
  const rejectedOrMissing = allDocuments.filter((doc) => doc.status === 'Rejected' || doc.status === 'Missing').length;
  const unreadAlerts = notifications.filter((n) => !n.read).length;

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

  return (
    <div>
      <PageHeader
        title="Operations Dashboard"
        subtitle="Live command center for shipment health, document compliance, and team execution."
        action={
          <div className="flex flex-wrap gap-2">
            <Link to="/shipments/create" className="btn-primary">+ Create Shipment</Link>
            <Link to="/documents/upload" className="btn-secondary">Upload Documents</Link>
          </div>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard title="Total Shipments" value={totalShipments} subtitle="Across active lanes" accent="navy" />
        <KpiCard title="Pending Documents" value={pendingDocs} subtitle="Need verification" accent="amber" />
        <KpiCard title="Verified Documents" value={verifiedDocs} subtitle="Compliance-ready files" accent="emerald" />
        <KpiCard title="Rejected / Missing" value={rejectedOrMissing} subtitle="Potential blockers" accent="rose" />
        <KpiCard title="Active Alerts" value={unreadAlerts} subtitle="Unread high-priority reminders" accent="teal" />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <article className="card-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold tracking-tight text-navy-800">Recent Shipments</h3>
            <Link to="/shipments" className="text-sm font-semibold text-teal-700 hover:text-teal-800">View all shipments</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table w-full min-w-[840px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th>Shipment ID</th><th>Client</th><th>Destination</th><th>Date</th><th>Status</th><th>Assigned</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentShipments.map((shipment) => (
                  <tr key={shipment.id} className="border-b border-slate-100 last:border-none hover:bg-slate-50/70">
                    <td className="font-semibold text-navy-700">{shipment.id}</td>
                    <td>{shipment.clientName}</td>
                    <td>{shipment.destinationCountry}</td>
                    <td>{shipment.shipmentDate}</td>
                    <td><StatusBadge value={shipment.status} /></td>
                    <td>{shipment.assignedTo}</td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        <Link to={`/shipments/${shipment.id}`} className="btn-secondary px-2.5 py-1.5 text-xs">Details</Link>
                        <Link to={`/shipments/${shipment.id}/upload`} className="btn-secondary px-2.5 py-1.5 text-xs">Upload</Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="card-surface p-5">
          <h3 className="mb-4 text-lg font-bold tracking-tight text-navy-800">Pending Document Alerts</h3>
          <div className="space-y-3">
            {priorityAlerts.map((alert) => (
              <div key={alert.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-800">{alert.title}</p>
                  <StatusBadge value={alert.severity} />
                </div>
                <p className="text-xs text-slate-600">{alert.message}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Due: {alert.dueDate}</span>
                  <Link to={`/shipments/${alert.shipmentId}`} className="text-xs font-semibold text-teal-700">{alert.shipmentId}</Link>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
        <article className="card-surface p-5">
          <h3 className="mb-4 text-lg font-bold tracking-tight text-navy-800">Missing / Rejected Documents</h3>
          <div className="space-y-2.5">
            {blockedDocs.map((item, idx) => (
              <div key={`${item.shipmentId}-${item.type}-${idx}`} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{item.type}</p>
                  <p className="text-xs text-slate-500">{item.shipmentId} • {item.client}</p>
                </div>
                <StatusBadge value={item.status} />
              </div>
            ))}
          </div>
        </article>

        <article className="card-surface p-5">
          <h3 className="mb-4 text-lg font-bold tracking-tight text-navy-800">Verification Progress</h3>
          <div className="space-y-3">
            {verificationRows.map((row) => (
              <div key={row.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div><p className="text-sm font-semibold text-navy-800">{row.id}</p><p className="text-xs text-slate-500">{row.client}</p></div>
                  <StatusBadge value={row.status} />
                </div>
                <div className="mb-2 h-2 rounded-full bg-slate-200"><div className="h-2 rounded-full bg-teal-600" style={{ width: `${row.pct}%` }} /></div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600"><span>{row.verifiedCount}/{row.requiredCount} verified • {row.pct}%</span><span>Pending: {row.pending} • Blocked: {row.blocked}</span></div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="card-surface mt-6 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold tracking-tight text-navy-800">Recent Activity Timeline</h3>
          <div className="flex flex-wrap gap-2">
            <Link to="/verification" className="btn-secondary px-3 py-1.5 text-xs">Open Verification</Link>
            <Link to="/notifications" className="btn-secondary px-3 py-1.5 text-xs">Open Notifications</Link>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {activityTimeline.map((item) => (
            <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="mb-1 flex items-center justify-between gap-2"><p className="text-sm font-semibold text-slate-800">{item.title}</p><span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-700">{item.type}</span></div>
              <p className="text-xs text-slate-600">{item.detail}</p>
              <p className="mt-1 text-[11px] text-slate-500">{item.time.slice(0, 16).replace('T', ' ')}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
