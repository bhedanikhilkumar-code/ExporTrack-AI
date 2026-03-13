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
            className="absolute top-full right-0 mt-3 w-96 max-w-[calc(100vw-2rem)] z-50 animate-in fade-in slide-in-from-top-2 duration-200"
        >
            <div className="rounded-2xl border border-slate-200/60 bg-white/95 backdrop-blur-xl shadow-2xl dark:border-slate-800/60 dark:bg-slate-900/95 overflow-hidden flex flex-col">
                {/* Header */}
                <div className="border-b border-slate-200/60 px-4 py-3 dark:border-slate-800/60">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-widest">
                                Notifications
                            </h3>
                        </div>
                        {unreadNotifications.length > 0 && (
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-teal-500 text-[10px] font-black text-white shadow-sm">
                              {unreadNotifications.length}
                          </span>
                        )}
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
                                        className={`group p-4 border-l-2 transition-all hover:bg-slate-50/50 dark:hover:bg-slate-800/50 ${isUnread
                                                ? `${colors.bg} ${colors.border} border-l-teal-500`
                                                : 'border-l-transparent bg-white/50 dark:bg-slate-900/30'
                                            }`}
                                    >
                                        <div className="flex gap-3">
                                            {/* Icon / Avatar */}
                                            <div className={`flex-shrink-0 mt-0.5 h-9 w-9 rounded-xl flex items-center justify-center shadow-sm ${colors.badge.replace('text-', 'bg-').replace('bg-', 'text-').split(' ').slice(0, 2).join(' ')} ${colors.badge.split(' ').slice(2).join(' ')}`}>
                                                <AppIcon
                                                    name={
                                                        notification.type === 'Missing Docs'
                                                            ? 'file'
                                                            : notification.type === 'Approval Delay'
                                                                ? 'clock'
                                                                : 'alert'
                                                    }
                                                    className="h-4 w-4"
                                                    strokeWidth={2.5}
                                                />
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                                                        {notification.title}
                                                    </h4>
                                                    {isUnread && (
                                                        <div className="flex-shrink-0 h-2 w-2 rounded-full bg-teal-500 flex-shrink-0 animate-pulse" />
                                                    )}
                                                </div>

                                                <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 mb-2 font-medium leading-relaxed">
                                                    {notification.message}
                                                </p>

                                                <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                                                    <span className={`inline-flex px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${typeColor}`}>
                                                        {notification.type}
                                                    </span>
                                                    <span className={`inline-flex px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${colors.badge}`}>
                                                        {notification.severity}
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
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
                                                            className="text-[9px] font-bold uppercase tracking-widest text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 opacity-0 group-hover:opacity-100 transition-opacity"
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
                        <div className="p-10 text-center flex flex-col items-center justify-center">
                            <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-4 transition-transform hover:scale-110 shadow-sm border border-slate-200 dark:border-slate-700">
                                <AppIcon name="bell" className="h-5 w-5 text-slate-400 dark:text-slate-500" strokeWidth={2.5} />
                            </div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                                All caught up!
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 uppercase tracking-widest font-bold">
                                No new notifications
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {sorted.length > 0 && (
                    <div className="border-t border-slate-200/60 bg-slate-50/50 px-4 py-3 dark:border-slate-800/60 dark:bg-slate-900/50">
                        <Link
                            to="/notifications"
                            onClick={onClose}
                            className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition-colors group"
                        >
                            View all Activity
                            <AppIcon name="arrow-right" className="h-3 w-3 transition-transform group-hover:translate-x-0.5" strokeWidth={3} />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
