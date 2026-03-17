import { useState, memo, useMemo } from 'react';
import AppIcon from '../components/AppIcon';
import StatusBadge from '../components/StatusBadge';
import UserAvatar from '../components/UserAvatar';
import { useAppContext } from '../context/AppContext';
import { Role } from '../types';
import { toWorkspaceRole, ROLE_COLORS, ROLE_DESCRIPTIONS } from '../utils/permissions';

const permissionMatrix = [
  { action: 'View Shipment Analytics', Admin: true, Manager: true, Operations: true, Broker: true, Auditor: true, Customer: true },
  { action: 'Create/Edit Shipments', Admin: true, Manager: true, Operations: true, Broker: false, Auditor: false, Customer: false },
  { action: 'Approve Documents', Admin: true, Manager: true, Operations: false, Broker: false, Auditor: false, Customer: false },
  { action: 'Internal Risk Notes', Admin: true, Manager: true, Operations: true, Broker: false, Auditor: true, Customer: false },
  { action: 'System Configurations', Admin: true, Manager: false, Operations: false, Broker: false, Auditor: false, Customer: false },
  { action: 'Financial Audits', Admin: true, Manager: true, Operations: false, Broker: false, Auditor: true, Customer: false }
] as const;

import { SkeletonLine, SkeletonKpiCard, SkeletonCard, SkeletonAvatar, SkeletonText, SkeletonButton, SkeletonDetailSection } from '../components/SkeletonLoader';

export default function ProfileTeamPage() {
  const {
    state: { user, teamMembers, shipments, invites },
    switchRole,
    inviteTeamMember,
    updateMemberRole,
    removeLegacyTeamMember,
    updateUserProfile,
    deleteInvite,
    isDemoUser
  } = useAppContext();

  // State
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'team' | 'settings' | 'security' | 'billing' | 'integrations'>('team');

  // Modals
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [showMemberRoleModal, setShowMemberRoleModal] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);

  // Form states
  const [isInviting, setIsInviting] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('Operations');

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editRegion, setEditRegion] = useState(user?.region || 'APAC North');

  // Workspace customization
  const [workspaceName, setWorkspaceName] = useState('ExporTrack Pro Workspace');
  const [workspaceTagline, setWorkspaceTagline] = useState('Modern Logistics Hub');
  const [selectedMember, setSelectedMember] = useState<any>(null);

  // API & Integration
  const [apiKey] = useState('sk_live_exportrack_' + Math.random().toString(36).substr(2, 20).toUpperCase());
  const [webhookUrl, setWebhookUrl] = useState('https://api.yourapp.com/webhooks/exportrack');

  useMemo(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;

    try {
      setIsInviting(true);
      await inviteTeamMember({
        name: inviteName,
        email: inviteEmail,
        role: inviteRole
      });
      setShowInviteModal(false);
      setInviteName('');
      setInviteEmail('');
      setInviteRole('Operations');
      alert('✅ Team member invited successfully!');
    } finally {
      setIsInviting(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;

    try {
      setIsUpdatingProfile(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      updateUserProfile({ name: editName, region: editRegion });
      setShowEditProfileModal(false);
      alert('✅ Profile updated successfully!');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleRemoveMember = (memberId: string, memberName: string) => {
    if (confirm(`Are you sure you want to remove ${memberName} from the workspace?`)) {
      removeLegacyTeamMember(memberId);
      alert(`✅ ${memberName} has been removed from the team.`);
    }
  };

  const handleMemberRoleChange = (memberId: string, newRole: Role) => {
    updateMemberRole(memberId, newRole);
    setShowMemberRoleModal(false);
    setSelectedMember(null);
    alert(`✅ Member role updated to ${newRole}!`);
  };

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    alert('✅ API Key copied to clipboard!');
  };

  const handleSaveWebhook = () => {
    alert(`✅ Webhook URL saved: ${webhookUrl}`);
    setShowApiModal(false);
  };

  const memberStats = useMemo(() => teamMembers.map((member) => {
    const assigned = shipments.filter((s) => s.assignedTo === member.name);
    const pending = assigned.reduce((sum, s) => sum + s.documents.filter((d) => d.status === 'Pending').length, 0);
    const isOnline = (member.id.charCodeAt(member.id.length - 1) % 2) === 0;
    return {
      ...member,
      assignedCount: assigned.length,
      pendingDocs: pending,
      wsRole: toWorkspaceRole(member.role),
      status: isOnline ? 'online' : 'offline'
    };
  }), [teamMembers, shipments]);

  if (loading) {
    return (
      <main className="page-stack">
        <header className="dashboard-grid-header">
          <div className="space-y-2">
            <SkeletonLine className="h-10 w-64" />
            <SkeletonLine className="h-4 w-96" />
          </div>
        </header>
        <div className="grid gap-6">
          <SkeletonCard count={5} />
        </div>
      </main>
    );
  }

  if (isDemoUser) {
    return (
      <main className="page-stack animate-in fade-in duration-500">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 shadow-lg">
            <AppIcon name="shield" className="h-10 w-10 text-slate-400 dark:text-slate-500" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mb-2">Pro Team Management</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-8">
            Team management, workspace settings, security, and billing are available for registered users only.
          </p>
          <a href="/auth" className="btn-primary inline-flex items-center gap-2 px-8 py-3 text-sm shadow-xl shadow-teal-500/20 hover:shadow-teal-500/30 transition-all">
            <AppIcon name="team" className="h-5 w-5" />
            Sign Up to Unlock
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="page-stack animate-in fade-in duration-500">
      {/* Header */}
      <header className="dashboard-grid-header mb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Pro Team Management</h1>
          <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
            Manage workspace, team members, security, billing, and integrations
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Workspace:</span>
          <span className="text-xs font-bold text-slate-900 dark:text-white">{workspaceName}</span>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="card-premium mb-6 overflow-x-auto">
        <div className="flex gap-1 p-1">
          {(['team', 'settings', 'security', 'billing', 'integrations'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${activeTab === tab
                ? 'bg-teal-500 text-white shadow-mg'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
            >
              <div className="flex items-center gap-2">
                <AppIcon
                  name={
                    (tab === 'team' ? 'team' :
                      tab === 'settings' ? 'settings' :
                        tab === 'security' ? 'clock' :
                          tab === 'billing' ? 'credit' :
                            'activity') as any
                  }
                  className="h-3.5 w-3.5"
                />
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* TEAM TAB */}
      {activeTab === 'team' && (
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <article className="card-premium overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-white dark:bg-white" />
              <div className="relative pt-12 text-center">
                <UserAvatar name={user?.name || ''} src={user?.profilePicture} size="xl" status="online" className="shadow-xl ring-4 ring-white dark:ring-slate-800" />
                <div className="flex items-center justify-center gap-2 mt-4 group">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">{user?.name}</h2>
                  <button
                    onClick={() => {
                      setEditName(user?.name || '');
                      setShowEditProfileModal(true);
                    }}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-teal-500 transition-all"
                  >
                    <AppIcon name="settings" className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="text-xs font-bold text-slate-500 mt-1">{user?.email}</p>
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{user?.role}</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-px bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                <div className="bg-white dark:bg-slate-900 p-4 text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Access Level</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white mt-1">Tier 1 Elite</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Region</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white mt-1">{user?.region || 'APAC'}</p>
                </div>
              </div>
            </article>

            {/* Directory Card */}
            <article className="lg:col-span-2 card-premium">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Team Directory</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{teamMembers.length} Personnel Active</p>
                </div>
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="btn-primary py-2 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest"
                >
                  <AppIcon name="plus" className="h-3.5 w-3.5 mr-2 inline" />
                  Invite Member
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto">
                {memberStats.map((member) => (
                  <div
                    key={member.id}
                    className="relative p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-teal-500/50 hover:shadow-lg transition-all group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <UserAvatar name={member.name} status={member.status as any} size="md" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-black text-slate-900 dark:text-white truncate">{member.name}</p>
                          <p className="text-[10px] text-slate-500 truncate">{member.email}</p>
                          <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-black uppercase mt-2 ${ROLE_COLORS[member.wsRole].bg} ${ROLE_COLORS[member.wsRole].text}`}>
                            {member.role}
                          </div>
                        </div>
                      </div>
                      {user?.role === 'Admin' && (
                        <button
                          onClick={() => handleRemoveMember(member.id, member.name)}
                          className="p-1.5 rounded bg-rose-50 dark:bg-rose-500/10 text-rose-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white"
                        >
                          <AppIcon name="x" className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                      <div className="p-2 rounded bg-slate-50 dark:bg-slate-800 text-[10px]">
                        <p className="font-bold text-slate-900 dark:text-white">{member.assignedCount}</p>
                        <p className="text-slate-500 text-[8px] uppercase">Assigned</p>
                      </div>
                      <div className="p-2 rounded bg-slate-50 dark:bg-slate-800 text-[10px]">
                        <p className="font-bold text-amber-600 dark:text-amber-400">{member.pendingDocs}</p>
                        <p className="text-slate-500 text-[8px] uppercase">Pending</p>
                      </div>
                    </div>

                    {user?.role === 'Admin' && (
                      <button
                        onClick={() => {
                          setSelectedMember(member);
                          setShowMemberRoleModal(true);
                        }}
                        className="mt-3 w-full btn-secondary btn-xs text-[10px]"
                      >
                        Change Role
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </article>
          </div>

          {/* Permission Matrix */}
          <article className="card-premium">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Permission Topology</h3>
            <div className="space-y-1 max-h-[300px] overflow-y-auto">
              {permissionMatrix.map((row, i) => (
                <div key={i} className="flex items-center justify-between py-3 px-3 border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/20 rounded-lg transition-colors">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{row.action}</span>
                  <div className="flex gap-1">
                    {(['Admin', 'Manager', 'Operations', 'Broker', 'Auditor', 'Customer'] as const).map(role => (
                      <div
                        key={role}
                        className={`h-5 w-5 rounded-md flex items-center justify-center text-[10px] font-black ${row[role] ? 'bg-teal-500/10 text-teal-600 border border-teal-200 dark:border-teal-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-300'
                          }`}
                        title={role}
                      >
                        {row[role] && '✓'}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>
      )}

      {/* SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <article className="card-premium">
            <h3 className="text-lg font-black mb-6">Workspace Customization</h3>
            <div className="space-y-4">
              <div>
                <label className="input-label">Workspace Name</label>
                <input type="text" value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="input-label">Workspace Tagline</label>
                <input type="text" value={workspaceTagline} onChange={(e) => setWorkspaceTagline(e.target.value)} className="input-field" placeholder="Your workspace mission" />
              </div>
              <div>
                <label className="input-label">Default Language</label>
                <select className="input-field">
                  <option>English (US)</option>
                  <option>हिंदी (Hindi)</option>
                  <option>日本語 (Japanese)</option>
                  <option>Español (Spanish)</option>
                </select>
              </div>
              <div>
                <label className="input-label">Timezone</label>
                <select className="input-field">
                  <option>UTC +05:30 (India Standard Time)</option>
                  <option>UTC +00:00 (GMT)</option>
                  <option>UTC -05:00 (EST)</option>
                  <option>UTC +08:00 (Singapore)</option>
                </select>
              </div>
              <button onClick={() => alert('✅ Settings saved!')} className="btn-primary w-full mt-6">
                Save Customization
              </button>
            </div>
          </article>

          <article className="card-premium">
            <h3 className="text-lg font-black mb-4">Export & Backups</h3>
            <div className="space-y-3">
              <button className="btn-secondary w-full justify-center">
                <AppIcon name="upload" className="h-4 w-4 mr-2" />
                Export Team Data
              </button>
              <button className="btn-secondary w-full justify-center">
                <AppIcon name="upload" className="h-4 w-4 mr-2" />
                Create Backup
              </button>
              <button className="btn-secondary w-full justify-center">
                <AppIcon name="upload" className="h-4 w-4 mr-2" />
                Import Data
              </button>
            </div>
          </article>
        </div>
      )}

      {/* SECURITY TAB */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <article className="card-premium">
            <h3 className="text-lg font-black mb-6">Security Settings</h3>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Two-Factor Authentication</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Enable 2FA for enhanced security</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">IP Whitelist</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Restrict access to specific IPs</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              <div>
                <label className="input-label">Password Policy</label>
                <select className="input-field">
                  <option>Standard (8+ chars)</option>
                  <option>Strong (12+ chars with special)</option>
                  <option>Enterprise (16+ chars)</option>
                </select>
              </div>
            </div>
          </article>

          <article className="card-premium">
            <h3 className="text-lg font-black mb-4">Active Sessions</h3>
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Session {i}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Last active: {i === 1 ? 'Now' : '2 hours ago'}</p>
                  </div>
                  {i !== 1 && <button className="text-rose-500 hover:text-rose-700 font-bold text-sm">Revoke</button>}
                </div>
              ))}
            </div>
          </article>
        </div>
      )}

      {/* BILLING TAB */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          <article className="card-premium">
            <h3 className="text-lg font-black mb-6">Subscription</h3>
            <div className="p-6 rounded-lg bg-gradient-to-r from-teal-50 to-indigo-50 dark:from-teal-950/20 dark:to-indigo-950/20 border border-teal-200 dark:border-teal-800">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Current Plan</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">Pro Enterprise</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Billing Cycle</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">Monthly</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Next Billing</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">Apr 17</p>
                </div>
              </div>
            </div>
          </article>

          <article className="card-premium">
            <h3 className="text-lg font-black mb-4">Pricing Plans</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[{ name: 'Starter', price: '$99', features: ['5 Users', '10 Shipments'] },
              { name: 'Professional', price: '$299', features: ['20 Users', '100 Shipments'], active: true },
              { name: 'Enterprise', price: 'Custom', features: ['Unlimited', 'API Access'] }].map((plan) => (
                <div key={plan.name} className={`p-4 rounded-lg border-2 transition-all ${plan.active ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/20' : 'border-slate-200 dark:border-slate-800'}`}>
                  <h4 className="font-bold text-slate-900 dark:text-white">{plan.name}</h4>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{plan.price}</p>
                  <ul className="mt-3 text-sm text-slate-600 dark:text-slate-400 space-y-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </article>

          <article className="card-premium">
            <h3 className="text-lg font-black mb-4">Usage & Limits</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold text-slate-900 dark:text-white">API Calls This Month</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">234,567 / 1,000,000</p>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full w-1/4 bg-teal-500" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold text-slate-900 dark:text-white">Team Members</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{teamMembers.length} / 50</p>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-teal-500" style={{ width: `${(teamMembers.length / 50) * 100}%` }} />
                </div>
              </div>
            </div>
          </article>
        </div>
      )}

      {/* INTEGRATIONS TAB */}
      {activeTab === 'integrations' && (
        <div className="space-y-6">
          <article className="card-premium">
            <h3 className="text-lg font-black mb-6">API & Webhooks</h3>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">API Key</p>
                <div className="flex items-center gap-2">
                  <input type="text" value={apiKey} readOnly className="input-field flex-1 font-mono text-xs" />
                  <button onClick={handleCopyApiKey} className="btn-secondary px-3">
                    <AppIcon name="link" className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Webhook URL</p>
                <input type="text" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} className="input-field w-full" />
                <button onClick={handleSaveWebhook} className="btn-primary w-full mt-3">
                  Save Webhook
                </button>
              </div>
            </div>
          </article>

          <article className="card-premium">
            <h3 className="text-lg font-black mb-4">Integrations</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: 'Slack', icon: '💬', status: 'Connected' },
                { name: 'Google Drive', icon: '📁', status: 'Not Connected' },
                { name: 'Shopify', icon: '🛒', status: 'Connected' },
                { name: 'AWS', icon: '☁️', status: 'Not Connected' }
              ].map((int) => (
                <div key={int.name} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{int.icon}</span>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{int.name}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{int.status}</p>
                    </div>
                  </div>
                  <button className="btn-secondary btn-sm">
                    {int.status === 'Connected' ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              ))}
            </div>
          </article>
        </div>
      )}

      {/* MODALS */}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="card-premium w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black">Invite Team Member</h3>
              <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-slate-600">
                <AppIcon name="x" className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="input-label">Full Name</label>
                <input type="text" value={inviteName} onChange={(e) => setInviteName(e.target.value)} placeholder="John Doe" className="input-field" required />
              </div>
              <div>
                <label className="input-label">Email Address</label>
                <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="john@example.com" className="input-field" required />
              </div>
              <div>
                <label className="input-label">Role</label>
                <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as Role)} className="input-field">
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Operations">Operations</option>
                  <option value="Broker">Broker</option>
                  <option value="Auditor">Auditor</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowInviteModal(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" disabled={isInviting} className="btn-primary flex-1">
                  {isInviting ? 'Inviting...' : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Role Modal */}
      {showMemberRoleModal && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="card-premium w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black">Change Role</h3>
              <button onClick={() => setShowMemberRoleModal(false)} className="text-slate-400 hover:text-slate-600">
                <AppIcon name="x" className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Changing role for: <span className="font-bold">{selectedMember.name}</span></p>

            <div className="space-y-2">
              {(['Admin', 'Manager', 'Operations', 'Viewer', 'Staff'] as Role[]).map((role) => (
                <button
                  key={role}
                  onClick={() => handleMemberRoleChange(selectedMember.id, role)}
                  className={`w-full p-3 rounded-lg text-left transition-all ${selectedMember.role === role
                    ? 'bg-teal-500/10 border-2 border-teal-500 text-teal-600 dark:text-teal-400'
                    : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-teal-500'
                    }`}
                >
                  <p className="font-bold">{role}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{ROLE_DESCRIPTIONS[toWorkspaceRole(role)] || 'Team role'}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="card-premium w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black">Edit Profile</h3>
              <button onClick={() => setShowEditProfileModal(false)} className="text-slate-400 hover:text-slate-600">
                <AppIcon name="x" className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="input-label">Full Name</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="input-field" required />
              </div>
              <div>
                <label className="input-label">Region</label>
                <input type="text" value={editRegion} onChange={(e) => setEditRegion(e.target.value)} className="input-field" />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowEditProfileModal(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" disabled={isUpdatingProfile} className="btn-primary flex-1">
                  {isUpdatingProfile ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
