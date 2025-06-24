import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Package, 
  Truck, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle, 
  Phone, 
  Mail, 
  ArrowLeft, 
  Download, 
  Share2,
  AlertCircle,
  Info,
  User,
  Building,
  CreditCard,
  ShoppingBag
} from 'lucide-react';
import type { Order } from '../types/profile';
import { mockOrders } from '../data/profileMockData';

const TrackingPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOrder = () => {
      setIsLoading(true);
      const foundOrder = mockOrders.find(o => o.id === orderId);
      
      setTimeout(() => {
        setOrder(foundOrder || null);
        setIsLoading(false);
      }, 800);
    };

    loadOrder();
  }, [orderId]);

  const getStatusInfo = (status: string) => {
    const statusMap = {
      pending: {
        label: 'Pendiente',
        color: 'text-yellow-700 bg-yellow-100',
        icon: Clock,
        description: 'Tu pedido está siendo procesado'
      },
      confirmed: {
        label: 'Confirmado',
        color: 'text-blue-700 bg-blue-100',
        icon: CheckCircle,
        description: 'Tu pedido ha sido confirmado'
      },
      processing: {
        label: 'En Preparación',
        color: 'text-purple-700 bg-purple-100',
        icon: Package,
        description: 'Estamos preparando tu pedido'
      },
      shipped: {
        label: 'Enviado',
        color: 'text-indigo-700 bg-indigo-100',
        icon: Truck,
        description: 'Tu pedido está en camino'
      },
      delivered: {
        label: 'Entregado',
        color: 'text-green-700 bg-green-100',
        icon: CheckCircle,
        description: 'Tu pedido ha sido entregado exitosamente'
      }
    };
    
    return statusMap[status as keyof typeof statusMap] || statusMap.pending;
  };

  const formatCurrency = (amount: number, currency: 'VES' | 'USD') => {
    const formatters = {
      USD: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
      VES: new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' })
    };
    return formatters[currency].format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-VE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-medical-gray-50 pt-32 pb-16">
        <div className="medical-container">
          <div className="bg-white rounded-2xl shadow-soft p-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-medical-gray-200 rounded w-1/3"></div>
              <div className="space-y-4">
                <div className="h-4 bg-medical-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-medical-gray-200 rounded w-2/3"></div>
                <div className="h-32 bg-medical-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-medical-gray-50 pt-32 pb-16">
        <div className="medical-container">
          <div className="bg-white rounded-2xl shadow-soft p-8 text-center">
            <Package className="w-16 h-16 text-medical-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-medical-gray-900 mb-2">
              Pedido no encontrado
            </h1>
            <p className="text-medical-gray-600 mb-6">
              No se pudo encontrar el pedido especificado
            </p>
            <Link to="/perfil" className="btn-medical-primary">
              Volver a mis pedidos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-medical-gray-50 pt-32 pb-16">
      <div className="medical-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-medical-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-medical-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-medical-gray-900">
                Seguimiento del Pedido
              </h1>
              <p className="text-medical-gray-600">#{order.order_number}</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Estado actual */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-soft p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${statusInfo.color}`}>
                    <StatusIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-medical-gray-900">
                      {statusInfo.label}
                    </h2>
                    <p className="text-medical-gray-600">{statusInfo.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {order.invoice_url && (
                    <button className="btn-medical-primary flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Factura
                    </button>
                  )}
                </div>
              </div>

              {order.tracking_info?.estimated_delivery && (
                <div className="p-4 bg-medical-blue-50 rounded-xl border border-medical-blue-200">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-medical-blue-600" />
                    <div>
                      <div className="font-semibold text-medical-blue-900">
                        Entrega estimada
                      </div>
                      <div className="text-sm text-medical-blue-700">
                        {formatDate(order.tracking_info.estimated_delivery)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Timeline de tracking */}
            {order.tracking_info && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-soft p-8"
              >
                <h3 className="text-lg font-bold text-medical-gray-900 mb-6 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Historial de Seguimiento
                </h3>

                <div className="space-y-6">
                  {order.tracking_info.updates.map((update, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative flex gap-4"
                    >
                      {index !== order.tracking_info!.updates.length - 1 && (
                        <div className="absolute left-4 top-8 w-0.5 h-16 bg-medical-gray-200"></div>
                      )}
                      
                      <div className="relative">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          index === 0 
                            ? 'bg-medical-blue-gradient text-white' 
                            : 'bg-medical-gray-100 text-medical-gray-500'
                        }`}>
                          {index === 0 ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <div className="w-2 h-2 bg-current rounded-full"></div>
                          )}
                        </div>
                      </div>

                      <div className="flex-1 pb-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-medical-gray-900">
                              {update.status}
                            </h4>
                            <p className="text-sm text-medical-gray-600 mb-1">
                              {update.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-medical-gray-500">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {update.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDate(update.date)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Productos del pedido */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-soft p-8"
            >
              <h3 className="text-lg font-bold text-medical-gray-900 mb-6 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Productos del Pedido
              </h3>

              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 bg-medical-gray-50 rounded-xl">
                    <div className="w-16 h-16 bg-medical-gray-200 rounded-lg flex items-center justify-center">
                      <Package className="w-8 h-8 text-medical-gray-500" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-medical-gray-900">{item.product_name}</h4>
                      <p className="text-sm text-medical-gray-600">Cantidad: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-medical-gray-900">
                        {formatCurrency(item.price * item.quantity, item.currency)}
                      </div>
                      <div className="text-sm text-medical-gray-600">
                        {formatCurrency(item.price, item.currency)} c/u
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-medical-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-medical-gray-900">Total del pedido:</span>
                  <span className="text-xl font-bold text-medical-blue-700">
                    {formatCurrency(order.total, order.currency)}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Información del transportista */}
            {order.tracking_info && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-soft p-6"
              >
                <h3 className="font-bold text-medical-gray-900 mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Información de Envío
                </h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-medical-blue-50 rounded-xl">
                    <div className="text-sm text-medical-gray-600 mb-1">Transportista</div>
                    <div className="font-semibold text-medical-gray-900">
                      {order.tracking_info.carrier}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-medical-gray-50 rounded-xl">
                    <div className="text-sm text-medical-gray-600 mb-1">Número de seguimiento</div>
                    <div className="font-mono font-semibold text-medical-gray-900">
                      {order.tracking_info.tracking_number}
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 rounded-xl">
                    <div className="text-sm text-medical-gray-600 mb-1">Ubicación actual</div>
                    <div className="font-semibold text-medical-gray-900">
                      {order.tracking_info.location}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Información del pedido */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-soft p-6"
            >
              <h3 className="font-bold text-medical-gray-900 mb-4 flex items-center gap-2">
                <Info className="w-5 h-5" />
                Detalles del Pedido
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-medical-gray-600 mb-1">Fecha del pedido</div>
                  <div className="font-semibold text-medical-gray-900">
                    {formatDate(order.created_at)}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-medical-gray-600 mb-1">Método de pago</div>
                  <div className="font-semibold text-medical-gray-900 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    {order.payment_method}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-medical-gray-600 mb-1">Dirección de entrega</div>
                  <div className="font-semibold text-medical-gray-900 flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5" />
                    <span className="text-sm">{order.shipping_address}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Acciones rápidas */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl shadow-soft p-6"
            >
              <h3 className="font-bold text-medical-gray-900 mb-4">¿Necesitas ayuda?</h3>
              
              <div className="space-y-3">
                <Link 
                  to="/perfil" 
                  className="w-full btn-medical-secondary flex items-center gap-2 justify-center"
                >
                  <User className="w-4 h-4" />
                  Ir al Perfil
                </Link>
                
                <button className="w-full btn-medical-primary flex items-center gap-2 justify-center">
                  <Package className="w-4 h-4" />
                  Reportar Problema
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackingPage; 