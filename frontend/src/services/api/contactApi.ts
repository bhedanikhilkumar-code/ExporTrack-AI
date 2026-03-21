import { Buyer } from '../../types/contact';

export const contactApi = {
  async getBuyers(): Promise<Buyer[]> {
    const response = await fetch('/api/buyers');
    if (!response.ok) throw new Error('Failed to fetch buyers');
    return response.json();
  },

  async saveBuyer(buyer: Buyer): Promise<void> {
    const response = await fetch('/api/buyers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buyer)
    });
    if (!response.ok) throw new Error('Failed to save buyer');
  },

  async getSuppliers(): Promise<any[]> {
    const response = await fetch('/api/suppliers');
    if (!response.ok) throw new Error('Failed to fetch suppliers');
    return response.json();
  },

  async saveSupplier(supplier: any): Promise<void> {
    const response = await fetch('/api/suppliers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(supplier)
    });
    if (!response.ok) throw new Error('Failed to save supplier');
  }
};
