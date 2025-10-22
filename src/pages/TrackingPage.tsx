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
  ArrowLeft, 
  Download, 
  Info,
  User,
  CreditCard,
  ShoppingBag,
  Receipt
} from 'lucide-react';
import type { Order as ApiOrder} from '../types';
import { authService } from '../services/AuthService';
import { useGlobalCurrency } from '../contexts/GlobalCurrencyContext';
import type { Currency } from '../types';

// Tipo híbrido para compatibilidad con la UI existente
interface TrackingOrder extends Omit<ApiOrder, 'shipping_address'> {
  shipping_address: string | ApiOrder['shipping_address'];
  // Add missing _ref fields for currency conversion
  subtotal_ref?: number;
  shipping_cost_ref?: number;
  taxes_ref?: number;
  total_ref?: number;
  tracking_info?: {
    tracking_number: string;
    carrier: string;
    status: string;
    location: string;
    estimated_delivery: string;
    updates: Array<{
      date: string;
      status: string;
      location: string;
      description: string;
    }>;
  };
  invoice_url?: string;
}

const TrackingPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<TrackingOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currency, formatPriceFromBackend } = useGlobalCurrency();

  useEffect(() => {
    const loadOrder = async () => {
      console.log('TrackingPage: orderId recibido:', orderId);
      if (!orderId) {
        console.log('TrackingPage: No hay orderId, retornando');
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('TrackingPage: Cargando orden con ID:', orderId);
        const orderData = await authService.getOrderDetails(orderId);
        console.log('TrackingPage: Orden cargada:', orderData);
        setOrder(orderData);
      } catch (err: any) {
        console.error('TrackingPage: Error loading order:', err);
        setError(err.message || 'Error al cargar el pedido');
        setOrder(null);
      } finally {
        setIsLoading(false);
      }
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
        color: 'text-orange-700 bg-orange-100',
        icon: Package,
        description: 'Estamos preparando tu pedido'
      },
      shipped: {
        label: 'Enviado',
        color: 'text-indigo-700 bg-indigo-100',
        icon: Truck,
        description: 'Tu pedido está en camino'
      },
      in_transit: {
        label: 'En Tránsito',
        color: 'text-orange-700 bg-orange-100',
        icon: Truck,
        description: 'Tu pedido está en tránsito hacia su destino'
      },
      delivered: {
        label: 'Entregado',
        color: 'text-green-700 bg-green-100',
        icon: CheckCircle,
        description: 'Tu pedido ha sido entregado exitosamente'
      },
      cancelled: {
        label: 'Cancelado',
        color: 'text-red-700 bg-red-100',
        icon: Package,
        description: 'Tu pedido ha sido cancelado'
      },
      refunded: {
        label: 'Reembolsado',
        color: 'text-gray-700 bg-gray-100',
        icon: CheckCircle,
        description: 'Tu pedido ha sido reembolsado'
      }
    };
    
    return statusMap[status as keyof typeof statusMap] || statusMap.pending;
  };

  // Función para formatear precios usando los nuevos campos del endpoint
  const formatOrderPrice = (vesAmount: number, refAmount?: number) => {
    switch (currency) {
      case 'VES':
        return formatPrice(vesAmount, 'VES');
      case 'USD':
      case 'REF':
        if (refAmount !== undefined) {
          return formatPrice(refAmount, 'USD');
        }
        // Fallback: usar formatPriceFromBackend
        return formatPriceFromBackend(vesAmount);
      default:
        return formatPrice(vesAmount, order?.currency as Currency);
    }
  };

  // Función para formatear precios de items individuales
  const formatItemPrice = (item: any) => {
    switch (currency) {
      case 'VES':
        return formatPrice(item.total_price, 'VES');
      case 'USD':
      case 'REF':
        if (item.total_price_ref !== undefined) {
          return formatPrice(item.total_price_ref, 'USD');
        }
        return formatPriceFromBackend(item.total_price);
      default:
        return formatPrice(item.total_price, order?.currency as Currency);
    }
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

  // Función para determinar si un paso está completado basándose en el estado actual
  const getStepCompletionStatus = (currentStatus: string, stepKey: string): boolean => {
    const stepOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const currentIndex = stepOrder.indexOf(currentStatus);
    const stepIndex = stepOrder.indexOf(stepKey);
    
    // Si el estado actual es posterior al paso, entonces el paso está completado
    return currentIndex > stepIndex;
  };

  // Función para calcular el porcentaje de progreso del pedido
  const getProgressPercentage = (status: string): number => {
    const stepOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const currentIndex = stepOrder.indexOf(status);
    
    if (currentIndex === -1) return 0; // Estado no reconocido
    
    // Calcular porcentaje basado en la posición del estado actual
    return ((currentIndex + 1) / stepOrder.length) * 100;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-medical-gray-50 pt-24 pb-12">
        <div className="medical-container">
          <div className="bg-white rounded-2xl shadow-soft p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-medical-gray-200 rounded w-1/3"></div>
              <div className="space-y-3">
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

  if (error) {
    return (
      <div className="min-h-screen bg-medical-gray-50 pt-24 pb-12">
        <div className="medical-container">
          <div className="bg-white rounded-2xl shadow-soft p-6 text-center">
            <Package className="w-16 h-16 text-red-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-medical-gray-900 mb-2">
              Error al cargar el pedido
            </h1>
            <p className="text-medical-gray-600 mb-6">
              {error}
            </p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => window.location.reload()} 
                className="btn-medical-primary"
              >
                Reintentar
              </button>
              <Link to="/perfil" className="btn-medical-secondary">
                Volver a mis pedidos
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-medical-gray-50 pt-24 pb-12">
        <div className="medical-container">
          <div className="bg-white rounded-2xl shadow-soft p-6 text-center">
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
    <div className="min-h-screen bg-medical-gray-50 pt-24 pb-12">
      <div className="medical-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-3">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progreso del Pedido - Pasos Visuales */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-soft p-6"
            >
              <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-medical-gray-900">
                  Progreso del Pedido
                    </h2>
                <div className="flex gap-2">
                  {order.invoice_url && (
                    <button className="btn-medical-primary flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Factura
                    </button>
                  )}
                </div>
              </div>

              {/* Pasos del Progreso */}
              <div className="relative">
                {/* Mensaje especial para estados cancelados o reembolsados */}
                {(order.status === 'cancelled' || order.status === 'refunded') ? (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 rounded-full">
                        <Package className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-red-900">
                          {order.status === 'cancelled' ? 'Pedido Cancelado' : 'Pedido Reembolsado'}
                        </div>
                        <div className="text-sm text-red-700">
                          {order.status === 'cancelled' 
                            ? 'Este pedido ha sido cancelado y no continuará su proceso normal.'
                            : 'Este pedido ha sido reembolsado exitosamente.'
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Indicador de Progreso General */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-medical-gray-700">Progreso del pedido</span>
                        <span className="text-sm font-bold text-medical-blue-600">
                          {Math.round(getProgressPercentage(order.status))}%
                        </span>
                      </div>
                      <div className="w-full bg-medical-gray-200 rounded-full h-2">
                        <div 
                          className="bg-medical-blue-500 h-2 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${getProgressPercentage(order.status)}%` }}
                        ></div>
                      </div>
                    </div>
                  </>
                )}

                {/* Pasos del Progreso - Solo mostrar si no está cancelado o reembolsado */}
                {!(order.status === 'cancelled' || order.status === 'refunded') && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
                    {[
                      { key: 'pending', label: 'Pendiente', icon: Clock, description: 'Pedido recibido' },
                      { key: 'confirmed', label: 'Confirmado', icon: CheckCircle, description: 'Pedido confirmado' },
                      { key: 'processing', label: 'En Preparación', icon: Package, description: 'Preparando pedido' },
                      { key: 'shipped', label: 'Enviado', icon: Truck, description: 'Pedido en camino' },
                      { key: 'delivered', label: 'Entregado', icon: CheckCircle, description: 'Pedido entregado' }
                    ].map((step, index) => {
                    const StepIcon = step.icon;
                    const isActive = order.status === step.key;
                    const isCompleted = getStepCompletionStatus(order.status, step.key);
                    
                    return (
                      <div key={step.key} className="flex flex-col items-center relative">
                        {/* Línea conectora */}
                        {index < 4 && (
                          <div className={`absolute top-6 left-1/2 w-full h-0.5 transform -translate-y-1/2 ${
                            isCompleted ? 'bg-medical-blue-500' : 'bg-medical-gray-200'
                          }`}></div>
                        )}
                        
                        {/* Paso */}
                        <motion.div 
                          className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                            isCompleted 
                              ? 'bg-medical-blue-500 border-medical-blue-500 text-white shadow-lg' 
                              : isActive 
                                ? 'bg-medical-blue-100 border-medical-blue-500 text-medical-blue-700 shadow-md'
                                : 'bg-white border-medical-gray-200 text-medical-gray-400'
                          }`}
                          animate={{
                            scale: isActive ? [1, 1.1, 1] : 1,
                          }}
                          transition={{
                            duration: 2,
                            repeat: isActive ? Infinity : 0,
                            ease: "easeInOut"
                          }}
                        >
                          {isCompleted ? (
                            <CheckCircle className="w-6 h-6" />
                          ) : (
                            <StepIcon className="w-6 h-6" />
                          )}
                        </motion.div>
                        
                        {/* Etiqueta */}
                        <div className="mt-3 text-center">
                          <div className={`text-sm font-semibold ${
                            isCompleted || isActive ? 'text-medical-gray-900' : 'text-medical-gray-500'
                          }`}>
                            {step.label}
                          </div>
                          <div className={`text-xs ${
                            isCompleted || isActive ? 'text-medical-gray-600' : 'text-medical-gray-400'
                          }`}>
                            {step.description}
                          </div>
                        </div>
                        
                        {/* Indicador de estado actual */}
                        {isActive && (
                          <motion.div 
                            className="mt-2 px-3 py-1 bg-medical-blue-100 text-medical-blue-700 text-xs font-medium rounded-full"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                          >
                            Estado Actual
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </div>
                )}
              </div>

              {/* Información adicional del estado actual */}
              <div className="mt-4 p-3 bg-medical-blue-50 rounded-xl border border-medical-blue-200">
                  <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${statusInfo.color}`}>
                    <StatusIcon className="w-5 h-5" />
                  </div>
                    <div>
                      <div className="font-semibold text-medical-blue-900">
                      Estado Actual: {statusInfo.label}
                    </div>
                    <div className="text-sm text-medical-blue-700">
                      {statusInfo.description}
                    </div>
                  </div>
                </div>
              </div>

              {/* Fecha estimada de entrega */}
              {order.tracking_info?.estimated_delivery && (
                <div className="mt-3 p-3 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="font-semibold text-green-900">
                        Entrega estimada
                      </div>
                      <div className="text-sm text-green-700">
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
                className="bg-white rounded-2xl shadow-soft p-6"
              >
                <h3 className="text-base font-bold text-medical-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Historial de Seguimiento
                </h3>

                <div className="space-y-4">
                  {order.tracking_info.updates.map((update: any, index: number) => (
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
              className="bg-white rounded-2xl shadow-soft p-6"
            >
              <h3 className="text-base font-bold text-medical-gray-900 mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Productos del Pedido
              </h3>

              <div className="space-y-3">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-4 p-3 bg-medical-gray-50 rounded-xl">
                    {item.product_image ? (
                      <img 
                        src={item.product_image} 
                        alt={item.product_name} 
                        className="w-16 h-16 rounded-lg object-cover bg-medical-gray-100"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = 'https://via.placeholder.com/64x64.png?text=Sin+Imagen';
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 bg-medical-gray-200 rounded-lg flex items-center justify-center">
                        <Package className="w-8 h-8 text-medical-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-medical-gray-900">{item.product_name}</h4>
                      <p className="text-sm text-medical-gray-600">
                        Cantidad: {item.quantity} • {item.selected_presentation}
                      </p>
                      {item.product_brand && (
                        <p className="text-xs text-medical-gray-500">Marca: {item.product_brand}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-medical-gray-900">
                        {formatItemPrice(item)}
                      </div>
                      <div className="text-sm text-medical-gray-600">
                        {formatOrderPrice(item.unit_price, item.unit_price_ref)} c/u
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-medical-gray-200">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-medical-gray-600">Subtotal:</span>
                    <span className="font-medium text-medical-gray-900">
                      {formatOrderPrice(order.subtotal, order.subtotal_ref)}
                    </span>
                  </div>
                  
                  {order.shipping_cost > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-medical-gray-600">Envío:</span>
                      <span className="font-medium text-medical-gray-900">
                        {formatOrderPrice(order.shipping_cost, order.shipping_cost_ref)}
                      </span>
                    </div>
                  )}
                  
                  {order.taxes > 0 && (
                <div className="flex justify-between items-center">
                      <span className="text-medical-gray-600">Impuestos:</span>
                      <span className="font-medium text-medical-gray-900">
                        {formatOrderPrice(order.taxes, order.taxes_ref)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center pt-2 border-t border-medical-gray-200">
                  <span className="text-lg font-semibold text-medical-gray-900">Total del pedido:</span>
                  <span className="text-xl font-bold text-medical-blue-700">
                    {formatOrderPrice(order.total, order.total_ref)}
                  </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Información del transportista */}
            {order.tracking_info && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-soft p-5"
              >
                <h3 className="font-bold text-medical-gray-900 mb-3 flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Información de Envío
                </h3>
                
                <div className="space-y-3">
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
              className="bg-white rounded-2xl shadow-soft p-5"
            >
              <h3 className="font-bold text-medical-gray-900 mb-3 flex items-center gap-2">
                <Info className="w-5 h-5" />
                Detalles del Pedido
              </h3>
              
              <div className="space-y-3">
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
                  <div className="text-sm text-medical-gray-600 mb-1">Estado del pago</div>
                  <div className="font-semibold text-medical-gray-900">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      order.payment_status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : order.payment_status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : order.payment_status === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {order.payment_status === 'completed' ? '✅ Pago Confirmado' : 
                       order.payment_status === 'pending' ? '⏳ Pendiente de Verificación' : 
                       order.payment_status === 'failed' ? '❌ Pago Rechazado' :
                       order.payment_status}
                    </span>
                  </div>
                </div>

                {order.payment_reference && (
                  <div>
                    <div className="text-sm text-medical-gray-600 mb-1">Referencia de pago</div>
                    <div className="font-mono font-semibold text-medical-gray-900 text-sm">
                      {order.payment_reference}
                    </div>
                  </div>
                )}

                {/* Información de verificación de pago */}
                {order.payment_capture_url && (
                  <div className="p-3 bg-medical-blue-50 rounded-xl border border-medical-blue-200">
                    <div className="text-sm text-medical-gray-600 mb-2">Comprobante de Pago</div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => window.open(order.payment_capture_url, '_blank', 'noopener,noreferrer')}
                        className="btn-medical-primary flex items-center gap-2 text-sm px-3 py-2"
                      >
                        <Receipt className="w-4 h-4" />
                        Ver Comprobante
                      </button>
                    </div>
                    
                  </div>
                )}

                {order.tracking_number && (
                  <div>
                    <div className="text-sm text-medical-gray-600 mb-1">Número de tracking</div>
                    <div className="font-mono font-semibold text-medical-gray-900 text-sm">
                      {order.tracking_number}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-sm text-medical-gray-600 mb-1">Dirección de entrega</div>
                  <div className="font-semibold text-medical-gray-900 flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5" />
                    <span className="text-sm">
                      {typeof order.shipping_address === 'string' 
                        ? order.shipping_address 
                        : order.shipping_address?.street 
                          ? `${order.shipping_address.street}, ${order.shipping_address.city}, ${order.shipping_address.state}`
                          : 'Dirección no disponible'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Acciones rápidas */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl shadow-soft p-5"
            >
              <h3 className="font-bold text-medical-gray-900 mb-3">¿Necesitas ayuda?</h3>
              
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