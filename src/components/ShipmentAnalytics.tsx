import { memo } from 'react';
import AppIcon from './AppIcon';
import { AnalyticsMetrics } from '../types';

interface ShipmentAnalyticsProps {
    data: AnalyticsMetrics;
}

const ShipmentAnalytics = memo(({ data }: ShipmentAnalyticsProps) => {
    const {
        totalShipments,
        onTimeDeliveryRate,
        delayedShipments,
        averageDeliveryTime,
        monthlyShipmentTrend,
        carrierPerformance,
        deliveryTimeDistribution
    } = data;

    const maxTrend = Math.max(...monthlyShipmentTrend.map(d => d.count)) || 1;
    const maxCarrierVal = Math.max(...carrierPerformance.map(c => c.shipments)) || 1;

    return (
        <div className="space-y-6">
            {/* Top Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Shipments', val: totalShipments, icon: 'shipments', color: 'text-indigo-600', bg: 'bg-indigo-500/10' },
                    { label: 'On-Time Rate', val: `${onTimeDeliveryRate}%`, icon: 'check', color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
                    { label: 'Delayed', val: delayedShipments, icon: 'warning', color: 'text-rose-600', bg: 'bg-rose-500/10' },
                    { label: 'Avg. Delivery', val: `${averageDeliveryTime}d`, icon: 'clock', color: 'text-amber-600', bg: 'bg-amber-500/10' }
                ].map(m => (
                    <div key={m.label} className="card-premium flex items-center gap-4">
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
                {/* Monthly Trend - Line Chart (Visual Representation) */}
                <article className="card-premium lg:col-span-2">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Shipment Trends</h3>
                            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Volume analysis (Last 6 Months)</p>
                        </div>
                        <div className="flex gap-2">
                             <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400">
                                <span className="h-2 w-2 rounded-full bg-teal-500" /> Current
                             </span>
                        </div>
                    </div>
                    
                    <div className="h-48 w-full relative flex items-end justify-between px-2">
                        {/* Simple SVG Line Representation */}
                        <svg className="absolute inset-x-0 bottom-8 h-32 w-full" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.3" />
                                    <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            <path 
                                d={`M ${monthlyShipmentTrend.map((d, i) => `${(i / (monthlyShipmentTrend.length - 1)) * 100}% ${100 - (d.count / maxTrend) * 80}`).join(' L ')} V 100 H 0 Z`} 
                                fill="url(#lineGrad)" 
                            />
                            <path 
                                d={`M ${monthlyShipmentTrend.map((d, i) => `${(i / (monthlyShipmentTrend.length - 1)) * 100}% ${100 - (d.count / maxTrend) * 80}`).join(' L ')}`} 
                                fill="none" 
                                stroke="#14b8a6" 
                                strokeWidth="3" 
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        
                        {monthlyShipmentTrend.map((d, i) => (
                            <div key={i} className="flex flex-col items-center z-10">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-2">{d.count}</span>
                                <div className="h-1.5 w-1.5 rounded-full bg-teal-500 ring-4 ring-white dark:ring-slate-900 shadow-sm" style={{ marginBottom: `${(d.count / maxTrend) * 80 - 4}px` }} />
                                <span className="text-[10px] font-black text-slate-500 uppercase">{d.month}</span>
                            </div>
                        ))}
                    </div>
                </article>

                {/* Delivery Distribution */}
                <article className="card-premium">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white mb-6">Delivery Timeline</h3>
                    <div className="space-y-4">
                        {deliveryTimeDistribution.map(d => (
                            <div key={d.range} className="group">
                                <div className="flex justify-between mb-1.5">
                                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">{d.range}</span>
                                    <span className="text-[11px] font-black text-slate-900 dark:text-white">{d.count}</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-indigo-500 rounded-full transition-all duration-1000 group-hover:bg-indigo-400"
                                        style={{ width: `${(d.count / Math.max(...deliveryTimeDistribution.map(x => x.count))) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </article>

                {/* Carrier Performance */}
                <article className="card-premium lg:col-span-3">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Carrier Performance</h3>
                        <AppIcon name="shipments" className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {carrierPerformance.map(c => (
                            <div key={c.carrier} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 transition-all hover:shadow-lg hover:-translate-y-1">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-black text-slate-900 dark:text-white">{c.carrier}</span>
                                    <div className="flex items-center gap-1">
                                        <AppIcon name="star" className="h-3 w-3 text-amber-500" />
                                        <span className="text-[11px] font-black text-amber-600">{c.rating}</span>
                                    </div>
                                </div>
                                <div className="flex items-end gap-3">
                                    <div className="flex-1 h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-teal-500"
                                            style={{ width: `${(c.shipments / maxCarrierVal) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{c.shipments} SHP</span>
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
