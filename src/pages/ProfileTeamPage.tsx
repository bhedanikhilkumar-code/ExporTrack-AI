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
    removeTeamMember,
    updateUserProfile,
    deleteInvite
  } = useAppContext();

  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('Operations');
  
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editRegion, setEditRegion] = useState(user?.region || 'APAC North');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

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
    } finally {
      setIsInviting(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;

    try {
      setIsUpdatingProfile(true);
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate delay
      updateUserProfile({ name: editName, region: editRegion });
      setShowEditProfileModal(false);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleRemoveMember = (memberId: string, memberName: string) => {
    if (confirm(`Are you sure you want to remove ${memberName} from the workspace?`)) {
      removeTeamMember(memberId);
    }
  };

  const memberStats = useMemo(() => teamMembers.map((member) => {
    const assigned = shipments.filter((s) => s.assignedTo === member.name);
    const pending = assigned.reduce((sum, s) => sum + s.documents.filter((d) => d.status === 'Pending').length, 0);
    // Deterministic status based on member ID
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="card-premium p-8 flex flex-col items-center gap-4">
              <SkeletonAvatar size="h-20 w-20" />
              <SkeletonText width="w-32" height="h-6" />
              <SkeletonText width="w-48" height="h-3" />
            </div>
            <SkeletonCard />
          </div>
          <div className="lg:col-span-2 space-y-6">
            <div className="card-premium p-6 space-y-6">
              <div className="flex justify-between items-center">
                <SkeletonText width="w-48" height="h-6" />
                <SkeletonButton />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="card-premium p-4 flex items-center gap-4">
                    <SkeletonAvatar size="h-12 w-12" />
                    <div className="flex-1 space-y-2">
                      <SkeletonText width="w-2/3" />
                      <SkeletonText width="w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <SkeletonDetailSection />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page-stack animate-in fade-in duration-500 skeleton-fade-in">
      <header className="dashboard-grid-header">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white" style={{ letterSpacing: '-0.03em' }}>
            Profile & Directory
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
            Manage your personal identity and browse the global logistics team
          </p>
        </div>
        <div className="flex items-center gap-3">
           <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Assigned ID:</span>
             <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">{user?.email?.split('@')[0].toUpperCase() ?? 'SYS-001'}</span>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <section className="lg:col-span-1 space-y-6">
          <article className="card-premium overflow-hidden group">
            <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-r from-teal-500 to-indigo-600 opacity-20 group-hover:opacity-30 transition-opacity" />
            <div className="relative pt-12 text-center">
               <UserAvatar 
                 name={user?.name || ''} 
                 src={user?.profilePicture} 
                 size="xl" 
                 status="online" 
                 className="shadow-xl ring-4 ring-white dark:ring-slate-800"
               />
                <div className="flex items-center justify-center gap-2 mt-4 group">
                   <h2 className="text-lg font-black text-slate-900 dark:text-white">{user?.name}</h2>
                   <button 
                     onClick={() => {
                        setEditName(user?.name || '');
                        setShowEditProfileModal(true);
                     }}
                     className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 opacity-0 group-hover:opacity-100 transition-all hover:text-teal-500 hover:scale-110 active-press"
                     title="Edit Personnel Data"
                   >
                      <AppIcon name="settings" className="h-3.5 w-3.5" />
                   </button>
                </div>
               <p className="text-xs font-bold text-slate-500">{user?.email}</p>
               <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">{user?.role}</span>
               </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-px bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
               <div className="bg-white dark:bg-slate-900 p-4 text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Access Level</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white">Tier 1 Elite</p>
               </div>
               <div className="bg-white dark:bg-slate-900 p-4 text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Global Region</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white">{user?.region || 'APAC North'}</p>
               </div>
            </div>
          </article>

          <article className="card-premium">
             <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 px-1">Security Simulation</h3>
             <div className="space-y-4">
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed">Adjust your operational persona to test system-wide permission cascades and RBAC visibility.</p>
                <select
                  value={user?.role ?? 'Operations'}
                  onChange={(event) => switchRole(event.target.value as Role)}
                  className="input-field w-full py-3 h-12 text-xs font-black uppercase tracking-widest border-slate-200 dark:border-slate-800"
                >
                  <option value="Admin">System Administrator</option>
                  <option value="Manager">Workspace Manager</option>
                  <option value="Operations">Operations Pro</option>
                  <option value="Broker">Authorized Broker</option>
                  <option value="Auditor">Compliance Auditor</option>
                  <option value="Customer">Client Portal View</option>
                </select>
             </div>
          </article>
        </section>

        {/* Directory Card */}
        <section className="lg:col-span-2 space-y-6">
           <article className="card-premium">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                       <AppIcon name="team" className="h-5 w-5" strokeWidth={2.5} />
                    </div>
                    <div>
                       <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none">Team Directory</h2>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{teamMembers.length} Personnel Active</p>
                    </div>
                 </div>
                 <div className="flex gap-2">
                    <button onClick={() => setShowInviteModal(true)} className="btn-primary py-2 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest">
                       Invite Member
                    </button>
                 </div>
              </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {memberStats.map(member => (
                   <div key={member.id} className="relative p-5 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60 hover:border-teal-500/50 hover:shadow-xl hover:shadow-slate-200/40 dark:hover:shadow-black/40 transition-all duration-300 group/member">
                      <div className="flex items-center gap-4">
                         <UserAvatar 
                           name={member.name} 
                           status={member.status as any} 
                           size="lg" 
                         />
                          <div className="min-w-0 flex-1">
                             <p className="text-sm font-black text-slate-900 dark:text-white truncate">{member.name}</p>
                             <p className="text-[10px] font-bold text-slate-400 truncate">{member.email}</p>
                          </div>
                          {user?.role === 'Admin' && (
                            <button 
                              onClick={() => handleRemoveMember(member.id, member.name)}
                              className="p-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 opacity-0 group-hover/member:opacity-100 transition-all hover:bg-rose-500 hover:text-white active-press"
                              title="Remove Personnel"
                            >
                               <AppIcon name="x" className="h-4 w-4" strokeWidth={3} />
                            </button>
                          )}
                      </div>
                      
                      <div className="mt-4 flex flex-wrap gap-2">
                         <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${ROLE_COLORS[member.wsRole].bg} ${ROLE_COLORS[member.wsRole].text} ${ROLE_COLORS[member.wsRole].border}`}>
                            {member.role}
                         </div>
                         <div className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-slate-50 dark:bg-slate-800 text-slate-500 border border-slate-100 dark:border-slate-800">
                            {member.region}
                         </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2">
                         <div className="p-2 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 text-center">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">Assigned</p>
                            <p className="text-sm font-black text-slate-900 dark:text-white">{member.assignedCount}</p>
                         </div>
                         <div className="p-2 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 text-center">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">Critical</p>
                            <p className="text-sm font-black text-amber-600 dark:text-amber-400">{member.pendingDocs}</p>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
           </article>

           <article className="card-premium">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Permission Topology</h3>
              <div className="space-y-1">
                 {permissionMatrix.map((row, i) => (
                   <div key={i} className="flex items-center justify-between py-3 border-b border-slate-50 dark:border-slate-800/50 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 px-2 rounded-lg transition-colors">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{row.action}</span>
                      <div className="flex gap-1.5 overflow-x-auto max-w-[200px] scrollbar-none">
                         {(['Admin', 'Manager', 'Operations', 'Broker', 'Auditor', 'Customer'] as const).map(role => (
                           <div key={role} className={`h-4 w-4 rounded-md flex items-center justify-center ${row[role] ? 'bg-teal-500/10 text-teal-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-700'}`} title={role}>
                              {row[role] && <AppIcon name="check" className="h-2.5 w-2.5" strokeWidth={4} />}
                           </div>
                         ))}
                      </div>
                   </div>
                 ))}
              </div>
           </article>
        </section>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="card-premium w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300 relative border-none">
              <div className="absolute top-0 inset-x-0 h-1.5 bg-teal-500 rounded-t-2xl" />
              <div className="flex items-center justify-between mb-6">
                 <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Expand Workspace</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Personnel Ingress Protocol</p>
                 </div>
                 <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                    <AppIcon name="x" className="h-5 w-5" />
                 </button>
              </div>
              
              <form onSubmit={handleInvite} className="space-y-5">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">Identity Tag</label>
                    <input 
                      type="text" 
                      required 
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      placeholder="e.g. NEEL NADIYAPARA" 
                      className="input-field py-4 h-12" 
                      disabled={isInviting}
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">Secure Email</label>
                    <input 
                      type="email" 
                      required 
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="personnel@exportrack.ai" 
                      className="input-field py-4 h-12" 
                      disabled={isInviting}
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">Access Spectrum</label>
                    <select 
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as Role)}
                      className="input-field py-3 h-12 font-black uppercase text-[10px] tracking-widest"
                      disabled={isInviting}
                    >
                       <option value="Admin">Administrator</option>
                       <option value="Manager">Manager</option>
                       <option value="Operations">Operations Pro</option>
                       <option value="Broker">Authorized Broker</option>
                       <option value="Auditor">Compliance Auditor</option>
                    </select>
                 </div>
                 
                 <div className="pt-4 flex gap-4">
                    <button 
                      type="submit" 
                      className={`btn-primary flex-1 h-14 justify-center shadow-lg shadow-teal-500/20 ${isInviting ? 'opacity-70' : ''}`}
                      disabled={isInviting}
                    >
                      {isInviting ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                      ) : (
                        <>
                          <AppIcon name="share" className="h-4 w-4 mr-3" />
                          Initialize Invitation
                        </>
                      )}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="card-premium w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300 relative border-none">
              <div className="absolute top-0 inset-x-0 h-1.5 bg-indigo-500 rounded-t-2xl" />
              <div className="flex items-center justify-between mb-6">
                 <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Edit Profile</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Identity Management Overlay</p>
                 </div>
                 <button onClick={() => setShowEditProfileModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                    <AppIcon name="x" className="h-5 w-5" />
                 </button>
              </div>
              
              <form onSubmit={handleUpdateProfile} className="space-y-5">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">Full Name</label>
                    <input 
                      type="text" 
                      required 
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="e.g. Bheda Nikhil" 
                      className="input-field py-4 h-12" 
                      disabled={isUpdatingProfile}
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">Assigned Region</label>
                    <input 
                      type="text" 
                      value={editRegion}
                      onChange={(e) => setEditRegion(e.target.value)}
                      placeholder="e.g. APAC North" 
                      className="input-field py-4 h-12" 
                      disabled={isUpdatingProfile}
                    />
                 </div>
                 
                 <div className="pt-4 flex gap-4">
                    <button 
                      type="submit" 
                      className={`btn-primary flex-1 h-14 justify-center shadow-lg shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-700 ${isUpdatingProfile ? 'opacity-70' : ''}`}
                      disabled={isUpdatingProfile}
                    >
                      {isUpdatingProfile ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                      ) : (
                        <>
                          <AppIcon name="check" className="h-4 w-4 mr-3" />
                          Save Changes
                        </>
                      )}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </main>
  );
}
