import cartCache from '../utils/cartCache';

// 🔒 Utilidades de seguridad para prevenir filtración de datos entre usuarios

const isProduction = import.meta.env.PROD;
const isDevelopment = import.meta.env.DEV;

export class SecurityManager {
  private static instance: SecurityManager;
  private originalConsole: any = {};
  
  private constructor() {
    if (isProduction) {
      this.disableDevTools();
      this.disableConsole();
      this.protectNetworkRequests();
      this.disableRightClick();
      this.disableKeyboardShortcuts();
      this.detectDevTools();
    }
    this.setupSecurityListeners();
  }

  public static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  // 🔥 CRÍTICO: Deshabilitar herramientas de desarrollador en producción
  private disableDevTools(): void {
    if (!isProduction) return;

    // Detectar apertura de DevTools
    const detectDevTools = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
      if (widthThreshold || heightThreshold) {
        this.handleDevToolsDetected();
      }
    };

    // Verificar periódicamente
    setInterval(detectDevTools, 500);

    // Detectar mediante console
    const element = new Image();
    Object.defineProperty(element, 'id', {
      get: () => {
        this.handleDevToolsDetected();
      }
    });
    
    // Detectar mediante debugger
    const checkDebugger = () => {
      const start = performance.now();
      // eslint-disable-next-line no-debugger
      debugger;
      const end = performance.now();
      if (end - start > 100) {
        this.handleDevToolsDetected();
      }
    };
    setInterval(checkDebugger, 1000);
  }

  // 🔥 Deshabilitar console en producción
  private disableConsole(): void {
    if (!isProduction) return;

    // Guardar referencias originales
    this.originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info,
      debug: console.debug,
      trace: console.trace,
      table: console.table,
      group: console.group,
      groupEnd: console.groupEnd,
      groupCollapsed: console.groupCollapsed,
      time: console.time,
      timeEnd: console.timeEnd,
      count: console.count,
      clear: console.clear
    };

    // Reemplazar con funciones vacías
    const noop = () => {};
    console.log = noop;
    console.warn = noop;
    console.error = noop;
    console.info = noop;
    console.debug = noop;
    console.trace = noop;
    console.table = noop;
    console.group = noop;
    console.groupEnd = noop;
    console.groupCollapsed = noop;
    console.time = noop;
    console.timeEnd = noop;
    console.count = noop;
    console.clear = noop;

    // Prevenir acceso a console desde window
    Object.defineProperty(window, 'console', {
      value: {},
      writable: false,
      configurable: false
    });
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
    if (!data || typeof data !== 'object') {
      return data;
    }

    // Si es un array, sanitizar cada elemento
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeResponseData(item));
    }

    // Crear copia del objeto
    const sanitized: any = {};

    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      
      // Ocultar campos sensibles
      if (
        lowerKey.includes('password') ||
        lowerKey.includes('token') ||
        lowerKey.includes('secret') ||
        lowerKey.includes('key') ||
        lowerKey.includes('api_key') ||
        lowerKey.includes('authorization')
      ) {
        sanitized[key] = '***';
        continue;
      }

      // Limitar longitud de mensajes de error detallados
      if (lowerKey === 'detail' || lowerKey === 'message' || lowerKey === 'error') {
        if (typeof value === 'string' && value.length > 200) {
          sanitized[key] = value.substring(0, 200) + '...';
          continue;
        }
      }

      // Sanitizar objetos anidados
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        sanitized[key] = this.sanitizeResponseData(value);
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map(item => 
          typeof item === 'object' ? this.sanitizeResponseData(item) : item
        );
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  // 🔥 Deshabilitar clic derecho
  private disableRightClick(): void {
    if (!isProduction) return;

    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      return false;
    }, false);

    // Prevenir selección de texto
    document.addEventListener('selectstart', (e) => {
      e.preventDefault();
      return false;
    }, false);

    // Prevenir arrastrar imágenes
    document.addEventListener('dragstart', (e) => {
      e.preventDefault();
      return false;
    }, false);
  }

  // 🔥 Deshabilitar atajos de teclado para DevTools
  private disableKeyboardShortcuts(): void {
    if (!isProduction) return;

    document.addEventListener('keydown', (e) => {
      // F12
      if (e.keyCode === 123) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      // Ctrl+Shift+I
      if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      // Ctrl+Shift+J
      if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      // Ctrl+Shift+C
      if (e.ctrlKey && e.shiftKey && e.keyCode === 67) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      // Ctrl+U (ver código fuente)
      if (e.ctrlKey && e.keyCode === 85) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      // Ctrl+S (guardar página)
      if (e.ctrlKey && e.keyCode === 83) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    }, false);
  }

  // 🔥 Detectar DevTools abiertas
  private detectDevTools(): void {
    if (!isProduction) return;

    const element = new Image();
    Object.defineProperty(element, 'id', {
      get: () => {
        this.handleDevToolsDetected();
      }
    });

    // Verificar periódicamente
    setInterval(() => {
      // Intentar acceder a propiedad que solo funciona con DevTools abiertas
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      element.id;
    }, 1000);
  }

  // 🔥 Manejar detección de DevTools
  private handleDevToolsDetected(): void {
    if (!isProduction) return;

    // Limpiar información sensible
    this.emergencyCleanup();
    
    // Mostrar advertencia
    document.body.innerHTML = `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
        width: 100vw;
        background: #1a1a1a;
        color: #fff;
        font-family: system-ui, -apple-system, sans-serif;
        text-align: center;
        padding: 20px;
      ">
        <div>
          <h1 style="font-size: 24px; margin-bottom: 16px;">Acceso Restringido</h1>
          <p style="font-size: 16px; opacity: 0.8;">
            Las herramientas de desarrollador no están permitidas en este sitio.
          </p>
        </div>
      </div>
    `;

    // Redirigir después de 3 segundos
    setTimeout(() => {
      window.location.href = '/';
    }, 3000);
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
      this.originalConsole.warn?.('🚨 Force logout triggered:', event.detail);
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
        this.originalConsole.error?.('🚨 Error during emergency cleanup:', error);
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
