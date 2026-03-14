import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { useAppContext } from '../context/AppContext';

export default function NotificationsPage() {
  const {
    state: { notifications },
    markNotificationRead
  } = useAppContext();
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const sorted = [...notifications].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const filtered = showUnreadOnly ? sorted.filter((notification) => !notification.read) : sorted;

  return (
    <div className="page-stack">
      <PageHeader
        title="Notifications & Reminders"
        subtitle="Stay ahead of missing documents, delayed approvals, and approaching compliance deadlines."
        action={
          <button
            type="button"
            onClick={() => setShowUnreadOnly((value) => !value)}
            className="btn-secondary"
          >
            {showUnreadOnly ? 'Show All' : 'Unread Only'}
          </button>
        }
      />

      <section className="space-y-3">
        {filtered.map((notification) => (
          <article key={notification.id} className={`card-surface p-4 md:p-5 ${notification.read ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60' : 'border-teal-200 dark:border-teal-800/50 bg-teal-50 dark:bg-teal-950/30'}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold text-navy-800 dark:text-white">{notification.title}</h3>
                  <StatusBadge value={notification.severity} />
                  <StatusBadge value={notification.type} />
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300">{notification.message}</p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span>Created: {notification.createdAt.slice(0, 10)}</span>
                  <span>Due: {notification.dueDate}</span>
                  <Link to={`/shipments/${notification.shipmentId}`} className="font-semibold text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300">
                    {notification.shipmentId}
                  </Link>
                </div>
              </div>
              {!notification.read ? (
                <button
                  type="button"
                  onClick={() => markNotificationRead(notification.id)}
                  className="btn-primary btn-sm"
                >
                  Mark as Read
                </button>
              ) : (
                <span className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400">Read</span>
              )}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

