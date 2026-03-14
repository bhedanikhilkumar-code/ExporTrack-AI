import { LocationUpdate, ShipmentTracking } from '../types';
import { getTrackingFromCarrier } from './api/tracking';
import { predictETA } from './aiEtaService';

// Mock data generator for tracking routes
const MOCK_ROUTES: Record<string, { lat: number; lng: number }[]> = {
  // Route from Shenzhen (CN) to Los Angeles (US)
  'US': [
    { lat: 22.5429, lng: 114.0596 }, // Shenzhen
    { lat: 26.5429, lng: 124.0596 }, // East China Sea
    { lat: 31.5429, lng: 140.0596 }, // North Pacific Ocean
    { lat: 33.5429, lng: 160.0596 }, // North Pacific Ocean 2
    { lat: 33.8429, lng: -140.0596 }, // Mid Pacific
    { lat: 34.0522, lng: -118.2437 }, // Los Angeles
  ],
  // Route from Mumbai (IN) to Rotterdam (NL)
  'NL': [
    { lat: 18.9388, lng: 72.8353 }, // Mumbai
    { lat: 12.0000, lng: 50.0000 }, // Arabian Sea
    { lat: 27.0000, lng: 34.0000 }, // Red Sea
    { lat: 31.2500, lng: 32.3000 }, // Suez Canal
    { lat: 35.0000, lng: 18.0000 }, // Mediterranean Sea
    { lat: 45.0000, lng: -8.0000 }, // Bay of Biscay
    { lat: 51.9229, lng: 4.4792 }, // Rotterdam
  ],
  // Route from Shanghai (CN) to Sydney (AU)
  'AU': [
    { lat: 31.2304, lng: 121.4737 }, // Shanghai
    { lat: 15.0000, lng: 130.0000 }, // Philippine Sea
    { lat: 0.0000, lng: 140.0000 }, // Equator
    { lat: -15.0000, lng: 150.0000 }, // Coral Sea
    { lat: -33.8688, lng: 151.2093 }, // Sydney
  ]
};

// State to store our mock tracking data
const trackingStore: Record<string, ShipmentTracking> = {};

// Names for mock locations
const MOCK_LOCATION_NAMES = [
  'Port of Origin Departure',
  'Ocean Transit Checkpoint Alpha',
  'Ocean Transit Checkpoint Beta',
  'Transshipment Hub Arrival',
  'Canal Transit',
  'Customs Clearance Point',
  'Port of Destination Arrival'
];

/**
 * Ensures a tracking session exists for a given shipment
 */
const initTracking = (shipmentId: string, destCountry: string): ShipmentTracking => {
  if (trackingStore[shipmentId]) {
    return trackingStore[shipmentId];
  }

  // Determine route based on destination, default to US route
  const route = MOCK_ROUTES[destCountry.slice(0, 2).toUpperCase()] || MOCK_ROUTES['US'];
  
  // Create initial state at the start of the route
  const startLoc = route[0];
  
  const history: LocationUpdate[] = [
    {
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      locationName: 'Shipment Created',
      lat: startLoc.lat,
      lng: startLoc.lng,
      status: 'Created',
      notes: 'Container scaled and registered'
    },
    {
      timestamp: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000).toISOString(),
      locationName: MOCK_LOCATION_NAMES[0],
      lat: startLoc.lat,
      lng: startLoc.lng,
      status: 'In Transit',
      notes: 'Vessel departure confirmed'
    }
  ];

  trackingStore[shipmentId] = {
    shipmentId,
    currentStatus: 'In Transit',
    currentLocation: MOCK_LOCATION_NAMES[0],
    latitude: startLoc.lat,
    longitude: startLoc.lng,
    lastUpdatedTime: history[1].timestamp,
    trackingHistory: history,
    estimatedArrival: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString()
  };

  return trackingStore[shipmentId];
}

/**
 * Gets real-time tracking data for a shipment.
 * Simulates network delay and merges local GPS sim with carrier adapter responses.
 */
export const getShipmentTracking = async (shipmentId: string, destCountry: string = 'US'): Promise<ShipmentTracking> => {
  const baseTracking = initTracking(shipmentId, destCountry);
  
  // Assign deterministic carrier if not present
  if (!baseTracking.carrier) {
    const charCode = shipmentId.charCodeAt(0) || 0;
    const carriers = ['DHL', 'FedEx', 'UPS'];
    baseTracking.carrier = carriers[charCode % 3];
    const numPart = (shipmentId.match(/\d+/) || ['8471295'])[0];
    baseTracking.tracking_number = `TRK${numPart.padEnd(8, '0')}`;
  }

  // Fetch actual data from our mock endpoint
  const carrierData = await getTrackingFromCarrier(baseTracking.tracking_number!, baseTracking.carrier!);
  
  if (carrierData) {
    baseTracking.status = carrierData.status;
    baseTracking.current_location = carrierData.current_location;
    baseTracking.estimated_delivery = carrierData.estimated_delivery;
    baseTracking.tracking_events = carrierData.tracking_events;
    
    // We synchronize the legacy fields so the map map still works without breaking Dashboard
    if (baseTracking.tracking_events.length > 0) {
      baseTracking.currentStatus = baseTracking.status;
      baseTracking.currentLocation = baseTracking.current_location;
      
      // If estimated arrival is given we replace the legacy one
      baseTracking.estimatedArrival = baseTracking.estimated_delivery;
    }
  }

  // AI Prediction & Delay Alert calculation
  // Create a mock deadline (e.g., 5 days from now or existing estimated delivery)
  const mockDeadline = baseTracking.estimatedArrival || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
  
  const { aiEta, delayAlert } = predictETA(baseTracking, mockDeadline);
  baseTracking.aiEta = aiEta;
  baseTracking.delayAlert = delayAlert;

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ ...baseTracking });
    }, 600); // 600ms artificial delay
  });
};

/**
 * Simulates an update pushed from a GPS or Carrier API.
 * In a real app, this would be an endpoint receiving webhooks or a websocket message.
 */
export const simulateTrackingUpdate = (shipmentId: string, destCountry: string = 'US'): ShipmentTracking => {
  const tracking = initTracking(shipmentId, destCountry);
  const route = MOCK_ROUTES[destCountry.slice(0, 2).toUpperCase()] || MOCK_ROUTES['US'];
  
  // Calculate progress along the route
  // Find where we are currently
  let currentSegment = Math.floor(tracking.trackingHistory.length / 2); // rough estimation
  
  // If we've reached the end, just stay there
  if (currentSegment >= route.length - 1) {
    tracking.currentStatus = 'Delivered';
    tracking.currentLocation = 'Final Destination Drop-off';
    tracking.lastUpdatedTime = new Date().toISOString();
    return { ...tracking };
  }

  // Move slightly towards the next point
  const currentPt = route[currentSegment];
  const nextPt = route[currentSegment + 1];
  
  // Create a granular point along the path between current segment pt and next segment pt.
  // We use a small randomized step so the marker visibly glides over the 5 second polling interval.
  const storedProgressKey = `progress_${shipmentId}`;
  const currentProgress = (trackingStore as any)[storedProgressKey] || 0;
  let nextProgress = currentProgress + 0.15 + (Math.random() * 0.05); // Advance ~15-20% per poll
  
  if (nextProgress >= 1) {
    nextProgress = 0; // Reset progress for the next route segment
    currentSegment++; // Move to next main waypoint
  }
  
  (trackingStore as any)[storedProgressKey] = nextProgress;
  
  const newLat = currentPt.lat + (nextPt.lat - currentPt.lat) * nextProgress;
  const newLng = currentPt.lng + (nextPt.lng - currentPt.lng) * nextProgress;

  const locNameIndex = Math.min(MOCK_LOCATION_NAMES.length - 1, currentSegment + 1);
  const newStatus = currentSegment > route.length - 3 ? 'Customs' : 'In Transit';

  const newLoc: LocationUpdate = {
    timestamp: new Date().toISOString(),
    locationName: MOCK_LOCATION_NAMES[locNameIndex] + ` (Update ${tracking.trackingHistory.length})`,
    lat: newLat,
    lng: newLng,
    status: newStatus,
    notes: 'GPS Coordinates updated via satellite relay'
  };

  tracking.latitude = newLat;
  tracking.longitude = newLng;
  tracking.currentStatus = newStatus;
  tracking.currentLocation = newLoc.locationName;
  tracking.lastUpdatedTime = newLoc.timestamp;
  tracking.trackingHistory = [newLoc, ...tracking.trackingHistory];

  return { ...tracking };
};
