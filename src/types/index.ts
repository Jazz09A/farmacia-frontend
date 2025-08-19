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

export type Currency = 'VES' | 'REF';

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