import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { createSeedState } from '../data/seedData';
import {
  AnalyticsMetrics,
  AppState,
  CreateShipmentInput,
  DocStatus,
  DocumentType,
  NotificationItem,
  OCRExtraction,
  Role,
  Shipment,
  ShipmentDocument,
  UploadDocumentInput,
  ShipmentStatus,
  InviteTeamMemberInput,
  TeamInvite
} from '../types';
import { decodeJWT } from '../utils/googleAuth';
import { safeStorage } from '../utils/storage';
import { NotificationService } from '../services/NotificationService';

const STORAGE_KEY = 'exportrack-ai-state-v1';

interface AppContextValue {
  state: AppState;
  login: (email: string, password: string) => void;
  signup: (name: string, email: string, password: string) => void;
  // Backwards-compatible alias (some UI may still call this)
  loginWithGoogle: () => void;
  loginWithDemoAccount: () => void;
  loginWithGoogleToken: (token: string) => void;
  logout: () => void;
  switchRole: (role: Role) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleTheme: () => void;
  createShipment: (input: CreateShipmentInput) => Shipment;
  addDocument: (shipmentId: string, input: UploadDocumentInput) => void;
  updateDocumentStatus: (shipmentId: string, documentType: DocumentType, status: DocStatus) => void;
  updateShipmentStatus: (shipmentId: string, status: ShipmentStatus) => void;
  assignDriver: (shipmentId: string, driverInfo: { name: string; phone: string; vehicle: string }) => void;
  addComment: (shipmentId: string, message: string, internal: boolean) => void;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  triggerDelayAlert: (shipmentId: string, daysDelayed: number) => void;
  applyOptimizedRoute: (shipmentId: string) => void;
  getAnalytics: () => AnalyticsMetrics;
  hasPermission: (action: string) => boolean;
  inviteTeamMember: (input: InviteTeamMemberInput) => Promise<void>;
  updateMemberRole: (memberId: string, role: Role) => void;
  deleteInvite: (inviteId: string) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

const createId = (prefix: string): string =>
  `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0')}`;

const loadState = (): AppState => {
  try {
    const raw = safeStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createSeedState();
    }
    return {
      ...JSON.parse(raw),
      invites: (JSON.parse(raw) as AppState).invites ?? []
    } as AppState;
  } catch (error) {
    console.warn('[AppContext] Failed to load state, using seed data:', error);
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

// Refactored deeply nested logic in updateDocumentStatus
const findDocumentIndex = (documents: ShipmentDocument[], documentType: DocumentType): number => {
  return documents.findIndex((doc) => doc.type === documentType);
};

// Ensure processDocuments is defined
const processDocuments = (
  shipment: Shipment,
  newDocument: ShipmentDocument,
  input: UploadDocumentInput,
  shipmentId: string
): Shipment => {
  const withoutPlaceholder = shipment.documents.filter(
    (doc) => !(doc.type === input.type && doc.fileName === 'Not uploaded')
  );
  return {
    ...shipment,
    documents: [newDocument, ...withoutPlaceholder],
    aiScan: [mockExtraction(shipmentId, input.type), ...shipment.aiScan],
  };
};

// Refactored negated condition
const isMatchingShipment = (shipment: Shipment, shipmentId: string): boolean => {
  return shipment.id === shipmentId;
};

export const AppProvider = ({ children }: PropsWithChildren) => {
  const [state, setState] = useState<AppState>(() => {
    const initialState = loadState();

    // Clean up invalid or demo sessions on app load
    if (initialState.isAuthenticated && initialState.user) {
      // Remove demo sessions - force re-login
      if (initialState.user.authProvider === 'demo') {
        console.log('Demo session cleared on app load');
        return {
          ...initialState,
          isAuthenticated: false,
          user: null
        };
      }

      // Validate Google sessions
      if (initialState.user.authProvider === 'google') {
        const token = safeStorage.session.getItem('google_auth_token');
        const userEmail = safeStorage.session.getItem('google_user_email');

        if (!token || !userEmail) {
          console.warn('Invalid Google session detected, logging out');
          return {
            ...initialState,
            isAuthenticated: false,
            user: null
          };
        }
      }
    }

    return initialState;
  });
  // Restore user session on app load if authenticated
  useEffect(() => {
    if (state.isAuthenticated && state.user?.authProvider === 'google') {
      const token = safeStorage.session.getItem('google_auth_token');
      const userEmail = safeStorage.session.getItem('google_user_email');

      // Verify session is still valid
      if (!token || !userEmail) {
        console.warn('Google session expired or invalid, logging out');
        setState(prev => ({
          ...prev,
          isAuthenticated: false,
          user: null
        }));
      }
    }
  }, []);

  useEffect(() => {
    safeStorage.setItem(STORAGE_KEY, JSON.stringify(state));

    // Sync theme with document class
    if (typeof document !== 'undefined') {
      const applyTheme = (t: 'light' | 'dark' | 'system') => {
        let isDark = t === 'dark';
        if (t === 'system') {
          isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        
        if (isDark) {
          document.documentElement.classList.add('dark');
          document.documentElement.style.colorScheme = 'dark';
        } else {
          document.documentElement.classList.remove('dark');
          document.documentElement.style.colorScheme = 'light';
        }
      };

      applyTheme(state.theme);

      // Listener for system theme changes if in system mode
      if (state.theme === 'system') {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => applyTheme('system');
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      }
    }
  }, [state.theme]);

  const toggleTheme = () => {
    setState(prev => {
      let nextTheme: 'light' | 'dark' | 'system' = 'dark';
      if (prev.theme === 'dark') nextTheme = 'light';
      else if (prev.theme === 'light') nextTheme = 'system';
      else nextTheme = 'dark';
      
      return { ...prev, theme: nextTheme };
    });
  };

  const setTheme = (theme: 'light' | 'dark' | 'system') => {
    setState(prev => ({ ...prev, theme }));
  };

  const login = (email: string, password: string) => {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    // Check if known team member
    const knownMember = state.teamMembers.find(
      (member) => member.email.toLowerCase() === email.toLowerCase()
    );

    // Check if known client
    const knownClient = state.clients.find(
      (client) => client.email.toLowerCase() === email.toLowerCase()
    );

    const nameFromEmail = email.split('@')[0].replace(/[._]/g, ' ');
    const displayName = knownMember?.name ?? knownClient?.name ?? nameFromEmail.replace(/\b\w/g, (char) => char.toUpperCase());

    setState((prev) => ({
      ...prev,
      isAuthenticated: true,
      user: {
        name: displayName,
        email,
        role: (knownMember?.role as Role) ?? (knownClient ? 'Customer' : 'Operations'),
        authProvider: 'email'
      }
    }));

    console.log('User logged in with email:', email);
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

    if (!name.trim()) {
      throw new Error('Name is required');
    }

    setState((prev) => ({
      ...prev,
      isAuthenticated: true,
      user: {
        name: name.trim() || 'New User',
        email,
        role: 'Operations',
        authProvider: 'email'
      }
    }));

    console.log('New user registered:', email);
  };

  /**
   * Demo login - creates a demo account session
   * Only use this for demo purposes via demo buttons - NOT real Google OAuth!
   */
  const loginWithDemoAccount = () => {
    // Create demo user session
    const demoUser = {
      name: 'Demo User',
      email: 'demo@exportrack.ai',
      role: 'Admin' as Role
    };

    setState((prev) => ({
      ...prev,
      isAuthenticated: true,
      user: {
        name: demoUser.name,
        email: demoUser.email,
        role: demoUser.role,
        authProvider: 'demo' as any
      }
    }));

    console.warn('⚠️ Demo account loaded for testing - this is NOT real Google OAuth authentication');
  };

  // Backwards-compatible alias for older UI code.
  const loginWithGoogle = () => {
    loginWithDemoAccount();
  };

  const loginWithGoogleToken = (token: string) => {
    try {
      // Decode the JWT token from Google
      const payload = decodeJWT(token);

      if (!payload?.email) {
        throw new Error('Invalid token or missing email');
      }

      // Check if user is in team members (optional - for role assignment)
      const knownMember = state.teamMembers.find(
        (member) => member.email.toLowerCase() === payload.email.toLowerCase()
      );

      // Extract user information from Google token
      const userName = payload.name || payload.given_name || 'Google User';
      const userEmail = payload.email;
      const profilePicture = payload.picture;

      // Create user session with Google data
      setState((prev) => ({
        ...prev,
        isAuthenticated: true,
        user: {
          name: userName,
          email: userEmail,
          role: knownMember?.role ?? prev.user?.role ?? 'Operations',
          authProvider: 'google',
          profilePicture: profilePicture
        }
      }));

      // Store the token for future API calls (if needed)
      safeStorage.session.setItem('google_auth_token', token);
      safeStorage.session.setItem('google_token_expiry', new Date(payload.exp * 1000).toISOString());
      safeStorage.session.setItem('google_user_email', userEmail);

      // Log successful authentication
      console.log('User authenticated with Google:', {
        name: userName,
        email: userEmail,
        hasProfilePicture: !!profilePicture
      });
    } catch (error) {
      console.error('Failed to login with Google token:', error);

      // Clear any partial session data on error
      safeStorage.session.removeItem('google_auth_token');
      safeStorage.session.removeItem('google_token_expiry');
      safeStorage.session.removeItem('google_user_email');

      throw new Error('Google authentication failed. Please try again.');
    }
  };

  const logout = () => {
    // Clear all authentication data
    safeStorage.session.removeItem('google_auth_token');
    safeStorage.session.removeItem('google_token_expiry');
    safeStorage.session.removeItem('google_user_email');

    // Log logout
    console.log('User logged out');

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
          role: state.user?.role ?? 'Operations',
          message: 'Shipment record created. Awaiting first document upload.',
          createdAt: now,
          internal: true
        }
      ]
    };

    const addNotif = (t: any) => {
      setState(current => ({ ...current, notifications: [t, ...current.notifications] }));
    };
    NotificationService.trigger('shipment_created', shipment, addNotif);

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
        if (isMatchingShipment(shipment, shipmentId)) {
          return {
            ...shipment,
            documents: [newDocument, ...shipment.documents]
          };
        }
        return shipment;
      });

      return {
        ...prev,
        shipments,
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
        const documentIndex = findDocumentIndex(nextDocuments, documentType);

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

      return {
        ...prev,
        shipments,
      };
    });
  };

  const updateShipmentStatus = (shipmentId: string, status: ShipmentStatus) => {
    setState((prev) => {
      const shipment = prev.shipments.find(s => s.id === shipmentId);
      if (!shipment) return prev;
      
      const updatedShipment = { ...shipment, status };
      const shipments = prev.shipments.map(s => 
        s.id === shipmentId ? updatedShipment : s
      );

      // Trigger notifications based on new status
      const addNotif = (t: any) => {
        setState(current => ({ ...current, notifications: [t, ...current.notifications] }));
      };
      
      if (status === 'In Transit' && shipment.status !== 'In Transit') {
        NotificationService.trigger('shipment_dispatched', updatedShipment, addNotif);
      } else if (status === 'Delivered' && shipment.status !== 'Delivered') {
        NotificationService.trigger('shipment_delivered', updatedShipment, addNotif);
      }

      return { ...prev, shipments };
    });
  };

  const assignDriver = (shipmentId: string, driverInfo: { name: string; phone: string; vehicle: string }) => {
    setState((prev) => {
      const shipments = prev.shipments.map((s) => {
        if (s.id === shipmentId) {
          return {
            ...s,
            driverName: driverInfo.name,
            driverPhone: driverInfo.phone,
            vehicleNumber: driverInfo.vehicle,
            status: 'Driver Assigned' as ShipmentStatus
          };
        }
        return s;
      });
      return { ...prev, shipments };
    });
  };

  const addComment = (shipmentId: string, message: string, internal: boolean) => {
    if (!state.user) {
      return;
    }

    setState((prev) => {
      const shipments = prev.shipments.map((shipment) => {
        if (shipment.id === shipmentId) {
          return {
            ...shipment,
            comments: [
              {
                id: createId('COM'),
                author: prev.user?.name ?? 'Unknown',
                role: prev.user?.role ?? 'Operations',
                message: message,
                createdAt: new Date().toISOString(),
                internal: internal,
              },
              ...shipment.comments,
            ],
          };
        }
        return shipment;
      });

      return {
        ...prev,
        shipments,
      };
    });
  };

  const markNotificationRead = (notificationId: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((notification) =>
        notification.id === notificationId ? { ...notification, read: true } : notification
      )
    }));
  };

  const markAllNotificationsRead = () => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((notification) => ({ ...notification, read: true }))
    }));
  };

  const triggerDelayAlert = (shipmentId: string, daysDelayed: number) => {
    setState((prev) => {
      // Check if we already have a delay alert for this shipment to avoid spam
      const alreadyHasAlert = prev.notifications.some(
        n => n.shipmentId === shipmentId && n.type === 'Deadline' && !n.read
      );

      if (alreadyHasAlert) return prev;

      const shipment = prev.shipments.find(s => s.id === shipmentId);
      if (!shipment) return prev;

      const updatedShipment = { ...shipment, delayed: true, priority: 'High' as const };
      const updatedShipments = prev.shipments.map(s => 
        s.id === shipmentId ? updatedShipment : s
      );

      const addNotif = (t: any) => {
        setState(current => ({ ...current, notifications: [t, ...current.notifications] }));
      };
      NotificationService.trigger('shipment_delayed', updatedShipment, addNotif);

      const newNotification = buildNotification(
        shipmentId,
        'Deadline', // Changed to Deadline as per NotificationService logic
        'High',
        `Delay Detected: ${shipment.clientName}`,
        `AI Engine predicts a ${daysDelayed}-day delay for Container ${shipment.containerNumber}. Network re-routing advised.`,
        new Date().toISOString()
      );

      return {
        ...prev,
        shipments: updatedShipments,
        notifications: [newNotification, ...prev.notifications]
      };
    });
  };

  const applyOptimizedRoute = (shipmentId: string) => {
    setState((prev) => {
      const shipment = prev.shipments.find((s) => s.id === shipmentId);
      if (!shipment) return prev;

      return {
        ...prev,
        shipments: prev.shipments.map((s) =>
          s.id === shipmentId
            ? {
                ...s,
                status: 'In Transit' as ShipmentStatus,
                comments: [
                  {
                    id: createId('COM'),
                    author: 'AI Route Optimizer',
                    role: 'Admin',
                    message: 'AI Optimized Route applied. Vessel coordinates updated to reflect high-efficiency path.',
                    createdAt: new Date().toISOString(),
                    internal: true,
                  },
                  ...s.comments,
                ],
              }
            : s
        ),
      };
    });
  };
  
  const inviteTeamMember = async (input: InviteTeamMemberInput) => {
    // Check for duplicates
    const existingMember = state.teamMembers.find(m => m.email.toLowerCase() === input.email.toLowerCase());
    const existingInvite = state.invites.find(i => i.email.toLowerCase() === input.email.toLowerCase() && i.status === 'Pending');
    
    if (existingMember) {
      throw new Error('This user is already a member of the workspace.');
    }
    
    if (existingInvite) {
      throw new Error('An active invitation for this email already exists.');
    }
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const inviteId = createId('INV');
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    const newInvite: TeamInvite = {
      id: inviteId,
      name: input.name,
      email: input.email,
      role: input.role,
      workspaceId: input.workspaceId ?? 'default-workspace',
      token,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
    
    setState(prev => ({
      ...prev,
      invites: [newInvite, ...prev.invites]
    }));
    
    // Mock Email Dispatch
    console.log('Sending Invitation Email...', {
      to: newInvite.email,
      name: newInvite.name,
      role: newInvite.role,
      link: `https://exportrack.ai/invite/${newInvite.token}`
    });
    
    // Add internal notification
    const addNotif = (t: any) => {
      setState(current => ({ ...current, notifications: [t, ...current.notifications] }));
    };
    
    const notification = buildNotification(
      'SYSTEM',
      'Deadline',
      'Low',
      'Invitation Sent',
      `Team invitation sent to ${newInvite.name} (${newInvite.email}) as ${newInvite.role}.`,
      new Date().toISOString()
    );
    addNotif(notification);
  };

  const updateMemberRole = (memberId: string, role: Role) => {
    setState(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.map(m => m.id === memberId ? { ...m, role } : m)
    }));
  };

  const deleteInvite = (inviteId: string) => {
    setState(prev => ({
      ...prev,
      invites: prev.invites.filter(i => i.id !== inviteId)
    }));
  };
  
  const value = useMemo<AppContextValue>(
    () => ({
      state,
      login,
      signup,
      loginWithGoogle,
      loginWithDemoAccount,
      loginWithGoogleToken,
      logout,
      switchRole,
      setTheme,
      toggleTheme,
      createShipment,
      addDocument,
      updateDocumentStatus,
      updateShipmentStatus,
      assignDriver,
      addComment,
      markNotificationRead,
      markAllNotificationsRead,
      triggerDelayAlert,
      applyOptimizedRoute,
      getAnalytics: () => {
        const total = state.shipments.length;
        const verifiedDocs = state.shipments.flatMap(s => s.documents).filter(d => d.status === 'Verified').length;
        const totalDocs = state.shipments.flatMap(s => s.documents).length || 1;
        const onTimeRate = Math.round((verifiedDocs / totalDocs) * 100);
        const delayed = state.shipments.filter(s => s.delayed).length;
        
        return {
          totalShipments: total,
          onTimeDeliveryRate: onTimeRate,
          delayedShipments: delayed,
          averageDeliveryTime: 4.8,
          monthlyShipmentTrend: [
            { month: 'Oct', count: 45 },
            { month: 'Nov', count: 52 },
            { month: 'Dec', count: 48 },
            { month: 'Jan', count: 61 },
            { month: 'Feb', count: 55 },
            { month: 'Mar', count: total }
          ],
          carrierPerformance: [
            { carrier: 'Maersk', rating: 4.8, shipments: 24 },
            { carrier: 'MSC', rating: 4.5, shipments: 18 },
            { carrier: 'Hapag-Lloyd', rating: 4.2, shipments: 12 },
            { carrier: 'CMA CGM', rating: 3.9, shipments: 8 }
          ],
          deliveryTimeDistribution: [
            { range: '0-2 days', count: 12 },
            { range: '3-5 days', count: 35 },
            { range: '6-10 days', count: 18 },
            { range: '10+ days', count: 5 }
          ]
        };
      },
      hasPermission: (action: string) => {
        const role = state.user?.role || 'Viewer';
        const permissions: Record<string, Role[]> = {
          'manage_users': ['Admin'],
          'edit_shipments': ['Admin', 'Manager', 'Operations', 'Export Operations Manager'],
          'access_analytics': ['Admin', 'Manager', 'Viewer', 'Export Operations Manager'],
          'create_shipments': ['Admin', 'Manager', 'Operations', 'Export Operations Manager'],
          'update_tracking': ['Admin', 'Manager', 'Operations', 'Export Operations Manager'],
        };
        return permissions[action]?.includes(role) || false;
      },
      inviteTeamMember,
      updateMemberRole,
      deleteInvite
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

