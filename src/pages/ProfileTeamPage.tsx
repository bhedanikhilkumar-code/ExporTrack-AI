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
    state: { user, teamMembers },
    switchRole
  } = useAppContext();

  return (
    <div>
      <PageHeader
        title="Profile & Team Management"
        subtitle="Mock role-based access for Admin, Manager, and Staff collaboration."
        action={
          <div className="flex items-center gap-2">
            <label htmlFor="role-switcher" className="text-xs font-medium text-slate-600">
              Switch Role:
            </label>
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

      <section className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <h3 className="text-lg font-semibold text-navy-800">Current User</h3>
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-800">{user?.name ?? 'Unassigned User'}</p>
            <p className="text-sm text-slate-600">{user?.email ?? 'No email'}</p>
            <div className="mt-3">
              <StatusBadge value={user?.role ?? 'Staff'} />
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <h3 className="text-lg font-semibold text-navy-800">Team Directory</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {teamMembers.map((member) => (
              <div key={member.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-800">{member.name}</p>
                <p className="text-xs text-slate-500">{member.email}</p>
                <div className="mt-2 flex items-center justify-between">
                  <StatusBadge value={member.role} />
                  <span className="text-xs text-slate-500">{member.activeCases} active</span>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Region: {member.region} • Last active {member.lastActive.slice(0, 10)}
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <h3 className="mb-3 text-lg font-semibold text-navy-800">Role Access Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-2 font-medium">Capability</th>
                <th className="pb-2 font-medium">Admin</th>
                <th className="pb-2 font-medium">Manager</th>
                <th className="pb-2 font-medium">Staff</th>
              </tr>
            </thead>
            <tbody>
              {permissionMatrix.map((row) => (
                <tr key={row.action} className="border-b border-slate-100 last:border-none">
                  <td className="py-3 font-medium text-slate-700">{row.action}</td>
                  <td className="py-3">{row.Admin ? 'Yes' : 'No'}</td>
                  <td className="py-3">{row.Manager ? 'Yes' : 'No'}</td>
                  <td className="py-3">{row.Staff ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

