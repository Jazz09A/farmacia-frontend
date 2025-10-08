// Utilidades de validación para el sistema de crédito según documentación

import { ValidationError, ValidationResult, PaymentFormData, CreditOrderFormData } from '../types/credit';
import { isValidDecimal, toDecimal } from './currencyUtils';

/**
 * Validar formulario de pago
 */
export const validatePaymentForm = (formData: PaymentFormData): ValidationResult => {
  const errors: ValidationError[] = [];
  
  // Validar monto
  if (!formData.amount || formData.amount.trim() === '') {
    errors.push({
      field: 'amount',
      message: 'El monto es requerido'
    });
  } else if (!isValidDecimal(formData.amount)) {
    errors.push({
      field: 'amount',
      message: 'El monto debe ser un número válido'
    });
  } else if (parseFloat(formData.amount) <= 0) {
    errors.push({
      field: 'amount',
      message: 'El monto debe ser mayor a 0'
    });
  }
  
  // Validar referencia de pago
  if (!formData.payment_reference || formData.payment_reference.trim().length < 5) {
    errors.push({
      field: 'payment_reference',
      message: 'La referencia debe tener al menos 5 caracteres'
    });
  }
  
  // Validar URL de captura (opcional)
  if (formData.payment_capture_url && formData.payment_capture_url.trim() !== '') {
    try {
      new URL(formData.payment_capture_url);
    } catch {
      errors.push({
        field: 'payment_capture_url',
        message: 'La URL del comprobante no es válida'
      });
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validar formulario de orden de crédito
 */
export const validateCreditOrderForm = (formData: CreditOrderFormData): ValidationResult => {
  const errors: ValidationError[] = [];
  
  // Validar dirección de envío
  if (!formData.shipping_address_id || formData.shipping_address_id.trim() === '') {
    errors.push({
      field: 'shipping_address_id',
      message: 'La dirección de envío es requerida'
    });
  }
  
  // Validar días de pago
  if (!formData.payment_due_days || formData.payment_due_days < 1) {
    errors.push({
      field: 'payment_due_days',
      message: 'Los días de pago deben ser al menos 1'
    });
  } else if (formData.payment_due_days > 365) {
    errors.push({
      field: 'payment_due_days',
      message: 'Los días de pago no pueden ser más de 365'
    });
  }
  
  // Validar notas del cliente (opcional)
  if (formData.customer_notes && formData.customer_notes.length > 500) {
    errors.push({
      field: 'customer_notes',
      message: 'Las notas no pueden exceder 500 caracteres'
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validar disponibilidad de crédito
 */
export const validateCreditAvailability = (
  requestedAmount: string,
  availableCredit: string
): ValidationResult => {
  const errors: ValidationError[] = [];
  
  if (!isValidDecimal(requestedAmount)) {
    errors.push({
      field: 'amount',
      message: 'El monto solicitado no es válido'
    });
    return { isValid: false, errors };
  }
  
  if (!isValidDecimal(availableCredit)) {
    errors.push({
      field: 'credit',
      message: 'No se pudo obtener información de crédito disponible'
    });
    return { isValid: false, errors };
  }
  
  const requested = parseFloat(requestedAmount);
  const available = parseFloat(availableCredit);
  
  if (requested > available) {
    errors.push({
      field: 'amount',
      message: `Crédito insuficiente. Disponible: ${available.toFixed(2)} REF, Solicitado: ${requested.toFixed(2)} REF`
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validar monto de pago contra saldo pendiente
 */
export const validatePaymentAmount = (
  paymentAmount: string,
  remainingAmount: string,
  paymentMethodId?: string,
  currency: 'VES' | 'USD' = 'USD'
): ValidationResult => {
  const errors: ValidationError[] = [];
  
  if (!isValidDecimal(paymentAmount)) {
    errors.push({
      field: 'amount',
      message: 'El monto del pago no es válido'
    });
    return { isValid: false, errors };
  }
  
  if (!isValidDecimal(remainingAmount)) {
    errors.push({
      field: 'remaining',
      message: 'No se pudo obtener el saldo pendiente'
    });
    return { isValid: false, errors };
  }
  
  const payment = parseFloat(paymentAmount);
  const remaining = parseFloat(remainingAmount);
  
  if (payment <= 0) {
    errors.push({
      field: 'amount',
      message: 'El monto del pago debe ser mayor a 0'
    });
  }
  
  if (payment > remaining) {
    const currencySymbol = currency === 'VES' ? 'Bs.' : '$';
    errors.push({
      field: 'amount',
      message: `El monto del pago no puede exceder el saldo pendiente. Máximo: ${currencySymbol} ${remaining.toFixed(2)}`
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validar referencia de pago
 */
export const validatePaymentReference = (reference: string): ValidationResult => {
  const errors: ValidationError[] = [];
  
  if (!reference || reference.trim().length < 5) {
    errors.push({
      field: 'payment_reference',
      message: 'La referencia debe tener al menos 5 caracteres'
    });
  }
  
  if (reference.length > 100) {
    errors.push({
      field: 'payment_reference',
      message: 'La referencia no puede exceder 100 caracteres'
    });
  }
  
  // Validar que no contenga caracteres especiales problemáticos
  const invalidChars = /[<>\"'&]/;
  if (invalidChars.test(reference)) {
    errors.push({
      field: 'payment_reference',
      message: 'La referencia contiene caracteres no válidos'
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validar URL de archivo
 */
export const validateFileUrl = (url: string): ValidationResult => {
  const errors: ValidationError[] = [];
  
  if (!url || url.trim() === '') {
    return { isValid: true, errors: [] }; // URL es opcional
  }
  
  try {
    const urlObj = new URL(url);
    
    // Validar que sea HTTP o HTTPS
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      errors.push({
        field: 'payment_capture_url',
        message: 'La URL debe usar protocolo HTTP o HTTPS'
      });
    }
    
    // Validar extensiones de archivo permitidas
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf', '.gif'];
    const hasValidExtension = allowedExtensions.some(ext => 
      urlObj.pathname.toLowerCase().endsWith(ext)
    );
    
    if (!hasValidExtension) {
      errors.push({
        field: 'payment_capture_url',
        message: 'El archivo debe ser una imagen (JPG, PNG, GIF) o PDF'
      });
    }
    
  } catch {
    errors.push({
      field: 'payment_capture_url',
      message: 'La URL no es válida'
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Normalizar datos de formulario
 */
export const normalizeFormData = (formData: any): any => {
  const normalized = { ...formData };
  
  // Normalizar montos a string con 2 decimales
  if (normalized.amount) {
    normalized.amount = toDecimal(normalized.amount);
  }
  
  // Normalizar strings (trim)
  if (normalized.payment_reference) {
    normalized.payment_reference = normalized.payment_reference.trim();
  }
  
  if (normalized.payment_capture_url) {
    normalized.payment_capture_url = normalized.payment_capture_url.trim();
  }
  
  if (normalized.customer_notes) {
    normalized.customer_notes = normalized.customer_notes.trim();
  }
  
  return normalized;
};

/**
 * Obtener mensaje de error por campo
 */
export const getFieldError = (errors: ValidationError[], field: string): string | null => {
  const error = errors.find(e => e.field === field);
  return error ? error.message : null;
};

/**
 * Verificar si hay errores en un campo específico
 */
export const hasFieldError = (errors: ValidationError[], field: string): boolean => {
  return errors.some(e => e.field === field);
};
