// Hook personalizado para el sistema de crédito según documentación

import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCredit as useCreditContext } from '../contexts/CreditContext';
import {
  useCreditInfoQuery,
  useCreditDashboardQuery,
  useMyPaymentsQuery,
  useCreditOrdersQuery,
} from './queries/useCreditQueries';
import { queryKeys } from './queries/queryKeys';
import creditService from '../services/CreditService';
import { formatVES, formatUSD, convertVesToUsd, convertUsdToVes } from '../utils/currencyUtils';
import { validatePaymentForm, validateCreditAvailability } from '../utils/creditValidation';

export const useCredit = () => {
  const queryClient = useQueryClient();
  const {
    loading,
    error,
    createCreditOrder,
    createPayment,
    clearError
  } = useCreditContext();

  const creditInfoQuery = useCreditInfoQuery();
  const dashboardQuery = useCreditDashboardQuery();
  const paymentsQuery = useMyPaymentsQuery();
  const creditOrdersQuery = useCreditOrdersQuery();

  const [exchangeRate, setExchangeRate] = useState<string>('1.0');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

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
    const validation = validatePaymentForm(formData);
    const errors: Record<string, string> = {};

    if (!validation.isValid) {
      validation.errors.forEach(error => {
        errors[error.field] = error.message;
      });
    }

    setValidationErrors(errors);
    return validation;
  }, []);

  // Validar disponibilidad de crédito
  const validateCredit = useCallback((amount: string | number) => {
    const availableCredit = creditInfoQuery.data?.available_credit ?? '0';
    return validateCreditAvailability(amount, availableCredit);
  }, [creditInfoQuery.data]);

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
      const payment = await createPayment(paymentData);
      setValidationErrors({});
      return payment;
    } catch (error) {
      throw error;
    }
  }, [createPayment, validateCredit, validatePayment]);

  // Obtener información de crédito formateada
  const getFormattedCreditInfo = useCallback(() => {
    const info = creditInfoQuery.data;
    if (!info) return null;

    return {
      available_credit: {
        raw: info.available_credit,
        formatted: formatAmount(info.available_credit, 'USD')
      },
      credit_limit: {
        raw: info.credit_limit,
        formatted: formatAmount(info.credit_limit, 'USD')
      },
      credit_status: info.credit_status,
      usage_percentage: info.credit_limit !== '0' 
        ? Math.round(((parseFloat(info.credit_limit) - parseFloat(info.available_credit)) / parseFloat(info.credit_limit)) * 100)
        : 0
    };
  }, [creditInfoQuery.data, formatAmount]);

  // Obtener dashboard formateado
  const getFormattedDashboard = useCallback(() => {
    const dashboard = dashboardQuery.data;
    if (!dashboard) return null;

    return {
      total_orders: dashboard.total_orders,
      pending_payments: dashboard.pending_payments,
      total_credit_used: {
        raw: dashboard.total_credit_used,
        formatted: formatAmount(dashboard.total_credit_used, 'USD')
      },
      next_payment_due: dashboard.next_payment_due ? {
        raw: dashboard.next_payment_due,
        formatted: formatAmount(dashboard.next_payment_due, 'USD')
      } : null
    };
  }, [dashboardQuery.data, formatAmount]);

  // Obtener órdenes de crédito formateadas
  const getFormattedOrders = useCallback(() => {
    const orders = creditOrdersQuery.data?.orders ?? [];
    return orders.map(order => ({
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
  }, [creditOrdersQuery.data, formatAmount]);

  // Obtener pagos formateados
  const getFormattedPayments = useCallback(() => {
    const payments = paymentsQuery.data ?? [];
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
  }, [paymentsQuery.data, formatAmount]);

  // Refrescar toda la información
  const refreshAll = useCallback(async () => {
    try {
      await Promise.all([
        creditInfoQuery.refetch(),
        dashboardQuery.refetch(),
        paymentsQuery.refetch(),
        creditOrdersQuery.refetch(),
      ]);
    } catch (error) {
      console.error('Error refreshing credit data:', error);
    }
  }, [creditInfoQuery, dashboardQuery, paymentsQuery, creditOrdersQuery]);

  // Obtener tasa de cambio (simulado por ahora)
  const getExchangeRate = useCallback(() => {
    return exchangeRate;
  }, [exchangeRate]);

  // Establecer tasa de cambio
  const setExchangeRateValue = useCallback((rate: string) => {
    setExchangeRate(rate);
  }, []);

  const clearValidationErrors = useCallback(() => setValidationErrors({}), []);
  const getFieldError = useCallback((field: string) => validationErrors[field], [validationErrors]);

  return {
    // Datos básicos
    creditInfo: creditInfoQuery.data ?? null,
    dashboardData: dashboardQuery.data ?? null,
    payments: paymentsQuery.data ?? [],
    creditOrders: creditOrdersQuery.data?.orders ?? [],
    loading: loading || creditInfoQuery.isLoading || dashboardQuery.isLoading || paymentsQuery.isLoading || creditOrdersQuery.isLoading,
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
    refreshCreditInfo: creditInfoQuery.refetch,
    refreshDashboard: dashboardQuery.refetch,
    refreshAll,
    createCreditOrder,
    createPayment: createPaymentWithValidation,
    getOrderPayments: useCallback((orderId: string) => {
      return queryClient.fetchQuery({
        queryKey: queryKeys.credit.orderPayments(orderId),
        queryFn: () => creditService.getOrderPayments(orderId),
      });
    }, [queryClient]),
    getCreditOrders: useCallback((page: number = 1, limit: number = 10) => {
      return queryClient.fetchQuery({
        queryKey: queryKeys.credit.orders(page, limit),
        queryFn: () => creditService.getCreditOrders(page, limit),
      });
    }, [queryClient]),
    getCreditOrderDetails: useCallback((orderId: string) => {
      return queryClient.fetchQuery({
        queryKey: queryKeys.credit.order(orderId),
        queryFn: () => creditService.getCreditOrderDetails(orderId),
      });
    }, [queryClient]),
    clearError,
    clearValidationErrors,
    getFieldError,
    
    // Tasa de cambio
    exchangeRate: getExchangeRate(),
    setExchangeRate: setExchangeRateValue,
    validationErrors,
  };
};
