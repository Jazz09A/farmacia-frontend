// Hook personalizado para el sistema de crédito según documentación

import { useState, useEffect, useCallback } from 'react';
import { useCredit as useCreditContext } from '../contexts/CreditContext';
import { formatVES, formatUSD, convertVesToUsd, convertUsdToVes } from '../utils/currencyUtils';
import { validatePaymentForm, validateCreditAvailability } from '../utils/creditValidation';
import { handleApiError, getErrorMessage } from '../utils/errorHandling';

export const useCredit = () => {
  const {
    creditInfo,
    dashboardData,
    payments,
    creditOrders,
    loading,
    error,
    refreshCreditInfo,
    refreshDashboard,
    createCreditOrder,
    createPayment,
    getOrderPayments,
    getCreditOrders,
    getCreditOrderDetails,
    clearError
  } = useCreditContext();

  const [exchangeRate, setExchangeRate] = useState<string>('1.0');

  // Formatear montos según moneda
  const formatAmount = useCallback((amount: string | number, currency: 'VES' | 'USD' = 'USD') => {
    const amountStr = typeof amount === 'number' ? amount.toString() : amount;
    
    switch (currency) {
      case 'VES':
        return formatVES(amountStr);
      case 'USD':
        return formatUSD(amountStr);
      default:
        return formatUSD(amountStr);
    }
  }, []);

  // Convertir entre monedas
  const convertAmount = useCallback((amount: string | number, from: 'VES' | 'USD', to: 'VES' | 'USD') => {
    const amountStr = typeof amount === 'number' ? amount.toString() : amount;
    
    if (from === to) return amountStr;
    
    if (from === 'VES' && to === 'USD') {
      return convertVesToUsd(amountStr, exchangeRate);
    }
    
    if (from === 'USD' && to === 'VES') {
      return convertUsdToVes(amountStr, exchangeRate);
    }
    
    return amountStr;
  }, [exchangeRate]);

  // Validar formulario de pago
  const validatePayment = useCallback((formData: any) => {
    return validatePaymentForm(formData);
  }, []);

  // Validar disponibilidad de crédito
  const validateCredit = useCallback((amount: string | number) => {
    return validateCreditAvailability(amount, creditInfo?.available_credit || '0');
  }, [creditInfo]);

  // Crear pago con validación
  const createPaymentWithValidation = useCallback(async (paymentData: any) => {
    try {
      // Validar formulario
      const validation = validatePayment(paymentData);
      if (!validation.isValid) {
        throw new Error(validation.errors[0]?.message || 'Datos de pago inválidos');
      }

      // Validar crédito disponible
      const creditValidation = validateCredit(paymentData.amount);
      if (!creditValidation.isValid) {
        throw new Error(creditValidation.errors[0]?.message || 'Crédito insuficiente');
      }

      // Crear pago
      return await createPayment(paymentData);
    } catch (error) {
      const apiError = handleApiError(error);
      throw new Error(getErrorMessage(apiError));
    }
  }, [validatePayment, validateCredit, createPayment]);

  // Obtener información de crédito formateada
  const getFormattedCreditInfo = useCallback(() => {
    if (!creditInfo) return null;

    return {
      available_credit: {
        raw: creditInfo.available_credit,
        formatted: formatAmount(creditInfo.available_credit, 'USD')
      },
      credit_limit: {
        raw: creditInfo.credit_limit,
        formatted: formatAmount(creditInfo.credit_limit, 'USD')
      },
      credit_status: creditInfo.credit_status,
      usage_percentage: creditInfo.credit_limit !== '0' 
        ? Math.round(((parseFloat(creditInfo.credit_limit) - parseFloat(creditInfo.available_credit)) / parseFloat(creditInfo.credit_limit)) * 100)
        : 0
    };
  }, [creditInfo, formatAmount]);

  // Obtener dashboard formateado
  const getFormattedDashboard = useCallback(() => {
    if (!dashboardData) return null;

    return {
      total_orders: dashboardData.total_orders,
      pending_payments: dashboardData.pending_payments,
      total_credit_used: {
        raw: dashboardData.total_credit_used,
        formatted: formatAmount(dashboardData.total_credit_used, 'USD')
      },
      next_payment_due: dashboardData.next_payment_due ? {
        raw: dashboardData.next_payment_due,
        formatted: formatAmount(dashboardData.next_payment_due, 'USD')
      } : null
    };
  }, [dashboardData, formatAmount]);

  // Obtener órdenes de crédito formateadas
  const getFormattedOrders = useCallback(() => {
    return creditOrders.map(order => ({
      ...order,
      total: {
        raw: order.total,
        formatted: formatAmount(parseFloat(order.total), 'VES')
      },
      total_ref: {
        raw: order.total_ref,
        formatted: formatAmount(parseFloat(order.total_ref), 'USD')
      },
      credit_amount: {
        raw: order.credit_amount,
        formatted: formatAmount(parseFloat(order.credit_amount), 'USD')
      },
      credit_remaining: {
        raw: order.credit_remaining,
        formatted: formatAmount(parseFloat(order.credit_remaining), 'USD')
      },
      credit_paid_total: {
        raw: order.credit_paid_total,
        formatted: formatAmount(parseFloat(order.credit_paid_total), 'USD')
      }
    }));
  }, [creditOrders, formatAmount]);

  // Obtener pagos formateados
  const getFormattedPayments = useCallback(() => {
    return payments.map(payment => ({
      ...payment,
      amount: {
        raw: payment.amount,
        formatted: formatAmount(payment.amount, 'USD')
      },
      amount_ves: payment.amount_ves ? {
        raw: payment.amount_ves,
        formatted: formatAmount(payment.amount_ves, 'VES')
      } : null
    }));
  }, [payments, formatAmount]);

  // Refrescar toda la información
  const refreshAll = useCallback(async () => {
    try {
      await Promise.all([
        refreshCreditInfo(),
        refreshDashboard()
      ]);
    } catch (error) {
      console.error('Error refreshing credit data:', error);
    }
  }, [refreshCreditInfo, refreshDashboard]);

  // Obtener tasa de cambio (simulado por ahora)
  const getExchangeRate = useCallback(() => {
    return exchangeRate;
  }, [exchangeRate]);

  // Establecer tasa de cambio
  const setExchangeRateValue = useCallback((rate: string) => {
    setExchangeRate(rate);
  }, []);

  return {
    // Datos básicos
    creditInfo,
    dashboardData,
    payments,
    creditOrders,
    loading,
    error,
    
    // Datos formateados
    formattedCreditInfo: getFormattedCreditInfo(),
    formattedDashboard: getFormattedDashboard(),
    formattedOrders: getFormattedOrders(),
    formattedPayments: getFormattedPayments(),
    
    // Utilidades de formateo
    formatAmount,
    convertAmount,
    
    // Validaciones
    validatePayment,
    validateCredit,
    
    // Acciones
    refreshCreditInfo,
    refreshDashboard,
    refreshAll,
    createCreditOrder,
    createPayment: createPaymentWithValidation,
    getOrderPayments,
    getCreditOrders,
    getCreditOrderDetails,
    clearError,
    
    // Tasa de cambio
    exchangeRate: getExchangeRate(),
    setExchangeRate: setExchangeRateValue
  };
};
