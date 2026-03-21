export interface Buyer {
  id: string;
  type: 'buyer';
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  currency: string; // preferred currency: USD, EUR, GBP, AED
  paymentTerms: string; // e.g. "30 days LC", "Advance", "DP"
  creditLimit?: number;
  notes?: string;
  tags?: string[]; // e.g. ["repeat", "high-value", "europe"]
  totalOrders?: number;
  totalValue?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  type: 'supplier';
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  gstin?: string;
  panNo?: string;
  productCategories: string[];
  paymentTerms: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
