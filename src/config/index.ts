import { FRONTEND_PHASE1 } from '../architecture/ADR_001_frontend_phase1';
import { AUTH_STORAGE_KEYS, getApiOrigin, resolveApiUrl } from '../services/api/apiClient';

/**
 * Configuración centralizada de la aplicación.
 * Arquitectura post–Fase 1: ver `src/architecture/ADR_001_frontend_phase1.ts`.
 * Flujo comercial = cotizaciones; crédito y orders legacy no montados en FE.
 */
export const config = {
  // API Configuration — origen vacío en DEV (proxy Vite vía apiClient.getApiOrigin)
  api: {
    baseUrl: getApiOrigin() || (import.meta.env.VITE_API_URL || 'http://localhost:8000'),
    timeout: 30000,
    retryAttempts: 3,
  },

  // Environment
  env: import.meta.env.MODE || 'development',
  isDevelopment: import.meta.env.MODE === 'development',
  isProduction: import.meta.env.MODE === 'production',

  // Debug Mode
  debug: import.meta.env.VITE_DEBUG_MODE === 'true' || import.meta.env.MODE === 'development',

  // URL Obfuscation
  urlObfuscation: {
    method: (import.meta.env.VITE_OBFUSCATION_METHOD as 'base64' | 'hash' | 'uuid' | 'custom') || 'custom',
    salt: import.meta.env.VITE_OBFUSCATION_SALT || 'grupodrozainka_2024_salt',
    enabled: true,
  },

  // App Metadata
  app: {
    name: 'Grupo Drozainka C.A',
    version: '1.0.0',
    description: 'Professional Medical Care Platform',
  },

  // Auth Configuration — keys alineadas con AuthService / apiClient
  auth: {
    tokenKey: AUTH_STORAGE_KEYS.token,
    refreshTokenKey: AUTH_STORAGE_KEYS.refreshToken,
    userDataKey: AUTH_STORAGE_KEYS.user,
    sessionTimeout: 60 * 60 * 1000, // 1 hour in milliseconds
    tokenRefreshThreshold: 120, // Refresh token 2 minutes before expiry (in seconds)
  },

  // Pagination
  pagination: {
    defaultPageSize: 12,
    maxPageSize: 50,
  },

  // Cache
  cache: {
    defaultTTL: 5 * 60 * 1000, // 5 minutes
    maxSize: 100,
  },

  // Features flags — alineados con contrato backend / ADR-001 (no habilitar sin API montada)
  features: {
    urlObfuscation: true,
    debugConsole: import.meta.env.MODE === 'development',
    analytics: false,
    /** Crédito retirado del FE en Fase 1; no remontar sin decisión explícita. */
    credit: FRONTEND_PHASE1.creditMountedInFrontend,
    /** Pedidos directos /orders no montados; checkout → cotización. */
    directOrders: FRONTEND_PHASE1.directOrdersMounted,
    /** Checkout y carrito operan sobre cotizaciones. */
    quotesCheckout: FRONTEND_PHASE1.commerceMode === 'quotes',
    paymentGateways: {
      stripe: false,
      paypal: false,
    },
  },

  // UI Configuration
  ui: {
    navbar: {
      scrollThreshold: 100,
      mobileBreakpoint: 1024,
    },
    animations: {
      duration: {
        fast: 200,
        normal: 300,
        slow: 500,
      },
      easing: {
        medical: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
        spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
    },
  },

  // Business Rules
  business: {
    /** 'quotes' = único flujo de compra post–Fase 1 (ADR-001). */
    commerceMode: FRONTEND_PHASE1.commerceMode,
    currency: {
      default: 'VES' as const,
      supported: ['VES', 'USD'] as const,
    },
    shipping: {
      freeThreshold: 25,
      zones: ['CARACAS', 'MARACAY', 'VALENCIA'],
    },
    product: {
      maxQuantity: 10,
      stockThreshold: 5,
    },
  },

  // Contact Information
  contact: {
    phone: '0800-FARMA',
    email: 'info@grupodrozainka.com',
    emergencyLine: '0800-FARMA',
    whatsapp: '+58-XXX-XXX-XXXX',
  },
} as const;

// Type-safe config getter
export const getConfig = <T extends keyof typeof config>(key: T): typeof config[T] => {
  return config[key];
};

// Environment utilities
export const isDev = () => config.isDevelopment;
export const isProd = () => config.isProduction;
export const isDebug = () => config.debug;

// API utilities — DEV usa proxy (origen ''), PROD usa VITE_API_URL
export const getApiUrl = (endpoint: string = '') => {
  if (!endpoint) {
    return getApiOrigin() || config.api.baseUrl;
  }
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return resolveApiUrl(path);
};

// Feature flag utilities
export const isFeatureEnabled = (feature: keyof typeof config.features): boolean => {
  return config.features[feature] as boolean;
};

// Debug logger - solo se ejecuta en desarrollo
export const debugLog = (message: string, ...args: any[]) => {
  if (config.debug) {
    console.log(`[Grupo Drozainka C.A Debug] ${message}`, ...args);
  }
};

export const debugWarn = (message: string, ...args: any[]) => {
  if (config.debug) {
    console.warn(`[Grupo Drozainka C.A Warning] ${message}`, ...args);
  }
};

export const debugError = (message: string, ...args: any[]) => {
  if (config.debug) {
    console.error(`[Grupo Drozainka C.A Error] ${message}`, ...args);
  }
};

export default config; 
