/**
 * Shipping Bill Type Definitions (India ICEGATE Format)
 */
import { DocumentStatus, LinkedDocument } from '../utils/documentUtils';

export type ShippingBillStatus = 'Draft' | 'Filed' | 'LEO' | 'EGM Filed' | 'Cancelled';

export interface ShippingBill {
  id: string;
  sbNumber: string;
  sbDate: string;
  status: ShippingBillStatus;
  customsStation: string;
  portCode: string;
  exporterDetails: {
    name: string;
    address: string;
    iec: string;
    pan: string;
    gstin: string;
    adCode: string;
  };
  consigneeDetails: {
    name: string;
    address: string;
    country: string;
  };
  exportScheme: ExportScheme;
  shipmentDetails: {
    natureOfCargo: 'General' | 'Dangerous' | 'Perishable' | 'Liquid Bulk';
    modeOfTransport: 'Sea' | 'Air' | 'Road' | 'Rail';
    portOfLoading: string;
    countryOfDestination: string;
    portOfFinalDestination: string;
    vessel: string;
    rotationNo: string;
  };
  items: ShippingBillItem[];
  totalFOBValueINR: number;
  totalFOBValueForeign: number;
  currency: string;
  exchangeRate: number;
  drawbackDetails?: {
    dbkTableSrNo: string;
    rate: number;
    amount: number;
  };
  linkedDocuments?: LinkedDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface ShippingBillItem {
  srNo: number;
  description: string;
  hsCode: string;
  quantity: number;
  unit: string;
  fobValueINR: number;
  fobValueForeign: number;
  dutyRate?: number;
  cessRate?: number;
  igstRate?: number;
}

export type ExportScheme =
  | 'Free Shipping Bill'
  | 'Drawback'
  | 'EPCG'
  | 'Advance Authorisation'
  | 'MEIS / RoDTEP'
  | 'EOU / STP / EHTP'
  | 'SEZ';

export const EXPORT_SCHEMES: ExportScheme[] = [
  'Free Shipping Bill',
  'Drawback',
  'EPCG',
  'Advance Authorisation',
  'MEIS / RoDTEP',
  'EOU / STP / EHTP',
  'SEZ',
];

export const SB_STATUS_FLOW: ShippingBillStatus[] = ['Draft', 'Filed', 'LEO', 'EGM Filed'];

export function createEmptyShippingBill(): Omit<ShippingBill, 'id' | 'sbNumber' | 'createdAt' | 'updatedAt'> {
  return {
    sbDate: new Date().toISOString().slice(0, 10),
    status: 'Draft',
    customsStation: '',
    portCode: '',
    exporterDetails: { name: '', address: '', iec: '', pan: '', gstin: '', adCode: '' },
    consigneeDetails: { name: '', address: '', country: '' },
    exportScheme: 'Free Shipping Bill',
    shipmentDetails: { natureOfCargo: 'General', modeOfTransport: 'Sea', portOfLoading: '', countryOfDestination: '', portOfFinalDestination: '', vessel: '', rotationNo: '' },
    items: [{ srNo: 1, description: '', hsCode: '', quantity: 0, unit: 'PCS', fobValueINR: 0, fobValueForeign: 0 }],
    totalFOBValueINR: 0,
    totalFOBValueForeign: 0,
    currency: 'USD',
    exchangeRate: 83.5,
    linkedDocuments: [],
  };
}
