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
                    className={`rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 ${className}`}
                >
                    <div className="space-y-4">
                        <div className="h-4 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                        <div className="space-y-2">
                            <div className="h-3 w-full animate-pulse rounded bg-slate-100 dark:bg-slate-800/50" />
                            <div className="h-3 w-4/5 animate-pulse rounded bg-slate-100 dark:bg-slate-800/50" />
                        </div>
                    </div>
                </div>
            ))}
        </>
    );
}

export function SkeletonKpiCard() {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="h-3 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                    <div className="h-8 w-8 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
                </div>
                <div className="h-8 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-2 w-32 animate-pulse rounded bg-slate-100 dark:bg-slate-800/50" />
            </div>
        </div>
    );
}

export function SkeletonTable() {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
                <div
                    key={i}
                    className="flex items-center gap-4 border-b border-slate-100 p-4 dark:border-slate-800/50 last:border-b-0"
                >
                    <div className="h-4 w-4 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                    <div className="flex-1 space-y-2">
                        <div className="h-3 w-1/3 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                        <div className="h-2 w-1/2 animate-pulse rounded bg-slate-100 dark:bg-slate-800/50" />
                    </div>
                    <div className="h-3 w-16 animate-pulse rounded bg-slate-100 dark:bg-slate-800/50" />
                </div>
            ))}
        </div>
    );
}

export function SkeletonLine({ className = '' }: { className?: string }) {
    return <div className={`animate-pulse rounded bg-slate-200 dark:bg-slate-800 ${className}`} />;
}
