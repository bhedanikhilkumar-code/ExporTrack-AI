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
    | 'check';
  className?: string;
}

const iconMap: Record<AppIconProps['name'], string> = {
  dashboard:
    'M3 13.5h8.5V3H3v10.5Zm0 7.5h8.5v-5H3v5Zm11.5 0H23V10.5h-8.5V21Zm0-18v4.5H23V3h-8.5Z',
  shipments: 'M2.5 8.5 12 3l9.5 5.5v7L12 21l-9.5-5.5v-7Zm9.5 3.5 9.5-5.5M12 12 2.5 6.5M12 21v-9',
  create:
    'M12 4v16M4 12h16M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9Z',
  upload: 'M12 15.5V4m0 0-4 4m4-4 4 4M4 15.5V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3.5',
  verification: 'M4 12.5 9.5 18 20 6.5M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9',
  notifications: 'M6 10a6 6 0 1 1 12 0v4l1.5 3H4.5L6 14v-4Zm3.5 9a2.5 2.5 0 0 0 5 0',
  team: 'M16.5 20v-1.5a4 4 0 0 0-4-4h-6a4 4 0 0 0-4 4V20M9.5 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm10 10v-1a3 3 0 0 0-2.5-2.95M15 4.5a3.5 3.5 0 0 1 0 5.5',
  clock: 'M12 7v5l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  warning: 'M12 9.5v4m0 3h.01M10.3 4.1 2.7 18a2 2 0 0 0 1.75 3h15.1A2 2 0 0 0 21.3 18L13.7 4.1a2 2 0 0 0-3.4 0Z',
  check: 'M5 12.5 10 17l9-10'
};

export default function AppIcon({ name, className }: AppIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? 'h-4 w-4'}
      aria-hidden
    >
      <path d={iconMap[name]} />
    </svg>
  );
}
