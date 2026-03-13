import AppIcon from './AppIcon';

interface ChartData {
    month: string;
    value: number;
    previous?: number;
}

interface ShipmentAnalyticsProps {
    monthlyData: ChartData[];
    totalShipments: number;
    activeShipments: number;
    complianceRate: number;
    delayedShipments: number;
}

export default function ShipmentAnalytics({
    monthlyData,
    totalShipments,
    activeShipments,
    complianceRate,
    delayedShipments
}: ShipmentAnalyticsProps) {
    // Normalize chart data for visualization
    const maxValue = Math.max(...monthlyData.map((d) => d.value)) || 1;

    return (
        <div className="space-y-6">
            {/* Monthly Chart */}
            <article className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 relative overflow-hidden group shadow-md transition-all hover:shadow-lg h-full flex flex-col">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="relative">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-slate-100">Volume Analytics</h3>
                            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest">Throughput (Last 6 Months)</p>
                        </div>
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400 shadow-sm transition-transform hover:scale-105">
                            <AppIcon name="shipments" className="h-5 w-5" strokeWidth={2.5} />
                        </div>
                    </div>

                    {/* Chart Area */}
                    <div className="relative flex-1">
                        <div className="flex items-end justify-between gap-2 h-36 px-2">
                            {monthlyData.map((data, idx) => {
                                const heightPercent = (data.value / maxValue) * 100;
                                const isPeak = data.value === maxValue;

                                return (
                                    <div key={idx} className="group/bar relative flex flex-1 flex-col items-center gap-3 h-full justify-end">
                                        {/* Tooltip on hover */}
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 rounded-lg bg-slate-900 dark:bg-slate-800 border border-slate-800 dark:border-slate-700 px-3 py-1.5 text-[10px] font-black text-white opacity-0 transition-all duration-200 group-hover/bar:opacity-100 group-hover/bar:-translate-y-1 z-10 shadow-xl pointer-events-none">
                                            {data.value}
                                        </div>

                                        <div className="relative w-full flex items-end justify-center h-full">
                                            <div
                                                className={`w-full max-w-[40px] rounded-t-lg transition-all duration-500 ease-out group-hover/bar:bg-teal-400 dark:group-hover/bar:bg-teal-500 ${isPeak
                                                        ? 'bg-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.3)]'
                                                        : 'bg-slate-200 dark:bg-slate-800'
                                                    }`}
                                                style={{ height: `${Math.max(heightPercent, 12)}%` }}
                                            />
                                            {isPeak && (
                                                <div className="absolute -top-2 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse shadow-[0_0_10px_rgba(45,212,191,0.8)]" />
                                            )}
                                        </div>

                                        <div className="flex flex-col items-center mt-2">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 group-hover/bar:text-slate-900 dark:group-hover/bar:text-slate-300 transition-colors">
                                                {data.month}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Chart Footer Stats */}
                        <div className="mt-8 grid grid-cols-3 gap-6 border-t border-slate-200/60 pt-6 dark:border-slate-800/60">
                            <div className="flex flex-col items-center text-center">
                                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Average</span>
                                <span className="mt-1 text-lg font-black text-slate-900 dark:text-white tracking-tight">
                                    {Math.round(monthlyData.reduce((sum, d) => sum + d.value, 0) / (monthlyData.length || 1))}
                                </span>
                            </div>
                            <div className="relative flex flex-col items-center text-center">
                                <div className="absolute -left-3 top-1/2 -translate-y-1/2 h-8 w-px bg-slate-200/60 dark:bg-slate-800/60" />
                                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Peak Rate</span>
                                <span className="mt-1 text-lg font-black text-teal-600 dark:text-teal-400 tracking-tight">{maxValue}</span>
                                <div className="absolute -right-3 top-1/2 -translate-y-1/2 h-8 w-px bg-slate-200/60 dark:bg-slate-800/60" />
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Net Growth</span>
                                <span className="mt-1 flex items-center gap-1 text-lg font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                                    <AppIcon name="trend-up" className="h-4 w-4" strokeWidth={3} />
                                    +12%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </article>

            {/* Quick Summary Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Base', val: totalShipments, icon: 'shipments', color: 'text-blue-600', bg: 'bg-blue-500/10' },
                    { label: 'Active Pipeline', val: activeShipments, icon: 'clock', color: 'text-amber-600', bg: 'bg-amber-500/10' },
                    { label: 'Doc Health', val: `${complianceRate}%`, icon: 'check', color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
                    { label: 'Risk Flags', val: delayedShipments, icon: 'warning', color: 'text-rose-600', bg: 'bg-rose-500/10' }
                ].map(card => (
                    <div key={card.label} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 flex flex-col gap-3 group shadow-md transition-all hover:shadow-lg relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-100/50 to-transparent dark:from-slate-800/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                        <div className="relative">
                            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl shadow-sm transition-transform group-hover:scale-110 ${card.bg} ${card.color}`}>
                                <AppIcon name={card.icon as any} className="h-5 w-5" strokeWidth={2.5} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{card.label}</p>
                                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">{card.val}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
