export const REQUIRED_DOCUMENT_TYPES = [
  'Invoice',
  'Packing List',
  'Bill of Lading',
  'Shipping Bill',
  'Certificate of Origin',
  'Insurance Papers',
  'Customs Files'
] as const;

export type RequiredDocumentType = (typeof REQUIRED_DOCUMENT_TYPES)[number];
export type DocumentType = RequiredDocumentType | 'Delivery Order' | 'Inspection Report' | 'Other';
export type DocStatus = 'Pending' | 'Verified' | 'Missing' | 'Rejected';
export type ShipmentStatus =
  | 'Awaiting Documents'
  | 'In Transit'
  | 'Under Verification'
  | 'Customs Hold'
  | 'Delivered';
export type Role = 'Admin' | 'Manager' | 'Coordinator';

export interface ShipmentDocument {
  id: string;
  type: DocumentType;
  fileName: string;
  fileFormat: 'PDF' | 'JPG' | 'PNG';
  status: DocStatus;
  uploadedAt: string;
  uploadedBy: string;
}

export interface OCRExtraction {
  id: string;
  documentType: string;
  invoiceNumber: string;
  date: string;
  buyerName: string;
  shipmentValue: string;
  destination: string;
  confidence: number;
}

export interface ShipmentComment {
  id: string;
  author: string;
  role: Role;
  message: string;
  createdAt: string;
  internal: boolean;
}

export interface Shipment {
  id: string;
  clientName: string;
  destinationCountry: string;
  shipmentDate: string;
  containerNumber: string;
  status: ShipmentStatus;
  delayed: boolean;
  deadline: string;
  priority: 'High' | 'Medium' | 'Low';
  documents: ShipmentDocument[];
  aiScan: OCRExtraction[];
  comments: ShipmentComment[];
}

export interface NotificationItem {
  id: string;
  shipmentId: string;
  type: 'Missing Docs' | 'Approval Delay' | 'Deadline';
  severity: 'High' | 'Medium' | 'Low';
  title: string;
  message: string;
  createdAt: string;
  dueDate: string;
  read: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  region: string;
  activeCases: number;
  lastActive: string;
}

export interface UserSession {
  name: string;
  email: string;
  role: Role;
}

export interface AppState {
  isAuthenticated: boolean;
  user: UserSession | null;
  shipments: Shipment[];
  notifications: NotificationItem[];
  teamMembers: TeamMember[];
}

export interface CreateShipmentInput {
  shipmentId: string;
  clientName: string;
  destinationCountry: string;
  shipmentDate: string;
  containerNumber: string;
  status: ShipmentStatus;
}

export interface UploadDocumentInput {
  type: DocumentType;
  fileName: string;
  fileFormat: 'PDF' | 'JPG' | 'PNG';
  uploadedBy: string;
}
