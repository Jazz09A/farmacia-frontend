import React, { useState, useEffect } from 'react';
import { authService } from '../../services/AuthService';
import { motion } from 'framer-motion';
import { Eye, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import OrderDetailsModal from './OrderDetailsModal';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useGlobalCurrency } from '../../contexts/GlobalCurrencyContext';
import type { Currency } from '../../types';

// Define interfaces for Order and OrderDetails to use TypeScript benefits
interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total: number;
  total_ref?: number;
  currency: string;
  exchange_rate?: number;
  item_count: number;
  created_at: string;
}

const OrdersSection: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { currency, formatPrice, convertPrice, getPriceInCurrency } = useGlobalCurrency();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const userOrders = await authService.getUserOrders();
        setOrders(userOrders);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleViewDetails = async (orderId: string) => {
    try {
      const details = await authService.getOrderDetails(orderId);
      setSelectedOrder(details);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Failed to fetch order details:", error);
    }
  };

  // Función para formatear el precio de la orden usando los campos del endpoint
  const formatOrderPrice = (order: Order) => {
    // Seleccionar el precio correcto basado en la moneda actual
    switch (currency) {
      case 'VES':
        // Si estamos mostrando en VES, usar el campo total (que viene en VES)
        return formatPrice(order.total, 'VES');
      
      case 'USD':
      case 'REF':
        // Si estamos mostrando en USD/REF y tenemos total_ref disponible
        if (order.total_ref !== undefined) {
          return formatPrice(order.total_ref, 'USD');
        }
        // Fallback: usar getPriceInCurrency para convertir
        return formatPrice(getPriceInCurrency(order.total, order.total_ref || 0), currency);
      
      default:
        return formatPrice(order.total, order.currency as Currency);
    }
  };

  // Función para mostrar el precio original si es diferente
  const getOriginalPriceText = (order: Order) => {
    // Mostrar precio original solo cuando estamos mostrando una conversión
    const isShowingConversion = (
      // Si mostramos USD/REF pero tenemos total_ref
      ((currency === 'USD' || currency === 'REF') && order.total_ref !== undefined) ||
      // Si mostramos VES pero la orden original no era en VES
      (currency === 'VES' && order.currency !== 'VES')
    );
    
    if (isShowingConversion) {
      const originalPrice = Math.round(order.total * 100) / 100;
      return `Original: ${originalPrice} ${order.currency}`;
    }
    
    return null;
  };

  if (loading) {
    return <LoadingSpinner variant="inline" message="Cargando pedidos..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-medical-gray-800">Mis Pedidos</h2>
        {/* El botón de cambio de divisas está ahora en el navbar global */}
      </div>
      
      {orders.length > 0 ? (
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
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.status}
                  </span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    order.payment_status === 'paid' || order.payment_status === 'confirmed'
                      ? 'bg-green-100 text-green-800' 
                      : order.payment_status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : order.payment_status === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {order.payment_status === 'paid' ? 'Pagado' : 
                     order.payment_status === 'pending' ? 'Pago Pendiente' : 
                     order.payment_status === 'confirmed' ? 'Pago Confirmado' :
                     order.payment_status === 'rejected' ? 'Pago Rechazado' :
                     order.payment_status}
                  </span>
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
                <button onClick={() => handleViewDetails(order.id)} className="p-2 rounded-full hover:bg-gray-100" title="Ver Detalles">
                  <Eye className="w-5 h-5" />
                </button>
                <Link 
                  to={`/tracking/${order.id}`} 
                  className="p-2 rounded-full hover:bg-blue-100 text-blue-600 transition-colors" 
                  title="Ver Tracking"
                  onClick={() => console.log('Navegando a tracking:', `/tracking/${order.id}`)}
                >
                  <Truck className="w-5 h-5" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <p>No tienes pedidos aún.</p>
      )}
      
      {isModalOpen && (
        <OrderDetailsModal order={selectedOrder} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
};

export default OrdersSection;
