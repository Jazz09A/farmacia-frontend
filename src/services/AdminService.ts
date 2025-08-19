// 🏥 Servicio para el panel de administración
import { authService } from './AuthService';
import { Order } from '../types';

export interface DashboardStats {
  total_revenue: number;
  total_orders: number;
  new_customers: number;
  conversion_rate: number;
}

export interface OrderStatusSummary {
  pending: number;
  confirmed: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

export interface RecentOrder {
  id: string;
  customer_name: string;
  date: string;
  total: number;
  status: string;
}

export interface DashboardResponse {
  stats: DashboardStats;
  order_status_summary: OrderStatusSummary;
  recent_orders: RecentOrder[];
}

class AdminService {
  private baseUrl = '/api/v1/admin';

  // 📊 Obtener datos del dashboard
  async getDashboardData(): Promise<DashboardResponse> {
    try {
      const response = await authService.authenticatedFetch(`${this.baseUrl}/dashboard`);
      
      if (!response.ok) {
        throw new Error(`Error fetching dashboard data: ${response.status}`);
      }
      
      const data: DashboardResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      throw error;
    }
  }

  // 📈 Obtener métricas con rango de tiempo
  async getDashboardMetrics(timeRange: string = '7', signal?: AbortSignal): Promise<DashboardResponse> {
    try {
      const response = await authService.authenticatedFetch(
        `${this.baseUrl}/dashboard?time_range=${timeRange}`,
        { signal }
      );
      
      if (!response.ok) {
        throw new Error(`Error fetching dashboard metrics: ${response.status}`);
      }
      
      const data: DashboardResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch dashboard metrics:', error);
      throw error;
    }
  }

  // 🔄 Actualizar estado de orden
  async updateOrderStatus(orderId: string, newStatus: string): Promise<void> {
    try {
      const response = await authService.authenticatedFetch(
        `${this.baseUrl}/order/${orderId}/status`,
        {
          method: 'PUT',
          body: JSON.stringify({ status: newStatus })
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error updating order status: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
      throw error;
    }
  }

  // 📋 Obtener detalles de una orden específica
  async getOrderDetails(orderId: string): Promise<Order> {
    try {
      const response = await authService.authenticatedFetch(
        `${this.baseUrl}/order/${orderId}`
      );
      
      if (!response.ok) {
        throw new Error(`Error fetching order details: ${response.status}`);
      }
      const responseJson = await response.json();
      console.log('🌐 Order details:', responseJson);
      return responseJson;
      
    } catch (error) {
      console.error('Failed to fetch order details:', error);
      throw error;
    }
  }

  // 📋 Obtener todas las órdenes con filtros y paginación
  async getOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Promise<{ orders: Order[]; total: number; pages: number }> {
    try {
      const searchParams = new URLSearchParams();
      
      if (params?.page) searchParams.append('page', params.page.toString());
      if (params?.limit) searchParams.append('limit', params.limit.toString());
      if (params?.status && params.status !== 'all') searchParams.append('status', params.status);
      if (params?.search) searchParams.append('search', params.search);
      if (params?.sort_by) searchParams.append('sort_by', params.sort_by);
      if (params?.sort_order) searchParams.append('sort_order', params.sort_order);

      const url = `${this.baseUrl}/orders${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      const response = await authService.authenticatedFetch(url);
      
      if (!response.ok) {
        throw new Error(`Error fetching orders: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        orders: data,
        total: data.length, // API should return pagination info
        pages: Math.ceil(data.length / (params?.limit || 20))
      };
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      throw error;
    }
  }

  // 🗑️ Eliminar orden (soft delete)
  async deleteOrder(orderId: string): Promise<void> {
    try {
      const response = await authService.authenticatedFetch(
        `${this.baseUrl}/order/${orderId}`,
        {
          method: 'DELETE'
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error deleting order: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Failed to delete order:', error);
      throw error;
    }
  }

  // 📊 Obtener análiticas avanzadas
  async getAdvancedAnalytics(timeRange: string = 'month'): Promise<any> {
    try {
      const response = await authService.authenticatedFetch(
        `${this.baseUrl}/analytics?time_range=${timeRange}`
      );
      
      if (!response.ok) {
        throw new Error(`Error fetching analytics: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      throw error;
    }
  }
}

export const adminService = new AdminService();
export default adminService;
