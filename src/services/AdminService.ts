// 🏥 Servicio para el panel de administración
import { authService } from './AuthService';
import { Order, Customer, CustomerStats } from '../types';
import { exchangeRateService, ExchangeRateData } from './ExchangeRateService';

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
      // Primero obtener el estado actual de la orden para validar
      const orderResponse = await authService.authenticatedFetch(
        `${this.baseUrl}/order/${orderId}`
      );
      
      if (!orderResponse.ok) {
        throw new Error('No se pudo obtener la información de la orden');
      }
      
      const orderData = await orderResponse.json();
      const currentStatus = orderData.status;
      
      // Verificar si la orden está en un estado final
      if (currentStatus === 'delivered' || currentStatus === 'cancelled') {
        throw new Error('No se puede modificar una orden entregada o cancelada');
      }

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

  // 💳 Actualizar estado de pago
  async updatePaymentStatus(orderId: string, paymentStatus: 'completed' | 'failed'): Promise<void> {
    try {
      const response = await authService.authenticatedFetch(
        `${this.baseUrl}/payments/status`,
        {
          method: 'PUT',
          body: JSON.stringify({ 
            order_id: orderId,
            status: paymentStatus 
          })
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error updating payment status: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to update payment status:', error);
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
      
      // Manejar diferentes estructuras de respuesta de la API
      if (Array.isArray(data)) {
        // Si la API devuelve directamente un array de órdenes
        return {
          orders: data,
          total: data.length,
          pages: Math.ceil(data.length / (params?.limit || 20))
        };
      } else if (data.orders && Array.isArray(data.orders)) {
        // Si la API devuelve un objeto con orders, total, pages
        return {
          orders: data.orders,
          total: data.total || data.orders.length,
          pages: data.pages || Math.ceil((data.total || data.orders.length) / (params?.limit || 20))
        };
      } else {
        // Fallback: tratar como array vacío
        return {
          orders: [],
          total: 0,
          pages: 0
        };
      }
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

  // 👥 Obtener lista de clientes
  async getCustomers(): Promise<Customer[]> {
    try {
      const response = await authService.authenticatedFetch(
        `${this.baseUrl}/customers`
      );
      
      if (!response.ok) {
        throw new Error(`Error fetching customers: ${response.status}`);
      }
      
      const data: Customer[] = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      throw error;
    }
  }

  // 📊 Obtener estadísticas de un cliente específico
  async getCustomerStats(userId: string): Promise<CustomerStats> {
    try {
      const response = await authService.authenticatedFetch(
        `${this.baseUrl}/customers/${userId}/stats`
      );
      
      if (!response.ok) {
        throw new Error(`Error fetching customer stats: ${response.status}`);
      }
      
      const data: CustomerStats = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch customer stats:', error);
      throw error;
    }
  }

  // 📦 Carga masiva de productos - Subir archivo para validación
  async bulkUploadProducts(file: File): Promise<BulkUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await authService.authenticatedFetch(
        `${this.baseUrl}/products/bulk-upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
      // console.log(await response.json());
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error uploading file: ${response.status} ${errorData.message}`);
      }
      
      const data: BulkUploadResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to upload products file:', error);
      throw error;
    }
  }

  // 📦 Crear productos masivamente después de validación
  async bulkCreateProducts(products: BulkProduct[]): Promise<BulkCreateResponse> {
    try {
      const response = await authService.authenticatedFetch(
        `${this.baseUrl}/products/bulk-create`,
        {
          method: 'POST',
          body: JSON.stringify(products)
        }
      );
      
      if (!response.ok) {
        throw new Error(`Error creating products: ${response.status}`);
      }
      
      const data: BulkCreateResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to create products:', error);
      throw error;
    }
  }

  // 📦 Crear producto individual
  async createProduct(product: Omit<BulkProduct, 'row_number'>): Promise<any> {
    try {
      const response = await authService.authenticatedFetch(
        `${this.baseUrl}/products`,
        {
          method: 'POST',
          body: JSON.stringify(product)
        }
      );
      
      if (!response.ok) {
        throw new Error(`Error creating product: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to create product:', error);
      throw error;
    }
  }

  // 💱 Obtener tasa de cambio actual
  async getExchangeRate(): Promise<ExchangeRateData> {
    try {
      return await exchangeRateService.getExchangeRate();
    } catch (error) {
      console.error('Failed to get exchange rate:', error);
      throw error;
    }
  }

  // 💱 Actualizar tasa de cambio (forzar refresh)
  async refreshExchangeRate(): Promise<ExchangeRateData> {
    try {
      return await exchangeRateService.getExchangeRate(true);
    } catch (error) {
      console.error('Failed to refresh exchange rate:', error);
      throw error;
    }
  }
}

// Interfaces para carga masiva de productos
export interface BulkUploadResponse {
  total_rows: number;
  valid_products: BulkProduct[];
  validation_errors: ValidationError[];
  processed_count: number;
  error_count: number;
  warnings: string[];
}

export interface BulkProduct {
  name: string;
  price_ves: number;
  price_ref: number;
  description: string;
  brand: string;
  category: string;
  subcategory: string;
  patology: string;
  image: string;
  images: string[];
  ingredients: string[];
  in_stock: boolean;
  stock: number;
  prescription: boolean;
  dosage: string;
  presentation: string;
  laboratorio: string;
  registro_sanitario: string;
  contraindicaciones: string;
  efectos_secundarios: string;
  sku: string;
  featured: boolean;
  is_offer: boolean;
  original_price: number;
  row_number: number;
}

export interface ValidationError {
  row_number: number;
  field: string;
  value: string;
  error_message: string;
}

export interface BulkCreateResponse {
  status: string;
  message: string;
  created_products: any[];
  created_count: number;
  error_count: number;
  errors: string[];
}

export const adminService = new AdminService();
export default adminService;
