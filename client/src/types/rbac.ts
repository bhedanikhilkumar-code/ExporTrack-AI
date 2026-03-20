/**
 * Role-Based Access Control (RBAC) Type Definitions
 * Defines roles, permissions, and the role-permission mapping
 */

export type Role = 'owner' | 'admin' | 'manager' | 'viewer';

export type Permission =
  | 'documents:read'
  | 'documents:write'
  | 'documents:delete'
  | 'documents:finalize'
  | 'shipments:read'
  | 'shipments:write'
  | 'shipments:delete'
  | 'members:read'
  | 'members:invite'
  | 'members:remove'
  | 'members:update_role'
  | 'settings:read'
  | 'settings:write'
  | 'billing:read'
  | 'billing:write'
  | 'tracking:read'
  | 'tracking:write'
  | 'analytics:read'
  | 'org:delete';

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  owner: [
    'documents:read', 'documents:write', 'documents:delete', 'documents:finalize',
    'shipments:read', 'shipments:write', 'shipments:delete',
    'members:read', 'members:invite', 'members:remove', 'members:update_role',
    'settings:read', 'settings:write',
    'billing:read', 'billing:write',
    'tracking:read', 'tracking:write',
    'analytics:read',
    'org:delete',
  ],
  admin: [
    'documents:read', 'documents:write', 'documents:delete', 'documents:finalize',
    'shipments:read', 'shipments:write', 'shipments:delete',
    'members:read', 'members:invite', 'members:remove', 'members:update_role',
    'settings:read', 'settings:write',
    'billing:read',
    'tracking:read', 'tracking:write',
    'analytics:read',
  ],
  manager: [
    'documents:read', 'documents:write', 'documents:delete',
    'shipments:read', 'shipments:write', 'shipments:delete',
    'members:read',
    'settings:read',
    'tracking:read', 'tracking:write',
    'analytics:read',
  ],
  viewer: [
    'documents:read',
    'shipments:read',
    'members:read',
    'settings:read',
    'tracking:read',
    'analytics:read',
  ],
};

export const ROLE_LABELS: Record<Role, string> = {
  owner: 'Owner',
  admin: 'Admin',
  manager: 'Manager',
  viewer: 'Viewer',
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  owner: 'Full access — manage billing, delete organization, and all permissions.',
  admin: 'Manage members, all documents, settings, and analytics.',
  manager: 'Create, edit, and delete shipments & documents. Cannot manage members.',
  viewer: 'Read-only access to all data — no editing capabilities.',
};

export const ALL_ROLES: Role[] = ['owner', 'admin', 'manager', 'viewer'];

export function hasRolePermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
