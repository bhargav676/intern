import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Signup from './components/Signup';
import Login from './components/Login';
import Layout from './components/Layout';
import DashboardHomePage from './components/DashboardHomePage';
import Alerts from './components/Alerts';
import AdminDashboard from './components/AdminDashboard';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to='/login' />;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (requireAdmin && payload.role !== 'admin') return <Navigate to='/login' />;
    if (!requireAdmin && payload.role !== 'user') return <Navigate to='/login' />;
    return children;
  } catch (err) {
    localStorage.removeItem('token');
    localStorage.removeItem('accessId');
    return <Navigate to='/login' />;
  }
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/admin' element={<ProtectedRoute requireAdmin={true}><AdminDashboard /></ProtectedRoute>} />
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path='/dashboard' element={<DashboardHomePage />} />
          <Route path='/dashboard/alerts' element={<Alerts />} />
          <Route path='/' element={<Navigate to='/dashboard' replace />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;