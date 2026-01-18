import { useState, useCallback } from 'react';
import { useCredit } from '../contexts/CreditContext';
import { CreditOrderData, CreditOrderResponse, ValidationResult } from '../types/credit';
import { VALIDATION_RULES } from '../config/creditConfig';

export const useCreditOrder = () => {
  const { createCreditOrder, loading, error } = useCredit();
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Validar datos del formulario de orden
  const validateOrderData = useCallback((data: CreditOrderData): ValidationResult => {
    const errors: Record<string, string> = {};

    // Validar dirección de envío
    if (!data.shipping_address_id || data.shipping_address_id.trim() === '') {
      errors.shipping_address_id = 'Debe seleccionar una dirección de envío';
    }

    // Validar días de pago
    if (data.payment_due_days < 1 || data.payment_due_days > VALIDATION_RULES.MAX_PAYMENT_DAYS) {
      errors.payment_due_days = `Los días de pago deben estar entre 1 y ${VALIDATION_RULES.MAX_PAYMENT_DAYS}`;
    }

    // Validar notas del cliente (opcional pero con límite)
    if (data.customer_notes && data.customer_notes.length > 500) {
      errors.customer_notes = 'Las notas no pueden exceder 500 caracteres';
    }

    setValidationErrors(errors);

    return {
      isValid: Object.keys(errors).length === 0,
      errors: Object.entries(errors).map(([field, message]) => ({ field, message }))
    };
  }, []);

  // Crear orden con validación
  const createOrder = useCallback(async (data: CreditOrderData): Promise<CreditOrderResponse> => {
    const validation = validateOrderData(data);
    
    if (!validation.isValid) {
      throw new Error('Datos de la orden inválidos');
    }

    try {
      const result = await createCreditOrder(data);
      setValidationErrors({});
      return result;
    } catch (error) {
      throw error;
    }
  }, [createCreditOrder, validateOrderData]);

  // Limpiar errores de validación
  const clearValidationErrors = useCallback(() => {
    setValidationErrors({});
  }, []);

  // Obtener error de un campo específico
  const getFieldError = useCallback((field: string): string | undefined => {
    return validationErrors[field];
  }, [validationErrors]);

  return {
    createOrder,
    validateOrderData,
    clearValidationErrors,
    getFieldError,
    loading,
    error,
    validationErrors
  };
};

