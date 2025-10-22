import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Gift, 
  Bell, 
  MessageCircle, 
  CheckCircle, 
  Clock, 
  Package, 
  User, 
  CreditCard, 
  AlertTriangle, 
  Phone, 
  Mail
} from 'lucide-react';
import type { 
  UserPromotion, 
  UserNotification, 
  SupportTicket 
} from '../../types/profile';

// Sección de Promociones
export const PromotionsSection: React.FC<{ promotions: UserPromotion[] }> = ({ promotions }) => {
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
export const NotificationsSection: React.FC<{ notifications: UserNotification[] }> = ({ notifications }) => {
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
      payment_received: 'text-blue-600 bg-blue-100',
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
export const SupportSection: React.FC<{ tickets: SupportTicket[] }> = ({ tickets }) => {
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
              <p className="text-sm text-medical-gray-600">soporte@grupodrozainka.com</p>
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