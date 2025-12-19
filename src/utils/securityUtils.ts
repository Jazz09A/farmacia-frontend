import cartCache from '../utils/cartCache';

// 🔒 Utilidades de seguridad para prevenir filtración de datos entre usuarios

const isProduction = import.meta.env.PROD;
const isDevelopment = import.meta.env.DEV;

export class SecurityManager {
  private static instance: SecurityManager;
  
  private constructor() {
    // Solo proteger datos sensibles en producción, sin bloquear DevTools
    if (isProduction) {
      this.protectNetworkRequests();
    }
    this.setupSecurityListeners();
  }

  public static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }


  // 🔥 Proteger información sensible en requests de red
  private protectNetworkRequests(): void {
    if (!isProduction) return;

    // Interceptar fetch para ocultar información sensible
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      
      // Crear un proxy para la respuesta que ofusca datos sensibles
      return new Proxy(response, {
        get: (target, prop) => {
          // Interceptar métodos que exponen datos
          if (prop === 'json') {
            return async () => {
              try {
                const data = await target.json();
                // Sanitizar datos sensibles antes de exponerlos
                return this.sanitizeResponseData(data);
              } catch (error) {
                // En caso de error, devolver mensaje genérico
                return { error: 'Error procesando la respuesta' };
              }
            };
          }
          
          if (prop === 'text') {
            return async () => {
              try {
                const text = await target.text();
                // Intentar parsear y sanitizar si es JSON
                try {
                  const data = JSON.parse(text);
                  return JSON.stringify(this.sanitizeResponseData(data));
                } catch {
                  return text;
                }
              } catch (error) {
                return 'Error procesando la respuesta';
              }
            };
          }
          
          // Para otras propiedades, devolver el valor original
          const value = (target as any)[prop];
          return typeof value === 'function' ? value.bind(target) : value;
        }
      });
    };
  }

  // 🔥 Sanitizar datos de respuesta para ocultar información sensible
  private sanitizeResponseData(data: any): any {
    if (!data || typeof data === 'function') {
      return data;
    }

    // Si es un array, sanitizar cada elemento
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeResponseData(item));
    }

    // Si no es un objeto, devolver tal cual (strings, numbers, etc.)
    if (typeof data !== 'object') {
      return data;
    }

    // Crear copia del objeto
    const sanitized: any = {};

    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      
      // Lista completa de campos sensibles a ocultar
      const sensitiveFields = [
        'password', 'passwd', 'pwd',
        'token', 'access_token', 'refresh_token', 'auth_token', 'bearer',
        'secret', 'api_secret', 'client_secret',
        'key', 'api_key', 'private_key', 'public_key', 'access_key',
        'authorization', 'auth', 'credentials',
        'credit_card', 'card_number', 'cvv', 'cvc',
        'ssn', 'social_security',
        // 'email', // Descomentar si quieres ocultar emails también
        'phone', 'telephone', 'mobile',
        'address', 'street', 'zip', 'postal',
        'rfc', 'tax_id', 'vat',
        'iban', 'account_number', 'bank_account',
        'session', 'session_id', 'session_token'
      ];
      
      // Verificar si el campo es sensible
      const isSensitive = sensitiveFields.some(field => lowerKey.includes(field));
      
      if (isSensitive) {
        // Ocultar completamente campos sensibles
        sanitized[key] = '***';
        continue;
      }

      // Limitar longitud de mensajes de error detallados que puedan exponer información
      if (lowerKey === 'detail' || lowerKey === 'message' || lowerKey === 'error' || lowerKey === 'traceback') {
        if (typeof value === 'string' && value.length > 150) {
          sanitized[key] = value.substring(0, 150) + '...';
          continue;
        }
      }

      // Sanitizar objetos anidados
      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        sanitized[key] = this.sanitizeResponseData(value);
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map(item => 
          typeof item === 'object' && item !== null ? this.sanitizeResponseData(item) : item
        );
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }


  // 🔥 CRÍTICO: Configurar listeners de seguridad
  private setupSecurityListeners(): void {
    // Escuchar logout forzado por problemas de autenticación
    window.addEventListener('forceLogout', this.handleForceLogout.bind(this) as EventListener);
    
    // Limpiar datos al cerrar/refrescar la página
    window.addEventListener('beforeunload', this.handlePageUnload.bind(this));
    
    // Detectar cambios de visibilidad para pausar requests sensibles
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }

  private handleForceLogout(event: CustomEvent): void {
    if (isDevelopment) {
      // eslint-disable-next-line no-console
      console.warn('🚨 Force logout triggered:', event.detail);
    }
    
    // Limpiar todos los datos sensibles
    this.emergencyCleanup();
    
    // Mostrar mensaje al usuario
    this.showSecurityAlert('Tu sesión ha expirado por seguridad. Serás redirigido al login.');
    
    // Redirigir al login después de un breve delay
    setTimeout(() => {
      window.location.href = '/auth';
    }, 2000);
  }

  private handlePageUnload(): void {
    // Limpiar datos temporales al cerrar la página
    sessionStorage.clear();
  }

  private handleVisibilityChange(): void {
    if (document.hidden) {
      // Página oculta - pausar requests no críticos
    }
  }

  // 🔥 CRÍTICO: Limpieza de emergencia de todos los datos
  private emergencyCleanup(): void {
    try {
      // Limpiar localStorage completo excepto configuraciones básicas
      const preserveKeys = ['theme', 'language', 'app_version'];
      const allKeys = Object.keys(localStorage);
      
      allKeys.forEach(key => {
        if (!preserveKeys.includes(key)) {
          localStorage.removeItem(key);
        }
      });

      // Limpiar sessionStorage completo
      sessionStorage.clear();

      // Limpiar cookies de sesión
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });

    } catch (error) {
      if (isDevelopment) {
        // eslint-disable-next-line no-console
        console.error('🚨 Error during emergency cleanup:', error);
      }
    }
  }

  private showSecurityAlert(message: string): void {
    // Crear alerta de seguridad personalizada
    const alertDiv = document.createElement('div');
    alertDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #ef4444;
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      max-width: 350px;
    `;
    alertDiv.textContent = message;
    
    document.body.appendChild(alertDiv);
    
    // Auto-remover después de 3 segundos
    setTimeout(() => {
      document.body.removeChild(alertDiv);
    }, 3000);
  }

  // 🔥 Verificar integridad de la sesión
  public static verifySessionIntegrity(): boolean {
    try {
      const token = localStorage.getItem('auth_token');
      const user = localStorage.getItem('auth_user');
      
      // Verificaciones básicas de integridad
      if (token && !user) {
        if (isDevelopment) {
          // eslint-disable-next-line no-console
          console.warn('🚨 Session integrity issue: token without user data');
        }
        return false;
      }
      
      if (user && !token) {
        if (isDevelopment) {
          // eslint-disable-next-line no-console
          console.warn('🚨 Session integrity issue: user data without token');
        }
        return false;
      }

      return true;
    } catch (error) {
      if (isDevelopment) {
        // eslint-disable-next-line no-console
        console.error('🚨 Error verifying session integrity:', error);
      }
      return false;
    }
  }

  // 🔥 Limpiar datos específicos de un usuario
  public static async cleanUserSpecificData(userId?: string): Promise<void> {
    const userKeys = [
      `cart_${userId}`,
      `preferences_${userId}`,
      `recent_searches_${userId}`,
      `viewed_products_${userId}`,
      'temp_cart_data',
      'checkout_progress',
      'cart_cache_v2' // Limpiar caché del carrito
    ];

    userKeys.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    // 🧹 Limpiar caché específico del carrito usando su API
    if (userId) {
      cartCache.clearUserCart(userId);
    } else {
      cartCache.clearAll();
    }
  }
}

// Inicializar SecurityManager al importar
SecurityManager.getInstance();

export default SecurityManager;
