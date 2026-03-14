import { CarrierAdapter, CarrierTrackingResponse } from './types';

// Mock DHL API Response simulation
export const dhlAdapter: CarrierAdapter = {
  async getTrackingInfo(trackingNumber: string): Promise<CarrierTrackingResponse> {
    // In a real app, this would use fetch() to hit api.dhl.com
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          tracking_number: trackingNumber,
          carrier: 'DHL',
          status: 'In Transit',
          current_location: 'Leipzig, Germany',
          estimated_delivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          tracking_events: [
            {
              timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
              location: 'Leipzig, Germany',
              status: 'Departed Facility',
              description: 'Shipment has departed from a DHL facility'
            },
            {
              timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
              location: 'Leipzig, Germany',
              status: 'Processed',
              description: 'Processed at Leipzig - Germany'
            },
            {
              timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
              location: 'Shanghai, China',
              status: 'Origin Hub',
              description: 'Shipment picked up'
            }
          ]
        });
      }, 500); // Simulate network delay
    });
  }
};
