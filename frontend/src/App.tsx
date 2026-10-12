import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { ProfilePage } from './pages/ProfilePage';
import { DashboardPage } from './pages/DashboardPage';
import { RunsListPage } from './pages/RunsListPage';
import { RunImportPage } from './pages/RunImportPage';
import { RunDetailPage } from './pages/RunDetailPage';
import { EvidencePage } from './pages/EvidencePage';
import { DiagnosisPage } from './pages/DiagnosisPage';
import { GroupsPage } from './pages/GroupsPage';
import { ReviewQueuePage } from './pages/ReviewQueuePage';
import { ExportDraftPage } from './pages/ExportDraftPage';
import { SettingsPage } from './pages/SettingsPage';
import { HomePage } from './pages/HomePage';
import { PlatformDashboardPage } from './pages/PlatformDashboardPage';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
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
                  <EvidencePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/diagnoses/:diagnosisId"
              element={
                <ProtectedRoute>
                  <DiagnosisPage />
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
            <Route
              path="/platform"
              element={
                <ProtectedRoute>
                  <PlatformDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<HomePage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
