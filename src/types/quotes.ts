// Tipos para el flujo de cotizaciones Profit Plus

export type QuoteDecimal = string; // Montos como string para precisión decimal
export type QuoteDateTime = string; // ISO 8601
export type QuoteCurrency = 'US$' | (string & {}); // preparado para futuras monedas

export type QuoteStatus =
  | 'pending'
  | 'accepted'
  | 'expired'
  | 'cancelled'
  | 'converted';

export interface QuoteCustomerPayload {
  code?: string;
  email: string;
  name: string;
  phone?: string;
}

export type QuoteChannel = 'web_b2b' | (string & {});

export type QuoteDeliveryMode = 'pickup' | 'delivery' | (string & {});

export interface QuoteDeliveryPayload {
  mode: QuoteDeliveryMode;
  address_id?: string;
  notes?: string;
  co_tran?: string;
}

export interface QuoteCreateItemPayload {
  line_number: number;
  product_code: string;
  quantity: number;
}

export interface QuoteCreateRequest {
  customer?: QuoteCustomerPayload;
  channel: QuoteChannel;
  valid_until?: QuoteDateTime;
  currency: QuoteCurrency;
  payment_terms?: string;
  delivery?: QuoteDeliveryPayload;
  direc?: string;
  notes?: string;
  items: QuoteCreateItemPayload[];
}

export interface QuoteCreateResponse {
  quote_id: string;
  profit_plus_id: string;
  status: QuoteStatus;
  currency: QuoteCurrency;
  total_net: QuoteDecimal;
  total_tax: QuoteDecimal;
  total_gross: QuoteDecimal;
  expires_at: QuoteDateTime;
  email_sent_at: QuoteDateTime | null;
}

export interface QuoteSummary {
  quote_id: string;
  profit_plus_id: string;
  status: QuoteStatus;
  created_at: QuoteDateTime;
  expires_at: QuoteDateTime;
  total_gross: QuoteDecimal;
  currency: QuoteCurrency;
  items_count: number;
  email_sent_at: QuoteDateTime | null;
}

export interface QuoteListPagination {
  page: number;
  page_size: number;
  total_pages: number;
  total_items: number;
}

export interface QuoteListResponse {
  results: QuoteSummary[];
  pagination: QuoteListPagination;
}

export interface QuoteDeliveryAddress {
  label?: string;
  line1?: string;
  line2?: string | null;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface QuoteDeliveryInfo {
  mode: QuoteDeliveryMode;
  address?: QuoteDeliveryAddress;
  notes?: string | null;
}

export interface QuoteTotals {
  total_net: QuoteDecimal;
  total_tax: QuoteDecimal;
  total_discount: QuoteDecimal;
  total_gross: QuoteDecimal;
}

export interface QuoteItemDetail {
  line_number: number;
  product_code: string;
  product_name: string;
  quantity: QuoteDecimal;
  unit_price: QuoteDecimal;
  discount_amount: QuoteDecimal;
  tax_amount: QuoteDecimal;
  line_total: QuoteDecimal;
}

export interface QuoteHistoryEntry {
  timestamp: QuoteDateTime;
  event: string;
  detail?: string;
}

export interface QuoteDetailResponse {
  quote_id: string;
  profit_plus_id: string;
  status: QuoteStatus;
  created_at: QuoteDateTime;
  expires_at: QuoteDateTime;
  currency: QuoteCurrency;
  payment_terms?: string;
  delivery?: QuoteDeliveryInfo;
  totals: QuoteTotals;
  items: QuoteItemDetail[];
  history: QuoteHistoryEntry[];
  email_sent_at?: QuoteDateTime | null;
  notes?: string | null;
}

export interface QuoteStatusDescriptor {
  code: QuoteStatus;
  label: string;
  description: string;
}

// ===== TIPOS PARA VALIDACIÓN DE CARRITO =====

export interface CartItemRequest {
  co_art: string;
  cantidad: number;
}

export interface DescuentoInfo {
  co_desc: string;
  porcentaje: number;
  disponibles: number;
  limite_total: number;
}

export interface CartValidationItemResult {
  co_art: string;
  descripcion: string | null;
  cantidad: number;
  precio_unitario_real: QuoteDecimal;
  subtotal: QuoteDecimal;
  descuento: QuoteDecimal;
  impuestos: QuoteDecimal;
  descuento_info: DescuentoInfo | null;
  stock_ok: boolean;
  error: string | null;
}

export interface CartValidationTotals {
  bruto: QuoteDecimal;
  descuento?: QuoteDecimal; // Singular (legacy)
  descuentos?: QuoteDecimal; // Plural (nuevo formato del backend)
  impuestos: QuoteDecimal;
  neto: QuoteDecimal;
}

export interface CartValidationResponse {
  valido: boolean;
  items_verificados: CartValidationItemResult[];
  totales: CartValidationTotals;
}

export interface CartValidationParams {
  price_code?: string;
  warehouse_code?: string;
}

