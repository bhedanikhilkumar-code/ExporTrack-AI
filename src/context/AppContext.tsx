import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { createSeedState } from '../data/seedData';
import {
  AppState,
  CreateShipmentInput,
  DocStatus,
  DocumentType,
  NotificationItem,
  OCRExtraction,
  Role,
  Shipment,
  ShipmentDocument,
  UploadDocumentInput
} from '../types';

const STORAGE_KEY = 'exportrack-ai-state-v1';

interface AppContextValue {
  state: AppState;
  login: (email: string, password: string) => void;
  signup: (name: string, email: string, password: string) => void;
  loginWithGoogle: () => void;
  logout: () => void;
  switchRole: (role: Role) => void;
  toggleTheme: () => void;
  createShipment: (input: CreateShipmentInput) => Shipment;
  addDocument: (shipmentId: string, input: UploadDocumentInput) => void;
  updateDocumentStatus: (shipmentId: string, documentType: DocumentType, status: DocStatus) => void;
  addComment: (shipmentId: string, message: string, internal: boolean) => void;
  markNotificationRead: (notificationId: string) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

const createId = (prefix: string): string =>
  `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0')}`;

const loadState = (): AppState => {
  if (typeof window === 'undefined') {
    return createSeedState();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createSeedState();
    }
    return JSON.parse(raw) as AppState;
  } catch {
    return createSeedState();
  }
};

const mockExtraction = (shipmentId: string, type: DocumentType): OCRExtraction => {
  const serial = Math.floor(Math.random() * 90000 + 10000);
  const shipmentSuffixParts = shipmentId.split('-');
  const shipmentSuffix = shipmentSuffixParts[shipmentSuffixParts.length - 1] ?? '000';
  return {
    id: createId('SCAN'),
    documentType: type,
    invoiceNumber: `INV-${shipmentSuffix}-${serial}`,
    date: new Date().toISOString().slice(0, 10),
    buyerName: 'Auto-extracted buyer',
    shipmentValue: `USD ${(Math.random() * 150000 + 20000).toFixed(2)}`,
    destination: 'Auto-detected destination',
    confidence: Math.floor(Math.random() * 8 + 90)
  };
};

const buildNotification = (
  shipmentId: string,
  type: NotificationItem['type'],
  severity: NotificationItem['severity'],
  title: string,
  message: string,
  dueDate: string
): NotificationItem => ({
  id: createId('NT'),
  shipmentId,
  type,
  severity,
  title,
  message,
  createdAt: new Date().toISOString(),
  dueDate,
  read: false
});

export const AppProvider = ({ children }: PropsWithChildren) => {
  const [state, setState] = useState<AppState>(() => loadState());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    
    // Sync theme with document class
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state]);

  const toggleTheme = () => {
    setState(prev => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark'
    }));
  };

  const login = (email: string, password: string) => {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    // Check if known team member
    const knownMember = state.teamMembers.find(
      (member) => member.email.toLowerCase() === email.toLowerCase()
    );
    
    const nameFromEmail = email.split('@')[0].replace(/[._]/g, ' ');
    const displayName = knownMember?.name ?? nameFromEmail.replace(/\b\w/g, (char) => char.toUpperCase());
    
    setState((prev) => ({
      ...prev,
      isAuthenticated: true,
      user: {
        name: displayName,
        email,
        role: knownMember?.role ?? prev.user?.role ?? 'Staff',
        authProvider: 'email'
      }
    }));
  };

  const signup = (name: string, email: string, password: string) => {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    setState((prev) => ({
      ...prev,
      isAuthenticated: true,
      user: {
        name: name.trim() || 'New User',
        email,
        role: 'Staff',
        authProvider: 'email'
      }
    }));
  };

  const loginWithGoogle = () => {
    // Simulate OAuth callback with realistic Google profile
    // In production, this would be replaced with actual Google OAuth flow
    const googleUsers = [
      {
        name: 'Nikhil Bheda',
        email: 'nikhil@bhedaexports.com',
        role: 'Export Operations Manager'
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@company.com',
        role: 'Compliance Officer'
      },
      {
        name: 'Marco Chen',
        email: 'marco.chen@logistics.com',
        role: 'Shipment Coordinator'
      }
    ];

    // Use a consistent user based on email hash (for demo consistency)
    const demoUser = googleUsers[0];

    setState((prev) => ({
      ...prev,
      isAuthenticated: true,
      user: {
        name: demoUser.name,
        email: demoUser.email,
        role: demoUser.role,
        authProvider: 'google'
      }
    }));
  };

  const logout = () => {
    setState((prev) => ({
      ...prev,
      isAuthenticated: false,
      user: null
    }));
  };

  const switchRole = (role: Role) => {
    setState((prev) => ({
      ...prev,
      user: prev.user ? { ...prev.user, role } : prev.user
    }));
  };

  const createShipment = (input: CreateShipmentInput): Shipment => {
    const now = new Date().toISOString();
    const shipment: Shipment = {
      id: input.shipmentId,
      clientName: input.clientName,
      destinationCountry: input.destinationCountry,
      shipmentDate: input.shipmentDate,
      containerNumber: input.containerNumber,
      status: input.status,
      delayed: false,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      priority: 'Medium',
      assignedTo: input.assignedTo,
      documents: [],
      aiScan: [],
      comments: [
        {
          id: createId('COM'),
          author: state.user?.name ?? 'System',
          role: state.user?.role ?? 'Staff',
          message: 'Shipment record created. Awaiting first document upload.',
          createdAt: now,
          internal: true
        }
      ]
    };

    setState((prev) => ({
      ...prev,
      shipments: [shipment, ...prev.shipments],
      notifications: [
        buildNotification(
          shipment.id,
          'Deadline',
          'Medium',
          `Shipment ${shipment.id} created`,
          'New shipment added. Upload and verify mandatory documents.',
          shipment.deadline
        ),
        ...prev.notifications
      ]
    }));

    return shipment;
  };

  const addDocument = (shipmentId: string, input: UploadDocumentInput) => {
    const newDocument: ShipmentDocument = {
      id: createId('DOC'),
      type: input.type,
      fileName: input.fileName,
      fileFormat: input.fileFormat,
      status: 'Pending',
      uploadedAt: new Date().toISOString(),
      uploadedBy: input.uploadedBy
    };

    setState((prev) => {
      const shipments = prev.shipments.map((shipment) => {
        if (shipment.id !== shipmentId) {
          return shipment;
        }

        const withoutPlaceholder = shipment.documents.filter(
          (doc) => !(doc.type === input.type && doc.fileName === 'Not uploaded')
        );

        return {
          ...shipment,
          documents: [newDocument, ...withoutPlaceholder],
          aiScan: [mockExtraction(shipmentId, input.type), ...shipment.aiScan]
        };
      });

      return {
        ...prev,
        shipments,
        notifications: [
          buildNotification(
            shipmentId,
            'Approval Delay',
            'Low',
            `${input.type} uploaded for ${shipmentId}`,
            `${input.fileName} uploaded and queued for verification.`,
            new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
          ),
          ...prev.notifications
        ]
      };
    });
  };

  const updateDocumentStatus = (shipmentId: string, documentType: DocumentType, status: DocStatus) => {
    setState((prev) => {
      const shipments = prev.shipments.map((shipment) => {
        if (shipment.id !== shipmentId) {
          return shipment;
        }

        const nextDocuments = [...shipment.documents];
        const documentIndex = nextDocuments.findIndex((doc) => doc.type === documentType);

        if (documentIndex >= 0) {
          nextDocuments[documentIndex] = {
            ...nextDocuments[documentIndex],
            status
          };
        } else {
          nextDocuments.unshift({
            id: createId('DOC'),
            type: documentType,
            fileName: 'Not uploaded',
            fileFormat: 'PDF',
            status,
            uploadedAt: new Date().toISOString(),
            uploadedBy: 'System'
          });
        }

        return {
          ...shipment,
          documents: nextDocuments
        };
      });

      const notifications = [...prev.notifications];
      if (status === 'Missing' || status === 'Rejected') {
        notifications.unshift(
          buildNotification(
            shipmentId,
            'Missing Docs',
            status === 'Rejected' ? 'High' : 'Medium',
            `${documentType} ${status.toLowerCase()} for ${shipmentId}`,
            `Please resolve ${documentType} status: ${status}.`,
            new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
          )
        );
      }

      return {
        ...prev,
        shipments,
        notifications
      };
    });
  };

  const addComment = (shipmentId: string, message: string, internal: boolean) => {
    if (!state.user) {
      return;
    }

    setState((prev) => ({
      ...prev,
      shipments: prev.shipments.map((shipment) =>
        shipment.id !== shipmentId
          ? shipment
          : {
            ...shipment,
            comments: [
              {
                id: createId('COM'),
                author: prev.user?.name ?? 'Unknown',
                role: prev.user?.role ?? 'Staff',
                message,
                createdAt: new Date().toISOString(),
                internal
              },
              ...shipment.comments
            ]
          }
      )
    }));
  };

  const markNotificationRead = (notificationId: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((notification) =>
        notification.id === notificationId ? { ...notification, read: true } : notification
      )
    }));
  };

  const value = useMemo<AppContextValue>(
    () => ({
      state,
      login,
      signup,
      loginWithGoogle,
      logout,
      switchRole,
      toggleTheme,
      createShipment,
      addDocument,
      updateDocumentStatus,
      addComment,
      markNotificationRead
    }),
    [state]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextValue => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

