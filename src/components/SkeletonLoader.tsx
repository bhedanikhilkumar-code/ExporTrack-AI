export interface SkeletonLoaderProps {
    className?: string;
    count?: number;
}

export function SkeletonCard({ className = '', count = 1 }: SkeletonLoaderProps) {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className={`card-premium relative overflow-hidden ${className}`}
                >
                    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/5" />
                    <div className="space-y-4 relative z-10">
                        <div className="h-4 w-32 rounded bg-slate-200/80 dark:bg-slate-800" />
                        <div className="space-y-2">
                            <div className="h-3 w-full rounded bg-slate-100/80 dark:bg-slate-800/50" />
                            <div className="h-3 w-4/5 rounded bg-slate-100/80 dark:bg-slate-800/50" />
                        </div>
                    </div>
                </div>
            ))}
        </>
    );
}

export function SkeletonKpiCard() {
    return (
        <div className="kpi-card relative overflow-hidden bg-white dark:bg-slate-900/60 transition-none hover:transform-none">
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/5" />
            <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between">
                    <div className="h-3 w-16 rounded bg-slate-200/80 dark:bg-slate-800" />
                    <div className="h-10 w-10 rounded-xl bg-slate-100/80 dark:bg-slate-800" />
                </div>
                <div className="h-8 w-24 rounded bg-slate-200/80 dark:bg-slate-800" />
                <div className="h-2 w-32 rounded bg-slate-100/80 dark:bg-slate-800/50" />
            </div>
        </div>
    );
}

export function SkeletonTable() {
    return (
        <div className="card-premium overflow-hidden relative p-0">
             <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/5 z-0" />
             <div className="relative z-10">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div
                        key={i}
                        className="flex items-center gap-4 border-b border-slate-100/80 p-5 dark:border-slate-800/50 last:border-b-0"
                    >
                        <div className="h-4 w-4 rounded bg-slate-200/80 dark:bg-slate-800 shrink-0" />
                        <div className="flex-1 space-y-2">
                            <div className="h-3 w-1/3 rounded bg-slate-200/80 dark:bg-slate-800" />
                            <div className="h-2 w-1/2 rounded bg-slate-100/80 dark:bg-slate-800/50" />
                        </div>
                        <div className="h-3 w-16 rounded bg-slate-100/80 dark:bg-slate-800/50 shrink-0" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function SkeletonLine({ className = '' }: { className?: string }) {
    return <div className={`relative overflow-hidden rounded bg-slate-200/80 dark:bg-slate-800 ${className}`}>
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/5" />
    </div>;
}

export function SkeletonChart() {
    return (
        <div className="card-premium h-80 flex flex-col justify-end gap-3 p-6 relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/5 z-0" />
            <div className="relative z-10 flex items-end justify-between gap-2 h-40">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="w-full rounded-t-lg bg-slate-200/50 dark:bg-slate-800/80" style={{ height: `${Math.random() * 80 + 20}%` }} />
                ))}
            </div>
            <div className="relative z-10 flex justify-between mt-4 border-t border-slate-100/80 dark:border-slate-800/50 pt-4">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-2 w-8 rounded bg-slate-200/80 dark:bg-slate-800" />
                ))}
            </div>
        </div>
    );
}

export function SkeletonDetailSection() {
    return (
        <div className="card-premium space-y-6 p-6 relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/5 z-0" />
            <div className="relative z-10 flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-slate-200/80 dark:bg-slate-800 shrink-0" />
                <div className="space-y-2 flex-1">
                    <div className="h-3 w-32 rounded bg-slate-200/80 dark:bg-slate-800" />
                    <div className="h-2 w-24 rounded bg-slate-100/80 dark:bg-slate-800/50" />
                </div>
            </div>
            <div className="relative z-10 space-y-4 pt-4 border-t border-slate-100/80 dark:border-slate-800/50">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="space-y-2">
                        <div className="h-3 w-1/4 rounded bg-slate-200/80 dark:bg-slate-800" />
                        <div className="h-4 w-full rounded bg-slate-100/80 dark:bg-slate-800/50" />
                    </div>
                ))}
            </div>
        </div>
    );
}
