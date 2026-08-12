import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import InstitutionsPage from './pages/InstitutionsPage';
import InstitutionDetailPage from './pages/InstitutionDetailPage';
import InspectionsPage from './pages/InspectionsPage';
import InspectionDetailPage from './pages/InspectionDetailPage';
import DocumentEvidencePage from './pages/DocumentEvidencePage';
import VisualEvidencePage from './pages/VisualEvidencePage';
import CrossVerificationPage from './pages/CrossVerificationPage';
import FindingsPage from './pages/FindingsPage';
import FindingDetailPage from './pages/FindingDetailPage';
import RegulationsPage from './pages/RegulationsPage';
import ReportPage from './pages/ReportPage';
import HistoryPage from './pages/HistoryPage';
import MonitoringPage from './pages/MonitoringPage';
import EvidencePage from './pages/EvidencePage';
import SettingsPage from './pages/SettingsPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/institutions" element={<ProtectedRoute><InstitutionsPage /></ProtectedRoute>} />
          <Route path="/institutions/:id" element={<ProtectedRoute><InstitutionDetailPage /></ProtectedRoute>} />
          <Route path="/inspections" element={<ProtectedRoute><InspectionsPage /></ProtectedRoute>} />
          <Route path="/inspections/:id" element={<ProtectedRoute><InspectionDetailPage /></ProtectedRoute>} />
          <Route path="/inspections/:id/documents" element={<ProtectedRoute><DocumentEvidencePage /></ProtectedRoute>} />
          <Route path="/inspections/:id/images" element={<ProtectedRoute><VisualEvidencePage /></ProtectedRoute>} />
          <Route path="/inspections/:id/verify" element={<ProtectedRoute><CrossVerificationPage /></ProtectedRoute>} />
          <Route path="/inspections/:id/findings" element={<ProtectedRoute><FindingsPage /></ProtectedRoute>} />
          <Route path="/inspections/:id/report" element={<ProtectedRoute><ReportPage /></ProtectedRoute>} />
          <Route path="/evidence" element={<ProtectedRoute><EvidencePage /></ProtectedRoute>} />
          <Route path="/ai-analysis" element={<ProtectedRoute><CrossVerificationPage /></ProtectedRoute>} />
          <Route path="/findings" element={<ProtectedRoute><FindingsPage /></ProtectedRoute>} />
          <Route path="/findings/:id" element={<ProtectedRoute><FindingDetailPage /></ProtectedRoute>} />
          <Route path="/regulations" element={<ProtectedRoute><RegulationsPage /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><ReportPage /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
          <Route path="/monitoring" element={<ProtectedRoute><MonitoringPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
