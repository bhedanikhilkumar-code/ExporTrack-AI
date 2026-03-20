import { DriverTelemetry, ShipmentTracking } from '../types';

/**
 * RealTimeService
 * Simulates a WebSocket/SSE connection for driver telemetry updates.
 * In a real app, this would use Socket.io or native WebSockets.
 */

type TelemetryCallback = (telemetry: DriverTelemetry) => void;

class RealTimeService {
  private listeners: Map<string, TelemetryCallback[]> = new Map();
  private intervals: Map<string, any> = new Map();

  /**
   * Subscribe to live driver updates for a specific shipment
   */
  subscribe(shipmentId: string, callback: TelemetryCallback) {
    const shipmentListeners = this.listeners.get(shipmentId) || [];
    this.listeners.set(shipmentId, [...shipmentListeners, callback]);

    // Start simulation if not already running for this shipment
    if (!this.intervals.has(shipmentId)) {
      this.startSimulation(shipmentId);
    }
  }

  /**
   * Unsubscribe from updates
   */
  unsubscribe(shipmentId: string, callback: TelemetryCallback) {
    const shipmentListeners = this.listeners.get(shipmentId) || [];
    const filtered = shipmentListeners.filter(cb => cb !== callback);
    
    if (filtered.length === 0) {
      this.stopSimulation(shipmentId);
      this.listeners.delete(shipmentId);
    } else {
      this.listeners.set(shipmentId, filtered);
    }
  }

  private startSimulation(shipmentId: string) {
    // Initial telemetry state
    let lat = 34.0522 + (Math.random() - 0.5) * 0.1;
    let lng = -118.2437 + (Math.random() - 0.5) * 0.1;
    let heading = Math.random() * 360;

    const interval = setInterval(() => {
      // Simulate movement: move slightly in the direction of heading
      const speed = 45 + Math.random() * 15; // km/h
      const step = (speed / 3600) * 0.01; // very rough deg per second
      
      lat += Math.cos(heading * (Math.PI / 180)) * step;
      lng += Math.sin(heading * (Math.PI / 180)) * step;
      
      // Occasionally change heading
      if (Math.random() > 0.8) {
        heading += (Math.random() - 0.5) * 45;
      }

      const telemetry: DriverTelemetry = {
        driverId: `DRV-${shipmentId.slice(-4)}`,
        shipmentId,
        latitude: lat,
        longitude: lng,
        speed: Math.round(speed),
        heading: Math.round(heading),
        timestamp: new Date().toISOString()
      };

      // Broadcast to all listeners
      const shipmentListeners = this.listeners.get(shipmentId) || [];
      shipmentListeners.forEach(cb => cb(telemetry));
    }, 1500); // 1.5s updates for "Uber-like" feel

    this.intervals.set(shipmentId, interval as any);
  }

  private stopSimulation(shipmentId: string) {
    const interval = this.intervals.get(shipmentId);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(shipmentId);
    }
  }
}

export const realTimeService = new RealTimeService();
