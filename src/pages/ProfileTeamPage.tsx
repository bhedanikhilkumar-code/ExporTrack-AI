import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { useAppContext } from '../context/AppContext';
import { Role } from '../types';

const permissionMatrix = [
  { action: 'View shipment records', Admin: true, Manager: true, Staff: true },
  { action: 'Approve/reject documents', Admin: true, Manager: true, Staff: false },
  { action: 'Create internal notes', Admin: true, Manager: true, Staff: false },
  { action: 'Manage team roles', Admin: true, Manager: false, Staff: false },
  { action: 'Export shipment bundles', Admin: true, Manager: true, Staff: true }
] as const;

export default function ProfileTeamPage() {
  const {
    state: { user, teamMembers, shipments },
    switchRole
  } = useAppContext();

  const memberStats = teamMembers.map((member) => {
    const assigned = shipments.filter((s) => s.assignedTo === member.name);
    const pending = assigned.reduce((sum, s) => sum + s.documents.filter((d) => d.status === 'Pending').length, 0);
    return {
      ...member,
      assignedCount: assigned.length,
      pendingDocs: pending,
      note: assigned.length ? `Handling ${assigned[0].destinationCountry} lane updates` : 'Available for new assignments'
    };
  });

  return (
    <div>
      <PageHeader
        title="Profile & Team Management"
        subtitle="Role-based operations view with team workload, assigned shipments, and coordination notes."
        action={
          <div className="flex items-center gap-2">
            <label htmlFor="role-switcher" className="text-xs font-medium text-slate-600">Switch Role:</label>
            <select
              id="role-switcher"
              value={user?.role ?? 'Staff'}
              onChange={(event) => switchRole(event.target.value as Role)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-teal-200 focus:ring"
            >
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Staff">Staff</option>
            </select>
          </div>
        }
      />

      <section className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
        <article className="card-surface p-5">
          <h3 className="text-lg font-semibold text-navy-800">Current User</h3>
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-800">{user?.name ?? 'Unassigned User'}</p>
            <p className="text-sm text-slate-600">{user?.email ?? 'No email'}</p>
            <div className="mt-3"><StatusBadge value={user?.role ?? 'Staff'} /></div>
          </div>
        </article>

        <article className="card-surface p-5">
          <h3 className="text-lg font-semibold text-navy-800">Team Directory</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {memberStats.map((member) => (
              <div key={member.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{member.name}</p>
                    <p className="text-xs text-slate-500">{member.email}</p>
                  </div>
                  <StatusBadge value={member.role} />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-white p-2"><p className="text-slate-500">Assigned</p><p className="font-semibold text-slate-800">{member.assignedCount}</p></div>
                  <div className="rounded-lg bg-white p-2"><p className="text-slate-500">Pending Docs</p><p className="font-semibold text-slate-800">{member.pendingDocs}</p></div>
                </div>
                <p className="mt-3 text-xs text-slate-500">Region: {member.region} • Last active {member.lastActive.slice(0, 10)}</p>
                <p className="mt-1 text-xs text-slate-600">Note: {member.note}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="card-surface mt-6 p-5">
        <h3 className="mb-3 text-lg font-semibold text-navy-800">Role Access Matrix</h3>
        <div className="overflow-x-auto">
          <table className="data-table w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th>Capability</th><th>Admin</th><th>Manager</th><th>Staff</th>
              </tr>
            </thead>
            <tbody>
              {permissionMatrix.map((row) => (
                <tr key={row.action} className="border-b border-slate-100 last:border-none">
                  <td className="font-medium text-slate-700">{row.action}</td>
                  <td>{row.Admin ? 'Yes' : 'No'}</td>
                  <td>{row.Manager ? 'Yes' : 'No'}</td>
                  <td>{row.Staff ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
