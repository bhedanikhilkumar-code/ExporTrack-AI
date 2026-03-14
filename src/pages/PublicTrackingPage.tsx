import { useParams, Link } from 'react-router-dom';
import { useTracking } from '../hooks/useTracking';
import TrackingMap from '../components/TrackingMap';
import AppIcon from '../components/AppIcon';
import StatusBadge from '../components/StatusBadge';

export default function PublicTrackingPage() {
  const { trackingNumber } = useParams<{ trackingNumber: string }>();
  
  // Using the tracking number as the mock shipmentId and default destination country.
  // In a real application, you'd fetch the basic shipment context by tracking number first.
  const { trackingData, loading, error, lastPolled } = useTracking(
    trackingNumber || '', 
    'US', // Mock default
    5000 
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 animate-in text-slate-900 dark:text-slate-100">
      <div className="mx-auto max-w-6xl space-y-6">
        
        {/* ── Public Page Header ── */}
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between card-premium p-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-2 rounded-lg bg-teal-500 p-2 text-white shadow-md">
                <AppIcon name="dashboard" className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">ExporTrack</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
              Live Shipment Tracking
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
              {trackingData?.tracking_number ? (
                <p className="flex items-center gap-1">
                  Tracking #: <span className="font-mono text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded">{trackingData.tracking_number}</span>
                </p>
              ) : (
                <p className="flex items-center gap-1">
                  Tracking #: <span className="font-mono text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded">{trackingNumber}</span>
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
                const url = window.location.href;
                const msg = encodeURIComponent(`Track your shipment here:\n${url}`);
                window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank');
              }}
              className="group flex items-center justify-center gap-2 rounded-xl bg-green-500 hover:bg-green-600 text-white px-4 py-2 font-bold shadow-sm transition-all focus:outline-none focus:ring-4 focus:ring-green-500/20 active:scale-[0.98]"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
              </svg>
              <span className="text-[11px] uppercase tracking-widest hidden sm:inline-block">Share Link</span>
            </button>
            <Link to="/auth" className="btn-secondary btn-sm sm:btn-base">
              Client Portal Login
            </Link>
          </div>
        </header>

        {/* ── Loading / Error States ── */}
        {loading && !trackingData && (
          <div className="card-premium flex flex-col items-center justify-center p-12">
             <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-teal-500 dark:border-slate-700"></div>
             <p className="mt-4 text-sm font-medium text-slate-500 uppercase tracking-widest font-bold">Acquiring Satellite Lock...</p>
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
                  </div>

                  <div className="absolute z-0 inset-0 h-full w-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                     <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-teal-500 dark:border-slate-700"></div>
                  </div>

                  <TrackingMap tracking={trackingData} className="relative z-[5] h-full w-full" />
               </div>

               {/* Live Data Feed Cards */}
               <div className="grid gap-4 sm:grid-cols-3">
                  {/* AI ETA Card */}
                  {trackingData.aiEta && (
                    <div className="card-premium flex flex-col border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50/50 to-white dark:from-purple-900/10 dark:to-slate-900">
                       <div className="flex flex-1 items-start justify-between mb-2">
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

            {/* Timeline Sidebar */}
            <div className="lg:col-span-1 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/50 p-6 flex flex-col h-[500px] sm:h-[600px]">
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
                       
                       // Normalize tracking keys depending on if it's the mock trackingHistory or the new API format
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
        )}
      </div>
    </div>
  );
}
