import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';

// Auth Pages
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

// Student Pages
import { StudentDashboardPage } from './pages/student/StudentDashboardPage';
import { ExamPortalPage } from './pages/student/ExamPortalPage';
import { ExamResultPage } from './pages/student/ExamResultPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { ExamManagementPage } from './pages/admin/ExamManagementPage';
import { QuestionBuilderPage } from './pages/admin/QuestionBuilderPage';
import { SubmissionsReviewPage } from './pages/admin/SubmissionsReviewPage';
import { FocusLossLogsPage } from './pages/admin/FocusLossLogsPage';

const RootRedirect: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7] dark:bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-transparent border-t-[#0071e3] dark:border-t-[#0a84ff]"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/student'} replace />;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Router>
        <ToastProvider>
          <AuthProvider>
            <div className="min-h-screen flex flex-col bg-[#f5f5f7] dark:bg-black text-[#1d1d1f] dark:text-[#f5f5f7] font-sans antialiased selection:bg-blue-500/20 selection:text-blue-600 transition-colors duration-300">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  {/* Root Route */}
                  <Route path="/" element={<RootRedirect />} />

                  {/* Public Auth Routes */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                  {/* Student Protected Routes */}
                  <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
                    <Route path="/student" element={<StudentDashboardPage />} />
                    <Route path="/student/exams" element={<StudentDashboardPage />} />
                    <Route path="/student/results/:attemptId" element={<ExamResultPage />} />
                  </Route>

                  {/* Exam Portal (Dedicated Restricted Environment) */}
                  <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
                    <Route path="/exam/:attemptId" element={<ExamPortalPage />} />
                  </Route>

                  {/* Admin Protected Routes */}
                  <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                    <Route path="/admin" element={<AdminDashboardPage />} />
                    <Route path="/admin/exams" element={<ExamManagementPage />} />
                    <Route path="/admin/builder" element={<QuestionBuilderPage />} />
                    <Route path="/admin/builder/:id" element={<QuestionBuilderPage />} />
                    <Route path="/admin/submissions" element={<SubmissionsReviewPage />} />
                    <Route path="/admin/logs" element={<FocusLossLogsPage />} />
                  </Route>

                  {/* Catch-all */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
          </AuthProvider>
        </ToastProvider>
      </Router>
    </ThemeProvider>
  );
};

export default App;
