import { useState, useCallback } from 'react';
import CreditService from '../services/CreditService';
import { Payment, PaymentApprovalData, AdminDashboard, ValidationResult } from '../types/credit';
import { VALIDATION_RULES } from '../config/creditConfig';

interface PaymentFilters {
  status?: 'all' | 'pending' | 'approved' | 'rejected';
  dateRange?: 'all' | 'today' | 'week' | 'month';
  amountRange?: 'all' | 'low' | 'medium' | 'high';
  searchTerm?: string;
  page?: number;
  limit?: number;
}

interface PaymentsResponse {
  payments: Payment[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export const useAdminCredit = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingPayments, setPendingPayments] = useState<Payment[]>([]);
  const [allPayments, setAllPayments] = useState<PaymentsResponse>({
    payments: [],
    total: 0,
    page: 1,
    limit: 50,
    total_pages: 1
  });
  const [adminDashboard, setAdminDashboard] = useState<AdminDashboard | null>(null);

  // Limpiar errores
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Obtener pagos pendientes
  const getPendingPayments = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const payments = await CreditService.getPendingPayments();
      setPendingPayments(payments);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener pagos pendientes';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener todos los pagos con filtros
  const getAllPayments = useCallback(async (filters?: PaymentFilters): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await CreditService.getAllPayments(filters);
      setAllPayments(response);
      
      // También actualizar pendingPayments si no hay filtros específicos
      if (!filters || filters.status === 'all' || filters.status === 'pending') {
        const pendingOnly = response.payments.filter(p => p.status === 'pending');
        setPendingPayments(pendingOnly);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener pagos';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener dashboard de administrador
  const getAdminDashboard = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const dashboard = await CreditService.getAdminDashboard();
      setAdminDashboard(dashboard);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener dashboard de administrador';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Asignar crédito a un usuario
  const assignCredit = useCallback(async (userId: string, amount: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      // Validar datos
      if (!userId || userId.trim() === '') {
        throw new Error('ID de usuario requerido');
      }
      
      if (amount <= 0) {
        throw new Error('El monto debe ser mayor a 0');
      }
      
      if (amount > 100000) {
        throw new Error('El monto no puede exceder $100,000');
      }
      
      await CreditService.assignCredit(userId, amount);
      
      // Actualizar dashboard después de asignar crédito
      await getAdminDashboard();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al asignar crédito';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getAdminDashboard]);

  // Aprobar pago
  const approvePayment = useCallback(async (paymentId: string, adminNotes?: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const approvalData: PaymentApprovalData = {
        payment_id: paymentId,
        action: 'approve',
        admin_notes: adminNotes
      };
      
      await CreditService.approvePayment(paymentId, approvalData);
      
      // Actualizar lista de pagos pendientes
      await getPendingPayments();
      await getAdminDashboard();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al aprobar pago';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getPendingPayments, getAdminDashboard]);

  // Rechazar pago
  const rejectPayment = useCallback(async (paymentId: string, adminNotes: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      if (!adminNotes || adminNotes.trim() === '') {
        throw new Error('Debe proporcionar un motivo para el rechazo');
      }
      
      const approvalData: PaymentApprovalData = {
        payment_id: paymentId,
        action: 'reject',
        admin_notes: adminNotes
      };
      
      await CreditService.approvePayment(paymentId, approvalData);
      
      // Actualizar lista de pagos pendientes
      await getPendingPayments();
      await getAdminDashboard();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al rechazar pago';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getPendingPayments, getAdminDashboard]);

  // Obtener detalles de un pago
  const getPaymentDetails = useCallback(async (paymentId: string): Promise<Payment> => {
    try {
      setLoading(true);
      setError(null);
      
      const payment = await CreditService.getPaymentDetails(paymentId);
      return payment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener detalles del pago';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Validar datos de asignación de crédito
  const validateCreditAssignment = useCallback((userId: string, amount: number): ValidationResult => {
    const errors: Array<{ field: string; message: string }> = [];

    if (!userId || userId.trim() === '') {
      errors.push({ field: 'userId', message: 'ID de usuario requerido' });
    }

    if (amount <= 0) {
      errors.push({ field: 'amount', message: 'El monto debe ser mayor a 0' });
    }

    if (amount > 100000) {
      errors.push({ field: 'amount', message: 'El monto no puede exceder $100,000' });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  // Formatear monto para mostrar
  const formatAmount = useCallback((amount: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }, []);

  // Obtener estadísticas de pagos
  const getPaymentStats = useCallback(() => {
    if (!adminDashboard) {
      return {
        pendingCount: 0,
        approvedToday: 0,
        totalPendingAmount: 0,
        ordersWithPending: 0
      };
    }

    return {
      pendingCount: adminDashboard.pending_payments,
      approvedToday: adminDashboard.approved_today,
      totalPendingAmount: adminDashboard.total_pending_amount,
      ordersWithPending: adminDashboard.orders_with_pending
    };
  }, [adminDashboard]);

  return {
    loading,
    error,
    pendingPayments,
    allPayments,
    adminDashboard,
    clearError,
    getPendingPayments,
    getAllPayments,
    getAdminDashboard,
    assignCredit,
    approvePayment,
    rejectPayment,
    getPaymentDetails,
    validateCreditAssignment,
    formatAmount,
    getPaymentStats
  };
};

