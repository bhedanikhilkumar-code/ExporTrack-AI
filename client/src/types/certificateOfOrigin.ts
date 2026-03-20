/**
 * Certificate of Origin Type Definitions
 */
import { DocumentStatus, LinkedDocument } from '../utils/documentUtils';

export interface CertificateOfOrigin {
  id: string;
  cooNumber: string;
  cooDate: string;
  status: DocumentStatus;
  cooType: 'Non-Preferential' | 'Preferential' | 'GSP' | 'SAFTA' | 'ASEAN' | 'AIFTA';
  exporterDetails: { name: string; address: string; country: string; iec: string; };
  consigneeDetails: { name: string; address: string; country: string; };
  transportDetails: { meansOfTransport: string; departureDate: string; vessel: string; portOfLoading: string; portOfDischarge: string; };
  items: COOItem[];
  declarationText: string;
  chamberOfCommerceStamp?: string;
  issuingAuthority: string;
  linkedDocuments?: LinkedDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface COOItem {
  marks: string;
  description: string;
  hsCode: string;
  quantity: string;
  invoiceNo: string;
  originCriteria: string;
}

export const COO_TYPES = ['Non-Preferential', 'Preferential', 'GSP', 'SAFTA', 'ASEAN', 'AIFTA'] as const;

export const ISSUING_AUTHORITIES = [
  'Chamber of Commerce',
  'Export Inspection Council',
  'Federation of Indian Export Organisations (FIEO)',
  'Agricultural and Processed Food Products Export Development Authority (APEDA)',
  'Spices Board India',
  'Tea Board India',
  'Marine Products Export Development Authority (MPEDA)',
  'Other',
] as const;

export const ORIGIN_CRITERIA = [
  { code: 'WO', label: 'Wholly Obtained', description: 'Products entirely produced in India' },
  { code: 'PE', label: 'Produced Exclusively', description: 'Products produced exclusively from originating materials' },
  { code: 'SP', label: 'Substantial Processing', description: 'Products that have undergone substantial transformation' },
  { code: 'CC', label: 'Change in Classification', description: 'Tariff classification change at HS 4-digit level' },
  { code: 'VA', label: 'Value Addition', description: 'Minimum domestic value addition criteria met' },
] as const;

export const DEFAULT_DECLARATIONS: Record<string, string> = {
  'Non-Preferential': 'The undersigned hereby declares that the above-mentioned goods originate in India and comply with the origin requirements specified for those goods.',
  'Preferential': 'The undersigned hereby declares that the above-mentioned goods qualify under the rules of origin as products originating in India.',
  'GSP': 'The undersigned certifies that the goods described above meet the origin requirements specified under the Generalized System of Preferences.',
  'SAFTA': 'The goods described herein qualify as originating goods under the SAFTA Rules of Origin.',
  'ASEAN': 'The undersigned declares that the goods herein meet the origin criteria under the ASEAN-India Free Trade Agreement.',
  'AIFTA': 'The goods described qualify under the AIFTA Rules of Origin as originating products.',
};

export function createEmptyCOO(): Omit<CertificateOfOrigin, 'id' | 'cooNumber' | 'createdAt' | 'updatedAt'> {
  return {
    cooDate: new Date().toISOString().slice(0, 10),
    status: 'Draft',
    cooType: 'Non-Preferential',
    exporterDetails: { name: '', address: '', country: 'India', iec: '' },
    consigneeDetails: { name: '', address: '', country: '' },
    transportDetails: { meansOfTransport: '', departureDate: '', vessel: '', portOfLoading: '', portOfDischarge: '' },
    items: [{ marks: '', description: '', hsCode: '', quantity: '', invoiceNo: '', originCriteria: 'WO' }],
    declarationText: DEFAULT_DECLARATIONS['Non-Preferential'],
    issuingAuthority: 'Chamber of Commerce',
    linkedDocuments: [],
  };
}
