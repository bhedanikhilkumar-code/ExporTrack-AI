/**
 * Packing List Type Definitions
 */
import { DocumentStatus, LinkedDocument } from '../utils/documentUtils';

export interface PackingList {
  id: string;
  plNumber: string;
  plDate: string;
  status: DocumentStatus;
  linkedInvoiceId?: string;
  exporterDetails: { name: string; address: string; };
  buyerDetails: { name: string; address: string; country: string; };
  shipmentDetails: { portOfLoading: string; portOfDischarge: string; marksAndNumbers: string; };
  packages: PackageItem[];
  totalPackages: number;
  totalNetWeight: number;
  totalGrossWeight: number;
  totalVolume: number;
  linkedDocuments?: LinkedDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface PackageItem {
  packageNo: string;
  description: string;
  hsCode: string;
  quantity: number;
  unit: string;
  netWeight: number;
  grossWeight: number;
  dimensions: { length: number; width: number; height: number; unit: 'cm' | 'inch'; };
  cbm: number;
}

export function createEmptyPackingList(): Omit<PackingList, 'id' | 'plNumber' | 'createdAt' | 'updatedAt'> {
  return {
    plDate: new Date().toISOString().slice(0, 10),
    status: 'Draft',
    exporterDetails: { name: '', address: '' },
    buyerDetails: { name: '', address: '', country: '' },
    shipmentDetails: { portOfLoading: '', portOfDischarge: '', marksAndNumbers: '' },
    packages: [{ packageNo: 'PKG-001', description: '', hsCode: '', quantity: 0, unit: 'PCS', netWeight: 0, grossWeight: 0, dimensions: { length: 0, width: 0, height: 0, unit: 'cm' }, cbm: 0 }],
    totalPackages: 1,
    totalNetWeight: 0,
    totalGrossWeight: 0,
    totalVolume: 0,
    linkedDocuments: [],
  };
}

export function calculateCBM(l: number, w: number, h: number, unit: 'cm' | 'inch'): number {
  if (unit === 'inch') {
    return (l * 2.54 * w * 2.54 * h * 2.54) / 1000000;
  }
  return (l * w * h) / 1000000;
}
