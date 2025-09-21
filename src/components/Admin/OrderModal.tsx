import React, { useState } from 'react';
import { Order } from '../../types';
import { 
  XCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  Package,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  Receipt,
  Check,
  CreditCard,
  Calendar,
  Truck,
  User,
  DollarSign,
  Copy,
  CheckCheck,
  Shield,
  X
} from 'lucide-react';

const orderStatuses = [
  { id: 'pending', name: 'Pendiente', color: 'yellow' },
  { id: 'confirmed', name: 'Confirmado', color: 'emerald' },
  { id: 'processing', name: 'Preparando', color: 'blue' },
  { id: 'shipped', name: 'Enviado', color: 'purple' },
  { id: 'delivered', name: 'Entregado', color: 'green' },
  { id: 'cancelled', name: 'Cancelado', color: 'red' },
];

const paymentStatuses = [
  { id: 'pending', name: 'Pendiente', color: 'yellow' },
  { id: 'completed', name: 'Completado', color: 'green' },
  { id: 'failed', name: 'Fallido', color: 'red' },
  { id: 'refunded', name: 'Reembolsado', color: 'gray' },
];

interface OrderModalProps {
  order: Order | null;
  onClose: () => void;
  onUpdateStatus: (orderId: string, newStatus: string) => Promise<void>;
  onUpdatePaymentStatus?: (orderId: string, paymentStatus: 'completed' | 'failed') => Promise<void>;
}

const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'processing':
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case 'shipped':
        return <Package className="w-4 h-4 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
      minimumFractionDigits: 0
    }).format(amount);
};

const OrderModal: React.FC<OrderModalProps> = ({ order, onClose, onUpdateStatus, onUpdatePaymentStatus }) => {
  const [selectedStatus, setSelectedStatus] = useState(order?.status || 'pending');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  if (!order) return null;

  // Debug: mostrar información del estado de pago
  console.log('OrderModal Debug:', {
    payment_status: order.payment_status,
    payment_capture_url: order.payment_capture_url,
    onUpdatePaymentStatus: !!onUpdatePaymentStatus,
    order_id: order.id,
    order_number: order.order_number
  });
  
  const handleConfirmStatusChange = async () => {
    if (selectedStatus === order.status) return;
    setIsUpdating(true);
    try {
      await onUpdateStatus(order.id, selectedStatus);
      setSelectedStatus(selectedStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCopyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('es-VE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const getStatusBadge = (status: string, type: 'order' | 'payment' = 'order') => {
    const statuses = type === 'order' ? orderStatuses : paymentStatuses;
    const statusObj = statuses.find(s => s.id === status);
    const color = statusObj?.color || 'gray';
    
    const colorClasses = {
      yellow: 'bg-yellow-100 text-yellow-800',
      emerald: 'bg-emerald-100 text-emerald-800',
      blue: 'bg-blue-100 text-blue-800',
      purple: 'bg-purple-100 text-purple-800',
      green: 'bg-green-100 text-green-800',
      red: 'bg-red-100 text-red-800',
      gray: 'bg-gray-100 text-gray-800'
    };

    return `px-3 py-1 text-sm font-medium rounded-full ${colorClasses[color as keyof typeof colorClasses]}`;
  };

  const hasStatusChanged = selectedStatus !== order.status;

  const handlePaymentVerification = async (status: 'completed' | 'failed') => {
    if (!onUpdatePaymentStatus) return;
    
    setIsUpdatingPayment(true);
    try {
      await onUpdatePaymentStatus(order.id, status);
      // Update order state locally if needed
      // This should trigger a refresh of the order data
    } catch (error) {
      console.error('Error updating payment status:', error);
    } finally {
      setIsUpdatingPayment(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-xs sm:max-w-md lg:max-w-6xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 truncate">
                  Pedido #{order.order_number || order.id.substring(0, 8)}
                </h2>
                <div className={getStatusBadge(order.status, 'order')}>
                  {getStatusIcon(order.status)}
                  <span className="ml-1 capitalize text-xs sm:text-sm">{orderStatuses.find(s => s.id === order.status)?.name}</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="truncate">{formatDate(order.created_at)}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Package className="w-3 h-3 sm:w-4 sm:h-4" />
                  {order.item_count} items
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="truncate">{formatCurrency(order.total)} {order.currency}</span>
                </span>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 active:text-gray-800 flex-shrink-0 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <XCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        <div className="p-3 sm:p-4 lg:p-6 space-y-4 lg:space-y-8">
          {/* Main Info Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Customer Info */}
            <div className="space-y-3 lg:space-y-4">
              <h3 className="text-base lg:text-lg font-semibold text-gray-900 flex items-center gap-2">
                <User className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
                <span className="truncate">Información del Cliente</span>
              </h3>
              <div className="bg-gray-50 rounded-lg p-3 lg:p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs lg:text-sm text-gray-500">Nombre</div>
                    <div className="font-medium text-sm lg:text-base truncate">{order.shipping_address.recipient_name || 'No disponible'}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs lg:text-sm text-gray-500">Teléfono</div>
                    <div className="font-medium text-sm lg:text-base break-words">{order.shipping_address.recipient_phone || 'No disponible'}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs lg:text-sm text-gray-500">Dirección</div>
                    <div className="text-xs lg:text-sm space-y-1">
                      <div className="break-words">{order.shipping_address.street}</div>
                      <div className="break-words">{order.shipping_address.city}, {order.shipping_address.state}</div>
                      <div>{order.shipping_address.postal_code}</div>
                      <div>{order.shipping_address.country}</div>
                    </div>
                  </div>
                </div>
                {order.shipping_address.delivery_instructions && (
                  <div className="pt-2 border-t border-gray-200">
                    <div className="text-xs lg:text-sm text-gray-500">Instrucciones de entrega</div>
                    <div className="text-xs lg:text-sm break-words">{order.shipping_address.delivery_instructions}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Status Management */}
            <div className="space-y-3 lg:space-y-4">
              <h3 className="text-base lg:text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Package className="w-4 h-4 lg:w-5 lg:h-5 text-green-600" />
                <span className="truncate">Estado del Pedido</span>
              </h3>
              <div className="bg-gray-50 rounded-lg p-3 lg:p-4 space-y-3 lg:space-y-4">
                <div className="flex items-center gap-2">
                  {getStatusIcon(order.status)}
                  <span className="font-medium text-sm lg:text-base">
                    {orderStatuses.find(s => s.id === order.status)?.name}
                  </span>
                </div>
                
                {order.tracking_number && (
                  <div className="flex items-center justify-between p-2 lg:p-3 bg-white rounded border">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Truck className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs lg:text-sm text-gray-500">Número de seguimiento</div>
                        <div className="font-medium text-xs lg:text-sm truncate">{order.tracking_number}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopyToClipboard(order.tracking_number!, 'tracking')}
                      className="p-2 text-gray-400 hover:text-blue-600 active:text-blue-800 rounded-full hover:bg-blue-50 transition-colors flex-shrink-0"
                      title="Copiar tracking"
                    >
                      {copiedField === 'tracking' ? <CheckCheck className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                )}

                <div>
                  <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">Actualizar Estado:</label>
                  <select 
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    disabled={isUpdating}
                  >
                    {orderStatuses.map(status => (
                      <option key={status.id} value={status.id}>
                        {status.name}
                      </option>
                    ))}
                  </select>
                  
                  {hasStatusChanged && (
                    <button
                      onClick={handleConfirmStatusChange}
                      disabled={isUpdating}
                      className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:bg-green-400 text-white text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      {isUpdating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-xs lg:text-sm">Actualizando...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span className="text-xs lg:text-sm">Confirmar Cambio</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Delivery Dates */}
                {(order.estimated_delivery || order.delivered_at) && (
                  <div className="space-y-2 pt-3 border-t border-gray-200">
                    {order.estimated_delivery && (
                      <div className="text-xs lg:text-sm">
                        <span className="text-gray-500">Entrega estimada: </span>
                        <span className="font-medium break-words">{formatDate(order.estimated_delivery)}</span>
                      </div>
                    )}
                    {order.delivered_at && (
                      <div className="text-xs lg:text-sm">
                        <span className="text-gray-500">Entregado: </span>
                        <span className="font-medium text-green-600 break-words">{formatDate(order.delivered_at)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Payment Information */}
            <div className="space-y-3 lg:space-y-4">
              <h3 className="text-base lg:text-lg font-semibold text-gray-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 lg:w-5 lg:h-5 text-purple-600" />
                <span className="truncate">Información de Pago</span>
              </h3>
              <div className="bg-gray-50 rounded-lg p-3 lg:p-4 space-y-3 lg:space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs lg:text-sm text-gray-500">Estado del pago</span>
                  <div className={getStatusBadge(order.payment_status, 'payment')}>
                    <span className="text-xs">{order.payment_status}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs lg:text-sm text-gray-500">Método de pago</span>
                  <span className="font-medium text-xs lg:text-sm truncate">{order.payment_method}</span>
                </div>

                {order.payment_reference && (
                  <div className="flex items-center justify-between p-2 lg:p-3 bg-white rounded border gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="text-xs lg:text-sm text-gray-500">Referencia de pago</div>
                      <div className="font-medium text-xs lg:text-sm truncate">{order.payment_reference}</div>
                    </div>
                    <button
                      onClick={() => handleCopyToClipboard(order.payment_reference, 'payment_ref')}
                      className="p-2 text-gray-400 hover:text-blue-600 active:text-blue-800 rounded-full hover:bg-blue-50 transition-colors flex-shrink-0"
                      title="Copiar referencia"
                    >
                      {copiedField === 'payment_ref' ? <CheckCheck className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                )}

                {/* Payment Capture Button */}
                {order.payment_capture_url && (
                  <button
                    onClick={() => window.open(order.payment_capture_url, '_blank', 'noopener,noreferrer')}
                    className="w-full flex items-center justify-center gap-2 px-3 lg:px-4 py-2 lg:py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs lg:text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <Receipt className="w-4 h-4" />
                    <span className="hidden sm:inline">Ver Comprobante de Pago</span>
                    <span className="sm:hidden">Comprobante</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                )}

                {/* Payment Verification Status and Buttons */}
                {order.payment_capture_url && (
                  <div className="space-y-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-sm font-medium text-blue-900 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Verificación de Comprobante de Pago
                    </div>
                    {/* Mostrar estado actual */}
                    <div className="p-3 bg-white rounded border">
                      <div className="text-xs text-gray-600 mb-1">Estado Actual:</div>
                      <div className={`text-sm font-medium ${
                        order.payment_status === 'completed' ? 'text-green-700' :
                        order.payment_status === 'failed' ? 'text-red-700' :
                        'text-yellow-700'
                      }`}>
                        {order.payment_status === 'completed' ? '✅ Pago Confirmado' :
                         order.payment_status === 'failed' ? '❌ Pago Rechazado' :
                         '⏳ Pendiente de Verificación'}
                      </div>
                    </div>
                    
                    {/* Botones de verificación solo si el pago está pendiente */}
                    {onUpdatePaymentStatus && order.payment_status === 'pending' && (
                      <div className="space-y-2">
                        <div className="text-xs text-gray-600">Acciones disponibles:</div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handlePaymentVerification('completed')}
                            disabled={isUpdatingPayment}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:bg-green-400 text-white text-xs lg:text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                          >
                            {isUpdatingPayment ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                            <span>Confirmar Pago</span>
                          </button>
                          <button
                            onClick={() => handlePaymentVerification('failed')}
                            disabled={isUpdatingPayment}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:bg-red-400 text-white text-xs lg:text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                          >
                            {isUpdatingPayment ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                            <span>Rechazar Pago</span>
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Mensaje cuando el pago ya fue verificado */}
                    {onUpdatePaymentStatus && order.payment_status !== 'pending' && (
                      <div className="p-3 bg-gray-50 rounded border">
                        <div className="text-xs text-gray-600 mb-1">Estado de Verificación:</div>
                        <div className={`text-sm font-medium ${
                          order.payment_status === 'completed' ? 'text-green-700' :
                          order.payment_status === 'failed' ? 'text-red-700' :
                          'text-gray-700'
                        }`}>
                          {order.payment_status === 'completed' ? '✅ Pago ya fue confirmado' :
                           order.payment_status === 'failed' ? '❌ Pago ya fue rechazado' :
                           'Estado de pago verificado'}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-3 lg:mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 lg:w-5 lg:h-5 text-indigo-600" />
              <span className="truncate">Productos del Pedido</span>
            </h3>
            
            {/* Mobile View */}
            <div className="lg:hidden space-y-2 lg:space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-3 lg:p-4 flex items-center space-x-3 lg:space-x-4">
                  <img 
                    src={item.product_image} 
                    alt={item.product_name}
                    className="w-12 h-12 lg:w-16 lg:h-16 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm lg:text-base truncate">{item.product_name}</div>
                    <div className="text-xs lg:text-sm text-gray-500">{item.product_brand}</div>
                    <div className="text-xs lg:text-sm text-gray-600 mt-1">
                      Cantidad: {item.quantity} • {formatCurrency(item.unit_price)} c/u
                    </div>
                    {item.selected_presentation && (
                      <div className="text-xs text-gray-500 mt-1">
                        Presentación: {item.selected_presentation}
                      </div>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold text-gray-900 text-sm lg:text-base">
                      {formatCurrency(item.total_price)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View */}
            <div className="hidden lg:block bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-gray-900">Producto</th>
                    <th className="px-6 py-4 text-center font-semibold text-gray-900">Cantidad</th>
                    <th className="px-6 py-4 text-right font-semibold text-gray-900">Precio Unit.</th>
                    <th className="px-6 py-4 text-right font-semibold text-gray-900">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {order.items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <img 
                            src={item.product_image} 
                            alt={item.product_name}
                            className="w-16 h-16 rounded-lg object-cover mr-4 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900">{item.product_name}</div>
                            <div className="text-gray-500">{item.product_brand}</div>
                            {item.selected_presentation && (
                              <div className="text-xs text-gray-500 mt-1">
                                {item.selected_presentation}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {item.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-gray-900">
                        {formatCurrency(item.unit_price)}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-gray-900">
                        {formatCurrency(item.total_price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-3 lg:p-6 border border-gray-200">
            <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-3 lg:mb-4 flex items-center gap-2">
              <Receipt className="w-4 h-4 lg:w-5 lg:h-5 text-green-600" />
              <span className="truncate">Resumen del Pedido</span>
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <div className="space-y-2 lg:space-y-3">
                <div className="flex justify-between text-xs lg:text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium truncate">{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs lg:text-sm">
                  <span className="text-gray-600">Envío:</span>
                  <span className="font-medium truncate">{formatCurrency(order.shipping_cost)}</span>
                </div>
                <div className="flex justify-between text-xs lg:text-sm">
                  <span className="text-gray-600">Impuestos:</span>
                  <span className="font-medium truncate">{formatCurrency(order.taxes)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 lg:pt-3">
                  <div className="flex justify-between text-sm lg:text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-blue-600 truncate">{formatCurrency(order.total)} {order.currency}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 lg:space-y-3 text-xs lg:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Moneda:</span>
                  <span className="font-medium">{order.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Método de pago:</span>
                  <span className="font-medium truncate">{order.payment_method}</span>
                </div>
                {order.customer_notes && (
                  <div className="pt-2 lg:pt-3 border-t border-gray-200">
                    <div className="text-gray-600 mb-1">Notas del cliente:</div>
                    <div className="text-gray-800 text-xs lg:text-sm bg-white p-2 lg:p-3 rounded border italic break-words">
                      "{order.customer_notes}"
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderModal; 