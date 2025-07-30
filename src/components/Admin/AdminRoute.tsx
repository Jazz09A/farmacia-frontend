import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const AdminRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Cargando...</div>; // O un spinner de carga
  }

  if (!isAuthenticated || !user) {
    // Si no está autenticado, redirigir a la página de login
    return <Navigate to="/auth" replace />;
  }

  if (user.role !== 'admin' && user.role !== 'super_admin') {
    // Si no tiene el rol adecuado, redirigir a su perfil o a una página de "no autorizado"
    return <Navigate to="/profile" replace />;
  }

  // Si está autenticado y tiene el rol correcto, renderizar el contenido
  return children ? <>{children}</> : <Outlet />;
};

export default AdminRoute; 