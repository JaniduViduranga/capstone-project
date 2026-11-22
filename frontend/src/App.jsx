import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProfileProvider } from './context/ProfileContext';
import { ProtectedRoute, PublicOnlyRoute } from './routes/ProtectedRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Layouts
import StudentLayout from './layouts/StudentLayout';
import AdminLayout from './layouts/AdminLayout';
import VerifierLayout from './layouts/VerifierLayout';

// Student Pages
import Dashboard from './pages/student/Dashboard';
import Home from './pages/student/Home';
import AvailableExams from './pages/student/AvailableExams';
import MyExamsTab from './pages/student/MyExamsTab';
import ActivityPage from './pages/student/ActivityPage';
import VerificationPage from './pages/student/VerificationPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersPage from './pages/admin/UsersPage';
import VerifiersPage from './pages/admin/VerifiersPage';
import AuditPage from './pages/admin/AuditPage';
import ExamManagementPage from './pages/admin/ExamManagementPage';
import BlockchainPage from './pages/admin/BlockchainPage';
import SettingsPage from './pages/admin/SettingsPage';
import ProfilePage from './pages/admin/ProfilePage';

// Verifier Pages
import PendingQueue from './pages/verifier/PendingQueue';
import MyHistory from './pages/verifier/MyHistory';
import SystemAlerts from './pages/verifier/SystemAlerts';
import Feedback from './pages/verifier/Feedback';
import MyProfile from './pages/verifier/MyProfile';

function App() {
  return (
    <AuthProvider>
      <ProfileProvider>
        <Router>
          <Routes>
            {/* Root & Public Auth */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <Login />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicOnlyRoute>
                  <Register />
                </PublicOnlyRoute>
              }
            />

            {/* Student Portal (Role: student) */}
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="home" element={<Home />} />
              <Route path="available" element={<AvailableExams />} />
              <Route path="my-exams" element={<MyExamsTab />} />
              <Route path="activity" element={<ActivityPage />} />
              <Route path="verification" element={<VerificationPage />} />
            </Route>

            {/* Backward-compatible top-level Student routes */}
            <Route
              path="/home"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/verification"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <VerificationPage />
                </ProtectedRoute>
              }
            />

            {/* Verifier Portal (Role: verifier) */}
            <Route
              path="/verifier"
              element={
                <ProtectedRoute allowedRoles={['verifier']}>
                  <VerifierLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="queue" replace />} />
              <Route path="queue" element={<PendingQueue />} />
              <Route path="history" element={<MyHistory />} />
              <Route path="alerts" element={<SystemAlerts />} />
              <Route path="feedback" element={<Feedback />} />
              <Route path="profile" element={<MyProfile />} />
            </Route>

            {/* Admin Portal (Role: admin) */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="verifiers" element={<VerifiersPage />} />
              <Route path="audit" element={<AuditPage />} />
              <Route path="exams" element={<ExamManagementPage />} />
              <Route path="blockchain" element={<BlockchainPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </ProfileProvider>
    </AuthProvider>
  );
}

export default App;

