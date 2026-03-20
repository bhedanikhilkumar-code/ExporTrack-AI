/**
 * Server-side permission check utility for API routes
 * Used in Vercel serverless functions to validate user permissions
 */

import { Role, Permission, ROLE_PERMISSIONS } from '../types/rbac';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: Role;
}

/**
 * Check if a role has a specific permission
 */
export function checkPermission(role: Role | string, permission: Permission): boolean {
  const normalizedRole = normalizeRole(role);
  return ROLE_PERMISSIONS[normalizedRole]?.includes(permission) ?? false;
}

/**
 * Check if a role has ALL of the specified permissions
 */
export function checkAllPermissions(role: Role | string, permissions: Permission[]): boolean {
  return permissions.every(p => checkPermission(role, p));
}

/**
 * Check if a role has ANY of the specified permissions
 */
export function checkAnyPermission(role: Role | string, permissions: Permission[]): boolean {
  return permissions.some(p => checkPermission(role, p));
}

/**
 * Normalize legacy role strings to the new Role type
 */
export function normalizeRole(role: string): Role {
  const lower = role.toLowerCase();
  if (lower === 'owner') return 'owner';
  if (lower === 'admin') return 'admin';
  if (lower === 'manager' || lower === 'export operations manager') return 'manager';
  if (lower === 'operations' || lower === 'staff') return 'manager';
  return 'viewer';
}

/**
 * Check if the acting user can modify the target user's role
 */
export function canUpdateRole(actorRole: Role, targetCurrentRole: Role, targetNewRole: Role): {
  allowed: boolean;
  reason?: string;
} {
  // Only owner and admin can update roles
  if (actorRole !== 'owner' && actorRole !== 'admin') {
    return { allowed: false, reason: 'Only owners and admins can update roles.' };
  }

  // Admin cannot promote to owner or demote an owner
  if (actorRole === 'admin') {
    if (targetCurrentRole === 'owner') {
      return { allowed: false, reason: 'Admins cannot modify owner roles.' };
    }
    if (targetNewRole === 'owner') {
      return { allowed: false, reason: 'Admins cannot promote to owner.' };
    }
  }

  // Owner cannot be demoted unless transferring ownership
  if (targetCurrentRole === 'owner' && targetNewRole !== 'owner') {
    if (actorRole !== 'owner') {
      return { allowed: false, reason: 'Only the owner can transfer ownership.' };
    }
  }

  return { allowed: true };
}
