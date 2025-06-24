// Tipos para el sistema de perfil de usuario

export interface UserProfile {
  id: string;
  email: string;
  user_type: 'natural' | 'juridico';
  is_admin: boolean;
  created_at: string;
  last_login: string;
  profile_data: NaturalProfile | JuridicoProfile;
}

export interface NaturalProfile {
  first_name: string;
  last_name: string;
  cedula: string;
  phone: string;
  birth_date?: string;
  address?: string;
  preferred_currency: 'VES' | 'USD';
  avatar?: string;
}

export interface JuridicoProfile {
  company_name: string;
  rif: string;
  registro_mercantil: string;
  phone: string;
  preferred_currency: 'VES' | 'USD';
  direccion_establecimiento: string;
  representante_legal_nombre: string;
  representante_legal_cedula: string;
  avatar?: string;
  // Contactos adicionales
  dueno_nombre?: string;
  dueno_telefono?: string;
  dueno_email?: string;
  encargado_compra_nombre?: string;
  encargado_compra_telefono?: string;
  encargado_compra_email?: string;
}

// Tipos para pedidos
export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: OrderStatus;
  total: number;
  currency: 'VES' | 'USD';
  items: OrderItem[];
  shipping_address: string;
  payment_method: string;
  created_at: string;
  updated_at: string;
  tracking_info?: TrackingInfo;
  invoice_url?: string;
}

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image: string;
  quantity: number;
  price: number;
  currency: 'VES' | 'USD';
}

export type OrderStatus = 
  | 'pending'           // Pendiente de confirmación
  | 'confirmed'         // Confirmado
  | 'processing'        // En procesamiento
  | 'shipped'           // Enviado
  | 'in_transit'        // En tránsito
  | 'delivered'         // Entregado
  | 'cancelled'         // Cancelado
  | 'refunded';         // Reembolsado

export interface TrackingInfo {
  tracking_number: string;
  carrier: string;
  status: string;
  location: string;
  estimated_delivery: string;
  updates: TrackingUpdate[];
}

export interface TrackingUpdate {
  date: string;
  status: string;
  location: string;
  description: string;
}

// Tipos para promociones
export interface UserPromotion {
  id: string;
  code: string;
  title: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_amount?: number;
  max_discount?: number;
  valid_from: string;
  valid_until: string;
  is_used: boolean;
  used_at?: string;
  applicable_products?: string[];
}

// Tipos para notificaciones
export interface UserNotification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  action_url?: string;
  metadata?: Record<string, any>;
}

export type NotificationType = 
  | 'order_confirmed'
  | 'order_shipped'
  | 'order_delivered'
  | 'promotion_available'
  | 'account_update'
  | 'system_message'
  | 'payment_received'
  | 'low_stock_alert';

// Tipos para soporte
export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'technical' | 'billing' | 'order' | 'general';
  created_at: string;
  updated_at: string;
  responses: SupportResponse[];
}

export interface SupportResponse {
  id: string;
  ticket_id: string;
  sender_type: 'user' | 'admin';
  sender_name: string;
  message: string;
  created_at: string;
  attachments?: string[];
}

// Tipos para formularios de actualización
export interface UpdateProfileForm {
  first_name?: string;
  last_name?: string;
  company_name?: string;
  phone: string;
  address?: string;
  direccion_establecimiento?: string;
  preferred_currency: 'VES' | 'USD';
}

export interface ChangePasswordForm {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface SupportForm {
  subject: string;
  category: string;
  priority: string;
  message: string;
} 