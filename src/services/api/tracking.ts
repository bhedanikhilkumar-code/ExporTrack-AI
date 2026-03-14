import { dhlAdapter } from '../carriers/dhlAdapter';
import { fedexAdapter } from '../carriers/fedexAdapter';
import { upsAdapter } from '../carriers/upsAdapter';
import { CarrierTrackingResponse } from '../carriers/types';

/**
 * Simulates a backend API endpoint: GET /api/tracking/?trackingNumber=X&carrier=Y
 * Routes the request to the correct carrier adapter.
 */
export const getTrackingFromCarrier = async (
  trackingNumber: string,
  carrier: string
): Promise<CarrierTrackingResponse | null> => {
  const normalizedCarrier = carrier.trim().toUpperCase();

  try {
    switch (normalizedCarrier) {
      case 'DHL':
        return await dhlAdapter.getTrackingInfo(trackingNumber);
      case 'FEDEX':
        return await fedexAdapter.getTrackingInfo(trackingNumber);
      case 'UPS':
        return await upsAdapter.getTrackingInfo(trackingNumber);
      default:
        console.warn(`Unsupported carrier: ${carrier}`);
        return null;
    }
  } catch (error) {
    console.error(`Error fetching tracking for ${trackingNumber} via ${carrier}:`, error);
    return null;
  }
};
