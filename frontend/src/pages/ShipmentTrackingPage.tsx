/**
 * Shipment Live Tracking Page
 * Search, add, and track shipments with carrier auto-detection and timeline
 */
import { useState, useMemo, useCallback } from 'react';
import AppIcon from '../components/AppIcon';
import TrackingTimeline from '../components/TrackingTimeline';
import { TrackingInfo, TrackingEventItem, CARRIERS, STATUS_COLORS, STATUS_LABELS, TrackingStatus, CarrierType, detectCarrier } from '../types/tracking';
import { useAppContext } from '../context/AppContext';

const MOCK_EVENTS: TrackingEventItem[] = [
  { timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), location: 'Mumbai Hub, India', description: 'Shipment departed from origin facility', status: 'in_transit' },
  { timestamp: new Date(Date.now() - 8 * 3600000).toISOString(), location: 'JNPT Port, Mumbai', description: 'Customs clearance completed', status: 'in_transit' },
  { timestamp: new Date(Date.now() - 24 * 3600000).toISOString(), location: 'JNPT Port, Mumbai', description: 'Shipment arrived at customs', status: 'in_transit' },
  { timestamp: new Date(Date.now() - 48 * 3600000).toISOString(), location: 'Warehouse, Mumbai', description: 'Shipment picked up', status: 'pending' },
  { timestamp: new Date(Date.now() - 72 * 3600000).toISOString(), location: 'Mumbai, India', description: 'Booking confirmed', status: 'pending' },
];

export default function ShipmentTrackingPage() {
  const { state, saveTracking, deleteTracking } = useAppContext();
  const [searchInput, setSearchInput] = useState('');
  const [selectedCarrier, setSelectedCarrier] = useState<CarrierType>('Other');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [selectedTracking, setSelectedTracking] = useState<TrackingInfo | null>(null);

  const trackings = state.trackings;

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSearch = () => {
    if (!searchInput.trim()) return;
    setLoading(true);

    // Auto-detect carrier
    const detected = detectCarrier(searchInput.trim());
    const carrier = detected !== 'Other' ? detected : selectedCarrier;

    // Simulate API call (replace with real AfterShip integration when API key available)
    setTimeout(() => {
      const existingIdx = trackings.findIndex(t => t.trackingNumber === searchInput.trim());
      const mockStatuses: TrackingStatus[] = ['pending', 'in_transit', 'in_transit', 'out_for_delivery', 'delivered'];
      const randomStatus = mockStatuses[Math.floor(Math.random() * mockStatuses.length)];

      const newTracking: TrackingInfo = {
        id: `trk-${Date.now()}`,
        trackingNumber: searchInput.trim().toUpperCase(),
        carrier,
        status: randomStatus,
        origin: 'Mumbai, India',
        destination: 'New York, USA',
        estimatedDelivery: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10),
        currentLocation: MOCK_EVENTS[0].location,
        events: MOCK_EVENTS,
        lastUpdated: new Date().toISOString(),
      };

      if (existingIdx >= 0) {
        saveTracking({ ...trackings[existingIdx], ...newTracking, id: trackings[existingIdx].id });
      } else {
        saveTracking(newTracking);
      }

      setSelectedTracking(newTracking);
      setLoading(false);
      showToast('Tracking updated');
    }, 1200);
  };

  const handleDelete = (id: string) => {
    deleteTracking(id);
    if (selectedTracking?.id === id) setSelectedTracking(null);
    showToast('Tracking removed');
  };

  const handleRefresh = (tracking: TrackingInfo) => {
    setLoading(true);
    setTimeout(() => {
      saveTracking({ ...tracking, lastUpdated: new Date().toISOString() });
      if (selectedTracking?.id === tracking.id) setSelectedTracking({ ...tracking, lastUpdated: new Date().toISOString() });
      setLoading(false);
      showToast('Tracking refreshed');
    }, 800);
  };

  return (
    <main className="page-stack animate-in fade-in duration-500">
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">Live Tracking</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Track your shipments in real-time</p>
      </header>

      {/* Search Bar */}
      <div className="card-premium p-5 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <AppIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-sm font-medium text-slate-900 outline-none transition-all focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              placeholder="Enter tracking number (e.g., JD0123456789, 1Z999AA10123456789)"
              value={searchInput}
              onChange={e => {
                setSearchInput(e.target.value);
                const detected = detectCarrier(e.target.value);
                if (detected !== 'Other') setSelectedCarrier(detected);
              }}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <select
            className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 w-full sm:w-40"
            value={selectedCarrier}
            onChange={e => setSelectedCarrier(e.target.value as CarrierType)}
          >
            {CARRIERS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <button onClick={handleSearch} disabled={loading || !searchInput.trim()} className="btn-primary px-6 py-3 disabled:opacity-50">
            {loading ? (
              <span className="inline-flex items-center gap-2"><span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Tracking...</span>
            ) : (
              <span className="inline-flex items-center gap-2"><AppIcon name="search" className="h-4 w-4" /> Track</span>
            )}
          </button>
        </div>
        {searchInput && detectCarrier(searchInput) !== 'Other' && (
          <p className="text-[10px] text-teal-600 mt-2 font-bold">
            Auto-detected carrier: {CARRIERS.find(c => c.value === detectCarrier(searchInput))?.label}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Saved Trackings List */}
        <div className="lg:col-span-1">
          <h3 className="text-sm font-black text-slate-900 dark:text-white mb-3">Saved Trackings ({trackings.length})</h3>
          {trackings.length === 0 ? (
            <div className="card-premium p-6 text-center">
              <AppIcon name="package" className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-xs text-slate-500">No trackings yet. Search above to add one.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {trackings.map(t => {
                const sc = STATUS_COLORS[t.status];
                const isSelected = selectedTracking?.id === t.id;
                return (
                  <button key={t.id} onClick={() => setSelectedTracking(t)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all ${isSelected
                      ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-900/10 shadow-lg shadow-teal-500/10'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-black text-slate-900 dark:text-white truncate">{t.trackingNumber}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{t.carrier}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full ${sc.bg} ${sc.text}`}>{STATUS_LABELS[t.status]}</span>
                        <button onClick={e => { e.stopPropagation(); handleDelete(t.id); }} className="text-slate-400 hover:text-red-500 p-0.5"><AppIcon name="x" className="h-3 w-3" /></button>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 truncate">{t.origin} → {t.destination}</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Timeline Detail */}
        <div className="lg:col-span-2">
          {selectedTracking ? (
            <div className="card-premium p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">{selectedTracking.trackingNumber}</h3>
                  <p className="text-[10px] text-slate-500">{selectedTracking.carrier} • {selectedTracking.origin} → {selectedTracking.destination}</p>
                </div>
              </div>
              <TrackingTimeline
                events={selectedTracking.events}
                status={selectedTracking.status}
                currentLocation={selectedTracking.currentLocation}
                estimatedDelivery={selectedTracking.estimatedDelivery}
                lastUpdated={selectedTracking.lastUpdated}
                onRefresh={() => handleRefresh(selectedTracking)}
              />
            </div>
          ) : (
            <div className="card-premium p-12 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-800/20 shadow-lg">
                <AppIcon name="navigation" className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white mb-2">Select a Tracking</h2>
              <p className="text-sm text-slate-500 max-w-md mx-auto">Search for a tracking number above or select one from your saved list to view details.</p>
            </div>
          )}
        </div>
      </div>

      {toast && <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl text-sm font-bold animate-in slide-in-from-bottom duration-300 ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>{toast.message}</div>}
    </main>
  );
}
