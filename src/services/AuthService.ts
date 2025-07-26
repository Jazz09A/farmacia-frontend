import { 
  LoginData, 
  JuridicoRegisterData, 
  AuthResponse, 
  User 
} from '../types/auth';

class AuthService {
  private baseUrl = '/api/v1/auth';
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';

  // Registro de usuario jurídico
  async registerJuridico(data: JuridicoRegisterData): Promise<AuthResponse> {
    try {
      console.log('Registering juridico user:', data);
      
      const response = await fetch(`${this.baseUrl}/register/juridico`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          message: result.message || 'Error en el registro',
          errors: result.errors || {}
        };
      }

      return {
        success: true,
        message: result.message || 'Registro exitoso',
        data: result.data
      };
    } catch (error) {
      console.error('Error registering juridico user:', error);
      return {
        success: false,
        message: 'Error de conexión. Por favor, intenta nuevamente.',
        errors: {}
      };
    }
  }

  // Login
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      
      const response = await fetch(`${this.baseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          message: result.message || 'Credenciales inválidas',
          errors: result.errors || {}
        };
      }
      if (result.access_token) {
        this.setToken(result.access_token);
        const userData: User = {
          id: result.sub || 'temp-id',
          email: data.email,
          phone: '',
          user_type: result.role === 'admin' ? 'admin' : 'juridico',
          preferred_currency: 'VES',
          is_active: true,
          is_verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          company_name: 'Empresa',
        };
        
        this.setUser(userData);
        
        return {
          success: true,
          message: 'Login exitoso',
          data: {
            token: result.access_token,
            user: userData
          }
        };
      } else {
        return {
          success: false,
          message: 'Respuesta del servidor inválida',
          errors: {}
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Error de conexión. Por favor, intenta nuevamente.',
        errors: {}
      };
    }
  }

  // Obtener datos del usuario autenticado
  async getMe(): Promise<User | null> {
    try {
      const response = await this.authenticatedFetch(`${this.baseUrl}/me`);
      if (!response.ok) {
        this.logout();
        return null;
      }
      const userData = await response.json();
      this.setUser(userData);
      return userData;
    } catch (error) {
      console.error('Error fetching user data:', error);
      this.logout();
      return null;
    }
  }

  // Logout
  logout(): void {
    this.removeToken();
    this.removeUser();
  }

  // Verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  }

  // Obtener usuario actual
  getCurrentUser(): User | null {
    return this.getUser();
  }

  // Obtener token actual
  getCurrentToken(): string | null {
    return this.getToken();
  }

  // Refrescar token
  async refreshToken(): Promise<AuthResponse> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No token available');
      }

      const response = await fetch(`${this.baseUrl}/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();
      
      if (!response.ok) {
        this.logout(); // Limpiar datos si el refresh falla
        return {
          success: false,
          message: 'Sesión expirada',
          errors: {}
        };
      }

      // Actualizar token
      if (result.data?.token) {
        this.setToken(result.data.token);
      }

      return {
        success: true,
        message: 'Token renovado',
        data: result.data
      };
    } catch (error) {
      console.error('Error refreshing token:', error);
      this.logout();
      return {
        success: false,
        message: 'Error renovando sesión',
        errors: {}
      };
    }
  }

  // Métodos privados para manejo de localStorage
  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private removeToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  private setUser(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  private getUser(): User | null {
    const userStr = localStorage.getItem(this.userKey);
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      this.removeUser();
      return null;
    }
  }

  private removeUser(): void {
    localStorage.removeItem(this.userKey);
  }

  // Interceptor para requests autenticados
  async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const token = this.getToken();
    
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Si el token ha expirado, intentar renovarlo
    if (response.status === 401 && token) {
      const refreshResult = await this.refreshToken();
      if (refreshResult.success) {
        // Reintentar la request con el nuevo token
        const newToken = this.getToken();
        return fetch(url, {
          ...options,
          headers: {
            ...headers,
            'Authorization': `Bearer ${newToken}`,
          },
        });
      }
    }

    return response;
  }
}

// Exportar una instancia singleton
export const authService = new AuthService();
export default authService; 