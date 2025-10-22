// 🎯 Hook optimizado para el dashboard de administración
import { useState, useEffect, useCallback, useRef } from 'react';
import { adminService, DashboardResponse } from '../services/AdminService';
import { useAuth } from '../contexts/AuthContext';

interface DashboardHookState {
  data: DashboardResponse | null;
  loading: boolean;
  error: string | null;
  refreshData: (timeRange?: number) => Promise<void>;
  updateOrderStatus: (orderId: string, newStatus: string) => Promise<void>;
}

export const useAdminDashboard = (initialTimeRange: number = 7): DashboardHookState => {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();
  
  // 🔒 Referencias para prevenir llamadas duplicadas
  const isLoadingRef = useRef(false);
  const currentTimeRangeRef = useRef(initialTimeRange);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 📊 Función para cargar datos del dashboard con protección contra duplicados
  const refreshData = useCallback(async (timeRange: number = initialTimeRange) => {
    if (!isAuthenticated || !user) {
      setData(null);
      setLoading(false);
      return;
    }

    // 🚫 Prevenir llamadas duplicadas
    if (isLoadingRef.current && currentTimeRangeRef.current === timeRange) {
      return;
    }

    // 🛑 Cancelar request anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 🔄 Nuevo controller para esta request
    abortControllerRef.current = new AbortController();
    isLoadingRef.current = true;
    currentTimeRangeRef.current = timeRange;

    setLoading(true);
    setError(null);

    try {
      const dashboardData = await adminService.getDashboardMetrics(timeRange.toString(), abortControllerRef.current.signal);
      setData(dashboardData);
    } catch (err: any) {
      // No mostrar error si fue cancelado
      if (err.name !== 'AbortError') {
        console.error('Error loading dashboard data:', err);
        setError(err.message || 'Error cargando datos del dashboard');
      }
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
      abortControllerRef.current = null;
    }
  }, [isAuthenticated, user, initialTimeRange]);

  // 🔄 Actualizar estado de orden
  const updateOrderStatus = useCallback(async (orderId: string, newStatus: string) => {
    if (!data) return;

    // Buscar la orden para verificar su estado actual
    const currentOrder = data.recent_orders.find(order => order.id === orderId);
    if (!currentOrder) {
      setError('Orden no encontrada');
      return;
    }

    // Verificar si la orden está en un estado final
    if (currentOrder.status === 'delivered' || currentOrder.status === 'cancelled') {
      setError('No se puede modificar una orden entregada o cancelada');
      return;
    }

    try {
      // 🔄 Actualización optimista en el estado local
      setData(prevData => {
        if (!prevData) return prevData;
        
        return {
          ...prevData,
          recent_orders: prevData.recent_orders.map(order =>
            order.id === orderId ? { ...order, status: newStatus } : order
          ),
          // Actualizar contadores de estado si es necesario
          order_status_summary: {
            ...prevData.order_status_summary,
            // Aquí podrías ajustar los contadores según el cambio de estado
          }
        };
      });

      // 🌐 Actualizar en el servidor
      await adminService.updateOrderStatus(orderId, newStatus);
      
      // 🔄 Refrescar datos para asegurar consistencia
      await refreshData();
      
    } catch (err: any) {
      console.error('Error updating order status:', err);
      setError(`Error actualizando orden: ${err.message}`);
      
      // 🔄 Refrescar datos para revertir cambios optimistas en caso de error
      await refreshData();
    }
  }, [data, refreshData]);

  // 🎯 Cargar datos iniciales cuando el usuario esté autenticado
  useEffect(() => {
    if (isAuthenticated && user) {
      refreshData(initialTimeRange);
    } else {
      setData(null);
      setLoading(false);
      setError(null);
    }
  }, [isAuthenticated, user, initialTimeRange]); // Removido refreshData de dependencias para evitar loops

  // 🧹 Limpiar error después de un tiempo
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [error]);

  // 🧹 Cleanup al desmontar el componente
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      isLoadingRef.current = false;
    };
  }, []);

  return {
    data,
    loading,
    error,
    refreshData,
    updateOrderStatus
  };
};

export default useAdminDashboard;
