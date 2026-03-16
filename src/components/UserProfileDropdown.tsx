import { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import AppIcon from './AppIcon';

export default function UserProfileDropdown() {
    const { state: { user, theme }, logout, setTheme } = useAppContext();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleOutsideAction(event: MouseEvent | TouchEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleOutsideAction);
            document.addEventListener('touchstart', handleOutsideAction);
            return () => {
                document.removeEventListener('mousedown', handleOutsideAction);
                document.removeEventListener('touchstart', handleOutsideAction);
            };
        }
    }, [isOpen]);

    if (!user) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Profile Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="focus-ring flex items-center gap-2 p-1 rounded-full border border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group relative z-10"
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                {/* Profile Picture */}
                {user.profilePicture ? (
                    <img
                        src={user.profilePicture}
                        alt={user.name}
                        className="h-8 w-8 rounded-full object-cover shadow-sm transition-transform group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.style.display = 'none';
                        }}
                    />
                ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-blue-600 text-white text-xs font-black shadow-sm transition-transform group-hover:scale-105">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                )}

                {/* User Name */}
                <div className="hidden sm:flex flex-col items-start px-1 mr-1">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 max-w-[120px] truncate leading-tight">
                      {user.name}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 leading-tight">
                      {user.authProvider === 'demo' ? 'Demo' : 'Admin'}
                  </span>
                </div>

                {/* Chevron */}
                <div className="hidden sm:flex items-center justify-center h-5 w-5 rounded bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
                  <AppIcon
                      name={isOpen ? 'chevronUp' : 'chevronDown'}
                      className="h-3 w-3 text-slate-500 dark:text-slate-400"
                      strokeWidth={3}
                  />
                </div>
            </button>

            {/* Dropdown Menu - Premium YouTube Style */}
            {isOpen && (
                <div 
                    className="fixed inset-x-4 top-20 sm:absolute sm:inset-auto sm:right-0 sm:top-full mt-3 w-auto sm:w-72 rounded-2xl border border-slate-200/50 bg-white/95 backdrop-blur-xl dark:border-slate-800/50 dark:bg-slate-900/95 shadow-dropdown z-[100] overflow-hidden animate-profile-menu p-1.5"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header Section */}
                    <div className="flex items-start gap-4 p-4 border-b border-slate-100 dark:border-slate-800/40 mb-1">
                        {/* Avatar */}
                        <div className="relative group/avatar">
                            {user.profilePicture ? (
                                <img
                                    src={user.profilePicture}
                                    alt={user.name}
                                    className="h-10 w-10 rounded-full object-cover shadow-sm ring-2 ring-white dark:ring-slate-800 transition-transform duration-300 group-hover/avatar:scale-105"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-indigo-600 text-white text-base font-black shadow-sm ring-2 ring-white dark:ring-slate-800">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-black text-slate-900 dark:text-white truncate tracking-tight">
                                {user.name}
                            </span>
                            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 truncate mb-2">
                                @{user.email.split('@')[0]}
                            </span>
                            <button 
                                onClick={() => {
                                    navigate('/team');
                                    setIsOpen(false);
                                }}
                                className="text-[11px] font-black text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors text-left uppercase tracking-wider"
                            >
                                View your profile
                            </button>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1.5 space-y-0.5">
                        <div className="px-1">
                            <button
                                onClick={() => {
                                    navigate('/admin');
                                    setIsOpen(false);
                                }}
                                className="w-full h-11 px-3 rounded-xl text-left text-[13px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center gap-3 transition-all duration-200 group"
                            >
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-400 group-hover:bg-white group-hover:text-teal-600 dark:bg-slate-800/50 dark:group-hover:bg-slate-700 dark:group-hover:text-teal-400 transition-colors shadow-sm">
                                    <AppIcon name="settings" className="h-4 w-4" />
                                </div>
                                <span className="group-hover:translate-x-0.5 transition-transform duration-200">Settings</span>
                            </button>
                        </div>

                        <div className="h-px bg-slate-100 dark:bg-slate-800/40 mx-4 my-2" />

                        {/* Appearance Switcher */}
                        <div className="px-3 py-3">
                            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 mb-3 px-2 flex items-center gap-2">
                                <AppIcon name="monitor" className="h-3 w-3" />
                                Appearance
                            </p>
                            <div className="grid grid-cols-3 gap-1 bg-slate-50 dark:bg-slate-800/30 p-1 rounded-xl border border-slate-200/40 dark:border-slate-800/40">
                                {[
                                    { id: 'light', icon: 'sun', label: 'Light' },
                                    { id: 'dark', icon: 'moon', label: 'Dark' },
                                    { id: 'system', icon: 'monitor', label: 'OS' }
                                ].map((opt) => (
                                    <button
                                        key={opt.id}
                                        onClick={() => setTheme(opt.id as any)}
                                        className={`flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-lg transition-all duration-200 ${
                                            theme === opt.id 
                                                ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-[0_4px_12px_rgba(0,0,0,0.08)] scale-100' 
                                                : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
                                        }`}
                                    >
                                        <AppIcon name={opt.icon as any} className="h-3.5 w-3.5" />
                                        <span className="text-[9px] font-black uppercase tracking-tighter">{opt.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="h-px bg-slate-100 dark:bg-slate-800/40 mx-4 my-2" />

                        <div className="px-1">
                            <button
                                onClick={() => {
                                    logout();
                                    setIsOpen(false);
                                }}
                                className="w-full h-11 px-3 rounded-xl text-left text-[13px] font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center gap-3 transition-all duration-200 group"
                            >
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-400 group-hover:bg-white group-hover:text-rose-600 dark:bg-rose-500/10 dark:text-rose-500 dark:group-hover:bg-rose-500/20 transition-colors shadow-sm">
                                    <AppIcon name="logout" className="h-4 w-4" />
                                </div>
                                <span className="group-hover:translate-x-0.5 transition-transform duration-200">Sign Out</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
