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

function ProtectedLayout() {
  const {
    state: { isAuthenticated }
  } = useAppContext();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <AppLayout />;
}

export default function App() {
  const {
    state: { isAuthenticated }
  } = useAppContext();

  return (
    <Routes>
      <Route path="/" element={<SplashPage />} />
      <Route path="/splash" element={<Navigate to="/" replace />} />
      <Route path="/auth" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <AuthPage />} />

      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/shipments/new" element={<CreateShipmentPage />} />
        <Route path="/shipments/:shipmentId" element={<ShipmentDetailsPage />} />
        <Route path="/shipments/:shipmentId/upload" element={<UploadDocumentsPage />} />
        <Route path="/shipments/:shipmentId/ai-scan" element={<AiScanResultsPage />} />
        <Route path="/shipments/:shipmentId/checklist" element={<VerificationChecklistPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/search" element={<SearchFilterPage />} />
        <Route path="/team" element={<ProfileTeamPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

