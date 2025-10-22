import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Truck, Package, CreditCard, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGlobalCurrency } from '../../contexts/GlobalCurrencyContext';
import { useNavbar } from '../../contexts/NavbarContext';
import { OrderItem } from '../../types';

interface OrderDetailsModalProps {
  order: any;
  onClose: () => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, onClose }) => {
  const { formatPriceFromBackend } = useGlobalCurrency();
  const { hideNavbar, showNavbar } = useNavbar();
  
  // Hide navbar when modal opens and show it when modal closes
  useEffect(() => {
    hideNavbar();
    return () => {
      showNavbar();
    };
  }, [hideNavbar, showNavbar]);
  
  if (!order) return null;

  // Función para traducir estados
  const translateOrderStatus = (status: string): string => {
    const statusTranslations: Record<string, string> = {
      'pending': 'Pendiente',
      'confirmed': 'Confirmado',
      'processing': 'Procesando',
      'shipped': 'Enviado',
      'in_transit': 'En Tránsito',
      'delivered': 'Entregado',
      'cancelled': 'Cancelado',
      'refunded': 'Reembolsado'
    };
    return statusTranslations[status] || status;
  };

  const translatePaymentStatus = (status: string): string => {
    const paymentStatusTranslations: Record<string, string> = {
      'pending': '⏳ Pendiente de Verificación',
      'completed': '✅ Pago Confirmado',
      'failed': '❌ Pago Rechazado',
      'processing': 'Procesando',
      'cancelled': 'Cancelado',
      'refunded': 'Reembolsado'
    };
    return paymentStatusTranslations[status] || status;
  };

  // Función para formatear precios de órdenes (ahora vienen en USD como string)
  const formatOrderPrice = (usdAmount: string | number) => {
    return formatPriceFromBackend(usdAmount);
  };

  // Función para formatear precios de items (ahora vienen en USD como string)
  const formatItemPrice = (item: any) => {
    return formatPriceFromBackend(item.unit_price || item.total_price);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: -50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: -50 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6">
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <h3 className="text-xl font-bold">Detalles del Pedido #{order.order_number}</h3>
              <div className="flex items-center gap-2">
                <Link 
                  to={`/tracking/${order.id}`} 
                  className="btn-medical-primary flex items-center gap-2 px-3 py-2 text-sm"
                  onClick={() => {
                    console.log('Navegando a tracking desde modal:', `/tracking/${order.id}`);
                    onClose();
                  }}
                >
                  <Truck className="w-4 h-4" />
                  Ver Tracking
                </Link>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200">
                  <X size={24} />
                </button>
              </div>
            </div>
            
            {/* Order Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-medical-gray-50 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Package className="w-5 h-5 text-medical-blue-600" />
                  <h5 className="font-semibold text-medical-gray-900">Estado del Pedido</h5>
                </div>
                <p className="text-lg font-bold text-medical-blue-700">{translateOrderStatus(order.status)}</p>
                {order.tracking_number && (
                  <p className="text-sm text-medical-gray-600 mt-1">
                    <strong>Número de seguimiento:</strong> {order.tracking_number}
                  </p>
                )}
              </div>
              <div className="bg-medical-gray-50 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="w-5 h-5 text-green-600" />
                  <h5 className="font-semibold text-medical-gray-900">Información de Pago</h5>
                </div>
                <p className="text-sm"><strong>Método:</strong> {order.payment_method}</p>
                <p className="text-sm"><strong>Estado:</strong> {translatePaymentStatus(order.payment_status)}</p>
                {(order.payment_status === 'completed' || order.payment_status === 'confirmed') && (
                  <div className="text-xs text-green-600 mt-1 font-medium">
                    ✓ Pago verificado y confirmado
                  </div>
                )}
                {order.payment_status === 'failed' && (
                  <div className="text-xs text-red-600 mt-1 font-medium">
                    ✗ Pago rechazado
                  </div>
                )}
                {order.payment_reference && (
                  <p className="text-sm"><strong>Referencia:</strong> {order.payment_reference}</p>
                )}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-medical-blue-50 p-4 rounded-xl mb-6">
              <h5 className="font-semibold text-medical-gray-900 mb-3">Desglose de Precios</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatOrderPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Envío:</span>
                  <span>{formatOrderPrice(order.shipping_cost)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Impuestos:</span>
                  <span>{formatOrderPrice(order.taxes)}</span>
                </div>
                <div className="border-t border-medical-gray-300 pt-2 mt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-medical-blue-700">{formatOrderPrice(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Verification Status */}
            {order.payment_capture_url && (
              <div className="bg-medical-blue-50 p-4 rounded-xl mb-6 border border-medical-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="w-5 h-5 text-medical-blue-600" />
                  <h5 className="font-semibold text-medical-gray-900">Estado de Verificación de Pago</h5>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => window.open(order.payment_capture_url, '_blank', 'noopener,noreferrer')}
                      className="btn-medical-primary flex items-center gap-2 text-sm px-3 py-2"
                    >
                      Ver Comprobante de Pago
                    </button>
                  </div>
                  
                </div>
              </div>
            )}

            {/* Shipping Address */}
            <div className="bg-medical-gray-50 p-4 rounded-xl mb-6">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-medical-blue-600" />
                <h5 className="font-semibold text-medical-gray-900">Dirección de Envío</h5>
              </div>
              <div className="space-y-1 text-sm">
                <p><strong>{order.shipping_address.recipient_name}</strong></p>
                <p>{order.shipping_address.street}</p>
                <p>{order.shipping_address.city}, {order.shipping_address.state}</p>
                <p>Código Postal: {order.shipping_address.postal_code}</p>
                <p>Teléfono: {order.shipping_address.recipient_phone}</p>
                {order.shipping_address.delivery_instructions && (
                  <p className="mt-2 text-medical-gray-600">
                    <strong>Instrucciones:</strong> {order.shipping_address.delivery_instructions}
                  </p>
                )}
              </div>
              {order.estimated_delivery && (
                <div className="mt-3 pt-3 border-t border-medical-gray-200">
                  <p className="text-sm">
                    <strong>Entrega estimada:</strong> {new Date(order.estimated_delivery).toLocaleDateString('es-VE', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </div>

            {/* Items */}
            <div>
              <h4 className="font-bold mb-3">Artículos ({order.item_count})</h4>
              <div className="space-y-3">
                {console.log( "order", order)}
                
                {order.items.map((item: OrderItem) => (
                  <div key={item.id} className="bg-white border border-medical-gray-200 rounded-xl p-4">
                    <div className="flex items-center space-x-4">
                      
                      <img 
                        src={item.product_image[0]} 
                        alt={item.product_name} 
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-grow">
                        <h6 className="font-semibold text-medical-gray-900">{item.product_name}</h6>
                        {item.product_brand && (
                          <p className="text-sm text-medical-gray-500">Marca: {item.product_brand}</p>
                        )}
                        {item.selected_presentation && (
                          <p className="text-sm text-medical-gray-500">Presentación: {item.selected_presentation}</p>
                        )}
                        <p className="text-sm text-medical-gray-600 mt-1">Cantidad: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg">{formatItemPrice(item)}</p>
                        <p className="text-sm text-medical-gray-500">
                          {formatOrderPrice(item.unit_price)} c/u
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Notes */}
            {order.customer_notes && (
              <div className="mt-6 bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
                <h5 className="font-semibold text-yellow-800 mb-2">Notas del Cliente</h5>
                <p className="text-sm text-yellow-700">{order.customer_notes}</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default OrderDetailsModal;
