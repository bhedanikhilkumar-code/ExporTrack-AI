import { useState, useEffect } from 'react';
import { registerSW } from 'virtual:pwa-register';

/**
 * PWAUpdateBanner — shows a toast-style prompt when a new service worker version
 * is waiting to activate. Clicking "Update" reloads all tabs with the fresh SW.
 */
export default function PWAUpdateBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [updateFn, setUpdateFn] = useState<(() => Promise<void>) | null>(null);

  useEffect(() => {
    const update = registerSW({
      onNeedRefresh() {
        setUpdateFn(() => update);
        setShowBanner(true);
      },
      onOfflineReady() {
        console.log('[PWA] App ready for offline use');
      },
    });
  }, []);

  if (!showBanner) return null;

  return (
    <div
      className="fixed bottom-6 left-1/2 z-[9999] -translate-x-1/2 animate-slide-up"
      role="alert"
    >
      <div className="flex items-center gap-4 rounded-2xl border border-teal-500/30 bg-slate-900/95 px-5 py-3 shadow-float backdrop-blur-xl">
        {/* Pulse dot */}
        <span className="relative flex h-3 w-3 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-teal-500" />
        </span>

        <p className="text-sm font-medium text-white">
          A new version is available
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBanner(false)}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:text-white"
          >
            Later
          </button>
          <button
            onClick={() => updateFn?.()}
            className="rounded-lg bg-teal-500 px-4 py-1.5 text-xs font-bold text-white shadow-md transition-all hover:bg-teal-400 hover:shadow-lg active:scale-95"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
}
