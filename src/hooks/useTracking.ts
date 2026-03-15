import { useState, useEffect, useCallback } from 'react';
import { ShipmentTracking } from '../types';
import { getShipmentTracking, simulateTrackingUpdate } from '../services/trackingApi';
import { realTimeService } from '../services/realTimeService';

interface UseTrackingResult {
  trackingData: ShipmentTracking | null;
  loading: boolean;
  error: string | null;
  lastPolled: Date | null;
  forceRefresh: () => Promise<void>;
}

export const useTracking = (shipmentId: string, destinationCountry: string, pollingIntervalMs: number = 10000): UseTrackingResult => {
  const [trackingData, setTrackingData] = useState<ShipmentTracking | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastPolled, setLastPolled] = useState<Date | null>(null);

  const fetchTracking = useCallback(async (isPolling = false) => {
    if (!isPolling) setLoading(true);
    try {
      // In a real app we would just call getShipmentTracking.
      // Since this is a mock frontend and we want to simulate live GPS updates,
      // if it's a polling tick, we simulate an API webhook pushing a new GPS coordinate.
      let data: ShipmentTracking;
      if (isPolling && trackingData) {
        data = simulateTrackingUpdate(shipmentId, destinationCountry);
      } else {
        data = await getShipmentTracking(shipmentId, destinationCountry);
      }
      
      setTrackingData(data);
      setLastPolled(new Date());
      setError(null);
    } catch (err) {
      setError('Failed to load tracking data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [shipmentId, destinationCountry, trackingData]);

  // Initial fetch
  useEffect(() => {
    fetchTracking(false);
  }, [shipmentId]); // intentional omit of fetchTracking to avoid infinite loop

  // Polling setup
  useEffect(() => {
    if (!shipmentId) return;

    const intervalId = setInterval(() => {
      // We only poll if we're not already delivered
      setTrackingData(prev => {
        if (prev?.currentStatus === 'Delivered') {
          clearInterval(intervalId);
          return prev;
        }
        return prev;
      });
      fetchTracking(true);
    }, pollingIntervalMs);

    // Real-Time Telemetry Subscription
    const handleTelemetry = (tele: any) => {
      setTrackingData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          latitude: tele.latitude,
          longitude: tele.longitude,
          driverTele: tele,
          lastUpdatedTime: tele.timestamp
        };
      });
    };

    realTimeService.subscribe(shipmentId, handleTelemetry);

    return () => {
      clearInterval(intervalId);
      realTimeService.unsubscribe(shipmentId, handleTelemetry);
    };
  }, [shipmentId, fetchTracking, pollingIntervalMs]);

  return {
    trackingData,
    loading,
    error,
    lastPolled,
    forceRefresh: () => fetchTracking(false)
  };
};
