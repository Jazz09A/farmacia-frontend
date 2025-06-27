import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Package, 
  Gift, 
  Bell, 
  MessageCircle, 
  Settings, 
  Key,
  Download,
  Clock,
  CheckCircle,
  AlertTriangle,
  Shield,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  Building,
  Calendar
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import type { 
  UserProfile, 
  Order, 
  UserPromotion, 
  UserNotification, 
  SupportTicket,
  JuridicoProfile 
} from '../types/profile';

// Importar datos mock
import { 
  mockUserProfile, 
  mockOrders, 
  mockPromotions, 
  mockNotifications, 
  mockSupportTickets,
  mockUserStats 
} from '../data/profileMockData';

type TabType = 'cuenta' | 'pedidos' | 'promociones' | 'notificaciones' | 'soporte';

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('cuenta');
  const [profile] = useState<UserProfile>(mockUserProfile);
  const [orders] = useState<Order[]>(mockOrders);
  const [promotions] = useState<UserPromotion[]>(mockPromotions);
  const [notifications] = useState<UserNotification[]>(mockNotifications);
  const [supportTickets] = useState<SupportTicket[]>(mockSupportTickets);
  const { user } = useAuth();

  const tabs = [
    { id: 'cuenta', label: 'Mi Cuenta', icon: User, count: null },
    { id: 'pedidos', label: 'Pedidos', icon: Package, count: orders.length },
    { id: 'promociones', label: 'Promociones', icon: Gift, count: promotions.filter(p => !p.is_used).length },
    { id: 'notificaciones', label: 'Notificaciones', icon: Bell, count: notifications.filter(n => !n.is_read).length },
    { id: 'soporte', label: 'Soporte', icon: MessageCircle, count: supportTickets.filter(t => t.status === 'open').length }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-VE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number, currency: 'VES' | 'USD') => {
    const formatters = {
      USD: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
      VES: new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' })
    };
    return formatters[currency].format(amount);
  };

  return (
    <div className="min-h-screen bg-medical-gray-50 pt-32 pb-16">
      <div className="medical-container">
        {/* Header del perfil */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-soft p-8 mb-8"
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
            {/* Avatar y info básica */}
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-medical-blue-gradient rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {profile.user_type === 'juridico' 
                  ? (profile.profile_data as JuridicoProfile).company_name.charAt(0)
                  : 'U'
                }
              </div>
              <div>
                <h1 className="text-2xl font-bold text-medical-gray-900">
                  {profile.user_type === 'juridico' 
                    ? (profile.profile_data as JuridicoProfile).company_name
                    : 'Usuario'
                  }
                </h1>
                <p className="text-medical-gray-600">{profile.email}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm text-medical-gray-500">
                    Miembro desde {formatDate(profile.created_at)}
                  </span>
                  {profile.is_admin && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                      Administrador
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Estadísticas rápidas */}
            <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4 lg:ml-8">
              <div className="text-center p-4 bg-medical-blue-50 rounded-xl">
                <div className="text-2xl font-bold text-medical-blue-700">{mockUserStats.total_orders}</div>
                <div className="text-sm text-medical-gray-600">Pedidos</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <div className="text-2xl font-bold text-green-700">
                  {formatCurrency(mockUserStats.total_spent, mockUserStats.currency)}
                </div>
                <div className="text-sm text-medical-gray-600">Total gastado</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <div className="text-2xl font-bold text-purple-700">{mockUserStats.loyalty_points}</div>
                <div className="text-sm text-medical-gray-600">Puntos</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-xl">
                <div className="text-2xl font-bold text-orange-700">{mockUserStats.unread_notifications}</div>
                <div className="text-sm text-medical-gray-600">Notificaciones</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Navegación por pestañas */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-soft mb-8 overflow-hidden"
        >
          <div className="flex flex-wrap border-b border-medical-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-3 px-6 py-4 font-medium transition-all relative ${
                  activeTab === tab.id
                    ? 'text-medical-blue-700 bg-medical-blue-50'
                    : 'text-medical-gray-600 hover:text-medical-gray-900 hover:bg-medical-gray-50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
                {tab.count !== null && tab.count > 0 && (
                  <span className="bg-medical-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                    {tab.count}
                  </span>
                )}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-medical-blue-600"
                  />
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Contenido de las pestañas */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'cuenta' && <AccountSection profile={profile} />}
            {activeTab === 'pedidos' && <OrdersSection orders={orders} />}
            {activeTab === 'promociones' && <PromotionsSection promotions={promotions} />}
            {activeTab === 'notificaciones' && <NotificationsSection notifications={notifications} />}
            {activeTab === 'soporte' && <SupportSection tickets={supportTickets} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

// Componente para la sección de cuenta
const AccountSection: React.FC<{ profile: UserProfile }> = ({ profile }) => {
  const profileData = profile.profile_data as JuridicoProfile;

  return (
    <div className="space-y-8">
      {/* Información de la cuenta */}
      <div className="bg-white rounded-2xl shadow-soft p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-medical-gray-900 flex items-center gap-2">
            <User className="w-5 h-5" />
            Información de la Cuenta
          </h2>
          <button className="btn-medical-secondary">
            <Settings className="w-4 h-4" />
            Editar
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-medical-gray-50 rounded-xl">
              <Building className="w-5 h-5 text-medical-gray-500" />
              <div>
                <div className="text-sm text-medical-gray-500">Empresa</div>
                <div className="font-semibold">{profileData.company_name}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-medical-gray-50 rounded-xl">
              <Mail className="w-5 h-5 text-medical-gray-500" />
              <div>
                <div className="text-sm text-medical-gray-500">Email</div>
                <div className="font-semibold">{profile.email}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-medical-gray-50 rounded-xl">
              <Phone className="w-5 h-5 text-medical-gray-500" />
              <div>
                <div className="text-sm text-medical-gray-500">Teléfono</div>
                <div className="font-semibold">{profileData.phone}</div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-medical-gray-50 rounded-xl">
              <CreditCard className="w-5 h-5 text-medical-gray-500" />
              <div>
                <div className="text-sm text-medical-gray-500">RIF</div>
                <div className="font-semibold">{profileData.rif}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-medical-gray-50 rounded-xl">
              <Shield className="w-5 h-5 text-medical-gray-500" />
              <div>
                <div className="text-sm text-medical-gray-500">Representante Legal</div>
                <div className="font-semibold">{profileData.representante_legal_nombre}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-medical-gray-50 rounded-xl">
              <MapPin className="w-5 h-5 text-medical-gray-500" />
              <div>
                <div className="text-sm text-medical-gray-500">Dirección</div>
                <div className="font-semibold text-sm">{profileData.direccion_establecimiento}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seguridad */}
      <div className="bg-white rounded-2xl shadow-soft p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-medical-gray-900 flex items-center gap-2">
            <Key className="w-5 h-5" />
            Seguridad
          </h2>
          <button className="btn-medical-secondary">
            Cambiar Contraseña
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <div className="font-semibold text-green-800">Cuenta verificada</div>
              <div className="text-sm text-green-600">Tu cuenta ha sido verificada y está activa</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-medical-gray-50 rounded-xl">
            <Calendar className="w-5 h-5 text-medical-gray-500" />
            <div>
              <div className="text-sm text-medical-gray-500">Último acceso</div>
              <div className="font-semibold">{new Date(profile.last_login).toLocaleString('es-VE')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente para la sección de pedidos
const OrdersSection: React.FC<{ orders: Order[] }> = ({ orders }) => {
  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      in_transit: 'bg-cyan-100 text-cyan-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount: number, currency: 'VES' | 'USD') => {
    const formatters = {
      USD: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
      VES: new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' })
    };
    return formatters[currency].format(amount);
  };

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <motion.div
          key={order.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-soft p-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-medical-gray-900">
                Pedido #{order.order_number}
              </h3>
              <p className="text-medical-gray-600">
                {new Date(order.created_at).toLocaleDateString('es-VE')}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {order.status === 'delivered' ? 'Entregado' : 
                 order.status === 'shipped' ? 'Enviado' : 
                 order.status === 'processing' ? 'Procesando' : 'Pendiente'}
              </span>
              <div className="text-right">
                <div className="text-lg font-bold text-medical-gray-900">
                  {formatCurrency(order.total, order.currency)}
                </div>
                <div className="text-sm text-medical-gray-600">
                  {order.items.length} productos
                </div>
              </div>
            </div>
          </div>

          {/* Productos del pedido */}
          <div className="border-t border-medical-gray-200 pt-4 mb-4">
            <div className="space-y-3">
              {order.items.slice(0, 2).map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-medical-gray-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-medical-gray-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-medical-gray-900">{item.product_name}</h4>
                    <p className="text-sm text-medical-gray-600">Cantidad: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(item.price, item.currency)}</div>
                  </div>
                </div>
              ))}
              {order.items.length > 2 && (
                <div className="text-sm text-medical-gray-600 text-center py-2">
                  y {order.items.length - 2} productos más...
                </div>
              )}
            </div>
          </div>

          {/* Tracking y acciones */}
          <div className="flex flex-col lg:flex-row gap-4">
            {order.tracking_info && (
              <div className="flex-1 p-4 bg-medical-blue-50 rounded-xl">
                <h5 className="font-semibold text-medical-blue-900 mb-2">Seguimiento</h5>
                <p className="text-sm text-medical-blue-700">
                  <strong>#{order.tracking_info.tracking_number}</strong>
                </p>
                <p className="text-sm text-medical-blue-600">
                  {order.tracking_info.status} - {order.tracking_info.location}
                </p>
              </div>
            )}
            <div className="flex gap-2">
              <Link
                to={`/seguimiento/${order.id}`}
                className="btn-medical-secondary flex items-center gap-2"
              >
                <Package className="w-4 h-4" />
                Ver detalles
              </Link>
              {order.invoice_url && (
                <button className="btn-medical-primary flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Factura
                </button>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Sección de Promociones
const PromotionsSection: React.FC<{ promotions: UserPromotion[] }> = ({ promotions }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-VE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDiscountText = (promotion: UserPromotion) => {
    if (promotion.discount_type === 'percentage') {
      return `${promotion.discount_value}% OFF`;
    } else {
      return `$${promotion.discount_value} OFF`;
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    // Aquí podrías agregar una notificación de copiado
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-soft p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-medical-gray-900 flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Promociones Disponibles
          </h2>
          <span className="text-sm text-medical-gray-600">
            {promotions.filter(p => !p.is_used).length} promociones activas
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {promotions.map((promotion) => (
            <motion.div
              key={promotion.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`relative p-6 rounded-2xl border-2 ${
                promotion.is_used
                  ? 'bg-medical-gray-50 border-medical-gray-200 opacity-60'
                  : 'bg-gradient-to-br from-medical-blue-50 to-purple-50 border-medical-blue-200'
              }`}
            >
              {/* Badge de descuento */}
              <div className={`absolute -top-3 -right-3 px-4 py-2 rounded-full text-white font-bold text-lg ${
                promotion.is_used ? 'bg-medical-gray-400' : 'bg-medical-blue-gradient'
              }`}>
                {getDiscountText(promotion)}
              </div>

              {/* Estado usado */}
              {promotion.is_used && (
                <div className="absolute top-4 left-4 px-3 py-1 bg-medical-gray-500 text-white text-xs font-medium rounded-full">
                  USADO
                </div>
              )}

              <div className="mt-4">
                <h3 className="text-lg font-bold text-medical-gray-900 mb-2">
                  {promotion.title}
                </h3>
                <p className="text-medical-gray-600 text-sm mb-4">
                  {promotion.description}
                </p>

                {/* Código de promoción */}
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-medical-gray-200 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-medical-gray-500 mb-1">Código de promoción</div>
                      <div className="font-mono font-bold text-medical-gray-900 text-lg">
                        {promotion.code}
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(promotion.code)}
                      className="px-3 py-2 bg-medical-blue-100 text-medical-blue-700 rounded-lg hover:bg-medical-blue-200 transition-colors text-sm font-medium"
                      disabled={promotion.is_used}
                    >
                      Copiar
                    </button>
                  </div>
                </div>

                {/* Detalles de la promoción */}
                <div className="space-y-2 text-sm text-medical-gray-600">
                  {promotion.min_amount && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Compra mínima: ${promotion.min_amount}</span>
                    </div>
                  )}
                  {promotion.max_discount && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Descuento máximo: ${promotion.max_discount}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span>Válido hasta: {formatDate(promotion.valid_until)}</span>
                  </div>
                </div>

                {/* Botón de acción */}
                {!promotion.is_used && (
                  <button className="w-full mt-4 btn-medical-primary">
                    Usar promoción
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {promotions.length === 0 && (
          <div className="text-center py-12">
            <Gift className="w-16 h-16 text-medical-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-medical-gray-500 mb-2">
              No hay promociones disponibles
            </h3>
            <p className="text-medical-gray-400">
              Las promociones aparecerán aquí cuando estén disponibles
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Sección de Notificaciones
const NotificationsSection: React.FC<{ notifications: UserNotification[] }> = ({ notifications }) => {
  const [notifs, setNotifs] = useState(notifications);

  const getNotificationIcon = (type: string) => {
    const icons = {
      order_confirmed: CheckCircle,
      order_shipped: Package,
      order_delivered: CheckCircle,
      promotion_available: Gift,
      account_update: User,
      system_message: Bell,
      payment_received: CreditCard,
      low_stock_alert: AlertTriangle
    };
    const IconComponent = icons[type as keyof typeof icons] || Bell;
    return IconComponent;
  };

  const getNotificationColor = (type: string) => {
    const colors = {
      order_confirmed: 'text-blue-600 bg-blue-100',
      order_shipped: 'text-indigo-600 bg-indigo-100',
      order_delivered: 'text-green-600 bg-green-100',
      promotion_available: 'text-purple-600 bg-purple-100',
      account_update: 'text-orange-600 bg-orange-100',
      system_message: 'text-gray-600 bg-gray-100',
      payment_received: 'text-emerald-600 bg-emerald-100',
      low_stock_alert: 'text-red-600 bg-red-100'
    };
    return colors[type as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  const markAsRead = (notificationId: string) => {
    setNotifs(prev => prev.map(n => 
      n.id === notificationId ? { ...n, is_read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace menos de 1 hora';
    if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours === 1 ? '' : 's'}`;
    if (diffInHours < 48) return 'Ayer';
    return date.toLocaleDateString('es-VE');
  };

  const unreadCount = notifs.filter(n => !n.is_read).length;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-soft p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-medical-gray-900 flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notificaciones
            {unreadCount > 0 && (
              <span className="bg-medical-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </h2>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-medical-blue-600 hover:text-medical-blue-700 font-medium"
            >
              Marcar todas como leídas
            </button>
          )}
        </div>

        <div className="space-y-4">
          {notifs.map((notification) => {
            const IconComponent = getNotificationIcon(notification.type);
            const iconColor = getNotificationColor(notification.type);
            
            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  notification.is_read
                    ? 'bg-white border-medical-gray-200'
                    : 'bg-medical-blue-50 border-medical-blue-200 shadow-sm'
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-full ${iconColor}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <h4 className={`font-semibold ${
                        notification.is_read ? 'text-medical-gray-700' : 'text-medical-gray-900'
                      }`}>
                        {notification.title}
                      </h4>
                      <span className="text-xs text-medical-gray-500 whitespace-nowrap ml-4">
                        {formatDate(notification.created_at)}
                      </span>
                    </div>
                    <p className={`text-sm mt-1 ${
                      notification.is_read ? 'text-medical-gray-500' : 'text-medical-gray-700'
                    }`}>
                      {notification.message}
                    </p>
                    {notification.action_url && (
                      <button className="text-sm text-medical-blue-600 hover:text-medical-blue-700 mt-2 font-medium">
                        Ver detalles →
                      </button>
                    )}
                  </div>
                  {!notification.is_read && (
                    <div className="w-2 h-2 bg-medical-blue-600 rounded-full flex-shrink-0 mt-2"></div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {notifs.length === 0 && (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-medical-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-medical-gray-500 mb-2">
              No hay notificaciones
            </h3>
            <p className="text-medical-gray-400">
              Tus notificaciones aparecerán aquí
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Sección de Soporte
const SupportSection: React.FC<{ tickets: SupportTicket[] }> = ({ tickets }) => {
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: 'general',
    priority: 'medium',
    message: ''
  });

  const getStatusColor = (status: string) => {
    const colors = {
      open: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'text-green-600',
      medium: 'text-yellow-600',
      high: 'text-orange-600',
      urgent: 'text-red-600'
    };
    return colors[priority as keyof typeof colors] || 'text-gray-600';
  };

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar el ticket
    console.log('Nuevo ticket:', newTicket);
    setShowNewTicketForm(false);
    setNewTicket({ subject: '', category: 'general', priority: 'medium', message: '' });
  };

  return (
    <div className="space-y-6">
      {/* Nuevo ticket */}
      {!showNewTicketForm ? (
        <div className="bg-white rounded-2xl shadow-soft p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-medical-gray-900 flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Centro de Soporte
            </h2>
            <button
              onClick={() => setShowNewTicketForm(true)}
              className="btn-medical-primary flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Nuevo ticket
            </button>
          </div>

          {/* Contacto rápido */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
            <div className="p-4 bg-medical-blue-50 rounded-xl text-center">
              <Phone className="w-8 h-8 text-medical-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-medical-gray-900">Teléfono</h3>
              <p className="text-sm text-medical-gray-600">+58 212-800-FARMA</p>
              <p className="text-xs text-medical-gray-500">Lun-Vie 8AM-6PM</p>
            </div>
            <div className="p-4 bg-green-50 rounded-xl text-center">
              <MessageCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-medical-gray-900">WhatsApp</h3>
              <p className="text-sm text-medical-gray-600">+58 414-FARMA-VE</p>
              <p className="text-xs text-medical-gray-500">24/7 Disponible</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-xl text-center">
              <Mail className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-medical-gray-900">Email</h3>
              <p className="text-sm text-medical-gray-600">soporte@farmaplus.com</p>
              <p className="text-xs text-medical-gray-500">Respuesta en 24h</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-soft p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-medical-gray-900">Crear Nuevo Ticket</h2>
            <button
              onClick={() => setShowNewTicketForm(false)}
              className="btn-medical-secondary"
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={handleSubmitTicket} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-medical-gray-700 mb-2">
                  Asunto *
                </label>
                <input
                  type="text"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  className="w-full p-3 border border-medical-gray-300 rounded-xl focus:ring-2 focus:ring-medical-blue-500 focus:border-transparent"
                  placeholder="Describe brevemente tu problema"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-medical-gray-700 mb-2">
                  Categoría
                </label>
                <select
                  value={newTicket.category}
                  onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                  className="w-full p-3 border border-medical-gray-300 rounded-xl focus:ring-2 focus:ring-medical-blue-500 focus:border-transparent"
                >
                  <option value="general">Consulta General</option>
                  <option value="technical">Problema Técnico</option>
                  <option value="billing">Facturación</option>
                  <option value="order">Pedidos</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-medical-gray-700 mb-2">
                Prioridad
              </label>
              <select
                value={newTicket.priority}
                onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                className="w-full p-3 border border-medical-gray-300 rounded-xl focus:ring-2 focus:ring-medical-blue-500 focus:border-transparent"
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-medical-gray-700 mb-2">
                Mensaje *
              </label>
              <textarea
                value={newTicket.message}
                onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                className="w-full p-3 border border-medical-gray-300 rounded-xl focus:ring-2 focus:ring-medical-blue-500 focus:border-transparent"
                rows={6}
                placeholder="Describe detalladamente tu problema o consulta"
                required
              />
            </div>

            <div className="flex gap-4">
              <button type="submit" className="btn-medical-primary flex-1">
                Enviar ticket
              </button>
              <button
                type="button"
                onClick={() => setShowNewTicketForm(false)}
                className="btn-medical-secondary flex-1"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Historial de tickets */}
      {!showNewTicketForm && (
        <div className="bg-white rounded-2xl shadow-soft p-8">
          <h3 className="text-lg font-bold text-medical-gray-900 mb-6">Mis Tickets</h3>
          
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 border border-medical-gray-200 rounded-xl hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-medical-gray-900">{ticket.subject}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                        {ticket.status === 'open' ? 'Abierto' : 
                         ticket.status === 'in_progress' ? 'En progreso' : 
                         ticket.status === 'resolved' ? 'Resuelto' : 'Cerrado'}
                      </span>
                      <span className={`text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority === 'low' ? 'Baja' : 
                         ticket.priority === 'medium' ? 'Media' : 
                         ticket.priority === 'high' ? 'Alta' : 'Urgente'}
                      </span>
                    </div>
                    <p className="text-sm text-medical-gray-600 mb-2">{ticket.message}</p>
                    <div className="flex items-center gap-4 text-xs text-medical-gray-500">
                      <span>Creado: {new Date(ticket.created_at).toLocaleDateString('es-VE')}</span>
                      <span>#{ticket.id.slice(0, 8)}</span>
                    </div>
                  </div>
                  <button className="btn-medical-secondary text-sm">
                    Ver detalles
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {tickets.length === 0 && (
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 text-medical-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-medical-gray-500 mb-2">
                No hay tickets de soporte
              </h3>
              <p className="text-medical-gray-400">
                Crea tu primer ticket para contactar a nuestro equipo de soporte
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfilePage; 