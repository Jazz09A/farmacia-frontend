import { 
  LoginData, 
  JuridicoRegisterData, 
  AuthResponse, 
  User 
} from '../types/auth';
import { Cart } from '../types';

class AuthService {
  private url = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  private baseUrl = '/api/v1/auth';
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';
  private cartUrl = '/api/v1/user/cart';
  private mePromise: Promise<User | null> | null = null;
  private isRequestInProgress = false;
  private requestAbortController: AbortController | null = null;

  // Verificación de email
  async checkEmailAvailability(email: string): Promise<{ available: boolean; message: string }> {
    try {
      const response = await fetch(`${this.url}${this.baseUrl}/get-email-verification/${email}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      const result = await response.json();
      
      if (response.ok) {
        // Si la respuesta es exitosa, significa que el email está disponible
        return { available: true, message: 'Email disponible' };
      } else {
        // Si hay error, probablemente el email ya está registrado
        return { available: false, message: result.message || 'Este email ya está registrado' };
      }
    } catch (error) {
      // En caso de error de conexión, asumimos que el email está disponible para no bloquear al usuario
      console.warn('Error verificando email, asumiendo disponible:', error);
      return { available: true, message: 'Email disponible' };
    }
  }

  // Registro de usuario jurídico
  async registerJuridico(data: JuridicoRegisterData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.url}${this.baseUrl}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Error en el registro');
      }
      return { success: true, message: result.message || 'Registro exitoso', data: result.data };
    } catch (error) {
      throw new Error('Error de conexión. Por favor, intenta nuevamente.');
    }
  }

  // Login
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.url}${this.baseUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Credenciales inválidas');
      }
      if (result.access_token) {
        console.log(result.access_token);
        this.setToken(result.access_token);
        const user = await this.getMe(); // Fetch user data after setting token
        if (user) {
          return { success: true, message: 'Login exitoso', data: { token: result.access_token, user } };
        } else {
            throw new Error('No se pudieron obtener los datos del usuario.');
        }
      } else {
        throw new Error('Respuesta del servidor inválida');
      }
    } catch (error) {
      console.error('Error en login:', error);
      throw new Error('Error de conexión. Por favor, intenta nuevamente.');
    }
  }

  // Obtener datos del usuario autenticado (mejorado sin singleton problemático)
  async getMe(forceRefresh = false): Promise<User | null> {
    // Si hay una solicitud en progreso y no es un refresh forzado, esperamos el resultado
    if (this.isRequestInProgress && !forceRefresh && this.mePromise) {
      return this.mePromise;
    }

    // Si estamos forzando un refresh, cancelamos la solicitud anterior
    if (forceRefresh && this.requestAbortController) {
      this.requestAbortController.abort();
    }

    // Creamos un nuevo AbortController para esta solicitud
    this.requestAbortController = new AbortController();
    this.isRequestInProgress = true;
    
    this.mePromise = this.fetchUserData(this.requestAbortController.signal);
    
    try {
      const result = await this.mePromise;
      return result;
    } finally {
      this.isRequestInProgress = false;
      this.requestAbortController = null;
      // Limpiar la promesa después de un tiempo razonable para permitir cache
      setTimeout(() => {
        if (!this.isRequestInProgress) {
          this.mePromise = null;
        }
      }, 5000); // 5 segundos de cache
    }
  }

  private async fetchUserData(signal: AbortSignal): Promise<User | null> {
    const fullUrl = `${this.url}${this.baseUrl}/me`;
    console.log("fullUrl: ", fullUrl);
    try {
      // FIX: Pass relative path to authenticatedFetch to avoid URL duplication.
      const response = await this.authenticatedFetch(`${this.baseUrl}/me`, {
        signal
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          this.logout();
        }
        return null;
      }
      
      const userData = await response.json();
      this.setUser(userData);
      return userData;
    } catch (error: any) {
      // No hacer logout si la solicitud fue cancelada
      if (error.name !== 'AbortError') {
        console.error('Error fetching user data:', error);
        if (error.message === 'Session expired') {
          this.logout();
        }
      }
      return null;
    }
  }

  logout(): void {
    // Cancelar cualquier solicitud en progreso
    if (this.requestAbortController) {
      this.requestAbortController.abort();
    }
    
    this.removeToken();
    this.removeUser();
    this.mePromise = null;
    this.isRequestInProgress = false;
    this.requestAbortController = null;
    
    // 🔥 CRÍTICO: Limpiar datos sensibles adicionales
    this.clearSessionData();
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

      const response = await fetch(`${this.url}${this.baseUrl}/refresh`, {
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
  public setToken(token: string): void {
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

  // 🔥 NUEVO: Método para limpiar datos sensibles adicionales
  private clearSessionData(): void {
    // Limpiar localStorage de datos sensibles que puedan quedar
    const sensitiveKeys = [
      'cart_cache',
      'user_preferences', 
      'temp_order_data',
      'search_history',
      'viewed_products',
      'draft_orders'
    ];
    
    sensitiveKeys.forEach(key => {
      localStorage.removeItem(key);
    });

    // Limpiar todo el sessionStorage por seguridad
    sessionStorage.clear();
    
    // Limpiar cookies sensibles si las hay
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
  }
  
  async addToCart(productId: string, quantity: number): Promise<any> {
    // FIX: Pass relative path to authenticatedFetch to avoid URL duplication.
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
    // FIX: Pass relative path to authenticatedFetch to avoid URL duplication.
    const response = await this.authenticatedFetch(`${this.cartUrl}/clear`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to clear cart');
    }
  }

  async updateCartItem(itemId: string, quantity: number): Promise<any> {
    // FIX: Pass relative path to authenticatedFetch to avoid URL duplication.
    const response = await this.authenticatedFetch(`${this.cartUrl}/item/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error updating cart item');
    }
    
    return await response.json();
  }

  async removeFromCart(itemId: string): Promise<any> {
    // FIX: Pass relative path to authenticatedFetch to avoid URL duplication.
    const response = await this.authenticatedFetch(`${this.cartUrl}/item/${itemId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error removing from cart');
    }
    
    return await response.json();
  }

  async createOrder(orderData: {
    shipping_address_id: string;
    payment_method: string;
    payment_capture_url: string;
    customer_notes: string;
  }): Promise<any> {
    // FIX: Pass relative path to authenticatedFetch to avoid URL duplication.
    const response = await this.authenticatedFetch(`/api/v1/user/orders`, {
      method: 'POST',
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error creating order');
    }
    
    return await response.json();
  }

  async getUserOrders(): Promise<any[]> {
    // FIX: Pass relative path to authenticatedFetch to avoid URL duplication.
    const response = await this.authenticatedFetch(`/api/v1/user/orders`);
    if (!response.ok) {
      throw new Error('Failed to fetch user orders');
    }
    return await response.json();
  }

  async getOrderDetails(orderId: string): Promise<any> {
    // FIX: Pass relative path to authenticatedFetch to avoid URL duplication.
    const response = await this.authenticatedFetch(`/api/v1/user/orders/${orderId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch order details');
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

  async resendVerificationEmail(): Promise<any> {
    const response = await this.authenticatedFetch('/api/v1/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email: this.getCurrentUser()?.email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error resending verification email');
    }
    
    return await response.json();
  }

  async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const token = this.getToken();
    
    // 🔥 CRÍTICO: Verificar que existe token antes de hacer request
    if (!token) {
      this.logout();
      throw new Error('No authentication token - session terminated');
    }

    const headers: HeadersInit = {
      'Authorization': `Bearer ${token}`,
      ...(options.headers || {}),
    };

    // Si NO es FormData, agregar Content-Type por defecto
    if (!(options.body instanceof FormData)) {
      headers['Content-Type' as keyof HeadersInit] = 'application/json';
    }

    const response = await fetch(`${this.url}${url}`, { ...options, headers });

    // 🔥 MEJORADO: Manejar diferentes códigos de error de autenticación
    if (response.status === 401 || response.status === 403) {
      // Token inválido o expirado - hacer logout completo
      this.logout();
      
      // 🔥 CRÍTICO: Notificar a otros componentes del logout forzado
      window.dispatchEvent(new CustomEvent('forceLogout', { 
        detail: { reason: 'Authentication failed', status: response.status }
      }));
      
      throw new Error('Session expired - please login again');
    }

    return response;
  }
}

export const authService = new AuthService();
export default authService;
