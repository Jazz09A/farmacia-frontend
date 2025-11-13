// Tipos para el sistema de créditos

// Tipos base según documentación
export type Decimal = string; // Siempre como string para precisión
export type DateTime = string; // ISO 8601 format
export type Currency = 'VES' | 'USD';
export type PaymentStatus = 'pending' | 'approved' | 'rejected';
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type CreditStatus = 'active' | 'suspended' | 'blocked';

export interface CreditInfo {
  available_credit: Decimal;    // Crédito disponible en USD
  credit_limit: Decimal;        // Límite de crédito en USD
  credit_status: CreditStatus;  // Estado del crédito
}

export interface CreditOrderData {
  shipping_address_id: string;
  payment_due_days: number;
  customer_notes?: string;
}

export interface CreditOrderResponse {
  message: string;
  order_id: string;
  order_number: string;
  total: Decimal;
  credit_remaining: Decimal;
}

// Interfaces de dirección y items según documentación
export interface CreditOrderAddress {
  full_name: string;                   // Nombre completo
  phone: string;                       // Teléfono
  address_line_1: string;              // Dirección línea 1
  address_line_2?: string;             // Dirección línea 2
  city: string;                        // Ciudad
  state: string;                       // Estado
  postal_code?: string;                // Código postal
  country: string;                     // País
}

export interface CreditOrderItem {
  id: string;                          // ID del item
  product_id: string;                  // ID del producto
  product_name: string;                // Nombre del producto
  product_brand: string;               // Marca del producto
  product_image?: string;              // URL de la imagen
  quantity: number;                    // Cantidad
  unit_price: string;                  // Precio unitario en USD (string)
  total_price: string;                 // Precio total en USD (string)
  selected_presentation: string;       // Presentación seleccionada
}

// Interfaz principal de orden de crédito según documentación
export interface CreditOrderResponse {
  id: string;                          // ID de la orden
  order_number: string;                // Número de orden
  status: OrderStatus;                 // Estado de la orden
  total: string;                       // Total en USD (string)
  payment_currency: Currency;          // Moneda del pago ('USD' | 'VES')
  exchange_rate: string | null;        // Tasa usada si pagó en VES
  created_at: DateTime;                // Fecha de creación
  updated_at: DateTime;                // Fecha de actualización
  
  // Información específica de crédito
  credit_amount: string;               // Monto del crédito en USD (string)
  credit_remaining: string;            // Saldo pendiente en USD (string)
  credit_paid_total: string;           // Total pagado en USD (string)
  payment_due_date?: DateTime;         // Fecha límite de pago
  credit_paid: boolean;                // Si está completamente pagado
  credit_payment_date?: DateTime;      // Fecha de pago completo
  
  // Información de pago
  payment_status: string;              // Estado del pago
  payment_method: string;              // Método de pago ('credit')
  
  // Items y dirección
  items: CreditOrderItem[];            // Items de la orden
  shipping_address?: CreditOrderAddress; // Dirección de envío
  credit_payments: CreditPaymentResponse[]; // Pagos realizados
  
  // Información adicional
  item_count: number;                  // Cantidad de items
  customer_notes?: string;             // Notas del cliente
  tracking_number?: string;            // Número de seguimiento
  estimated_delivery?: DateTime;       // Entrega estimada
  delivered_at?: DateTime;             // Fecha de entrega
}

// Mantener compatibilidad con interfaz existente
export interface CreditOrder extends CreditOrderResponse {}

export interface CreditOrdersResponse {
  orders: CreditOrder[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface CreditPaymentCreate {
  order_id: string;                    // ID de la orden
  amount: Decimal;                     // Monto del pago
  payment_currency?: Currency;         // Moneda del pago ('USD' | 'VES')
  payment_method?: string;             // Método de pago seleccionado
  payment_reference: string;           // Referencia del pago
  payment_capture_url?: string;        // URL de captura/comprobante
}

export interface CreditPaymentResponse {
  id: string;                          // ID del pago
  order_id: string;                    // ID de la orden
  amount: Decimal;                     // Monto principal en USD
  payment_currency: Currency;          // Moneda del pago recibido
  exchange_rate_used?: Decimal;        // Tasa del día del pago si VES
  payment_reference: string;           // Referencia del pago
  payment_capture_url?: string;        // URL del comprobante
  status: PaymentStatus;               // Estado del pago
  created_at: DateTime;                // Fecha de creación
  approved_at?: DateTime;              // Fecha de aprobación
  admin_notes?: string;                // Notas del administrador
}

// Mantener compatibilidad con interfaces existentes
export interface PaymentData extends CreditPaymentCreate {}
export interface Payment extends CreditPaymentResponse {}

export interface CreditDashboard {
  total_orders: number;               // Total de órdenes de crédito
  pending_payments: number;           // Pagos pendientes
  total_credit_used: Decimal;         // Crédito total usado
  next_payment_due?: Decimal;         // Próximo pago vencimiento
}

export interface AdminDashboard {
  pending_payments: number;
  approved_today: number;
  total_pending_amount: number;
  orders_with_pending: number;
}

export interface PaymentApprovalData {
  payment_id: string;
  action: 'approve' | 'reject';
  admin_notes?: string;
}

export interface CreditAssignmentData {
  user_id: string;
  amount: number;
}

// Tipos para clientes
export interface Client {
  id: string;
  company_name: string;
  email: string;
  phone?: string;
  rif?: string;
  user_type: 'juridico' | 'natural';
  is_active: boolean;
  created_at: string;
  last_login?: string;
  credit_info?: {
    available_credit: number;
    credit_limit: number;
    credit_status: 'active' | 'suspended' | 'inactive';
  };
}

export interface ClientSearchResponse {
  clients: Client[];
  total: number;
  page: number;
  limit: number;
}

// Tipos para formularios
export interface CreditOrderFormData {
  shipping_address_id: string;
  payment_due_days: number;
  customer_notes: string;
}

export interface PaymentFormData {
  amount: Decimal;
  currency?: Currency;
  payment_method?: string;
  payment_reference: string;
  payment_capture_url: string;
}

// Tipos para validación
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Tipos para contexto
export interface CreditContextType {
  loading: boolean;
  error: string | null;
  createCreditOrder: (data: CreditOrderData) => Promise<CreditOrderResponse>;
  createPayment: (data: PaymentData, paymentCaptureFile?: File) => Promise<Payment>;
  clearError: () => void;
}

