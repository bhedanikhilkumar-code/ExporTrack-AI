import { useEffect, useState, memo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useTracking } from '../hooks/useTracking';
import TrackingMap from '../components/TrackingMap';
import AppIcon from '../components/AppIcon';
import StatusBadge from '../components/StatusBadge';
import DriverTrackingPanel from '../components/DriverTrackingPanel';
import { SkeletonKpiCard, SkeletonDetailSection, SkeletonLine } from '../components/SkeletonLoader';

/* ─── Sub-Components ─────────────────────────────────────────────────── */
const TrackingKpiCard = memo(({ label, value, icon, color, bg }: any) => (
  <div className="bg-white dark:bg-slate-900/80 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 flex items-center gap-4 group shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-slate-100/50 to-transparent dark:from-slate-800/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    <div className={`relative flex h-12 w-12 items-center justify-center rounded-xl shadow-sm ${bg} ${color}`}>
      <AppIcon name={icon} className="h-6 w-6" strokeWidth={2} />
    </div>
    <div className="relative">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{label}</p>
      <p className="text-2xl font-extrabold text-slate-900 dark:text-white" style={{ letterSpacing: '-0.03em' }}>{value}</p>
    </div>
  </div>
));
TrackingKpiCard.displayName = 'TrackingKpiCard';

export default function TrackingPage() {
  const { shipmentId } = useParams<{ shipmentId: string }>();
  const { state: { shipments }, addComment, applyOptimizedRoute, triggerDelayAlert } = useAppContext();
  
  const shipment = shipments.find(s => s.id === shipmentId);
  const { trackingData, loading, error, lastPolled } = useTracking(
    shipment?.id || '', 
    shipment?.destinationCountry || 'US',
    5000 // Poll every 5 seconds for simulation purposes
  );
  
  // Trigger delay alert when AI detects a delay
  useEffect(() => {
    if (trackingData?.delayAlert?.isDelayed) {
      triggerDelayAlert(shipmentId!, trackingData.delayAlert.daysDelayed);
    }
  }, [trackingData?.delayAlert?.isDelayed, shipmentId, triggerDelayAlert]);

  const shareTracking = () => {
    const trackingNumberToShare = trackingData?.tracking_number || trackingData?.shipmentId || shipmentId;
    const url = `${window.location.origin}/track/${trackingNumberToShare}`;
    const text = encodeURIComponent(`Track your shipment live: ${url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const [showOptimizedRoute, setShowOptimizedRoute] = useState(true);

  if (!shipment) {
    return (
      <div className="card-panel">
        <h2 className="text-xl font-semibold text-navy-800 dark:text-slate-100">Shipment not found</h2>
        <Link to="/shipments" className="btn-primary mt-4">Back to Shipments</Link>
      </div>
    );
  }

  const handleApplyRoute = () => {
    if (window.confirm('Are you sure you want to apply the AI Optimized Route? This will update the vessel navigation plans.')) {
      applyOptimizedRoute(shipment.id);
      addComment(shipment.id, 'AI Optimized Route applied. New waypoint instructions sent to carrier.', true);
      alert('Optimized route applied successfully.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="grid gap-4 sm:grid-cols-3">
          <SkeletonKpiCard />
          <SkeletonKpiCard />
          <SkeletonKpiCard />
        </div>
        <SkeletonDetailSection />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in">
      {/* ── Page Header ── */}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <Link to="/shipments" className="hover:text-teal-600 transition-colors">Shipments</Link>
            <AppIcon name="chevron-right" className="h-2 w-2" />
            <Link to={`/shipments/${shipment.id}`} className="hover:text-teal-600 transition-colors">{shipment.id}</Link>
            <AppIcon name="chevron-right" className="h-2 w-2" />
            <span className="text-teal-600 dark:text-teal-500">Live Tracking</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            Active Tracking
            {trackingData?.currentStatus !== 'Delivered' && (
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
              </span>
            )}
            {trackingData?.carrier && (
              <span className="ml-2 text-sm px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800 uppercase font-bold tracking-widest hidden sm:inline-block">
                {trackingData.carrier}
              </span>
            )}
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm font-medium text-slate-500 dark:text-slate-400">
            <p className="flex items-center gap-1">
              {shipment.clientName} • Destination: {shipment.destinationCountry}
            </p>
            {trackingData?.tracking_number && (
              <p className="flex items-center gap-1">
                | Tracking #: <span className="font-mono text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1 rounded">{trackingData.tracking_number}</span>
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {lastPolled && (
             <div className="flex flex-col items-end mr-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Last Sync</span>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                   {lastPolled.toLocaleTimeString()}
                </span>
             </div>
          )}
          <button 
            onClick={shareTracking}
            className="btn-secondary flex items-center gap-2"
          >
            <AppIcon name="upload" className="h-4 w-4" />
            Share Tracking
          </button>
        </div>
      </header>

      <main className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Map Section */}
          <div className="card-premium h-[450px] overflow-hidden relative p-0 border-0 shadow-xl group">
               <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 flex flex-col gap-2 transition-all">
                  <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-slate-200/50 dark:border-slate-800/50 flex items-center gap-2 pointer-events-auto">
                    <span className="flex h-2 w-2">
                       <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-teal-400 opacity-75"></span>
                       <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Live GPS Cluster</span>
                  </div>
 
                  {/* AI Route Strategy Badge */}
                  {trackingData?.optimizedRoute && (
                    <div className="bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-xl p-3 sm:p-4 rounded-2xl shadow-2xl border border-white/10 w-[calc(100vw-2rem)] sm:max-w-xs pointer-events-auto mt-1 group/ai-panel animate-in fade-in slide-in-from-left-4">
                       <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2.5">
                             <div className="relative">
                                <div className="absolute inset-0 bg-indigo-400/20 blur-md rounded-full animate-pulse" />
                                <div className="relative flex h-6 w-6 items-center justify-center rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/20">
                                   <AppIcon name="ai-extract" className="h-3.5 w-3.5" />
                                </div>
                             </div>
                             <span className="text-[10px] font-black uppercase tracking-[0.1em] text-indigo-400">AI Strategy</span>
                          </div>
                          <button 
                            onClick={() => setShowOptimizedRoute(!showOptimizedRoute)}
                            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-lg border transition-all ${
                              showOptimizedRoute ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'border-white/20 text-white/40 hover:text-white hover:border-white/40'
                            }`}
                          >
                            {showOptimizedRoute ? 'Active' : 'Show'}
                          </button>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-4 text-white mb-4">
                          <div className="flex flex-col bg-white/5 p-2 rounded-xl">
                             <span className="text-[8px] uppercase text-slate-500 font-black tracking-widest">Time Saving</span>
                             <span className="text-sm font-black text-emerald-400 mt-0.5">-{trackingData?.optimizedRoute.savings?.time}</span>
                          </div>
                          <div className="flex flex-col bg-white/5 p-2 rounded-xl">
                             <span className="text-[8px] uppercase text-slate-500 font-black tracking-widest">Efficiency</span>
                             <span className="text-sm font-black text-indigo-400 mt-0.5">-{trackingData?.optimizedRoute.savings?.distance}</span>
                          </div>
                       </div>
 
                       <button 
                         onClick={handleApplyRoute}
                         className="w-full py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.15em] transition-all shadow-lg shadow-indigo-500/30 active:scale-[0.98]"
                       >
                         Execute Strategy
                       </button>
                    </div>
                  )}
               </div>

               <div className="absolute z-0 inset-0 h-full w-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                  {/* Fallback pattern while tiles load */}
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-teal-500 dark:border-slate-700"></div>
               </div>

               {/* The Map */}
               <TrackingMap 
                 tracking={trackingData} 
                 showOptimizedRoute={showOptimizedRoute}
                 className="relative z-[5] h-full w-full" 
               />
          </div>

          {/* Live Data Feed Cards */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <TrackingKpiCard label="Last Location" value={trackingData?.location || 'Unknown'} icon="world" color="text-teal-600 dark:text-teal-400" bg="bg-teal-500/10" />
            <TrackingKpiCard label="Next Node" value={trackingData?.next_hub || 'Not assigned'} icon="shield" color="text-indigo-600 dark:text-indigo-400" bg="bg-indigo-500/10" />
            <TrackingKpiCard label="Current Lat" value={trackingData?.latitude?.toFixed(4) || '---'} icon="ai-extract" color="text-blue-600 dark:text-blue-400" bg="bg-blue-500/10" />
            <TrackingKpiCard label="Current Lng" value={trackingData?.longitude?.toFixed(4) || '---'} icon="ai-extract" color="text-emerald-600 dark:text-emerald-400" bg="bg-emerald-500/10" />
          </section>

          <div className="grid gap-4 sm:grid-cols-3">
             {/* AI ETA Card */}
             {trackingData.aiEta && (
               <div className="card-premium border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50/50 to-white dark:from-purple-900/10 dark:to-slate-900">
                  <div className="flex items-center justify-between mb-2">
                     <div className="flex items-center gap-2">
                       <AppIcon name="ai-extract" className="h-4 w-4 text-purple-600" />
                       <h3 className="text-[10px] font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400">AI Prediction</h3>
                     </div>
                     <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                       trackingData.aiEta.confidenceScore >= 90 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30' : 
                       trackingData.aiEta.confidenceScore >= 75 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30' : 
                       'bg-rose-100 text-rose-700 dark:bg-rose-900/30'
                     }`}>
                       {trackingData.aiEta.confidenceScore}% Conf
                     </span>
                  </div>
                  <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                     {new Date(trackingData.aiEta.predictedArrival).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                  {trackingData.delayAlert?.isDelayed && (
                    <p className="text-[10px] font-bold text-rose-500 uppercase flex items-center gap-1 mt-1">
                      <AppIcon name="warning" className="h-3 w-3" />
                      Delay Detected
                    </p>
                  )}
               </div>
             )}
             <div className="card-premium border-l-4 border-l-teal-500">
                <div className="flex items-center gap-3 mb-2">
                   <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-900/20">
                      <AppIcon name="clock" className="h-4 w-4" />
                   </div>
                   <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Estimated Arrival</h3>
                </div>
                <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                   {trackingData.estimatedArrival ? new Date(trackingData.estimatedArrival).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }) : 'Calculating...'}
                </p>
             </div>
             
             <div className="card-premium border-l-4 border-l-indigo-500">
                <div className="flex items-center gap-3 mb-2">
                   <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20">
                      <AppIcon name="shield" className="h-4 w-4" />
                   </div>
                   <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Current Status</h3>
                </div>
                <div className="mt-1">
                   <StatusBadge value={trackingData.currentStatus} />
                </div>
             </div>
          </div>
        </div>

        <div className="space-y-6">
          <DriverTrackingPanel 
            driverName={shipment.driverName} 
            driverPhone={shipment.driverPhone} 
            vehicleNumber={shipment.vehicleNumber}
            shipmentId={shipment.id}
          />

          <div className="card-premium">
             <div className="flex items-center justify-between mb-4">
               <h3 className="section-title text-sm font-bold uppercase tracking-wider text-slate-500">Tracking Events</h3>
               <AppIcon name="clock" className="h-4 w-4 text-slate-400" />
             </div>
             <div className="space-y-5">
               {(trackingData.milestones || []).map((milestone: any, idx: number) => (
                 <div key={idx} className="relative flex gap-4">
                    {idx !== (trackingData.milestones || []).length - 1 && (
                      <div className="absolute left-[15px] top-8 h-[calc(100%-24px)] w-px bg-slate-100 dark:bg-slate-800" />
                    )}
                    <div className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-4 border-white dark:border-slate-900 shadow-sm ${milestone.completed ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}>
                      {milestone.completed ? (
                         <AppIcon name="check" className="h-3 w-3" strokeWidth={3} />
                      ) : (
                         <div className="h-2 w-2 rounded-full bg-current" />
                      )}
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${milestone.completed ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>{milestone.event}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                         <span className="text-[10px] font-medium text-slate-400">{milestone.time}</span>
                         {milestone.location && <span className="text-[10px] text-slate-400">• {milestone.location}</span>}
                      </div>
                    </div>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
