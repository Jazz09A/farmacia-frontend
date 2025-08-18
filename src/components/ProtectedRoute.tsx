import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from './common/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  fallback?: React.ReactNode;
  requiredRoles?: string[]; // Nuevos roles requeridos
  unauthorizedRedirectTo?: string; // Redirección para usuarios no autorizados por rol
}



export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  redirectTo = '/auth',
  fallback,
  requiredRoles,
  unauthorizedRedirectTo = '/'
}) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return fallback || <LoadingSpinner message="Verificando acceso..." submessage="Un momento por favor" />;
  }

  // Si requiere autenticación pero no está autenticado, redirigir
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Si el usuario está autenticado pero no verificado, redirigir a la página de verificación
  if (isAuthenticated && user && !user.is_verified) {
    return <Navigate to="/verify-account" state={{ from: location }} replace />;
  }

  // Validar roles requeridos si están especificados
  if (isAuthenticated && user && requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.includes(user.role);
    if (!hasRequiredRole) {
      return <Navigate to={unauthorizedRedirectTo} replace />;
    }
  }

  // Si no requiere autenticación pero está autenticado, podría redirigir a home
  if (!requireAuth && isAuthenticated && location.pathname === '/auth') {
    return <Navigate to="/" replace />;
  }

  // Renderizar el contenido protegido
  return <>{children}</>;
};

export default ProtectedRoute; 