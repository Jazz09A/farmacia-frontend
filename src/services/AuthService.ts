import { 
  LoginData, 
  JuridicoRegisterData, 
  AuthResponse, 
  User 
} from '../types/auth';
import { Cart } from '../types';

class AuthService {
  private baseUrl = '/api/v1/auth';
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';
  private cartUrl = '/api/v1/user/cart';
  private mePromise: Promise<User | null> | null = null;

  // Registro de usuario jurídico
  async registerJuridico(data: JuridicoRegisterData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/register/juridico`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) {
        return { success: false, message: result.message || 'Error en el registro', errors: result.errors || {} };
      }
      return { success: true, message: result.message || 'Registro exitoso', data: result.data };
    } catch (error) {
      return { success: false, message: 'Error de conexión. Por favor, intenta nuevamente.', errors: {} };
    }
  }

  // Login
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) {
        return { success: false, message: result.message || 'Credenciales inválidas', errors: result.errors || {} };
      }
      if (result.access_token) {
        this.setToken(result.access_token);
        const user = await this.getMe(); // Fetch user data after setting token
        if (user) {
          return { success: true, message: 'Login exitoso', data: { token: result.access_token, user } };
        } else {
          return { success: false, message: 'No se pudieron obtener los datos del usuario.', errors: {} };
        }
      } else {
        return { success: false, message: 'Respuesta del servidor inválida', errors: {} };
      }
    } catch (error) {
      return { success: false, message: 'Error de conexión. Por favor, intenta nuevamente.', errors: {} };
    }
  }

  // Obtener datos del usuario autenticado (con patrón singleton promise)
  getMe(): Promise<User | null> {
    if (this.mePromise) {
      return this.mePromise;
    }
    
    this.mePromise = (async () => {
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
        this.logout();
        return null;
      } finally {
        // Clear the promise after it has resolved to allow re-fetching if needed (e.g., after a logout/login cycle)
        setTimeout(() => { this.mePromise = null; }, 1000);
      }
    })();
    
    return this.mePromise;
  }

  logout(): void {
    this.removeToken();
    this.removeUser();
    this.mePromise = null; // Clear promise on logout
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): User | null {
    return this.getUser();
  }

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
  
  async addToCart(productId: string, quantity: number): Promise<any> {
    const response = await this.authenticatedFetch(`${this.cartUrl}/add`, {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error adding to cart');
    }
    
    return await response.json();
  }

  async getCart(): Promise<Cart> {
    const response = await this.authenticatedFetch(this.cartUrl);
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error getting cart');
    }
    return await response.json();
  }

  async clearCart(): Promise<void> {
    const response = await this.authenticatedFetch(`${this.cartUrl}/clear`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to clear cart');
    }
  }

  async createOrder(orderData: {
    shipping_address_id: string;
    payment_method: string;
    payment_capture_url: string;
    customer_notes: string;
  }): Promise<any> {
    const response = await this.authenticatedFetch('/api/v1/user/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error creating order');
    }
    
    return await response.json();
  }

  async getUserAddresses(): Promise<any[]> {
    const response = await this.authenticatedFetch('/api/v1/user/addresses');
    if (!response.ok) {
      throw new Error('Failed to fetch user addresses');
    }
    return await response.json();
  }

  async createUserAddress(addressData: any): Promise<any> {
    const response = await this.authenticatedFetch('/api/v1/user/addresses', {
      method: 'POST',
      body: JSON.stringify(addressData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error creating address');
    }
    
    return await response.json();
  }

  async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401 && token) {
      this.logout();
      // Optionally, redirect to login page
      // window.location.href = '/auth';
      throw new Error('Session expired');
    }

    return response;
  }
}

export const authService = new AuthService();
export default authService;
