export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  patology: string;
  price_ves: number;
  price_ref: number;
  description: string;
  ingredients: string[] | null;
  image: string;
  images: string[];
  in_stock: boolean;
  stock: number;
  prescription: boolean;
  dosage: string;
  presentation: string;
  laboratorio: string;
  registro_sanitario: string;
  contraindicaciones: string;
  efectos_secundarios: string;
  rating: number;
  review_count: number;
  is_offer: boolean;
  original_price: number | null;
  offer_end_time: string | null;
  featured: boolean;
  slug: string;
  discount_percentage: number;
  current_price: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selected_presentation: string | null;
  subtotal_ref: number;
  subtotal_ves: number;
  created_at: string;
  updated_at: string;
}

export interface Cart {
  items: CartItem[];
  total_items: number;
  total_unique_items: number;
  total_ves: number;
  total_ref: number;
}

export interface SearchFilters {
  category: string;
  subcategory?: string;
  patology?: string;
  priceRange: [number, number];
  inStock: boolean;
  prescription: boolean;
  rating: number;
  brand?: string;
  sortBy?: 'price' | 'rating' | 'name' | 'popularity';
  sortOrder?: 'asc' | 'desc';
}

export type Currency = 'VES' | 'REF' | 'USD';

export interface FlashOffer {
  id: string;
  productId: string;
  discount: number;
  endTime: Date;
  active: boolean;
}

export interface Brand {
  id: string;
  name: string;
  logo: string;
  featured: boolean;
}

export interface MedicalCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  count: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  data?: string;
  icon: string;
  available: boolean;
  currencies: Currency[];
}

export interface ShippingZone {
  id: string;
  name: string;
  price: number;
  estimatedDays: string;
  available: boolean;
}

export interface OrderStatus {
  id: string;
  name: string;
  description: string;
  color: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: Date;
  verified: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  type: 'juridico';
  phone?: string;
  address?: Address;
  preferences?: UserPreferences;
  createdAt: Date;
}

// 📍 Address para usuarios (diferente a ShippingAddress)
export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode?: string;
  country: string;
  instructions?: string;
}

export interface UserPreferences {
  currency: Currency;
  notifications: {
    email: boolean;
    sms: boolean;
    offers: boolean;
    reminders: boolean;
  };
  medicalConditions?: string[];
}

// 📦 Estructura de Order Item de la API
export interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  selected_presentation: string;
  product_name: string;
  product_brand: string;
  product_image: string;
}

// 🏠 Dirección de envío desde la API
export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  recipient_name: string;
  recipient_phone: string;
  delivery_instructions?: string;
}

// 📋 Orden completa desde la API
export interface Order {
  id: string;
  order_number: string;
  status: string;
  subtotal: number;
  shipping_cost: number;
  taxes: number;
  total: number;
  currency: string;
  payment_method: string;
  payment_status: string;
  payment_reference: string;
  tracking_number?: string;
  estimated_delivery?: string;
  delivered_at?: string;
  customer_notes?: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  shipping_address: ShippingAddress;
  item_count: number;
  payment_capture_url: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: string;
  category: string;
  tags: string[];
  image: string;
  published: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  readTime: number;
}

export interface ProductWithStats extends Product {
  views: number;
  sales: number;
  revenue: number;
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
  last_updated: string;
}

// 👥 Customer interface from API
export interface Customer {
  id: string;
  email: string;
  phone: string;
  is_active: boolean;
  is_verified: boolean;
  role: string;
  created_at: string;
  last_login: string;
  preferred_currency: string;
  user_type: string;
  company_name: string;
  rif: string;
  registro_mercantil: string;
  representante_legal_cedula: string;
  representante_legal_nombre: string;
  representantes_adicionales: string[];
  referencia_comercial_proveedor: string;
  referencia_bancaria: string;
  direccion_establecimiento: string;
  dueno_telefono: string;
  dueno_email: string;
  dueno_cumpleanos: string;
  encargado_compra_telefono: string;
  encargado_compra_email: string;
  encargado_compra_cumpleanos: string;
  encargado_cobranza_telefono: string;
  encargado_cobranza_email: string;
  encargado_cobranza_cumpleanos: string;
  redes_sociales: string;
  pagina_web: string;
  codigo_sicm: string;
  fotos_establecimiento: string[];
}

// 📊 Customer statistics from API
export interface CustomerStats {
  user_info: Customer;
  general_stats: {
    total_orders: number;
    total_spent: number;
    average_order_value: number;
    first_order_date: string;
    last_order_date: string;
    days_as_customer: number;
    order_frequency_days: number;
    preferred_payment_method: string;
    most_used_shipping_zone: string;
  };
  top_purchased_products: {
    product_id: string;
    product_name: string;
    product_brand: string;
    total_quantity: number;
    times_purchased: number;
    total_spent: number;
    last_purchase_date: string;
    average_quantity_per_order: number;
  }[];
  order_status_distribution: {
    status: string;
    count: number;
    percentage: number;
  }[];
  monthly_stats: {
    month: string;
    order_count: number;
    total_spent: number;
    total_items: number;
  }[];
  favorite_categories: Record<string, any>[];
  purchase_trends: Record<string, any>;
}