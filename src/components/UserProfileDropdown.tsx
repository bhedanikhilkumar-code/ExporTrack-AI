import { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import AppIcon from './AppIcon';

export default function UserProfileDropdown() {
    const { state: { user }, logout } = useAppContext();
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
                className="focus-ring flex items-center gap-2 p-1 rounded-xl border border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group relative z-10"
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                {/* Profile Picture */}
                {user.profilePicture ? (
                    <img
                        src={user.profilePicture}
                        alt={user.name}
                        className="h-8 w-8 rounded-lg object-cover shadow-sm transition-transform group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.style.display = 'none';
                        }}
                    />
                ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 text-white text-xs font-black shadow-sm transition-transform group-hover:scale-105">
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

            {/* Dropdown Menu */}
            {isOpen && (
                <div 
                    className="fixed right-4 sm:absolute sm:right-0 mt-3 w-[calc(100vw-2rem)] sm:w-64 max-w-sm rounded-2xl border border-slate-200/60 bg-white/95 backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/95 shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-[100] overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200 p-1"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Profile Info Section */}
                    <div className="p-4 mb-1">
                        <div className="flex items-center gap-3">
                            {/* Profile Picture */}
                            {user.profilePicture ? (
                                <img
                                    src={user.profilePicture}
                                    alt={user.name}
                                    className="h-12 w-12 rounded-xl object-cover shadow-sm"
                                    loading="lazy"
                                    onError={(e) => {
                                        const img = e.target as HTMLImageElement;
                                        img.style.display = 'none';
                                    }}
                                />
                            ) : (
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 text-white text-lg font-black shadow-sm">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                            )}

                            {/* User Details */}
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                    {user.name}
                                </p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-medium">
                                    {user.email}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-slate-200/60 dark:bg-slate-800/60 mx-2 my-1" />

                    {/* Menu Items */}
                    <div className="p-1.5 space-y-0.5 relative">
                        <button
                            onClick={() => {
                                navigate('/team');
                                setIsOpen(false);
                            }}
                            className="w-full h-11 px-3 py-2 rounded-xl text-left text-[13px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center gap-3 transition-all group"
                        >
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500 group-hover:bg-white dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-slate-700 transition-colors shadow-sm">
                                <AppIcon name="user" className="h-4 w-4" />
                            </div>
                            <span>My Profile</span>
                        </button>

                        <button
                            onClick={() => {
                                navigate('/admin');
                                setIsOpen(false);
                            }}
                            className="w-full h-11 px-3 py-2 rounded-xl text-left text-[13px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center gap-3 transition-all group"
                        >
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500 group-hover:bg-white dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-slate-700 transition-colors shadow-sm">
                                <AppIcon name="settings" className="h-4 w-4" />
                            </div>
                            <span>Settings</span>
                        </button>

                        <div className="h-px bg-slate-200/60 dark:bg-slate-800/60 mx-1 my-1.5" />

                        <button
                            onClick={() => {
                                logout();
                                setIsOpen(false);
                            }}
                            className="w-full h-11 px-3 py-2 rounded-xl text-left text-[13px] font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center gap-3 transition-all group"
                        >
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-100 text-rose-500 group-hover:bg-white dark:bg-rose-500/20 dark:text-rose-400 dark:group-hover:bg-rose-500/30 transition-colors shadow-sm">
                                <AppIcon name="logout" className="h-4 w-4" />
                            </div>
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
