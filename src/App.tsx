import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout';
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

/**
 * Protected layout component that ensures user is authenticated
 * Redirects to auth page if not authenticated
 */
function ProtectedLayout() {
  const {
    state: { isAuthenticated }
  } = useAppContext();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
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
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<SplashPage />} />
      <Route path="/splash" element={<Navigate to="/" replace />} />

      {/* Auth Route - Redirect to dashboard if already authenticated */}
      <Route
        path="/auth"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <AuthPage />}
      />

      {/* Protected Routes */}
      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />

        <Route path="/shipments" element={<SearchFilterPage />} />
        <Route path="/shipments/create" element={<CreateShipmentPage />} />
        <Route path="/shipments/new" element={<Navigate to="/shipments/create" replace />} />
        <Route path="/shipments/:shipmentId" element={<ShipmentDetailsPage />} />
        <Route path="/shipments/:shipmentId/upload" element={<UploadDocumentsPage />} />
        <Route path="/shipments/:shipmentId/ai-scan" element={<AiScanResultsPage />} />
        <Route path="/shipments/:shipmentId/checklist" element={<VerificationChecklistPage />} />

        <Route path="/documents/upload" element={<FirstShipmentRedirect kind="upload" />} />
        <Route path="/ai-extraction" element={<AiDocumentExtractionPage />} />
        <Route path="/ai-validator" element={<AiDocumentValidatorPage />} />
        <Route path="/ai-compliance" element={<AiComplianceCopilotPage />} />
        <Route path="/verification" element={<FirstShipmentRedirect kind="verification" />} />

        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/team" element={<ProfileTeamPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/search" element={<Navigate to="/shipments" replace />} />
      </Route>

      {/* 404 Not Found */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
