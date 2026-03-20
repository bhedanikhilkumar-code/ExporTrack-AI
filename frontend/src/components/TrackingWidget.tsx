/**
 * Tracking Widget — Small dashboard widget showing active trackings
 */
import { Link } from 'react-router-dom';
import AppIcon from './AppIcon';
import { TrackingInfo, STATUS_COLORS, STATUS_LABELS } from '../types/tracking';

interface TrackingWidgetProps {
  trackings: TrackingInfo[];
  maxItems?: number;
}

export default function TrackingWidget({ trackings, maxItems = 5 }: TrackingWidgetProps) {
  const active = trackings
    .filter(t => t.status !== 'delivered' && t.status !== 'returned')
    .slice(0, maxItems);

  return (
    <div className="card-premium p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          Active Trackings
        </h3>
        <Link to="/live-tracking" className="text-[10px] font-bold text-teal-600 hover:text-teal-500 flex items-center gap-1">
          View All <AppIcon name="chevron-right" className="h-3 w-3" />
        </Link>
      </div>

      {active.length === 0 ? (
        <p className="text-xs text-slate-500 py-4 text-center">No active trackings</p>
      ) : (
        <div className="space-y-3">
          {active.map(t => {
            const sc = STATUS_COLORS[t.status];
            return (
              <div key={t.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <div className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${sc.dot} ${t.status === 'in_transit' ? 'animate-pulse' : ''}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate">{t.trackingNumber}</p>
                  <p className="text-[9px] text-slate-500 truncate">{t.carrier} • {t.currentLocation || t.destination}</p>
                </div>
                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${sc.bg} ${sc.text}`}>
                  {STATUS_LABELS[t.status]}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
