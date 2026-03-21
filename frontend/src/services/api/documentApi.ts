import { CommercialInvoice } from '../../types/invoice';
import { PackingList } from '../../types/packingList';
import { ShippingBill } from '../../types/shippingBill';
import { CertificateOfOrigin } from '../../types/certificateOfOrigin';

export const documentApi = {
  // Invoices
  async getInvoices(): Promise<CommercialInvoice[]> {
    const res = await fetch('/api/documents/invoices');
    if (!res.ok) throw new Error('Failed to fetch invoices');
    return res.json();
  },
  async saveInvoice(invoice: CommercialInvoice): Promise<void> {
    const res = await fetch('/api/documents/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invoice)
    });
    if (!res.ok) throw new Error('Failed to save invoice');
  },
  async deleteInvoice(id: string): Promise<void> {
    const res = await fetch(`/api/documents/invoices/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete invoice');
  },

  // Packing Lists
  async getPackingLists(): Promise<PackingList[]> {
    const res = await fetch('/api/documents/packing-lists');
    if (!res.ok) throw new Error('Failed to fetch packing lists');
    return res.json();
  },
  async savePackingList(pl: PackingList): Promise<void> {
    const res = await fetch('/api/documents/packing-lists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pl)
    });
    if (!res.ok) throw new Error('Failed to save packing list');
  },
  async deletePackingList(id: string): Promise<void> {
    const res = await fetch(`/api/documents/packing-lists/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete packing list');
  },

  // Shipping Bills
  async getShippingBills(): Promise<ShippingBill[]> {
    const res = await fetch('/api/documents/shipping-bills');
    if (!res.ok) throw new Error('Failed to fetch shipping bills');
    return res.json();
  },
  async saveShippingBill(sb: ShippingBill): Promise<void> {
    const res = await fetch('/api/documents/shipping-bills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sb)
    });
    if (!res.ok) throw new Error('Failed to save shipping bill');
  },
  async deleteShippingBill(id: string): Promise<void> {
    const res = await fetch(`/api/documents/shipping-bills/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete shipping bill');
  },

  // Certificate of Origin
  async getCOOs(): Promise<CertificateOfOrigin[]> {
    const res = await fetch('/api/documents/coos');
    if (!res.ok) throw new Error('Failed to fetch COOs');
    return res.json();
  },
  async saveCOO(coo: CertificateOfOrigin): Promise<void> {
    const res = await fetch('/api/documents/coos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(coo)
    });
    if (!res.ok) throw new Error('Failed to save COO');
  },
  async deleteCOO(id: string): Promise<void> {
    const res = await fetch(`/api/documents/coos/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete COO');
  }
};
