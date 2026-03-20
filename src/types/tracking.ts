/**
 * Tracking Type Definitions for Live Shipment Tracking
 */

export interface TrackingInfo {
  id: string;
  trackingNumber: string;
  carrier: CarrierType;
  status: TrackingStatus;
  origin: string;
  destination: string;
  estimatedDelivery?: string;
  currentLocation?: string;
  events: TrackingEventItem[];
  lastUpdated: string;
  linkedShipmentId?: string;
}

export type TrackingStatus = 'pending' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'exception' | 'returned';

export type CarrierType = 'DHL' | 'FedEx' | 'UPS' | 'DTDC' | 'BlueDart' | 'Delhivery' | 'India Post' | 'Maersk' | 'MSC' | 'CMA CGM' | 'EVERGREEN' | 'Other';

export interface TrackingEventItem {
  timestamp: string;
  location: string;
  description: string;
  status: string;
}

export const CARRIERS: { value: CarrierType; label: string; prefix?: string }[] = [
  { value: 'DHL', label: 'DHL Express', prefix: 'JD' },
  { value: 'FedEx', label: 'FedEx', prefix: '' },
  { value: 'UPS', label: 'UPS', prefix: '1Z' },
  { value: 'DTDC', label: 'DTDC' },
  { value: 'BlueDart', label: 'Blue Dart' },
  { value: 'Delhivery', label: 'Delhivery' },
  { value: 'India Post', label: 'India Post' },
  { value: 'Maersk', label: 'Maersk Line' },
  { value: 'MSC', label: 'MSC' },
  { value: 'CMA CGM', label: 'CMA CGM' },
  { value: 'EVERGREEN', label: 'Evergreen Marine' },
  { value: 'Other', label: 'Other' },
];

export const STATUS_COLORS: Record<TrackingStatus, { bg: string; text: string; dot: string }> = {
  pending: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-700 dark:text-yellow-400', dot: 'bg-yellow-500' },
  in_transit: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500' },
  out_for_delivery: { bg: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-700 dark:text-indigo-400', dot: 'bg-indigo-500' },
  delivered: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
  exception: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500' },
  returned: { bg: 'bg-slate-50 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-400', dot: 'bg-slate-500' },
};

export const STATUS_LABELS: Record<TrackingStatus, string> = {
  pending: 'Pending',
  in_transit: 'In Transit',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  exception: 'Exception',
  returned: 'Returned',
};

/**
 * Auto-detect carrier from tracking number format
 */
export function detectCarrier(trackingNumber: string): CarrierType {
  const num = trackingNumber.trim().toUpperCase();
  if (num.startsWith('JD') || num.match(/^\d{10}$/)) return 'DHL';
  if (num.startsWith('1Z')) return 'UPS';
  if (num.match(/^\d{12,15}$/)) return 'FedEx';
  if (num.match(/^[A-Z]{4}\d{7}$/)) return 'Maersk';
  if (num.startsWith('MSCU') || num.startsWith('MEDU')) return 'MSC';
  if (num.match(/^[A-Z]{2}\d{9}[A-Z]{2}$/)) return 'India Post';
  return 'Other';
}
