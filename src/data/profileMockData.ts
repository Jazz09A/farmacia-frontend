// Datos mock para el sistema de perfil de usuario

import type { 
  UserProfile, 
  Order, 
  UserPromotion, 
  UserNotification, 
  SupportTicket,
  JuridicoProfile
} from '../types/profile';


export const mockAdminProfile: UserProfile = {
  id: 'admin_001',
  email: 'admin@grupodrozainka.com',
  user_type: 'juridico',
  is_admin: true,
  created_at: '2024-01-01T09:00:00Z',
  last_login: '2024-12-10T16:45:00Z',
  profile_data: {
    company_name: 'Grupo Drozainka C.A.',
    rif: 'J-30987654-1',
    registro_mercantil: 'RM-2020-005678',
    phone: '+58 212-800-FARMA',
    preferred_currency: 'USD',
    direccion_establecimiento: 'Torre Grupo Drozainka, Piso 15, Av. Francisco de Miranda, Caracas',
    representante_legal_nombre: 'Dr. Roberto Silva',
    representante_legal_cedula: 'V-87654321'
  } as JuridicoProfile
};

// Pedidos mock
export const mockOrders: Order[] = [
  {
    id: 'order_001',
    order_number: 'FP-2024-001234',
    user_id: 'user_001',
    status: 'delivered',
    total: 285.50,
    currency: 'USD',
    items: [
      {
        id: 'item_001',
        product_id: 'prod_001',
        product_name: 'Acetaminofén 500mg - Caja x 100 tabletas',
        product_image: '/images/acetaminofen.jpg',
        quantity: 5,
        price: 12.50,
        currency: 'USD'
      }
    ],
    shipping_address: 'Av. Principal, Centro Comercial Plaza Mayor, Local 15, Caracas',
    payment_method: 'Transferencia Bancaria',
    created_at: '2024-12-01T10:30:00Z',
    updated_at: '2024-12-05T16:20:00Z',
    tracking_info: {
      tracking_number: 'FP001234567890',
      carrier: 'FarmaExpress',
      status: 'Entregado',
      location: 'Caracas, Venezuela',
      estimated_delivery: '2024-12-05T16:00:00Z',
      updates: [
        {
          date: '2024-12-05T16:20:00Z',
          status: 'Entregado',
          location: 'Caracas, Venezuela',
          description: 'Pedido entregado exitosamente - Recibido por: María González'
        },
        {
          date: '2024-12-04T08:45:00Z',
          status: 'En tránsito',
          location: 'Centro de distribución Caracas',
          description: 'El paquete está en camino a su destino'
        },
        {
          date: '2024-12-03T14:30:00Z',
          status: 'Enviado',
          location: 'Centro de distribución Grupo Drozainka',
          description: 'El pedido ha sido enviado'
        },
        {
          date: '2024-12-02T09:15:00Z',
          status: 'En preparación',
          location: 'Centro de distribución Grupo Drozainka',
          description: 'Los productos están siendo empacados'
        },
        {
          date: '2024-12-01T11:00:00Z',
          status: 'Pedido confirmado',
          location: 'Centro de distribución Grupo Drozainka',
          description: 'Su pedido ha sido confirmado y está siendo preparado'
        }
      ]
    },
    invoice_url: '/invoices/FP-2024-001234.pdf'
  }
];

// Promociones activas mock
export const mockPromotions: UserPromotion[] = [
  {
    id: 'promo_001',
    code: 'FARMACIA20',
    title: '20% de descuento en primera compra',
    description: 'Descuento especial del 20% en tu primera compra como farmacia registrada',
    discount_type: 'percentage',
    discount_value: 20,
    min_amount: 100,
    max_discount: 50,
    valid_from: '2024-12-01T00:00:00Z',
    valid_until: '2024-12-31T23:59:59Z',
    is_used: false
  }
];

// Notificaciones mock
export const mockNotifications: UserNotification[] = [
  {
    id: 'notif_001',
    user_id: 'user_001',
    type: 'order_delivered',
    title: 'Pedido entregado exitosamente',
    message: 'Su pedido FP-2024-001234 ha sido entregado. ¡Gracias por su compra!',
    is_read: false,
    created_at: '2024-12-05T16:25:00Z',
    action_url: '/perfil/pedidos/order_001'
  }
];

// Tickets de soporte mock
export const mockSupportTickets: SupportTicket[] = [
  {
    id: 'ticket_001',
    user_id: 'user_001',
    subject: 'Problema con facturación electrónica',
    message: 'Tengo problemas para descargar la factura electrónica del pedido FP-2024-001234.',
    status: 'resolved',
    priority: 'medium',
    category: 'technical',
    created_at: '2024-12-06T10:30:00Z',
    updated_at: '2024-12-06T16:45:00Z',
    responses: []
  }
];

// Estadísticas de usuario mock
export const mockUserStats = {
  total_orders: 12,
  total_spent: 2485.75,
  currency: 'USD' as const,
  average_order_value: 207.15,
  favorite_category: 'Analgésicos',
  member_since: '2024-01-15',
  last_order_date: '2024-12-10',
  loyalty_points: 1580,
  unread_notifications: 3,
  open_tickets: 1
}; 