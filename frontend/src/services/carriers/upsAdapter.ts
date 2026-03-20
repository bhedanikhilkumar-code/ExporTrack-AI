import { CarrierAdapter, CarrierTrackingResponse } from './types';

// Mock UPS API Response simulation
export const upsAdapter: CarrierAdapter = {
  async getTrackingInfo(trackingNumber: string): Promise<CarrierTrackingResponse> {
    // In a real app, this would use fetch() to hit onlinetools.ups.com
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          tracking_number: trackingNumber,
          carrier: 'UPS',
          status: 'Customs Clearance',
          current_location: 'Louisville, KY',
          estimated_delivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          tracking_events: [
            {
              timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
              location: 'Louisville, KY',
              status: 'Warehouse Scan',
              description: 'Your package is awaiting customs clearance.'
            },
            {
              timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
              location: 'Louisville, KY',
              status: 'Arrival Scan',
              description: 'Arrived at Facility'
            },
            {
              timestamp: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
              location: 'Koeln, Germany',
              status: 'Departure Scan',
              description: 'Departed from Facility'
            }
          ]
        });
      }, 550);
    });
  }
};
