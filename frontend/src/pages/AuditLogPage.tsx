/**
 * Audit Log Page
 * Shows complete activity history with filters by action, severity, user, date
 */
import { useState, useMemo } from 'react';
import PageHeader from '../components/PageHeader';
import AppIcon from '../components/AppIcon';
import {
    getAuditLogs,
    getAuditLogStats,
    formatAuditAction,
    clearAuditLogs,
    type AuditLogEntry,
    type AuditAction,
    type AuditSeverity,
} from '../services/auditLogService';
import { useAppContext } from '../context/AppContext';

const SEVERITY_COLORS: Record<AuditSeverity, string> = {
    critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

const SEVERITY_DOT: Record<AuditSeverity, string> = {
    critical: 'bg-red-500',
    warning: 'bg-amber-500',
    info: 'bg-blue-500',
};

import type { AppIconName } from '../components/AppIcon';
// eslint-disable-next-line @typescript-eslint/no-unused-vars

const ENTITY_ICON: Record<string, AppIconName> = {
    shipment: 'package',
    document: 'file-text',
    team: 'users',
    user: 'user',
    system: 'settings',
};

export default function AuditLogPage() {
    const { state: { user } } = useAppContext();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterSeverity, setFilterSeverity] = useState<AuditSeverity | 'all'>('all');
    const [filterEntity, setFilterEntity] = useState<string>('all');
    const [filterDate, setFilterDate] = useState('');
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [, forceUpdate] = useState(0);

    const logs = useMemo(() => getAuditLogs(), []);
    const stats = useMemo(() => getAuditLogStats(), []);

    const filteredLogs = useMemo(() => {
        return logs.filter((log) => {
            if (filterSeverity !== 'all' && log.severity !== filterSeverity) return false;
            if (filterEntity !== 'all' && log.entityType !== filterEntity) return false;
            if (filterDate) {
                const logDate = new Date(log.timestamp).toISOString().split('T')[0];
                if (logDate !== filterDate) return false;
            }
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                return (
                    log.description.toLowerCase().includes(q) ||
                    log.userName.toLowerCase().includes(q) ||
                    (log.entityName || '').toLowerCase().includes(q) ||
                    (log.entityId || '').toLowerCase().includes(q)
                );
            }
            return true;
        });
    }, [logs, filterSeverity, filterEntity, filterDate, searchQuery]);

    const isAdmin = user?.role === 'Admin';

    function handleClearLogs() {
        clearAuditLogs();
        setShowClearConfirm(false);
        forceUpdate((n) => n + 1);
    }

    return (
        <div className="p-4 md:p-6 space-y-6">
            <PageHeader
                title="Audit Trail"
                subtitle="Complete activity history — track every change made in the system"
            />

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                    { label: 'Total Events', value: stats.total, color: 'text-slate-700 dark:text-slate-200', bg: 'bg-slate-100 dark:bg-slate-800' },
                    { label: "Today's Events", value: stats.today, color: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                    { label: 'Critical', value: stats.critical, color: 'text-red-700 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
                    { label: 'Warnings', value: stats.warning, color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                    { label: 'Info', value: stats.info, color: 'text-green-700 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
                ].map((stat) => (
                    <div key={stat.label} className={`${stat.bg} rounded-xl p-4 text-center`}>
                        <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                <div className="flex flex-wrap gap-3 items-center">
                    {/* Search */}
                    <div className="relative flex-1 min-w-[200px]">
                        <AppIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by user, action, entity..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                    </div>

                    {/* Severity filter */}
                    <select
                        value={filterSeverity}
                        onChange={(e) => setFilterSeverity(e.target.value as AuditSeverity | 'all')}
                        className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                        <option value="all">All Severity</option>
                        <option value="critical">Critical</option>
                        <option value="warning">Warning</option>
                        <option value="info">Info</option>
                    </select>

                    {/* Entity filter */}
                    <select
                        value={filterEntity}
                        onChange={(e) => setFilterEntity(e.target.value)}
                        className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                        <option value="all">All Types</option>
                        <option value="shipment">Shipment</option>
                        <option value="document">Document</option>
                        <option value="team">Team</option>
                        <option value="user">User</option>
                        <option value="system">System</option>
                    </select>

                    {/* Date filter */}
                    <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />

                    {/* Clear filters */}
                    {(searchQuery || filterSeverity !== 'all' || filterEntity !== 'all' || filterDate) && (
                        <button
                            onClick={() => { setSearchQuery(''); setFilterSeverity('all'); setFilterEntity('all'); setFilterDate(''); }}
                            className="px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        >
                            Clear Filters
                        </button>
                    )}

                    {/* Admin: Clear all logs */}
                    {isAdmin && (
                        <button
                            onClick={() => setShowClearConfirm(true)}
                            className="ml-auto px-3 py-2 text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                        >
                            <AppIcon name="trash-2" className="w-4 h-4" />
                            Clear All Logs
                        </button>
                    )}
                </div>
            </div>

            {/* Log Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                        Activity Log
                        <span className="ml-2 text-xs text-slate-500 dark:text-slate-400 font-normal">
                            {filteredLogs.length} {filteredLogs.length === 1 ? 'entry' : 'entries'}
                        </span>
                    </h3>
                </div>

                {filteredLogs.length === 0 ? (
                    <div className="py-16 text-center">
                        <AppIcon name="shield" className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-500 dark:text-slate-400 text-sm">No audit log entries found</p>
                        <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">
                            Actions will be recorded here as users interact with the system
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                        {filteredLogs.map((log) => (
                            <AuditLogRow key={log.id} log={log} />
                        ))}
                    </div>
                )}
            </div>

            {/* Clear Confirm Modal */}
            {showClearConfirm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                                <AppIcon name="alert-triangle" className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white">Clear All Audit Logs?</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">This action cannot be undone.</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowClearConfirm(false)}
                                className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleClearLogs}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                            >
                                Clear All
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function AuditLogRow({ log }: { log: AuditLogEntry }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div
            className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer transition-colors"
            onClick={() => setExpanded(!expanded)}
        >
            <div className="flex items-start gap-3">
                {/* Severity dot */}
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${SEVERITY_DOT[log.severity]}`} />

                {/* Entity icon */}
                <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    <AppIcon name={ENTITY_ICON[log.entityType] || 'activity'} className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                            {log.description}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${SEVERITY_COLORS[log.severity]}`}>
                            {log.severity}
                        </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                            <AppIcon name="user" className="w-3 h-3" />
                            {log.userName} ({log.userRole})
                        </span>
                        {log.entityId && (
                            <span className="flex items-center gap-1">
                                <AppIcon name="hash" className="w-3 h-3" />
                                {log.entityId}
                            </span>
                        )}
                        <span className="flex items-center gap-1">
                            <AppIcon name="clock" className="w-3 h-3" />
                            {new Date(log.timestamp).toLocaleString('en-IN')}
                        </span>
                    </div>

                    {/* Expanded details */}
                    {expanded && (log.oldValue || log.newValue || log.metadata) && (
                        <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-xs space-y-1">
                            {log.oldValue && (
                                <div className="flex gap-2">
                                    <span className="text-slate-500 dark:text-slate-400 font-medium w-16">Before:</span>
                                    <span className="text-red-600 dark:text-red-400">{log.oldValue}</span>
                                </div>
                            )}
                            {log.newValue && (
                                <div className="flex gap-2">
                                    <span className="text-slate-500 dark:text-slate-400 font-medium w-16">After:</span>
                                    <span className="text-green-600 dark:text-green-400">{log.newValue}</span>
                                </div>
                            )}
                            {log.metadata && Object.entries(log.metadata).map(([k, v]) => (
                                <div key={k} className="flex gap-2">
                                    <span className="text-slate-500 dark:text-slate-400 font-medium w-16 capitalize">{k}:</span>
                                    <span className="text-slate-700 dark:text-slate-300">{v}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Expand icon */}
                <AppIcon
                    name={expanded ? 'chevronUp' : 'chevronDown'}
                    className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1"
                />
            </div>
        </div>
    );
}
