// Configuración centralizada de la aplicación
export const config = {
  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
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
    name: 'Grupo Drozainka',
    version: '1.0.0',
    description: 'Professional Medical Care Platform',
  },

  // Auth Configuration
  auth: {
    tokenKey: 'access_token',
    refreshTokenKey: 'refresh_token',
    userDataKey: 'user_data',
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

  // Features flags
  features: {
    urlObfuscation: true,
    debugConsole: import.meta.env.MODE === 'development',
    analytics: false,
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

// API utilities
export const getApiUrl = (endpoint: string = '') => {
  const baseUrl = config.api.baseUrl;
  endpoint = endpoint ? `${baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}` : baseUrl;
  console.log('getApiUrl', endpoint);
  return endpoint;
};

// Feature flag utilities
export const isFeatureEnabled = (feature: keyof typeof config.features): boolean => {
  return config.features[feature] as boolean;
};

// Debug logger
export const debugLog = (message: string, ...args: any[]) => {
  if (config.debug) {
    console.log(`[Grupo Drozainka Debug] ${message}`, ...args);
  }
};

export const debugWarn = (message: string, ...args: any[]) => {
  if (config.debug) {
    console.warn(`[Grupo Drozainka Warning] ${message}`, ...args);
  }
};

export const debugError = (message: string, ...args: any[]) => {
  if (config.debug) {
    console.error(`[Grupo Drozainka Error] ${message}`, ...args);
  }
};

export default config; 