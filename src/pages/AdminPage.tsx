import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { useAppContext } from '../context/AppContext';

export default function AdminPage() {
  const {
    state: { user, shipments, teamMembers, notifications }
  } = useAppContext();

  if (user?.role !== 'Admin') {
    return (
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-soft">
        <h2 className="text-2xl font-semibold text-amber-800">Admin Access Required</h2>
        <p className="mt-2 text-sm text-amber-700">
          Your current role is <span className="font-semibold">{user?.role ?? 'Coordinator'}</span>. Switch to Admin in Profile & Team
          Management to view this panel.
        </p>
        <Link to="/team" className="mt-4 inline-flex rounded-lg bg-amber-700 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-800">
          Go to Role Switcher
        </Link>
      </section>
    );
  }

  const pendingApprovals = shipments.filter((shipment) => shipment.documents.some((doc) => doc.status === 'Pending' || doc.status === 'Rejected'));
  const unresolvedAlerts = notifications.filter((notification) => !notification.read).length;
  const openCases = shipments.filter((shipment) => shipment.status !== 'Delivered').length;

  return (
    <div>
      <PageHeader title="Admin Console" subtitle="Role-based control surface for approvals, workload balancing, and compliance escalations." />

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-slate-500">Open Cases</p>
          <p className="mt-2 text-3xl font-semibold text-navy-800">{openCases}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-slate-500">Pending Approvals</p>
          <p className="mt-2 text-3xl font-semibold text-amber-700">{pendingApprovals.length}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-slate-500">Unresolved Alerts</p>
          <p className="mt-2 text-3xl font-semibold text-rose-700">{unresolvedAlerts}</p>
        </article>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-navy-800">Approval Queue</h3>
          <button
            type="button"
            onClick={() => window.alert('Bulk approval workflow triggered (mock).')}
            className="rounded-lg bg-navy-700 px-3 py-2 text-xs font-semibold text-white hover:bg-navy-800"
          >
            Bulk Action (Mock)
          </button>
        </div>
        <div className="space-y-3">
          {pendingApprovals.map((shipment) => (
            <article key={shipment.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-navy-800">{shipment.id}</p>
                  <p className="text-sm text-slate-700">
                    {shipment.clientName} • {shipment.destinationCountry}
                  </p>
                  <p className="text-xs text-slate-500">Pending docs: {shipment.documents.filter((doc) => doc.status === 'Pending').length}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge value={shipment.priority} />
                  <Link
                    to={`/shipments/${shipment.id}`}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Review
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <h3 className="mb-3 text-lg font-semibold text-navy-800">Team Role Overview</h3>
        <div className="grid gap-3 md:grid-cols-3">
          {['Admin', 'Manager', 'Coordinator'].map((role) => {
            const members = teamMembers.filter((member) => member.role === role);
            return (
              <article key={role} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-semibold text-slate-800">{role}</p>
                  <StatusBadge value={role} />
                </div>
                <p className="text-sm text-slate-600">{members.length} team members</p>
                <p className="mt-2 text-xs text-slate-500">{members.map((member) => member.name).join(', ')}</p>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
