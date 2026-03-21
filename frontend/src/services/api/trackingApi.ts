import { TrackingInfo } from '../../types/tracking';

export const trackingApi = {
  async getAll(): Promise<TrackingInfo[]> {
    const response = await fetch('/api/trackings');
    if (!response.ok) throw new Error('Failed to fetch trackings');
    return response.json();
  },

  async save(tracking: TrackingInfo): Promise<void> {
    const response = await fetch('/api/trackings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tracking)
    });
    if (!response.ok) throw new Error('Failed to save tracking');
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`/api/trackings/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete tracking');
  }
};
