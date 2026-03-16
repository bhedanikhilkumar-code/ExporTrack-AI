/**
 * OfflineFallback — branded page shown when the user navigates while offline.
 * Includes auto-retry that refreshes the page when connectivity returns.
 */
import { useEffect, useState } from 'react';

export default function OfflineFallback() {
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    const onOnline = () => window.location.reload();
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, []);

  const handleRetry = () => {
    setRetrying(true);
    setTimeout(() => {
      if (navigator.onLine) {
        window.location.reload();
      } else {
        setRetrying(false);
      }
    }, 1500);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 text-center">
      {/* Icon */}
      <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-slate-900 border border-slate-800 shadow-elevated">
        <svg className="h-12 w-12 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
      </div>

      <h1 className="mb-3 text-2xl font-bold tracking-tight text-white">
        You're offline
      </h1>
      <p className="mb-8 max-w-sm text-sm leading-relaxed text-slate-400">
        It looks like you've lost your internet connection. Some features may be unavailable until you're back online.
      </p>

      <button
        onClick={handleRetry}
        disabled={retrying}
        className="group relative inline-flex items-center gap-2 rounded-xl bg-teal-500 px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-teal-400 hover:shadow-xl active:scale-95 disabled:opacity-60"
      >
        {retrying ? (
          <>
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Checking…
          </>
        ) : (
          <>
            <svg className="h-4 w-4 transition-transform group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
            </svg>
            Retry connection
          </>
        )}
      </button>

      <p className="mt-6 text-xs text-slate-600">
        This page will auto-refresh when you're back online.
      </p>
    </div>
  );
}
