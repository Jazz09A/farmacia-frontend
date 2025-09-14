import cartCache from '../utils/cartCache';

// 🔒 Utilidades de seguridad para prevenir filtración de datos entre usuarios

export class SecurityManager {
  private static instance: SecurityManager;
  
  private constructor() {
    this.setupSecurityListeners();
  }

  public static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
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
    console.warn('🚨 Force logout triggered:', event.detail);
    
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
      console.error('🚨 Error during emergency cleanup:', error);
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
        console.warn('🚨 Session integrity issue: token without user data');
        return false;
      }
      
      if (user && !token) {
        console.warn('🚨 Session integrity issue: user data without token');
        return false;
      }

      return true;
    } catch (error) {
      console.error('🚨 Error verifying session integrity:', error);
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
