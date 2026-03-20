import { Shipment, ShipmentStatus } from '../types';

/**
 * Shipment Status Automation Service
 * 
 * Automates shipment lifecycle status based on user actions:
 * - Document uploads
 * - Date changes
 * - Field updates
 * 
 * Only applies to real users; demo users get static/mock status.
 */

export type AutomationStatus = 'Draft' | 'Booked' | 'In Transit' | 'Customs Clearance' | 'Delivered';

// Status color mapping for UI
export const STATUS_COLORS: Record<AutomationStatus, { bg: string; text: string; border: string; dot: string }> = {
    'Draft': {
        bg: 'bg-slate-50',
        text: 'text-slate-700',
        border: 'border-slate-200',
        dot: 'bg-slate-500'
    },
    'Booked': {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        dot: 'bg-blue-500'
    },
    'In Transit': {
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        border: 'border-orange-200',
        dot: 'bg-orange-500'
    },
    'Customs Clearance': {
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-200',
        dot: 'bg-purple-500'
    },
    'Delivered': {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500'
    }
};

// Status order for progress tracking
export const STATUS_ORDER: AutomationStatus[] = [
    'Draft',
    'Booked',
    'In Transit',
    'Customs Clearance',
    'Delivered'
];

/**
 * Determines if automation should run based on user mode
 */
export function isRealUser(userMode: string | undefined): boolean {
    return userMode === 'real';
}

/**
 * Get current step index (0-4) for progress bar
 */
export function getStatusStep(status: ShipmentStatus | AutomationStatus): number {
    const normalizedStatus = normalizeStatus(status);
    return STATUS_ORDER.indexOf(normalizedStatus);
}

/**
 * Normalize legacy status to new automation status
 */
export function normalizeStatus(status: ShipmentStatus | AutomationStatus): AutomationStatus {
    const statusMap: Record<string, AutomationStatus> = {
        'Shipment Created': 'Draft',
        'Draft': 'Draft',
        'Booked': 'Booked',
        'Driver Assigned': 'Booked',
        'Picked Up': 'Booked',
        'In Transit': 'In Transit',
        'Reached Hub': 'In Transit',
        'Out For Delivery': 'In Transit',
        'Customs Clearance': 'Customs Clearance',
        'Customs Hold': 'Customs Clearance',
        'Awaiting Documents': 'Customs Clearance',
        'Under Verification': 'Customs Clearance',
        'Under Review': 'Customs Clearance',
        'Delivered': 'Delivered',
        'Delayed': 'In Transit' // Delayed still in transit
    };

    return statusMap[status] || 'Draft';
}

/**
 * Core function: Determine shipment status based on data
 * 
 * Rules:
 * - If no booking details → Draft
 * - If booking details added → Booked  
 * - If departure date added → In Transit
 * - If customs document uploaded → Customs Clearance
 * - If delivery date added → Delivered
 */
export function calculateShipmentStatus(shipment: Partial<Shipment>): AutomationStatus {
    // Priority: Delivered > Customs > In Transit > Booked > Draft

    // Check delivery date → Delivered
    if (shipment.deliveryDate || shipment.estimatedDeliveryTime) {
        return 'Delivered';
    }

    // Check customs documents
    const hasCustomsDoc = shipment.documents?.some(doc =>
        doc.type === 'Customs Files' ||
        doc.type === 'Shipping Bill' ||
        doc.type === 'Bill of Lading'
    );
    if (hasCustomsDoc) {
        return 'Customs Clearance';
    }

    // Check departure date → In Transit
    if (shipment.shipmentDate) {
        return 'In Transit';
    }

    // Check booking details (container number, assigned driver) → Booked
    if (shipment.containerNumber || shipment.driverName || shipment.trackingId) {
        return 'Booked';
    }

    // Default → Draft
    return 'Draft';
}

/**
 * Update shipment status based on current data
 * Returns new status if changed, null otherwise
 */
export function updateShipmentStatus(
    shipment: Shipment,
    userMode?: string
): { newStatus: AutomationStatus; timelineEvent?: { status: AutomationStatus; timestamp: string; note: string } } | null {
    // Skip automation for demo users
    if (!isRealUser(userMode)) {
        return null;
    }

    const currentStatus = normalizeStatus(shipment.status);
    const newStatus = calculateShipmentStatus(shipment);

    // No change needed
    if (newStatus === currentStatus) {
        return null;
    }

    // Generate timeline event
    const statusNotes: Record<AutomationStatus, string> = {
        'Draft': 'Shipment created and saved as draft',
        'Booked': 'Shipment has been booked with carrier',
        'In Transit': 'Shipment has departed and is in transit',
        'Customs Clearance': 'Customs documentation uploaded',
        'Delivered': 'Shipment has been delivered'
    };

    const timelineEvent = {
        status: newStatus,
        timestamp: new Date().toISOString(),
        note: statusNotes[newStatus]
    };

    return { newStatus, timelineEvent };
}

/**
 * Get progress percentage (0-100)
 */
export function getProgressPercentage(status: ShipmentStatus | AutomationStatus): number {
    const step = getStatusStep(status);
    return ((step + 1) / STATUS_ORDER.length) * 100;
}

/**
 * Check if shipment is delayed
 */
export function isShipmentDelayed(shipment: Shipment): boolean {
    if (shipment.isDelayed) return true;

    const deadline = shipment.deadline ? new Date(shipment.deadline) : null;
    const now = new Date();

    // If deadline passed and not delivered
    if (deadline && deadline < now) {
        const currentStatus = normalizeStatus(shipment.status);
        return currentStatus !== 'Delivered';
    }

    return false;
}

/**
 * Get shipment counts for dashboard
 */
export function getShipmentCounts(shipments: Shipment[]): {
    active: number;
    completed: number;
    delayed: number;
    draft: number;
} {
    const counts = {
        active: 0,
        completed: 0,
        delayed: 0,
        draft: 0
    };

    shipments.forEach(shipment => {
        const status = normalizeStatus(shipment.status);

        switch (status) {
            case 'Booked':
            case 'In Transit':
            case 'Customs Clearance':
                counts.active++;
                break;
            case 'Delivered':
                counts.completed++;
                break;
            case 'Draft':
                counts.draft++;
                break;
        }

        if (isShipmentDelayed(shipment)) {
            counts.delayed++;
        }
    });

    return counts;
}
