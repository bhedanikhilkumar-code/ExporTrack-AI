/**
 * Tracking Timeline Component
 * Vertical timeline showing tracking events with color-coded status
 */
import AppIcon from './AppIcon';
import { TrackingEventItem, TrackingStatus, STATUS_COLORS, STATUS_LABELS } from '../types/tracking';

interface TrackingTimelineProps {
  events: TrackingEventItem[];
  status: TrackingStatus;
  currentLocation?: string;
  estimatedDelivery?: string;
  lastUpdated: string;
  onRefresh?: () => void;
}

export default function TrackingTimeline({ events, status, currentLocation, estimatedDelivery, lastUpdated, onRefresh }: TrackingTimelineProps) {
  const statusStyle = STATUS_COLORS[status];
  const timeSince = getTimeSince(lastUpdated);

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <div className={`rounded-2xl p-5 ${statusStyle.bg} border border-opacity-20`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-4 w-4 rounded-full ${statusStyle.dot} ${status === 'in_transit' ? 'animate-pulse' : ''}`} />
            <div>
              <p className={`text-lg font-black ${statusStyle.text}`}>{STATUS_LABELS[status]}</p>
              {currentLocation && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Current: {currentLocation}</p>}
            </div>
          </div>
          <div className="text-right">
            {estimatedDelivery && (
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">ETA: {estimatedDelivery}</p>
            )}
            <p className="text-[10px] text-slate-400 mt-1">Updated {timeSince}</p>
            {onRefresh && (
              <button onClick={onRefresh} className="mt-2 text-[10px] font-bold text-teal-600 hover:text-teal-500 inline-flex items-center gap-1">
                <AppIcon name="refresh-cw" className="h-3 w-3" /> Refresh
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative pl-6">
        {/* Vertical line */}
        <div className="absolute left-[11px] top-2 bottom-2 w-px bg-slate-200 dark:bg-slate-700" />

        {events.map((event, idx) => {
          const isFirst = idx === 0;
          const dotColor = isFirst ? statusStyle.dot : 'bg-slate-300 dark:bg-slate-600';

          return (
            <div key={idx} className="relative pb-6 last:pb-0">
              <div className={`absolute left-[-14px] top-1.5 h-3 w-3 rounded-full border-2 border-white dark:border-slate-900 ${dotColor} ${isFirst ? 'ring-4 ring-opacity-20 ' + dotColor.replace('bg-', 'ring-') : ''}`} />
              <div className="ml-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className={`text-xs font-bold ${isFirst ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                      {event.description}
                    </p>
                    {event.location && (
                      <p className="text-[10px] text-slate-500 dark:text-slate-500 mt-0.5 flex items-center gap-1">
                        <AppIcon name="map-pin" className="h-2.5 w-2.5" /> {event.location}
                      </p>
                    )}
                  </div>
                  <time className="text-[10px] font-medium text-slate-400 tabular-nums whitespace-nowrap">
                    {formatEventTime(event.timestamp)}
                  </time>
                </div>
              </div>
            </div>
          );
        })}

        {events.length === 0 && (
          <div className="ml-4 py-8 text-center">
            <p className="text-xs text-slate-500">No tracking events yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

function getTimeSince(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatEventTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ' ' +
    d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}
