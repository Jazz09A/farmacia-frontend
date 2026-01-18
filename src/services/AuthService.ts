import { 
  LoginData, 
  JuridicoRegisterData, 
  AuthResponse, 
  User 
} from '../types/auth';
import { Cart, Order } from '../types';
import { 
  CartWithDiscounts, 
  ApplicableDiscountResponse 
} from '../types/discounts';

class AuthService {
  // En desarrollo usamos rutas relativas para aprovechar el proxy de Vite
  // En producción usamos la URL completa
  private isDevelopment = import.meta.env.DEV;
  private url = this.isDevelopment ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:8000');
  private baseUrl = '/api/v1/auth';
  private tokenKey = 'auth_token';
  private refreshTokenKey = 'refresh_token';
  private tokenExpiryKey = 'token_expiry';
  private userKey = 'auth_user';
  private cartUrl = '/api/v1/user/cart';
  private mePromise: Promise<User | null> | null = null;
  private isRequestInProgress = false;
  private requestAbortController: AbortController | null = null;
  
  // Refresh token state management
  private isRefreshing = false;
  private refreshPromise: Promise<AuthResponse> | null = null;
  private pendingRequests: Array<{
    resolve: (value: Response) => void;
    reject: (error: Error) => void;
    url: string;
    options: RequestInit;
  }> = [];
  private readonly tokenRefreshThreshold = 120; // Refresh 2 minutes before expiry (in seconds)


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
        // Devolver mensaje del backend (detail o message) sin lanzar excepción
        return {
          success: false,
          message: result?.detail || result?.message || 'Credenciales inválidas',
          errors: result?.errors || {}
        };
      }
      if (result.access_token) {
        this.setToken(result.access_token);
        
        // Store refresh_token if provided
        if (result.refresh_token) {
          this.setRefreshToken(result.refresh_token);
        }
        
        // Store token expiry time
        if (result.expires_in) {
          this.setTokenExpiry(result.expires_in);
        }
        
        const user = await this.getMe(); // Fetch user data after setting token
        if (user) {
          return { 
            success: true, 
            message: 'Login exitoso', 
            data: { 
              token: result.access_token, 
              refresh_token: result.refresh_token,
              user 
            },
            expires_in: result.expires_in
          };
        } else {
            throw new Error('No se pudieron obtener los datos del usuario.');
        }
      } else {
        throw new Error('Respuesta del servidor inválida');
      }
    } catch (error) {
      console.error('Error en login:', error);
      // Manejo de red/otros errores devolviendo una respuesta uniforme
      return {
        success: false,
        message: 'Error de conexión. Por favor, intenta nuevamente.',
        errors: {}
      };
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

  // Solicitar reset de contraseña (olvidé mi contraseña)
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.url}${this.baseUrl}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          message: result.message || result.detail || 'Error al solicitar el reset de contraseña'
        };
      }
      
      return {
        success: true,
        message: result.message || 'Se ha enviado un email con las instrucciones para restablecer tu contraseña'
      };
    } catch (error) {
      console.error('Error en forgotPassword:', error);
      return {
        success: false,
        message: 'Error de conexión. Por favor, intenta nuevamente.'
      };
    }
  }

  // Restablecer contraseña con token (desde el enlace del email)
  async resetPassword(token: string, newPassword: string, confirmPassword: string): Promise<{ success: boolean; message: string; errors?: Record<string, string[]> }> {
    try {
      const response = await fetch(`${this.url}${this.baseUrl}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          new_password: newPassword,
          confirm_password: confirmPassword
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          message: result.message || result.detail || 'Error al restablecer la contraseña',
          errors: result.errors || {}
        };
      }
      
      return {
        success: true,
        message: result.message || 'Contraseña restablecida exitosamente'
      };
    } catch (error) {
      console.error('Error en resetPassword:', error);
      return {
        success: false,
        message: 'Error de conexión. Por favor, intenta nuevamente.'
      };
    }
  }

  // Cambiar contraseña (usuario autenticado)
  async changePassword(currentPassword: string, newPassword: string, confirmPassword: string): Promise<{ success: boolean; message: string; errors?: Record<string, string[]> }> {
    try {
      const response = await this.authenticatedFetch(`${this.baseUrl}/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
          confirm_password: confirmPassword
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          message: result.message || result.detail || 'Error al cambiar la contraseña',
          errors: result.errors || {}
        };
      }
      
      return {
        success: true,
        message: result.message || 'Contraseña cambiada exitosamente'
      };
    } catch (error) {
      console.error('Error en changePassword:', error);
      return {
        success: false,
        message: 'Error de conexión. Por favor, intenta nuevamente.'
      };
    }
  }

  logout(): void {
    // Cancelar cualquier solicitud en progreso
    if (this.requestAbortController) {
      this.requestAbortController.abort();
    }
    
    this.removeToken();
    this.removeRefreshToken();
    this.removeTokenExpiry();
    this.removeUser();
    this.mePromise = null;
    this.isRequestInProgress = false;
    this.requestAbortController = null;
    
    // Clear refresh state
    this.isRefreshing = false;
    this.refreshPromise = null;
    
    // Reject all pending requests
    this.rejectPendingRequests(new Error('User logged out'));
    
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
    // If already refreshing, return the existing promise
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.logout();
      return {
        success: false,
        message: 'No refresh token available',
        errors: {}
      };
    }

    // Set refreshing flag and create promise
    this.isRefreshing = true;
    this.refreshPromise = this.performRefresh(refreshToken);

    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      // Reset refreshing state after a short delay to allow queued requests to complete
      setTimeout(() => {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }, 100);
    }
  }

  private async performRefresh(refreshToken: string): Promise<AuthResponse> {
    try {
      const fullUrl = `${this.url}${this.baseUrl}/refresh`;
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        // Refresh token expired or invalid - force logout
        this.logout();
        
        // Reject all pending requests
        this.rejectPendingRequests(new Error('Session expired - please login again'));
        
        // Notify components of forced logout
        window.dispatchEvent(new CustomEvent('forceLogout', { 
          detail: { reason: 'Refresh token expired', status: response.status }
        }));
        
        return {
          success: false,
          message: 'Sesión expirada',
          errors: {}
        };
      }

      // Token rotation: update both access_token and refresh_token
      if (result.access_token) {
        this.setToken(result.access_token);
      }
      
      if (result.refresh_token) {
        this.setRefreshToken(result.refresh_token);
      }
      
      // Update expiry time
      if (result.expires_in) {
        this.setTokenExpiry(result.expires_in);
      }

      // Retry all pending requests with new token
      this.retryPendingRequests();

      return {
        success: true,
        message: 'Token renovado',
        data: {
          token: result.access_token,
          refresh_token: result.refresh_token
        },
        expires_in: result.expires_in
      };
    } catch (error) {
      console.error('Error refreshing token:', error);
      this.logout();
      
      // Reject all pending requests
      this.rejectPendingRequests(new Error('Error renovando sesión'));
      
      // Notify components of forced logout
      window.dispatchEvent(new CustomEvent('forceLogout', { 
        detail: { reason: 'Refresh token error', error: error }
      }));
      
      return {
        success: false,
        message: 'Error renovando sesión',
        errors: {}
      };
    }
  }

  private async retryPendingRequests(): Promise<void> {
    const requests = [...this.pendingRequests];
    this.pendingRequests = [];

    for (const request of requests) {
      try {
        const response = await this.makeAuthenticatedRequest(request.url, request.options);
        request.resolve(response);
      } catch (error) {
        request.reject(error as Error);
      }
    }
  }

  private rejectPendingRequests(error: Error): void {
    const requests = [...this.pendingRequests];
    this.pendingRequests = [];

    for (const request of requests) {
      request.reject(error);
    }
  }

  private async makeAuthenticatedRequest(url: string, options: RequestInit): Promise<Response> {
    const token = this.getToken();
    
    if (!token) {
      throw new Error('No authentication token - session terminated');
    }

    // 🔥 FIX: Asegurar que el token esté limpio (sin espacios) antes de usarlo
    const cleanToken = token.trim();

    const customHeaders = (options.headers || {}) as Record<string, string>;
    const headers: HeadersInit = {
      ...customHeaders,
      'Authorization': `Bearer ${cleanToken}`,
    };

    if (!(options.body instanceof FormData) && !customHeaders['Content-Type']) {
      headers['Content-Type' as keyof HeadersInit] = 'application/json';
    }

    const isAbsoluteUrl = url.startsWith('http://') || url.startsWith('https://');
    const fullUrl = isAbsoluteUrl ? url : `${this.url}${url}`;
    
    const { headers: _, ...restOptions } = options;
    return fetch(fullUrl, { ...restOptions, headers });
  }

  // Métodos privados para manejo de localStorage
  public setToken(token: string): void {
    // 🔥 FIX: Limpiar el token (eliminar espacios) antes de guardarlo
    const cleanToken = token.trim();
    localStorage.setItem(this.tokenKey, cleanToken);
  }

  private getToken(): string | null {
    const token = localStorage.getItem(this.tokenKey);
    // 🔥 FIX: Limpiar el token al obtenerlo por si acaso tiene espacios
    return token ? token.trim() : null;
  }

  private removeToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  // Refresh token management methods
  private setRefreshToken(refreshToken: string): void {
    // 🔥 FIX: Limpiar el refresh token antes de guardarlo
    const cleanToken = refreshToken.trim();
    localStorage.setItem(this.refreshTokenKey, cleanToken);
  }

  private getRefreshToken(): string | null {
    const token = localStorage.getItem(this.refreshTokenKey);
    // 🔥 FIX: Limpiar el refresh token al obtenerlo
    return token ? token.trim() : null;
  }

  private removeRefreshToken(): void {
    localStorage.removeItem(this.refreshTokenKey);
  }

  // Token expiry management methods
  private setTokenExpiry(expiresIn: number): void {
    // expiresIn is in seconds, convert to milliseconds and add to current time
    const expiryTime = Date.now() + (expiresIn * 1000);
    localStorage.setItem(this.tokenExpiryKey, expiryTime.toString());
  }

  private getTokenExpiry(): number | null {
    const expiryStr = localStorage.getItem(this.tokenExpiryKey);
    if (!expiryStr) return null;
    const expiry = parseInt(expiryStr, 10);
    return isNaN(expiry) ? null : expiry;
  }

  private removeTokenExpiry(): void {
    localStorage.removeItem(this.tokenExpiryKey);
  }

  // Check if token is expiring soon (within threshold)
  private isTokenExpiring(): boolean {
    const expiry = this.getTokenExpiry();
    if (!expiry) return false;
    
    const now = Date.now();
    const timeUntilExpiry = (expiry - now) / 1000; // Convert to seconds
    return timeUntilExpiry <= this.tokenRefreshThreshold;
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
      'draft_orders',
      this.refreshTokenKey,
      this.tokenExpiryKey
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
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to clear cart');
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
    payment_currency: 'USD' | 'VES';
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

  async getOrderDetails(orderId: string): Promise<Order> {
    // FIX: Pass relative path to authenticatedFetch to avoid URL duplication.
    const response = await this.authenticatedFetch(`/api/v1/user/orders/${orderId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch order details');
    }
    const data = await response.json();
    return data;
  }

  async getUserAddresses(_options?: {
    include_checkout_preview?: boolean;
    cart_total?: number;
  }): Promise<any> {
    const response = await this.authenticatedFetch('/api/v1/user/customer-addresses');
    if (!response.ok) {
      throw new Error('Failed to fetch user addresses');
    }
    const data = await response.json();
    return data;
  }


  async verifyEmailToken(token: string): Promise<{ success: boolean; message: string }>{
    try {
      const fullUrl = `${this.url}${this.baseUrl}/verify-email/${token}`;
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result?.message || 'No se pudo verificar el correo');
      }

      return { success: true, message: result?.message || 'Correo verificado correctamente' };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Error verificando correo' };
    }
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

    // 🔥 PROACTIVE REFRESH: Check if token is expiring soon and refresh proactively
    if (this.isTokenExpiring() && !this.isRefreshing) {
      try {
        await this.refreshToken();
      } catch (error) {
        // If proactive refresh fails, continue with original request
        // It will fail with 401 and trigger reactive refresh
        console.warn('Proactive token refresh failed, continuing with original request:', error);
      }
    }

    // If already refreshing, queue this request
    if (this.isRefreshing) {
      return new Promise<Response>((resolve, reject) => {
        this.pendingRequests.push({ resolve, reject, url, options });
      });
    }

    // Make the request
    let response: Response;
    try {
      response = await this.makeAuthenticatedRequest(url, options);
    } catch (error) {
      throw error;
    }

    // 🔥 REACTIVE REFRESH: Handle 401 errors
    if (response.status === 401) {
      // If not already refreshing, start refresh and queue this request
      if (!this.isRefreshing) {
        // Queue the original request
        const retryPromise = new Promise<Response>((resolve, reject) => {
          this.pendingRequests.push({ resolve, reject, url, options });
        });

        // Start refresh (this will retry all queued requests on success)
        try {
          await this.refreshToken();
          // After refresh, the queued request should have been retried
          // But if it wasn't, retry it now
          return retryPromise;
        } catch (error) {
          // Refresh failed - reject the queued request
          throw error;
        }
      } else {
        // Already refreshing, just queue this request
        return new Promise<Response>((resolve, reject) => {
          this.pendingRequests.push({ resolve, reject, url, options });
        });
      }
    }

    if (response.status === 403) {
      // Mantener la sesión, pero propagar el error para manejo específico
      throw new Error('No tienes permisos para esta acción.');
    }

    return response;
  }

  // ===== MÉTODOS DE DESCUENTOS =====

  /**
   * Obtiene el carrito con información de descuentos aplicados
   */
  async getCartWithDiscounts(): Promise<CartWithDiscounts> {
    const response = await this.authenticatedFetch(this.cartUrl);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error getting cart with discounts');
    }
    return await response.json();
  }

  /**
   * Obtiene el descuento aplicable por cantidad (endpoint público)
   */
  async getApplicableQuantityDiscount(quantity: number): Promise<ApplicableDiscountResponse | null> {
    try {
      const response = await fetch(`${this.url}/api/v1/public/quantity-discounts/applicable?total_quantity=${quantity}`);
      if (!response.ok) {
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching applicable discount:', error);
      return null;
    }
  }
}

export const authService = new AuthService();
export default authService;
