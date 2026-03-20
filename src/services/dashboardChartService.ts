import { Shipment, ShipmentDocument } from '../types';
import { normalizeStatus } from './shipmentStatusService';

/**
 * Dashboard Chart Data Service
 * Processes shipment and document data into chart-ready formats
 */

export interface ChartDataPoint {
    name: string;
    value: number;
    color?: string;
}

export interface MonthlyDataPoint {
    month: string;
    shipments: number;
    documents: number;
}

export interface StatusCount {
    status: string;
    count: number;
    color: string;
}

// Status color mapping for charts
const STATUS_COLORS: Record<string, string> = {
    'Draft': '#64748b',      // slate-500
    'Booked': '#3b82f6',     // blue-500
    'In Transit': '#f97316', // orange-500
    'Customs Clearance': '#a855f7', // purple-500
    'Delivered': '#22c55e',  // green-500
    'Delayed': '#ef4444',     // red-500
};

/**
 * Get shipment status distribution for pie/donut chart
 */
export function getShipmentStatusCounts(shipments: Shipment[]): StatusCount[] {
    const statusMap: Record<string, number> = {};

    shipments.forEach(shipment => {
        const status = normalizeStatus(shipment.status);
        statusMap[status] = (statusMap[status] || 0) + 1;
    });

    return Object.entries(statusMap).map(([status, count]) => ({
        status,
        count,
        color: STATUS_COLORS[status] || '#64748b'
    }));
}

/**
 * Get monthly shipment data for bar chart
 */
export function getMonthlyShipments(shipments: Shipment[], months: number = 6): MonthlyDataPoint[] {
    const now = new Date();
    const result: MonthlyDataPoint[] = [];

    for (let i = months - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStr = date.toLocaleDateString('en-US', { month: 'short' });
        const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

        const monthShipments = shipments.filter(s => {
            const shipmentDate = new Date(s.shipmentDate);
            return shipmentDate.getMonth() === date.getMonth() &&
                shipmentDate.getFullYear() === date.getFullYear();
        });

        const monthDocuments = monthShipments.reduce((sum, s) => sum + s.documents.length, 0);

        result.push({
            month: monthYear,
            shipments: monthShipments.length,
            documents: monthDocuments
        });
    }

    return result;
}

/**
 * Get document statistics for line chart
 */
export function getDocumentStats(shipments: Shipment[], months: number = 6): MonthlyDataPoint[] {
    return getMonthlyShipments(shipments, months); // Same as monthly shipments but focuses on documents
}

/**
 * Get active vs completed shipments for donut chart
 */
export function getActiveVsCompleted(shipments: Shipment[]): StatusCount[] {
    let active = 0;
    let completed = 0;

    shipments.forEach(shipment => {
        const status = normalizeStatus(shipment.status);
        if (status === 'Delivered') {
            completed++;
        } else if (status !== 'Draft') {
            active++;
        }
    });

    return [
        { status: 'Active', count: active, color: STATUS_COLORS['In Transit'] },
        { status: 'Completed', count: completed, color: STATUS_COLORS['Delivered'] }
    ];
}

/**
 * Get delivery performance data
 */
export function getDeliveryPerformance(shipments: Shipment[]): { onTime: number; delayed: number } {
    let onTime = 0;
    let delayed = 0;

    shipments.forEach(shipment => {
        const status = normalizeStatus(shipment.status);
        if (status === 'Delivered') {
            if (shipment.isDelayed) {
                delayed++;
            } else {
                onTime++;
            }
        }
    });

    return { onTime, delayed };
}

/**
 * Demo/mock data for demo users
 */
export function getDemoChartData() {
    return {
        statusDistribution: [
            { status: 'Draft', count: 3, color: STATUS_COLORS['Draft'] },
            { status: 'Booked', count: 5, color: STATUS_COLORS['Booked'] },
            { status: 'In Transit', count: 8, color: STATUS_COLORS['In Transit'] },
            { status: 'Customs Clearance', count: 2, color: STATUS_COLORS['Customs Clearance'] },
            { status: 'Delivered', count: 12, color: STATUS_COLORS['Delivered'] }
        ],
        monthlyData: [
            { month: 'Oct 24', shipments: 4, documents: 12 },
            { month: 'Nov 24', shipments: 6, documents: 18 },
            { month: 'Dec 24', shipments: 5, documents: 15 },
            { month: 'Jan 25', shipments: 8, documents: 24 },
            { month: 'Feb 25', shipments: 7, documents: 21 },
            { month: 'Mar 25', shipments: 10, documents: 30 }
        ],
        activeVsCompleted: [
            { status: 'Active', count: 18, color: STATUS_COLORS['In Transit'] },
            { status: 'Completed', count: 12, color: STATUS_COLORS['Delivered'] }
        ],
        deliveryPerformance: { onTime: 10, delayed: 2 }
    };
}
