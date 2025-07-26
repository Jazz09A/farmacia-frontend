import { useState, useEffect, useCallback } from 'react';
import { AuthContextType, LoginData, JuridicoRegisterData, NaturalRegisterData, User } from '../types/auth';
import { authService } from '../services/AuthService';

export const useAuth = (): AuthContextType => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Inicializar estado desde localStorage
  useEffect(() => {
    const savedUser = authService.getCurrentUser();
    const savedToken = authService.getCurrentToken();
    
    setUser(savedUser);
    setToken(savedToken);
    setIsLoading(false);
  }, []);

  // Computed property para isAuthenticated
  const isAuthenticated = !!(user && token);

  // Login function
  const login = useCallback(async (data: LoginData) => {
    setIsLoading(true);
    try {
      const response = await authService.login(data);
      
      if (response.success && response.data) {
        setUser(response.data.user);
        setToken(response.data.token);
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

  // Register Natural function
  const registerNatural = useCallback(async (data: NaturalRegisterData) => {
    setIsLoading(true);
    try {
      const response = await authService.registerNatural(data);
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
    registerNatural,
    logout,
  };
}; 