interface AppIconProps {
  name:
  | 'dashboard'
  | 'shipments'
  | 'create'
  | 'upload'
  | 'verification'
  | 'notifications'
  | 'team'
  | 'clock'
  | 'warning'
  | 'check'
  | 'ai-extract'
  | 'sun'
  | 'moon'
  | 'search'
  | 'shield'
  | 'cross'
  | 'chevron-left'
  | 'chevron-right'
  | 'chevronUp'
  | 'chevronDown'
  | 'x'
  | 'menu'
  | 'bell'
  | 'logout'
  | 'google'
  | 'file'
  | 'alert'
  | 'arrow-right'
  | 'user'
  | 'settings'
  | 'trend-up'
  | 'trend-down'
  | 'folder';
  className?: string;
  strokeWidth?: number;
  'aria-hidden'?: boolean;
}

const iconMap: Record<AppIconProps['name'], string> = {
  dashboard: 'M3 13.5h8.5V3H3v10.5Zm0 7.5h8.5v-5H3v5Zm11.5 0H23V10.5h-8.5V21Zm0-18v4.5H23V3h-8.5Z',
  shipments: 'M2.5 8.5 12 3l9.5 5.5v7L12 21l-9.5-5.5v-7Zm9.5 3.5 9.5-5.5M12 12 2.5 6.5M12 21v-9',
  create: 'M12 4v16M4 12h16M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9Z',
  upload: 'M12 15.5V4m0 0-4 4m4-4 4 4M4 15.5V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3.5',
  verification: 'M4 12.5 9.5 18 20 6.5M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9',
  notifications: 'M6 10a6 6 0 1 1 12 0v4l1.5 3H4.5L6 14v-4Zm3.5 9a2.5 2.5 0 0 0 5 0',
  team: 'M16.5 20v-1.5a4 4 0 0 0-4-4h-6a4 4 0 0 0-4 4V20M9.5 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm10 10v-1a3 3 0 0 0-2.5-2.95M15 4.5a3.5 3.5 0 0 1 0 5.5',
  clock: 'M12 7v5l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  warning: 'M12 9.5v4m0 3h.01M10.3 4.1 2.7 18a2 2 0 0 0 1.75 3h15.1A2 2 0 0 0 21.3 18L13.7 4.1a2 2 0 0 0-3.4 0Z',
  check: 'M5 12.5 10 17l9-10',
  'ai-extract': 'M9 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm-1 11h4m-4 3h4M9 8V3.5L14.5 9H9Zm7 3.5L18 11l-2 1 1-2-1-2 2 1 2-1Z',
  sun: 'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10ZM12 1v2m0 18v2M4.2 4.2l1.4 1.4m12.8 12.8 1.4 1.4M1 12h2m18 0h2M4.2 19.8l1.4-1.4m12.8-12.8 1.4-1.4',
  moon: 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.35-4.35',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z',
  cross: 'M18 6 6 18M6 6l12 12',
  'chevron-left': 'M15 19l-7-7 7-7',
  'chevron-right': 'M9 5l7 7-7 7',
  chevronUp: 'M18 15l-6-6-6 6',
  chevronDown: 'M6 9l6 6 6-6',
  x: 'M18 6 6 18M6 6l12 12',
  menu: 'M3 6h18M3 12h18M3 18h18',
  bell: 'M6 10a6 6 0 1 1 12 0v4l1.5 3H4.5L6 14v-4Zm3.5 9a2.5 2.5 0 0 0 5 0',
  logout: 'M17 16l4-4m0 0l-4-4m4 4H9m4-13H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6',
  google: 'M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 c0-3.331,2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C15.503,2.988,13.953,2,12.545,2 C6.438,2,1.514,6.926,1.514,13s4.924,11,11.031,11c5.148,0,9.59-3.477,11.031-8.563h-6.031V10.239H12.545z',
  file: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z M14 2v6h6M9 15h6M9 19h6',
  alert: 'M12 9v6M12 21c6.627 0 12-5.373 12-12S18.627-3 12-3 0 2.373 0 9s5.373 12 12 12Zm0-15a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1Z',
  'arrow-right': 'M5 12h14M12 5l7 7-7 7',
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19.07 4.93l-1.41 1.41a5 5 0 0 0-7.07 7.07l-1.41-1.41a7 7 0 0 1 9.9-9.9ZM4.93 4.93a7 7 0 0 1 9.9 9.9l-1.41-1.41a5 5 0 0 0-7.07-7.07l-1.41-1.41Z',
  'trend-up': 'm22 7-8.5 8.5-5-5L2 17m20-10h-6m6 0v6',
  'trend-down': 'm22 17-8.5-8.5-5 5L2 7m20 10h-6m6 0v-6',
  folder: 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z',
};

export default function AppIcon({ name, className, strokeWidth, 'aria-hidden': ariaHidden }: AppIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth ?? 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? 'h-4 w-4'}
      aria-hidden={ariaHidden ?? true}
    >
      <path d={iconMap[name]} />
    </svg>
  );
}
