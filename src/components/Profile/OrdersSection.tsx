import React, { useState, useEffect } from 'react';
import { authService } from '../../services/AuthService';
import { motion } from 'framer-motion';
import { Package, ChevronRight, Eye, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import OrderDetailsModal from './OrderDetailsModal';
import { LoadingSpinner } from '../common/LoadingSpinner';

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

const OrdersSection: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  if (loading) {
    return <LoadingSpinner variant="inline" message="Cargando pedidos..." />;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-medical-gray-800">Mis Pedidos</h2>
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
                <p className="font-semibold mt-1">{order.total} {order.currency}</p>
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
