import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { NotificationItem } from '../types';
import { useAppContext } from '../context/AppContext';
import AppIcon from './AppIcon';

interface NotificationPanelProps {
    notifications: NotificationItem[];
    isOpen: boolean;
    onClose: () => void;
}

const severityColors = {
    'High': { bg: 'bg-rose-50 dark:bg-rose-900/10', border: 'border-rose-200 dark:border-rose-800', badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
    'Medium': { bg: 'bg-amber-50 dark:bg-amber-900/10', border: 'border-amber-200 dark:border-amber-800', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    'Low': { bg: 'bg-teal-50 dark:bg-teal-900/10', border: 'border-teal-200 dark:border-teal-800', badge: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' }
};

const typeColors = {
    'Missing Docs': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    'Approval Delay': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    'Deadline': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
};

export default function NotificationPanel({ notifications, isOpen, onClose }: NotificationPanelProps) {
    const { markNotificationRead } = useAppContext();
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                onClose();
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sorted = [...notifications].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const unreadNotifications = sorted.filter((n) => !n.read);
    const readNotifications = sorted.filter((n) => n.read);

    // Show unread first, then read (max 6 in dropdown)
    const displayedNotifications = [...unreadNotifications, ...readNotifications].slice(0, 6);

    return (
        <div
            ref={panelRef}
            className="absolute top-full right-0 mt-3 w-96 max-w-[calc(100vw-2rem)] z-50 animate-slide-down"
        >
            <div className="rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
                {/* Header */}
                <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100/50 px-4 py-3.5 dark:border-slate-800 dark:from-slate-800 dark:to-slate-800/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <AppIcon name="bell" className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                            <h3 className="text-sm font-bold text-navy-800 dark:text-slate-100">
                                Notifications
                            </h3>
                        </div>
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-700 dark:bg-teal-900/40 dark:text-teal-400">
                            {unreadNotifications.length}
                        </span>
                    </div>
                </div>

                {/* Notifications List */}
                <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent dark:scrollbar-thumb-slate-600">
                    {displayedNotifications.length > 0 ? (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {displayedNotifications.map((notification) => {
                                const colors = severityColors[notification.severity];
                                const typeColor = typeColors[notification.type];
                                const isUnread = !notification.read;

                                return (
                                    <div
                                        key={notification.id}
                                        className={`group p-4 border-l-4 transition-all hover:bg-slate-50/50 dark:hover:bg-slate-800/50 ${isUnread
                                                ? `${colors.bg} ${colors.border} border-l-teal-500`
                                                : 'border-l-transparent bg-white dark:bg-slate-900/50'
                                            }`}
                                    >
                                        <div className="flex gap-3">
                                            {/* Icon / Avatar */}
                                            <div className={`flex-shrink-0 mt-0.5 h-9 w-9 rounded-lg flex items-center justify-center ${colors.badge.replace('text-', 'bg-').replace('bg-', 'text-').split(' ').slice(0, 2).join(' ')} ${colors.badge.split(' ').slice(2).join(' ')}`}>
                                                <AppIcon
                                                    name={
                                                        notification.type === 'Missing Docs'
                                                            ? 'file'
                                                            : notification.type === 'Approval Delay'
                                                                ? 'clock'
                                                                : 'alert'
                                                    }
                                                    className="h-4 w-4"
                                                />
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                    <h4 className="text-sm font-semibold text-navy-800 dark:text-slate-100 line-clamp-1">
                                                        {notification.title}
                                                    </h4>
                                                    {isUnread && (
                                                        <div className="flex-shrink-0 h-2 w-2 rounded-full bg-teal-500 flex-shrink-0" />
                                                    )}
                                                </div>

                                                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-2">
                                                    {notification.message}
                                                </p>

                                                <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                                                    <span className={`inline-flex px-2 py-1 rounded text-[10px] font-semibold ${typeColor}`}>
                                                        {notification.type}
                                                    </span>
                                                    <span className={`inline-flex px-2 py-1 rounded text-[10px] font-semibold ${colors.badge}`}>
                                                        {notification.severity}
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                                        {new Date(notification.createdAt).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>

                                                    {isUnread && (
                                                        <button
                                                            type="button"
                                                            onClick={() => markNotificationRead(notification.id)}
                                                            className="text-xs font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            Mark as read
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <div className="flex justify-center mb-3">
                                <AppIcon name="bell" className="h-8 w-8 text-slate-300 dark:text-slate-700" />
                            </div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                All caught up!
                            </p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                No notifications right now
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {sorted.length > 0 && (
                    <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/30">
                        <Link
                            to="/notifications"
                            onClick={onClose}
                            className="flex items-center justify-center gap-2 text-sm font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition-colors"
                        >
                            View all notifications
                            <AppIcon name="arrow-right" className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
