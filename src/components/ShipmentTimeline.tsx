import AppIcon from './AppIcon';

interface TimelineEvent {
    id: string;
    time: string;
    title: string;
    note: string;
}

interface ShipmentTimelineProps {
    events: TimelineEvent[];
}

export default function ShipmentTimeline({ events }: ShipmentTimelineProps) {
    const getEventIcon = (title: string) => {
        const t = title.toLowerCase();
        if (t.includes('created')) return 'create';
        if (t.includes('picked up')) return 'shipments';
        if (t.includes('in transit')) return 'shipments';
        if (t.includes('arrived at hub')) return 'shield';
        if (t.includes('out for delivery')) return 'clock';
        if (t.includes('delivered')) return 'check';
        if (t.includes('verified')) return 'check';
        if (t.includes('rejected')) return 'cross';
        if (t.includes('uploaded')) return 'upload';
        return 'notifications';
    };

    const getEventColor = (title: string) => {
        const t = title.toLowerCase();
        if (t.includes('verified') || t.includes('delivered')) 
            return { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' };
        if (t.includes('rejected') || t.includes('delayed')) 
            return { bg: 'bg-rose-100', text: 'text-rose-700', dot: 'bg-rose-500' };
        if (t.includes('created') || t.includes('picked up')) 
            return { bg: 'bg-teal-100', text: 'text-teal-700', dot: 'bg-teal-500' };
        if (t.includes('in transit') || t.includes('out for delivery')) 
            return { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' };
        if (t.includes('arrived at hub')) 
            return { bg: 'bg-indigo-100', text: 'text-indigo-700', dot: 'bg-indigo-500' };
        return { bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-500' };
    };

    return (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 relative overflow-hidden group shadow-sm transition-all hover:shadow-md">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-100/50 to-transparent dark:from-slate-800/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <div className="relative">
                <div className="flex items-center gap-3 mb-8">
                    <div className="h-10 w-10 rounded-xl bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center shadow-sm">
                        <AppIcon name="clock" className="h-5 w-5 text-teal-600 dark:text-teal-400" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Activity Timeline</h3>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-0.5">Recent Events</p>
                    </div>
                </div>

                <div className="space-y-0 pl-2">
                    {events.length > 0 ? (
                        events.map((event, index) => {
                            const colors = getEventColor(event.title);
                            const icon = getEventIcon(event.title);
                            const eventDate = new Date(event.time);
                            const formattedTime = eventDate.toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            });

                            return (
                                <div key={event.id} className="relative flex gap-5 group/item">
                                    {/* Timeline line and dot */}
                                    <div className="flex flex-col items-center">
                                        <div className={`relative z-10 h-10 w-10 shrink-0 rounded-2xl flex items-center justify-center transition-transform group-hover/item:scale-110 shadow-sm border border-white dark:border-slate-900 ${colors.bg} ${colors.text}`}>
                                            <AppIcon name={icon as any} className="h-4 w-4" strokeWidth={2.5} />
                                        </div>
                                        {index < events.length - 1 && (
                                            <div className="w-[2px] flex-1 bg-gradient-to-b from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-800 my-1 rounded-full group-hover/item:from-teal-200 dark:group-hover/item:from-teal-800 transition-colors duration-300" />
                                        )}
                                    </div>

                                    {/* Event content */}
                                    <div className={`flex-1 pb-8 ${index === events.length - 1 ? 'pb-2' : ''}`}>
                                        <div className="bg-slate-50/50 dark:bg-slate-800/30 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 transition-all group-hover/item:bg-white dark:group-hover/item:bg-slate-800/50 group-hover/item:shadow-sm">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                                                <p className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                                                    {event.title}
                                                </p>
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 shrink-0">
                                                    {formattedTime}
                                                </span>
                                            </div>
                                            {event.note && (
                                                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
                                                    {event.note}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-12 px-4 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30">
                            <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500">
                                <AppIcon name="clock" className="h-6 w-6" />
                            </div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">No activity yet</p>
                            <p className="text-xs text-slate-500 mt-1">Events will appear here as the shipment progresses.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
