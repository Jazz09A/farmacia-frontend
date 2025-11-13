import authService from '../AuthService';
import type {
  QuoteCreateRequest,
  QuoteCreateResponse,
  QuoteDetailResponse,
  QuoteListResponse,
  QuoteStatus,
  QuoteStatusDescriptor,
  CartValidationResponse,
  CartItemRequest,
  CartValidationParams,
} from '../../types/quotes';

export interface QuoteListParams {
  status?: QuoteStatus | 'all';
  from_date?: string;
  to_date?: string;
  page?: number;
  page_size?: number;
}

export class QuoteConflictError extends Error {
  public existingQuoteId?: string;

  constructor(message: string, existingQuoteId?: string) {
    super(message);
    this.name = 'QuoteConflictError';
    this.existingQuoteId = existingQuoteId;
  }
}

export class QuoteServiceError extends Error {
  public status: number;
  public payload: any;

  constructor(status: number, message: string, payload?: any) {
    super(message);
    this.name = 'QuoteServiceError';
    this.status = status;
    this.payload = payload;
  }
}

class QuoteService {
  private baseUrl = '/api/v1/quotes/';
  private userQuotesUrl = '/api/v1/user/quotes';
  private sourceSystemHeader = { 'X-Source-System': 'profit_plus' };

  /**
   * Crea una cotización a partir del carrito/checkout
   */
  async createQuote(payload: QuoteCreateRequest): Promise<QuoteCreateResponse> {
    const headers = {
      ...this.sourceSystemHeader,
      'Content-Type': 'application/json',
    };
    
    const response = await authService.authenticatedFetch(this.baseUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (response.status === 409) {
      const body = await this.safeJson(response);
      const existingQuoteId =
        typeof body?.existing_quote_id === 'string' ? body.existing_quote_id : undefined;
      throw new QuoteConflictError(
        body?.detail || 'Ya existe una cotización activa para este pedido.',
        existingQuoteId
      );
    }

    if (!response.ok) {
      await this.handleError(response, 'No se pudo crear la cotización.');
    }

    return response.json();
  }

  /**
   * Obtiene el listado de cotizaciones del usuario autenticado
   */
  async listUserQuotes(params: QuoteListParams = {}): Promise<QuoteListResponse> {
    const query = this.buildQuery(params);
    const response = await authService.authenticatedFetch(
      `${this.userQuotesUrl}${query}`,
      {
        headers: this.sourceSystemHeader,
      }
    );

    if (!response.ok) {
      await this.handleError(response, 'No se pudieron obtener las cotizaciones.');
    }

    return response.json();
  }

  /**
   * Obtiene el detalle completo de una cotización específica
   */
  async getQuoteDetail(quoteId: string): Promise<QuoteDetailResponse> {
    const response = await authService.authenticatedFetch(
      `${this.userQuotesUrl}/${encodeURIComponent(quoteId)}`,
      {
        headers: this.sourceSystemHeader,
      }
    );

    if (!response.ok) {
      await this.handleError(response, 'Error al obtener los detalles de la cotización.');
    }
    const data = await response.json();
    return data;
  }

  /**
   * Obtiene el catálogo de estados disponibles para filtros o badges
   */
  async getQuoteStatuses(): Promise<QuoteStatusDescriptor[]> {
    const response = await authService.authenticatedFetch(
      `${this.userQuotesUrl}/statuses`,
      {
        headers: this.sourceSystemHeader,
      }
    );

    if (!response.ok) {
      await this.handleError(response, 'No se pudieron obtener los estados de cotización.');
    }

    return response.json();
  }

  /**
   * Valida un carrito de compras sin guardar nada en la base de datos.
   * Devuelve información autoritativa (precios reales, stock, impuestos) calculada por el backend.
   * 
   * @param items Array de items con co_art y cantidad
   * @param params Parámetros opcionales (price_code, warehouse_code)
   * @returns Respuesta de validación con datos autoritativos
   */
  async validateCart(
    items: CartItemRequest[],
    params?: CartValidationParams
  ): Promise<CartValidationResponse> {
    // Construir query params si se proporcionan
    const queryParams = new URLSearchParams();
    if (params?.price_code) {
      queryParams.set('price_code', params.price_code);
    }
    if (params?.warehouse_code) {
      queryParams.set('warehouse_code', params.warehouse_code);
    }

    const queryString = queryParams.toString();
    const url = `${this.baseUrl}/verificar${queryString ? `?${queryString}` : ''}`;

    const response = await authService.authenticatedFetch(url, {
      method: 'POST',
      headers: {
        ...this.sourceSystemHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items }),
    });

    if (!response.ok) {
      await this.handleError(
        response,
        'Error al validar el carrito. Por favor, verifica los productos e inténtalo nuevamente.'
      );
    }

    return response.json();
  }

  private buildQuery(params: QuoteListParams): string {
    const searchParams = new URLSearchParams();

    if (params.status && params.status !== 'all') {
      searchParams.set('status', params.status);
    }

    if (params.from_date) {
      searchParams.set('from_date', params.from_date);
    }

    if (params.to_date) {
      searchParams.set('to_date', params.to_date);
    }

    if (typeof params.page === 'number') {
      searchParams.set('page', params.page.toString());
    }

    if (typeof params.page_size === 'number') {
      searchParams.set('page_size', params.page_size.toString());
    }

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  private async handleError(response: Response, fallbackMessage: string): Promise<never> {
    const body = await this.safeJson(response);

    const message =
      typeof body?.detail === 'string'
        ? body.detail
        : fallbackMessage;

    throw new QuoteServiceError(response.status, message, body);
  }

  private async safeJson(response: Response): Promise<any> {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }
}

export const quoteService = new QuoteService();
export default quoteService;

