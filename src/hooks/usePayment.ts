import { useState, useCallback } from 'react';
import { useCredit } from '../contexts/CreditContext';
import { PaymentData, Payment, ValidationResult } from '../types/credit';
import { VALIDATION_RULES, UI_CONFIG } from '../config/creditConfig';
import CreditService from '../services/CreditService';
import { getPaymentMethodCurrency } from '../utils/currencyUtils';
import { validatePaymentAmount } from '../utils/creditValidation';

export const usePayment = () => {
  const { createPayment, getOrderPayments, loading, error } = useCredit();
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [uploadingFile, setUploadingFile] = useState(false);

  // Validar datos del formulario de pago
  const validatePaymentData = useCallback((data: PaymentData, creditRemaining: number, exchangeRate: number = 1): ValidationResult => {
    const errors: Record<string, string> = {};

    // Determinar la moneda del método de pago
    const paymentCurrency = getPaymentMethodCurrency(data.payment_currency || 'pago-movil');
    
    // Mostrar los valores como vienen del API sin conversión
    const creditRemainingInPaymentCurrency = creditRemaining;

    // Validar monto usando la función de validación mejorada
    const amountValidation = validatePaymentAmount(
      data.amount.toString(),
      creditRemainingInPaymentCurrency.toString(),
      data.payment_currency || paymentCurrency,
      paymentCurrency
    );

    if (!amountValidation.isValid) {
      amountValidation.errors.forEach(error => {
        errors[error.field] = error.message;
      });
    }

    // Validar referencia de pago
    if (!data.payment_reference || data.payment_reference.trim().length < VALIDATION_RULES.MIN_PAYMENT_REFERENCE_LENGTH) {
      errors.payment_reference = `La referencia debe tener al menos ${VALIDATION_RULES.MIN_PAYMENT_REFERENCE_LENGTH} caracteres`;
    } else if (data.payment_reference.length > VALIDATION_RULES.MAX_PAYMENT_REFERENCE_LENGTH) {
      errors.payment_reference = `La referencia no puede exceder ${VALIDATION_RULES.MAX_PAYMENT_REFERENCE_LENGTH} caracteres`;
    }

    // Validar URL de captura (opcional pero recomendada)
    if (!data.payment_capture_url) {
      errors.payment_capture_url = 'Se recomienda subir una captura del pago';
    }

    setValidationErrors(errors);

    return {
      isValid: Object.keys(errors).length === 0,
      errors: Object.entries(errors).map(([field, message]) => ({ field, message }))
    };
  }, []);

  // Subir archivo de captura
  const uploadCaptureFile = useCallback(async (file: File): Promise<string> => {
    // Validar tipo de archivo
    if (!UI_CONFIG.ALLOWED_FILE_TYPES.includes(file.type)) {
      throw new Error('Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, WebP)');
    }

    // Validar tamaño de archivo
    if (file.size > UI_CONFIG.MAX_FILE_SIZE) {
      throw new Error(`El archivo es demasiado grande. Tamaño máximo: ${UI_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }

    setUploadingFile(true);
    try {
      const result = await CreditService.uploadPaymentCapture(file);
      return result.url;
    } catch (error) {
      throw error;
    } finally {
      setUploadingFile(false);
    }
  }, []);

  // Crear pago con validación
  const createPaymentWithValidation = useCallback(async (
    data: PaymentData, 
    creditRemaining: number
  ): Promise<Payment> => {
    const validation = validatePaymentData(data, creditRemaining);
    
    if (!validation.isValid) {
      throw new Error('Datos del pago inválidos');
    }

    try {
      const result = await createPayment(data);
      setValidationErrors({});
      return result;
    } catch (error) {
      throw error;
    }
  }, [createPayment, validatePaymentData]);

  // Obtener pagos de una orden
  const getPayments = useCallback(async (orderId: string): Promise<Payment[]> => {
    try {
      const payments = await getOrderPayments(orderId);
      return payments;
    } catch (error) {
      throw error;
    }
  }, [getOrderPayments]);

  // Limpiar errores de validación
  const clearValidationErrors = useCallback(() => {
    setValidationErrors({});
  }, []);

  // Obtener error de un campo específico
  const getFieldError = useCallback((field: string): string | undefined => {
    return validationErrors[field];
  }, [validationErrors]);

  // Formatear monto para mostrar
  const formatAmount = useCallback((amount: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }, []);

  // Calcular monto máximo permitido
  const getMaxAmount = useCallback((creditRemaining: number): number => {
    return Math.min(creditRemaining, 10000); // Límite máximo de $10,000 por pago
  }, []);

  return {
    createPayment: createPaymentWithValidation,
    uploadCaptureFile,
    getPayments,
    validatePaymentData,
    clearValidationErrors,
    getFieldError,
    formatAmount,
    getMaxAmount,
    loading: loading || uploadingFile,
    error,
    validationErrors,
    uploadingFile
  };
};

