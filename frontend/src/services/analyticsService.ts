import { Shipment } from '../types';

/* ─── Metric interfaces ─────────────────────────────────────────────── */
export interface ShipmentAnalyticsMetrics {
  totalShipments: number;
  onTimeDeliveryRate: number;
  delayedShipments: number;
  averageDeliveryTimeDays: number;
  deliveredShipments: number;
  inTransitShipments: number;
  awaitingDocsShipments: number;
  customsHoldShipments: number;
  // Legacy properties for backward compatibility with AnalyticsMetrics
  averageDeliveryTime?: number;
  monthlyShipmentTrend?: { month: string; count: number }[];
  carrierPerformance?: { carrier: string; rating: number; shipments: number }[];
  deliveryTimeDistribution?: { range: string; count: number }[];
}

export interface MonthlyTrend {
  month: string;       // e.g. "Jan", "Feb"
  fullMonth: string;   // e.g. "2026-01"
  shipments: number;
  delivered: number;
  isDelayed: number;
}

export interface CarrierPerformance {
  carrier: string;
  shipments: number;
  onTime: number;
  isDelayed: number;
  avgDays: number;
}

export interface DeliveryDistribution {
  range: string;
  count: number;
}

/* ─── Mock carrier assignments (derived from container number prefixes) */
const CARRIER_MAP: Record<string, string> = {
  MSCU: 'MSC',
  TCKU: 'Maersk',
  HLCU: 'Hapag-Lloyd',
  CMAU: 'CMA CGM',
  EISU: 'Evergreen',
};

function getCarrier(containerNumber: string): string {
  const prefix = containerNumber.slice(0, 4).toUpperCase();
  return CARRIER_MAP[prefix] ?? 'Other';
}

/* ─── Compute metrics from shipments ─────────────────────────────────── */
export function computeAnalytics(shipments: Shipment[]): ShipmentAnalyticsMetrics {
  const total = shipments.length;
  const delivered = shipments.filter(s => s.status === 'Delivered').length;
  const delayed = shipments.filter(s => s.isDelayed).length;
  const inTransit = shipments.filter(s => s.status === 'In Transit').length;
  const awaitingDocs = shipments.filter(s => s.status === 'Awaiting Documents').length;
  const customsHold = shipments.filter(s => s.status === 'Customs Hold').length;

  const deliveredNonDelayed = shipments.filter(s => s.status === 'Delivered' && !s.isDelayed).length;
  const onTimeRate = delivered > 0 ? Math.round((deliveredNonDelayed / delivered) * 100) : 100;

  // Calculate average delivery time using date diff between shipmentDate and deadline
  const deliveryDays = shipments
    .filter(s => s.status === 'Delivered')
    .map(s => {
      const start = new Date(s.shipmentDate).getTime();
      const end = new Date(s.deadline).getTime();
      return Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
    });
  const avgDays = deliveryDays.length > 0
    ? Math.round(deliveryDays.reduce((a, b) => a + b, 0) / deliveryDays.length)
    : 0;

  return {
    totalShipments: total,
    onTimeDeliveryRate: onTimeRate,
    delayedShipments: delayed,
    averageDeliveryTimeDays: avgDays,
    deliveredShipments: delivered,
    inTransitShipments: inTransit,
    awaitingDocsShipments: awaitingDocs,
    customsHoldShipments: customsHold,
  };
}

export interface DailyTrend {
  date: string;
  shipments: number;
}

/* ─── Daily trend (last 7 days) ───────────────────────────────────────── */
export function computeDailyTrend(shipments: Shipment[]): DailyTrend[] {
  const days: DailyTrend[] = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const count = shipments.filter(s => (s.shipmentDate || '').startsWith(dateStr)).length;

    days.push({
      date: d.toLocaleDateString(undefined, { weekday: 'short' }),
      shipments: count
    });
  }

  // Seed if empty
  if (days.every(d => d.shipments === 0)) {
    const mockCounts = [3, 5, 2, 6, 4, 3, 5];
    days.forEach((d, i) => d.shipments = mockCounts[i]);
  }

  return days;
}

/* ─── Monthly trend (last 6 months, pad missing months) ──────────────── */
export function computeMonthlyTrend(shipments: Shipment[]): MonthlyTrend[] {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const months: MonthlyTrend[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const monthShipments = shipments.filter(s => (s.shipmentDate || '').startsWith(key));
    months.push({
      month: monthNames[d.getMonth()],
      fullMonth: key,
      shipments: monthShipments.length,
      delivered: monthShipments.filter(s => s.status === 'Delivered').length,
      isDelayed: monthShipments.filter(s => s.isDelayed).length,
    });
  }

  // If all months are 0, seed with realistic mock data
  const hasData = months.some(m => m.shipments > 0);
  if (!hasData) {
    const mockCounts = [8, 12, 15, 11, 18, 14];
    months.forEach((m, i) => {
      m.shipments = mockCounts[i];
      m.delivered = Math.round(mockCounts[i] * 0.7);
      m.isDelayed = Math.round(mockCounts[i] * 0.15);
    });
  }

  return months;
}

/* ─── Carrier performance ────────────────────────────────────────────── */
export function computeCarrierPerformance(shipments: Shipment[]): CarrierPerformance[] {
  const map: Record<string, { shipments: number; onTime: number; isDelayed: number; totalDays: number }> = {};

  shipments.forEach(s => {
    const carrier = getCarrier(s.containerNumber);
    if (!map[carrier]) map[carrier] = { shipments: 0, onTime: 0, isDelayed: 0, totalDays: 0 };
    map[carrier].shipments++;
    if (!s.isDelayed) map[carrier].onTime++;
    if (s.isDelayed) map[carrier].isDelayed++;

    const start = new Date(s.shipmentDate).getTime();
    const end = new Date(s.deadline).getTime();
    map[carrier].totalDays += Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
  });

  // Ensure we have at least 4 carriers for visual interest
  const defaults: Record<string, { shipments: number; onTime: number; isDelayed: number; totalDays: number }> = {
    'MSC': { shipments: 12, onTime: 10, isDelayed: 2, totalDays: 96 },
    'Maersk': { shipments: 9, onTime: 8, isDelayed: 1, totalDays: 63 },
    'Hapag-Lloyd': { shipments: 7, onTime: 6, isDelayed: 1, totalDays: 56 },
    'CMA CGM': { shipments: 5, onTime: 4, isDelayed: 1, totalDays: 45 },
  };

  Object.entries(defaults).forEach(([name, data]) => {
    if (!map[name]) map[name] = data;
  });

  return Object.entries(map)
    .map(([carrier, data]) => ({
      carrier,
      shipments: data.shipments,
      onTime: data.onTime,
      isDelayed: data.isDelayed,
      avgDays: data.shipments > 0 ? Math.round(data.totalDays / data.shipments) : 0,
    }))
    .sort((a, b) => b.shipments - a.shipments);
}

/* ─── Delivery time distribution ─────────────────────────────────────── */
export function computeDeliveryDistribution(shipments: Shipment[]): DeliveryDistribution[] {
  const buckets: Record<string, number> = {
    '1-3 days': 0,
    '4-7 days': 0,
    '8-14 days': 0,
    '15-21 days': 0,
    '22+ days': 0,
  };

  shipments.forEach(s => {
    const start = new Date(s.shipmentDate).getTime();
    const end = new Date(s.deadline).getTime();
    const days = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));

    if (days <= 3) buckets['1-3 days']++;
    else if (days <= 7) buckets['4-7 days']++;
    else if (days <= 14) buckets['8-14 days']++;
    else if (days <= 21) buckets['15-21 days']++;
    else buckets['22+ days']++;
  });

  // Add mock baseline if all zero
  if (Object.values(buckets).every(v => v === 0)) {
    buckets['1-3 days'] = 3;
    buckets['4-7 days'] = 8;
    buckets['8-14 days'] = 14;
    buckets['15-21 days'] = 6;
    buckets['22+ days'] = 2;
  }

  return Object.entries(buckets).map(([range, count]) => ({ range, count }));
}
