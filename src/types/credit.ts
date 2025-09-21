// Tipos para el sistema de créditos

export interface CreditInfo {
  available_credit: number;
  credit_limit: number;
  credit_status: 'active' | 'suspended' | 'inactive';
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
  total: number;
  credit_remaining: number;
}

// Tipos para órdenes de crédito
export interface CreditOrder {
  id: string;
  order_number: string;
  total: number;
  credit_used: number;
  credit_remaining: number;
  status: 'pending' | 'partial_paid' | 'paid' | 'cancelled';
  created_at: string;
  payment_due_date: string;
  customer_notes?: string;
  shipping_address: {
    id: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  items: {
    id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }[];
  payments: Payment[];
}

export interface CreditOrdersResponse {
  orders: CreditOrder[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface PaymentData {
  order_id: string;
  amount: number;
  payment_reference: string;
  payment_capture_url?: string;
}

export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  payment_reference: string;
  payment_capture_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  approved_at?: string;
  admin_notes?: string;
}

export interface CreditDashboard {
  user_credit: CreditInfo;
  orders: {
    total_orders: number;
    total_credit_used: number;
    total_paid: number;
    total_remaining: number;
  };
  payments: {
    pending_count: number;
    pending_amount: number;
    recent_approved: Payment[];
  };
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
  amount: number;
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
  creditInfo: CreditInfo | null;
  dashboardData: CreditDashboard | null;
  payments: Payment[];
  creditOrders: CreditOrder[];
  error: string | null;
  refreshCreditInfo: (handleLoading?: boolean) => Promise<void>;
  refreshDashboard: (handleLoading?: boolean) => Promise<void>;
  createCreditOrder: (data: CreditOrderData) => Promise<CreditOrderResponse>;
  createPayment: (data: PaymentData, paymentCaptureFile: File) => Promise<Payment>;
  getOrderPayments: (orderId: string) => Promise<Payment[]>;
  getCreditOrders: (page?: number, limit?: number) => Promise<CreditOrdersResponse>;
  getCreditOrderDetails: (orderId: string) => Promise<CreditOrder>;
  clearError: () => void;
}

