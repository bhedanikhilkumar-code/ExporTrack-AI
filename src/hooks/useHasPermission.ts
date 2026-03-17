import { useApp } from '../context/AppContext';
import { hasPermission, Permission } from '../utils/permissions';

/**
 * Hook to check if the current user has a specific permission
 * Returns true if the user has the permission, false otherwise
 * Demo users have limited permissions - they can only view and create shipments
 */
export function useHasPermission(permission: Permission): boolean {
    const { state, isDemoUser } = useApp();

    // Not authenticated - no permissions
    if (!state.user) {
        return false;
    }

    // Demo users have limited permissions
    // They can only: view_shipments, create_shipments, view_documents
    if (isDemoUser) {
        const demoAllowedPermissions: Permission[] = [
            'view_shipments',
            'create_shipments',
            'view_documents',
        ];
        return demoAllowedPermissions.includes(permission);
    }

    // Real users - check role-based permissions
    return hasPermission(state.user.role, permission);
}

/**
 * Hook to check if the current user can perform a specific action
 * Provides a more user-friendly check with optional error message
 */
export function useCanPerform(permission: Permission): {
    canPerform: boolean;
    message?: string;
} {
    const { isDemoUser } = useApp();
    const hasPermissionResult = useHasPermission(permission);

    if (!hasPermissionResult) {
        if (isDemoUser) {
            return {
                canPerform: false,
                message: 'This feature is not available in demo mode. Please sign up for a real account to access all features.'
            };
        }
        return {
            canPerform: false,
            message: 'You do not have permission to perform this action.'
        };
    }

    return { canPerform: true };
}

/**
 * Hook to get all permissions for the current user
 */
export function useUserPermissions(): Permission[] {
    const { state, isDemoUser } = useApp();

    if (!state.user) {
        return [];
    }

    if (isDemoUser) {
        // Demo users have limited permissions
        return [
            'view_shipments',
            'create_shipments',
            'view_documents',
        ];
    }

    // Import the getPermissions function
    const { getPermissions } = require('../utils/permissions');
    return getPermissions(state.user.role);
}
