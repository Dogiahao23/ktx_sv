import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Support from './pages/Support';
import Login from './pages/Login';
import Register from './pages/Register';
import Rooms from './pages/Rooms';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import StudentPayments from './pages/StudentPayments';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/support" element={<Support />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={
        <ProtectedRoute>
          <Register />
        </ProtectedRoute>
      } />
      <Route path="/rooms" element={<Rooms />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/manager" element={
        <ProtectedRoute>
          <ManagerDashboard />
        </ProtectedRoute>
      } />
      <Route path="/payments" element={
        <ProtectedRoute>
          <StudentPayments />
        </ProtectedRoute>
      } />
    </Routes>
  );
}
