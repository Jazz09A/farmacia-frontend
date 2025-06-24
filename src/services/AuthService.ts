import React from 'react';

// Interfaces base comunes
export interface UserCommonBase {
  email: string;
  phone: string;
  preferred_currency: 'VES' | 'USD';
}

// Usuario Natural
export interface UserNaturalBase extends UserCommonBase {
  user_type: 'natural';
  first_name: string;
  last_name: string;
  cedula: string;
  birth_date?: string; // ISO date string
  address?: string;
}

export interface UserNaturalCreate extends UserNaturalBase {
  password: string;
}

export interface UserNaturalResponse extends UserNaturalBase {
  id: string;
  is_active: boolean;
  is_verified: boolean;
  role: string;
  created_at: string;
  last_login?: string;
}

// Usuario Jurídico
export interface UserJuridicoBase extends UserCommonBase {
  user_type: 'juridico';
  company_name: string;
  rif: string;
  registro_mercantil: string;
  
  // Representantes legales
  representante_legal_cedula: string;
  representante_legal_nombre: string;
  representantes_adicionales?: string[];
  
  // Referencias comerciales y bancarias
  referencia_comercial_proveedor: string;
  referencia_bancaria: string;
  
  // Contactos especializados
  dueno_telefono?: string;
  dueno_email?: string;
  dueno_cumpleanos?: string; // ISO date string
  
  encargado_compra_telefono?: string;
  encargado_compra_email?: string;
  encargado_compra_cumpleanos?: string;
  
  encargado_cobranza_telefono?: string;
  encargado_cobranza_email?: string;
  encargado_cobranza_cumpleanos?: string;
  
  // Información adicional
  redes_sociales?: string;
  pagina_web?: string;
  codigo_sicm?: string;
  fotos_establecimiento?: string[];
  direccion_establecimiento: string;
}

export interface UserJuridicoCreate extends UserJuridicoBase {
  password: string;
}

export interface UserJuridicoResponse extends UserJuridicoBase {
  id: string;
  is_active: boolean;
  is_verified: boolean;
  role: string;
  created_at: string;
  last_login?: string;
}

// Tipos unificados
export type User = UserNaturalResponse | UserJuridicoResponse;
export type RegisterRequest = UserNaturalCreate | UserJuridicoCreate;

// Interfaces para login (mantener simple)
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
  message?: string;
}

export interface RegisterResponse {
  message: string;
  user_id: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
}

export interface AuthError {
  detail: string;
  field?: string;
  code?: string;
}

// Validaciones del frontend
export const validatePassword = (password: string): string[] => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('La contraseña debe tener al menos una mayúscula');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('La contraseña debe tener al menos una minúscula');
  }
  if (!/\d/.test(password)) {
    errors.push('La contraseña debe tener al menos un número');
  }
  
  return errors;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateRIF = (rif: string): boolean => {
  // Formato: J-12345678-9 o V-12345678-9
  const rifRegex = /^[JVEG]-\d{8}-\d$/;
  return rifRegex.test(rif);
};

export const validateCedula = (cedula: string): boolean => {
  // Formato: V-12345678 o E-12345678
  const cedulaRegex = /^[VE]-?\d{7,8}$/;
  return cedulaRegex.test(cedula);
};

import { config, debugLog, debugError } from '../config';

// Clase principal del servicio de autenticación
export class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;

  // Singleton pattern
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Realizar login de usuario
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await this.makeRequest<LoginResponse>('/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      // Guardar tokens en localStorage
      this.setTokens(response.access_token, response.refresh_token);
      
      // Guardar información del usuario
      this.currentUser = response.user;
      this.setUserData(response.user);

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Registrar nuevo usuario
   */
  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await this.makeRequest<RegisterResponse>('/v1/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Refrescar token de acceso
   */
  async refreshToken(): Promise<RefreshTokenResponse> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await this.makeRequest<RefreshTokenResponse>('/v1/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      this.setTokens(response.access_token, response.refresh_token);
      return response;
    } catch (error) {
      // Si el refresh token también falló, hacer logout
      this.logout();
      throw this.handleError(error);
    }
  }

  /**
   * Logout del usuario
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = this.getRefreshToken();
      
      if (refreshToken) {
        // Invalidar token en el backend
        await this.makeRequest('/v1/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
      }
    } catch (error) {
      console.warn('Error during logout:', error);
    } finally {
      // Limpiar datos locales independientemente del resultado
      this.clearAuthData();
    }
  }

  /**
   * Obtener información del usuario actual
   */
  async getCurrentUser(): Promise<User> {
    if (this.currentUser) {
      return this.currentUser;
    }

    try {
      const response = await this.makeRequest<{ user: User }>('/v1/auth/me');
      this.currentUser = response.user;
      this.setUserData(response.user);
      return response.user;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    try {
      // Verificar si el token no ha expirado
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      return payload.exp > now;
    } catch {
      return false;
    }
  }

  /**
   * Solicitar restablecimiento de contraseña
   */
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    try {
      const response = await this.makeRequest<{ message: string }>('/v1/auth/password-reset', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Confirmar restablecimiento de contraseña
   */
  async confirmPasswordReset(token: string, newPassword: string): Promise<{ message: string }> {
    try {
      const response = await this.makeRequest<{ message: string }>('/v1/auth/password-reset/confirm', {
        method: 'POST',
        body: JSON.stringify({ token, new_password: newPassword }),
      });

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Cambiar contraseña del usuario autenticado
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    try {
      const response = await this.makeRequest<{ message: string }>('/v1/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ 
          current_password: currentPassword, 
          new_password: newPassword 
        }),
      });

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Métodos de gestión de tokens

  /**
   * Guardar tokens en localStorage
   */
  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('token_timestamp', Date.now().toString());
  }

  /**
   * Obtener token de acceso
   */
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Obtener token de refresh
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  /**
   * Guardar datos del usuario
   */
  setUserData(user: User): void {
    localStorage.setItem('user_data', JSON.stringify(user));
  }

  /**
   * Obtener datos del usuario desde localStorage
   */
  getUserData(): User | null {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Limpiar todos los datos de autenticación
   */
  clearAuthData(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('token_timestamp');
    this.currentUser = null;
  }

  /**
   * Obtener headers de autorización
   */
  getAuthHeaders(): Record<string, string> {
    const token = this.getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Métodos privados

  /**
   * Realizar petición HTTP con manejo de errores y retry
   */
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${config.api.baseUrl}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...this.getAuthHeaders(),
    };

    const requestConfig: RequestInit = {
      headers: { ...defaultHeaders, ...options.headers },
      ...options,
    };

    let lastError: Error;

    // Retry logic
    for (let attempt = 1; attempt <= config.api.retryAttempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), config.api.timeout);

        const response = await fetch(url, {
          ...requestConfig,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Si el token expiró, intentar renovarlo
        if (response.status === 401 && endpoint !== '/v1/auth/refresh' && endpoint !== '/v1/auth/login') {  
          try {
            await this.refreshToken();
            // Reintentar la petición original con el nuevo token
            return this.makeRequest<T>(endpoint, options);
          } catch (refreshError) {
            throw new Error('Session expired. Please login again.');
          }
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
          throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        // No reintentar en ciertos errores
        if (error instanceof Error && (
          error.name === 'AbortError' ||
          error.message.includes('401') ||
          error.message.includes('403') ||
          error.message.includes('404')
        )) {
          break;
        }

        // Esperar antes del siguiente intento
        if (attempt < config.api.retryAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    throw lastError!;
  }

  /**
   * Manejar errores de autenticación
   */
  private handleError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }

    if (typeof error === 'object' && error !== null && 'detail' in error) {
      return new Error((error as AuthError).detail);
    }

    return new Error('An unexpected error occurred');
  }
}

// Instancia singleton para uso global
export const authService = AuthService.getInstance();

// Hook personalizado para React
export const useAuth = () => {
  const [user, setUser] = React.useState<User | null>(authService.getUserData());
  const [isAuthenticated, setIsAuthenticated] = React.useState(authService.isAuthenticated());

  React.useEffect(() => {
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated();
      const userData = authService.getUserData();
      
      setIsAuthenticated(authenticated);
      setUser(userData);
    };

    // Verificar autenticación al montar
    checkAuth();

    // Verificar cada minuto si el token sigue válido
    const interval = setInterval(checkAuth, 60000);

    return () => clearInterval(interval);
  }, []);

  const login = async (credentials: LoginRequest) => {
    const response = await authService.login(credentials);
    setUser(response.user);
    setIsAuthenticated(true);
    return response;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    user,
    isAuthenticated,
    login,
    logout,
    register: authService.register.bind(authService),
    getCurrentUser: authService.getCurrentUser.bind(authService),
    changePassword: authService.changePassword.bind(authService),
    requestPasswordReset: authService.requestPasswordReset.bind(authService),
  };
}; 