import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

import DriverLogin from './pages/DriverLogin';
import DriverConsole from './pages/DriverConsole';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import LiveTracking from './pages/LiveTracking';
import TripPlayback from './pages/TripPlayback';
import BusManagement from './pages/BusManagement';
import DriverManagement from './pages/DriverManagement';
import RouteManagement from './pages/RouteManagement';
import Reports from './pages/Reports';
import SystemSettings from './pages/SystemSettings';

// Protected Route wrappers
const ProtectedAdmin = ({ children }) => {
  const { admin } = useAuth();
  if (!admin) return <Navigate to="/admin" replace />;
  return children;
};

const ProtectedDriver = ({ children }) => {
  const { driver } = useAuth();
  if (!driver) return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <BrowserRouter>
        <Routes>
          {/* Driver Routes */}
          <Route path="/" element={<DriverLogin />} />
          <Route path="/driver" element={
            <ProtectedDriver>
              <DriverConsole />
            </ProtectedDriver>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={
            <ProtectedAdmin>
              <AdminDashboard />
            </ProtectedAdmin>
          } />
          <Route path="/admin/tracking" element={
            <ProtectedAdmin>
              <LiveTracking />
            </ProtectedAdmin>
          } />
          <Route path="/admin/playback" element={
            <ProtectedAdmin>
              <TripPlayback />
            </ProtectedAdmin>
          } />
          <Route path="/admin/buses" element={
            <ProtectedAdmin>
              <BusManagement />
            </ProtectedAdmin>
          } />
          <Route path="/admin/drivers" element={
            <ProtectedAdmin>
              <DriverManagement />
            </ProtectedAdmin>
          } />
          <Route path="/admin/routes" element={
            <ProtectedAdmin>
              <RouteManagement />
            </ProtectedAdmin>
          } />
          <Route path="/admin/reports" element={
            <ProtectedAdmin>
              <Reports />
            </ProtectedAdmin>
          } />
          <Route path="/admin/settings" element={
            <ProtectedAdmin>
              <SystemSettings />
            </ProtectedAdmin>
          } />

          {/* Catch-all fallback redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
