import { useState, memo, useMemo } from 'react';
import AppIcon from '../components/AppIcon';
import StatusBadge from '../components/StatusBadge';
import UserAvatar from '../components/UserAvatar';
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

import { Skeleton, SkeletonLine, SkeletonKpiCard, SkeletonCard, SkeletonAvatar, SkeletonText } from '../components/SkeletonLoader';

/* ─── All permissions for the matrix ─────────────────────────────────── */
const ALL_PERMISSIONS: Permission[] = [
  'manage_users', 'invite_users', 'remove_users',
  'edit_shipments', 'create_shipments', 'update_tracking', 'view_shipments',
  'access_analytics', 'manage_documents', 'approve_documents', 'view_documents',
  'manage_settings',
];

/* ─── Sub-Components ─────────────────────────────────────────────────── */
const RoleDistributionCard = memo(({ role, count, colors }: any) => (
  <div className={`relative overflow-hidden bg-white dark:bg-slate-900/80 p-5 rounded-2xl border ${colors.border} flex flex-col gap-2 group shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5`}>
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
));

const MemberCard = memo(({ member, colors, wsRole, isOnline, isSelected, onClick, canManageUsers, ALL_PERMISSIONS, PERMISSION_LABELS, hasPermission }: any) => (
  <article
    className={`card-premium group cursor-pointer hover:shadow-xl transition-all ${isSelected ? 'ring-2 ring-teal-500/50' : ''}`}
    onClick={onClick}
  >
    <div className="flex items-start justify-between gap-3 mb-4">
      <div className="flex items-center gap-3">
        <UserAvatar 
          name={member.name} 
          size="lg" 
          status={isOnline ? 'online' : 'offline'} 
        />
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
            Change
          </button>
        </div>
      )}
    </div>

    {isSelected && (
      <div className="mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/60 tw-animate">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Permissions</p>
        <div className="flex flex-wrap gap-1.5">
          {ALL_PERMISSIONS.map((perm: any) => {
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
));

/* ─── Component ──────────────────────────────────────────────────────── */
export default function TeamWorkspacePage() {
  const {
    state: { user, teamMembers, shipments, invites },
    switchRole,
    inviteTeamMember,
    updateMemberRole,
    deleteInvite,
    isDemoUser
  } = useAppContext();

  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('Operations');
  const [inviteName, setInviteName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [activeTab, setActiveTab] = useState<'members' | 'roles' | 'activity' | 'invites'>('members');

  useMemo(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const currentRole = user?.role ? toWorkspaceRole(user.role) : 'Viewer';
  const canManageUsers = hasPermission(currentRole, 'manage_users');
  const canInvite = hasPermission(currentRole, 'invite_users');

  // Stats per member
  const memberStats = teamMembers.map(member => {
    const assigned = shipments.filter(s => s.assignedTo === member.name);
    const pending = assigned.reduce((sum, s) => sum + s.documents.filter(d => d.status === 'Pending').length, 0);
    return { ...member, assignedCount: assigned.length, pendingDocs: pending };
  });

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !inviteName.trim()) return;
    setIsSubmitting(true);
    try {
      await inviteTeamMember({
        name: inviteName,
        email: inviteEmail,
        role: inviteRole,
      });
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteName('');
      setInviteRole('Operations');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleDistribution = WORKSPACE_ROLES.map(role => ({
    role,
    count: teamMembers.filter(m => toWorkspaceRole(m.role) === role).length,
  }));

  if (loading) {
    return (
      <main className="page-stack">
        <header className="dashboard-grid-header">
          <div className="space-y-2">
            <SkeletonLine className="h-10 w-64" />
            <SkeletonLine className="h-4 w-96" />
          </div>
        </header>
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonKpiCard key={i} />)}
        </section>
        <div className="h-12 w-full max-w-lg mb-6">
          <Skeleton className="h-full w-full" borderRadius="rounded-xl" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card-premium p-6 space-y-4">
              <div className="flex items-center gap-4">
                <SkeletonAvatar size="h-11 w-11" />
                <div className="flex-1 space-y-2">
                  <SkeletonText width="w-1/2" />
                  <SkeletonText width="w-2/3" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
              </div>
            </div>
          ))}
        </div>
      </main>
    );
  }

  return (
    <>
      <style>{`
        @keyframes tw-fade-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .tw-animate { animation: tw-fade-in 0.4s cubic-bezier(.4,0,.2,1) both; }
      `}</style>

      {/* Demo User Lock Overlay */}
      {isDemoUser ? (
        <main className="page-stack">
          <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in slide-in-from-bottom duration-700">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 shadow-lg">
              <AppIcon name="shield" className="h-10 w-10 text-slate-400 dark:text-slate-500" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mb-2">Team Management</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-8">
              Team management is available for registered users only. Create an account to invite team members, manage roles, and control access permissions.
            </p>
            <a href="/auth" className="btn-primary inline-flex items-center gap-2 px-8 py-3 text-sm shadow-xl shadow-teal-500/20 hover:shadow-teal-500/30 transition-all">
              <AppIcon name="team" className="h-5 w-5" />
              Sign Up to Unlock
            </a>
            <div className="mt-8 grid grid-cols-3 gap-6 max-w-md w-full">
              <div className="text-center">
                <div className="mx-auto mb-2 h-10 w-10 rounded-xl bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center">
                  <AppIcon name="team" className="h-5 w-5 text-teal-500" />
                </div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Add Members</p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-2 h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                  <AppIcon name="shield" className="h-5 w-5 text-indigo-500" />
                </div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Role Control</p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-2 h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                  <AppIcon name="share" className="h-5 w-5 text-amber-500" />
                </div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Invite System</p>
              </div>
            </div>
          </div>
        </main>
      ) : (

      <main className="page-stack skeleton-fade-in">
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
          {roleDistribution.map(({ role, count }) => (
            <RoleDistributionCard 
              key={role} 
              role={role} 
              count={count} 
              colors={ROLE_COLORS[role]} 
            />
          ))}
        </section>

        {/* ── Tabs ── */}
        <div className="flex p-1 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-800/50 mb-6 w-full max-w-lg">
          {(['members', 'invites', 'roles', 'activity'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab 
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              {tab === 'members' ? 'Team Members' : tab === 'roles' ? 'Role Matrix' : 'Activity Log'}
            </button>
          ))}
        </div>

        {/* ── Members Tab ── */}
        {activeTab === 'members' && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 tw-animate">
            {memberStats.map(member => (
              <MemberCard
                key={member.id}
                member={member}
                colors={ROLE_COLORS[toWorkspaceRole(member.role)]}
                wsRole={toWorkspaceRole(member.role)}
                isOnline={Date.now() - new Date(member.lastActive).getTime() < 3600000}
                isSelected={selectedMember?.id === member.id}
                onClick={() => setSelectedMember(selectedMember?.id === member.id ? null : member)}
                canManageUsers={canManageUsers}
                ALL_PERMISSIONS={ALL_PERMISSIONS}
                PERMISSION_LABELS={PERMISSION_LABELS}
                hasPermission={hasPermission}
              />
            ))}
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
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Workspace Permissions</h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Role-Based Access Control</p>
                </div>
                <div className="flex items-center gap-2 lg:hidden">
                   <p className="text-[8px] font-black uppercase tracking-widest text-teal-600 animate-pulse">Swipe to view Matrix</p>
                   <AppIcon name="arrow-right" className="h-3 w-3 text-teal-500" />
                </div>
              </div>

              <div className="table-shell group/table relative">
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-slate-900 to-transparent pointer-events-none opacity-0 group-hover/table:opacity-100 lg:hidden transition-opacity" />
                <table className="data-table">
                  <thead>
                    <tr>
                      <th className="w-1/3">Permission Entity</th>
                      {WORKSPACE_ROLES.map(role => (
                        <th key={role} className="text-center">{role}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {ALL_PERMISSIONS.map(perm => (
                      <tr key={perm} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="px-4 py-3.5">
                           <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{PERMISSION_LABELS[perm]}</p>
                           <p className="text-[8px] text-slate-400 uppercase tracking-tighter mt-0.5">{perm.replace(/_/g, ' ')}</p>
                        </td>
                        {WORKSPACE_ROLES.map(role => (
                          <td key={role} className="px-4 py-3 text-center">
                            {hasPermission(role, perm) ? (
                              <div className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-teal-500/10 dark:bg-teal-500/20 shadow-sm border border-teal-500/10">
                                <AppIcon name="check" className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" strokeWidth={3} />
                              </div>
                            ) : (
                              <div className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800/50">
                                <AppIcon name="cross" className="h-3 w-3 text-slate-300 dark:text-slate-600" />
                              </div>
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
                { user: 'PRINCE DODIYA', action: 'Changed role of NEEL NADIYAPARA to Operations', time: '2 hours ago', type: 'role' },
                { user: 'NIKHIL BHEDA', action: 'Invited dhruv.bhanvadiya@exportrack.ai as Staff', time: '5 hours ago', type: 'invite' },
                { user: 'NIKHIL BHEDA', action: 'Created shipment EXP-2026-005', time: '1 day ago', type: 'shipment' },
                { user: 'PRINCE DODIYA', action: 'Approved 3 documents for EXP-2026-002', time: '1 day ago', type: 'document' },
                { user: 'NEEL NADIYAPARA', action: 'Updated tracking for EXP-2026-003', time: '2 days ago', type: 'tracking' },
                { user: 'NIKHIL BHEDA', action: 'Removed viewer access for legacy account', time: '3 days ago', type: 'role' },
                { user: 'DHRUV BHANVADIYA', action: 'Uploaded 4 documents for EXP-2026-001', time: '3 days ago', type: 'document' },
                { user: 'PRINCE DODIYA', action: 'Updated workspace settings', time: '5 days ago', type: 'settings' },
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

        {/* ── Invites Tab ── */}
        {activeTab === 'invites' && (
          <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-2 px-1">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Pending Invitations</h3>
              <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded text-[10px] font-bold">{invites.length} Sent</span>
            </div>
            
            {invites.length === 0 ? (
              <div className="card-premium py-12 text-center opacity-60">
                <AppIcon name="share" className="mx-auto h-8 w-8 text-slate-300 mb-3" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No active invitations</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {invites.map(invite => (
                  <article key={invite.id} className="card-premium relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => deleteInvite(invite.id)}
                        className="h-7 w-7 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                        title="Revoke Invitation"
                      >
                        <AppIcon name="x" className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-black text-slate-400 uppercase">
                        {invite.name.slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 dark:text-white truncate max-w-[150px]">{invite.name}</p>
                        <p className="text-[10px] text-slate-500 truncate max-w-[150px]">{invite.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50 dark:border-slate-800/50">
                      <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-[0.15em] ${ROLE_COLORS[toWorkspaceRole(invite.role)].bg} ${ROLE_COLORS[toWorkspaceRole(invite.role)].text}`}>
                        {invite.role}
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 italic">
                        Sent {new Date(invite.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Activities & Roles tabs (Keeping minimal for continuation) ── */}
        {activeTab === 'roles' && (
           <article className="card-premium py-16 text-center opacity-50">
              <AppIcon name="shield" className="mx-auto h-10 w-10 text-slate-300 mb-4" />
              <p className="text-xs font-extrabold text-slate-500 uppercase tracking-widest leading-loose">
                Permission Management System<br/>
                <span className="text-[10px] font-bold opacity-70">Coming in v1.2 Enterprise Edition</span>
              </p>
           </article>
        )}
      </main>
      )}

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

            {isSubmitting ? (
              <div className="text-center py-8 tw-animate flex flex-col items-center">
                <div className="h-12 w-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-sm font-bold text-slate-900 dark:text-white">Processing Invitation...</p>
                <p className="text-xs text-slate-500 mt-1">Establishing secure connection to mail server</p>
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
                      const roleValue = role as Role; // Typecast for the button
                      return (
                        <button
                          key={role}
                          onClick={() => setInviteRole(roleValue)}
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
                  <p className="text-[10px] text-slate-400 mt-2">{ROLE_DESCRIPTIONS[toWorkspaceRole(inviteRole)]}</p>
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
