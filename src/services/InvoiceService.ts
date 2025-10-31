import { authService } from './AuthService';
import type {
  DEMOAInvoice,
  DEMOAInvoiceDetails,
  DEMOAInvoiceSummary,
  DEMOAPayment
} from '../types/invoices';

/**
 * Servicio para interactuar con la API de facturas DEMOA
 * Base URL: /api/v1/user/invoices
 */
class InvoiceService {
  private baseUrl = '/api/v1/user/invoices';

  /**
   * Obtiene un resumen estadístico de todas las facturas del usuario
   */
  async getSummary(): Promise<DEMOAInvoiceSummary> {
    const response = await authService.authenticatedFetch(`${this.baseUrl}/summary`);
    
    if (!response.ok) {
      throw new Error('Error al obtener resumen de facturas');
    }
    
    return response.json();
  }

  /**
   * Obtiene todas las facturas del usuario con opción de filtrado
   * @param statusFilter - Filtro por estado: 'pending', 'paid', o 'all'
   */
  async getAllInvoices(statusFilter?: 'pending' | 'paid' | 'all'): Promise<DEMOAInvoice[]> {
    let url = this.baseUrl;
    
    if (statusFilter && statusFilter !== 'all') {
      url += `?status_filter=${statusFilter}`;
    }
    
    const response = await authService.authenticatedFetch(url);
    
    if (!response.ok) {
      throw new Error('Error al obtener facturas');
    }
    
    return response.json();
  }

  /**
   * Obtiene únicamente las facturas con pago pendiente
   */
  async getPendingInvoices(): Promise<DEMOAInvoice[]> {
    const response = await authService.authenticatedFetch(`${this.baseUrl}/pending`);
    
    if (!response.ok) {
      throw new Error('Error al obtener facturas pendientes');
    }
    
    return response.json();
  }

  /**
   * Obtiene únicamente las facturas completamente pagadas
   */
  async getPaidInvoices(): Promise<DEMOAInvoice[]> {
    const response = await authService.authenticatedFetch(`${this.baseUrl}/paid`);
    
    if (!response.ok) {
      throw new Error('Error al obtener facturas pagadas');
    }
    
    return response.json();
  }

  /**
   * Obtiene los detalles completos de una factura específica, incluyendo los items/productos
   * @param invoiceNumber - Número de factura
   */
  async getInvoiceDetails(invoiceNumber: string): Promise<DEMOAInvoiceDetails> {
    const response = await authService.authenticatedFetch(`${this.baseUrl}/${invoiceNumber}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Factura no encontrada');
      }
      throw new Error('Error al obtener detalles de factura');
    }
    
    return response.json();
  }

  /**
   * Obtiene el historial completo de pagos aplicados a facturas
   */
  async getPaymentHistory(): Promise<DEMOAPayment[]> {
    const response = await authService.authenticatedFetch(`${this.baseUrl}/payments`);
    
    if (!response.ok) {
      throw new Error('Error al obtener historial de pagos');
    }
    
    return response.json();
  }
}

export const invoiceService = new InvoiceService();

