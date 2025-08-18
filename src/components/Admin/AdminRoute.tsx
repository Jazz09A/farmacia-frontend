import React from 'react';
import { ProtectedRoute } from '../ProtectedRoute';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  return (
    <ProtectedRoute
      requireAuth={true}
      requiredRoles={['admin', 'super_admin']}
      redirectTo="/auth"
      unauthorizedRedirectTo="/"
    >
      {children}
    </ProtectedRoute>
  );
};

export default AdminRoute; 