import { AIEtaPrediction, DelayEvaluation, ShipmentTracking } from '../types';

/**
 * Simulates an AI Engine predicting Estimated Time of Arrival.
 * Uses distance (rough estimate via progress), historical mock factors, and carrier data.
 */
export const predictETA = (
  trackingData: ShipmentTracking,
  deadlineISO: string
): { aiEta: AIEtaPrediction; delayAlert: DelayEvaluation } => {
  // Base the prediction on the provided estimated delivery or a default offset
  const baseEstimate = trackingData.estimated_delivery || trackingData.estimatedArrival;
  let predictedMs = baseEstimate ? new Date(baseEstimate).getTime() : Date.now() + 7 * 24 * 60 * 60 * 1000;

  let confidenceScore = 95;
  const factors: string[] = [];

  // Simulate AI evaluating historical data based on route/carrier
  const isDelayedByWeather = Math.random() > 0.8;
  const isPortCongested = trackingData.currentLocation?.toLowerCase().includes('port') && Math.random() > 0.6;
  const isCustomsHold = trackingData.currentStatus?.toLowerCase().includes('customs');

  if (isDelayedByWeather) {
    predictedMs += 2 * 24 * 60 * 60 * 1000; // adding 2 days
    confidenceScore -= 10;
    factors.push('Adverse weather conditions on active route');
  }

  if (isPortCongested) {
    predictedMs += 1.5 * 24 * 60 * 60 * 1000;
    confidenceScore -= 5;
    factors.push('High congestion at current port/hub');
  }

  if (isCustomsHold) {
    predictedMs += 3 * 24 * 60 * 60 * 1000;
    confidenceScore -= 15;
    factors.push('Awaiting customs clearance documentation');
  }
  
  // If no negative factors, add a positive one
  if (factors.length === 0) {
    factors.push('Carrier performing optimally on this lane');
    factors.push('Clear weather patterns detected');
  }

  const predictedArrival = new Date(predictedMs);
  const deadline = new Date(deadlineISO);

  // Calculate delay compared to deadline
  const timeDifferenceMs = predictedArrival.getTime() - deadline.getTime();
  const daysDelayed = Math.max(0, Math.ceil(timeDifferenceMs / (1000 * 60 * 60 * 24)));
  const isDelayed = daysDelayed > 0;

  return {
    aiEta: {
      predictedArrival: predictedArrival.toISOString(),
      confidenceScore: Math.max(50, confidenceScore), // Minimum 50% confidence cap
      factors
    },
    delayAlert: {
      isDelayed,
      daysDelayed
    }
  };
};
