import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  fallback?: React.ReactNode;
  requiredRoles?: string[]; // Nuevos roles requeridos
  unauthorizedRedirectTo?: string; // Redirección para usuarios no autorizados por rol
}

const LoadingSpinner: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-medical">
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <div className="w-16 h-16 bg-medical-blue-gradient rounded-full flex items-center justify-center mx-auto mb-4">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
      <h2 className="text-xl font-semibold text-medical-gray-800 mb-2">Verificando acceso...</h2>
      <p className="text-medical-gray-600">Un momento por favor</p>
    </motion.div>
  </div>
);

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
    return fallback || <LoadingSpinner />;
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