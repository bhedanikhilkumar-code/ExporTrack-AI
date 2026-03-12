import { useState, useMemo, useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import AppIcon from './AppIcon';
import StatusBadge from './StatusBadge';
import NotificationPanel from './NotificationPanel';
import CommandPalette from './CommandPalette';
import UserProfileDropdown from './UserProfileDropdown';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/shipments', label: 'Shipments', icon: 'shipments' },
  { to: '/shipments/create', label: 'Create Shipment', icon: 'create' },
  { to: '/documents/upload', label: 'Upload Docs', icon: 'upload' },
  { to: '/ai-extraction', label: 'AI Extraction', icon: 'ai-extract' },
  { to: '/ai-validator', label: 'AI Validator', icon: 'verification' },
  { to: '/ai-compliance', label: 'AI Compliance', icon: 'shield' },
  { to: '/verification', label: 'Verification', icon: 'verification' },
  { to: '/notifications', label: 'Notifications', icon: 'notifications' },
  { to: '/team', label: 'Team', icon: 'team' }
] as const;

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  const {
    state: { user, notifications, theme, shipments },
    toggleTheme
  } = useAppContext();

  const unreadCount = notifications.filter((notification) => !notification.read).length;
  const currentNav = navItems.find((item) => location.pathname.startsWith(item.to));

  // Global Search Logic
  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    const results: any[] = [];

    shipments.forEach((shipment) => {
      // Search Shipment ID, Client, Destination, Container
      if (
        shipment.id.toLowerCase().includes(query) ||
        shipment.clientName.toLowerCase().includes(query) ||
        shipment.destinationCountry.toLowerCase().includes(query) ||
        shipment.containerNumber.toLowerCase().includes(query)
      ) {
        results.push({
          type: 'Shipment',
          title: shipment.id,
          subtitle: `${shipment.clientName} • ${shipment.destinationCountry}`,
          path: `/shipments/${shipment.id}`,
          status: shipment.status
        });
      }

      // Search Documents names within this shipment
      shipment.documents.forEach((doc) => {
        if (doc.fileName.toLowerCase().includes(query) || doc.type.toLowerCase().includes(query)) {
          results.push({
            type: 'Document',
            title: doc.type,
            subtitle: `In ${shipment.id} • ${doc.fileName}`,
            path: `/shipments/${shipment.id}`,
            status: doc.status
          });
        }
      });
    });

    return results.slice(0, 8); // Limit to top 8 results
  }, [searchQuery, shipments]);

  // Close search results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle Ctrl + K command palette
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen]);

  const handleResultClick = (path: string) => {
    navigate(path);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      {/* Desktop Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-20 hidden border-r border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 md:flex md:flex-col transition-all duration-300 ease-in-out ${sidebarExpanded ? 'w-72' : 'w-20'
        }`}>
        {/* Sidebar Header with Collapse Button */}
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-6 dark:border-slate-800">
          {sidebarExpanded && (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-700 font-bold text-white shadow-soft dark:bg-teal-600 text-sm">
                EA
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-sm font-bold tracking-tight text-navy-800 dark:text-slate-100 truncate">
                  ExporTrack-AI
                </h1>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  Logistics Intelligence
                </p>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className="focus-ring inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800/50 transition-colors"
            title={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
            aria-label={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <AppIcon
              name={sidebarExpanded ? 'chevron-left' : 'chevron-right'}
              className="h-4 w-4"
            />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent dark:scrollbar-thumb-slate-600">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `focus-ring nav-item-hover relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group ${isActive
                  ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400 border-l-4 border-l-teal-500 pl-2.5 active'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-100 border-l-4 border-l-transparent'
                }`
              }
              title={!sidebarExpanded ? item.label : ''}
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700/50 transition-colors nav-icon-scale">
                <AppIcon name={item.icon} className="h-4 w-4" />
              </span>
              {sidebarExpanded && (
                <span className="min-w-0 flex-1 truncate">
                  {item.label}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer - User Info */}
        {sidebarExpanded && (
          <div className="border-t border-slate-200 px-4 py-4 dark:border-slate-800">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
              <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-500 dark:text-slate-400">
                Active Role
              </p>
              <p className="mt-1 text-sm font-semibold text-navy-700 dark:text-teal-400 truncate">
                {user?.role ?? 'Staff'}
              </p>
              <p className="mt-2 break-all text-[10px] text-slate-500 dark:text-slate-400">
                {user?.email}
              </p>
              <div className="mt-3 rounded-lg border border-teal-100 bg-white px-2 py-1.5 dark:border-teal-900/30 dark:bg-slate-900">
                <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-500 dark:text-slate-400">
                  Unread Alerts
                </p>
                <p className="mt-0.5 text-xs font-bold text-teal-700 dark:text-teal-400">
                  {unreadCount}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Minimized Sidebar Indicator */}
        {!sidebarExpanded && (
          <div className="border-t border-slate-200 px-3 py-4 dark:border-slate-800">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                {unreadCount}
              </span>
            </div>
          </div>
        )}
      </aside>

      <div className={`transition-all duration-300 ease-in-out ${sidebarExpanded ? 'md:pl-72' : 'md:pl-20'
        }`}>
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-8">
            {/* Left Section */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Mobile Menu Button */}
              <button
                type="button"
                className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors md:hidden"
                onClick={() => setMenuOpen((value) => !value)}
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              >
                {menuOpen ? (
                  <AppIcon name="x" className="h-5 w-5" />
                ) : (
                  <AppIcon name="menu" className="h-5 w-5" />
                )}
              </button>

              {/* Global Search Bar */}
              <div className="relative max-w-md w-full hidden sm:block" ref={searchRef}>
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <AppIcon name="search" className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search shipments, docs..."
                  className="input-field pl-10 h-10 text-xs w-full font-medium"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchResults(true);
                  }}
                  onFocus={() => setShowSearchResults(true)}
                />

                {/* Search Results Dropdown */}
                {showSearchResults && searchQuery.trim() && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-50 animate-slide-up">
                    <div className="p-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Results</p>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {filteredResults.length > 0 ? (
                        filteredResults.map((res, i) => (
                          <button
                            key={i}
                            onClick={() => handleResultClick(res.path)}
                            className="w-full flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left group"
                          >
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="text-xs font-bold text-navy-800 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 truncate">
                                {res.title}
                              </span>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                {res.subtitle}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded whitespace-nowrap">
                                {res.type}
                              </span>
                              <StatusBadge value={res.status} />
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="p-8 text-center">
                          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            No results
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Current Page Title (Hidden on Mobile) */}
              <div className="hidden lg:block ml-4">
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500">ExporTrack</p>
                <p className="text-sm font-bold text-navy-800 dark:text-slate-100 truncate">
                  {currentNav?.label ?? 'Dashboard'}
                </p>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="focus-ring flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-teal-400 dark:hover:bg-slate-700 transition-all active:scale-95"
                title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
                aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                <AppIcon name={theme === 'dark' ? 'sun' : 'moon'} className="h-5 w-5" />
              </button>

              {/* Notifications Button */}
              <div ref={notificationRef} className="relative">
                <button
                  type="button"
                  onClick={() => setNotificationPanelOpen(!notificationPanelOpen)}
                  className="btn-secondary btn-sm md:text-sm relative group"
                  title="View notifications"
                  aria-expanded={notificationPanelOpen}
                  aria-label="View notifications"
                >
                  <AppIcon name="bell" className="h-4 w-4" />
                  <span className="hidden sm:inline">Alerts</span>
                  {unreadCount > 0 && (
                    <span className="ml-1 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <NotificationPanel
                  notifications={notifications}
                  isOpen={notificationPanelOpen}
                  onClose={() => setNotificationPanelOpen(false)}
                />
              </div>

              {/* User Profile Dropdown */}
              <UserProfileDropdown />
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {menuOpen && (
            <nav className="border-t border-slate-200 bg-white px-4 pb-4 pt-3 dark:border-slate-800 dark:bg-slate-900 md:hidden">
              <div className="grid grid-cols-3 gap-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `focus-ring flex flex-col items-center gap-1 rounded-lg px-2 py-3 text-center text-xs font-medium transition-all ${isActive
                        ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                      }`
                    }
                  >
                    <AppIcon name={item.icon} className="h-5 w-5" />
                    <span className="line-clamp-2">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </nav>
          )}
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </main>
      </div>

      {/* Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </div>
  );
}
