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
        if (title.includes('created')) return 'create';
        if (title.includes('Verified')) return 'check';
        if (title.includes('Rejected')) return 'cross';
        if (title.includes('Uploaded')) return 'upload';
        if (title.includes('note')) return 'notifications';
        return 'notifications';
    };

    const getEventColor = (title: string) => {
        if (title.includes('Verified')) return { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' };
        if (title.includes('Rejected')) return { bg: 'bg-rose-100', text: 'text-rose-700', dot: 'bg-rose-500' };
        if (title.includes('created')) return { bg: 'bg-teal-100', text: 'text-teal-700', dot: 'bg-teal-500' };
        if (title.includes('Uploaded')) return { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' };
        return { bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-500' };
    };

    return (
        <div className="card-surface p-6">
            <div className="flex items-center gap-2 mb-6">
                <AppIcon name="clock" className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                <h3 className="text-lg font-bold text-navy-800 dark:text-slate-100">Activity Timeline</h3>
            </div>

            <div className="space-y-4">
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
                            <div key={event.id} className="flex gap-4">
                                {/* Timeline line and dot */}
                                <div className="flex flex-col items-center">
                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${colors.bg} ${colors.text}`}>
                                        <AppIcon name={icon} className="h-4 w-4" />
                                    </div>
                                    {index < events.length - 1 && (
                                        <div className="w-0.5 h-12 bg-gradient-to-b from-slate-300 to-slate-200 dark:from-slate-700 dark:to-slate-800 my-2" />
                                    )}
                                </div>

                                {/* Event content */}
                                <div className="flex-1 pt-2">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-sm font-semibold text-navy-800 dark:text-slate-100">
                                            {event.title}
                                        </p>
                                        <span className="text-xs text-slate-500 dark:text-slate-400">
                                            {formattedTime}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                                        {event.note}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-8">
                        <p className="text-sm text-slate-500 dark:text-slate-400">No activity yet</p>
                    </div>
                )}
            </div>
        </div>
    );
}
