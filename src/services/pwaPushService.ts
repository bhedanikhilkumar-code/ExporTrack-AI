/**
 * pwaPushService.ts
 *
 * Browser push notification scaffold — provides permission-request flow and local
 * notification helpers.  All functions are no-ops when the Notification API
 * is not available (server-side rendering, unsupported browsers, etc.).
 */

/** Check if the Notification API is supported in this browser. */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/** Current permission state, or 'unsupported' if API is missing. */
export function getPermissionState(): NotificationPermission | 'unsupported' {
  return isNotificationSupported() ? Notification.permission : 'unsupported';
}

/**
 * Request browser notification permission.
 * Returns the resulting permission string, or 'unsupported'.
 */
export async function requestPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!isNotificationSupported()) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  try {
    return await Notification.requestPermission();
  } catch {
    return 'denied';
  }
}

/**
 * Show a local notification via the active Service Worker registration.
 * Falls back to `new Notification()` if no SW is available.
 */
export async function showLocalNotification(
  title: string,
  options?: NotificationOptions
): Promise<void> {
  if (!isNotificationSupported() || Notification.permission !== 'granted') return;

  const mergedOptions: NotificationOptions = {
    icon: '/pwa-icons/icon-192.png',
    badge: '/pwa-icons/icon-192.png',
    ...options,
  };

  try {
    const reg = await navigator.serviceWorker?.ready;
    if (reg) {
      await reg.showNotification(title, mergedOptions);
    } else {
      new Notification(title, mergedOptions);
    }
  } catch {
    // Silent fail — notification is a non-critical feature
    console.warn('[Notification] Failed to show notification');
  }
}
