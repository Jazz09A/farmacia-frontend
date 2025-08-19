// 🎯 Hook optimizado para gestión de órdenes
import { useState, useEffect, useCallback, useRef } from 'react';
import { adminService } from '../services/AdminService';
import { Order } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface OrdersHookState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  total: number;
  pages: number;
  currentPage: number;
  filters: OrderFilters;
  refreshOrders: () => Promise<void>;
  updateOrderStatus: (orderId: string, newStatus: string) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  setFilters: (filters: Partial<OrderFilters>) => void;
  setPage: (page: number) => void;
}

interface OrderFilters {
  status: string;
  search: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  limit: number;
}

const defaultFilters: OrderFilters = {
  status: 'all',
  search: '',
  sortBy: 'created_at',
  sortOrder: 'desc',
  limit: 20
};

export const useOrders = (): OrdersHookState => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFiltersState] = useState<OrderFilters>(defaultFilters);
  const { user, isAuthenticated } = useAuth();
  
  // 🔒 Referencias para prevenir llamadas duplicadas
  const isLoadingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 📊 Función para cargar órdenes con protección contra duplicados
  const refreshOrders = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    // 🚫 Prevenir llamadas duplicadas
    if (isLoadingRef.current) {
      return;
    }

    // 🛑 Cancelar request anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 🔄 Nuevo controller para esta request
    abortControllerRef.current = new AbortController();
    isLoadingRef.current = true;

    setLoading(true);
    setError(null);

    try {
      const params = {
        page: currentPage,
        limit: filters.limit,
        status: filters.status,
        search: filters.search,
        sort_by: filters.sortBy,
        sort_order: filters.sortOrder
      };

      const response = await adminService.getOrders(params);
      setOrders(response.orders);
      setTotal(response.total);
      setPages(response.pages);
    } catch (err: any) {
      // No mostrar error si fue cancelado
      if (err.name !== 'AbortError') {
        console.error('Error loading orders:', err);
        setError(err.message || 'Error cargando órdenes');
      }
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
      abortControllerRef.current = null;
    }
  }, [isAuthenticated, user, currentPage, filters]);

  // 🔄 Actualizar estado de orden con actualización optimista
  const updateOrderStatus = useCallback(async (orderId: string, newStatus: string) => {
    const originalOrder = orders.find(o => o.id === orderId);
    if (!originalOrder) return;

    try {
      // 🔄 Actualización optimista en el estado local
      setOrders(prevOrders => 
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );

      // 🌐 Actualizar en el servidor
      await adminService.updateOrderStatus(orderId, newStatus);
      
    } catch (err: any) {
      console.error('Error updating order status:', err);
      setError(`Error actualizando orden: ${err.message}`);
      
      // 🔄 Revertir cambios optimistas en caso de error
      setOrders(prevOrders => 
        prevOrders.map(order =>
          order.id === orderId ? originalOrder : order
        )
      );
    }
  }, [orders]);

  // 🗑️ Eliminar orden
  const deleteOrder = useCallback(async (orderId: string) => {
    const originalOrders = [...orders];

    try {
      // 🔄 Actualización optimista - remover de la lista
      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
      setTotal(prevTotal => prevTotal - 1);

      // 🌐 Eliminar en el servidor
      await adminService.deleteOrder(orderId);
      
    } catch (err: any) {
      console.error('Error deleting order:', err);
      setError(`Error eliminando orden: ${err.message}`);
      
      // 🔄 Revertir cambios optimistas en caso de error
      setOrders(originalOrders);
      setTotal(prevTotal => prevTotal + 1);
    }
  }, [orders]);

  // 🔍 Actualizar filtros
  const setFilters = useCallback((newFilters: Partial<OrderFilters>) => {
    setFiltersState(prevFilters => ({ ...prevFilters, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  // 📄 Cambiar página
  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // 🎯 Cargar órdenes cuando cambian dependencias
  useEffect(() => {
    if (isAuthenticated && user) {
      refreshOrders();
    } else {
      setOrders([]);
      setLoading(false);
      setError(null);
    }
  }, [refreshOrders]);

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
    orders,
    loading,
    error,
    total,
    pages,
    currentPage,
    filters,
    refreshOrders,
    updateOrderStatus,
    deleteOrder,
    setFilters,
    setPage
  };
};

export default useOrders;
