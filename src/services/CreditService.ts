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
  CreditAssignmentData,
  Client,
  ClientSearchResponse
} from '../types/credit';

class CreditService {
  private baseURL: string;

  constructor() {
    this.baseURL = CREDIT_CONFIG.API_BASE_URL;
  }

  private async getHeaders(): Promise<HeadersInit> {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  private async getAdminHeaders(): Promise<HeadersInit> {
    // For admin operations, we use the same token as regular users
    // since admin users are also regular users with admin role
    const token = localStorage.getItem('auth_token');
    
    console.log('🔍 Debug - Admin Headers:', {
      token: token ? `${token.substring(0, 20)}...` : 'null',
      hasToken: !!token
    });
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // ===== ENDPOINTS DE USUARIO =====

  /**
   * Obtener información de crédito del usuario
   */
  async getCreditInfo(): Promise<CreditInfo> {
    const response = await fetch(`${this.baseURL}${CREDIT_CONFIG.ENDPOINTS.CREDIT_INFO}`, {
      method: 'GET',
      headers: await this.getHeaders()
      
    });

    if (!response.ok) {
      throw new Error(`Error al obtener información de crédito: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Crear orden con crédito
   */
  async createCreditOrder(orderData: CreditOrderData): Promise<CreditOrderResponse> {
    console.log('🔍 Debug - Create Credit Order Request:', orderData);
    const response = await fetch(`${this.baseURL}${CREDIT_CONFIG.ENDPOINTS.CREATE_CREDIT_ORDER}`, {
      method: 'POST',
      headers: await this.getHeaders(),
      body: JSON.stringify(orderData)
    });

    console.log('🔍 Debug - Create Credit Order Response:', response);

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
    const response = await fetch(`${this.baseURL}${CREDIT_CONFIG.ENDPOINTS.CREATE_PAYMENT}`, {
      method: 'POST',
      headers: await this.getHeaders(),
      body: JSON.stringify(paymentData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error al crear pago: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Obtener pagos de una orden específica
   */
  async getOrderPayments(orderId: string): Promise<Payment[]> {
    const response = await fetch(`${this.baseURL}${CREDIT_CONFIG.ENDPOINTS.GET_ORDER_PAYMENTS}/${orderId}/payments`, {
      method: 'GET',
      headers: await this.getHeaders()
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
    const response = await fetch(`${this.baseURL}${CREDIT_CONFIG.ENDPOINTS.GET_MY_PAYMENTS}`, {
      method: 'GET',
      headers: await this.getHeaders()
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
    const response = await fetch(`${this.baseURL}${CREDIT_CONFIG.ENDPOINTS.CREDIT_DASHBOARD}`, {
      method: 'GET',
      headers: await this.getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Error al obtener dashboard de crédito: ${response.statusText}`);
    }

    return response.json();
  }

  // ===== ENDPOINTS DE ADMINISTRADOR =====

  /**
   * Buscar clientes para asignación de crédito
   */
  async searchClients(query: string, page: number = 1, limit: number = 10): Promise<ClientSearchResponse> {
    const response = await fetch(`${this.baseURL}/admin/clients/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: await this.getAdminHeaders()
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
    const headers = await this.getAdminHeaders();
    
    console.log('🔍 Debug - Get All Clients Request:', {
      url,
      headers,
      baseURL: this.baseURL
    });

    const response = await fetch(url, {
      method: 'GET',
      headers
    });

    console.log('🔍 Debug - Get All Clients Response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error Response:', errorText);
      throw new Error(`Error al obtener clientes: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ All Clients Data:', data);
    return data;
  }

  /**
   * Obtener detalles de un cliente específico
   */
  async getClientDetails(clientId: string): Promise<Client> {
    const response = await fetch(`${this.baseURL}/admin/clients/${clientId}`, {
      method: 'GET',
      headers: await this.getAdminHeaders()
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
    const response = await fetch(`${this.baseURL}${CREDIT_CONFIG.ENDPOINTS.ADMIN_ASSIGN_CREDIT}/${userId}/assign-credit?amount=${amount}`, {
      method: 'POST',
      headers: await this.getAdminHeaders()
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
    const response = await fetch(`${this.baseURL}${CREDIT_CONFIG.ENDPOINTS.ADMIN_PENDING_PAYMENTS}`, {
      method: 'GET',
      headers: await this.getAdminHeaders()
    });

    if (!response.ok) {
      throw new Error(`Error al obtener pagos pendientes: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Aprobar o rechazar un pago
   */
  async approvePayment(paymentId: string, approvalData: PaymentApprovalData): Promise<{ message: string }> {
    const response = await fetch(`${this.baseURL}${CREDIT_CONFIG.ENDPOINTS.ADMIN_APPROVE_PAYMENT}/${paymentId}/approve`, {
      method: 'POST',
      headers: await this.getAdminHeaders(),
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
    const headers = await this.getAdminHeaders();
    
    console.log('🔍 Debug - Admin Dashboard Request:', {
      url,
      headers,
      baseURL: this.baseURL,
      endpoint: CREDIT_CONFIG.ENDPOINTS.ADMIN_CREDIT_DASHBOARD
    });

    const response = await fetch(url, {
      method: 'GET',
      headers
    });

    console.log('🔍 Debug - Admin Dashboard Response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error Response:', errorText);
      throw new Error(`Error al obtener dashboard de administrador: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Admin Dashboard Data:', data);
    return data;
  }

  /**
   * Obtener detalles de un pago específico
   */
  async getPaymentDetails(paymentId: string): Promise<Payment> {
    const response = await fetch(`${this.baseURL}${CREDIT_CONFIG.ENDPOINTS.ADMIN_PAYMENT_DETAILS}/${paymentId}/details`, {
      method: 'GET',
      headers: await this.getAdminHeaders()
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

    const response = await fetch(`${this.baseURL}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
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
  async validateCreditAvailability(amount: number): Promise<boolean> {
    try {
      const creditInfo = await this.getCreditInfo();
      return creditInfo.available_credit >= amount;
    } catch (error) {
      console.error('Error al validar crédito:', error);
      return false;
    }
  }
}

export default new CreditService();

