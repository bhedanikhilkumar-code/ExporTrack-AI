/**
 * Commercial Invoice Type Definitions
 */

import { DocumentStatus, LinkedDocument } from '../utils/documentUtils';

export interface CommercialInvoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  status: DocumentStatus;
  exporterDetails: {
    name: string;
    address: string;
    gstin: string;
    iec: string;
    pan: string;
    state: string;
    stateCode: string;
  };
  buyerDetails: {
    name: string;
    address: string;
    country: string;
    buyerOrderNo: string;
    buyerOrderDate: string;
  };
  shipmentDetails: {
    portOfLoading: string;
    portOfDischarge: string;
    finalDestination: string;
    vesselFlightNo: string;
    billOfLadingNo: string;
    termsOfDelivery: string; // Incoterms
    currency: string;
    paymentTerms: string;
  };
  items: InvoiceItem[];
  bankDetails: {
    bankName: string;
    accountNo: string;
    swiftCode: string;
    ifscCode: string;
    branchAddress: string;
  };
  declaration: string;
  authorizedSignatory: string;
  copyType?: 'Original' | 'Duplicate' | 'Triplicate';
  linkedDocuments?: LinkedDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  srNo: number;
  description: string;
  hsCode: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  netWeight: number;
  grossWeight: number;
}

export const INCOTERMS = ['FOB', 'CIF', 'CFR', 'EXW', 'DDP', 'DAP', 'FCA', 'CPT', 'CIP', 'DPU'] as const;

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'AED', 'JPY', 'SGD', 'AUD', 'CAD', 'CHF'] as const;

export const UNITS = ['PCS', 'KGS', 'MTS', 'LTR', 'SET', 'DOZ', 'PKG', 'CTN', 'BOX', 'NOS', 'SQM', 'CBM'] as const;

export function createEmptyInvoice(): Omit<CommercialInvoice, 'id' | 'invoiceNumber' | 'createdAt' | 'updatedAt'> {
  return {
    invoiceDate: new Date().toISOString().slice(0, 10),
    status: 'Draft',
    exporterDetails: { name: '', address: '', gstin: '', iec: '', pan: '', state: '', stateCode: '' },
    buyerDetails: { name: '', address: '', country: '', buyerOrderNo: '', buyerOrderDate: '' },
    shipmentDetails: { portOfLoading: '', portOfDischarge: '', finalDestination: '', vesselFlightNo: '', billOfLadingNo: '', termsOfDelivery: 'FOB', currency: 'USD', paymentTerms: '' },
    items: [{ srNo: 1, description: '', hsCode: '', quantity: 0, unit: 'PCS', unitPrice: 0, totalPrice: 0, netWeight: 0, grossWeight: 0 }],
    bankDetails: { bankName: '', accountNo: '', swiftCode: '', ifscCode: '', branchAddress: '' },
    declaration: 'We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.',
    authorizedSignatory: '',
    copyType: 'Original',
    linkedDocuments: [],
  };
}
