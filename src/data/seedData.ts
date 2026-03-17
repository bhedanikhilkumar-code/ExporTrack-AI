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
  theme: 'system',
  userTeams: [],
  teamMembers: [
    {
      id: 'TM-001',
      name: 'PRINCE DODIYA',
      email: 'prince.dodiya@exportrack.ai',
      role: 'Admin',
      region: 'North America',
      activeCases: 18,
      lastActive: '2026-03-10T08:42:00.000Z'
    },
    {
      id: 'TM-002',
      name: 'NIKHIL BHEDA',
      email: 'nikhil.bheda@exportrack.ai',
      role: 'Manager',
      region: 'APAC',
      activeCases: 12,
      lastActive: '2026-03-10T09:10:00.000Z'
    },
    {
      id: 'TM-003',
      name: 'DHRUV BHANVADIYA',
      email: 'dhruv.bhanvadiya@exportrack.ai',
      role: 'Manager',
      region: 'EU',
      activeCases: 9,
      lastActive: '2026-03-10T07:15:00.000Z'
    },
    {
      id: 'TM-004',
      name: 'NEEL NADIYAPARA',
      email: 'neel.nadiyapara@exportrack.ai',
      role: 'Operations',
      region: 'Middle East',
      activeCases: 7,
      lastActive: '2026-03-10T06:55:00.000Z'
    }
  ],
  shipments: [
    {
      id: 'EXP-2026-001',
      clientName: 'Apex Retail Imports',
      destinationCountry: 'Germany',
      shipmentDate: '2026-03-01',
      containerNumber: 'MSCU1234567',
      status: 'Under Verification',
      delayed: true,
      deadline: '2026-03-11',
      priority: 'High',
      assignedTo: 'NIKHIL BHEDA',
      documents: [
        doc('DOC-101', 'Invoice', 'invoice-exp-001.pdf', 'PDF', 'Verified', '2026-03-02T09:20:00.000Z', 'NIKHIL BHEDA'),
        doc('DOC-102', 'Packing List', 'packing-list-exp-001.pdf', 'PDF', 'Verified', '2026-03-02T09:25:00.000Z', 'NIKHIL BHEDA'),
        doc('DOC-103', 'Bill of Lading', 'bill-lading-exp-001.jpg', 'JPG', 'Pending', '2026-03-02T10:12:00.000Z', 'DHRUV BHANVADIYA'),
        doc('DOC-104', 'Shipping Bill', 'shipping-bill-exp-001.pdf', 'PDF', 'Verified', '2026-03-03T04:04:00.000Z', 'NEEL NADIYAPARA'),
        doc('DOC-105', 'Certificate of Origin', 'origin-cert-exp-001.png', 'PNG', 'Pending', '2026-03-03T04:12:00.000Z', 'NEEL NADIYAPARA'),
        doc('DOC-106', 'Insurance Papers', 'insurance-exp-001.pdf', 'PDF', 'Verified', '2026-03-03T04:20:00.000Z', 'NIKHIL BHEDA'),
        doc('DOC-107', 'Customs Files', 'Not uploaded', 'PDF', 'Missing', '2026-03-03T04:21:00.000Z', 'System')
      ],
      aiScan: [
        scan('SCAN-001', 'Commercial Invoice', 'INV-DE-88421', '2026-03-01', 'Apex Retail Imports', 'USD 128,450.00', 'Germany', 97),
        scan('SCAN-002', 'Packing List', 'PL-DE-21001', '2026-03-01', 'Apex Retail Imports', 'USD 128,450.00', 'Germany', 95)
      ],
      comments: [
        {
          id: 'COM-001',
          author: 'NIKHIL BHEDA',
          role: 'Manager',
          message: 'Client requested expedited customs filing. Prioritize customs files today.',
          createdAt: '2026-03-04T10:10:00.000Z',
          internal: true
        },
        {
          id: 'COM-002',
          author: 'DHRUV BHANVADIYA',
          role: 'Operations',
          message: 'Waiting for broker to share customs files before 14:00 UTC.',
          createdAt: '2026-03-04T10:30:00.000Z',
          internal: false
        }
      ],
      driverName: 'Rajesh Kumar',
      driverPhone: '+91 98765-43210',
      vehicleNumber: 'MH-12-PQ-4567',
      estimatedDeliveryTime: '2026-03-12T18:00:00.000Z'
    },
    {
      id: 'EXP-2026-002',
      clientName: 'BlueWave Foods',
      destinationCountry: 'UAE',
      shipmentDate: '2026-02-26',
      containerNumber: 'TCKU3142857-6',
      status: 'In Transit',
      delayed: true,
      deadline: '2026-03-12',
      priority: 'Medium',
      assignedTo: 'PRINCE DODIYA',
      documents: [
        doc('DOC-201', 'Invoice', 'invoice-exp-002.pdf', 'PDF', 'Verified', '2026-02-27T08:03:00.000Z', 'PRINCE DODIYA'),
        doc('DOC-202', 'Packing List', 'packing-list-exp-002.pdf', 'PDF', 'Verified', '2026-02-27T08:15:00.000Z', 'PRINCE DODIYA'),
        doc('DOC-203', 'Bill of Lading', 'bl-exp-002.pdf', 'PDF', 'Rejected', '2026-02-28T06:22:00.000Z', 'NEEL NADIYAPARA'),
        doc('DOC-204', 'Shipping Bill', 'shipping-bill-exp-002.png', 'PNG', 'Verified', '2026-02-28T06:50:00.000Z', 'NEEL NADIYAPARA'),
        doc('DOC-205', 'Certificate of Origin', 'origin-cert-exp-002.pdf', 'PDF', 'Verified', '2026-02-28T06:55:00.000Z', 'PRINCE DODIYA'),
        doc('DOC-206', 'Insurance Papers', 'insurance-exp-002.jpg', 'JPG', 'Pending', '2026-02-28T08:10:00.000Z', 'NIKHIL BHEDA'),
        doc('DOC-207', 'Customs Files', 'customs-exp-002.pdf', 'PDF', 'Pending', '2026-03-01T10:00:00.000Z', 'NIKHIL BHEDA')
      ],
      aiScan: [scan('SCAN-003', 'Commercial Invoice', 'INV-UAE-33419', '2026-02-26', 'BlueWave Foods', 'USD 87,900.00', 'UAE', 92)],
      comments: [
        /* ... existing comments ... */
      ],
      driverName: 'Amit Shah',
      driverPhone: '+91 91234-56789',
      vehicleNumber: 'MH-01-AX-7788',
      estimatedDeliveryTime: '2026-03-14T10:00:00.000Z'
    },
    {
      id: 'EXP-2026-003',
      clientName: 'Nordic Auto Components',
      destinationCountry: 'Sweden',
      shipmentDate: '2026-03-05',
      containerNumber: 'HLCU7294013-9',
      status: 'Shipment Created',
      delayed: false,
      deadline: '2026-03-15',
      priority: 'Medium',
      assignedTo: 'DHRUV BHANVADIYA',
      documents: [
        doc('DOC-301', 'Invoice', 'invoice-exp-003.pdf', 'PDF', 'Verified', '2026-03-05T07:02:00.000Z', 'DHRUV BHANVADIYA'),
        doc('DOC-302', 'Packing List', 'packing-list-exp-003.pdf', 'PDF', 'Pending', '2026-03-05T07:40:00.000Z', 'DHRUV BHANVADIYA'),
        doc('DOC-303', 'Bill of Lading', 'Not uploaded', 'PDF', 'Missing', '2026-03-05T08:00:00.000Z', 'System'),
        doc('DOC-304', 'Shipping Bill', 'shipping-bill-exp-003.pdf', 'PDF', 'Pending', '2026-03-05T08:12:00.000Z', 'NEEL NADIYAPARA'),
        doc('DOC-305', 'Certificate of Origin', 'Not uploaded', 'PDF', 'Missing', '2026-03-05T08:30:00.000Z', 'System'),
        doc('DOC-306', 'Insurance Papers', 'insurance-exp-003.pdf', 'PDF', 'Pending', '2026-03-05T08:40:00.000Z', 'NIKHIL BHEDA'),
        doc('DOC-307', 'Customs Files', 'Not uploaded', 'PDF', 'Missing', '2026-03-05T08:45:00.000Z', 'System')
      ],
      aiScan: [scan('SCAN-004', 'Commercial Invoice', 'INV-SE-10445', '2026-03-05', 'Nordic Auto Components', 'USD 214,380.00', 'Sweden', 96)],
      comments: [
        {
          id: 'COM-004',
          author: 'NEEL NADIYAPARA',
          role: 'Operations',
          message: 'Client sent partial docs. Following up for certificate and customs package.',
          createdAt: '2026-03-06T11:14:00.000Z',
          internal: false
        }
      ]
    },
    {
      id: 'EXP-2026-004',
      clientName: 'GreenMed Pharma',
      destinationCountry: 'Brazil',
      shipmentDate: '2026-02-21',
      containerNumber: 'MSCU4812960-2',
      status: 'Delivered',
      delayed: false,
      deadline: '2026-02-28',
      priority: 'Low',
      assignedTo: 'PRINCE DODIYA',
      documents: [
        doc('DOC-401', 'Invoice', 'invoice-exp-004.pdf', 'PDF', 'Verified', '2026-02-22T09:20:00.000Z', 'NIKHIL BHEDA'),
        doc('DOC-402', 'Packing List', 'packing-list-exp-004.pdf', 'PDF', 'Verified', '2026-02-22T09:40:00.000Z', 'NIKHIL BHEDA'),
        doc('DOC-403', 'Bill of Lading', 'bill-exp-004.pdf', 'PDF', 'Verified', '2026-02-22T10:12:00.000Z', 'PRINCE DODIYA'),
        doc('DOC-404', 'Shipping Bill', 'shipping-bill-exp-004.pdf', 'PDF', 'Verified', '2026-02-22T10:33:00.000Z', 'PRINCE DODIYA'),
        doc('DOC-405', 'Certificate of Origin', 'origin-exp-004.png', 'PNG', 'Verified', '2026-02-22T10:45:00.000Z', 'NIKHIL BHEDA'),
        doc('DOC-406', 'Insurance Papers', 'insurance-exp-004.pdf', 'PDF', 'Verified', '2026-02-22T10:58:00.000Z', 'PRINCE DODIYA'),
        doc('DOC-407', 'Customs Files', 'customs-exp-004.pdf', 'PDF', 'Verified', '2026-02-22T11:15:00.000Z', 'PRINCE DODIYA')
      ],
      aiScan: [
        scan('SCAN-005', 'Commercial Invoice', 'INV-BR-90188', '2026-02-21', 'GreenMed Pharma', 'USD 64,020.00', 'Brazil', 98),
        scan('SCAN-006', 'Insurance Certificate', 'INS-BR-4412', '2026-02-21', 'GreenMed Pharma', 'USD 64,020.00', 'Brazil', 94)
      ],
      comments: [
        {
          id: 'COM-005',
          author: 'PRINCE DODIYA',
          role: 'Admin',
          message: 'Closed with full compliance. Add this shipment to quality benchmark examples.',
          createdAt: '2026-03-07T09:00:00.000Z',
          internal: true
        }
      ]
    },
    {
      id: 'EXP-2026-005',
      clientName: 'TerraBuild Materials',
      destinationCountry: 'Kenya',
      shipmentDate: '2026-03-06',
      containerNumber: 'MSCU1234568',
      status: 'In Transit',
      delayed: false,
      deadline: '2026-03-13',
      priority: 'High',
      assignedTo: 'NEEL NADIYAPARA',
      documents: [
        doc('DOC-501', 'Invoice', 'invoice-exp-005.pdf', 'PDF', 'Pending', '2026-03-06T07:05:00.000Z', 'NEEL NADIYAPARA'),
        doc('DOC-502', 'Packing List', 'Not uploaded', 'PDF', 'Missing', '2026-03-06T08:00:00.000Z', 'System'),
        doc('DOC-503', 'Bill of Lading', 'Not uploaded', 'PDF', 'Missing', '2026-03-06T08:00:00.000Z', 'System'),
        doc('DOC-504', 'Shipping Bill', 'shipping-bill-exp-005.jpg', 'JPG', 'Pending', '2026-03-06T08:12:00.000Z', 'NEEL NADIYAPARA'),
        doc('DOC-505', 'Certificate of Origin', 'Not uploaded', 'PDF', 'Missing', '2026-03-06T08:30:00.000Z', 'System'),
        doc('DOC-506', 'Insurance Papers', 'Not uploaded', 'PDF', 'Missing', '2026-03-06T08:45:00.000Z', 'System'),
        doc('DOC-507', 'Customs Files', 'Not uploaded', 'PDF', 'Missing', '2026-03-06T08:55:00.000Z', 'System')
      ],
      aiScan: [scan('SCAN-007', 'Shipping Bill', 'SB-KE-5512', '2026-03-06', 'TerraBuild Materials', 'USD 49,800.00', 'Kenya', 90)],
      comments: [
        /* ... existing comments ... */
      ],
      driverName: 'Sanjay Dutt',
      driverPhone: '+91 99887-76655',
      vehicleNumber: 'KA-05-MN-1122',
      estimatedDeliveryTime: '2026-03-13T14:30:00.000Z'
    },
    {
      id: 'EXP-2026-006',
      clientName: 'SilverTech Electronics',
      destinationCountry: 'Singapore',
      shipmentDate: '2026-02-24',
      containerNumber: 'EVHU8765432-1',
      status: 'Delivered',
      delayed: false,
      deadline: '2026-03-05',
      priority: 'High',
      assignedTo: 'NIKHIL BHEDA',
      documents: [
        doc('DOC-601', 'Invoice', 'invoice-exp-006.pdf', 'PDF', 'Verified', '2026-02-24T12:10:00.000Z', 'NIKHIL BHEDA'),
        doc('DOC-602', 'Packing List', 'packing-list-exp-006.pdf', 'PDF', 'Verified', '2026-02-24T12:30:00.000Z', 'NIKHIL BHEDA'),
        doc('DOC-603', 'Bill of Lading', 'bill-exp-006.pdf', 'PDF', 'Verified', '2026-02-25T06:00:00.000Z', 'PRINCE DODIYA'),
        doc('DOC-604', 'Shipping Bill', 'shipping-bill-exp-006.pdf', 'PDF', 'Verified', '2026-02-25T06:20:00.000Z', 'PRINCE DODIYA'),
        doc('DOC-605', 'Certificate of Origin', 'origin-exp-006.pdf', 'PDF', 'Verified', '2026-02-25T07:15:00.000Z', 'NIKHIL BHEDA'),
        doc('DOC-606', 'Insurance Papers', 'insurance-exp-006.pdf', 'PDF', 'Verified', '2026-02-25T07:30:00.000Z', 'NIKHIL BHEDA'),
        doc('DOC-607', 'Customs Files', 'customs-exp-006.pdf', 'PDF', 'Verified', '2026-02-25T08:00:00.000Z', 'PRINCE DODIYA')
      ],
      aiScan: [scan('SCAN-008', 'Commercial Invoice', 'INV-SG-77654', '2026-02-24', 'SilverTech Electronics', 'USD 156,290.00', 'Singapore', 99)],
      comments: [
        {
          id: 'COM-008',
          author: 'PRINCE DODIYA',
          role: 'Admin',
          message: 'Perfect execution. Zero delays, all documents verified first submission.',
          createdAt: '2026-03-08T14:20:00.000Z',
          internal: true
        }
      ],
      driverName: 'Mohammed Hassan',
      driverPhone: '+91 94567-23456',
      vehicleNumber: 'TN-14-AB-5678',
      estimatedDeliveryTime: '2026-03-04T08:00:00.000Z'
    },
    {
      id: 'EXP-2026-007',
      clientName: 'EuroTrade Services',
      destinationCountry: 'Netherlands',
      shipmentDate: '2026-03-08',
      containerNumber: 'MAEU9876543-2',
      status: 'Under Verification',
      delayed: false,
      deadline: '2026-03-18',
      priority: 'Medium',
      assignedTo: 'DHRUV BHANVADIYA',
      documents: [
        doc('DOC-701', 'Invoice', 'invoice-exp-007.pdf', 'PDF', 'Verified', '2026-03-08T10:05:00.000Z', 'DHRUV BHANVADIYA'),
        doc('DOC-702', 'Packing List', 'packing-list-exp-007.pdf', 'PDF', 'Verified', '2026-03-08T10:25:00.000Z', 'DHRUV BHANVADIYA'),
        doc('DOC-703', 'Bill of Lading', 'bill-exp-007.pdf', 'PDF', 'Pending', '2026-03-08T11:00:00.000Z', 'NEEL NADIYAPARA'),
        doc('DOC-704', 'Shipping Bill', 'shipping-bill-exp-007.pdf', 'PDF', 'Verified', '2026-03-08T11:15:00.000Z', 'NEEL NADIYAPARA'),
        doc('DOC-705', 'Certificate of Origin', 'origin-exp-007.pdf', 'PDF', 'Pending', '2026-03-08T12:00:00.000Z', 'DHRUV BHANVADIYA'),
        doc('DOC-706', 'Insurance Papers', 'insurance-exp-007.pdf', 'PDF', 'Verified', '2026-03-08T12:30:00.000Z', 'NIKHIL BHEDA'),
        doc('DOC-707', 'Customs Files', 'customs-exp-007.pdf', 'PDF', 'Pending', '2026-03-09T09:00:00.000Z', 'NIKHIL BHEDA')
      ],
      aiScan: [scan('SCAN-009', 'Commercial Invoice', 'INV-NL-44556', '2026-03-08', 'EuroTrade Services', 'USD 234,500.00', 'Netherlands', 97)],
      comments: [
        {
          id: 'COM-009',
          author: 'DHRUV BHANVADIYA',
          role: 'Manager',
          message: 'BoL and CoO in verification. Customs files expected by EOD.',
          createdAt: '2026-03-10T13:45:00.000Z',
          internal: false
        }
      ],
      driverName: 'Vikram Singh',
      driverPhone: '+91 96543-21098',
      vehicleNumber: 'GJ-01-CD-9876',
      estimatedDeliveryTime: '2026-03-17T16:00:00.000Z'
    },
    {
      id: 'EXP-2026-008',
      clientName: 'AquaMarine Logistics',
      destinationCountry: 'Vietnam',
      shipmentDate: '2026-03-04',
      containerNumber: 'OOCL1234567-8',
      status: 'In Transit',
      delayed: false,
      deadline: '2026-03-14',
      priority: 'Low',
      assignedTo: 'NEEL NADIYAPARA',
      documents: [
        doc('DOC-801', 'Invoice', 'invoice-exp-008.pdf', 'PDF', 'Verified', '2026-03-04T14:10:00.000Z', 'NEEL NADIYAPARA'),
        doc('DOC-802', 'Packing List', 'packing-list-exp-008.pdf', 'PDF', 'Verified', '2026-03-04T14:30:00.000Z', 'NEEL NADIYAPARA'),
        doc('DOC-803', 'Bill of Lading', 'bill-exp-008.pdf', 'PDF', 'Verified', '2026-03-05T07:00:00.000Z', 'PRINCE DODIYA'),
        doc('DOC-804', 'Shipping Bill', 'shipping-bill-exp-008.pdf', 'PDF', 'Verified', '2026-03-05T07:25:00.000Z', 'PRINCE DODIYA'),
        doc('DOC-805', 'Certificate of Origin', 'origin-exp-008.pdf', 'PDF', 'Verified', '2026-03-05T08:10:00.000Z', 'NEEL NADIYAPARA'),
        doc('DOC-806', 'Insurance Papers', 'insurance-exp-008.pdf', 'PDF', 'Verified', '2026-03-05T08:30:00.000Z', 'NEEL NADIYAPARA'),
        doc('DOC-807', 'Customs Files', 'customs-exp-008.pdf', 'PDF', 'Verified', '2026-03-05T09:00:00.000Z', 'PRINCE DODIYA')
      ],
      aiScan: [scan('SCAN-010', 'Shipping Bill', 'SB-VN-7788', '2026-03-04', 'AquaMarine Logistics', 'USD 78,450.00', 'Vietnam', 94)],
      comments: [],
      driverName: 'Chen Wei',
      driverPhone: '+91 97654-34567',
      vehicleNumber: 'AP-02-EF-4321',
      estimatedDeliveryTime: '2026-03-14T11:00:00.000Z'
    },
    {
      id: 'EXP-2026-009',
      clientName: 'Canadian Timber Co',
      destinationCountry: 'Canada',
      shipmentDate: '2026-03-09',
      containerNumber: 'HAPAG1357924-3',
      status: 'Shipment Created',
      delayed: false,
      deadline: '2026-03-25',
      priority: 'Medium',
      assignedTo: 'PRINCE DODIYA',
      documents: [
        doc('DOC-901', 'Invoice', 'invoice-exp-009.pdf', 'PDF', 'Verified', '2026-03-09T08:15:00.000Z', 'PRINCE DODIYA'),
        doc('DOC-902', 'Packing List', 'Not uploaded', 'PDF', 'Missing', '2026-03-09T09:00:00.000Z', 'System'),
        doc('DOC-903', 'Bill of Lading', 'Not uploaded', 'PDF', 'Missing', '2026-03-09T09:00:00.000Z', 'System'),
        doc('DOC-904', 'Shipping Bill', 'Not uploaded', 'PDF', 'Missing', '2026-03-09T09:00:00.000Z', 'System'),
        doc('DOC-905', 'Certificate of Origin', 'Not uploaded', 'PDF', 'Missing', '2026-03-09T09:00:00.000Z', 'System'),
        doc('DOC-906', 'Insurance Papers', 'Not uploaded', 'PDF', 'Missing', '2026-03-09T09:00:00.000Z', 'System'),
        doc('DOC-907', 'Customs Files', 'Not uploaded', 'PDF', 'Missing', '2026-03-09T09:00:00.000Z', 'System')
      ],
      aiScan: [scan('SCAN-011', 'Commercial Invoice', 'INV-CA-99887', '2026-03-09', 'Canadian Timber Co', 'USD 298,750.00', 'Canada', 96)],
      comments: [
        {
          id: 'COM-010',
          author: 'PRINCE DODIYA',
          role: 'Admin',
          message: 'Large shipment. Client to provide remaining docs by EOD March 12.',
          createdAt: '2026-03-10T16:20:00.000Z',
          internal: false
        }
      ]
    },
    {
      id: 'EXP-2026-010',
      clientName: 'Meridian Textiles',
      destinationCountry: 'Bangladesh',
      shipmentDate: '2026-03-07',
      containerNumber: 'SEATRADE2468-4',
      status: 'In Transit',
      delayed: true,
      deadline: '2026-03-12',
      priority: 'High',
      assignedTo: 'NIKHIL BHEDA',
      documents: [
        doc('DOC-1001', 'Invoice', 'invoice-exp-010.pdf', 'PDF', 'Verified', '2026-03-07T09:20:00.000Z', 'NIKHIL BHEDA'),
        doc('DOC-1002', 'Packing List', 'packing-list-exp-010.pdf', 'PDF', 'Verified', '2026-03-07T09:40:00.000Z', 'NIKHIL BHEDA'),
        doc('DOC-1003', 'Bill of Lading', 'bill-exp-010.pdf', 'PDF', 'Rejected', '2026-03-07T10:30:00.000Z', 'DHRUV BHANVADIYA'),
        doc('DOC-1004', 'Shipping Bill', 'shipping-bill-exp-010.pdf', 'PDF', 'Verified', '2026-03-07T11:00:00.000Z', 'DHRUV BHANVADIYA'),
        doc('DOC-1005', 'Certificate of Origin', 'origin-exp-010.pdf', 'PDF', 'Pending', '2026-03-07T11:30:00.000Z', 'NIKHIL BHEDA'),
        doc('DOC-1006', 'Insurance Papers', 'insurance-exp-010.pdf', 'PDF', 'Verified', '2026-03-07T11:50:00.000Z', 'NIKHIL BHEDA'),
        doc('DOC-1007', 'Customs Files', 'customs-exp-010.pdf', 'PDF', 'Pending', '2026-03-08T07:00:00.000Z', 'NIKHIL BHEDA')
      ],
      aiScan: [scan('SCAN-012', 'Commercial Invoice', 'INV-BD-55332', '2026-03-07', 'Meridian Textiles', 'USD 167,890.00', 'Bangladesh', 93)],
      comments: [
        {
          id: 'COM-011',
          author: 'NIKHIL BHEDA',
          role: 'Manager',
          message: 'Rejected BoL needs urgent replacement. Customs holding shipment.',
          createdAt: '2026-03-10T08:15:00.000Z',
          internal: false
        }
      ],
      driverName: 'Arjun Reddy',
      driverPhone: '+91 98765-12345',
      vehicleNumber: 'TS-09-GH-2468',
      estimatedDeliveryTime: '2026-03-13T12:00:00.000Z'
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
    },
    {
      id: 'NT-006',
      shipmentId: 'EXP-2026-007',
      type: 'Approval Delay',
      severity: 'Medium',
      title: 'Certificate of Origin pending review',
      message: 'CoO document for EXP-2026-007 awaiting manager verification.',
      createdAt: '2026-03-10T12:00:00.000Z',
      dueDate: '2026-03-12',
      read: false
    },
    {
      id: 'NT-007',
      shipmentId: 'EXP-2026-009',
      type: 'Missing Docs',
      severity: 'High',
      title: 'Large shipment documents incomplete',
      message: 'EXP-2026-009 (CAD $298.75K): Only invoice received. 6 of 7 required documents missing.',
      createdAt: '2026-03-10T14:20:00.000Z',
      dueDate: '2026-03-12',
      read: false
    },
    {
      id: 'NT-008',
      shipmentId: 'EXP-2026-010',
      type: 'Approval Delay',
      severity: 'High',
      title: 'Rejected BoL - resubmission critical',
      message: 'Bill of Lading rejected for EXP-2026-010. Customs holding cargo. Urgent resubmission needed.',
      createdAt: '2026-03-10T07:50:00.000Z',
      dueDate: '2026-03-11',
      read: false
    },
    {
      id: 'NT-009',
      shipmentId: 'EXP-2026-006',
      type: 'Deadline',
      severity: 'Low',
      title: 'Shipment delivered successfully',
      message: 'EXP-2026-006 to Singapore delivered. Client signed delivery receipt.',
      createdAt: '2026-03-09T10:30:00.000Z',
      dueDate: '2026-03-09',
      read: true
    },
    {
      id: 'NT-010',
      shipmentId: 'EXP-2026-008',
      type: 'Deadline',
      severity: 'Low',
      title: 'On-track for delivery',
      message: 'EXP-2026-008 to Vietnam proceeding normally. Expected delivery March 14.',
      createdAt: '2026-03-10T09:00:00.000Z',
      dueDate: '2026-03-14',
      read: true
    }
  ],
  clients: [
    {
      id: 'CL-001',
      name: 'Apex Retail',
      email: 'client@apex.com',
      companyName: 'Apex Retail Imports',
      activeShipments: 1,
      lastLogin: '2026-03-14T10:00:00.000Z'
    },
    {
      id: 'CL-002',
      name: 'BlueWave',
      email: 'client@bluewave.com',
      companyName: 'BlueWave Foods',
      activeShipments: 1,
      lastLogin: '2026-03-14T11:00:00.000Z'
    },
    {
      id: 'CL-003',
      name: 'Nordic Auto',
      email: 'client@nordic.com',
      companyName: 'Nordic Auto Components',
      activeShipments: 1,
      lastLogin: '2026-03-14T09:00:00.000Z'
    }
  ],
  invites: []
});
