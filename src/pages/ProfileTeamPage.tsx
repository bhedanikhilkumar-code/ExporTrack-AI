import { useState, useMemo, memo } from 'react';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import AppIcon from '../components/AppIcon';
import { useAppContext } from '../context/AppContext';
import { Role } from '../types';

const permissionMatrix = [
  { action: 'View Shipment Analytics', Admin: true, Manager: true, Operations: true, Broker: true, Auditor: true, Customer: true },
  { action: 'Create/Edit Shipments', Admin: true, Manager: true, Operations: true, Broker: false, Auditor: false, Customer: false },
  { action: 'Approve Documents', Admin: true, Manager: true, Operations: false, Broker: false, Auditor: false, Customer: false },
  { action: 'Internal Risk Notes', Admin: true, Manager: true, Operations: true, Broker: false, Auditor: true, Customer: false },
  { action: 'System Configurations', Admin: true, Manager: false, Operations: false, Broker: false, Auditor: false, Customer: false },
  { action: 'Financial Audits', Admin: true, Manager: true, Operations: false, Broker: false, Auditor: true, Customer: false }
] as const;

export default function ProfileTeamPage() {
  const {
    state: { user, teamMembers, shipments },
    switchRole,
    hasPermission
  } = useAppContext();

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('Operations');

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    window.alert(`Invitation sent to ${inviteEmail} as ${inviteRole}`);
    setShowInviteModal(false);
    setInviteEmail('');
  };

  const memberStats = teamMembers.map((member) => {
    const assigned = shipments.filter((s) => s.assignedTo === member.name);
    const pending = assigned.reduce((sum, s) => sum + s.documents.filter((d) => d.status === 'Pending').length, 0);
    return {
      ...member,
      assignedCount: assigned.length,
      pendingDocs: pending,
      status: Math.random() > 0.3 ? 'online' : 'away'
    };
  });

  return (
    <div className="page-stack">
      <PageHeader
        title="Profile & Team Management"
        subtitle="Role-based operations view with team workload, assigned shipments, and coordination notes."
        action={
          <div className="flex items-center gap-2">
            <label htmlFor="role-switcher" className="text-xs font-medium text-slate-600">
              Identity Simulation:
            </label>
            <select
              id="role-switcher"
              value={user?.role ?? 'Operations'}
              onChange={(event) => switchRole(event.target.value as Role)}
              className="input-field min-w-[140px] py-1.5 text-xs font-bold uppercase tracking-wider"
            >
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Operations">Operations</option>
              <option value="Broker">Broker</option>
              <option value="Auditor">Auditor</option>
              <option value="Customer">Customer</option>
            </select>
          </div>
        }
      />

      <section className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
        <article className="card-panel">
          <h3 className="card-title text-base md:text-lg">Current User</h3>
          <div className="mt-4 card-muted p-4">
            <p className="text-sm font-semibold text-slate-800">{user?.name ?? 'Unassigned User'}</p>
            <p className="text-xs text-slate-600">{user?.email ?? 'No email'}</p>
            <div className="mt-3">
              <StatusBadge value={user?.role ?? 'Operations'} />
            </div>
          </div>
        </article>

        <article className="card-panel">
          <div className="flex items-center justify-between mb-6">
            <h3 className="card-title text-base md:text-lg m-0">Team Directory</h3>
            {hasPermission('manage_users') && (
              <button 
                onClick={() => setShowInviteModal(true)}
                className="btn-primary py-1.5 px-3 text-xs flex items-center gap-2"
              >
                <AppIcon name="create" className="h-3.5 w-3.5" />
                Invite Member
              </button>
            )}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {memberStats.map((member) => (
              <div key={member.id} className="card-muted p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{member.name}</p>
                    <p className="text-xs text-slate-500">{member.email}</p>
                  </div>
                  <StatusBadge value={member.role} />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-white p-2">
                    <p className="text-slate-500">Assigned</p>
                    <p className="font-semibold text-slate-800">{member.assignedCount}</p>
                  </div>
                  <div className="rounded-lg bg-white p-2">
                    <p className="text-slate-500">Pending Docs</p>
                    <p className="font-semibold text-slate-800">{member.pendingDocs}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Region: {member.region}</p>
                  <div className="flex items-center gap-1">
                    <div className={`h-1.5 w-1.5 rounded-full ${member.status === 'online' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    <span className="text-[10px] font-medium text-slate-400 capitalize">{member.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="card-premium w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="text-lg font-black text-slate-900 dark:text-white">Invite Team Member</h3>
                 <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                    <AppIcon name="x" className="h-5 w-5" />
                 </button>
              </div>
              <form onSubmit={handleInvite} className="space-y-4">
                 <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Email Address</label>
                    <input 
                      type="email" 
                      required 
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="teammate@exportrack.ai" 
                      className="input-field" 
                    />
                 </div>
                 <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Access Role</label>
                    <select 
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as Role)}
                      className="input-field"
                    >
                       <option value="Admin">Admin</option>
                       <option value="Manager">Manager</option>
                       <option value="Operations">Operations</option>
                       <option value="Broker">Broker</option>
                       <option value="Auditor">Auditor</option>
                    </select>
                 </div>
                 <div className="pt-4 flex gap-3">
                    <button type="submit" className="btn-primary flex-1 py-3 justify-center">Send Invitation</button>
                    <button type="button" onClick={() => setShowInviteModal(false)} className="btn-secondary px-6">Cancel</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      <section className="card-panel">
        <h3 className="mb-3 card-title text-base md:text-lg">Role Access Matrix</h3>
        <div className="table-shell">
          <table className="data-table min-w-[640px]">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                <th className="text-left pb-4">Capability</th>
                <th className="pb-4">Adm</th>
                <th className="pb-4">Mgr</th>
                <th className="pb-4">Ops</th>
                <th className="pb-4">Bkr</th>
                <th className="pb-4">Aud</th>
                <th className="pb-4">Cus</th>
              </tr>
            </thead>
            <tbody>
              {permissionMatrix.map((row) => (
                <tr key={row.action} className="border-t border-slate-100 dark:border-slate-800/50">
                  <td className="py-4 text-xs font-bold text-slate-700 dark:text-slate-300">{row.action}</td>
                  <td className="text-center">{row.Admin ? '✓' : '—'}</td>
                  <td className="text-center">{row.Manager ? '✓' : '—'}</td>
                  <td className="text-center">{row.Operations ? '✓' : '—'}</td>
                  <td className="text-center">{row.Broker ? '✓' : '—'}</td>
                  <td className="text-center">{row.Auditor ? '✓' : '—'}</td>
                  <td className="text-center">{row.Customer ? '✓' : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
