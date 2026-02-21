import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import LandingPage        from './pages/LandingPage';
import LoginPage          from './pages/LoginPage';
import RegisterPage       from './pages/RegisterPage';
import PatientDashboard   from './pages/PatientDashboard';
import PredictionPage     from './pages/PredictionPage';
import PredictionResult   from './pages/PredictionResult';
import DoctorSuggestion   from './pages/DoctorSuggestion';
import AppointmentBooking from './pages/AppointmentBooking';
import MyAppointments     from './pages/MyAppointments';
import MyReports          from './pages/MyReports';
import AdminDashboard     from './pages/AdminDashboard';
import DoctorDashboard    from './pages/DoctorDashboard';
import DoctorPredictionPage from './pages/DoctorPredictionPage';

const Guard = ({ children, role }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
};

function Toast() {
  const { dark } = useTheme();
  return <Toaster position="top-right" toastOptions={{ style: { background: dark ? '#0e1e14' : '#fff', color: dark ? '#d8f5e6' : '#0a1f13', border: `1.5px solid ${dark ? '#163224' : '#c0e8d0'}`, borderRadius: '14px', fontFamily: 'Outfit,sans-serif', fontWeight: 600, fontSize: '14px' }, success: { iconTheme: { primary: dark ? '#22c55e' : '#16a34a', secondary: dark ? '#0e1e14' : '#fff' } }, error: { iconTheme: { primary: '#e11d48', secondary: dark ? '#0e1e14' : '#fff' } } }} />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toast />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/doctor-register" element={<Navigate to="/register" />} />
            <Route path="/dashboard"    element={<Guard role="patient"><PatientDashboard /></Guard>} />
            <Route path="/predict"      element={<Guard role="patient"><PredictionPage /></Guard>} />
            <Route path="/prediction-result/:id" element={<Guard role="patient"><PredictionResult /></Guard>} />
            <Route path="/doctors"      element={<Guard role="patient"><DoctorSuggestion /></Guard>} />
            <Route path="/book-appointment/:doctorId" element={<Guard role="patient"><AppointmentBooking /></Guard>} />
            <Route path="/appointments" element={<Guard role="patient"><MyAppointments /></Guard>} />
            <Route path="/reports"      element={<Guard role="patient"><MyReports /></Guard>} />
            <Route path="/doctor-predict" element={<Guard role="doctor"><DoctorPredictionPage /></Guard>} />
            <Route path="/doctor-prediction-result/:id" element={<Guard role="doctor"><PredictionResult /></Guard>} />
            <Route path="/doctor-dashboard" element={<Guard role="doctor"><DoctorDashboard /></Guard>} />
            <Route path="/admin"        element={<Guard role="admin"><AdminDashboard /></Guard>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
