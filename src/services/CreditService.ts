import { CREDIT_CONFIG } from '../config/creditConfig';
import {
  CreditInfo,
  CreditOrderData,
  CreditOrderResponse,
  PaymentData,
  Payment,
  CreditDashboard,
  AdminDashboard,
  PaymentApprovalData,
  Client,
  ClientSearchResponse,
  CreditOrder,
  CreditOrdersResponse
} from '../types/credit';
import { validateApiResponse, withErrorHandling } from '../utils/errorHandling';
import { authService } from './AuthService';

class CreditService {
  private baseURL: string;

  constructor() {
    this.baseURL = CREDIT_CONFIG.API_BASE_URL;
  }

  // ===== ENDPOINTS DE USUARIO =====

  /**
   * Obtener información de crédito del usuario
   */
  async getCreditInfo(): Promise<CreditInfo> {
    return withErrorHandling(async () => {
      const url = `${this.baseURL}${CREDIT_CONFIG.ENDPOINTS.CREDIT_INFO}`;
      const response = await authService.authenticatedFetch(url, {
        method: 'GET',
      });

      return validateApiResponse(response);
    }, 'getCreditInfo').then(result => {
      if (result.error) throw result.error;
      return result.data!;
    });
  }

  /**
   * Crear orden con crédito
   */
  async createCreditOrder(orderData: CreditOrderData): Promise<CreditOrderResponse> {
    const response = await authService.authenticatedFetch(`${this.baseURL}${CREDIT_CONFIG.ENDPOINTS.CREATE_CREDIT_ORDER}`, {
      method: 'POST',
      body: JSON.stringify(orderData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error al crear orden de crédito: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Crear pago parcial
   */
  async createPayment(paymentData: PaymentData): Promise<Payment> {
    return withErrorHandling(async () => {
      // Asegurar que el monto sea string para precisión decimal
      const normalizedData = {
        ...paymentData,
        amount: paymentData.amount.toString(),
        payment_currency: paymentData.payment_currency || 'VES',
        payment_method: paymentData.payment_method || 'pago-movil'
      };

      const response = await authService.authenticatedFetch(`${this.baseURL}${CREDIT_CONFIG.ENDPOINTS.CREATE_PAYMENT}`, {
        method: 'POST',
        body: JSON.stringify(normalizedData)
      });

      return validateApiResponse(response);
    }, 'createPayment').then(result => {
      if (result.error) throw result.error;
      return result.data!;
    });
  }

  /**
   * Obtener pagos de una orden específica
   */
  async getOrderPayments(orderId: string): Promise<Payment[]> {
    const response = await authService.authenticatedFetch(`${this.baseURL}${CREDIT_CONFIG.ENDPOINTS.GET_ORDER_PAYMENTS}/${orderId}/payments`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Error al obtener pagos de la orden: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Obtener todos los pagos del usuario
   */
  async getMyPayments(): Promise<Payment[]> {
    const url = `${this.baseURL}${CREDIT_CONFIG.ENDPOINTS.GET_MY_PAYMENTS}`;
    const response = await authService.authenticatedFetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Error al obtener mis pagos: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Obtener dashboard de crédito del usuario
   */
  async getCreditDashboard(): Promise<CreditDashboard> {
    const url = `${this.baseURL}${CREDIT_CONFIG.ENDPOINTS.CREDIT_DASHBOARD}`;
    const response = await authService.authenticatedFetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Error al obtener dashboard de crédito: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Obtener lista de órdenes de crédito del usuario
   */
  async getCreditOrders(page: number = 1, limit: number = 10): Promise<CreditOrdersResponse> {
    const response = await authService.authenticatedFetch(`${this.baseURL}/credit/orders/credit`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Error al obtener órdenes de crédito: ${response.statusText}`);
    }
    // El backend puede devolver un arreglo plano de órdenes o un objeto paginado.
    // Normalizamos para que el frontend siempre reciba CreditOrdersResponse.
    const data = await response.json();
    
    if (Array.isArray(data)) {
      return {
        orders: data as CreditOrder[],
        total: data.length,
        page,
        limit,
        total_pages: 1
      };
    }
    // Si ya viene en el formato esperado, lo retornamos tal cual
    return data as CreditOrdersResponse;
  }

  /**
   * Obtener detalles de una orden de crédito específica
   */
  async getCreditOrderDetails(orderId: string): Promise<CreditOrder> {
    const response = await authService.authenticatedFetch(`${this.baseURL}/credit/orders/${orderId}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Error al obtener detalles de la orden: ${response.statusText}`);
    }

    const data = await response.json();
    
    return data;
  }

  // ===== ENDPOINTS DE ADMINISTRADOR =====

  /**
   * Buscar clientes para asignación de crédito
   */
  async searchClients(query: string, page: number = 1, limit: number = 10): Promise<ClientSearchResponse> {
    const response = await authService.authenticatedFetch(`${this.baseURL}/admin/clients/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Error al buscar clientes: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Obtener todos los clientes
   */
  async getAllClients(): Promise<Client[]> {
    const url = `${this.baseURL}/admin/customers`;
    const response = await authService.authenticatedFetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al obtener clientes: ${response.statusText} -> ${errorText}`);
    }

    const data = await response.json();
    return data;
  }

  /**
   * Obtener detalles de un cliente específico
   */
  async getClientDetails(clientId: string): Promise<Client> {
    const response = await authService.authenticatedFetch(`${this.baseURL}/admin/clients/${clientId}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Error al obtener detalles del cliente: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Asignar crédito a un usuario
   */
  async assignCredit(userId: string, amount: number): Promise<{ message: string }> {
    const response = await authService.authenticatedFetch(`${this.baseURL}${CREDIT_CONFIG.ENDPOINTS.ADMIN_ASSIGN_CREDIT}/${userId}/assign-credit?amount=${amount}`, {
      method: 'POST',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error al asignar crédito: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Obtener pagos pendientes de aprobación
   */
  async getPendingPayments(): Promise<Payment[]> {
    const response = await authService.authenticatedFetch(`${this.baseURL}${CREDIT_CONFIG.ENDPOINTS.ADMIN_PENDING_PAYMENTS}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Error al obtener pagos pendientes: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Obtener todos los pagos con filtros opcionales
   */
  async getAllPayments(filters?: {
    status?: 'all' | 'pending' | 'approved' | 'rejected';
    dateRange?: 'all' | 'today' | 'week' | 'month';
    amountRange?: 'all' | 'low' | 'medium' | 'high';
    searchTerm?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    payments: Payment[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  }> {
    const params = new URLSearchParams();
    
    if (filters?.status && filters.status !== 'all') {
      params.append('status', filters.status);
    }
    if (filters?.dateRange && filters.dateRange !== 'all') {
      params.append('date_range', filters.dateRange);
    }
    if (filters?.amountRange && filters.amountRange !== 'all') {
      params.append('amount_range', filters.amountRange);
    }
    if (filters?.searchTerm && filters.searchTerm.trim()) {
      params.append('search', filters.searchTerm.trim());
    }
    if (filters?.page) {
      params.append('page', filters.page.toString());
    }
    if (filters?.limit) {
      params.append('limit', filters.limit.toString());
    }

    const url = `${this.baseURL}/credit/admin/credit/payments${params.toString() ? `?${params.toString()}` : ''}`;
    
    const response = await authService.authenticatedFetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Error al obtener pagos: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Si el backend devuelve solo un array, normalizamos la respuesta
    if (Array.isArray(data)) {
      return {
        payments: data,
        total: data.length,
        page: filters?.page || 1,
        limit: filters?.limit || 50,
        total_pages: 1
      };
    }

    return data;
  }

  /**
   * Aprobar o rechazar un pago
   */
  async approvePayment(paymentId: string, approvalData: PaymentApprovalData): Promise<{ message: string }> {
    const response = await authService.authenticatedFetch(`${this.baseURL}${CREDIT_CONFIG.ENDPOINTS.ADMIN_APPROVE_PAYMENT}/${paymentId}/approve`, {
      method: 'POST',
      body: JSON.stringify(approvalData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error al procesar pago: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Obtener dashboard de administrador
   */
  async getAdminDashboard(): Promise<AdminDashboard> {
    const url = `${this.baseURL}${CREDIT_CONFIG.ENDPOINTS.ADMIN_CREDIT_DASHBOARD}`;
    const response = await authService.authenticatedFetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error Response:', errorText);
      throw new Error(`Error al obtener dashboard de administrador: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  }

  /**
   * Obtener detalles de un pago específico
   */
  async getPaymentDetails(paymentId: string): Promise<Payment> {
    const response = await authService.authenticatedFetch(`${this.baseURL}${CREDIT_CONFIG.ENDPOINTS.ADMIN_PAYMENT_DETAILS}/${paymentId}/details`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Error al obtener detalles del pago: ${response.statusText}`);
    }

    return response.json();
  }

  // ===== UTILIDADES =====

  /**
   * Subir archivo de captura de pago
   */
  async uploadPaymentCapture(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await authService.authenticatedFetch(`${this.baseURL}/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Error al subir archivo: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Validar si el usuario tiene crédito suficiente
   */
  async validateCreditAvailability(amount: string | number): Promise<boolean> {
    try {
      const creditInfo = await this.getCreditInfo();
      const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
      const availableCredit = parseFloat(creditInfo.available_credit);
      return availableCredit >= numericAmount;
    } catch (error) {
      console.error('Error al validar crédito:', error);
      return false;
    }
  }
}

export default new CreditService();