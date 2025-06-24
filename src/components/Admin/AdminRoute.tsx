import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// En una aplicación real, obtendrías esto del estado de autenticación (ej. useAuth hook)
const useAuth = () => {
  // SIMULACIÓN: Cambia `isAdmin` a `false` para probar el redireccionamiento.
  return {
    isAuthenticated: true, 
    isAdmin: true,
  };
};

const AdminRoute: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) {
    // Si no está autenticado, redirige a la página de login
    return <Navigate to="/auth" />;
  }

  if (!isAdmin) {
    // Si no es admin, redirige a la página de inicio o una página de "acceso denegado"
    return <Navigate to="/" />;
  }

  // Si es un admin autenticado, muestra el contenido de la ruta anidada
  return <Outlet />;
};

export default AdminRoute; 