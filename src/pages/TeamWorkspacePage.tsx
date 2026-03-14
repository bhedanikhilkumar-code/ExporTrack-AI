import { useState } from 'react';
import AppIcon from '../components/AppIcon';
import StatusBadge from '../components/StatusBadge';
import { useAppContext } from '../context/AppContext';
import { TeamMember, Role } from '../types';
import {
  WORKSPACE_ROLES,
  ROLE_DESCRIPTIONS,
  ROLE_COLORS,
  PERMISSION_LABELS,
  hasPermission,
  toWorkspaceRole,
  type WorkspaceRole,
  type Permission,
} from '../utils/permissions';

/* ─── All permissions for the matrix ─────────────────────────────────── */
const ALL_PERMISSIONS: Permission[] = [
  'manage_users', 'invite_users', 'remove_users',
  'edit_shipments', 'create_shipments', 'update_tracking', 'view_shipments',
  'access_analytics', 'manage_documents', 'approve_documents', 'view_documents',
  'manage_settings',
];

/* ─── Component ──────────────────────────────────────────────────────── */
export default function TeamWorkspacePage() {
  const {
    state: { user, teamMembers, shipments },
    switchRole,
  } = useAppContext();

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<WorkspaceRole>('Viewer');
  const [inviteName, setInviteName] = useState('');
  const [inviteSent, setInviteSent] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [activeTab, setActiveTab] = useState<'members' | 'roles' | 'activity'>('members');

  const currentRole = user?.role ? toWorkspaceRole(user.role) : 'Viewer';
  const canManageUsers = hasPermission(currentRole, 'manage_users');
  const canInvite = hasPermission(currentRole, 'invite_users');

  // Stats per member
  const memberStats = teamMembers.map(member => {
    const assigned = shipments.filter(s => s.assignedTo === member.name);
    const pending = assigned.reduce((sum, s) => sum + s.documents.filter(d => d.status === 'Pending').length, 0);
    return { ...member, assignedCount: assigned.length, pendingDocs: pending };
  });

  const handleInvite = () => {
    if (!inviteEmail.trim()) return;
    setInviteSent(true);
    setTimeout(() => {
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteName('');
      setInviteRole('Viewer');
      setInviteSent(false);
    }, 2000);
  };

  const roleDistribution = WORKSPACE_ROLES.map(role => ({
    role,
    count: teamMembers.filter(m => toWorkspaceRole(m.role) === role).length,
  }));

  return (
    <>
      <style>{`
        @keyframes tw-fade-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .tw-animate { animation: tw-fade-in 0.4s cubic-bezier(.4,0,.2,1) both; }
      `}</style>

      <main className="page-stack px-4 md:px-6">
        {/* ── Header ── */}
        <header className="dashboard-grid-header">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white" style={{ letterSpacing: '-0.03em' }}>
              Team Workspace
            </h1>
            <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
              Manage team members, assign roles, and control access permissions
            </p>
          </div>
          <div className="flex items-center gap-3">
            {canInvite && (
              <button onClick={() => setShowInviteModal(true)} className="btn-primary inline-flex items-center gap-2">
                <AppIcon name="create" className="h-4 w-4" />
                Invite Member
              </button>
            )}
            {/* Role switcher */}
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Role:</label>
              <select
                value={user?.role ?? 'Staff'}
                onChange={e => switchRole(e.target.value as Role)}
                className="input-field min-w-[120px] py-2 text-xs"
              >
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Staff">Operations</option>
              </select>
            </div>
          </div>
        </header>

        {/* ── Role Distribution Cards ── */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {roleDistribution.map(({ role, count }) => {
            const colors = ROLE_COLORS[role];
            return (
              <div key={role} className={`relative overflow-hidden bg-white dark:bg-slate-900/80 p-5 rounded-2xl border ${colors.border} flex flex-col gap-2 group shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5`}>
                <div className="absolute inset-0 bg-gradient-to-br from-slate-100/50 to-transparent dark:from-slate-800/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <div className="relative">
                  <div className={`mb-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${colors.bg} ${colors.text}`}>
                    <AppIcon name="team" className="h-3 w-3" />
                    {role}
                  </div>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white" style={{ letterSpacing: '-0.03em' }}>{count}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Member{count !== 1 ? 's' : ''}</p>
                </div>
              </div>
            );
          })}
        </section>

        {/* ── Tabs ── */}
        <div className="flex items-center gap-1 bg-slate-100/50 dark:bg-slate-900/50 rounded-xl p-1 w-fit border border-slate-200/60 dark:border-slate-800/60">
          {(['members', 'roles', 'activity'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all capitalize ${
                activeTab === tab
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {tab === 'members' ? 'Team Members' : tab === 'roles' ? 'Role Matrix' : 'Activity Log'}
            </button>
          ))}
        </div>

        {/* ── Members Tab ── */}
        {activeTab === 'members' && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 tw-animate">
            {memberStats.map(member => {
              const wsRole = toWorkspaceRole(member.role);
              const colors = ROLE_COLORS[wsRole];
              const isOnline = Date.now() - new Date(member.lastActive).getTime() < 3600000;
              return (
                <article
                  key={member.id}
                  className="card-premium group cursor-pointer hover:shadow-xl transition-all"
                  onClick={() => setSelectedMember(selectedMember?.id === member.id ? null : member)}
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-sm font-extrabold text-slate-600 dark:text-slate-300">
                          {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-slate-900 ${isOnline ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{member.name}</p>
                        <p className="text-[11px] text-slate-500">{member.email}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${colors.bg} ${colors.text} border ${colors.border}`}>
                      {wsRole}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-slate-50 dark:bg-slate-800/30 rounded-xl p-3 text-center">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Assigned</p>
                      <p className="text-lg font-extrabold text-slate-900 dark:text-white">{member.assignedCount}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/30 rounded-xl p-3 text-center">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Pending</p>
                      <p className="text-lg font-extrabold text-amber-600 dark:text-amber-400">{member.pendingDocs}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/30 rounded-xl p-3 text-center">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Region</p>
                      <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 mt-1">{member.region}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">
                      Last active: {new Date(member.lastActive).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    {canManageUsers && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={e => { e.stopPropagation(); alert(`Role changed for ${member.name}`); }}
                          className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-teal-100 hover:text-teal-700 font-bold transition-colors"
                        >
                          Change Role
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); alert(`Removed ${member.name} from team`); }}
                          className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-rose-500 hover:bg-rose-100 hover:text-rose-700 font-bold transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Expanded permissions */}
                  {selectedMember?.id === member.id && (
                    <div className="mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/60 tw-animate">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Permissions</p>
                      <div className="flex flex-wrap gap-1.5">
                        {ALL_PERMISSIONS.map(perm => {
                          const has = hasPermission(wsRole, perm);
                          return (
                            <span
                              key={perm}
                              className={`px-2 py-1 rounded-md text-[9px] font-bold ${
                                has
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                                  : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600 line-through'
                              }`}
                            >
                              {PERMISSION_LABELS[perm]}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}

        {/* ── Roles Tab ── */}
        {activeTab === 'roles' && (
          <div className="space-y-6 tw-animate">
            {/* Role Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {WORKSPACE_ROLES.map(role => {
                const colors = ROLE_COLORS[role];
                return (
                  <article key={role} className="card-premium">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${colors.bg} ${colors.text} border ${colors.border} mb-3`}>
                      <AppIcon name="shield" className="h-3.5 w-3.5" />
                      {role}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-4">{ROLE_DESCRIPTIONS[role]}</p>
                    <div className="space-y-1.5">
                      {ALL_PERMISSIONS.map(perm => {
                        const has = hasPermission(role, perm);
                        return (
                          <div key={perm} className="flex items-center gap-2">
                            {has ? (
                              <AppIcon name="check" className="h-3 w-3 text-emerald-500 shrink-0" strokeWidth={3} />
                            ) : (
                              <AppIcon name="cross" className="h-3 w-3 text-slate-300 dark:text-slate-600 shrink-0" strokeWidth={2} />
                            )}
                            <span className={`text-[10px] font-medium ${has ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-600'}`}>
                              {PERMISSION_LABELS[perm]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Permission Matrix Table */}
            <article className="card-premium overflow-hidden">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Permission Matrix</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Permission</th>
                      {WORKSPACE_ROLES.map(role => (
                        <th key={role} className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">{role}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {ALL_PERMISSIONS.map(perm => (
                      <tr key={perm} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                        <td className="px-4 py-3 text-xs font-medium text-slate-700 dark:text-slate-300">{PERMISSION_LABELS[perm]}</td>
                        {WORKSPACE_ROLES.map(role => (
                          <td key={role} className="px-4 py-3 text-center">
                            {hasPermission(role, perm) ? (
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                                <AppIcon name="check" className="h-3 w-3 text-emerald-600 dark:text-emerald-400" strokeWidth={3} />
                              </span>
                            ) : (
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                                <AppIcon name="cross" className="h-3 w-3 text-slate-300 dark:text-slate-600" />
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          </div>
        )}

        {/* ── Activity Tab ── */}
        {activeTab === 'activity' && (
          <article className="card-premium tw-animate">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6">Team Activity Log</h3>
            <div className="space-y-4">
              {[
                { user: 'Aarav Mehta', action: 'Changed role of Sofia Patel to Operations', time: '2 hours ago', type: 'role' },
                { user: 'Emily Chen', action: 'Invited rohan.iyer@exportrack.ai as Staff', time: '5 hours ago', type: 'invite' },
                { user: 'Nikhil Bheda', action: 'Created shipment EXP-2026-005', time: '1 day ago', type: 'shipment' },
                { user: 'Aarav Mehta', action: 'Approved 3 documents for EXP-2026-002', time: '1 day ago', type: 'document' },
                { user: 'Sofia Patel', action: 'Updated tracking for EXP-2026-003', time: '2 days ago', type: 'tracking' },
                { user: 'Emily Chen', action: 'Removed viewer access for legacy account', time: '3 days ago', type: 'role' },
                { user: 'Rohan Iyer', action: 'Uploaded 4 documents for EXP-2026-001', time: '3 days ago', type: 'document' },
                { user: 'Nikhil Bheda', action: 'Updated workspace settings', time: '5 days ago', type: 'settings' },
              ].map((entry, idx) => (
                <div key={idx} className="relative flex gap-4">
                  {idx !== 7 && (
                    <div className="absolute left-[15px] top-8 h-[calc(100%-24px)] w-px bg-slate-100 dark:bg-slate-800" />
                  )}
                  <div className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white text-white shadow-sm dark:border-slate-800 ${
                    entry.type === 'role' ? 'bg-rose-500' :
                    entry.type === 'invite' ? 'bg-blue-500' :
                    entry.type === 'shipment' ? 'bg-teal-500' :
                    entry.type === 'document' ? 'bg-indigo-500' :
                    entry.type === 'tracking' ? 'bg-amber-500' :
                    'bg-slate-500'
                  }`}>
                    <AppIcon
                      name={
                        entry.type === 'role' ? 'shield' :
                        entry.type === 'invite' ? 'team' :
                        entry.type === 'shipment' ? 'shipments' :
                        entry.type === 'document' ? 'file' :
                        entry.type === 'tracking' ? 'search' :
                        'settings'
                      }
                      className="h-3.5 w-3.5"
                    />
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{entry.user}</p>
                      <time className="text-[10px] font-medium text-slate-400">{entry.time}</time>
                    </div>
                    <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{entry.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>
        )}
      </main>

      {/* ── Invite Modal ── */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowInviteModal(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/60 dark:border-slate-800/60 w-full max-w-md p-6 tw-animate">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Invite Team Member</h2>
                <p className="text-xs text-slate-500 mt-1">Send an invitation to join your workspace</p>
              </div>
              <button onClick={() => setShowInviteModal(false)} className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <AppIcon name="x" className="h-4 w-4" />
              </button>
            </div>

            {inviteSent ? (
              <div className="text-center py-8 tw-animate">
                <div className="mx-auto h-14 w-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                  <AppIcon name="check" className="h-7 w-7 text-emerald-600" strokeWidth={2.5} />
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Invitation Sent!</p>
                <p className="text-xs text-slate-500 mt-1">An email has been sent to {inviteEmail}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={inviteName}
                    onChange={e => setInviteName(e.target.value)}
                    placeholder="John Doe"
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    placeholder="john@company.com"
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Assign Role</label>
                  <div className="grid grid-cols-2 gap-2">
                    {WORKSPACE_ROLES.map(role => {
                      const colors = ROLE_COLORS[role];
                      return (
                        <button
                          key={role}
                          onClick={() => setInviteRole(role)}
                          className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                            inviteRole === role
                              ? `${colors.bg} ${colors.text} ${colors.border} shadow-md`
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800'
                          }`}
                        >
                          {role}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2">{ROLE_DESCRIPTIONS[inviteRole]}</p>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={handleInvite} className="btn-primary flex-1 justify-center">
                    <AppIcon name="share" className="h-4 w-4 mr-2" />
                    Send Invitation
                  </button>
                  <button onClick={() => setShowInviteModal(false)} className="btn-secondary px-4">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
