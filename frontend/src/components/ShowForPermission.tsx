import { ReactNode } from 'react';
import { useHasPermission } from '../hooks/useHasPermission';
import { Permission } from '../utils/permissions';

interface ShowForPermissionProps {
    permission: Permission | Permission[];
    children: ReactNode;
    fallback?: ReactNode;
    requireAll?: boolean; // If true, requires ALL permissions. If false (default), requires ANY permission
}

/**
 * Component that conditionally renders content based on user permissions
 * 
 * Usage:
 * <ShowForPermission permission="create_shipments">
 *   <button>Create Shipment</button>
 * </ShowForPermission>
 * 
 * <ShowForPermission permission={['manage_users', 'invite_users']} requireAll={false}>
 *   <button>Manage Users</button>
 * </ShowForPermission>
 */
export default function ShowForPermission({
    permission,
    children,
    fallback = null,
    requireAll = false
}: ShowForPermissionProps) {
    // Handle single permission
    if (typeof permission === 'string') {
        const hasPermission = useHasPermission(permission);
        return hasPermission ? <>{children}</> : <>{fallback}</>;
    }

    // Handle array of permissions
    if (requireAll) {
        // Require ALL permissions
        const hasAllPermissions = permission.every(p => useHasPermission(p));
        return hasAllPermissions ? <>{children}</> : <>{fallback}</>;
    } else {
        // Require ANY permission (at least one)
        const hasAnyPermission = permission.some(p => useHasPermission(p));
        return hasAnyPermission ? <>{children}</> : <>{fallback}</>;
    }
}

/**
 * Hides children if user doesn't have permission
 * Alternative name for ShowForPermission for semantic clarity
 */
export function HideIfNoPermission({
    permission,
    children,
    fallback = null
}: Omit<ShowForPermissionProps, 'requireAll'>) {
    return <ShowForPermission permission={permission} fallback={fallback}>{children}</ShowForPermission>;
}

/**
 * Shows children only if user has ALL specified permissions
 */
export function ShowIfAllPermissions({
    permission,
    children,
    fallback = null
}: Omit<ShowForPermissionProps, 'requireAll'>) {
    return <ShowForPermission permission={permission} fallback={fallback} requireAll>{children}</ShowForPermission>;
}
