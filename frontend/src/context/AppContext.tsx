import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createEmptyState, createSeedState } from '../data/seedData';
import { updateShipmentStatus, calculateShipmentStatus, isRealUser as checkIsRealUser } from '../services/shipmentStatusService';
import {
  AppState,
  CreateShipmentInput,
  DocStatus,
  DocumentType,
  InviteTeamMemberInput,
  NotificationItem,
  OCRExtraction,
  Role,
  Shipment,
  ShipmentDocument,
  Team,
  TeamInvite,
  TeamMemberWithPermissions,
  TeamPermission,
  UploadDocumentInput,
  UserSession
} from '../types';
import { decodeJWT } from '../utils/googleAuth';
import { hasPermission as checkPermission, Permission } from '../utils/permissions';
import { computeAnalytics, ShipmentAnalyticsMetrics } from '../services/analyticsService';
import { shipmentApi } from '../services/api/shipmentApi';
import { teamApi } from '../services/api/teamApi';
import { notificationApi } from '../services/api/notificationApi';
import { trackingApi } from '../services/api/trackingApi';
import { documentApi } from '../services/api/documentApi';

// Storage keys
const STORAGE_KEY = 'exportrack-ai-state-v1';
const DEMO_STORAGE_KEY = 'exportrack-ai-demo-state';
const USER_DATA_PREFIX = 'exportrack-ai-user-';

import { TrackingInfo } from '../types/tracking';

import { CommercialInvoice } from '../types/invoice';
import { PackingList } from '../types/packingList';
import { ShippingBill } from '../types/shippingBill';
import { CertificateOfOrigin } from '../types/certificateOfOrigin';

interface AppContextValue {
  state: AppState;
  login: (email: string, password?: string, forceMode?: 'real' | 'demo') => void;
  signup: (name: string, email: string, password: string) => void;
  loginWithDemoAccount: () => void;
  loginWithGoogleToken: (token: string) => void;
  loginWithGoogle: () => void; // Google OAuth login
  logout: () => void;
  switchRole: (role: Role) => void;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  createShipment: (input: CreateShipmentInput) => Shipment;
  updateShipment: (shipmentId: string, updates: Partial<Shipment>) => void;
  updateShipmentStatus: (shipmentId: string, status: string) => void;
  assignDriver: (shipmentId: string, driverName: string, driverPhone: string, vehicleNumber: string) => void;
  deleteShipment: (shipmentId: string) => void;
  addDocument: (shipmentId: string, input: UploadDocumentInput) => void;
  updateDocumentStatus: (shipmentId: string, documentType: DocumentType, status: DocStatus) => void;
  addComment: (shipmentId: string, message: string, internal: boolean) => void;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  // Team management
  createTeam: (teamName: string) => Team | null;
  addTeamMember: (teamId: string, name: string, email: string, role: Role, permission: TeamPermission) => TeamMemberWithPermissions | null;
  removeTeamMember: (teamId: string, memberId: string) => void;
  updateTeamMemberPermission: (teamId: string, memberId: string, permission: TeamPermission) => void;
  leaveTeam: (teamId: string) => void;
  // Legacy team management (for ProfileTeamPage)
  inviteTeamMember: (input: InviteTeamMemberInput) => boolean;
  updateMemberRole: (memberId: string, role: Role) => void;
  removeLegacyTeamMember: (memberId: string) => void;
  updateUserProfile: (updates: { name?: string; region?: string }) => void;
  updateWorkspaceSettings: (settings: { name: string; tagline: string; timezone?: string; language?: string }) => void;
  deleteInvite: (inviteId: string) => void;
  acceptInvite: (inviteId: string) => void;
  // Dispatch for state management
  dispatch: (action: { type: string; payload?: any }) => void;
  // Tracking features
  saveTracking: (tracking: TrackingInfo) => void;
  deleteTracking: (trackingId: string) => void;
  applyOptimizedRoute: (shipmentId: string, route: any) => void;
  triggerDelayAlert: (shipmentId: string, reason: string) => void;
  // Document Generators
  saveInvoice: (invoice: CommercialInvoice) => void;
  deleteInvoice: (id: string) => void;
  savePackingList: (pl: PackingList) => void;
  deletePackingList: (id: string) => void;
  saveShippingBill: (sb: ShippingBill) => void;
  deleteShippingBill: (id: string) => void;
  saveCOO: (coo: CertificateOfOrigin) => void;
  deleteCOO: (id: string) => void;
  getNextDocumentNumber: (prefix: string) => string;
  // Helpers
  isDemoUser: boolean;
  isRealUser: boolean;
  canManageTeam: boolean;
  canCreateShipment: boolean;
  hasPermission: (permission: Permission) => boolean;
  getAnalytics: () => ShipmentAnalyticsMetrics;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

const createId = (prefix: string): string =>
  `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0')}`;

// Load state based on user mode
const loadState = (userMode?: 'demo' | 'real', userId?: string): AppState => {
  if (typeof globalThis.window === 'undefined') {
    return createEmptyState();
  }

  try {
    // For real users, load user-specific data
    if (userMode === 'real' && userId) {
      const userKey = `${USER_DATA_PREFIX}${userId}`;
      const raw = localStorage.getItem(userKey);
      if (raw) {
        const userState = JSON.parse(raw) as AppState;
        // Ensure user data is present
        return {
          ...createEmptyState(),
          ...userState,
          isAuthenticated: true
        };
      }
    }

    // For demo users, load demo data
    if (userMode === 'demo') {
      const raw = localStorage.getItem(DEMO_STORAGE_KEY);
      if (raw) {
        const demoState = JSON.parse(raw) as AppState;
        // Ensure state fields are present
        return {
          ...createEmptyState(),
          ...demoState,
          isAuthenticated: true
        };
      }
      // Return fresh demo state
      return {
        ...createSeedState(),
        isAuthenticated: true
      };
    }

    // Default: return empty state
    return createEmptyState();
  } catch {
    return createEmptyState();
  }
};

// Save state based on user mode
const saveState = (state: AppState, userMode?: 'demo' | 'real', userId?: string): void => {
  if (typeof globalThis.window === 'undefined') return;

  try {
    // For real users, save to user-specific storage
    if (userMode === 'real' && userId) {
      const userKey = `${USER_DATA_PREFIX}${userId}`;
      localStorage.setItem(userKey, JSON.stringify(state));
    } else if (userMode === 'demo') {
      // Consistent with loadState, use localStorage for demo persistence
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(state));
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  } catch (e) {
    console.warn('Failed to save state:', e);
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
  // Track user mode and ID for data isolation
  const [userMode, setUserMode] = useState<'demo' | 'real' | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const [state, setState] = useState<AppState>(() => {
    // Try to restore session from sessionStorage
    if (typeof globalThis.window !== 'undefined') {
      try {
        const savedMode = sessionStorage.getItem('exportrack-user-mode');
        const savedId = sessionStorage.getItem('exportrack-user-id');

        if (savedMode && savedId) {
          setUserMode(savedMode as 'demo' | 'real');
          setUserId(savedId);
          return loadState(savedMode as 'demo' | 'real', savedId);
        }
      } catch (e) {
        console.warn('Failed to restore session:', e);
      }
    }
    return createEmptyState();
  });

  // Persist user mode and ID
  useEffect(() => {
    if (userMode && userId && state.isAuthenticated) {
      sessionStorage.setItem('exportrack-user-mode', userMode);
      sessionStorage.setItem('exportrack-user-id', userId);
    }
  }, [userMode, userId, state.isAuthenticated]);

  // Save state when it changes
  useEffect(() => {
    if (state.isAuthenticated && userMode && userId) {
      saveState(state, userMode, userId);
    }
  }, [state, userMode, userId]);

  // Sync theme with document class
  useEffect(() => {
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.theme]);

  // Restore session on app load
  useEffect(() => {
    if (typeof globalThis.window !== 'undefined' && state.isAuthenticated && state.user?.authProvider === 'google') {
      const token = sessionStorage.getItem('google_auth_token');
      const userEmail = sessionStorage.getItem('google_user_email');

      if (!token || !userEmail) {
        console.warn('Google session expired or invalid, logging out');
        setState(prev => ({
          ...prev,
          isAuthenticated: false,
          user: null
        }));
        setUserMode(null);
        setUserId(null);
      }
    }
  }, [state.isAuthenticated, state.user?.authProvider]);

  // Load shipments and teams from backend if real user
  useEffect(() => {
    const loadData = async () => {
      if (state.isAuthenticated && userMode === 'real') {
        try {
          // Load Shipments
          const shipments = await shipmentApi.getAll();
          setState(prev => ({
            ...prev,
            shipments: shipments.length > 0 ? shipments : prev.shipments
          }));

          // Load Notifications, Tracking and Documents
          if (userId) {
            const [notifications, trackings, invoices, packingLists, shippingBills, coos] = await Promise.all([
              notificationApi.getNotifications(userId),
              trackingApi.getAll(),
              documentApi.getInvoices(),
              documentApi.getPackingLists(),
              documentApi.getShippingBills(),
              documentApi.getCOOs()
            ]);

            setState(prev => ({
              ...prev,
              notifications: notifications.length > 0 ? notifications : prev.notifications,
              trackings: trackings.length > 0 ? trackings : prev.trackings,
              invoices: invoices.length > 0 ? invoices : prev.invoices,
              packingLists: packingLists.length > 0 ? packingLists : prev.packingLists,
              shippingBills: shippingBills.length > 0 ? shippingBills : prev.shippingBills,
              coos: coos.length > 0 ? coos : prev.coos
            }));
          }

          // Load Team if exists
          if (state.user?.teamId) {
            const team = await teamApi.getTeam(state.user.teamId);
            const members = await teamApi.getMembers(state.user.teamId);
            setState(prev => ({
              ...prev,
              team,
              teamMembers: members
            }));
          }
        } catch (error) {
          console.error('Failed to load backend data:', error);
        }
      }
    };
    loadData();
  }, [state.isAuthenticated, userMode, state.user?.teamId]);

  // Helper properties
  const isDemoUser = state.user?.userMode === 'demo' || state.user?.authProvider === 'demo';
  const isRealUser = state.user?.userMode === 'real' || state.user?.authProvider === 'email' || state.user?.authProvider === 'google';

  // Demo users cannot manage teams
  const canManageTeam = isRealUser && state.user !== null;

  // All authenticated users can create shipments
  const canCreateShipment = state.isAuthenticated && state.user !== null;

  const toggleTheme = useCallback(() => {
    setState(prev => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark'
    }));
  }, []);

  const login = useCallback((email: string, password?: string, forceMode?: 'real' | 'demo') => {
    // For demo purposes, we'll just set a mock user
    const mode = forceMode || (email.includes('demo') ? 'demo' : 'real');
    const newUser: UserSession = {
      id: mode === 'real' ? `email-${email.toLowerCase()}` : 'user-123',
      name: email.split('@')[0],
      email: email.toLowerCase(),
      role: 'Staff',
      authProvider: mode === 'demo' ? 'demo' : 'email',
      userMode: mode,
    };

    const emptyState = mode === 'demo' ? createSeedState() : createEmptyState();
    const newUserId = newUser.id;

    setUserMode(mode);
    setUserId(newUserId);

    setState({
      ...emptyState,
      isAuthenticated: true,
      user: newUser
    });

    if (typeof globalThis.window !== 'undefined') {
      console.log('User logged in with email:', email);
    }
  }, []);

  const signup = useCallback((name: string, email: string, password: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    if (!name.trim()) {
      throw new Error('Name is required');
    }

    const emptyState = createEmptyState();
    const newUserId = `email-${email}`;

    const newUser: UserSession = {
      id: newUserId,
      name: name.trim(),
      email,
      role: 'Staff',
      authProvider: 'email',
      userMode: 'real'
    };

    setUserMode('real');
    setUserId(newUserId);

    setState({
      ...emptyState,
      isAuthenticated: true,
      user: newUser
    });

    if (typeof globalThis.window !== 'undefined') {
      console.log('New user registered:', email);
    }
  }, []);

  const loginWithDemoAccount = useCallback(() => {
    // Create demo user session with full seed data
    const demoState = createSeedState();
    const demoUserId = 'demo-user';

    const demoUser: UserSession = {
      id: demoUserId,
      name: 'Demo User',
      email: 'demo@exportrack.ai',
      role: 'Staff',
      authProvider: 'demo',
      userMode: 'demo'
    };

    setUserMode('demo');
    setUserId(demoUserId);

    setState({
      ...demoState,
      isAuthenticated: true,
      user: demoUser
    });

    console.warn('Demo account loaded for testing');
  }, []);

  const loginWithGoogleToken = useCallback((token: string) => {
    try {
      const payload = decodeJWT(token);

      if (!payload?.email) {
        throw new Error('Invalid token or missing email');
      }

      const emptyState = createEmptyState();
      const userName = payload.name || payload.given_name || 'Google User';
      const userEmail = payload.email;
      const profilePicture = payload.picture;
      const newUserId = payload.sub || `google-${userEmail}`;

      const newUser: UserSession = {
        id: newUserId,
        name: userName,
        email: userEmail,
        role: 'Staff',
        authProvider: 'google',
        profilePicture: profilePicture,
        userMode: 'real'
      };

      setUserMode('real');
      setUserId(newUserId);

      setState({
        ...emptyState,
        isAuthenticated: true,
        user: newUser
      });

      if (typeof globalThis.window !== 'undefined') {
        sessionStorage.setItem('google_auth_token', token);
        sessionStorage.setItem('google_token_expiry', new Date(payload.exp * 1000).toISOString());
        sessionStorage.setItem('google_user_email', userEmail);

        console.log('User authenticated with Google:', {
          name: userName,
          email: userEmail,
          hasProfilePicture: !!profilePicture
        });
      }
    } catch (error) {
      console.error('Failed to login with Google token:', error);

      if (typeof globalThis.window !== 'undefined') {
        sessionStorage.removeItem('google_auth_token');
        sessionStorage.removeItem('google_token_expiry');
        sessionStorage.removeItem('google_user_email');
      }

      throw new Error('Google authentication failed. Please try again.');
    }
  }, []);

  const logout = useCallback(() => {
    if (typeof globalThis.window !== 'undefined') {
      sessionStorage.removeItem('google_auth_token');
      sessionStorage.removeItem('google_token_expiry');
      sessionStorage.removeItem('google_user_email');
      sessionStorage.removeItem('exportrack-user-mode');
      sessionStorage.removeItem('exportrack-user-id');
      console.log('User logged out');
    }

    setUserMode(null);
    setUserId(null);

    setState(prev => ({
      ...prev,
      isAuthenticated: false,
      user: null
    }));
  }, []);

  const switchRole = useCallback((role: Role) => {
    setState(prev => ({
      ...prev,
      user: prev.user ? { ...prev.user, role } : prev.user
    }));
  }, []);

  const createShipment = useCallback((input: CreateShipmentInput): Shipment => {
    const now = new Date().toISOString();
    const userMode = state.user?.userMode;

    // Create initial shipment with Draft status
    const shipment: Shipment = {
      id: input.shipmentId,
      userId: userId || undefined,
      clientName: input.clientName,
      destinationCountry: input.destinationCountry,
      shipmentDate: input.shipmentDate,
      containerNumber: input.containerNumber,
      status: 'Shipment Created', // Initial legacy status
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
      ],
      // Initialize timeline for status automation
      timeline: [
        {
          id: createId('TLE'),
          status: 'Draft',
          timestamp: now,
          note: 'Shipment created and saved as draft'
        }
      ]
    };

    // Apply status automation for real users
    if (checkIsRealUser(userMode)) {
      const automationResult = updateShipmentStatus(shipment, userMode);
      if (automationResult) {
        shipment.status = automationResult.newStatus as any;
        if (automationResult.timelineEvent) {
          // Add id to timeline event
          const timelineWithId = {
            ...automationResult.timelineEvent,
            id: createId('TLE')
          };
          shipment.timeline = [timelineWithId];
        }
      }

      // Persist to backend
      shipmentApi.create({
        ...input,
        id: shipment.id,
        userId: userId || undefined
      }).then(() => {
        // Persist initial timeline event
        if (shipment.timeline && shipment.timeline.length > 0) {
          shipmentApi.addTimelineEvent(shipment.id, shipment.timeline[0]);
        }
      }).catch(err => console.error('Failed to persist shipment to backend:', err));
    }

    setState(prev => ({
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
  }, [state.user, userId]);

  const updateShipment = useCallback((shipmentId: string, updates: Partial<Shipment>) => {
    const userMode = state.user?.userMode;

    if (checkIsRealUser(userMode)) {
      shipmentApi.addDocument(shipmentId, newDocument).then(() => {
        // Also add a timeline event for document upload
        const timelineEvent: ShipmentTimelineEvent = {
          id: createId('TLE'),
          status: 'Document Uploaded',
          timestamp: new Date().toISOString(),
          note: `${newDocument.type} uploaded by ${newDocument.uploadedBy}`
        };
        shipmentApi.addTimelineEvent(shipmentId, timelineEvent);
      }).catch(err => console.error('Failed to persist document to backend:', err));
    }

    setState(prev => {
      const shipments = prev.shipments.map(shipment => {
        if (shipment.id !== shipmentId) return shipment;

        const updatedShipment = { ...shipment, ...updates };

        // Apply status automation for real users
        if (checkIsRealUser(userMode)) {
          const automationResult = updateShipmentStatus(updatedShipment, userMode);
          if (automationResult) {
            updatedShipment.status = automationResult.newStatus as any;
            if (automationResult.timelineEvent) {
              // Add id to timeline event
              const timelineEvent = {
                ...automationResult.timelineEvent,
                id: createId('TLE')
              };
              // Add to existing timeline
              updatedShipment.timeline = [...(updatedShipment.timeline || []), timelineEvent];
            }
          }
        }

        // Persist update to backend
        shipmentApi.update(shipmentId, updates).catch(err => console.error('Failed to update shipment in backend:', err));

        return updatedShipment;
      });

      return { ...prev, shipments };
    });
  }, [state.user, userMode]);

  const deleteShipment = useCallback((shipmentId: string) => {
    // Persist delete to backend
    if (userMode === 'real') {
      shipmentApi.delete(shipmentId).catch(err => console.error('Failed to delete shipment in backend:', err));
    }

    setState(prev => ({
      ...prev,
      shipments: prev.shipments.filter(shipment => shipment.id !== shipmentId),
      notifications: prev.notifications.filter(n => n.shipmentId !== shipmentId)
    }));
  }, [userMode]);

  const addDocument = useCallback((shipmentId: string, input: UploadDocumentInput) => {
    const newDocument: ShipmentDocument = {
      id: createId('DOC'),
      userId: userId || undefined,
      type: input.type,
      fileName: input.fileName,
      fileFormat: input.fileFormat,
      status: 'Pending',
      uploadedAt: new Date().toISOString(),
      uploadedBy: input.uploadedBy
    };

    setState(prev => {
      const shipments = prev.shipments.map(shipment => {
        if (shipment.id !== shipmentId) {
          return shipment;
        }

        const withoutPlaceholder = shipment.documents.filter(
          doc => !(doc.type === input.type && doc.fileName === 'Not uploaded')
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
  }, [userId, userMode]);

  const updateDocumentStatus = useCallback((shipmentId: string, documentType: DocumentType, status: DocStatus) => {
    setState(prev => {
      const shipments = prev.shipments.map(shipment => {
        if (shipment.id !== shipmentId) {
          return shipment;
        }

        const nextDocuments = [...shipment.documents];
        const documentIndex = nextDocuments.findIndex(doc => doc.type === documentType);

        if (documentIndex >= 0) {
          nextDocuments[documentIndex] = {
            ...nextDocuments[documentIndex],
            status
          };

          // Persist update to backend
          if (checkIsRealUser(userMode)) {
            shipmentApi.updateDocumentStatus(shipmentId, nextDocuments[documentIndex].id, status)
              .catch(err => console.error('Failed to update document status in backend:', err));
          }
        } else {
          const newDoc: ShipmentDocument = {
            id: createId('DOC'),
            type: documentType,
            fileName: 'Not uploaded',
            fileFormat: 'PDF',
            status,
            uploadedAt: new Date().toISOString(),
            uploadedBy: 'System'
          };
          nextDocuments.unshift(newDoc);

          // Persist new placeholder doc if needed (optional, but good for sync)
          if (checkIsRealUser(userMode)) {
            shipmentApi.addDocument(shipmentId, newDoc)
              .catch(err => console.error('Failed to add placeholder document in backend:', err));
          }
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
  }, [userMode]);

  const addComment = useCallback((shipmentId: string, message: string, internal: boolean) => {
    const newComment = {
      id: createId('COM'),
      author: state.user?.name ?? 'Unknown',
      role: state.user?.role ?? 'Staff',
      message,
      createdAt: new Date().toISOString(),
      internal
    };

    if (checkIsRealUser(userMode)) {
      shipmentApi.addComment(shipmentId, newComment).catch(err => console.error('Failed to persist comment to backend:', err));
    }

    setState(prev => ({
      ...prev,
      shipments: prev.shipments.map(shipment =>
        shipment.id !== shipmentId
          ? shipment
          : {
            ...shipment,
            comments: [newComment, ...shipment.comments]
          }
      )
    }));
  }, [state.user, userMode]);

  const markNotificationRead = useCallback((notificationId: string) => {
    if (userMode === 'real') {
      notificationApi.markAsRead(notificationId).catch(err => console.error('Failed to mark notification as read in backend:', err));
    }

    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(notification =>
        notification.id === notificationId ? { ...notification, read: true } : notification
      )
    }));
  }, [userMode]);

  // Team management functions
  const createTeam = useCallback((teamName: string): Team | null => {
    if (!state.user) {
      throw new Error('Must be logged in to create a team');
    }

    if (isDemoUser) {
      console.warn('Demo users cannot create teams');
      return null;
    }

    const team: Team = {
      id: createId('TEAM'),
      ownerId: state.user.id,
      name: teamName,
      createdAt: new Date().toISOString(),
      members: [
        {
          id: createId('TM'),
          userId: state.user.id,
          name: state.user.name,
          email: state.user.email,
          role: state.user.role,
          permission: 'admin',
          joinedAt: new Date().toISOString()
        }
      ]
    };

    // Persist to backend if real user
    if (userMode === 'real') {
      teamApi.createTeam({
        id: team.id,
        name: teamName,
        ownerId: state.user.id
      }).catch(err => console.error('Failed to persist team to backend:', err));
    }

    setState(prev => ({
      ...prev,
      userTeams: [...prev.userTeams, team]
    }));

    return team;
  }, [state.user, isDemoUser, userMode]);

  const addTeamMember = useCallback((
    teamId: string,
    name: string,
    email: string,
    role: Role,
    permission: TeamPermission
  ): TeamMemberWithPermissions | null => {
    if (!state.user || isDemoUser) {
      console.warn('Demo users cannot add team members');
      return null;
    }

    // Check if user is admin of the team
    const team = state.userTeams.find(t => t.id === teamId);
    if (!team) {
      return null;
    }

    const currentMember = team.members.find(m => m.userId === state.user?.id);
    if (!currentMember || currentMember.permission !== 'admin') {
      return null;
    }

    const newMember: TeamMemberWithPermissions = {
      id: createId('TM'),
      userId: `member-${email}`,
      name,
      email,
      role,
      permission,
      joinedAt: new Date().toISOString()
    };

    // Persist to backend if real user
    if (userMode === 'real') {
      teamApi.addMember(teamId, {
        userId: newMember.userId,
        role,
        name,
        email,
        permission
      }).catch(err => console.error('Failed to add member to backend:', err));
    }

    setState(prev => ({
      ...prev,
      userTeams: prev.userTeams.map(t =>
        t.id === teamId
          ? { ...t, members: [...t.members, newMember] }
          : t
      )
    }));

    return newMember;
  }, [state.user, state.userTeams, isDemoUser, userMode]);

  const removeTeamMember = useCallback((teamId: string, memberId: string) => {
    if (!state.user || isDemoUser) {
      console.warn('Demo users cannot remove team members');
      return;
    }

    const team = state.userTeams.find(t => t.id === teamId);
    if (!team) {
      return;
    }

    const currentMember = team.members.find(m => m.userId === state.user?.id);
    if (!currentMember || currentMember.permission !== 'admin') {
      return;
    }

    setState(prev => ({
      ...prev,
      userTeams: prev.userTeams.map(t =>
        t.id === teamId
          ? { ...t, members: t.members.filter(m => m.id !== memberId) }
          : t
      )
    }));
  }, [state.user, state.userTeams, isDemoUser]);

  const updateTeamMemberPermission = useCallback((teamId: string, memberId: string, permission: TeamPermission) => {
    if (!state.user || isDemoUser) {
      console.warn('Demo users cannot update team member permissions');
      return;
    }

    const team = state.userTeams.find(t => t.id === teamId);
    if (!team) {
      return;
    }

    const currentMember = team.members.find(m => m.userId === state.user?.id);
    if (!currentMember || currentMember.permission !== 'admin') {
      return;
    }

    setState(prev => ({
      ...prev,
      userTeams: prev.userTeams.map(t =>
        t.id === teamId
          ? {
            ...t,
            members: t.members.map(m =>
              m.id === memberId ? { ...m, permission } : m
            )
          }
          : t
      )
    }));
  }, [state.user, state.userTeams, isDemoUser]);

  const leaveTeam = useCallback((teamId: string) => {
    if (!state.user || isDemoUser) {
      console.warn('Demo users cannot leave teams');
      return;
    }

    setState(prev => ({
      ...prev,
      userTeams: prev.userTeams.map(t =>
        t.id === teamId
          ? { ...t, members: t.members.filter(m => m.userId !== state.user?.id) }
          : t
      ).filter(t => t.members.length > 0) // Remove team if no members left
    }));
  }, [state.user, isDemoUser]);

  // Legacy team management for ProfileTeamPage
  const inviteTeamMember = useCallback((input: InviteTeamMemberInput): boolean => {
    if (!state.user || isDemoUser) {
      console.warn('Demo users cannot invite team members');
      return false;
    }

    const invite: TeamInvite = {
      id: createId('INV'),
      name: input.name,
      email: input.email,
      role: input.role,
      workspaceId: input.workspaceId || 'default',
      token: `invite-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    if (userMode === 'real') {
      fetch('/api/invite-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: invite.email,
          role: invite.role,
          workspaceId: invite.workspaceId
        })
      }).catch(err => console.error('Failed to send invite to backend:', err));
    }

    setState(prev => ({
      ...prev,
      invites: [...prev.invites, invite]
    }));
    return true;
  }, [state.user, isDemoUser, userMode]);

  const updateMemberRole = useCallback((memberId: string, role: Role) => {
    if (!state.user || isDemoUser) {
      console.warn('Demo users cannot update member roles');
      return;
    }

    setState(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.map(member =>
        member.id === memberId ? { ...member, role } : member
      )
    }));
  }, [state.user, isDemoUser]);

  const removeLegacyTeamMember = useCallback((memberId: string) => {
    if (!state.user || isDemoUser) {
      console.warn('Demo users cannot remove team members');
      return;
    }

    setState(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.filter(member => member.id !== memberId)
    }));
  }, [state.user, isDemoUser]);

  const updateUserProfile = useCallback((updates: { name?: string; region?: string }) => {
    if (!state.user) return;

    if (userMode === 'real') {
      fetch(`/api/users/${state.user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      }).catch(err => console.error('Failed to update profile in backend:', err));
    }

    setState(prev => ({
      ...prev,
      user: prev.user ? { ...prev.user, ...updates } : prev.user
    }));
  }, [state.user, userMode]);

  const deleteInvite = useCallback((inviteId: string) => {
    if (!state.user || isDemoUser) {
      console.warn('Demo users cannot delete invites');
      return;
    }

    setState(prev => ({
      ...prev,
      invites: prev.invites.filter(invite => invite.id !== inviteId)
    }));
  }, [state.user, isDemoUser]);

  const acceptInvite = useCallback((inviteId: string) => {
    if (!state.user || isDemoUser) {
      console.warn('Demo users cannot accept invites');
      return;
    }

    const invite = state.invites.find(i => i.id === inviteId);
    if (!invite) {
      console.warn('Invite not found');
      return;
    }

    if (userMode === 'real') {
      fetch('/api/confirm-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: invite.token })
      }).catch(err => console.error('Failed to confirm invite in backend:', err));
    }

    // Add the user to the team's members
    const newMember: TeamMemberWithPermissions = {
      id: createId('TM'),
      userId: state.user.id,
      name: state.user.name,
      email: state.user.email,
      role: invite.role,
      permission: 'edit' as TeamPermission,
      joinedAt: new Date().toISOString()
    };

    setState(prev => ({
      ...prev,
      // Add member to the team
      userTeams: prev.userTeams.map(team =>
        team.id === invite.workspaceId
          ? { ...team, members: [...team.members, newMember] }
          : team
      ),
      // Update invite status to Accepted
      invites: prev.invites.map(i =>
        i.id === inviteId ? { ...i, status: 'Accepted' as const } : i
      )
    }));
  }, [state.user, state.invites, isDemoUser, userMode]);

  // Permission checker - use a different name to avoid conflict with imported function
  const checkUserPermission = useCallback((permission: Permission): boolean => {
    if (!state.user) return false;
    // Demo users have limited permissions
    if (isDemoUser) {
      return permission === 'view_shipments' || permission === 'view_documents' || permission === 'create_shipments';
    }
    return checkPermission(state.user.role, permission);
  }, [state.user, isDemoUser]);

  // Get analytics for shipments - Memoized to prevent unnecessary re-renders in Dashboard
  const getAnalytics = useCallback((): ShipmentAnalyticsMetrics => {
    return computeAnalytics(state.shipments);
  }, [state.shipments]);

  const value = useMemo<AppContextValue>(
    () => ({
      state,
      login,
      signup,
      loginWithDemoAccount: () => {
        const demoState = createSeedState();
        setState({
          ...demoState,
          isAuthenticated: true,
          user: {
            id: 'demo-user',
            name: 'Demo User',
            email: 'demo@exportrack.ai',
            role: 'Staff',
            userMode: 'demo'
          }
        });
        setUserMode('demo');
        setUserId('demo-user');
      },
      loginWithGoogleToken,
      loginWithGoogle: () => {
        // Trigger Google OAuth flow
        console.log('Google OAuth login triggered');
        // In a real app, this would trigger the Google OAuth flow
      },
      logout,
      switchRole,
      toggleTheme,
      setTheme: (theme: 'light' | 'dark' | 'system') => {
        setState(prev => ({ ...prev, theme }));
      },
      createShipment,
      updateShipment,
      updateShipmentStatus: (shipmentId: string, status: string) => {
        setState(prev => ({
          ...prev,
          shipments: prev.shipments.map(s =>
            s.id === shipmentId ? { ...s, status: status as any } : s
          )
        }));
      },
      assignDriver: (shipmentId: string, driverName: string, driverPhone: string, vehicleNumber: string) => {
        const updates = { driverName, driverPhone, vehicleNumber };

        if (userMode === 'real') {
          shipmentApi.update(shipmentId, updates).catch(err => console.error('Failed to persist driver assignment to backend:', err));
        }

        setState(prev => ({
          ...prev,
          shipments: prev.shipments.map(s =>
            s.id === shipmentId ? { ...s, ...updates } : s
          )
        }));
      },
      deleteShipment,
      addDocument,
      updateDocumentStatus,
      addComment,
      markNotificationRead,
      markAllNotificationsRead: () => {
        if (userMode === 'real' && userId) {
          // For each notification that is not read, mark it as read in backend
          state.notifications.forEach(n => {
            if (!n.read) {
              notificationApi.markAsRead(n.id).catch(err => console.error('Failed to mark notification read:', err));
            }
          });
        }

        setState(prev => ({
          ...prev,
          notifications: prev.notifications.map(n => ({ ...n, read: true }))
        }));
      },
      createTeam,
      addTeamMember,
      removeTeamMember,
      updateTeamMemberPermission,
      leaveTeam,
      inviteTeamMember,
      updateMemberRole,
      removeLegacyTeamMember,
      updateUserProfile,
      updateWorkspaceSettings: (settings: { name: string; tagline: string; timezone?: string; language?: string }) => {
        if (userMode === 'real') {
          fetch('/api/workspace/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings)
          }).catch(err => console.error('Failed to update workspace settings:', err));
        }
      },
      deleteInvite,
      acceptInvite,
      dispatch: (action: { type: string; payload?: any }) => {
        console.log('Dispatch action:', action);
        // Handle common actions
        switch (action.type) {
          case 'SET_THEME':
            setState(prev => ({ ...prev, theme: action.payload }));
            break;
          case 'UPDATE_SHIPMENT':
            setState(prev => ({
              ...prev,
              shipments: prev.shipments.map(s =>
                s.id === action.payload.id ? action.payload : s
              )
            }));
            break;
          default:
            break;
        }
      },
      saveTracking: (tracking: TrackingInfo) => {
        if (userMode === 'real') {
          trackingApi.save(tracking).catch(err => console.error('Failed to save tracking in backend:', err));
        }

        setState(prev => {
          const existingIdx = prev.trackings.findIndex(t => t.id === tracking.id || t.trackingNumber === tracking.trackingNumber);
          if (existingIdx >= 0) {
            const trackings = [...prev.trackings];
            trackings[existingIdx] = tracking;
            return { ...prev, trackings };
          }
          return { ...prev, trackings: [tracking, ...prev.trackings] };
        });
      },
      deleteTracking: (trackingId: string) => {
        if (userMode === 'real') {
          trackingApi.delete(trackingId).catch(err => console.error('Failed to delete tracking in backend:', err));
        }

        setState(prev => ({
          ...prev,
          trackings: prev.trackings.filter(t => t.id !== trackingId)
        }));
      },
      applyOptimizedRoute: (shipmentId: string, route: any) => {
        console.log('Apply optimized route:', shipmentId, route);
      },
      triggerDelayAlert: (shipmentId: string, reason: string) => {
        console.log('Trigger delay alert:', shipmentId, reason);
        // Add a notification for the delay
        const newNotification: NotificationItem = {
          id: `notif-${Date.now()}`,
          shipmentId,
          type: 'Approval Delay',
          severity: 'High',
          title: 'Shipment Delay Alert',
          message: reason,
          createdAt: new Date().toISOString(),
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          read: false
        };
        setState(prev => ({
          ...prev,
          notifications: [newNotification, ...prev.notifications]
        }));
      },

      // Document Generator Implementations
      saveInvoice: (invoice: CommercialInvoice) => {
        if (userMode === 'real') {
          documentApi.saveInvoice(invoice).catch(err => console.error('Failed to save invoice:', err));
        }
        setState(prev => ({
          ...prev,
          invoices: prev.invoices.some(i => i.id === invoice.id)
            ? prev.invoices.map(i => i.id === invoice.id ? invoice : i)
            : [invoice, ...prev.invoices]
        }));
      },
      deleteInvoice: (id: string) => {
        if (userMode === 'real') {
          documentApi.deleteInvoice(id).catch(err => console.error('Failed to delete invoice:', err));
        }
        setState(prev => ({ ...prev, invoices: prev.invoices.filter(i => i.id !== id) }));
      },

      savePackingList: (pl: PackingList) => {
        if (userMode === 'real') {
          documentApi.savePackingList(pl).catch(err => console.error('Failed to save packing list:', err));
        }
        setState(prev => ({
          ...prev,
          packingLists: prev.packingLists.some(p => p.id === pl.id)
            ? prev.packingLists.map(p => p.id === pl.id ? pl : p)
            : [pl, ...prev.packingLists]
        }));
      },
      deletePackingList: (id: string) => {
        if (userMode === 'real') {
          documentApi.deletePackingList(id).catch(err => console.error('Failed to delete packing list:', err));
        }
        setState(prev => ({ ...prev, packingLists: prev.packingLists.filter(p => p.id !== id) }));
      },

      saveShippingBill: (sb: ShippingBill) => {
        if (userMode === 'real') {
          documentApi.saveShippingBill(sb).catch(err => console.error('Failed to save shipping bill:', err));
        }
        setState(prev => ({
          ...prev,
          shippingBills: prev.shippingBills.some(s => s.id === sb.id)
            ? prev.shippingBills.map(s => s.id === sb.id ? sb : s)
            : [sb, ...prev.shippingBills]
        }));
      },
      deleteShippingBill: (id: string) => {
        if (userMode === 'real') {
          documentApi.deleteShippingBill(id).catch(err => console.error('Failed to delete shipping bill:', err));
        }
        setState(prev => ({ ...prev, shippingBills: prev.shippingBills.filter(s => s.id !== id) }));
      },

      saveCOO: (coo: CertificateOfOrigin) => {
        if (userMode === 'real') {
          documentApi.saveCOO(coo).catch(err => console.error('Failed to save COO:', err));
        }
        setState(prev => ({
          ...prev,
          coos: prev.coos.some(c => c.id === coo.id)
            ? prev.coos.map(c => c.id === coo.id ? coo : c)
            : [coo, ...prev.coos]
        }));
      },
      deleteCOO: (id: string) => {
        if (userMode === 'real') {
          documentApi.deleteCOO(id).catch(err => console.error('Failed to delete COO:', err));
        }
        setState(prev => ({ ...prev, coos: prev.coos.filter(c => c.id !== id) }));
      },

      getNextDocumentNumber: (prefix: string) => {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `${prefix}/${year}${month}/${random}`;
      },
      isDemoUser,
      isRealUser,
      canManageTeam,
      canCreateShipment,
      hasPermission: checkUserPermission,
      getAnalytics
    }),
    [
      state,
      isDemoUser,
      isRealUser,
      canManageTeam,
      canCreateShipment,
      login,
      signup,
      loginWithDemoAccount,
      loginWithGoogleToken,
      logout,
      switchRole,
      toggleTheme,
      createShipment,
      updateShipment,
      deleteShipment,
      addDocument,
      updateDocumentStatus,
      addComment,
      markNotificationRead,
      createTeam,
      addTeamMember,
      removeTeamMember,
      updateTeamMemberPermission,
      leaveTeam,
      inviteTeamMember,
      updateMemberRole,
      removeLegacyTeamMember,
      updateUserProfile,
      deleteInvite,
      acceptInvite,
      checkUserPermission,
      getAnalytics
    ]
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

export default AppContext;
