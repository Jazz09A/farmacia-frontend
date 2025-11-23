export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  patology: string;
  price: string; // USD - viene como string del backend
  description: string;
  ingredients: string[];
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
  rating: string; // viene como string del backend
  review_count: number;
  is_offer: boolean;
  original_price: string | null; // USD - viene como string del backend
  offer_end_time: string | null;
  featured: boolean;
  slug: string;
  discount_percentage: string; // viene como string del backend
  current_price: string; // USD - viene como string del backend
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selected_presentation: string | null;
  subtotal: number; // USD
  created_at: string;
  updated_at: string;
}

// Respuesta de la API de productos
export interface ProductsApiResponse {
  products: Product[];
  pagination: Record<string, any>;
  filters_applied: Record<string, any>;
  total: number;
}

// Estructura para crear orden desde el carrito
export interface OrderCreate {
  shipping_address_id: string;
  payment_method: string;
  payment_currency: 'USD' | 'VES';
  payment_capture_url: string;
  customer_notes: string;
}

export interface Cart {
  items: CartItem[];
  total_items: number;
  total_unique_items: number;
  total: number; // USD
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

export type Currency = 'VES' | 'USD';

// 🔥 Flash Offer interfaces - API compliant and extensible
export interface FlashOffer {
  id?: string;
  product_id: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  start_time: string;
  end_time: string;
  max_quantity?: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// 🔥 Flash Offer with populated product data
export interface FlashOfferWithProduct extends FlashOffer {
  product: Product;
  remaining_time?: number; // milliseconds until expiry
  claimed_quantity?: number;
  availability_percentage?: number; // 0-100 based on max_quantity vs claimed
}

// 🔥 Flash Offer creation payload
export interface CreateFlashOfferPayload {
  product_id: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  start_time: string;
  end_time: string;
  max_quantity?: number;
  is_active?: boolean;
}

// 🔥 Flash Offer response from API
export interface FlashOfferResponse {
  flash_offers: FlashOfferWithProduct[];
  total_count: number;
  active_count: number;
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
  unit_price: string; // USD como string del backend
  total_price: string; // USD como string del backend
  selected_presentation: string | null;
  product_name: string;
  product_brand: string;
  product_image: string[];
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
  subtotal: string; // USD como string del backend
  shipping_cost: string; // USD como string del backend
  taxes: string; // USD como string del backend
  total: string; // USD como string del backend
  payment_currency: 'USD' | 'VES';
  exchange_rate: string | null; // tasa usada si pago en VES (como string)
  payment_method: string;
  payment_status: string;
  payment_reference: string | null;
  tracking_number?: string | null;
  estimated_delivery?: string | null;
  delivered_at?: string | null;
  customer_notes?: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  shipping_address: ShippingAddress;
  item_count: number;
  payment_capture_url: string;
  shipping_address_id?: string;
  // Campos adicionales del backend
  is_credit_order: boolean;
  credit_amount: string;
  credit_remaining: string;
  credit_paid_total: string;
  payment_due_date?: string | null;
  credit_paid: boolean;
  credit_payment_date?: string | null;
  quantity_discount?: any | null;
  quantity_discount_amount: string;
  discounts?: any | null;
  original_subtotal?: string | null;
  total_savings: string;
  user: string;
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

// ===== SOURCE SYSTEM INTERFACES =====
export type SourceSystemCustomer = {
  customer_code?: string;
  customer_name: string;
  email?: string | null;
  alternate_email?: string | null;
  rif?: string | null;
  phones?: string | null;
  inactive: boolean;
  is_juridico: boolean;
};

export type SourceSystemCustomerListResponse = {
  customers: SourceSystemCustomer[];
  total: number;
  page: number;
  limit: number;
};

export type CreateUsersFromSourceSystemRequest = {
  customer_codes: string[];
  use_alternate_emails?: boolean;
};

export type UserCreationResult = {
  success: boolean;
  customer_code?: string;
  customer_name?: string;
  email?: string;
  user_id?: string;
  error?: string;
  email_sent?: boolean;
  email_error?: string;
};

export type CreateUsersResponse = {
  total: number;
  successful: UserCreationResult[];
  failed: UserCreationResult[];
  summary: {
    total_attempted: number;
    users_created: number;
    users_failed: number;
    emails_sent: number;
    emails_failed: number;
    success_rate: number;
  };
};

// ===== ARTICLES (PROFIT PLUS) INTERFACES =====

// Flash offer info from ArticleSummary
export interface ArticleFlashOffer {
  id: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  original_price: number;
  offer_price: number;
  discount_percentage: number;
  end_time: string;
  max_quantity?: number;
  remaining_quantity?: number;
}

// ArticleSummary from /api/v1/articles
export interface ArticleSummary {
  co_art: string;
  art_des: string;
  category_code: string | null;
  category_name: string | null;
  price: string; // Decimal as string
  currency: string;
  stock: string; // Decimal as string
  warehouse_code: string | null;
  image_url: string | null;
  has_image: boolean;
  flash_offer?: ArticleFlashOffer | null;
}

// ArticlePriceDetail from article detail
export interface ArticlePriceDetail {
  price_code: string;
  price_name: string | null;
  amount: string; // Decimal as string
  currency: string;
  desde: string | null; // ISO datetime
}

// ArticleStockDetail from article detail
export interface ArticleStockDetail {
  warehouse_code: string;
  warehouse_name: string | null;
  quantity: string; // Decimal as string
}

// ArticleImageResponse from article detail
export interface ArticleImageResponse {
  guid: string;
  url: string;
  description: string | null;
  tip: string | null;
}

// ArticleDetail from /api/v1/articles/{co_art}
export interface ArticleDetail {
  co_art: string;
  art_des: string;
  modelo: string | null;
  ref: string | null;
  category_code: string | null;
  category_name: string | null;
  line_code: string | null;
  sub_line_code: string | null;
  presentation: string | null;
  additional_data: Record<string, any>;
  prices: ArticlePriceDetail[];
  stock_by_warehouse: ArticleStockDetail[];
  images: ArticleImageResponse[];
  flash_offer?: ArticleFlashOffer | null;
}

// Articles API Response from /api/v1/articles
export interface ArticlesApiResponse {
  articles: ArticleSummary[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
  filters_applied: Record<string, any>;
}

// Image Upload Response
export interface ImageUploadResponse {
  success: boolean;
  message: string;
  image_guid: string;
  url: string;
}