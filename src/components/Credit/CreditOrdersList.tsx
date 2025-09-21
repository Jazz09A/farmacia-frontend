import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCredit } from '../../contexts/CreditContext';
import { useGlobalCurrency } from '../../contexts/GlobalCurrencyContext';
import { CreditOrder } from '../../types/credit';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { 
  Package, 
  DollarSign, 
  Calendar, 
  MapPin, 
  Eye, 
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  ChevronRight,
  RefreshCw
} from 'lucide-react';

interface CreditOrdersListProps {
  onViewDetails: (order: CreditOrder) => void;
  onMakePayment: (order: CreditOrder) => void;
  className?: string;
}

export const CreditOrdersList: React.FC<CreditOrdersListProps> = ({
  onViewDetails,
  onMakePayment,
  className = ''
}) => {
  const { creditOrders, loading, error, getCreditOrders, clearError } = useCredit();
  const { currency, formatPrice, getPriceInCurrency } = useGlobalCurrency();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const orders: CreditOrder[] = Array.isArray(creditOrders) ? creditOrders : [];

  useEffect(() => {
    loadOrders();
  }, [currentPage]);

  const loadOrders = async () => {
    try {
      const response = await getCreditOrders(currentPage, 10);
      setTotalPages(response.total_pages);
      setTotalOrders(response.total);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const getStatusInfo = (order: CreditOrder) => {
    // Determinar el estado basado en la deuda pendiente y el estado de pago
    const hasDebt = order.credit_remaining > 0;
    const isPaid = order.credit_paid;
    const hasPartialPayments = order.credit_paid_total > 0 && order.credit_remaining > 0;
    
    if (isPaid && !hasDebt) {
      return {
        icon: CheckCircle,
        color: 'green',
        text: 'Pagado',
        description: 'Deuda completamente saldada'
      };
    } else if (hasPartialPayments) {
      return {
        icon: AlertTriangle,
        color: 'blue',
        text: 'Pago Parcial',
        description: `Deuda pendiente: ${formatDebtAmount(order)}`
      };
    } else if (hasDebt) {
      return {
        icon: Clock,
        color: 'orange',
        text: 'Deuda Pendiente',
        description: `Debe: ${formatDebtAmount(order)}`
      };
    } else if (order.status === 'cancelled') {
      return {
        icon: XCircle,
        color: 'red',
        text: 'Cancelado',
        description: 'Orden cancelada'
      };
    } else {
      return {
        icon: Clock,
        color: 'gray',
        text: 'Procesando',
        description: 'Orden en proceso'
      };
    }
  };

  // Función para formatear precios usando el contexto de moneda
  const formatOrderPrice = (order: CreditOrder) => {
    switch (currency) {
      case 'VES':
        return formatPrice(order.total, 'VES');
      case 'USD':
      case 'REF':
        if (order.total_ref !== undefined) {
          return formatPrice(order.total_ref, 'USD');
        }
        // Si no hay total_ref, convertir usando la tasa de cambio
        const convertedTotal = order.total / order.exchange_rate;
        return formatPrice(convertedTotal, 'USD');
      default:
        return formatPrice(order.total, 'USD');
    }
  };

  // Función para formatear la deuda pendiente
  const formatDebtAmount = (order: CreditOrder) => {
    switch (currency) {
      case 'VES':
        // Para VES, calcular la deuda en VES
        const paidInVES = order.credit_paid_total * order.exchange_rate;
        const debtInVES = order.total - paidInVES;
        return formatPrice(debtInVES, 'VES');
      case 'USD':
      case 'REF':
        // Para USD/REF, usar credit_remaining que ya está en USD/REF
        return formatPrice(order.credit_remaining, 'USD');
      default:
        return formatPrice(order.credit_remaining, 'USD');
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatAddress = (address: CreditOrder['shipping_address']): string => {
    return `${address.address_line_1}, ${address.city}, ${address.state}`;
  };

  const canMakePayment = (order: CreditOrder): boolean => {
    // Se puede hacer pago si hay deuda pendiente y la orden no está cancelada
    return order.credit_remaining > 0 && order.status !== 'cancelled';
  };

  if (loading && orders.length === 0) {
    return (
      <div className={`credit-orders-list ${className}`}>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center p-12 bg-white/70 backdrop-blur-sm rounded-3xl border border-gray-200/50"
        >
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-gray-600 text-lg font-medium mt-4">Cargando órdenes de crédito...</span>
          <p className="text-gray-500 text-sm mt-2">Obteniendo información actualizada...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`credit-orders-list ${className}`}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-12 bg-red-50/80 backdrop-blur-sm rounded-3xl border border-red-200/50"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-2xl mb-6">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">Error al cargar las órdenes</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={loadOrders}
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <RefreshCw className="w-4 h-4" />
              Reintentar
            </button>
            <button
              onClick={clearError}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Cerrar
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`credit-orders-list space-y-6 ${className}`}>
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              Mis Órdenes de Crédito
            </h2>
          </div>
          <p className="text-gray-600">
            Gestiona tus órdenes y realiza pagos
          </p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={loadOrders}
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {loading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Actualizar
        </motion.button>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{totalOrders}</div>
              <div className="text-sm text-gray-600">Total Órdenes</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">
                {orders.filter(o => o.status === 'pending' || o.status === 'partial_paid').length}
              </div>
              <div className="text-sm text-gray-600">Pendientes</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">
                {orders.filter(o => o.status === 'paid').length}
              </div>
              <div className="text-sm text-gray-600">Pagadas</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Orders List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        {orders.length === 0 ? (
          <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No hay órdenes de crédito</h3>
            <p className="text-gray-500">Tus órdenes de crédito aparecerán aquí</p>
          </div>
        ) : (
          orders.map((order, index) => {
            const statusInfo = getStatusInfo(order);
            const StatusIcon = statusInfo.icon;
            
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.01, y: -2 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Order Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-lg ${
                          statusInfo.color === 'green' ? 'bg-green-100' :
                          statusInfo.color === 'orange' ? 'bg-orange-100' :
                          statusInfo.color === 'blue' ? 'bg-blue-100' :
                          statusInfo.color === 'red' ? 'bg-red-100' :
                          'bg-gray-100'
                        }`}>
                          <StatusIcon className={`w-5 h-5 ${
                            statusInfo.color === 'green' ? 'text-green-600' :
                            statusInfo.color === 'orange' ? 'text-orange-600' :
                            statusInfo.color === 'blue' ? 'text-blue-600' :
                            statusInfo.color === 'red' ? 'text-red-600' :
                            'text-gray-600'
                          }`} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">
                            {order.order_number}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {formatDate(order.created_at)}
                          </p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          statusInfo.color === 'green' ? 'bg-green-100 text-green-700' :
                          statusInfo.color === 'orange' ? 'bg-orange-100 text-orange-700' :
                          statusInfo.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                          statusInfo.color === 'red' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {statusInfo.text}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">Total:</span>
                          <span className="font-bold text-gray-800">{formatOrderPrice(order)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">Deuda:</span>
                          <span className="font-bold text-red-600">{formatDebtAmount(order)}</span>
                        </div>
                        {order.credit_paid_total > 0 && (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="font-medium">Pagado:</span>
                            <span className="font-bold text-green-600">
                              {currency === 'VES' 
                                ? formatPrice(order.credit_paid_total * order.exchange_rate, 'VES')
                                : formatPrice(order.credit_paid_total, 'USD')
                              }
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">Vence:</span>
                          <span>{formatDate(order.payment_due_date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">Envío:</span>
                          <span className="truncate">{formatAddress(order.shipping_address)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => onViewDetails(order)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Ver Detalles
                      </button>
                      
                      {canMakePayment(order) && (
                        <button
                          onClick={() => onMakePayment(order)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-sm"
                        >
                          <CreditCard className="w-4 h-4" />
                          Pagar Deuda
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center"
        >
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              Anterior
            </button>
            
            <span className="px-4 py-2 text-gray-600">
              Página {currentPage} de {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              Siguiente
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
