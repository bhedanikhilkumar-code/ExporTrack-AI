import AppIcon from './AppIcon';
import { WorkspaceRole, ROLE_COLORS } from '../utils/permissions';

interface RoleBadgeProps {
    role: WorkspaceRole | string;
    size?: 'sm' | 'md' | 'lg';
    showIcon?: boolean;
}

/**
 * Role Badge Component
 * Displays user role with appropriate color coding
 * 
 * Admin → red/rose
 * Manager → blue
 * Operations → teal
 * Viewer → gray/slate
 */
export default function RoleBadge({ role, size = 'md', showIcon = false }: RoleBadgeProps) {
    // Normalize role to WorkspaceRole
    const normalizedRole = (['Admin', 'Manager', 'Operations', 'Viewer'].includes(role)
        ? role
        : role === 'Staff'
            ? 'Operations'
            : 'Viewer') as WorkspaceRole;

    const colors = ROLE_COLORS[normalizedRole] || ROLE_COLORS.Viewer;

    const sizeClasses = {
        sm: 'text-[9px] px-1.5 py-0.5',
        md: 'text-[10px] px-2 py-0.5',
        lg: 'text-xs px-2.5 py-1'
    };

    const iconSizes = {
        sm: 'h-2.5 w-2.5',
        md: 'h-3 w-3',
        lg: 'h-3.5 w-3.5'
    };

    const roleIcons: Record<WorkspaceRole, string> = {
        Admin: 'shield',
        Manager: 'briefcase',
        Operations: 'package',
        Viewer: 'eye'
    };

    return (
        <span
            className={`
        inline-flex items-center gap-1 rounded-full border font-bold uppercase tracking-wider
        ${colors.bg} ${colors.text} ${colors.border}
        ${sizeClasses[size]}
      `}
        >
            {showIcon && normalizedRole in roleIcons && (
                <AppIcon name={roleIcons[normalizedRole] as any} className={iconSizes[size]} />
            )}
            {normalizedRole}
        </span>
    );
}
