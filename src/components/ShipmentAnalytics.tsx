import { memo } from 'react';
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

const ShipmentAnalytics = memo(({
    monthlyData,
    totalShipments,
    activeShipments,
    complianceRate,
    delayedShipments
}: ShipmentAnalyticsProps) => {
    // Normalize chart data for visualization
    const maxValue = Math.max(...monthlyData.map((d) => d.value)) || 1;

    return (
        <div className="dashboard-chart-container space-y-6">
            {/* Monthly Chart */}
            <article className="card-premium relative overflow-hidden group flex flex-col">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="relative flex-1 flex flex-col">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                        <div>
                            <h3 className="section-title text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-slate-100">Volume Analytics</h3>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2 uppercase tracking-wide ml-4">Throughput (Last 6 Months)</p>
                        </div>
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400 shadow-sm transition-transform hover:scale-105">
                            <AppIcon name="shipments" className="h-5 w-5" strokeWidth={2.5} />
                        </div>
                    </div>

                    {/* Chart Area */}
                    <div className="relative flex-1 flex flex-col justify-end">
                        <div className="flex items-end justify-between gap-1 md:gap-2 h-40 md:h-48 px-1 md:px-2 pb-4">
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
                                                className={`w-full max-w-[32px] md:max-w-[48px] rounded-t-lg transition-all duration-500 ease-out group-hover/bar:bg-teal-400 dark:group-hover/bar:bg-teal-500 ${isPeak
                                                    ? 'bg-gradient-to-t from-teal-600 to-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.3)]'
                                                    : 'bg-slate-200 dark:bg-slate-700/60'
                                                    }`}
                                                style={{ height: `${Math.max(heightPercent, 12)}%` }}
                                            />
                                            {isPeak && (
                                                <div className="absolute -top-2 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse shadow-[0_0_10px_rgba(45,212,191,0.8)]" />
                                            )}
                                        </div>

                                        <div className="flex flex-col items-center mt-2">
                                            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 group-hover/bar:text-slate-900 dark:group-hover/bar:text-slate-300 transition-colors break-words text-center">
                                                {data.month}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Chart Footer Stats */}
                        <div className="mt-8 grid grid-cols-3 gap-2 sm:gap-6 border-t border-slate-200/60 pt-6 dark:border-slate-800/60">
                            <div className="flex flex-col items-center text-center">
                                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Average</span>
                                <span className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                                    {Math.round(monthlyData.reduce((sum, d) => sum + d.value, 0) / (monthlyData.length || 1))}
                                </span>
                            </div>
                            <div className="relative flex flex-col items-center text-center">
                                <div className="absolute -left-3 top-1/2 -translate-y-1/2 h-8 w-px bg-slate-200/60 dark:bg-slate-800/60" />
                                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Peak Rate</span>
                                <span className="mt-1 text-lg font-extrabold text-teal-600 dark:text-teal-400 tracking-tight">{maxValue}</span>
                                <div className="absolute -right-3 top-1/2 -translate-y-1/2 h-8 w-px bg-slate-200/60 dark:bg-slate-800/60" />
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Net Growth</span>
                                <span className="mt-1 flex items-center gap-1 text-lg font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
                                    <AppIcon name="trend-up" className="h-4 w-4" strokeWidth={3} />
                                    +12%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </article>

            {/* Quick Summary Grid */}
            <div className="dashboard-grid-secondary">
                {[
                    { label: 'Total Base', val: totalShipments, icon: 'shipments', color: 'text-blue-600', bg: 'bg-blue-500/10' },
                    { label: 'Active Pipeline', val: activeShipments, icon: 'clock', color: 'text-amber-600', bg: 'bg-amber-500/10' },
                    { label: 'Doc Health', val: `${complianceRate}%`, icon: 'check', color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
                    { label: 'Risk Flags', val: delayedShipments, icon: 'warning', color: 'text-rose-600', bg: 'bg-rose-500/10' }
                ].map(card => (
                    <div key={card.label} className="bg-white dark:bg-slate-900/80 p-4 sm:p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 flex flex-col gap-3 group shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-100/50 to-transparent dark:from-slate-800/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                        <div className="relative">
                            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl shadow-sm transition-transform group-hover:scale-110 ${card.bg} ${card.color}`}>
                                <AppIcon name={card.icon as any} className="h-5 w-5" strokeWidth={2.5} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{card.label}</p>
                                <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1" style={{ letterSpacing: '-0.03em' }}>{card.val}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});

export default ShipmentAnalytics;
