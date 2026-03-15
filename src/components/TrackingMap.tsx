import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ShipmentTracking } from '../types';

// Fix for default Leaflet markers in React
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Custom Truck marker for the current live location
const liveMarkerIcon = new L.DivIcon({
  className: 'live-tracking-marker',
  html: `<div class="relative flex h-10 w-10 items-center justify-center">
            <div class="absolute inset-0 animate-ping rounded-full bg-teal-400/20"></div>
            <div class="relative flex h-8 w-8 items-center justify-center rounded-xl bg-teal-600 shadow-xl border-2 border-white ring-4 ring-teal-500/20 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
                <rect x="1" y="3" width="15" height="13"></rect>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
              </svg>
            </div>
         </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20]
});

// Driver marker with rotation
const driverMarkerIcon = (heading: number = 0) => new L.DivIcon({
  className: 'driver-tracking-marker',
  html: `<div class="relative flex h-12 w-12 items-center justify-center" style="transform: rotate(${heading}deg); transition: transform 0.5s ease-out;">
            <div class="absolute inset-0 animate-pulse rounded-full bg-blue-400/20"></div>
            <div class="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 shadow-2xl border-4 border-white text-white">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
                <path d="M1 3h15v13H1z"></path>
                <path d="M16 8h4l3 3v5h-7V8z"></path>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
              </svg>
            </div>
         </div>`,
  iconSize: [48, 48],
  iconAnchor: [24, 24]
});

// Hub marker (Origin/Destination)
const hubMarkerIcon = (type: 'origin' | 'destination') => new L.DivIcon({
  className: `hub-marker-${type}`,
  html: `<div class="flex h-8 w-8 items-center justify-center rounded-full ${type === 'origin' ? 'bg-amber-500' : 'bg-emerald-500'} border-4 border-white shadow-lg text-white">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3">
              ${type === 'origin' ? '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>' : '<path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"></path>'}
            </svg>
         </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

// Regular marker for history points
const historyMarkerIcon = new L.DivIcon({
  className: 'history-tracking-marker',
  html: `<div class="h-3 w-3 rounded-full bg-slate-400 border-2 border-white shadow-sm"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6]
});

// Component to handle auto-panning when location updates
const RecenterMap = ({ lat, lng }: { lat: number, lng: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom(), {
      animate: true,
      duration: 1.5
    });
  }, [lat, lng, map]);
  return null;
};

interface TrackingMapProps {
  tracking: ShipmentTracking;
  className?: string;
  showOptimizedRoute?: boolean;
}

export default function TrackingMap({ 
  tracking, 
  className = 'h-[400px] w-full rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800',
  showOptimizedRoute = true
}: TrackingMapProps) {
  if (!tracking) return null;

  const currentPosition: [number, number] = [tracking.latitude, tracking.longitude];
  
  // Extract coordinate paths from history for the polyline route
  const routePositions: [number, number][] = [...tracking.trackingHistory]
    .reverse()
    .map(loc => [loc.lat, loc.lng]);
    
  // Add current position to the end of the traveled route
  if (routePositions.length > 0) {
     const lastPt = routePositions[routePositions.length - 1];
     if (lastPt[0] !== currentPosition[0] || lastPt[1] !== currentPosition[1]) {
       routePositions.push(currentPosition);
     }
  }

  // Optimized Route Coordinates
  const optimizedCoords: [number, number][] = tracking.optimizedRoute 
    ? tracking.optimizedRoute.coordinates.map(c => [c.lat, c.lng] as [number, number])
    : [];

  const originPosition: [number, number] = routePositions[0] || currentPosition;
  const finalDestination: [number, number] = tracking.longitude > 0 
    ? [51.5074, -0.1278] // Europe/London fallback 
    : [34.0522, -118.2437]; // US/LA fallback
    
  const fullExpectedRoute: [number, number][] = [
    originPosition,
    ...routePositions,
    finalDestination
  ];

  return (
    <div className={className}>
      <MapContainer 
        center={currentPosition} 
        zoom={5} 
        scrollWheelZoom={false}
        className="h-full w-full z-0 relative"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        <RecenterMap lat={currentPosition[0]} lng={currentPosition[1]} />
        
        {/* Draw AI Optimized route (Indigo dotted line) */}
        {showOptimizedRoute && optimizedCoords.length > 1 && (
          <Polyline 
            positions={optimizedCoords} 
            color="#6366f1" 
            weight={4} 
            opacity={0.6}
            dashArray="1, 10"
          />
        )}

        {/* Draw the full expected route (gray dotted line) */}
        {fullExpectedRoute.length > 1 && (
          <Polyline 
            positions={fullExpectedRoute} 
            color="#94a3b8" 
            weight={3} 
            opacity={0.5}
            dashArray="10, 15"
          />
        )}

        {/* Draw the actively traveled route up to current location */}
        {routePositions.length > 1 && (
          <Polyline 
            positions={routePositions} 
            color="#0d9488" 
            weight={4} 
            opacity={0.9}
          />
        )}

        {/* Origin Marker */}
        <Marker position={originPosition} icon={hubMarkerIcon('origin')}>
          <Popup className="tracking-popup">
            <div className="text-xs">
              <p className="font-bold text-amber-700 mb-1">Origin Point</p>
              <p className="text-slate-600 font-medium">Warehouse Export Hub</p>
            </div>
          </Popup>
        </Marker>

        {/* Destination Marker */}
        <Marker position={finalDestination} icon={hubMarkerIcon('destination')}>
          <Popup className="tracking-popup">
            <div className="text-xs">
              <p className="font-bold text-emerald-700 mb-1">Final Destination</p>
              <p className="text-slate-600 font-medium">{tracking.currentLocation.split(',')[1] || 'Primary Port'}</p>
            </div>
          </Popup>
        </Marker>

        {/* History markers (excluding the current one) */}
        {tracking.trackingHistory.slice(1).map((loc, idx) => (
          <Marker 
            key={`hist-${idx}`} 
            position={[loc.lat, loc.lng]} 
            icon={historyMarkerIcon}
          >
             <Popup className="tracking-popup">
                <div className="text-xs">
                  <p className="font-bold text-slate-800 mb-1">{loc.locationName}</p>
                  <p className="text-slate-500 mb-1">{new Date(loc.timestamp).toLocaleString()}</p>
                  <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium text-[10px] uppercase tracking-wider">{loc.status}</span>
                </div>
             </Popup>
          </Marker>
        ))}

        {/* Live current location marker */}
        {!tracking.driverTele && (
          <Marker position={currentPosition} icon={liveMarkerIcon}>
            <Popup className="tracking-popup">
              <div className="text-xs">
                <p className="font-bold text-teal-700 mb-1">Current Location</p>
                <p className="text-slate-600 font-medium mb-1">{tracking.currentLocation}</p>
                <div className="flex items-center gap-1.5 mt-2">
                   <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                   </span>
                   <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Live Data</p>
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Real-Time Driver Marker */}
        {tracking.driverTele && (
          <Marker 
            position={[tracking.driverTele.latitude, tracking.driverTele.longitude]} 
            icon={driverMarkerIcon(tracking.driverTele.heading)}
          >
            <Popup className="tracking-popup">
              <div className="text-xs">
                <p className="font-bold text-indigo-700 mb-1">Driver: Active Delivery</p>
                <p className="text-slate-600 font-medium mb-1">Speed: {tracking.driverTele.speed} km/h</p>
                <div className="flex items-center gap-1.5 mt-2">
                   <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                   </span>
                   <p className="text-[10px] text-indigo-500 uppercase tracking-wider font-bold">Live GPS Stream</p>
                </div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
