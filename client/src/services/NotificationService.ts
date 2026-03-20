import { Shipment, NotificationEventType } from '../types';

/**
 * Enterprise Service mimicking a robust backend webhook & notification delivery system.
 * Dispatches alerts conditionally based on the logistics pipeline events.
 */
class NotificationEngine {
  
  /**
   * Processes an incoming system event and determines if a notification is required.
   */
  public async trigger(
    event: NotificationEventType, 
    shipment: Shipment, 
    addNotificationToState: (n: any) => void
  ) {
    console.log(`[NotificationService] Received event: ${event} for Shipment: ${shipment.id}`);
    
    try {
      // 1. Shipment Created
      if (event === 'shipment_created') {
        const payload = {
          id: `notif-${Date.now()}-created`,
          shipmentId: shipment.id,
          type: 'Approval Delay' as const, // Reusing existing app types for simplicity
          severity: 'Low' as const,
          title: 'Shipment Created',
          message: `New shipment ${shipment.id} destined for ${shipment.destinationCountry} has been successfully logged.`,
          createdAt: new Date().toISOString(),
          dueDate: shipment.deadline,
          read: false,
        };
        addNotificationToState(payload);
        this.logDispatch('Email', shipment.clientName, `Shipment ${shipment.id} Created`);
      }

      // 2. Shipment Dispatched / In Transit
      if (event === 'shipment_dispatched') {
        const payload = {
          id: `notif-${Date.now()}-dispatch`,
          shipmentId: shipment.id,
          type: 'Approval Delay' as const,
          severity: 'Medium' as const,
          title: 'Shipment Dispatched',
          message: `Shipment ${shipment.id} is now In Transit via container ${shipment.containerNumber}.`,
          createdAt: new Date().toISOString(),
          dueDate: shipment.deadline,
          read: false,
        };
        addNotificationToState(payload);
        this.logDispatch('Email', shipment.clientName, `Shipment ${shipment.id} is In Transit`);
      }

      // 3. Shipment Delayed
      if (event === 'shipment_delayed') {
        const payload = {
          id: `notif-${Date.now()}-delay`,
          shipmentId: shipment.id,
          type: 'Deadline' as const,
          severity: 'High' as const,
          title: 'Delay Alert Detected',
          message: `Shipment ${shipment.id} ETA is past strict deadline. Delivery to ${shipment.destinationCountry} will be late.`,
          createdAt: new Date().toISOString(),
          dueDate: shipment.deadline,
          read: false,
        };
        addNotificationToState(payload);
        this.logDispatch('SMS', shipment.clientName, `URGENT: Shipment ${shipment.id} has a delayed ETA.`);
      }

      // 4. Shipment Delivered
      if (event === 'shipment_delivered') {
        const payload = {
          id: `notif-${Date.now()}-delivered`,
          shipmentId: shipment.id,
          type: 'Missing Docs' as const,
          severity: 'Low' as const,
          title: 'Shipment Delivered',
          message: `Success! Shipment ${shipment.id} arrived in ${shipment.destinationCountry}.`,
          createdAt: new Date().toISOString(),
          dueDate: shipment.deadline,
          read: false,
        };
        addNotificationToState(payload);
        this.logDispatch('Email', shipment.clientName, `Shipment ${shipment.id} Delivered Successfully`);
      }

    } catch (error) {
      console.error(`[NotificationService] Error executing dispatch for ${event}:`, error);
    }
  }

  /**
   * Helper simulating external API deliveries (SendGrid, Twilio, etc)
   */
  private logDispatch(channel: 'Email' | 'SMS' | 'Push', recipient: string, subject: string) {
    const time = new Date().toLocaleTimeString();
    console.log(
      `%c[${time}] Dispatching ${channel} -> ${recipient}: "${subject}"`, 
      'color: #10b981; font-weight: bold;'
    );
  }

}

export const NotificationService = new NotificationEngine();
