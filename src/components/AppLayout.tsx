import { useState, useMemo, useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import AppIcon from './AppIcon';
import StatusBadge from './StatusBadge';
import NotificationPanel from './NotificationPanel';
import CommandPalette from './CommandPalette';
import UserProfileDropdown from './UserProfileDropdown';
import { useScrollDirection } from '../hooks/useScrollDirection';
import MobileBottomNav from './MobileBottomNav';
import MobileFAB from './MobileFAB';
import MobileSidebar from './MobileSidebar';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/analytics', label: 'Analytics', icon: 'bar-chart' },
  { to: '/shipments', label: 'Shipments', icon: 'shipments' },
  { to: '/shipments/create', label: 'Create Shipment', icon: 'create' },
  { to: '/documents/upload', label: 'Upload Docs', icon: 'upload' },
  { to: '/document-ocr', label: 'Document OCR', icon: 'ai-extract' },
  { to: '/ai-extraction', label: 'AI Extraction', icon: 'ai-extract' },
  { to: '/ai-validator', label: 'AI Validator', icon: 'verification' },
  { to: '/ai-compliance', label: 'AI Compliance', icon: 'shield' },
  { to: '/verification', label: 'Verification', icon: 'verification' },
  { to: '/notifications', label: 'Notifications', icon: 'notifications' },
  { to: '/team-workspace', label: 'Team Workspace', icon: 'users' },
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

  const isHeaderVisible = useScrollDirection();

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
      <aside className={`fixed inset-y-0 left-0 z-20 hidden border-r border-slate-200/60 bg-white/90 backdrop-blur-2xl dark:border-slate-800/60 dark:bg-slate-950/90 md:flex md:flex-col transition-all duration-300 ease-in-out shadow-sm ${sidebarExpanded ? 'w-64' : 'w-20'
        }`}>
        {/* Sidebar Header with Collapse Button */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-slate-200/60 dark:border-slate-800/60">
          {sidebarExpanded ? (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl shadow-md overflow-hidden bg-white">
                <img src="/logo.png" alt="ExporTrack-AI Logo" className="h-full w-full object-cover" />
              </div>
              <h1 className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-slate-100 truncate">
                ExporTrack<span className="text-teal-600 dark:text-teal-400">AI</span>
              </h1>
            </div>
          ) : (
            <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-xl shadow-md overflow-hidden bg-white">
              <img src="/logo.png" alt="ExporTrack-AI Logo" className="h-full w-full object-cover" />
            </div>
          )}
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent dark:scrollbar-thumb-slate-800">
          <div className="mb-4 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400/70">
            {sidebarExpanded && "Main Menu"}
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `focus-ring relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-200 group ${isActive
                  ? 'bg-slate-900 text-white dark:bg-teal-500/10 dark:text-teal-400 shadow-md nav-link-active'
                  : 'text-slate-500 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-100'
                }`
              }
              title={!sidebarExpanded ? item.label : ''}
            >
              <AppIcon name={item.icon} className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-110 ${!sidebarExpanded ? 'mx-auto' : ''}`} />
              {sidebarExpanded && (
                <span className="min-w-0 flex-1 truncate font-bold">
                  {item.label}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer - User Info */}
        <div className="p-4 mt-auto border-t border-slate-200/60 dark:border-slate-800/60">
          <button
            type="button"
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className="flex items-center gap-3 w-full rounded-lg h-10 px-3 text-slate-400 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors group"
          >
            <AppIcon
              name={sidebarExpanded ? 'chevron-left' : 'chevron-right'}
              className="h-4 w-4 shrink-0"
            />
            {sidebarExpanded && <span className="text-xs font-bold uppercase tracking-widest">Collapse</span>}
          </button>
        </div>
      </aside>

      <div className={`transition-all duration-300 ease-in-out ${sidebarExpanded ? 'md:pl-64' : 'md:pl-20'
        }`}>
        <header className={`sticky top-0 z-10 bg-white/80 backdrop-blur-2xl border-b border-slate-200/40 dark:bg-slate-950/80 dark:border-slate-800/40 shadow-[0_1px_3px_0_rgb(0_0_0/0.03)] transition-all duration-300 ease-in-out ${
          isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
        }`}>
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-8 h-16">
            {/* Left Section */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <button
                type="button"
                className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors md:hidden"
                onClick={() => setMenuOpen((value) => !value)}
              >
                <AppIcon name={menuOpen ? 'x' : 'menu'} className="h-5 w-5" />
              </button>

              {/* Breadcrumb / Page Path */}
              <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-slate-400">
                <span className="uppercase tracking-widest text-[10px] font-bold text-slate-400/70">Workspace</span>
                <AppIcon name="chevron-right" className="h-3 w-3 text-slate-300/70 dark:text-slate-600" strokeWidth={3} />
                <span className="font-bold text-slate-900 dark:text-slate-100 text-[11px]">{currentNav?.label ?? 'Dashboard'}</span>
              </div>

              {/* Global Search Bar */}
              <div className="relative max-w-md w-full ml-4 hidden md:block" ref={searchRef}>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <AppIcon name="search" className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search everything (Ctrl+K)"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-xs font-semibold text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-100 focus:dark:bg-slate-900"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchResults(true);
                  }}
                  onFocus={() => setShowSearchResults(true)}
                />

                {/* Search Results Dropdown */}
                {showSearchResults && searchQuery.trim() && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-xl dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-50 animate-in p-1">
                    <div className="max-h-80 overflow-y-auto w-full">
                      {filteredResults.length > 0 ? (
                        filteredResults.map((res, i) => (
                          <button
                            key={i}
                            onClick={() => handleResultClick(res.path)}
                            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left group"
                          >
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 truncate">
                                {res.title}
                              </span>
                              <span className="text-[10px] text-slate-500 truncate mt-0.5">
                                {res.subtitle}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                              <span className="text-[9px] font-bold text-slate-400 uppercase bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md whitespace-nowrap">
                                {res.type}
                              </span>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="p-8 text-center flex flex-col items-center justify-center">
                          <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
                            <AppIcon name="search" className="h-5 w-5" />
                          </div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            No results found
                          </p>
                          <p className="text-[10px] text-slate-500 mt-1">Try searching for shipment IDs or document names</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <button
                onClick={toggleTheme}
                className="focus-ring flex h-11 w-11 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-all shadow-sm"
                title={theme === 'dark' ? 'Switch to Light' : theme === 'light' ? 'Switch to System' : 'Switch to Dark'}
                aria-label={theme === 'dark' ? 'Switch to light mode' : theme === 'light' ? 'Switch to system mode' : 'Switch to dark mode'}
              >
                <AppIcon name={theme === 'dark' ? 'sun' : theme === 'light' ? 'monitor' : 'moon'} className="h-4 w-4" />
              </button>

              <div ref={notificationRef} className="relative flex items-center">
                <button
                  type="button"
                  onClick={() => setNotificationPanelOpen(!notificationPanelOpen)}
                  className="flex h-11 w-11 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-all shadow-sm relative"
                  aria-label="Notifications"
                >
                  <AppIcon name="bell" className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-rose-600 text-[9px] font-bold text-white ring-2 ring-white dark:ring-slate-950 shadow-md animate-in zoom-in">
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

              <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block"></div>
              
              <UserProfileDropdown />
            </div>
          </div>
        </header>

        <MobileSidebar 
          isOpen={menuOpen} 
          onClose={() => setMenuOpen(false)} 
          navItems={navItems} 
        />

        <main className="mx-auto max-w-7xl px-4 pb-24 pt-6 md:px-8 md:pb-8 md:py-8">
          <div key={location.pathname} className="page-transition-enter">
            <Outlet />
          </div>
        </main>
      </div>

      <MobileBottomNav />
      <MobileFAB />

      {/* Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </div>
  );
}
