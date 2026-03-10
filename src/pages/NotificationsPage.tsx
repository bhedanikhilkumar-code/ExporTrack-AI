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
    <div>
      <PageHeader
        title="Notifications & Reminders"
        subtitle="Stay ahead of missing documents, delayed approvals, and approaching compliance deadlines."
        action={
          <button
            type="button"
            onClick={() => setShowUnreadOnly((value) => !value)}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            {showUnreadOnly ? 'Show All' : 'Unread Only'}
          </button>
        }
      />

      <section className="space-y-3">
        {filtered.map((notification) => (
          <article key={notification.id} className={`rounded-2xl border p-4 shadow-soft ${notification.read ? 'border-slate-200 bg-white' : 'border-teal-200 bg-teal-50'}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold text-navy-800">{notification.title}</h3>
                  <StatusBadge value={notification.severity} />
                  <StatusBadge value={notification.type} />
                </div>
                <p className="text-sm text-slate-700">{notification.message}</p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span>Created: {notification.createdAt.slice(0, 10)}</span>
                  <span>Due: {notification.dueDate}</span>
                  <Link to={`/shipments/${notification.shipmentId}`} className="font-semibold text-teal-700 hover:text-teal-800">
                    {notification.shipmentId}
                  </Link>
                </div>
              </div>
              {!notification.read ? (
                <button
                  type="button"
                  onClick={() => markNotificationRead(notification.id)}
                  className="rounded-lg bg-navy-700 px-3 py-2 text-xs font-semibold text-white hover:bg-navy-800"
                >
                  Mark as Read
                </button>
              ) : (
                <span className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600">Read</span>
              )}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

