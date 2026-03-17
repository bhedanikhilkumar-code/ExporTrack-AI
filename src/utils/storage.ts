/**
 * Safe storage utility to prevent crashes in environments where 
 * localStorage or sessionStorage might be restricted (e.g. Private Mode, 
 * certain mobile browsers).
 * 
 * Multi-user support:
 * - Demo users: Uses a single demo storage key
 * - Real users: Uses user-specific storage keys based on user ID
 */

// Storage keys
const STORAGE_KEYS = {
  // Current active session (stores user ID and mode)
  ACTIVE_SESSION: 'exportrack-ai-active-session',
  // Demo mode data (single key for all demo sessions)
  DEMO_DATA: 'exportrack-ai-demo-data',
  // Real user data (prefix, actual key includes user ID)
  USER_DATA_PREFIX: 'exportrack-ai-user-'
} as const;

export type UserMode = 'demo' | 'real';

export interface ActiveSession {
  userId: string;
  userMode: UserMode;
  email: string;
  name: string;
  role: string;
  authProvider: 'email' | 'google' | 'demo';
  profilePicture?: string;
  expiresAt?: string;
}

export const safeStorage = {
  // Session management
  getActiveSession: (): ActiveSession | null => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
      if (!raw) return null;
      const session = JSON.parse(raw) as ActiveSession;

      // Check expiration if set
      if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
        safeStorage.clearActiveSession();
        return null;
      }

      return session;
    } catch {
      return null;
    }
  },

  setActiveSession: (session: ActiveSession): boolean => {
    try {
      sessionStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(session));
      return true;
    } catch (e) {
      console.warn('[Storage] Failed to set active session:', e);
      return false;
    }
  },

  clearActiveSession: (): boolean => {
    try {
      sessionStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
      return true;
    } catch (e) {
      console.warn('[Storage] Failed to clear active session:', e);
      return false;
    }
  },

  // User-specific data storage for real users
  getUserDataKey: (userId: string): string => {
    return `${STORAGE_KEYS.USER_DATA_PREFIX}${userId}`;
  },

  getUserData: <T>(userId: string): T | null => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return null;
      const key = safeStorage.getUserDataKey(userId);
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  setUserData: <T>(userId: string, data: T): boolean => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      const key = safeStorage.getUserDataKey(userId);
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (e) {
      console.warn('[Storage] Failed to set user data:', e);
      return false;
    }
  },

  removeUserData: (userId: string): boolean => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      const key = safeStorage.getUserDataKey(userId);
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.warn('[Storage] Failed to remove user data:', e);
      return false;
    }
  },

  // Demo data storage (single shared key)
  getDemoData: <T>(): T | null => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return null;
      const raw = localStorage.getItem(STORAGE_KEYS.DEMO_DATA);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  setDemoData: <T>(data: T): boolean => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      localStorage.setItem(STORAGE_KEYS.DEMO_DATA, JSON.stringify(data));
      return true;
    } catch (e) {
      console.warn('[Storage] Failed to set demo data:', e);
      return false;
    }
  },

  clearDemoData: (): boolean => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      localStorage.removeItem(STORAGE_KEYS.DEMO_DATA);
      return true;
    } catch (e) {
      console.warn('[Storage] Failed to clear demo data:', e);
      return false;
    }
  },

  // Legacy support - original methods
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem(key);
      }
    } catch (e) {
      console.warn(`[Storage] Failed to get ${key} from localStorage:`, e);
    }
    return null;
  },

  setItem: (key: string, value: string): boolean => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, value);
        return true;
      }
    } catch (e) {
      console.warn(`[Storage] Failed to set ${key} in localStorage:`, e);
    }
    return false;
  },

  removeItem: (key: string): boolean => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(key);
        return true;
      }
    } catch (e) {
      console.warn(`[Storage] Failed to remove ${key} from localStorage:`, e);
    }
    return false;
  },

  session: {
    getItem: (key: string): string | null => {
      try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          return sessionStorage.getItem(key);
        }
      } catch (e) {
        console.warn(`[Storage] Failed to get ${key} from sessionStorage:`, e);
      }
      return null;
    },

    setItem: (key: string, value: string): boolean => {
      try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          sessionStorage.setItem(key, value);
          return true;
        }
      } catch (e) {
        console.warn(`[Storage] Failed to set ${key} in sessionStorage:`, e);
      }
      return false;
    },

    removeItem: (key: string): boolean => {
      try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          sessionStorage.removeItem(key);
          return true;
        }
      } catch (e) {
        console.warn(`[Storage] Failed to remove ${key} from sessionStorage:`, e);
      }
      return false;
    }
  }
};
