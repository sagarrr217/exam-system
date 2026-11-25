import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { RoleGatewayProvider } from './context/RoleGatewayContext';
import { Navbar } from './components/Navbar';
import { AdminShell } from './components/AdminShell';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { StudentDashboardPage } from './pages/student/StudentDashboardPage';
import { ExamPortalPage } from './pages/student/ExamPortalPage';
import { ExamResultPage } from './pages/student/ExamResultPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { ExamManagementPage } from './pages/admin/ExamManagementPage';
import { QuestionBuilderPage } from './pages/admin/QuestionBuilderPage';
import { SubmissionsReviewPage } from './pages/admin/SubmissionsReviewPage';
import { FocusLossLogsPage } from './pages/admin/FocusLossLogsPage';

const AdminShellLayout: React.FC = () => (
  <AdminShell>
    <Outlet />
  </AdminShell>
);

export function App() {
  return (
    <ThemeProvider>
      <Router>
        <ToastProvider>
          <AuthProvider>
            <RoleGatewayProvider>
              <div className="min-h-screen flex flex-col bg-[var(--bg-canvas)] text-[var(--text-primary)] font-sans antialiased">
                <Navbar />
                <div className="flex-1">
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/get-started" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    {/* Student Protected Routes */}
                    <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
                      <Route path="/student" element={<StudentDashboardPage />} />
                      <Route path="/student/exams" element={<StudentDashboardPage />} />
                      <Route path="/student/results/:attemptId" element={<ExamResultPage />} />
                    </Route>

                    {/* Dedicated Restricted Exam Environment */}
                    <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
                      <Route path="/exam/:attemptId" element={<ExamPortalPage />} />
                    </Route>

                    {/* Admin Protected Routes inside Dedicated Sidebar Shell */}
                    <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                      <Route element={<AdminShellLayout />}>
                        <Route path="/admin" element={<AdminDashboardPage />} />
                        <Route path="/admin/exams" element={<ExamManagementPage />} />
                        <Route path="/admin/builder" element={<QuestionBuilderPage />} />
                        <Route path="/admin/builder/:id" element={<QuestionBuilderPage />} />
                        <Route path="/admin/submissions" element={<SubmissionsReviewPage />} />
                        <Route path="/admin/logs" element={<FocusLossLogsPage />} />
                      </Route>
                    </Route>

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </div>
              </div>
            </RoleGatewayProvider>
          </AuthProvider>
        </ToastProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
