import { Role } from '../types';

/* ─── Permission definitions ─────────────────────────────────────────── */
export type Permission =
  | 'manage_users'
  | 'invite_users'
  | 'remove_users'
  | 'edit_shipments'
  | 'create_shipments'
  | 'update_tracking'
  | 'view_shipments'
  | 'access_analytics'
  | 'manage_documents'
  | 'approve_documents'
  | 'view_documents'
  | 'manage_settings';

export type WorkspaceRole = 'Admin' | 'Manager' | 'Operations' | 'Viewer';

/* ─── Role → Permissions Map ─────────────────────────────────────────── */
const ROLE_PERMISSIONS: Record<WorkspaceRole, Permission[]> = {
  Admin: [
    'manage_users',
    'invite_users',
    'remove_users',
    'edit_shipments',
    'create_shipments',
    'update_tracking',
    'view_shipments',
    'access_analytics',
    'manage_documents',
    'approve_documents',
    'view_documents',
    'manage_settings',
  ],
  Manager: [
    'invite_users',
    'edit_shipments',
    'create_shipments',
    'update_tracking',
    'view_shipments',
    'access_analytics',
    'manage_documents',
    'approve_documents',
    'view_documents',
  ],
  Operations: [
    'create_shipments',
    'update_tracking',
    'view_shipments',
    'manage_documents',
    'view_documents',
  ],
  Viewer: [
    'view_shipments',
    'view_documents',
  ],
};

/* ─── Map legacy roles to workspace roles ────────────────────────────── */
export function toWorkspaceRole(role: Role): WorkspaceRole {
  switch (role) {
    case 'Admin': return 'Admin';
    case 'Manager': return 'Manager';
    case 'Export Operations Manager': return 'Manager';
    case 'Staff': return 'Operations';
    default: return 'Viewer';
  }
}

/* ─── Check permission ────────────────────────────────────────────────── */
export function hasPermission(role: Role | WorkspaceRole, permission: Permission): boolean {
  const wsRole = (['Admin', 'Manager', 'Operations', 'Viewer'] as WorkspaceRole[]).includes(role as WorkspaceRole)
    ? (role as WorkspaceRole)
    : toWorkspaceRole(role as Role);
  return ROLE_PERMISSIONS[wsRole]?.includes(permission) ?? false;
}

/* ─── Get all permissions for a role ──────────────────────────────────── */
export function getPermissions(role: Role | WorkspaceRole): Permission[] {
  const wsRole = (['Admin', 'Manager', 'Operations', 'Viewer'] as WorkspaceRole[]).includes(role as WorkspaceRole)
    ? (role as WorkspaceRole)
    : toWorkspaceRole(role as Role);
  return ROLE_PERMISSIONS[wsRole] ?? [];
}

/* ─── All workspace roles ────────────────────────────────────────────── */
export const WORKSPACE_ROLES: WorkspaceRole[] = ['Admin', 'Manager', 'Operations', 'Viewer'];

/* ─── Permission display labels ──────────────────────────────────────── */
export const PERMISSION_LABELS: Record<Permission, string> = {
  manage_users: 'Manage Users',
  invite_users: 'Invite Users',
  remove_users: 'Remove Users',
  edit_shipments: 'Edit Shipments',
  create_shipments: 'Create Shipments',
  update_tracking: 'Update Tracking',
  view_shipments: 'View Shipments',
  access_analytics: 'Access Analytics',
  manage_documents: 'Manage Documents',
  approve_documents: 'Approve Documents',
  view_documents: 'View Documents',
  manage_settings: 'Manage Settings',
};

/* ─── Role descriptions ──────────────────────────────────────────────── */
export const ROLE_DESCRIPTIONS: Record<WorkspaceRole, string> = {
  Admin: 'Full access — manage users, edit shipments, access analytics, and configure workspace settings.',
  Manager: 'Operational lead — edit shipments, invite users, access analytics, and approve documents.',
  Operations: 'Field operator — create shipments, update tracking, and manage documents.',
  Viewer: 'Read-only — view shipments and documents without editing capabilities.',
};

/* ─── Role badge colours ─────────────────────────────────────────────── */
export const ROLE_COLORS: Record<WorkspaceRole, { bg: string; text: string; border: string }> = {
  Admin: { bg: 'bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-800/50' },
  Manager: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800/50' },
  Operations: { bg: 'bg-teal-500/10', text: 'text-teal-600 dark:text-teal-400', border: 'border-teal-200 dark:border-teal-800/50' },
  Viewer: { bg: 'bg-slate-500/10', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-800/50' },
};
