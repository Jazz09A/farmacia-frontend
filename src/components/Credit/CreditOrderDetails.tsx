import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCredit } from '../../contexts/CreditContext';
import { CreditOrder } from '../../types/credit';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { PaymentHistory } from './PaymentHistory';
import { 
  Package, 
  DollarSign, 
  Calendar, 
  MapPin, 
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  ArrowLeft,
  ShoppingCart,
  User,
  Phone,
  Mail,
  Building
} from 'lucide-react';

interface CreditOrderDetailsProps {
  orderId: string;
  onBack: () => void;
  onMakePayment: (order: CreditOrder) => void;
  className?: string;
}

export const CreditOrderDetails: React.FC<CreditOrderDetailsProps> = ({
  orderId,
  onBack,
  onMakePayment,
  className = ''
}) => {
  const { getCreditOrderDetails, loading, error } = useCredit();
  const [order, setOrder] = useState<CreditOrder | null>(null);

  useEffect(() => {
    loadOrderDetails();
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      const orderData = await getCreditOrderDetails(orderId);
      setOrder(orderData);
    } catch (error) {
      console.error('Error loading order details:', error);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          color: 'orange',
          text: 'Pendiente',
          description: 'Orden creada, esperando pago'
        };
      case 'partial_paid':
        return {
          icon: AlertTriangle,
          color: 'blue',
          text: 'Pago Parcial',
          description: 'Se ha realizado un pago parcial'
        };
      case 'paid':
        return {
          icon: CheckCircle,
          color: 'green',
          text: 'Pagado',
          description: 'Orden completamente pagada'
        };
      case 'cancelled':
        return {
          icon: XCircle,
          color: 'red',
          text: 'Cancelada',
          description: 'Orden cancelada'
        };
      default:
        return {
          icon: Clock,
          color: 'gray',
          text: 'Desconocido',
          description: 'Estado desconocido'
        };
    }
  };

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canMakePayment = (order: CreditOrder): boolean => {
    return order.status === 'pending' || order.status === 'partial_paid';
  };

  if (loading) {
    return (
      <div className={`credit-order-details ${className}`}>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center p-12 bg-white/70 backdrop-blur-sm rounded-3xl border border-gray-200/50"
        >
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-gray-600 text-lg font-medium mt-4">Cargando detalles de la orden...</span>
          <p className="text-gray-500 text-sm mt-2">Obteniendo información detallada...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`credit-order-details ${className}`}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-12 bg-red-50/80 backdrop-blur-sm rounded-3xl border border-red-200/50"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-2xl mb-6">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">Error al cargar los detalles</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">{error}</p>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
        </motion.div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className={`credit-order-details ${className}`}>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center p-12 bg-gray-50/80 backdrop-blur-sm rounded-3xl border border-gray-200/50"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl mb-6">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Orden no encontrada</h3>
          <p className="text-gray-500">La orden solicitada no existe o no tienes permisos para verla</p>
        </motion.div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className={`credit-order-details space-y-6 ${className}`}>
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Orden {order.order_number}
            </h2>
            <p className="text-gray-600">
              Creada el {formatDate(order.created_at)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
            statusInfo.color === 'green' ? 'bg-green-100 text-green-700' :
            statusInfo.color === 'orange' ? 'bg-orange-100 text-orange-700' :
            statusInfo.color === 'blue' ? 'bg-blue-100 text-blue-700' :
            statusInfo.color === 'red' ? 'bg-red-100 text-red-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            <StatusIcon className="w-4 h-4 inline mr-2" />
            {statusInfo.text}
          </div>
          
          {canMakePayment(order) && (
            <button
              onClick={() => onMakePayment(order)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-sm"
            >
              <CreditCard className="w-4 h-4" />
              Hacer Pago
            </button>
          )}
        </div>
      </motion.div>

      {/* Order Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm p-6"
      >
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Resumen de la Orden
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Total de la Orden</div>
            <div className="text-2xl font-bold text-gray-800">{formatAmount(order.total)}</div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm text-blue-600 mb-1">Crédito Usado</div>
            <div className="text-2xl font-bold text-blue-700">{formatAmount(order.credit_used)}</div>
          </div>
          
          <div className="bg-red-50 rounded-lg p-4">
            <div className="text-sm text-red-600 mb-1">Saldo Pendiente</div>
            <div className="text-2xl font-bold text-red-700">{formatAmount(order.credit_remaining)}</div>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="text-sm text-orange-600 mb-1">Fecha de Vencimiento</div>
            <div className="text-lg font-bold text-orange-700">{formatDate(order.payment_due_date)}</div>
          </div>
        </div>
      </motion.div>

      {/* Items */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm p-6"
      >
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          Productos
        </h3>
        
        <div className="space-y-3">
          {order.items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800">{item.product_name}</h4>
                <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">
                  {formatAmount(item.unit_price)} c/u
                </div>
                <div className="font-bold text-gray-800">
                  {formatAmount(item.total_price)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Shipping Address */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm p-6"
      >
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Dirección de Envío
        </h3>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="space-y-2 text-gray-700">
            <div className="font-medium">{order.shipping_address.address_line_1}</div>
            {order.shipping_address.address_line_2 && (
              <div>{order.shipping_address.address_line_2}</div>
            )}
            <div>
              {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
            </div>
            <div>{order.shipping_address.country}</div>
          </div>
        </div>
      </motion.div>

      {/* Customer Notes */}
      {order.customer_notes && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm p-6"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Notas del Cliente
          </h3>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700">{order.customer_notes}</p>
          </div>
        </motion.div>
      )}

      {/* Payment History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <PaymentHistory orderId={orderId} />
      </motion.div>
    </div>
  );
};
