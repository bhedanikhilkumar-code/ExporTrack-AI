export interface Payment {
  id: string;
  referenceNo: string; // e.g., UTR / Swift tracking
  buyerId: string;
  invoiceId?: string; // Optional: Which invoice this payment applies to
  amount: number;
  currency: string;
  date: string;
  method: 'Wire Transfer' | 'Letter of Credit' | 'Credit Card' | 'Other';
  status: 'Pending' | 'Completed' | 'Failed';
  notes?: string;
  createdAt?: string;
}
