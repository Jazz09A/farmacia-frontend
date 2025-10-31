// Interfaces para facturas DEMOA según documentación API
// Base URL: /api/v1/user

export interface DEMOAInvoice {
  invoice_number: string;
  emission_date: string; // ISO 8601
  due_date: string | null; // ISO 8601, nullable
  total_amount: string; // Formato decimal como string
  balance: string; // Saldo pendiente
  amount_paid: string; // Monto ya pagado
  currency: string; // Típicamente "Bolívares"
  status: 'pending' | 'paid';
  order_status: 'active' | 'processing' | 'requires_attention';
  is_printed: boolean;
}

export interface DEMOAInvoiceDetails extends DEMOAInvoice {
  items: DEMOAInvoiceItem[];
}

export interface DEMOAInvoiceItem {
  line_number: number;
  product_name: string;
  product_barcode: string | null;
  quantity: string; // Formato decimal como string
  unit_price: string;
  discount_amount: string;
  tax_amount: string;
  line_total: string;
}

export interface DEMOAInvoiceSummary {
  total_invoices: number;
  pending_invoices: number;
  paid_invoices: number;
  total_pending_amount: string; // Formato decimal como string
  total_invoiced: string; // Formato decimal como string
}

export interface DEMOAPayment {
  payment_number: string;
  payment_date: string; // ISO 8601
  total_payment_amount: string; // Formato decimal como string
  invoice_number: string;
  amount_applied: string; // Monto aplicado a esta factura específica
}

