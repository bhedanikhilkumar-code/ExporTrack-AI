/**
 * Email Notification Service (Frontend)
 * Calls the /api/send-notification serverless function
 * to send real email notifications for shipment events
 */

type NotificationEvent =
    | 'shipment_created'
    | 'shipment_dispatched'
    | 'shipment_delayed'
    | 'shipment_delivered'
    | 'document_missing'
    | 'document_verified'
    | 'deadline_reminder';

interface NotificationPayload {
    event: NotificationEvent;
    recipientEmail: string;
    recipientName: string;
    shipmentId: string;
    clientName?: string;
    destination?: string;
    status?: string;
    documentType?: string;
    deadline?: string;
    daysUntilDeadline?: number;
    trackingUrl?: string;
    notes?: string;
}

interface NotificationResult {
    success: boolean;
    messageId?: string;
    error?: string;
}

const API_BASE = import.meta.env.VITE_API_BASE || '';

/**
 * Send a shipment notification email
 */
export async function sendShipmentNotification(
    payload: NotificationPayload
): Promise<NotificationResult> {
    try {
        const response = await fetch(`${API_BASE}/api/send-notification`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Unknown error' }));
            return { success: false, error: error.error || 'Failed to send notification' };
        }

        const result = await response.json();
        return { success: true, messageId: result.messageId };
    } catch (err) {
        console.error('Email notification error:', err);
        return { success: false, error: 'Network error — could not send notification' };
    }
}

/**
 * Notify when a new shipment is created
 */
export async function notifyShipmentCreated(params: {
    recipientEmail: string;
    recipientName: string;
    shipmentId: string;
    clientName: string;
    destination: string;
    deadline: string;
}): Promise<NotificationResult> {
    return sendShipmentNotification({
        event: 'shipment_created',
        trackingUrl: `${window.location.origin}/shipments/${params.shipmentId}`,
        ...params,
    });
}

/**
 * Notify when shipment is dispatched / in transit
 */
export async function notifyShipmentDispatched(params: {
    recipientEmail: string;
    recipientName: string;
    shipmentId: string;
    clientName: string;
    destination: string;
    status: string;
}): Promise<NotificationResult> {
    return sendShipmentNotification({
        event: 'shipment_dispatched',
        trackingUrl: `${window.location.origin}/shipments/${params.shipmentId}/tracking`,
        ...params,
    });
}

/**
 * Notify when shipment is delayed
 */
export async function notifyShipmentDelayed(params: {
    recipientEmail: string;
    recipientName: string;
    shipmentId: string;
    clientName: string;
    destination: string;
    notes?: string;
}): Promise<NotificationResult> {
    return sendShipmentNotification({
        event: 'shipment_delayed',
        trackingUrl: `${window.location.origin}/shipments/${params.shipmentId}`,
        ...params,
    });
}

/**
 * Notify when shipment is delivered
 */
export async function notifyShipmentDelivered(params: {
    recipientEmail: string;
    recipientName: string;
    shipmentId: string;
    clientName: string;
    destination: string;
}): Promise<NotificationResult> {
    return sendShipmentNotification({
        event: 'shipment_delivered',
        ...params,
    });
}

/**
 * Notify about missing document
 */
export async function notifyDocumentMissing(params: {
    recipientEmail: string;
    recipientName: string;
    shipmentId: string;
    clientName: string;
    documentType: string;
    deadline?: string;
}): Promise<NotificationResult> {
    return sendShipmentNotification({
        event: 'document_missing',
        trackingUrl: `${window.location.origin}/shipments/${params.shipmentId}/upload`,
        ...params,
    });
}

/**
 * Notify when document is verified
 */
export async function notifyDocumentVerified(params: {
    recipientEmail: string;
    recipientName: string;
    shipmentId: string;
    documentType: string;
}): Promise<NotificationResult> {
    return sendShipmentNotification({
        event: 'document_verified',
        ...params,
    });
}

/**
 * Send deadline reminder
 */
export async function notifyDeadlineReminder(params: {
    recipientEmail: string;
    recipientName: string;
    shipmentId: string;
    clientName: string;
    destination: string;
    deadline: string;
    daysUntilDeadline: number;
}): Promise<NotificationResult> {
    return sendShipmentNotification({
        event: 'deadline_reminder',
        trackingUrl: `${window.location.origin}/shipments/${params.shipmentId}`,
        ...params,
    });
}

/**
 * Check for upcoming deadlines and send reminders (call this daily)
 */
export async function checkAndSendDeadlineReminders(
    shipments: Array<{
        id: string;
        clientName: string;
        destinationCountry: string;
        deadline: string;
        assignedTo: string;
        status: string;
    }>,
    getUserEmail: (name: string) => string | undefined
): Promise<void> {
    const today = new Date();

    for (const shipment of shipments) {
        if (shipment.status === 'Delivered') continue;

        const deadlineDate = new Date(shipment.deadline);
        const daysUntil = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        // Send reminder at 7 days, 3 days, and 1 day before deadline
        if ([7, 3, 1].includes(daysUntil)) {
            const email = getUserEmail(shipment.assignedTo);
            if (email) {
                await notifyDeadlineReminder({
                    recipientEmail: email,
                    recipientName: shipment.assignedTo,
                    shipmentId: shipment.id,
                    clientName: shipment.clientName,
                    destination: shipment.destinationCountry,
                    deadline: shipment.deadline,
                    daysUntilDeadline: daysUntil,
                });
            }
        }
    }
}
