/**
 * Safe storage utility to prevent crashes in environments where 
 * localStorage or sessionStorage might be restricted (e.g. Private Mode, 
 * certain mobile browsers).
 */

export const safeStorage = {
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
