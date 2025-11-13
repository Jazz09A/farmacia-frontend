import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Eye, Truck, DollarSign, Clock, CheckCircle, AlertCircle, Package, XCircle, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import OrderDetailsModal from './OrderDetailsModal';
import InvoiceDetailsModal from './InvoiceDetailsModal';
import PaymentModal from './PaymentModal';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useGlobalCurrency } from '../../contexts/GlobalCurrencyContext';
import { useUserOrdersQuery, useOrderDetailsQuery } from '../../hooks/queries/useAuthQueries';
import { useInvoicesQuery, useInvoiceDetailsQuery } from '../../hooks/queries/useInvoiceQueries';
import { queryKeys } from '../../hooks/queries/queryKeys';
import type { DEMOAInvoice, DEMOAInvoiceDetails } from '../../types/invoices';

// Define interfaces for Order and OrderDetails to use TypeScript benefits
interface Order {
  id: string;
  order_number: string;
  status?: string; // Hacer opcional para evitar errores
  payment_status?: string; // Hacer opcional para evitar errores
  total: number;
  total_ref?: number;
  currency: string;
  exchange_rate?: number;
  item_count: number;
  created_at: string;
  credit_remaining?: number; // Add credit_remaining field
}

const OrdersSection: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedInvoiceNumber, setSelectedInvoiceNumber] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const { currency, formatPriceFromBackend, formatPrice } = useGlobalCurrency();

  // React Query hooks
  const { data: orders = [], isLoading: loadingOrders } = useUserOrdersQuery();
  const { data: invoices = [], isLoading: loadingInvoices } = useInvoicesQuery('all');
  const { data: selectedOrder } = useOrderDetailsQuery(selectedOrderId || '', !!selectedOrderId && isModalOpen);
  const { data: selectedInvoice } = useInvoiceDetailsQuery(selectedInvoiceNumber || '', !!selectedInvoiceNumber && isInvoiceModalOpen);

  const handleViewDetails = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsModalOpen(true);
  };

  const handleViewInvoiceDetails = (invoiceNumber: string) => {
    setSelectedInvoiceNumber(invoiceNumber);
    setIsInvoiceModalOpen(true);
  };

  const handlePay = (order: Order) => {
    setSelectedOrderId(order.id);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentCreated = () => {
    setIsPaymentModalOpen(false);
    // Invalidar queries para refrescar datos
    queryClient.invalidateQueries({ queryKey: queryKeys.auth.orders });
    queryClient.invalidateQueries({ queryKey: queryKeys.invoices.list('all') });
  };

  // Función para formatear el precio de la orden usando la nueva lógica de precios
  const formatOrderPrice = (order: Order) => {
    // Los precios ahora vienen en USD como string del backend
    // Usar formatPriceFromBackend para convertir automáticamente
    return formatPriceFromBackend(order.total);
  };

  // Función para mostrar el precio original si es diferente
  const getOriginalPriceText = (order: Order) => {
    // Con la nueva lógica, siempre mostramos el precio en la moneda opuesta
    const oppositeCurrency = currency === 'VES' ? 'USD' : 'VES';
    return `(${formatPriceFromBackend(order.total, oppositeCurrency)})`;
  };

  // Función para obtener el icono del estado del pedido
  const getStatusIcon = (status: string | undefined) => {
    // Si el status es undefined o null, usar icono por defecto
    if (!status) {
      return <Clock className="w-3 h-3" />;
    }
    
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="w-3 h-3" />;
      case 'confirmed':
        return <CheckCircle className="w-3 h-3" />;
      case 'processing':
        return <AlertCircle className="w-3 h-3" />;
      case 'shipped':
        return <Package className="w-3 h-3" />;
      case 'delivered':
        return <CheckCircle className="w-3 h-3" />;
      case 'cancelled':
        return <XCircle className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  // Función para obtener las clases del badge de estado del pedido
  const getOrderStatusBadge = (status: string | undefined) => {
    const baseClasses = "px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1.5";
    
    // Si el status es undefined o null, usar estado por defecto
    if (!status) {
      return `${baseClasses} bg-gray-100 text-gray-800`;
    }
    
    switch (status.toLowerCase()) {
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'confirmed':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'processing':
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case 'shipped':
        return `${baseClasses} bg-purple-100 text-purple-800`;
      case 'delivered':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'cancelled':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  // Función para obtener las clases del badge de estado de pago
  const getPaymentStatusBadge = (status: string | undefined) => {
    const baseClasses = "px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1.5";
    
    // Si el status es undefined o null, usar estado por defecto
    if (!status) {
      return `${baseClasses} bg-gray-100 text-gray-800`;
    }
    
    switch (status.toLowerCase()) {
      case 'paid':
      case 'confirmed':
        return `${baseClasses} bg-emerald-100 text-emerald-800`;
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'rejected':
      case 'failed':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'partially_paid':
        return `${baseClasses} bg-orange-100 text-orange-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  // Función para obtener el texto del estado de la orden en español
  const getOrderStatusText = (status: string | undefined) => {
    if (!status) {
      return 'Sin Estado';
    }
    
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Pendiente';
      case 'confirmed':
        return 'Confirmado';
      case 'processing':
        return 'En Preparación';
      case 'shipped':
        return 'Enviado';
      case 'delivered':
        return 'Entregado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  // Función para obtener el texto del estado de pago en español
  const getPaymentStatusText = (status: string | undefined) => {
    // Si el status es undefined o null, usar texto por defecto
    if (!status) {
      return 'Sin Estado';
    }
    
    switch (status.toLowerCase()) {
      case 'paid':
        return 'Pagado';
      case 'confirmed':
        return 'Confirmado';
      case 'pending':
        return 'Pendiente';
      case 'rejected':
        return 'Rechazado';
      case 'failed':
        return 'Fallido';
      case 'partially_paid':
        return 'Pago Parcial';
      default:
        return status;
    }
  };

  // Funciones para facturas DEMOA
  const formatInvoicePrice = (amount: string) => {
    // Las facturas vienen en Bolívares como string
    // Convertir a número y formatear en VES
    const numAmount = parseFloat(amount);
    return formatPrice(numAmount, 'VES');
  };

  const getInvoiceStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'paid':
        return 'Pagada';
      default:
        return status;
    }
  };

  const getInvoiceOrderStatusText = (orderStatus: string) => {
    switch (orderStatus) {
      case 'active':
        return 'Activa';
      case 'processing':
        return 'En Proceso';
      case 'requires_attention':
        return 'Requiere Atención';
      default:
        return orderStatus;
    }
  };

  const getInvoiceStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1.5";
    
    switch (status) {
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'paid':
        return `${baseClasses} bg-emerald-100 text-emerald-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getInvoiceOrderStatusBadge = (orderStatus: string) => {
    const baseClasses = "px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1.5";
    
    switch (orderStatus) {
      case 'active':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'processing':
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case 'requires_attention':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const loading = loadingOrders || loadingInvoices;
  if (loading && !orders.length && !invoices.length) {
    return <LoadingSpinner variant="inline" message="Cargando pedidos y facturas..." />;
  }

  const hasOrders = orders.length > 0;
  const hasInvoices = invoices.length > 0;
  const hasAnyContent = hasOrders || hasInvoices;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-medical-gray-800">Mis Pedidos y Facturas</h2>
        {/* El botón de cambio de divisas está ahora en el navbar global */}
      </div>
      
      {hasAnyContent ? (
        <div className="space-y-6">
          {/* Sección de Pedidos */}
          {hasOrders && (
            <div>
              <h3 className="text-lg font-semibold text-medical-gray-700 mb-3">Pedidos</h3>
              <div className="space-y-4">
                {orders.map((order) => (
                  <motion.div
                    key={order.id}
                    className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div>
                      <p className="font-semibold">{order.order_number}</p>
                      <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <div className="flex gap-2 mb-2">
                        <span className={getOrderStatusBadge(order.status)}>
                          {getStatusIcon(order.status)}
                          {getOrderStatusText(order.status)}
                        </span>
                        {order.payment_status && getPaymentStatusText(order.payment_status) !== 'Sin Estado' && (
                          <span className={getPaymentStatusBadge(order.payment_status)}>
                            {getPaymentStatusText(order.payment_status)}
                          </span>
                        )}
                      </div>
                      <p className="font-semibold mt-1">
                        {formatOrderPrice(order)}
                      </p>
                      {getOriginalPriceText(order) && (
                        <p className="text-xs text-gray-500">
                          {getOriginalPriceText(order)}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {(order.payment_status === 'pending' || order.payment_status === 'partially_paid') && (
                        <button onClick={() => handlePay(order)} className="p-2 rounded-full hover:bg-green-100 text-green-600" title="Pagar">
                          <DollarSign className="w-5 h-5" />
                        </button>
                      )}
                      <button onClick={() => handleViewDetails(order.id)} className="p-2 rounded-full hover:bg-gray-100" title="Ver Detalles">
                        <Eye className="w-5 h-5" />
                      </button>
                      <Link 
                        to={`/tracking/${order.id}`} 
                        className="p-2 rounded-full hover:bg-blue-100 text-blue-600 transition-colors" 
                        title="Ver Tracking"
                      >
                        <Truck className="w-5 h-5" />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Sección de Facturas DEMOA */}
          {hasInvoices && (
            <div>
              <h3 className="text-lg font-semibold text-medical-gray-700 mb-3">Facturas DEMOA</h3>
              <div className="space-y-4">
                {invoices.map((invoice) => (
                  <motion.div
                    key={invoice.invoice_number}
                    className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center border-l-4 border-blue-500"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-semibold">{invoice.invoice_number}</p>
                        <p className="text-sm text-gray-500">
                          Emitida: {new Date(invoice.emission_date).toLocaleDateString()}
                        </p>
                        {invoice.due_date && (
                          <p className={`text-xs ${invoice.status === 'pending' ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                            Vence: {new Date(invoice.due_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="flex gap-2 mb-2">
                        <span className={getInvoiceStatusBadge(invoice.status)}>
                          {invoice.status === 'pending' ? <Clock className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                          {getInvoiceStatusText(invoice.status)}
                        </span>
                        <span className={getInvoiceOrderStatusBadge(invoice.order_status)}>
                          {getInvoiceOrderStatusText(invoice.order_status)}
                        </span>
                      </div>
                      <p className="font-semibold mt-1">
                        {formatInvoicePrice(invoice.total_amount)}
                      </p>
                      {invoice.status === 'pending' && parseFloat(invoice.balance) > 0 && (
                        <p className="text-xs text-red-600 font-medium">
                          Saldo pendiente: {formatInvoicePrice(invoice.balance)}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleViewInvoiceDetails(invoice.invoice_number)} 
                        className="p-2 rounded-full hover:bg-gray-100" 
                        title="Ver Detalles"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No tienes pedidos ni facturas aún.</p>
        </div>
      )}
      
      {isModalOpen && selectedOrder && (
        <OrderDetailsModal order={selectedOrder} onClose={() => {
          setIsModalOpen(false);
          setSelectedOrderId(null);
        }} />
      )}

      {isInvoiceModalOpen && selectedInvoice && (
        <InvoiceDetailsModal invoice={selectedInvoice} onClose={() => {
          setIsInvoiceModalOpen(false);
          setSelectedInvoiceNumber(null);
        }} />
      )}

      {isPaymentModalOpen && selectedOrder && (
        <PaymentModal order={selectedOrder} onClose={() => {
          setIsPaymentModalOpen(false);
          setSelectedOrderId(null);
        }} onPaymentCreated={handlePaymentCreated} />
      )}
    </div>
  );
};

export default OrdersSection;
