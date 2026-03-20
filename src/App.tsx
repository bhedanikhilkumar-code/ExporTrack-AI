import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import NotificationPermissionBanner from './components/NotificationPermissionBanner';
import PWAUpdateBanner from './components/PWAUpdateBanner';
import { useAppContext } from './context/AppContext';
import AdminPage from './pages/AdminPage';
import AiScanResultsPage from './pages/AiScanResultsPage';
import AuthPage from './pages/AuthPage';
import CreateShipmentPage from './pages/CreateShipmentPage';
import DashboardPage from './pages/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfileTeamPage from './pages/ProfileTeamPage';
import SearchFilterPage from './pages/SearchFilterPage';
import ShipmentDetailsPage from './pages/ShipmentDetailsPage';
import SplashPage from './pages/SplashPage';
import UploadDocumentsPage from './pages/UploadDocumentsPage';
import VerificationChecklistPage from './pages/VerificationChecklistPage';
import AiDocumentExtractionPage from './pages/AiDocumentExtractionPage';
import AiDocumentValidatorPage from './pages/AiDocumentValidatorPage';
import AiComplianceCopilotPage from './pages/AiComplianceCopilotPage';
import TrackingPage from './pages/TrackingPage';
import PublicTrackingPage from './pages/PublicTrackingPage';
import AnalyticsDashboardPage from './pages/AnalyticsDashboardPage';
import DocumentOcrPage from './pages/DocumentOcrPage';
import TeamWorkspacePage from './pages/TeamWorkspacePage';
import AcceptInvitePage from './pages/AcceptInvitePage';
import RippleEffect from './components/RippleEffect';
import AuditLogPage from './pages/AuditLogPage';
import HsCodeLookupPage from './pages/HsCodeLookupPage';
import LetterOfCreditPage from './pages/LetterOfCreditPage';
import FreightCalculatorPage from './pages/FreightCalculatorPage';
import InvoiceGenerator from './pages/InvoiceGenerator';
import PackingListGenerator from './pages/PackingListGenerator';
import CertificateOfOriginGenerator from './pages/CertificateOfOriginGenerator';
import ShipmentTrackingPage from './pages/ShipmentTrackingPage';
import ShippingBillForm from './pages/ShippingBillForm';

// Client Portal Components
import ClientLayout from './components/ClientLayout';
import ClientLoginPage from './pages/client/ClientLoginPage';
import ClientDashboardPage from './pages/client/ClientDashboardPage';
import ClientShipmentsPage from './pages/client/ClientShipmentsPage';
import ClientShipmentDetailsPage from './pages/client/ClientShipmentDetailsPage';

/**
 * Protected layout component that ensures user is authenticated
 * Redirects to auth page if not authenticated
 */
function ProtectedLayout() {
  const {
    state: { isAuthenticated }
  } = useAppContext();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location.pathname + location.search }} replace />;
  }

  return <AppLayout />;
}

/**
 * Helper component for shipment redirects
 */
function FirstShipmentRedirect({ kind }: { kind: 'upload' | 'verification' }) {
  const {
    state: { shipments }
  } = useAppContext();

  const firstShipmentId = shipments[0]?.id;
  if (!firstShipmentId) return <Navigate to="/shipments/create" replace />;
  return <Navigate to={kind === 'upload' ? `/shipments/${firstShipmentId}/upload` : `/shipments/${firstShipmentId}/checklist`} replace />;
}

export default function App() {
  const {
    state: { isAuthenticated }
  } = useAppContext();

  return (
    <>
      <RippleEffect />
      <PWAUpdateBanner />
      <NotificationPermissionBanner />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<SplashPage />} />
        <Route path="/splash" element={<Navigate to="/" replace />} />
        <Route path="/track/:trackingNumber" element={<PublicTrackingPage />} />
        <Route path="/accept-invite" element={<AcceptInvitePage />} />

        {/* Auth Route - Handled within AuthPage for authenticated state */}
        <Route path="/auth" element={<AuthPage />} />

        {/* Client Portal Routes */}
        <Route path="/client/login" element={<ClientLoginPage />} />
        <Route element={<ClientLayout />}>
          <Route path="/client/dashboard" element={<ClientDashboardPage />} />
          <Route path="/client/shipments" element={<ClientShipmentsPage />} />
          <Route path="/client/shipments/:id" element={<ClientShipmentDetailsPage />} />
        </Route>

        {/* Protected Admin/Staff Routes */}
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route path="/shipments" element={<SearchFilterPage />} />
          <Route path="/shipments/create" element={<CreateShipmentPage />} />
          <Route path="/shipments/new" element={<Navigate to="/shipments/create" replace />} />
          <Route path="/shipments/:shipmentId" element={<ShipmentDetailsPage />} />
          <Route path="/shipments/:shipmentId/upload" element={<UploadDocumentsPage />} />
          <Route path="/shipments/:shipmentId/ai-scan" element={<AiScanResultsPage />} />
          <Route path="/shipments/:shipmentId/checklist" element={<VerificationChecklistPage />} />
          <Route path="/shipments/:shipmentId/tracking" element={<TrackingPage />} />

          <Route path="/documents/upload" element={<FirstShipmentRedirect kind="upload" />} />
          <Route path="/ai-extraction" element={<AiDocumentExtractionPage />} />
          <Route path="/ai-validator" element={<AiDocumentValidatorPage />} />
          <Route path="/ai-compliance" element={<AiComplianceCopilotPage />} />
          <Route path="/verification" element={<FirstShipmentRedirect kind="verification" />} />

          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/team" element={<ProfileTeamPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/analytics" element={<AnalyticsDashboardPage />} />
          <Route path="/document-ocr" element={<DocumentOcrPage />} />
          <Route path="/team-workspace" element={<TeamWorkspacePage />} />
          <Route path="/search" element={<Navigate to="/shipments" replace />} />
          <Route path="/audit-log" element={<AuditLogPage />} />
          <Route path="/hs-codes" element={<HsCodeLookupPage />} />
          <Route path="/letter-of-credit" element={<LetterOfCreditPage />} />
          <Route path="/freight-calculator" element={<FreightCalculatorPage />} />

          {/* Document Generators */}
          <Route path="/invoices/new" element={<InvoiceGenerator />} />
          <Route path="/packing-lists/new" element={<PackingListGenerator />} />
          <Route path="/coo/new" element={<CertificateOfOriginGenerator />} />
          <Route path="/shipping-bills/new" element={<ShippingBillForm />} />
          <Route path="/live-tracking" element={<ShipmentTrackingPage />} />
        </Route>

        {/* 404 Not Found */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
