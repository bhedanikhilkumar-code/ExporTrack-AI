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

  return (
    <div className="page-stack">
      <PageHeader
        title="Operations Dashboard"
        subtitle="Live command center for shipment health, document compliance, and team execution."
        action={
          <div className="flex flex-wrap gap-2">
            <Link to="/shipments/create" className="btn-primary">
              Create Shipment
            </Link>
            <Link to="/documents/upload" className="btn-secondary">
              Upload Documents
            </Link>
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

      <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <article className="card-panel surface-glow">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="card-title">Executive Snapshot</h3>
              <p className="card-subtitle">Operational health across active shipments and compliance workflow.</p>
            </div>
            <Link to="/shipments" className="btn-secondary btn-sm">
              View All Shipments
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="card-muted bg-navy-50/60">
              <p className="text-xs uppercase tracking-wide text-navy-600">Active Shipments</p>
              <p className="mt-1.5 text-2xl font-semibold text-navy-800">{activeShipments}</p>
              <p className="mt-1 text-xs text-slate-500">Out of {totalShipments} total lanes</p>
            </div>
            <div className="card-muted bg-teal-50/70">
              <p className="text-xs uppercase tracking-wide text-teal-700">Compliance Readiness</p>
              <p className="mt-1.5 text-2xl font-semibold text-navy-800">{complianceRate}%</p>
              <p className="mt-1 text-xs text-slate-500">{verifiedDocs} verified documents</p>
            </div>
            <div className="card-muted bg-rose-50/60">
              <p className="text-xs uppercase tracking-wide text-rose-700">Delayed Shipments</p>
              <p className="mt-1.5 text-2xl font-semibold text-navy-800">{delayedShipments}</p>
              <p className="mt-1 text-xs text-slate-500">Needs escalation and follow-up</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="card-muted">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold uppercase tracking-wide text-slate-500">Document Verification</span>
                <span className="font-semibold text-slate-700">{verifiedDocs}/{allDocuments.length}</span>
              </div>
              <div className="mt-2 h-2.5 rounded-full bg-slate-200">
                <div className="h-2.5 rounded-full bg-teal-600" style={{ width: `${complianceRate}%` }} />
              </div>
            </div>
            <div className="card-muted">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold uppercase tracking-wide text-slate-500">Attention Required</span>
                <span className="font-semibold text-slate-700">{rejectedOrMissing + unreadAlerts}</span>
              </div>
              <div className="mt-2 h-2.5 rounded-full bg-slate-200">
                <div
                  className="h-2.5 rounded-full bg-amber-500"
                  style={{
                    width: `${Math.min(100, Math.round(((rejectedOrMissing + unreadAlerts) / Math.max(1, allDocuments.length)) * 100))}%`
                  }}
                />
              </div>
            </div>
          </div>
        </article>

        <article className="card-panel">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="card-title text-base md:text-lg">Pending Document Alerts</h3>
            <Link to="/notifications" className="btn-secondary btn-sm">
              Open Alerts
            </Link>
          </div>
          <div className="space-y-3">
            {priorityAlerts.length ? (
              priorityAlerts.map((alert) => (
                <div key={alert.id} className="card-muted">
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-800">{alert.title}</p>
                    <StatusBadge value={alert.severity} />
                  </div>
                  <p className="text-xs text-slate-600">{alert.message}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-slate-500">Due: {alert.dueDate}</span>
                    <Link to={`/shipments/${alert.shipmentId}`} className="text-xs font-semibold text-teal-700 hover:text-teal-800">
                      {alert.shipmentId}
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="card-muted text-sm text-slate-600">No unread alerts. Operations are clear.</div>
            )}
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <article className="card-panel">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="card-title text-base md:text-lg">Recent Shipments</h3>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Last 7 updates</p>
          </div>
          <div className="table-shell">
            <table className="data-table min-w-[900px]">
              <thead>
                <tr>
                  <th>Shipment ID</th>
                  <th>Client</th>
                  <th>Destination</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Assigned</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentShipments.map((shipment) => (
                  <tr key={shipment.id}>
                    <td className="font-semibold text-navy-700">{shipment.id}</td>
                    <td>{shipment.clientName}</td>
                    <td>{shipment.destinationCountry}</td>
                    <td>{shipment.shipmentDate}</td>
                    <td>
                      <StatusBadge value={shipment.status} />
                    </td>
                    <td>{shipment.assignedTo}</td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        <Link to={`/shipments/${shipment.id}`} className="btn-secondary btn-xs">
                          Details
                        </Link>
                        <Link to={`/shipments/${shipment.id}/upload`} className="btn-secondary btn-xs">
                          Upload
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="card-panel">
          <h3 className="card-title text-base md:text-lg">Verification Progress</h3>
          <p className="card-subtitle">Track file readiness by shipment before customs deadlines.</p>
          <div className="mt-4 space-y-3">
            {verificationRows.map((row) => (
              <div key={row.id} className="card-muted">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-navy-800">{row.id}</p>
                    <p className="text-xs text-slate-500">{row.client}</p>
                  </div>
                  <StatusBadge value={row.status} />
                </div>
                <div className="mb-2 h-2 rounded-full bg-slate-200">
                  <div className="h-2 rounded-full bg-teal-600" style={{ width: `${row.pct}%` }} />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                  <span>
                    {row.verifiedCount}/{row.requiredCount} verified • {row.pct}%
                  </span>
                  <span>
                    Pending: {row.pending} • Blocked: {row.blocked}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1.15fr]">
        <article className="card-panel">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="card-title text-base md:text-lg">Missing / Rejected Documents</h3>
            <Link to="/verification" className="btn-secondary btn-sm">
              Open Verification
            </Link>
          </div>
          <div className="space-y-2.5">
            {blockedDocs.map((item, idx) => (
              <div key={`${item.shipmentId}-${item.type}-${idx}`} className="card-muted flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{item.type}</p>
                  <p className="text-xs text-slate-500">
                    {item.shipmentId} • {item.client}
                  </p>
                </div>
                <StatusBadge value={item.status} />
              </div>
            ))}
          </div>
        </article>

        <article className="card-panel">
        <div className="mb-4 flex items-center justify-between">
            <h3 className="card-title text-base md:text-lg">Recent Activity Timeline</h3>
          <div className="flex flex-wrap gap-2">
              <Link to="/verification" className="btn-secondary btn-xs">
                Verification
              </Link>
              <Link to="/notifications" className="btn-secondary btn-xs">
                Notifications
              </Link>
          </div>
        </div>
          <div className="space-y-3">
          {activityTimeline.map((item) => (
              <div key={item.id} className="timeline-item">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                  <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-700">{item.type}</span>
                </div>
              <p className="text-xs text-slate-600">{item.detail}</p>
                <p className="mt-1 text-[11px] text-slate-500">{item.time.slice(0, 16).replace('T', ' ')}</p>
            </div>
          ))}
        </div>
        </article>
      </section>
    </div>
  );
}
