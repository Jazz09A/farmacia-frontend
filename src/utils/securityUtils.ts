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
      
      // 🔥 CRÍTICO: Obtener la URL de la petición para verificar si es de autenticación
      const requestUrl = typeof args[0] === 'string' ? args[0] : (args[0] as Request)?.url || '';
      const isAuthEndpoint = this.isAuthenticationEndpoint(requestUrl);
      
      // 🔥 CRÍTICO: NO sanitizar respuestas de autenticación - la app necesita los tokens reales
      if (isAuthEndpoint) {
        console.log('🔓 [SECURITY] Respuesta de autenticación detectada, NO sanitizando:', requestUrl);
        return response; // Devolver respuesta original sin sanitizar
      }
      
      // Solo interceptar respuestas JSON exitosas
      if (!response.ok) {
        // Para errores, devolver la respuesta original sin modificar
        return response;
      }

      // Verificar si es una respuesta JSON
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');
      
      if (!isJson) {
        // Si no es JSON, devolver la respuesta original
        return response;
      }
      
      // Crear un proxy para la respuesta que ofusca datos sensibles
      return new Proxy(response, {
        get: (target, prop) => {
          // Interceptar métodos que exponen datos
          if (prop === 'json') {
            return async () => {
              try {
                // Clonar la respuesta para poder leerla múltiples veces
                const clonedResponse = response.clone();
                const data = await clonedResponse.json();
                // Sanitizar datos sensibles antes de exponerlos, manteniendo la estructura
                const sanitized = this.sanitizeResponseData(data);
                // Asegurarse de que siempre devolvemos algo válido
                return sanitized !== null && sanitized !== undefined ? sanitized : data;
              } catch (error) {
                // En caso de error, intentar leer la respuesta original
                try {
                  return await response.json();
                } catch {
                  // Si falla, lanzar el error original
                  throw error;
                }
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
                  const sanitized = this.sanitizeResponseData(data);
                  return JSON.stringify(sanitized !== null && sanitized !== undefined ? sanitized : data);
                } catch {
                  return text;
                }
              } catch (error) {
                // Si hay error, intentar devolver el texto original
                try {
                  return await response.text();
                } catch {
                  throw error;
                }
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

  // 🔥 Verificar si una URL es un endpoint de autenticación
  private isAuthenticationEndpoint(url: string): boolean {
    if (!url) return false;
    
    // Normalizar la URL (remover protocolo, dominio, query params, etc.)
    const normalizedUrl = url.toLowerCase();
    
    const authPatterns = [
      '/api/v1/auth/login',
      '/api/v1/auth/refresh',
      '/api/v1/auth/register',
      '/api/v1/auth/verify-email',
      '/api/v1/auth/reset-password',
      '/api/v1/auth/forgot-password',
      '/api/v1/auth/change-password',
      'api/v1/auth/login',
      'api/v1/auth/refresh',
      'api/v1/auth/register',
      'api/v1/auth/verify-email',
      'api/v1/auth/reset-password',
      'api/v1/auth/forgot-password',
      'api/v1/auth/change-password'
    ];
    
    // Verificar si la URL contiene alguno de los patrones de autenticación
    return authPatterns.some(pattern => normalizedUrl.includes(pattern));
  }

  // 🔥 Sanitizar datos de respuesta para ocultar información sensible
  // IMPORTANTE: Esta función preserva la estructura de datos, solo sanitiza valores
  private sanitizeResponseData(data: any): any {
    // Manejar valores primitivos y null
    if (data === null || data === undefined) {
      return data;
    }

    if (typeof data === 'function') {
      return data;
    }

    // Si es un array, sanitizar cada elemento pero mantener el array
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeResponseData(item));
    }

    // Si no es un objeto, devolver tal cual (strings, numbers, booleans, etc.)
    if (typeof data !== 'object') {
      return data;
    }

    // Manejar objetos especiales (Date, etc.)
    if (data instanceof Date || data instanceof RegExp) {
      return data;
    }

    // Crear copia del objeto preservando todas las propiedades
    const sanitized: any = {};

    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      
      // Lista completa de campos sensibles a ocultar (solo valores, no propiedades)
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
      
      // Verificar si el campo es sensible (solo por el nombre de la clave)
      const isSensitive = sensitiveFields.some(field => lowerKey.includes(field));
      
      if (isSensitive && value !== null && value !== undefined) {
        // Ocultar completamente valores sensibles, pero mantener la propiedad
        sanitized[key] = '***';
        continue;
      }

      // Limitar longitud de mensajes de error detallados que puedan exponer información
      if ((lowerKey === 'detail' || lowerKey === 'message' || lowerKey === 'error' || lowerKey === 'traceback') && typeof value === 'string') {
        if (value.length > 150) {
          sanitized[key] = value.substring(0, 150) + '...';
          continue;
        }
      }

      // Sanitizar objetos anidados recursivamente
      if (value !== null && value !== undefined) {
        if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date) && !(value instanceof RegExp)) {
          sanitized[key] = this.sanitizeResponseData(value);
        } else if (Array.isArray(value)) {
          sanitized[key] = value.map(item => 
            item !== null && item !== undefined && typeof item === 'object' 
              ? this.sanitizeResponseData(item) 
              : item
          );
        } else {
          // Valores primitivos se copian tal cual
          sanitized[key] = value;
        }
      } else {
        // Preservar null y undefined
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
