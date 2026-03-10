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
  const verifiedFiles = allDocuments.filter((doc) => doc.status === 'Verified').length;
  const rejectedOrMissing = allDocuments.filter((doc) => doc.status === 'Rejected' || doc.status === 'Missing').length;
  const activeAlerts = notifications.filter((notification) => !notification.read).length;

  const recentShipments = [...shipments].sort((a, b) => b.shipmentDate.localeCompare(a.shipmentDate)).slice(0, 6);
  const latestAlerts = [...notifications].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4);

  const recentActivity = [
    ...shipments.flatMap((shipment) =>
      shipment.comments.slice(0, 1).map((comment) => ({ id: `ACT-${comment.id}`, time: comment.createdAt, title: `${shipment.id} • ${comment.author}`, detail: comment.message }))
    ),
    ...shipments.flatMap((shipment) =>
      shipment.documents.slice(0, 1).map((doc) => ({ id: `ACT-${doc.id}`, time: doc.uploadedAt, title: `${shipment.id} • ${doc.type}`, detail: `${doc.status} • ${doc.fileName}` }))
    )
  ]
    .sort((a, b) => b.time.localeCompare(a.time))
    .slice(0, 6);

  return (
    <div>
      <PageHeader title="Operations Dashboard" subtitle="Enterprise visibility across shipments, document quality, reminders, and team activity." action={<Link to="/shipments/new" className="btn-primary">+ Create Shipment</Link>} />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard title="Total Shipments" value={totalShipments} subtitle="Across all regions" accent="navy" />
        <KpiCard title="Pending Docs" value={pendingDocs} subtitle="Require review" accent="amber" />
        <KpiCard title="Verified Docs" value={verifiedFiles} subtitle="Approved and compliant" accent="emerald" />
        <KpiCard title="Rejected / Missing" value={rejectedOrMissing} subtitle="Needs immediate action" accent="rose" />
        <KpiCard title="Alerts" value={activeAlerts} subtitle="Unread notifications" accent="teal" />
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <article className="card-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold tracking-tight text-navy-800">Recent Shipments</h3>
            <Link to="/search" className="text-sm font-semibold text-teal-700 hover:text-teal-800">Open Search</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th>Shipment ID</th><th>Client</th><th>Destination</th><th>Date</th><th>Status</th><th>Actions</th>
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
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold tracking-tight text-navy-800">Alerts & Reminders</h3>
            <Link to="/notifications" className="text-sm font-semibold text-teal-700 hover:text-teal-800">View All</Link>
          </div>
          <div className="space-y-3">
            {latestAlerts.map((alert) => (
              <div key={alert.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 transition hover:border-teal-200 hover:bg-teal-50/40">
                <div className="mb-2 flex items-center justify-between gap-2"><p className="text-sm font-semibold text-slate-800">{alert.title}</p><StatusBadge value={alert.severity} /></div>
                <p className="text-xs text-slate-600">{alert.message}</p>
                <div className="mt-2 flex items-center justify-between"><span className="text-xs text-slate-500">Due: {alert.dueDate}</span><Link to={`/shipments/${alert.shipmentId}`} className="text-xs font-semibold text-teal-700 hover:text-teal-800">{alert.shipmentId}</Link></div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="card-surface mt-6 p-5">
        <h3 className="mb-3 text-lg font-bold tracking-tight text-navy-800">Recent Activity</h3>
        <div className="grid gap-3 md:grid-cols-2">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 transition hover:border-slate-300 hover:bg-white">
              <p className="text-xs text-slate-500">{activity.time.slice(0, 16).replace('T', ' ')}</p>
              <p className="text-sm font-semibold text-slate-800">{activity.title}</p>
              <p className="text-xs text-slate-600">{activity.detail}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

