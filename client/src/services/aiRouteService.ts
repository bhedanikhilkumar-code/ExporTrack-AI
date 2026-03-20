import { OptimizedRoute, ShipmentTracking } from '../types';

/**
 * AI Route Optimization Service
 * Simulates intelligent routing by calculating faster paths and comparing they with current ones.
 */

const MOCK_OPTIMIZED_COORDS: Record<string, { lat: number; lng: number }[]> = {
  'US': [
    { lat: 22.5429, lng: 114.0596 }, // Shenzhen
    { lat: 20.0, lng: 130.0 }, // Optimized path south of East China Sea
    { lat: 10.0, lng: 160.0 }, // Equatorial route (faster current/weather)
    { lat: 15.0, lng: -160.0 },
    { lat: 25.0, lng: -140.0 },
    { lat: 34.0522, lng: -118.2437 }, // Los Angeles
  ],
  'NL': [
    { lat: 18.9388, lng: 72.8353 }, // Mumbai
    { lat: 10.0, lng: 55.0 }, 
    { lat: -5.0, lng: 40.0 }, // Route via Cape of Good Hope (simulation for Suez congestion)
    { lat: -34.0, lng: 18.0 }, // Cape Town
    { lat: 15.0, lng: -17.0 }, // Dakar
    { lat: 45.0, lng: -8.0 }, 
    { lat: 51.9229, lng: 4.4792 }, // Rotterdam
  ],
  'AU': [
    { lat: 31.2304, lng: 121.4737 }, // Shanghai
    { lat: 10.0, lng: 125.0 },
    { lat: -10.0, lng: 130.0 }, // Closer to Indonesian archipelago
    { lat: -25.0, lng: 140.0 },
    { lat: -33.8688, lng: 151.2093 }, // Sydney
  ]
};

export const calculateOptimizedRoute = (tracking: ShipmentTracking, destCountry: string): OptimizedRoute => {
  const countryCode = destCountry.slice(0, 2).toUpperCase();
  const coords = MOCK_OPTIMIZED_COORDS[countryCode] || MOCK_OPTIMIZED_COORDS['US'];
  
  // Calculate mock savings based on shipment ID
  const hash = tracking.shipmentId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const timeSavedValue = (hash % 48) + 12; // 12-60 hours saved
  const distSavedValue = (hash % 800) + 200; // 200-1000 km saved
  
  return {
    id: `OPT-${tracking.shipmentId}`,
    coordinates: coords,
    distance: "11,840 km",
    estimatedTime: "12 days, 4 hours",
    stops: coords.length - 2,
    savings: {
      time: `${timeSavedValue} hours`,
      distance: `${distSavedValue} km`
    },
    recommendationReason: "AI suggests this route to avoid current thermal current resistance and upcoming storm systems in the North Pacific."
  };
};

/**
 * Detects if a better route is available based on current tracking data
 */
export const detectBetterRoute = (tracking: ShipmentTracking): boolean => {
  // Logic to simulate finding a better route (e.g., if current route has delays)
  return tracking.delayAlert?.isDelayed || false;
};
