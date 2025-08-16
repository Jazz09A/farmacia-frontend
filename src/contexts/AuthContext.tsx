import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { authService } from '../services/AuthService';
import { User } from '../types/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
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

  const login = (token: string, loggedInUser: User) => {
    authService.setToken(token);
    setUser(loggedInUser);
    setIsAuthenticated(true);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout }}>
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
