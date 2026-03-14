import { TrackingEvent } from '../../types';

export interface CarrierTrackingResponse {
  tracking_number: string;
  carrier: 'DHL' | 'FedEx' | 'UPS' | 'Unknown';
  status: string;
  current_location: string;
  estimated_delivery: string;
  tracking_events: TrackingEvent[];
}

export interface CarrierAdapter {
  getTrackingInfo(trackingNumber: string): Promise<CarrierTrackingResponse>;
}
