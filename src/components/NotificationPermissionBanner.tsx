import { useState, useEffect } from 'react';
import { isNotificationSupported, requestPermission, getPermissionState } from '../services/pwaPushService';

const DISMISSED_KEY = 'exportrack_notif_banner_dismissed';

/**
 * NotificationPermissionBanner — a dismissable prompt asking the user
 * to enable browser push notifications. Shown only once (state persisted
 * in localStorage). 
 */
export default function NotificationPermissionBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Don't show if: not supported, already granted/denied, or previously dismissed
    if (!isNotificationSupported()) return;
    if (getPermissionState() !== 'default') return;
    if (localStorage.getItem(DISMISSED_KEY) === '1') return;

    // Delay appearance so the user settles in first
    const timer = setTimeout(() => setVisible(true), 8000);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISSED_KEY, '1');
  };

  const handleEnable = async () => {
    await requestPermission();
    dismiss();
  };

  if (!visible) return null;

  return (
    <div className="fixed top-4 right-4 z-[9998] max-w-sm animate-slide-in-right">
      <div className="rounded-2xl border border-slate-700/60 bg-slate-900/95 p-4 shadow-float backdrop-blur-xl">
        <div className="flex items-start gap-3">
          {/* Bell icon */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/10">
            <svg className="h-5 w-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
            </svg>
          </div>

          <div className="flex-1">
            <p className="text-sm font-semibold text-white">Enable notifications</p>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
              Get real-time alerts for shipment updates, delays, and compliance deadlines.
            </p>

            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={handleEnable}
                className="rounded-lg bg-teal-500 px-3.5 py-1.5 text-xs font-bold text-white transition-all hover:bg-teal-400 active:scale-95"
              >
                Enable
              </button>
              <button
                onClick={dismiss}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:text-white"
              >
                Not now
              </button>
            </div>
          </div>

          {/* Close button */}
          <button onClick={dismiss} className="shrink-0 text-slate-500 transition-colors hover:text-white">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
