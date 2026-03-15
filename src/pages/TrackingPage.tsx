import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useTracking } from '../hooks/useTracking';
import TrackingMap from '../components/TrackingMap';
import AppIcon from '../components/AppIcon';
import StatusBadge from '../components/StatusBadge';
import DriverTrackingPanel from '../components/DriverTrackingPanel';
import { SkeletonKpiCard, SkeletonDetailSection, SkeletonLine } from '../components/SkeletonLoader';

export default function TrackingPage() {
  const { shipmentId } = useParams<{ shipmentId: string }>();
  const { state: { shipments }, addComment, applyOptimizedRoute } = useAppContext();
  
  const shipment = shipments.find(s => s.id === shipmentId);
  const { trackingData, loading, error, lastPolled } = useTracking(
    shipment?.id || '', 
    shipment?.destinationCountry || 'US',
    5000 // Poll every 5 seconds for simulation purposes
  );
  
  const { triggerDelayAlert } = useAppContext();

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
            onClick={() => {
              const trackingNumberToShare = trackingData?.tracking_number || trackingData?.shipmentId || shipmentId;
              const url = `${window.location.origin}/track/${trackingNumberToShare}`;
              navigator.clipboard.writeText(url);
              alert('Public tracking link copied to clipboard!');
            }}
            className="btn-primary btn-sm sm:btn-base bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white border-0"
          >
            <AppIcon name="share" className="mr-1 sm:mr-2 h-4 w-4" />
            Copy Tracking Link
          </button>
          <Link to={`/shipments/${shipment.id}`} className="btn-secondary btn-sm sm:btn-base">
            <AppIcon name="file" className="mr-1 sm:mr-2 h-4 w-4" />
            View Details
          </Link>
        </div>
      </header>

      {/* Loading / Error States */}
      {loading && !trackingData && (
        <div className="space-y-6 animate-pulse">
          <div className="grid gap-6 lg:grid-cols-3 xl:grid-cols-4">
             <div className="lg:col-span-2 xl:col-span-3 space-y-6">
                <div className="card-premium h-[500px] flex items-center justify-center bg-slate-100 dark:bg-slate-800/50 border-0">
                   <div className="flex flex-col items-center gap-4">
                      <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-teal-500" />
                      <SkeletonLine className="h-4 w-48" />
                   </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                   <SkeletonKpiCard />
                   <SkeletonKpiCard />
                   <SkeletonKpiCard />
                </div>
             </div>
             <div className="lg:col-span-1 space-y-6">
                <SkeletonDetailSection />
                <SkeletonDetailSection />
             </div>
          </div>
        </div>
      )}

      {error && (
        <div className="card-premium border-rose-200 bg-rose-50 dark:border-rose-900/30 dark:bg-rose-900/10">
           <div className="flex items-center gap-3 text-rose-600">
              <AppIcon name="warning" className="h-5 w-5" />
              <p className="font-medium text-sm">{error}</p>
           </div>
        </div>
      )}

      {/* ── Main Tracking Interface ── */}
      {trackingData && (
        <div className="grid gap-6 lg:grid-cols-3 xl:grid-cols-4">
          
          {/* Tracking Map (Spans most of the width) */}
          <div className="lg:col-span-2 xl:col-span-3 space-y-6">
             <div className="card-premium p-0 h-[500px] sm:h-[600px] relative overflow-hidden group border-2 border-slate-100 dark:border-slate-800">
              {/* Overlay header on map */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
                 <div className="bg-white/90 backdrop-blur-md dark:bg-slate-900/90 p-3 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 max-w-sm pointer-events-auto">
                    <div className="flex items-center gap-2 mb-1">
                       <span className="text-[10px] font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">Current Position</span>
                       <span className="relative flex h-2 w-2">
                         <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                         <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                       </span>
                    </div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm mb-2">{trackingData.currentLocation}</p>
                    <div className="flex items-center gap-4">
                       <div className="flex flex-col">
                          <span className="text-[10px] uppercase text-slate-400 font-bold">Lat</span>
                          <span className="text-xs font-mono text-slate-700 dark:text-slate-300">{trackingData.latitude.toFixed(4)}°</span>
                       </div>
                       <div className="flex flex-col">
                          <span className="text-[10px] uppercase text-slate-400 font-bold">Lng</span>
                          <span className="text-xs font-mono text-slate-700 dark:text-slate-300">{trackingData.longitude.toFixed(4)}°</span>
                       </div>
                    </div>
                 </div>

                 {/* AI Route Strategy Badge */}
                 {trackingData.optimizedRoute && (
                   <div className="bg-slate-900/90 backdrop-blur-md p-3 rounded-xl shadow-lg border border-white/10 max-w-xs pointer-events-auto mt-2">
                      <div className="flex items-center justify-between mb-2">
                         <div className="flex items-center gap-2">
                            <div className="flex h-5 w-5 items-center justify-center rounded bg-indigo-500/20 text-indigo-400">
                               <AppIcon name="ai-extract" className="h-3 w-3" />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400">AI Route Strategy</span>
                         </div>
                         <button 
                           onClick={() => setShowOptimizedRoute(!showOptimizedRoute)}
                           className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded border transition-colors ${
                             showOptimizedRoute ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-white/20 text-white/40 hover:text-white hover:border-white/40'
                           }`}
                         >
                           {showOptimizedRoute ? 'Visible' : 'Hidden'}
                         </button>
                      </div>
                      <div className="flex items-center justify-between text-white gap-4 mb-3">
                         <div className="flex flex-col">
                            <span className="text-[8px] uppercase text-slate-500 font-bold">Time Saving</span>
                            <span className="text-xs font-bold text-emerald-400">-{trackingData.optimizedRoute.savings?.time}</span>
                         </div>
                         <div className="flex flex-col">
                            <span className="text-[8px] uppercase text-slate-500 font-bold">Dist Reduction</span>
                            <span className="text-xs font-bold text-indigo-400">-{trackingData.optimizedRoute.savings?.distance}</span>
                         </div>
                      </div>
                      <button 
                        onClick={handleApplyRoute}
                        className="w-full py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20"
                      >
                        Apply Optimized Route
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

          {/* Timeline Sidebar / Driver Panel */}
          <div className="lg:col-span-1 space-y-6 flex flex-col h-[500px] sm:h-[600px]">
             {/* Uber-style Driver Panel */}
             <div className="shrink-0 h-[320px]">
               <DriverTrackingPanel tracking={trackingData} shipment={shipment} />
             </div>

             <div className="flex-1 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/50 p-6 flex flex-col overflow-hidden">
               <div className="mb-6 flex items-center justify-between shrink-0">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                     <AppIcon name="shipments" className="h-4 w-4 text-teal-600" />
                     Transit History
                  </h3>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded font-bold">
                     {trackingData.tracking_events?.length || trackingData.trackingHistory.length} Updates
                  </span>
               </div>

               <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                  <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-3 space-y-6">
                     {(trackingData.tracking_events?.length ? trackingData.tracking_events : trackingData.trackingHistory).map((locItem: any, idx: number) => {
                       const isLatest = idx === 0;
                       const timestamp = locItem.timestamp;
                       const locationName = locItem.location || locItem.locationName;
                       const status = locItem.status;
                       const description = locItem.description || locItem.notes;

                       return (
                         <div key={`${timestamp}-${idx}`} className="relative pl-6">
                           <div className={`absolute -left-[9px] top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                              isLatest 
                                ? 'border-teal-500 bg-white dark:bg-slate-900' 
                                : 'border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800'
                           }`}>
                             {isLatest && <div className="h-1.5 w-1.5 rounded-full bg-teal-500" />}
                           </div>
                           <div className={`p-4 rounded-xl border ${
                              isLatest 
                                 ? 'bg-teal-50/50 border-teal-100 dark:bg-teal-900/10 dark:border-teal-900/30' 
                                 : 'bg-slate-50 border-slate-100 dark:bg-slate-800/40 dark:border-slate-800'
                           }`}>
                             <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">
                               {new Date(timestamp).toLocaleDateString()} at {new Date(timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                             </p>
                             <p className={`font-bold mb-2 ${isLatest ? 'text-teal-900 dark:text-teal-100' : 'text-slate-700 dark:text-slate-300'}`}>
                               {locationName}
                             </p>
                             {description && (
                               <p className="text-xs text-slate-500 mb-2">{description}</p>
                             )}
                             <div className="flex items-center justify-between">
                               <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest ${
                                 isLatest ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/50' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                               }`}>
                                 {status}
                               </span>
                             </div>
                           </div>
                         </div>
                       );
                     })}
                  </div>
               </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
