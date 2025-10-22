// Tipos para el sistema de descuentos
export interface QuantityDiscount {
  id: string;
  name: string;
  description?: string;
  min_quantity: number;
  max_quantity?: number;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FlashDiscount {
  id: string;
  product_id: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  discount_amount: number; // Monto aplicado
}

export interface CartDiscounts {
  quantity_discount?: QuantityDiscount;
  quantity_discount_amount: number;
  flash_discounts: { [product_id: string]: number };
  flash_discount_total: number;
  total_discount: number;
  subtotal_after_discounts: number;
}

// Extensión del Cart existente para incluir descuentos
export interface CartWithDiscounts {
  items: import('./index').CartItem[];
  total_items: number;
  total_unique_items: number;
  total: number; // Subtotal original
  discounts: CartDiscounts;
}

export interface CheckoutPreview {
  subtotal: number;
  shipping_cost: number;
  taxes: number;
  total: number;
  payment_currency: 'USD' | 'VES';
  exchange_rate?: number;
  shipping_zone: string;
  shipping_address: import('./index').ShippingAddress;
  
  // Descuentos
  quantity_discount?: QuantityDiscount;
  quantity_discount_amount: number;
  flash_discounts: FlashDiscount[];
  total_discount: number;
  
  // Campos para mostrar precios originales y ahorros
  original_subtotal?: number;
  original_taxes?: number;
  original_total?: number;
  total_savings?: number;
  savings_percentage?: number;
}

// Respuesta de la API para obtener descuento aplicable
export interface ApplicableDiscountResponse {
  id: string;
  name: string;
  min_quantity: number;
  max_quantity?: number;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Payload para crear descuento por cantidad (admin)
export interface CreateQuantityDiscountPayload {
  name: string;
  description?: string;
  min_quantity: number;
  max_quantity?: number;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  priority: number;
  is_active?: boolean;
}

// Respuesta de la API para lista de descuentos
export interface QuantityDiscountsResponse {
  discounts: QuantityDiscount[];
  total: number;
  page: number;
  pages: number;
}

