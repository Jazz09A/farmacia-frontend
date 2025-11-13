/* @refresh reset */
import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  ReactNode,
  useCallback,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import CreditService from '../services/CreditService';
import { authService } from '../services/AuthService';
import { queryKeys } from '../hooks/queries/queryKeys';
import {
  CreditContextType,
  CreditOrderData,
  CreditOrderResponse,
  Payment,
  PaymentData,
} from '../types/credit';

const CreditContext = createContext<CreditContextType | undefined>(undefined);

interface CreditProviderProps {
  children: ReactNode;
}

export const CreditProvider: React.FC<CreditProviderProps> = ({ children }) => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runWithSessionValidation = useCallback(async <T,>(action: () => Promise<T>): Promise<T> => {
    const token = authService.getCurrentToken();
    if (!token) {
      throw new Error('No hay sesión activa para completar esta acción.');
    }

    setLoading(true);
    setError(null);

    try {
      return await action();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error en la acción de crédito';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createCreditOrder = useCallback(async (orderData: CreditOrderData): Promise<CreditOrderResponse> => {
    return runWithSessionValidation(async () => {
      const response = await CreditService.createCreditOrder(orderData);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.credit.info }),
        queryClient.invalidateQueries({ queryKey: queryKeys.credit.dashboard }),
        queryClient.invalidateQueries({ queryKey: queryKeys.credit.orders(1, 10) }),
      ]);

      return response;
    });
  }, [queryClient, runWithSessionValidation]);

  const createPayment = useCallback(
    async (paymentData: PaymentData, paymentCaptureFile?: File): Promise<Payment> => {
      return runWithSessionValidation(async () => {
        let finalPaymentData = paymentData;

        if (paymentCaptureFile && paymentCaptureFile.size > 0) {
          const { url } = await CreditService.uploadPaymentCapture(paymentCaptureFile);
          finalPaymentData = { ...paymentData, payment_capture_url: url };
        }

        const payment = await CreditService.createPayment(finalPaymentData);

        await Promise.all([
          queryClient.invalidateQueries({ queryKey: queryKeys.credit.dashboard }),
          queryClient.invalidateQueries({ queryKey: queryKeys.credit.myPayments }),
          queryClient.invalidateQueries({ queryKey: queryKeys.credit.orders(1, 10) }),
        ]);

        return payment;
      });
    },
    [queryClient, runWithSessionValidation]
  );

  const clearError = useCallback(() => setError(null), []);

  const contextValue: CreditContextType = useMemo(
    () => ({
      loading,
      error,
      createCreditOrder,
      createPayment,
      clearError,
    }),
    [clearError, createCreditOrder, createPayment, error, loading]
  );

  return <CreditContext.Provider value={contextValue}>{children}</CreditContext.Provider>;
};

export const useCredit = (): CreditContextType => {
  const context = useContext(CreditContext);
  if (context === undefined) {
    throw new Error('useCredit debe ser usado dentro de un CreditProvider');
  }
  return context;
};

export const useCreditError = () => {
  const { error, clearError } = useCredit();
  return { error, clearError };
};

