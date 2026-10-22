import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { OwnerAuthProvider } from './context/OwnerAuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { OwnerProtectedRoute } from './components/auth/OwnerProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { ProfilePage } from './pages/ProfilePage';
import { DashboardPage } from './pages/DashboardPage';
import { RunsListPage } from './pages/RunsListPage';
import { RunImportPage } from './pages/RunImportPage';
import { RunDetailPage } from './pages/RunDetailPage';
import { CaseFilePage } from './pages/CaseFilePage';
import { DiagnosisRedirectPage } from './pages/DiagnosisRedirectPage';
import { GroupsPage } from './pages/GroupsPage';
import { ReviewQueuePage } from './pages/ReviewQueuePage';
import { ExportDraftPage } from './pages/ExportDraftPage';
import { SettingsPage } from './pages/SettingsPage';
import { HomePage } from './pages/HomePage';
import { CompanyPage } from './pages/CompanyPage';
import { ContactPage } from './pages/ContactPage';
import { PricingPage } from './pages/PricingPage';
import { SecurityPage } from './pages/SecurityPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';
import { AcceptTermsPage } from './pages/AcceptTermsPage';
import { DemoPage } from './pages/DemoPage';
import { HelpCenterPage } from './pages/HelpCenterPage';
import { HelpArticlePage } from './pages/HelpArticlePage';
import { OwnerLoginPage } from './pages/owner/OwnerLoginPage';
import { OwnerDashboardPage } from './pages/owner/OwnerDashboardPage';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
      <OwnerAuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/runs"
              element={
                <ProtectedRoute>
                  <RunsListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/runs/new"
              element={
                <ProtectedRoute>
                  <RunImportPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/runs/:runId"
              element={
                <ProtectedRoute>
                  <RunDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/runs/:runId/tests/:testCaseId"
              element={
                <ProtectedRoute>
                  <CaseFilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/diagnoses/:diagnosisId"
              element={
                <ProtectedRoute>
                  <DiagnosisRedirectPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/groups"
              element={
                <ProtectedRoute>
                  <GroupsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/review-queue"
              element={
                <ProtectedRoute>
                  <ReviewQueuePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/exports/new"
              element={
                <ProtectedRoute>
                  <ExportDraftPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route path="/owner/login" element={<OwnerLoginPage />} />
            <Route
              path="/owner"
              element={
                <OwnerProtectedRoute>
                  <OwnerDashboardPage />
                </OwnerProtectedRoute>
              }
            />
            <Route path="/" element={<HomePage />} />
            <Route path="/company" element={<CompanyPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/security" element={<SecurityPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/accept-terms" element={<AcceptTermsPage />} />
            <Route path="/demo" element={<DemoPage />} />
            <Route path="/help" element={<HelpCenterPage />} />
            <Route path="/help/:slug" element={<HelpArticlePage />} />
          </Routes>
        </BrowserRouter>
      </OwnerAuthProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
