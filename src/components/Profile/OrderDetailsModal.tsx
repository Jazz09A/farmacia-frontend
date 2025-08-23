import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';

const OrderDetailsModal = ({ order, onClose }) => {
  if (!order) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
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
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div><strong>Estado:</strong> {order.status}</div>
              <div><strong>Total:</strong> {order.total} {order.currency}</div>
              <div><strong>Método de Pago:</strong> {order.payment_method}</div>
              <div><strong>Estado del Pago:</strong> {order.payment_status}</div>
            </div>

            {/* Shipping Address */}
            <div className="mb-6">
              <h4 className="font-bold mb-2">Dirección de Envío</h4>
              <p>{order.shipping_address.recipient_name}</p>
              <p>{order.shipping_address.street}, {order.shipping_address.city}, {order.shipping_address.state}</p>
              <p>{order.shipping_address.recipient_phone}</p>
            </div>

            {/* Items */}
            <div>
              <h4 className="font-bold mb-2">Artículos</h4>
              {order.items.map(item => (
                <div key={item.id} className="flex items-center space-x-4 border-b py-2">
                  <img src={item.product_image} alt={item.product_name} className="w-16 h-16 rounded-md"/>
                  <div className="flex-grow">
                    <p className="font-semibold">{item.product_name}</p>
                    <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p>{item.total_price} {order.currency}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default OrderDetailsModal;
