// Configuración del sistema de créditos
export const CREDIT_CONFIG = {
  // En desarrollo usamos rutas relativas para aprovechar el proxy de Vite
  // En producción usamos la URL completa
  API_BASE_URL: import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL + '/api/v1' : 'http://localhost:8000/api/v1',
  ENDPOINTS: {
    // Endpoints de usuario
    CREDIT_INFO: '/credit/credit/info',
    CREATE_CREDIT_ORDER: '/credit/orders/credit',
    CREATE_PAYMENT: '/credit/payments',
    GET_ORDER_PAYMENTS: '/credit/orders',
    GET_MY_PAYMENTS: '/credit/payments/my-payments',
    CREDIT_DASHBOARD: '/credit/credit/dashboard',
    
    // Endpoints de administrador
    ADMIN_ASSIGN_CREDIT: '/credit/admin/users',
    ADMIN_PENDING_PAYMENTS: '/credit/admin/credit/payments/pending',
    ADMIN_APPROVE_PAYMENT: '/credit/admin/credit/payments',
    ADMIN_CREDIT_DASHBOARD: '/credit/admin/credit/dashboard',
    ADMIN_PAYMENT_DETAILS: '/credit/admin/payment'
  }
}

// Estados de pago
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
} as const

// Estados de crédito
export const CREDIT_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  INACTIVE: 'inactive'
} as const

// Configuración de validación
export const VALIDATION_RULES = {
  MIN_PAYMENT_AMOUNT: 0.01,
  MAX_PAYMENT_DAYS: 365,
  MIN_PAYMENT_REFERENCE_LENGTH: 3,
  MAX_PAYMENT_REFERENCE_LENGTH: 50
}

// Configuración de UI
export const UI_CONFIG = {
  REFRESH_INTERVAL: 30000, // 30 segundos
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/webp']
}
