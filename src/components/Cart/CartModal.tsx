import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import { Cart, CartItem } from '../../types';
import { authService } from '../../services/AuthService';
interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: 'VES' | 'REF';
  formatPrice: (priceVES: number, priceREF: number) => string;
  totalPrice: number;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
}

export const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  currency,
  formatPrice,
  totalPrice,
  onUpdateQuantity,
  onRemoveItem
}) => {
  const [cart, setCart] = useState<Cart | null>(null);
  useEffect(() => {
    authService.getCart().then((cart) => {
      setCart(cart);
    });
  }, []);
  const totalFormatted = currency === 'VES' 
    ? `Bs. ${totalPrice.toLocaleString('es-VE')}`
    : `$ ${totalPrice.toFixed(2)}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Carrito ({cart?.total_items || 0})
                </h2>
              </div>
              <motion.button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="h-5 w-5 text-gray-500" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col">
              {cart?.total_items === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">Tu carrito está vacío</p>
                    <motion.button
                      onClick={onClose}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Continuar Comprando
                    </motion.button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Items List */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {cart?.items.map((item) => (
                      <motion.div
                        key={item.id}
                        className="flex items-center space-x-4 bg-gray-50 rounded-lg p-4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        layout
                      >
                        <img
                          src={item.product.image || 'https://via.placeholder.com/150'}
                          alt={item.product.name || 'Producto'}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm mb-1">
                            {item.product.name}
                          </h4>
                          <p className="text-gray-500 text-xs mb-2">{item.product.brand}</p>
                          <p className="font-semibold text-blue-600">
                            {formatPrice(item.product.price_ves || 0, item.product.price_ref || 0)}
                          </p>
                        </div>

                        <div className="flex flex-col items-end space-y-2">
                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-2">
                            <motion.button
                              onClick={() => onUpdateQuantity(item.id, item.quantity || 0 - 1)}
                              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Minus className="h-4 w-4 text-gray-600" />
                            </motion.button>
                            
                            <span className="w-8 text-center font-medium">
                              {item.quantity || 0}
                            </span>
                            
                            <motion.button
                              onClick={() => onUpdateQuantity(item.id, item.quantity || 0 + 1)}
                              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Plus className="h-4 w-4 text-gray-600" />
                            </motion.button>
                          </div>

                          {/* Remove Button */}
                          <motion.button
                            onClick={() => onRemoveItem(item.id)}
                            className="p-1 hover:bg-red-100 text-red-500 rounded-full transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="border-t border-gray-200 p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Total:</span>
                      <span className="text-2xl font-bold text-blue-600">{totalFormatted}</span>
                    </div>
                    
                    <motion.button
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-xl font-semibold text-lg shadow-lg transition-all duration-300"
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Proceder al Pago
                    </motion.button>
                    
                    <motion.button
                      onClick={onClose}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-xl font-medium transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Continuar Comprando
                    </motion.button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};