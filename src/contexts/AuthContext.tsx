import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { authService } from '../services/AuthService';
import { User, LoginData, JuridicoRegisterData } from '../types/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (data: LoginData) => Promise<any>;
  logout: () => void;
  registerJuridico: (data: JuridicoRegisterData) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  const verifyUser = useCallback(async () => {
    setLoading(true);
    try {
      const currentUser = await authService.getMe();
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        authService.logout(); // Clean up tokens if getMe fails
      }
    } catch (error) {
      console.error('Failed to verify user', error);
      setUser(null);
      setIsAuthenticated(false);
      authService.logout();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only verify user if a token exists, to avoid unnecessary API calls on first visit.
    if (authService.getCurrentToken()) {
      verifyUser();
    } else {
      setLoading(false);
    }
  }, [verifyUser]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'auth_token') {
        verifyUser();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [verifyUser]);

  const login = useCallback(async (data: LoginData) => {
    setLoading(true);
    try {
      const response = await authService.login(data);
      if (response.success && response.data?.user) {
        // Directly update state from the login response to avoid race conditions
        setUser(response.data.user);
        setIsAuthenticated(true);
      } else {
        // Ensure state is cleared on a failed login
        setUser(null);
        setIsAuthenticated(false);
      }
      return response;
    } finally {
      setLoading(false);
    }
  }, []);

  const registerJuridico = useCallback(async (data: JuridicoRegisterData) => {
    setLoading(true);
    try {
      return await authService.registerJuridico(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const value = useMemo(() => ({
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    registerJuridico,
  }), [isAuthenticated, user, loading, login, logout, registerJuridico]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
