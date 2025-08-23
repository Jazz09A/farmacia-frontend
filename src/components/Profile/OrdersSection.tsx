import React, { useState, useEffect } from 'react';
import { authService } from '../../services/AuthService';
import { motion } from 'framer-motion';
import { Eye, Truck, DollarSign, Hash, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import OrderDetailsModal from './OrderDetailsModal';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useCurrency } from '../../hooks/useCurrency';
import type { Currency } from '../../types';

// Define interfaces for Order and OrderDetails to use TypeScript benefits
interface Order {
  id: string;
  order_number: string;
  status: string;
  total: number;
  currency: string;
  item_count: number;
  created_at: string;
}

// Componente de toggle de moneda simplificado para el perfil (similar al navbar)
const ProfileCurrencyToggle: React.FC = () => {
  const { currency, toggleCurrency } = useCurrency();
  const [isConverting, setIsConverting] = useState(false);

  // Simular conversión con loading state (igual que el navbar)
  const handleToggle = () => {
    setIsConverting(true);
    setTimeout(() => {
      toggleCurrency();
      setIsConverting(false);
    }, 600);
  };

  return (
    <motion.button
      onClick={handleToggle}
      disabled={isConverting}
      className="relative flex items-center px-4 py-3 rounded-full transition-all duration-300 backdrop-blur-md border bg-white/90 text-medical-blue-900 border-gray-200 hover:bg-white hover:shadow-md"
      whileHover={!isConverting ? { 
        scale: 1.05,
        rotate: [0, -2, 2, 0],
      } : {}}
      whileTap={!isConverting ? { 
        scale: 0.95 
      } : {}}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 17,
        rotate: { duration: 0.5 } 
      }}
    >
      <div className="flex items-center space-x-2">
        {/* Currency Icon with Flip Animation */}
        <motion.div
          className="relative w-5 h-5 flex items-center justify-center"
          key={currency}
          initial={{ rotateY: -90, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          transition={{ 
            duration: 0.5, 
            type: "spring", 
            stiffness: 300, 
            damping: 20 
          }}
        >
          {isConverting ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : currency === 'REF' ? (
            <DollarSign className="h-5 w-5" />
          ) : (
            <Hash className="h-5 w-5" />
          )}
        </motion.div>

        {/* Currency Label */}
        <motion.div
          className="flex flex-col items-start"
          key={`${currency}-container`}
          initial={{ x: 10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <motion.span
            className="text-sm font-semibold leading-none"
            key={`${currency}-label`}
            initial={{ y: 5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            {currency}
          </motion.span>
          <motion.span
            className="text-xs leading-none mt-0.5 text-gray-500"
            initial={{ y: 5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.25 }}
          >
            {currency === 'REF' ? 'US Dollar' : 'Bolívar'}
          </motion.span>
        </motion.div>
      </div>

      {/* Conversion Loading Bar */}
      {isConverting && (
        <motion.div
          className="absolute bottom-0 left-0 h-0.5 rounded-b-full bg-blue-500"
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 0.6 }}
        />
      )}

      {/* Pulse Ring Animation on Currency Change */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-blue-400"
        initial={{ scale: 1, opacity: 0 }}
        animate={{
          scale: isConverting ? [1, 1.2, 1] : 1,
          opacity: isConverting ? [0, 0.3, 0] : 0
        }}
        transition={{ duration: 0.6 }}
        key={`${currency}-pulse-${isConverting}`}
      />
    </motion.button>
  );
};

const OrdersSection: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { currency, formatPrice, convertPrice } = useCurrency();

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

  // Función para formatear el precio de la orden (mejorada)
  const formatOrderPrice = (total: number, orderCurrency: string) => {
    // Limpiar números decimales muy largos (ej: 2726.4644000000003)
    const cleanTotal = Math.round(total * 100) / 100;
    
    // Si la moneda del pedido es diferente a la seleccionada, convertir
    if (orderCurrency !== currency) {
      const convertedPrice = convertPrice(cleanTotal, orderCurrency as Currency, currency);
      return formatPrice(convertedPrice, currency);
    }
    return formatPrice(cleanTotal, currency as Currency);
  };

  if (loading) {
    return <LoadingSpinner variant="inline" message="Cargando pedidos..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-medical-gray-800">Mis Pedidos</h2>
        <ProfileCurrencyToggle />
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
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  order.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.status}
                </span>
                <p className="font-semibold mt-1">
                  {formatOrderPrice(order.total, order.currency)}
                </p>
                {order.currency !== currency && (
                  <p className="text-xs text-gray-500">
                    Original: {Math.round(order.total * 100) / 100} {order.currency}
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
