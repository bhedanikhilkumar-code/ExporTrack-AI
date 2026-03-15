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
  | 'Shipment Created'
  | 'Driver Assigned'
  | 'Picked Up'
  | 'In Transit'
  | 'Reached Hub'
  | 'Out For Delivery'
  | 'Delivered'
  | 'Under Verification'
  | 'Customs Hold';
export type Role = 'Admin' | 'Manager' | 'Staff' | 'Export Operations Manager' | 'Client';

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
  assignedTo: string;
  documents: ShipmentDocument[];
  aiScan: OCRExtraction[];
  comments: ShipmentComment[];
  trackingId?: string;
  driverName?: string;
  driverPhone?: string;
  vehicleNumber?: string;
  estimatedDeliveryTime?: string;
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

export interface Client {
  id: string;
  name: string;
  email: string;
  companyName: string;
  activeShipments: number;
  lastLogin: string;
}

export interface UserSession {
  name: string;
  email: string;
  role: Role;
  authProvider?: 'email' | 'google' | 'demo';
  profilePicture?: string;
}

export interface AppState {
  isAuthenticated: boolean;
  user: UserSession | null;
  shipments: Shipment[];
  notifications: NotificationItem[];
  teamMembers: TeamMember[];
  clients: Client[];
  theme: 'light' | 'dark';
}

export interface CreateShipmentInput {
  shipmentId: string;
  clientName: string;
  destinationCountry: string;
  shipmentDate: string;
  containerNumber: string;
  status: ShipmentStatus;
  assignedTo: string;
}

export interface UploadDocumentInput {
  type: DocumentType;
  fileName: string;
  fileFormat: 'PDF' | 'JPG' | 'PNG';
  uploadedBy: string;
}

export interface TrackingEvent {
  timestamp: string;
  location: string;
  status: string;
  description: string;
}

export interface LocationUpdate {
  timestamp: string;
  locationName: string;
  lat: number;
  lng: number;
  status: string;
  notes?: string;
}

export interface DriverTelemetry {
  driverId: string;
  shipmentId: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number; // direction in degrees
  timestamp: string;
}

export interface AIEtaPrediction {
  predictedArrival: string;
  confidenceScore: number;
  factors?: string[];
}

export interface DelayEvaluation {
  isDelayed: boolean;
  daysDelayed: number;
}

export type NotificationEventType = 
  | 'shipment_created'
  | 'shipment_dispatched'
  | 'shipment_delayed'
  | 'shipment_delivered';

export interface DetailedAIEta extends AIEtaPrediction {
  factors: string[];
}

export interface OptimizedRoute {
  id: string;
  coordinates: { lat: number; lng: number }[];
  distance: string;
  estimatedTime: string;
  stops: number;
  savings?: {
    time: string;
    distance: string;
  };
  recommendationReason: string;
}

export interface ShipmentTracking {
  shipmentId: string;
  currentStatus: string;
  currentLocation: string;
  latitude: number;
  longitude: number;
  lastUpdatedTime: string;
  trackingHistory: LocationUpdate[]; // Keeping existing for legacy support while migrating
  estimatedArrival?: string;
  
  // New unified tracking fields
  tracking_number?: string;
  carrier?: string;
  status?: string; // Unified status
  current_location?: string;
  estimated_delivery?: string;
  tracking_events?: TrackingEvent[];

  // Step 2 & 3 Additions
  aiEta?: AIEtaPrediction;
  delayAlert?: DelayEvaluation;
  
  // Step 4: AI Route Optimization
  optimizedRoute?: OptimizedRoute;

  // Step 5: Real-Time Driver Tracking
  driverTele?: DriverTelemetry;
  driverAvatar?: string;
  driverVehicle?: string;
}

