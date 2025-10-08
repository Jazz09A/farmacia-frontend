// Utilidades de manejo de errores según documentación

export interface ApiError {
  status: number;
  detail: string;
  field?: string;
}

export interface ErrorResponse {
  detail: string;
  field?: string;
  code?: string;
}

/**
 * Códigos de error comunes según documentación
 */
export const ERROR_CODES = {
  INSUFFICIENT_CREDIT: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION_ERROR: 422,
  SERVER_ERROR: 500
} as const;

/**
 * Mensajes de error por código
 */
export const ERROR_MESSAGES = {
  [ERROR_CODES.INSUFFICIENT_CREDIT]: 'Crédito insuficiente para realizar esta operación',
  [ERROR_CODES.UNAUTHORIZED]: 'Sesión expirada. Por favor, inicia sesión nuevamente',
  [ERROR_CODES.FORBIDDEN]: 'No tienes permisos para realizar esta acción',
  [ERROR_CODES.NOT_FOUND]: 'El recurso solicitado no fue encontrado',
  [ERROR_CODES.VALIDATION_ERROR]: 'Los datos proporcionados no son válidos',
  [ERROR_CODES.SERVER_ERROR]: 'Error interno del servidor. Inténtalo más tarde'
} as const;

/**
 * Manejar error de API
 */
export const handleApiError = (error: any): ApiError => {
  // Si es un error de fetch
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      status: 0,
      detail: 'Error de conexión. Verifica tu conexión a internet'
    };
  }
  
  // Si es un error de respuesta HTTP
  if (error.status) {
    const status = error.status;
    const detail = error.detail || error.message || ERROR_MESSAGES[status as keyof typeof ERROR_MESSAGES] || 'Error desconocido';
    
    return {
      status,
      detail,
      field: error.field
    };
  }
  
  // Si es un error genérico
  return {
    status: 500,
    detail: error.message || 'Error desconocido'
  };
};

/**
 * Obtener mensaje de error amigable
 */
export const getErrorMessage = (error: ApiError): string => {
  // Si hay un mensaje específico del servidor, usarlo
  if (error.detail && error.detail !== 'Error desconocido') {
    return error.detail;
  }
  
  // Usar mensaje por defecto según código de estado
  return ERROR_MESSAGES[error.status as keyof typeof ERROR_MESSAGES] || 'Error inesperado';
};

/**
 * Verificar si el error requiere redirección a login
 */
export const shouldRedirectToLogin = (error: ApiError): boolean => {
  return error.status === ERROR_CODES.UNAUTHORIZED;
};

/**
 * Verificar si el error es de validación
 */
export const isValidationError = (error: ApiError): boolean => {
  return error.status === ERROR_CODES.VALIDATION_ERROR;
};

/**
 * Verificar si el error es de crédito insuficiente
 */
export const isInsufficientCreditError = (error: ApiError): boolean => {
  return error.status === ERROR_CODES.INSUFFICIENT_CREDIT;
};

/**
 * Verificar si el error es de permisos
 */
export const isPermissionError = (error: ApiError): boolean => {
  return error.status === ERROR_CODES.FORBIDDEN;
};

/**
 * Verificar si el error es de recurso no encontrado
 */
export const isNotFoundError = (error: ApiError): boolean => {
  return error.status === ERROR_CODES.NOT_FOUND;
};

/**
 * Verificar si el error es del servidor
 */
export const isServerError = (error: ApiError): boolean => {
  return error.status >= 500;
};

/**
 * Verificar si el error es de conexión
 */
export const isConnectionError = (error: ApiError): boolean => {
  return error.status === 0;
};

/**
 * Obtener acción recomendada según el error
 */
export const getRecommendedAction = (error: ApiError): string => {
  switch (error.status) {
    case ERROR_CODES.INSUFFICIENT_CREDIT:
      return 'Verifica tu saldo de crédito disponible';
    case ERROR_CODES.UNAUTHORIZED:
      return 'Inicia sesión nuevamente';
    case ERROR_CODES.FORBIDDEN:
      return 'Contacta al administrador para obtener permisos';
    case ERROR_CODES.NOT_FOUND:
      return 'Verifica que el recurso existe';
    case ERROR_CODES.VALIDATION_ERROR:
      return 'Revisa los datos del formulario';
    case ERROR_CODES.SERVER_ERROR:
      return 'Inténtalo más tarde o contacta soporte';
    default:
      return 'Contacta soporte técnico';
  }
};

/**
 * Log de errores para debugging
 */
export const logError = (error: ApiError, context?: string): void => {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[ERROR] ${context || 'API Error'}:`, {
      status: error.status,
      detail: error.detail,
      field: error.field,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Crear error personalizado
 */
export const createError = (status: number, detail: string, field?: string): ApiError => {
  return {
    status,
    detail,
    field
  };
};

/**
 * Wrapper para manejo de errores en funciones async
 */
export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  context?: string
): Promise<{ data?: T; error?: ApiError }> => {
  try {
    const data = await operation();
    return { data };
  } catch (error) {
    const apiError = handleApiError(error);
    logError(apiError, context);
    return { error: apiError };
  }
};

/**
 * Retry con backoff exponencial
 */
export const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // No reintentar para errores de cliente (4xx)
      if (error.status >= 400 && error.status < 500) {
        throw error;
      }
      
      // Si es el último intento, lanzar el error
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Esperar antes del siguiente intento
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

/**
 * Validar respuesta de API
 */
export const validateApiResponse = async (response: Response): Promise<any> => {
  if (!response.ok) {
    let errorData: ErrorResponse;
    
    try {
      errorData = await response.json();
    } catch {
      errorData = {
        detail: `HTTP error! status: ${response.status}`
      };
    }
    
    throw createError(
      response.status,
      errorData.detail || `HTTP error! status: ${response.status}`,
      errorData.field
    );
  }
  
  return response.json();
};

