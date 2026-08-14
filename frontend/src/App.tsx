import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';

// Pages
import LandingPage from './pages/LandingPage';
import InspectionLogin from './pages/InspectionLogin';
import InstitutionLogin from './pages/InstitutionLogin';
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
import UsersPage from './pages/admin/UsersPage';
import AuditLogsPage from './pages/admin/AuditLogsPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode, allowedRoles?: string[] }> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, hasRole } = useAuth();
  
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (allowedRoles && !hasRole(allowedRoles)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Layout>{children}</Layout>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login/inspection" element={<InspectionLogin />} />
          <Route path="/login/institution" element={<InstitutionLogin />} />

          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/institutions" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'INSPECTION_ADMIN', 'INSPECTION_MEMBER']}><InstitutionsPage /></ProtectedRoute>} />
          <Route path="/institutions/:id" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'INSPECTION_ADMIN', 'INSPECTION_MEMBER', 'INSTITUTION_ADMIN', 'INSTITUTION_STAFF']}><InstitutionDetailPage /></ProtectedRoute>} />
          <Route path="/inspections" element={<ProtectedRoute><InspectionsPage /></ProtectedRoute>} />
          <Route path="/inspections/:id" element={<ProtectedRoute><InspectionDetailPage /></ProtectedRoute>} />
          <Route path="/inspections/:id/documents" element={<ProtectedRoute><DocumentEvidencePage /></ProtectedRoute>} />
          <Route path="/inspections/:id/images" element={<ProtectedRoute><VisualEvidencePage /></ProtectedRoute>} />
          <Route path="/inspections/:id/verify" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'INSPECTION_ADMIN', 'INSPECTION_MEMBER']}><CrossVerificationPage /></ProtectedRoute>} />
          <Route path="/inspections/:id/findings" element={<ProtectedRoute><FindingsPage /></ProtectedRoute>} />
          <Route path="/inspections/:id/report" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'INSPECTION_ADMIN', 'INSPECTION_MEMBER']}><ReportPage /></ProtectedRoute>} />
          <Route path="/evidence" element={<ProtectedRoute><EvidencePage /></ProtectedRoute>} />
          <Route path="/ai-analysis" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'INSPECTION_ADMIN', 'INSPECTION_MEMBER']}><CrossVerificationPage /></ProtectedRoute>} />
          <Route path="/findings" element={<ProtectedRoute><FindingsPage /></ProtectedRoute>} />
          <Route path="/findings/:id" element={<ProtectedRoute><FindingDetailPage /></ProtectedRoute>} />
          <Route path="/regulations" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'INSPECTION_ADMIN', 'INSPECTION_MEMBER']}><RegulationsPage /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'INSPECTION_ADMIN', 'INSPECTION_MEMBER']}><ReportPage /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
          <Route path="/monitoring" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'INSPECTION_ADMIN', 'INSPECTION_MEMBER']}><MonitoringPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

          {/* Admin routes */}
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><UsersPage /></ProtectedRoute>} />
          <Route path="/admin/audit-logs" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><AuditLogsPage /></ProtectedRoute>} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
