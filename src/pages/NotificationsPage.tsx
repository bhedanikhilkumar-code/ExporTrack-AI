import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import AppIcon from '../components/AppIcon';
import { useAppContext } from '../context/AppContext';

export default function NotificationsPage() {
  const {
    state: { notifications },
    markNotificationRead,
    markAllNotificationsRead
  } = useAppContext();
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const sorted = useMemo(() =>
    [...notifications].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [notifications]);

  const filtered = useMemo(() =>
    showUnreadOnly ? sorted.filter((n) => !n.read) : sorted,
    [sorted, showUnreadOnly]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <main className="page-stack animate-in fade-in duration-500">
      <header className="dashboard-grid-header">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white" style={{ letterSpacing: '-0.03em' }}>
            Inbox & alerts
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
            Real-time logistics events, compliance alerts, and system notifications
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllNotificationsRead}
              className="hidden sm:flex btn-secondary btn-sm"
            >
              Mark All Read
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowUnreadOnly((prev) => !prev)}
            className={`btn-sm flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all border ${showUnreadOnly
                ? 'bg-slate-900 text-white border-slate-900 dark:bg-teal-500/20 dark:text-teal-400 dark:border-teal-500/40'
                : 'bg-white text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800'
              }`}
          >
            <div className={`h-1.5 w-1.5 rounded-full ${showUnreadOnly ? 'bg-teal-400 animate-pulse' : 'bg-slate-400'}`} />
            {showUnreadOnly ? 'Unread Only' : 'Show All'}
          </button>
        </div>
      </header>

      {filtered.length === 0 ? (
        <section className="card-premium flex flex-col items-center justify-center py-20 opacity-60">
          <div className="h-20 w-20 rounded-3xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-300 dark:text-slate-800 mb-6">
            <AppIcon name="bell" className="h-10 w-10" />
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No notifications found</p>
        </section>
      ) : (
        <section className="grid gap-4">
          {filtered.map((notification) => (
            <article
              key={notification.id}
              className={`group relative overflow-hidden p-0 rounded-2xl border transition-all duration-300 hover:shadow-xl ${notification.read
                  ? 'bg-white dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 grayscale-[0.5] opacity-80'
                  : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 shadow-md ring-1 ring-teal-500/10'
                }`}
            >
              {/* New badge accent */}
              {!notification.read && (
                <div className="absolute top-0 left-0 w-1 h-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.2)]" />
              )}

              <div className="p-5 md:p-6 flex gap-5">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm transition-transform group-hover:scale-110 ${notification.severity === 'High' ? 'bg-rose-500/10 text-rose-500' :
                    notification.severity === 'Medium' ? 'bg-amber-500/10 text-amber-500' :
                      'bg-teal-500/10 text-teal-500'
                  }`}>
                  <AppIcon
                    name={notification.type === 'Deadline' ? 'clock' : notification.type === 'Missing Docs' ? 'file' : 'bell'}
                    className="h-6 w-6"
                    strokeWidth={2.5}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight leading-none">
                        {notification.title}
                      </h3>
                      <div className="flex gap-1.5 scale-75 origin-left">
                        <StatusBadge value={notification.severity} />
                        <StatusBadge value={notification.type} />
                      </div>
                    </div>
                    <time className="text-[11px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                      {new Date(notification.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </time>
                  </div>

                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl mb-4">
                    {notification.message}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-4 mt-auto">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shipment</span>
                        <Link to={`/shipments/${notification.shipmentId}`} className="text-xs font-black text-teal-600 hover:text-teal-500 flex items-center gap-1 group/link">
                          {notification.shipmentId}
                          <AppIcon name="chevron-right" className="h-3 w-3 transition-transform group-hover/link:translate-x-0.5" />
                        </Link>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Action By</span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{notification.dueDate}</span>
                      </div>
                    </div>

                    {!notification.read && (
                      <button
                        onClick={() => markNotificationRead(notification.id)}
                        className="btn-primary py-2 px-6 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-teal-500/10"
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
