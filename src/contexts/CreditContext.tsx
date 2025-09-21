import React, { createContext, useContext, useReducer, useEffect, ReactNode, useCallback, useMemo } from 'react';
import CreditService from '../services/CreditService';
import {
  CreditInfo,
  CreditDashboard,
  Payment,
  CreditOrderData,
  CreditOrderResponse,
  PaymentData,
  CreditContextType,
  CreditOrder,
  CreditOrdersResponse
} from '../types/credit';

// Estados del contexto
interface CreditState {
  loading: boolean;
  creditInfo: CreditInfo | null;
  dashboardData: CreditDashboard | null;
  payments: Payment[];
  creditOrders: CreditOrder[];
  error: string | null;
  lastUpdated: Date | null;
}

// Acciones del reducer
type CreditAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CREDIT_INFO'; payload: CreditInfo | null }
  | { type: 'SET_DASHBOARD_DATA'; payload: CreditDashboard | null }
  | { type: 'SET_PAYMENTS'; payload: Payment[] }
  | { type: 'ADD_PAYMENT'; payload: Payment }
  | { type: 'UPDATE_PAYMENT'; payload: Payment }
  | { type: 'SET_CREDIT_ORDERS'; payload: CreditOrder[] }
  | { type: 'ADD_CREDIT_ORDER'; payload: CreditOrder }
  | { type: 'UPDATE_CREDIT_ORDER'; payload: CreditOrder }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LAST_UPDATED'; payload: Date };

// Estado inicial
const initialState: CreditState = {
  loading: false,
  creditInfo: null,
  dashboardData: null,
  payments: [],
  creditOrders: [],
  error: null,
  lastUpdated: null
};

// Reducer
const creditReducer = (state: CreditState, action: CreditAction): CreditState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_CREDIT_INFO':
      return { ...state, creditInfo: action.payload };
    
    case 'SET_DASHBOARD_DATA':
      return { ...state, dashboardData: action.payload };
    
    case 'SET_PAYMENTS':
      return { ...state, payments: action.payload };
    
    case 'ADD_PAYMENT':
      return { ...state, payments: [...state.payments, action.payload] };
    
    case 'UPDATE_PAYMENT':
      return {
        ...state,
        payments: state.payments.map(payment =>
          payment.id === action.payload.id ? action.payload : payment
        )
      };
    
    case 'SET_CREDIT_ORDERS':
      return { ...state, creditOrders: action.payload };
    
    case 'ADD_CREDIT_ORDER':
      return { ...state, creditOrders: [...state.creditOrders, action.payload] };
    
    case 'UPDATE_CREDIT_ORDER':
      return {
        ...state,
        creditOrders: state.creditOrders.map(order =>
          order.id === action.payload.id ? action.payload : order
        )
      };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    case 'SET_LAST_UPDATED':
      return { ...state, lastUpdated: action.payload };
    
    default:
      return state;
  }
};

// Crear contexto
const CreditContext = createContext<CreditContextType | undefined>(undefined);

// Provider del contexto
interface CreditProviderProps {
  children: ReactNode;
}

export const CreditProvider: React.FC<CreditProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(creditReducer, initialState);

  // Función para actualizar información de crédito
  const refreshCreditInfo = useCallback(async (handleLoading = true): Promise<void> => {
    try {
      if (handleLoading) dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const creditInfo = await CreditService.getCreditInfo();
      dispatch({ type: 'SET_CREDIT_INFO', payload: creditInfo });
      dispatch({ type: 'SET_LAST_UPDATED', payload: new Date() });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al obtener información de crédito';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    } finally {
      if (handleLoading) dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Función para actualizar dashboard
  const refreshDashboard = useCallback(async (handleLoading = true): Promise<void> => {
    try {
      if (handleLoading) dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const dashboardData = await CreditService.getCreditDashboard();
      dispatch({ type: 'SET_DASHBOARD_DATA', payload: dashboardData });
      dispatch({ type: 'SET_LAST_UPDATED', payload: new Date() });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al obtener dashboard';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    } finally {
      if (handleLoading) dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Función para crear orden de crédito
  const createCreditOrder = useCallback(async (orderData: CreditOrderData): Promise<CreditOrderResponse> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const result = await CreditService.createCreditOrder(orderData);
      
      // Actualizar información después de crear orden
      await refreshCreditInfo();
      await refreshDashboard();
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear orden de crédito';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [refreshCreditInfo, refreshDashboard]);

  // Función para crear pago (ahora usando Cloudinary directamente)
  const createPayment = useCallback(async (paymentData: PaymentData, paymentCaptureFile?: File): Promise<Payment> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      // Si se proporciona un archivo, subirlo a Cloudinary
      // Si no, asumir que payment_capture_url ya contiene la URL de Cloudinary
      let finalPaymentData = paymentData;
      
      if (paymentCaptureFile && paymentCaptureFile.size > 0) {
        const { url } = await CreditService.uploadPaymentCapture(paymentCaptureFile);
        finalPaymentData = { ...paymentData, payment_capture_url: url };
      }

      const payment = await CreditService.createPayment(finalPaymentData);
      dispatch({ type: 'ADD_PAYMENT', payload: payment });
      
      // Actualizar dashboard después de crear pago
      await refreshDashboard();
      
      return payment;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear pago';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [refreshDashboard]);

  // Función para obtener pagos de una orden
  const getOrderPayments = useCallback(async (orderId: string): Promise<Payment[]> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const payments = await CreditService.getOrderPayments(orderId);
      return payments;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al obtener pagos de la orden';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Función para obtener todos los pagos del usuario
  const getMyPayments = useCallback(async (handleLoading = true): Promise<void> => {
    try {
      if (handleLoading) dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const payments = await CreditService.getMyPayments();
      dispatch({ type: 'SET_PAYMENTS', payload: payments });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al obtener pagos';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    } finally {
      if (handleLoading) dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Función para obtener órdenes de crédito
  const getCreditOrders = useCallback(async (page: number = 1, limit: number = 10): Promise<CreditOrdersResponse> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const response = await CreditService.getCreditOrders(page, limit);
      dispatch({ type: 'SET_CREDIT_ORDERS', payload: response.orders });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al obtener órdenes de crédito';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Función para obtener detalles de una orden de crédito
  const getCreditOrderDetails = useCallback(async (orderId: string): Promise<CreditOrder> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const order = await CreditService.getCreditOrderDetails(orderId);
      return order;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al obtener detalles de la orden';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        await Promise.all([
          refreshCreditInfo(false),
          refreshDashboard(false),
          getMyPayments(false)
        ]);
      } catch (error) {
        // Errors are handled in individual functions, but a general error could be set here if needed.
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
  
    loadInitialData();
  }, [getMyPayments, refreshCreditInfo, refreshDashboard]);

  // Configurar actualización automática
  useEffect(() => {
    const interval = setInterval(() => {
      if (state.lastUpdated) {
        const timeSinceLastUpdate = Date.now() - state.lastUpdated.getTime();
        const fiveMinutes = 5 * 60 * 1000;
        
        if (timeSinceLastUpdate > fiveMinutes) {
          refreshDashboard();
        }
      }
    }, 60000); // Verificar cada minuto

    return () => clearInterval(interval);
  }, [refreshDashboard, state.lastUpdated]);

  const contextValue: CreditContextType = useMemo(() => ({
    loading: state.loading,
    creditInfo: state.creditInfo,
    dashboardData: state.dashboardData,
    payments: state.payments,
    creditOrders: state.creditOrders,
    error: state.error,
    refreshCreditInfo,
    refreshDashboard,
    createCreditOrder,
    createPayment,
    getOrderPayments,
    getCreditOrders,
    getCreditOrderDetails,
    clearError: () => dispatch({ type: 'CLEAR_ERROR' })
  }), [state.loading, state.creditInfo, state.dashboardData, state.payments, state.creditOrders, state.error, refreshCreditInfo, refreshDashboard, createCreditOrder, createPayment, getOrderPayments, getCreditOrders, getCreditOrderDetails]);

  return (
    <CreditContext.Provider value={contextValue}>
      {children}
    </CreditContext.Provider>
  );
};

// Hook para usar el contexto
export const useCredit = (): CreditContextType => {
  const context = useContext(CreditContext);
  if (context === undefined) {
    throw new Error('useCredit debe ser usado dentro de un CreditProvider');
  }
  return context;
};

// Hook para limpiar errores
export const useCreditError = () => {
  const { error, clearError } = useCredit();
  return { error, clearError };
};

