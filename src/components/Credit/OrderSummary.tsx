// Componente para mostrar resumen de órdenes con ambas monedas según documentación

import React from 'react';
import { motion } from 'framer-motion';
import { Package, Calendar, DollarSign, CreditCard, MapPin } from 'lucide-react';
import { CreditOrder } from '../../types/credit';
import { formatVES, formatUSD, formatExchangeRate } from '../../utils/currencyUtils';

interface OrderSummaryProps {
  order: CreditOrder;
  showDetails?: boolean;
  className?: string;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ 
  order, 
  showDetails = true,
  className = '' 
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-VE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-orange-100 text-orange-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6" />
            <div>
              <h3 className="text-xl font-bold">Orden #{order.order_number}</h3>
              <p className="text-blue-100 text-sm">
                Creada el {formatDate(order.created_at)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
              {order.status.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-6 space-y-6">
        {/* Resumen financiero */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Resumen Financiero
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Total en VES */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total en VES:</span>
                <span className="font-bold text-lg">{formatVES(parseFloat(order.total))}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total en USD:</span>
                <span className="font-bold text-lg text-blue-600">{formatUSD(parseFloat(order.total_ref))}</span>
              </div>
            </div>

            {/* Información de crédito */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Crédito otorgado:</span>
                <span className="font-bold text-green-600">{formatUSD(parseFloat(order.credit_amount))}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Saldo pendiente:</span>
                <span className="font-bold text-red-600">{formatUSD(parseFloat(order.credit_remaining))}</span>
              </div>
            </div>
          </div>

          {/* Tasa de cambio */}
          {order.exchange_rate && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Tasa de cambio usada:</span>
                <span className="font-medium">{formatExchangeRate(order.exchange_rate)} VES/USD</span>
              </div>
            </div>
          )}
        </div>

        {/* Información de pago */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Estado de Pago
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Estado del pago:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                  {order.payment_status.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Método de pago:</span>
                <span className="font-medium">{order.payment_method}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total pagado:</span>
                <span className="font-bold text-green-600">{formatUSD(parseFloat(order.credit_paid_total))}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completamente pagado:</span>
                <span className={`font-medium ${order.credit_paid ? 'text-green-600' : 'text-red-600'}`}>
                  {order.credit_paid ? 'Sí' : 'No'}
                </span>
              </div>
            </div>
          </div>

          {/* Fechas importantes */}
          <div className="mt-4 pt-4 border-t border-blue-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {order.payment_due_date && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Vencimiento:</span>
                  <span className="font-medium">{formatDate(order.payment_due_date)}</span>
                </div>
              )}
              {order.credit_payment_date && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pago completo:</span>
                  <span className="font-medium">{formatDate(order.credit_payment_date)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dirección de envío */}
        {order.shipping_address && (
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Dirección de Envío
            </h4>
            
            <div className="space-y-2 text-sm">
              <div className="font-medium">{order.shipping_address.full_name}</div>
              <div>{order.shipping_address.address_line_1}</div>
              {order.shipping_address.address_line_2 && (
                <div>{order.shipping_address.address_line_2}</div>
              )}
              <div>
                {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
              </div>
              <div>{order.shipping_address.country}</div>
              <div className="text-gray-600">Tel: {order.shipping_address.phone}</div>
            </div>
          </div>
        )}

        {/* Items de la orden */}
        {showDetails && order.items && order.items.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Productos ({order.item_count})</h4>
            
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{item.product_name}</div>
                    <div className="text-sm text-gray-600">{item.product_brand}</div>
                    <div className="text-sm text-gray-500">Cantidad: {item.quantity}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatVES(parseFloat(item.total_price))}</div>
                    <div className="text-sm text-blue-600">{formatUSD(parseFloat(item.total_price_ref))}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notas del cliente */}
        {order.customer_notes && (
          <div className="bg-yellow-50 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Notas del Cliente</h4>
            <p className="text-sm text-gray-700">{order.customer_notes}</p>
          </div>
        )}

        {/* Información de seguimiento */}
        {order.tracking_number && (
          <div className="bg-purple-50 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Seguimiento</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Número de seguimiento:</span>
                <span className="font-mono font-medium">{order.tracking_number}</span>
              </div>
              {order.estimated_delivery && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Entrega estimada:</span>
                  <span className="font-medium">{formatDate(order.estimated_delivery)}</span>
                </div>
              )}
              {order.delivered_at && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Entregado el:</span>
                  <span className="font-medium text-green-600">{formatDate(order.delivered_at)}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
