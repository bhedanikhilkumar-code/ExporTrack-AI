import { CarrierAdapter, CarrierTrackingResponse } from './types';

// Mock FedEx API Response simulation
export const fedexAdapter: CarrierAdapter = {
  async getTrackingInfo(trackingNumber: string): Promise<CarrierTrackingResponse> {
    // In a real app, this would use fetch() to hit apis.fedex.com
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          tracking_number: trackingNumber,
          carrier: 'FedEx',
          status: 'Out for Delivery',
          current_location: 'Memphis, TN',
          estimated_delivery: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
          tracking_events: [
            {
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              location: 'Memphis, TN',
              status: 'On FedEx vehicle for delivery',
              description: 'Loaded onto local delivery vehicle'
            },
            {
              timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
              location: 'Memphis, TN',
              status: 'At local FedEx facility',
              description: 'Arrived at local hub'
            },
            {
              timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
              location: 'Anchorage, AK',
              status: 'Arrived at FedEx hub',
              description: 'International shipment release - Import'
            }
          ]
        });
      }, 600);
    });
  }
};
