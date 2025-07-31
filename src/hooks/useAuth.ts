import { useState, useEffect, useCallback } from 'react';
import { AuthContextType, LoginData, JuridicoRegisterData, User } from '../types/auth';
import { authService } from '../services/AuthService';

export const useAuth = (): AuthContextType => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Inicializar estado y verificar sesión
  useEffect(() => {
    const checkUserSession = async () => {
      const savedToken = authService.getCurrentToken();
      if (savedToken) {
        setToken(savedToken);
        localStorage.setItem('token', savedToken);
        // Obtener los datos del usuario
        const userData = await authService.getMe();
        if (userData) {
          setUser(userData);
        } else {
          // Token inválido o sesión expirada
          authService.logout();
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    checkUserSession();
  }, []);

  // Computed property para isAuthenticated
  const isAuthenticated = !!(user && token);

  // Login function
  const login = useCallback(async (data: LoginData) => {
    setIsLoading(true);
    try {
      console.log('🔐 useAuth: Attempting login with:', { email: data.email });
      const response = await authService.login(data);
      console.log('🔐 useAuth: Login response:', response);
      
      if (response.success && response.data) {
        setToken(response.data.token);
        // Después del login, obtener los datos del usuario
        const userData = await authService.getMe();
        if (userData) {
          setUser(userData);
        }
        // Devolver la respuesta original del login
        return { ...response, data: { ...response.data, user: userData! } };
      } else {
        console.log('🔐 useAuth: Login failed:', response.message);
      }
      
      return response;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Register Juridico function
  const registerJuridico = useCallback(async (data: JuridicoRegisterData) => {
    setIsLoading(true);
    try {
      const response = await authService.registerJuridico(data);
      return response;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setToken(null);
  }, []);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    registerJuridico,
    logout,
  };
}; 