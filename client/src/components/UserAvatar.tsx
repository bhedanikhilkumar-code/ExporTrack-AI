import React from 'react';

interface UserAvatarProps {
  name: string;
  email?: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'none';
  className?: string;
}

const sizeClasses = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-xl',
};

const dotSizeClasses = {
  xs: 'h-2 w-2 -bottom-0.5 -right-0.5 border',
  sm: 'h-2.5 w-2.5 -bottom-0.5 -right-0.5',
  md: 'h-3 w-3 -bottom-0.5 -right-0.5',
  lg: 'h-3.5 w-3.5 -bottom-0.5 -right-0.5',
  xl: 'h-4 w-4 -bottom-1 -right-1 border-4',
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  email,
  src,
  size = 'md',
  status = 'none',
  className = '',
}) => {
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '??';

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      <div 
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center font-extrabold text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50 overflow-hidden shadow-sm`}
      >
        {src ? (
          <img src={src} alt={name} className="h-full w-full object-cover" />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      
      {status !== 'none' && (
        <div 
          className={`status-indicator ${dotSizeClasses[size]} ${
            status === 'online' 
              ? 'status-indicator-online animate-status-pulse' 
              : 'status-indicator-offline'
          }`} 
        />
      )}
    </div>
  );
};

export default UserAvatar;
