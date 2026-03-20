/**
 * Audit Trail / Activity Log Service
 * Tracks all changes made to shipments, documents, and team members
 * Stored in localStorage with user, timestamp, and action details
 */

export type AuditAction =
    | 'SHIPMENT_CREATED'
    | 'SHIPMENT_UPDATED'
    | 'SHIPMENT_STATUS_CHANGED'
    | 'SHIPMENT_DELETED'
    | 'DOCUMENT_UPLOADED'
    | 'DOCUMENT_VERIFIED'
    | 'DOCUMENT_REJECTED'
    | 'DOCUMENT_DELETED'
    | 'DRIVER_ASSIGNED'
    | 'COMMENT_ADDED'
    | 'TEAM_MEMBER_INVITED'
    | 'TEAM_MEMBER_REMOVED'
    | 'TEAM_MEMBER_ROLE_CHANGED'
    | 'USER_LOGIN'
    | 'USER_LOGOUT'
    | 'SETTINGS_CHANGED';

export type AuditSeverity = 'info' | 'warning' | 'critical';

export interface AuditLogEntry {
    id: string;
    timestamp: string;
    userId: string;
    userName: string;
    userRole: string;
    action: AuditAction;
    severity: AuditSeverity;
    entityType: 'shipment' | 'document' | 'team' | 'user' | 'system';
    entityId?: string;
    entityName?: string;
    description: string;
    oldValue?: string;
    newValue?: string;
    ipAddress?: string;
    metadata?: Record<string, string>;
}

const STORAGE_KEY = 'exportrack_audit_logs';
const MAX_LOGS = 1000; // Keep last 1000 entries

function generateId(): string {
    return `AUDIT-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
}

function getSeverity(action: AuditAction): AuditSeverity {
    const critical: AuditAction[] = [
        'SHIPMENT_DELETED', 'DOCUMENT_REJECTED', 'TEAM_MEMBER_REMOVED',
        'TEAM_MEMBER_ROLE_CHANGED'
    ];
    const warning: AuditAction[] = [
        'SHIPMENT_STATUS_CHANGED', 'DOCUMENT_VERIFIED', 'DRIVER_ASSIGNED',
        'TEAM_MEMBER_INVITED'
    ];
    if (critical.includes(action)) return 'critical';
    if (warning.includes(action)) return 'warning';
    return 'info';
}

export function logAuditEvent(
    params: Omit<AuditLogEntry, 'id' | 'timestamp' | 'severity'>
): AuditLogEntry {
    const entry: AuditLogEntry = {
        ...params,
        id: generateId(),
        timestamp: new Date().toISOString(),
        severity: getSeverity(params.action),
    };

    try {
        const existing = getAuditLogs();
        const updated = [entry, ...existing].slice(0, MAX_LOGS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
        // Storage full or unavailable — silently fail
    }

    return entry;
}

export function getAuditLogs(): AuditLogEntry[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        return JSON.parse(raw) as AuditLogEntry[];
    } catch {
        return [];
    }
}

export function getAuditLogsForShipment(shipmentId: string): AuditLogEntry[] {
    return getAuditLogs().filter((log) => log.entityId === shipmentId);
}

export function getAuditLogsForUser(userId: string): AuditLogEntry[] {
    return getAuditLogs().filter((log) => log.userId === userId);
}

export function clearAuditLogs(): void {
    localStorage.removeItem(STORAGE_KEY);
}

export function getAuditLogStats() {
    const logs = getAuditLogs();
    const today = new Date().toDateString();
    return {
        total: logs.length,
        today: logs.filter((l) => new Date(l.timestamp).toDateString() === today).length,
        critical: logs.filter((l) => l.severity === 'critical').length,
        warning: logs.filter((l) => l.severity === 'warning').length,
        info: logs.filter((l) => l.severity === 'info').length,
    };
}

export function formatAuditAction(action: AuditAction): string {
    const map: Record<AuditAction, string> = {
        SHIPMENT_CREATED: 'Created Shipment',
        SHIPMENT_UPDATED: 'Updated Shipment',
        SHIPMENT_STATUS_CHANGED: 'Changed Status',
        SHIPMENT_DELETED: 'Deleted Shipment',
        DOCUMENT_UPLOADED: 'Uploaded Document',
        DOCUMENT_VERIFIED: 'Verified Document',
        DOCUMENT_REJECTED: 'Rejected Document',
        DOCUMENT_DELETED: 'Deleted Document',
        DRIVER_ASSIGNED: 'Assigned Driver',
        COMMENT_ADDED: 'Added Comment',
        TEAM_MEMBER_INVITED: 'Invited Team Member',
        TEAM_MEMBER_REMOVED: 'Removed Team Member',
        TEAM_MEMBER_ROLE_CHANGED: 'Changed Member Role',
        USER_LOGIN: 'User Login',
        USER_LOGOUT: 'User Logout',
        SETTINGS_CHANGED: 'Changed Settings',
    };
    return map[action] || action;
}
