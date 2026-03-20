import { memo } from 'react';

/**
 * ── Generic Skeleton Base Component ──────────────────────────────────────────
 * A flexible primitive for building custom skeletons with shimmer effects.
 */
export const Skeleton = memo(({ 
    className = '', 
    width, 
    height, 
    borderRadius = 'rounded-xl',
    shimmer = true 
}: { 
    className?: string; 
    width?: string | number; 
    height?: string | number; 
    borderRadius?: string;
    shimmer?: boolean;
}) => (
    <div 
        className={`relative overflow-hidden bg-slate-200/80 dark:bg-slate-800/60 ${borderRadius} ${className}`}
        style={{ width, height }}
    >
        {shimmer && (
            <div className="absolute inset-0 -translate-x-full animate-shimmer" />
        )}
    </div>
));

Skeleton.displayName = 'Skeleton';

/**
 * ── Specific UI Primitive Skeletons ──────────────────────────────────────────
 */

export const SkeletonAvatar = ({ size = 'h-10 w-10', circle = true }: { size?: string; circle?: boolean }) => (
    <Skeleton className={size} borderRadius={circle ? 'rounded-full' : 'rounded-xl'} />
);

export const SkeletonText = ({ width = 'w-full', height = 'h-3', lines = 1 }: { width?: string; height?: string; lines?: number }) => (
    <div className="space-y-2 w-full">
        {Array.from({ length: lines }).map((_, i) => (
            <Skeleton 
                key={i} 
                className={`${height} ${i === lines - 1 && lines > 1 ? 'w-4/5' : width}`} 
                borderRadius="rounded-md" 
            />
        ))}
    </div>
);

export const SkeletonButton = ({ size = 'h-10 w-24' }: { size?: string }) => (
    <Skeleton className={size} borderRadius="rounded-xl" />
);

/**
 * ── Compound Component Skeletons ─────────────────────────────────────────────
 */

export interface SkeletonLoaderProps {
    className?: string;
    count?: number;
}

export function SkeletonCard({ className = '', count = 1 }: SkeletonLoaderProps) {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className={`card-premium relative overflow-hidden ${className}`}>
                    <div className="absolute inset-0 -translate-x-full animate-shimmer" />
                    <div className="space-y-4 relative z-10">
                        <SkeletonText width="w-32" height="h-4" />
                        <SkeletonText lines={2} />
                    </div>
                </div>
            ))}
        </>
    );
}

export function SkeletonKpiCard() {
    return (
        <div className="kpi-card relative overflow-hidden bg-white dark:bg-slate-900/60 transition-none hover:transform-none">
            <div className="absolute inset-0 -translate-x-full animate-shimmer" />
            <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between">
                    <SkeletonText width="w-16" height="h-3" />
                    <Skeleton className="h-10 w-10" borderRadius="rounded-xl" />
                </div>
                <SkeletonText width="w-24" height="h-8" />
                <SkeletonText width="w-32" height="h-2" />
            </div>
        </div>
    );
}

export function SkeletonTable() {
    return (
        <div className="card-premium overflow-hidden relative p-0">
             <div className="relative z-10">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div
                        key={i}
                        className="flex items-center gap-4 border-b border-slate-100/80 p-5 dark:border-slate-800/50 last:border-b-0"
                    >
                        <Skeleton className="h-4 w-4" borderRadius="rounded" />
                        <div className="flex-1 space-y-2">
                            <SkeletonText width="w-1/3" height="h-3" />
                            <SkeletonText width="w-1/2" height="h-2" />
                        </div>
                        <SkeletonText width="w-16" height="h-3" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function SkeletonLine({ className = '' }: { className?: string }) {
    return <Skeleton className={className} borderRadius="rounded" />;
}

export function SkeletonChart() {
    return (
        <div className="card-premium h-80 flex flex-col justify-end gap-3 p-6 relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-shimmer z-0" />
            <div className="relative z-10 flex items-end justify-between gap-2 h-40">
                {[...Array(6)].map((_, i) => (
                    <div 
                        key={i} 
                        className="w-full rounded-t-lg bg-slate-200/50 dark:bg-slate-800/80" 
                        style={{ height: `${Math.random() * 80 + 20}%` }} 
                    />
                ))}
            </div>
            <div className="relative z-10 flex justify-between mt-4 border-t border-slate-100/80 dark:border-slate-800/50 pt-4">
                {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-2 w-8" borderRadius="rounded" />
                ))}
            </div>
        </div>
    );
}

export function SkeletonDetailSection() {
    return (
        <div className="card-premium space-y-6 p-6 relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-shimmer" />
            <div className="relative z-10 flex items-center gap-4">
                <SkeletonAvatar circle={false} />
                <div className="space-y-2 flex-1">
                    <SkeletonText width="w-32" height="h-3" />
                    <SkeletonText width="w-24" height="h-2" />
                </div>
            </div>
            <div className="relative z-10 space-y-4 pt-4 border-t border-slate-100/80 dark:border-slate-800/50">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="space-y-2">
                        <SkeletonText width="w-1/4" height="h-3" />
                        <SkeletonText width="w-full" height="h-4" />
                    </div>
                ))}
            </div>
        </div>
    );
}
