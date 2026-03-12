import { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import AppIcon from './AppIcon';

export default function UserProfileDropdown() {
  const { user, logout } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {/* Profile Picture */}
        {user.profilePicture ? (
          <img
            src={user.profilePicture}
            alt={user.name}
            className="h-8 w-8 rounded-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-navy-600 text-white text-sm font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}

        {/* User Name */}
        <span className="hidden text-sm font-medium text-slate-700 dark:text-slate-300 sm:inline max-w-[150px] truncate">
          {user.name}
        </span>

        {/* Chevron */}
        <AppIcon
          name={isOpen ? 'chevronUp' : 'chevronDown'}
          className="h-4 w-4 text-slate-500 dark:text-slate-400"
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Profile Info Section */}
          <div className="border-b border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-700/50">
            <div className="flex items-center gap-3">
              {/* Profile Picture */}
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.name}
                  className="h-12 w-12 rounded-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-navy-600 text-white font-bold text-lg">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}

              {/* User Details */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                  {user.email}
                </p>
                {user.authProvider === 'google' && (
                  <div className="mt-1 flex items-center gap-1">
                    <AppIcon name="google" className="h-3 w-3 text-red-500" />
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Google Account
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              onClick={() => {
                // Navigate to profile page (implement as needed)
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 flex items-center gap-2 transition-colors"
            >
              <AppIcon name="user" className="h-4 w-4" />
              <span>My Profile</span>
            </button>

            <button
              onClick={() => {
                // Navigate to settings (implement as needed)
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 flex items-center gap-2 transition-colors"
            >
              <AppIcon name="settings" className="h-4 w-4" />
              <span>Settings</span>
            </button>

            <div className="my-1 border-t border-slate-200 dark:border-slate-700" />

            <button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center gap-2 transition-colors"
            >
              <AppIcon name="logout" className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
