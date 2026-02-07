import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PatientHome from './pages/PatientHome';
import DoctorList from './pages/DoctorList';
import SlotBooking from './pages/SlotBooking';
import ConfirmBooking from './pages/ConfirmBooking';
import MyAppointments from './pages/MyAppointments';
import AdminDashboard from './pages/AdminDashboard';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/patient-home" element={<PatientHome />} />
        <Route path="/hospital/:hospitalId/doctors" element={<DoctorList />} />
        <Route path="/book-slot/:doctorId" element={<SlotBooking />} />
        <Route path="/confirm-booking/:slotId" element={<ConfirmBooking />} />
        <Route path="/my-appointments" element={<MyAppointments />} />
        <Route path="/AdminDashboard" element={<AdminDashboard />} />
        {/* Default page Login par rakho */}
        <Route path="/" element={<Navigate to="/register" />} />
      </Routes>
    </Router>
  );
}

export default App;