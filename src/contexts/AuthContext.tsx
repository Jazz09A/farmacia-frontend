/* @refresh reset */
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/AuthService';
import { useAuthUserQuery } from '../hooks/queries/useAuthQueries';
import { queryKeys } from '../hooks/queries/queryKeys';
import { User, LoginData, JuridicoRegisterData } from '../types/auth';
import SecurityManager from '../utils/securityUtils';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (data: LoginData) => Promise<any>;
  logout: () => void;
  registerJuridico: (data: JuridicoRegisterData) => Promise<any>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(() => authService.getCurrentToken());
  const [actionsLoading, setActionsLoading] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    const tokenFromStorage = authService.getCurrentToken();
    if (tokenFromStorage) {
      const isSessionValid = SecurityManager.verifySessionIntegrity();
      if (!isSessionValid) {
        console.warn('🚨 Session integrity compromised - forcing logout');
        authService.logout();
        setToken(null);
      }
    }
    setSessionChecked(true);
  }, []);

  const shouldFetchUser = Boolean(token);
  const {
    data: userData,
    isLoading: userLoading,
    isFetching: userFetching,
  } = useAuthUserQuery(shouldFetchUser);

  const loading = !sessionChecked || actionsLoading || (shouldFetchUser && (userLoading || userFetching));
  const user = (userData as User | null) ?? null;
  const isAuthenticated = Boolean(user);

  const handleStorageChange = useCallback((event: StorageEvent) => {
    if (event.key === 'auth_token') {
      const currentToken = authService.getCurrentToken();
      setToken(currentToken);
      if (!currentToken) {
        queryClient.removeQueries({ queryKey: queryKeys.auth.user });
      } else {
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.user });
      }
    }
  }, [queryClient]);

  useEffect(() => {
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [handleStorageChange]);

  useEffect(() => {
    if (!token) {
      queryClient.removeQueries({ queryKey: queryKeys.auth.user });
    }
  }, [token, queryClient]);

  const login = useCallback(async (data: LoginData) => {
    setActionsLoading(true);
    try {
      const response = await authService.login(data);
      if (response.success && response.data?.user) {
        queryClient.setQueryData(queryKeys.auth.user, response.data.user);
        setToken(authService.getCurrentToken());
      } else {
        queryClient.setQueryData(queryKeys.auth.user, null);
        setToken(null);
      }
      return response;
    } finally {
      setActionsLoading(false);
    }
  }, [queryClient]);

  const registerJuridico = useCallback(async (data: JuridicoRegisterData) => {
    setActionsLoading(true);
    try {
      return await authService.registerJuridico(data);
    } finally {
      setActionsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    const currentUserId = user?.id;

    if (currentUserId) {
      SecurityManager.cleanUserSpecificData(currentUserId);
    }

    authService.logout();
    setToken(null);
    queryClient.removeQueries({ queryKey: queryKeys.auth.user });

    window.dispatchEvent(new CustomEvent('userLogout', {
      detail: { userId: currentUserId }
    }));

    const currentPath = window.location.pathname;
    const sensitivePages = ['/admin', '/profile', '/checkout', '/orders'];

    if (sensitivePages.some(page => currentPath.startsWith(page))) {
      window.location.href = '/';
    }
  }, [queryClient, user?.id]);

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
