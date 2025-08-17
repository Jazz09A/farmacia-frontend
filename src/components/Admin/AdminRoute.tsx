import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>; // O un spinner más elaborado
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  
  if (!user.is_verified) {
    return <Navigate to="/verify-account" state={{ from: location }} replace />;
  }

  if (user.role !== 'admin' && user.role !== 'super_admin') {
    return <Navigate to="/" replace />; // O a una página de "no autorizado"
  }

  return children;
};

export default AdminRoute; 