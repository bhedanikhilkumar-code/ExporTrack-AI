import { AppState, OCRExtraction, ShipmentDocument } from '../types';

const doc = (
  id: string,
  type: ShipmentDocument['type'],
  fileName: string,
  fileFormat: ShipmentDocument['fileFormat'],
  status: ShipmentDocument['status'],
  uploadedAt: string,
  uploadedBy: string
): ShipmentDocument => ({
  id,
  type,
  fileName,
  fileFormat,
  status,
  uploadedAt,
  uploadedBy
});

const scan = (
  id: string,
  documentType: string,
  invoiceNumber: string,
  date: string,
  buyerName: string,
  shipmentValue: string,
  destination: string,
  confidence: number
): OCRExtraction => ({
  id,
  documentType,
  invoiceNumber,
  date,
  buyerName,
  shipmentValue,
  destination,
  confidence
});

export const createSeedState = (): AppState => ({
  isAuthenticated: false,
  user: null,
  teamMembers: [
    {
      id: 'TM-001',
      name: 'Aarav Mehta',
      email: 'aarav@exportrack.ai',
      role: 'Admin',
      region: 'North America',
      activeCases: 18,
      lastActive: '2026-03-10T08:42:00.000Z'
    },
    {
      id: 'TM-002',
      name: 'Emily Chen',
      email: 'emily.chen@exportrack.ai',
      role: 'Manager',
      region: 'APAC',
      activeCases: 12,
      lastActive: '2026-03-10T09:10:00.000Z'
    },
    {
      id: 'TM-003',
      name: 'Rohan Iyer',
      email: 'rohan.iyer@exportrack.ai',
      role: 'Staff',
      region: 'EU',
      activeCases: 9,
      lastActive: '2026-03-10T07:15:00.000Z'
    },
    {
      id: 'TM-004',
      name: 'Sofia Patel',
      email: 'sofia.patel@exportrack.ai',
      role: 'Staff',
      region: 'Middle East',
      activeCases: 7,
      lastActive: '2026-03-10T06:55:00.000Z'
    }
  ],
  shipments: [
    {
      
      assignedTo: 'Emily Chen',
      documents: [
        doc('DOC-101', 'Invoice', 'invoice-exp-001.pdf', 'PDF', 'Verified', '2026-03-02T09:20:00.000Z', 'Emily Chen'),
        doc('DOC-102', 'Packing List', 'packing-list-exp-001.pdf', 'PDF', 'Verified', '2026-03-02T09:25:00.000Z', 'Emily Chen'),
        doc('DOC-103', 'Bill of Lading', 'bill-lading-exp-001.jpg', 'JPG', 'Pending', '2026-03-02T10:12:00.000Z', 'Rohan Iyer'),
        doc('DOC-104', 'Shipping Bill', 'shipping-bill-exp-001.pdf', 'PDF', 'Verified', '2026-03-03T04:04:00.000Z', 'Sofia Patel'),
        doc('DOC-105', 'Certificate of Origin', 'origin-cert-exp-001.png', 'PNG', 'Pending', '2026-03-03T04:12:00.000Z', 'Sofia Patel'),
        doc('DOC-106', 'Insurance Papers', 'insurance-exp-001.pdf', 'PDF', 'Verified', '2026-03-03T04:20:00.000Z', 'Emily Chen'),
        doc('DOC-107', 'Customs Files', 'Not uploaded', 'PDF', 'Missing', '2026-03-03T04:21:00.000Z', 'System')
      ],
      aiScan: [
        scan('SCAN-001', 'Commercial Invoice', 'INV-DE-88421', '2026-03-01', 'Apex Retail Imports', 'USD 128,450.00', 'Germany', 97),
        scan('SCAN-002', 'Packing List', 'PL-DE-21001', '2026-03-01', 'Apex Retail Imports', 'USD 128,450.00', 'Germany', 95)
      ],
      comments: [
        {
          id: 'COM-001',
          author: 'Emily Chen',
          role: 'Manager',
          message: 'Client requested expedited customs filing. Prioritize customs files today.',
          createdAt: '2026-03-04T10:10:00.000Z',
          internal: true
        },
        {
          id: 'COM-002',
          author: 'Rohan Iyer',
          role: 'Staff',
          message: 'Waiting for broker to share customs files before 14:00 UTC.',
          createdAt: '2026-03-04T10:30:00.000Z',
          internal: false
        }
      ]
    },
    {
      
      assignedTo: 'Aarav Mehta',
      documents: [
        doc('DOC-201', 'Invoice', 'invoice-exp-002.pdf', 'PDF', 'Verified', '2026-02-27T08:03:00.000Z', 'Aarav Mehta'),
        doc('DOC-202', 'Packing List', 'packing-list-exp-002.pdf', 'PDF', 'Verified', '2026-02-27T08:15:00.000Z', 'Aarav Mehta'),
        doc('DOC-203', 'Bill of Lading', 'bl-exp-002.pdf', 'PDF', 'Rejected', '2026-02-28T06:22:00.000Z', 'Sofia Patel'),
        doc('DOC-204', 'Shipping Bill', 'shipping-bill-exp-002.png', 'PNG', 'Verified', '2026-02-28T06:50:00.000Z', 'Sofia Patel'),
        doc('DOC-205', 'Certificate of Origin', 'origin-cert-exp-002.pdf', 'PDF', 'Verified', '2026-02-28T06:55:00.000Z', 'Aarav Mehta'),
        doc('DOC-206', 'Insurance Papers', 'insurance-exp-002.jpg', 'JPG', 'Pending', '2026-02-28T08:10:00.000Z', 'Emily Chen'),
        doc('DOC-207', 'Customs Files', 'customs-exp-002.pdf', 'PDF', 'Pending', '2026-03-01T10:00:00.000Z', 'Emily Chen')
      ],
      aiScan: [scan('SCAN-003', 'Commercial Invoice', 'INV-UAE-33419', '2026-02-26', 'BlueWave Foods', 'USD 87,900.00', 'UAE', 92)],
      comments: [
        {
          id: 'COM-003',
          author: 'Aarav Mehta',
          role: 'Admin',
          message: 'Bill of lading rejected due to vessel mismatch. Need revised copy from shipping line.',
          createdAt: '2026-03-02T05:11:00.000Z',
          internal: true
        }
      ]
    },
    {
      
      assignedTo: 'Rohan Iyer',
      documents: [
        doc('DOC-301', 'Invoice', 'invoice-exp-003.pdf', 'PDF', 'Verified', '2026-03-05T07:02:00.000Z', 'Rohan Iyer'),
        doc('DOC-302', 'Packing List', 'packing-list-exp-003.pdf', 'PDF', 'Pending', '2026-03-05T07:40:00.000Z', 'Rohan Iyer'),
        doc('DOC-303', 'Bill of Lading', 'Not uploaded', 'PDF', 'Missing', '2026-03-05T08:00:00.000Z', 'System'),
        doc('DOC-304', 'Shipping Bill', 'shipping-bill-exp-003.pdf', 'PDF', 'Pending', '2026-03-05T08:12:00.000Z', 'Sofia Patel'),
        doc('DOC-305', 'Certificate of Origin', 'Not uploaded', 'PDF', 'Missing', '2026-03-05T08:30:00.000Z', 'System'),
        doc('DOC-306', 'Insurance Papers', 'insurance-exp-003.pdf', 'PDF', 'Pending', '2026-03-05T08:40:00.000Z', 'Emily Chen'),
        doc('DOC-307', 'Customs Files', 'Not uploaded', 'PDF', 'Missing', '2026-03-05T08:45:00.000Z', 'System')
      ],
      aiScan: [scan('SCAN-004', 'Commercial Invoice', 'INV-SE-10445', '2026-03-05', 'Nordic Auto Components', 'USD 214,380.00', 'Sweden', 96)],
      comments: [
        {
          id: 'COM-004',
          author: 'Sofia Patel',
          role: 'Staff',
          message: 'Client sent partial docs. Following up for certificate and customs package.',
          createdAt: '2026-03-06T11:14:00.000Z',
          internal: false
        }
      ]
    },
    {
      
      assignedTo: 'Aarav Mehta',
      documents: [
        doc('DOC-401', 'Invoice', 'invoice-exp-004.pdf', 'PDF', 'Verified', '2026-02-22T09:20:00.000Z', 'Emily Chen'),
        doc('DOC-402', 'Packing List', 'packing-list-exp-004.pdf', 'PDF', 'Verified', '2026-02-22T09:40:00.000Z', 'Emily Chen'),
        doc('DOC-403', 'Bill of Lading', 'bill-exp-004.pdf', 'PDF', 'Verified', '2026-02-22T10:12:00.000Z', 'Aarav Mehta'),
        doc('DOC-404', 'Shipping Bill', 'shipping-bill-exp-004.pdf', 'PDF', 'Verified', '2026-02-22T10:33:00.000Z', 'Aarav Mehta'),
        doc('DOC-405', 'Certificate of Origin', 'origin-exp-004.png', 'PNG', 'Verified', '2026-02-22T10:45:00.000Z', 'Emily Chen'),
        doc('DOC-406', 'Insurance Papers', 'insurance-exp-004.pdf', 'PDF', 'Verified', '2026-02-22T10:58:00.000Z', 'Aarav Mehta'),
        doc('DOC-407', 'Customs Files', 'customs-exp-004.pdf', 'PDF', 'Verified', '2026-02-22T11:15:00.000Z', 'Aarav Mehta')
      ],
      aiScan: [
        scan('SCAN-005', 'Commercial Invoice', 'INV-BR-90188', '2026-02-21', 'GreenMed Pharma', 'USD 64,020.00', 'Brazil', 98),
        scan('SCAN-006', 'Insurance Certificate', 'INS-BR-4412', '2026-02-21', 'GreenMed Pharma', 'USD 64,020.00', 'Brazil', 94)
      ],
      comments: [
        {
          id: 'COM-005',
          author: 'Aarav Mehta',
          role: 'Admin',
          message: 'Closed with full compliance. Add this shipment to quality benchmark examples.',
          createdAt: '2026-03-07T09:00:00.000Z',
          internal: true
        }
      ]
    },
    {
      
      assignedTo: 'Sofia Patel',
      documents: [
        doc('DOC-501', 'Invoice', 'invoice-exp-005.pdf', 'PDF', 'Pending', '2026-03-06T07:05:00.000Z', 'Sofia Patel'),
        doc('DOC-502', 'Packing List', 'Not uploaded', 'PDF', 'Missing', '2026-03-06T08:00:00.000Z', 'System'),
        doc('DOC-503', 'Bill of Lading', 'Not uploaded', 'PDF', 'Missing', '2026-03-06T08:00:00.000Z', 'System'),
        doc('DOC-504', 'Shipping Bill', 'shipping-bill-exp-005.jpg', 'JPG', 'Pending', '2026-03-06T08:12:00.000Z', 'Sofia Patel'),
        doc('DOC-505', 'Certificate of Origin', 'Not uploaded', 'PDF', 'Missing', '2026-03-06T08:30:00.000Z', 'System'),
        doc('DOC-506', 'Insurance Papers', 'Not uploaded', 'PDF', 'Missing', '2026-03-06T08:45:00.000Z', 'System'),
        doc('DOC-507', 'Customs Files', 'Not uploaded', 'PDF', 'Missing', '2026-03-06T08:55:00.000Z', 'System')
      ],
      aiScan: [scan('SCAN-007', 'Shipping Bill', 'SB-KE-5512', '2026-03-06', 'TerraBuild Materials', 'USD 49,800.00', 'Kenya', 90)],
      comments: [
        {
          id: 'COM-006',
          author: 'Emily Chen',
          role: 'Manager',
          message: 'Critical client. Push vendor for remaining docs before tomorrow noon.',
          createdAt: '2026-03-07T03:30:00.000Z',
          internal: true
        }
      ]
    }
  ],
  notifications: [
    {
      id: 'NT-001',
      shipmentId: 'EXP-2026-001',
      type: 'Missing Docs',
      severity: 'High',
      title: 'Customs files missing',
      message: 'Shipment EXP-2026-001 is missing customs files and cannot be finalized.',
      createdAt: '2026-03-10T06:30:00.000Z',
      dueDate: '2026-03-11',
      read: false
    },
    {
      id: 'NT-002',
      shipmentId: 'EXP-2026-002',
      type: 'Approval Delay',
      severity: 'High',
      title: 'Bill of lading rejected',
      message: 'Rejected bill of lading requires replacement before customs release.',
      createdAt: '2026-03-10T07:10:00.000Z',
      dueDate: '2026-03-11',
      read: false
    },
    {
      id: 'NT-003',
      shipmentId: 'EXP-2026-003',
      type: 'Missing Docs',
      severity: 'Medium',
      title: 'Multiple required documents missing',
      message: 'Bill of lading, certificate of origin and customs files are still missing.',
      createdAt: '2026-03-09T18:22:00.000Z',
      dueDate: '2026-03-13',
      read: false
    },
    {
      id: 'NT-004',
      shipmentId: 'EXP-2026-005',
      type: 'Deadline',
      severity: 'High',
      title: 'Documentation deadline approaching',
      message: 'Shipment EXP-2026-005 has a hard documentation deadline in 3 days.',
      createdAt: '2026-03-10T05:45:00.000Z',
      dueDate: '2026-03-13',
      read: false
    },
    {
      id: 'NT-005',
      shipmentId: 'EXP-2026-004',
      type: 'Deadline',
      severity: 'Low',
      title: 'Shipment closed',
      message: 'Shipment EXP-2026-004 completed with all verifications passed.',
      createdAt: '2026-03-08T15:15:00.000Z',
      dueDate: '2026-03-08',
      read: true
    }
  ]
});


