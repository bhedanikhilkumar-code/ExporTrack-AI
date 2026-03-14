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

// Custom animated marker for the current live location
const liveMarkerIcon = new L.DivIcon({
  className: 'live-tracking-marker',
  html: `<div class="relative flex h-6 w-6 items-center justify-center">
            <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75"></span>
            <span class="relative inline-flex h-4 w-4 rounded-full bg-teal-500 border-2 border-white shadow-sm"></span>
         </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
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
}

export default function TrackingMap({ tracking, className = 'h-[400px] w-full rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800' }: TrackingMapProps) {
  if (!tracking) return null;

  const currentPosition: [number, number] = [tracking.latitude, tracking.longitude];
  
  // Extract coordinate paths from history for the polyline route
  // History is reversed (newest first), so reserve it for proper route drawing
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

  // Create an Expected/Full route that extends from Origin to final generic destination bounds.
  // Assuming generic rough coordinates for final destinations if not passed down.
  const originPosition: [number, number] = routePositions[0] || currentPosition;
  
  // Hardcode a mock global destination endpoint depending on the route for demo purposes
  const finalDestination: [number, number] = tracking.longitude > 0 
    ? [51.5074, -0.1278] // Europe/London fallback 
    : [34.0522, -118.2437]; // US/LA fallback
    
  // Full Route Line from Origin -> Current -> Final
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
      </MapContainer>
    </div>
  );
}
