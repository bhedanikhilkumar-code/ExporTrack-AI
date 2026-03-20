import { memo } from 'react';
import AppIcon from './AppIcon';
import { AnalyticsMetrics } from '../types';
import { ShipmentAnalyticsMetrics } from '../services/analyticsService';

interface ShipmentAnalyticsProps {
    data: ShipmentAnalyticsMetrics;
}

interface MonthlyTrend {
    month: string;
    count: number;
}

interface CarrierStat {
    carrier: string;
    rating: number;
    shipments: number;
}

interface DeliveryStat {
    range: string;
    count: number;
}

const ShipmentAnalytics = memo(({ data }: ShipmentAnalyticsProps) => {
    const {
        totalShipments,
        onTimeDeliveryRate,
        delayedShipments,
        averageDeliveryTimeDays,
        monthlyShipmentTrend = [] as MonthlyTrend[],
        carrierPerformance = [] as CarrierStat[],
        deliveryTimeDistribution = [] as DeliveryStat[]
    } = data;

    const maxTrend = Math.max(...monthlyShipmentTrend.map((d: MonthlyTrend) => d.count), 1) || 1;
    const maxCarrierVal = Math.max(...carrierPerformance.map((c: CarrierStat) => c.shipments), 1) || 1;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Top Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Shipments', val: totalShipments, icon: 'shipments', color: 'text-indigo-600', bg: 'bg-indigo-500/10' },
                    { label: 'On-Time Rate', val: `${onTimeDeliveryRate}%`, icon: 'check', color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
                    { label: 'Delayed', val: delayedShipments, icon: 'warning', color: 'text-rose-600', bg: 'bg-rose-500/10' },
                    { label: 'Avg. Delivery', val: `${averageDeliveryTimeDays}d`, icon: 'clock', color: 'text-amber-600', bg: 'bg-amber-500/10' }
                ].map((m, idx) => (
                    <div 
                        key={m.label} 
                        className="card-premium flex items-center gap-4 hover:scale-[1.02] transition-transform duration-300"
                        style={{ animationDelay: `${idx * 100}ms` }}
                    >
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm ${m.bg} ${m.color}`}>
                            <AppIcon name={m.icon as any} className="h-6 w-6" strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{m.label}</p>
                            <p className="text-xl font-black text-slate-900 dark:text-white">{m.val}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Monthly Trend - Line Chart */}
                <article className="card-premium lg:col-span-2 overflow-hidden relative">
                    <div className="absolute top-0 right-0 h-32 w-32 bg-teal-500/5 blur-3xl rounded-full -mr-16 -mt-16" />
                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Shipment Trends</h3>
                            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Volume analysis (Last 6 Months)</p>
                        </div>
                        <div className="flex gap-2">
                            <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400">
                                <span className="h-2 w-2 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.6)]" /> Current
                            </span>
                        </div>
                    </div>

                    <div className="h-48 w-full relative flex items-end justify-between px-2 pt-4">
                        {/* Improved SVG Line with Gradient */}
                        <svg className="absolute inset-x-0 bottom-8 h-32 w-full" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.4" />
                                    <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            <path
                                d={`M ${monthlyShipmentTrend.map((d: MonthlyTrend, i: number) => `${(i / (monthlyShipmentTrend.length - 1)) * 100}% ${100 - (d.count / maxTrend) * 80}`).join(' L ')} V 100 H 0 Z`}
                                fill="url(#lineGrad)"
                                className="animate-in fade-in duration-1000"
                            />
                            <path
                                d={`M ${monthlyShipmentTrend.map((d: MonthlyTrend, i: number) => `${(i / (monthlyShipmentTrend.length - 1)) * 100}% ${100 - (d.count / maxTrend) * 80}`).join(' L ')}`}
                                fill="none"
                                stroke="#14b8a6"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="drop-shadow-[0_2px_8px_rgba(20,184,166,0.5)]"
                                style={{ strokeDasharray: 1000, strokeDashoffset: 1000, animation: 'draw 2s ease-out forwards' }}
                            />
                        </svg>

                        {monthlyShipmentTrend.map((d: MonthlyTrend, i: number) => (
                            <div key={i} className="flex flex-col items-center z-10 group cursor-default">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md shadow-sm">{d.count}</span>
                                <div 
                                    className="h-2.5 w-2.5 rounded-full bg-white border-2 border-teal-500 dark:bg-slate-900 shadow-md group-hover:scale-150 transition-transform duration-300 z-20" 
                                    style={{ marginBottom: `${(d.count / maxTrend) * 80 - 5}px` }} 
                                />
                                <span className="text-[10px] font-black text-slate-500 uppercase mt-2">{d.month}</span>
                            </div>
                        ))}
                    </div>
                </article>

                {/* Delivery Distribution */}
                <article className="card-premium relative overflow-hidden">
                    <div className="absolute bottom-0 left-0 h-24 w-24 bg-indigo-500/5 blur-3xl rounded-full -ml-12 -mb-12" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white mb-6 relative z-10">Delivery Timeline</h3>
                    <div className="space-y-5 relative z-10">
                        {deliveryTimeDistribution.map((d: DeliveryStat, idx) => (
                            <div key={d.range} className="group" style={{ animationDelay: `${idx * 150}ms` }}>
                                <div className="flex justify-between mb-2">
                                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 group-hover:text-indigo-500 transition-colors">{d.range}</span>
                                    <span className="text-[11px] font-black text-slate-900 dark:text-white">{d.count}</span>
                                </div>
                                <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden shadow-inner">
                                    <div
                                        className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full transition-all duration-1000 group-hover:shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                                        style={{ width: `${(d.count / Math.max(...deliveryTimeDistribution.map((x: DeliveryStat) => x.count), 1)) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </article>

                {/* Carrier Performance */}
                <article className="card-premium lg:col-span-3 border-none bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-950/50 shadow-2xl">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Carrier Performance Topology</h3>
                            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Efficiency & reliability metrics</p>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center border border-slate-100 dark:border-slate-800">
                            <AppIcon name="shipments" className="h-5 w-5 text-teal-500" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {carrierPerformance.map((c: CarrierStat, idx) => (
                            <div 
                                key={c.carrier} 
                                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100/80 dark:border-slate-800/80 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1.5 group"
                                style={{ animationDelay: `${idx * 100}ms` }}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-xs font-black text-slate-900 dark:text-white group-hover:text-teal-600 transition-colors uppercase tracking-tight">{c.carrier}</span>
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 dark:bg-amber-900/10 rounded-lg">
                                        <AppIcon name="star" className="h-3 w-3 text-amber-500 fill-amber-500" />
                                        <span className="text-[11px] font-black text-amber-600 dark:text-amber-500 tabular-nums">{c.rating}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{c.shipments} UNITS</span>
                                        <span className="text-[10px] font-black text-teal-600">{Math.round((c.shipments / maxCarrierVal) * 100)}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                        <div
                                            className="h-full bg-gradient-to-r from-teal-500 to-teal-400 group-hover:from-teal-400 group-hover:to-teal-300 transition-all duration-500"
                                            style={{ width: `${(c.shipments / maxCarrierVal) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </article>
            </div>
        </div>
    );
});

export default ShipmentAnalytics;
