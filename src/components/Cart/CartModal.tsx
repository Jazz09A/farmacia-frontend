import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import { useGlobalCurrency } from '../../contexts/GlobalCurrencyContext';
import { useCart } from '../../contexts/CartContext';
import { DiscountSummary } from '../Discounts';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
}

export const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  onUpdateQuantity,
  onRemoveItem
}) => {
  const { cartWithDiscounts, loading, refreshCartWithDiscounts } = useCart();
  const { currency, formatPriceFromBackend } = useGlobalCurrency();
  
  useEffect(() => {
    if (isOpen) {
      refreshCartWithDiscounts();
    }
  }, [isOpen, refreshCartWithDiscounts]);

  if (loading) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.div
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex items-center justify-center"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              <LoadingSpinner message="Cargando carrito..." />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  if (!cartWithDiscounts || cartWithDiscounts.items.length === 0) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.div
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Tu carrito está vacío</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Calcular totales
  const originalTotal = cartWithDiscounts.total;
  const totalWithDiscounts = cartWithDiscounts.discounts.subtotal_after_discounts;
  const totalSavings = cartWithDiscounts.discounts.total_discount;

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
                  Carrito ({cartWithDiscounts.total_items})
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
              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cartWithDiscounts.items.map((item) => {
                  const flashDiscount = cartWithDiscounts.discounts.flash_discounts[item.product.id] || 0;
                  const itemPrice = parseFloat(item.product.price);
                  const discountedPrice = flashDiscount > 0 ? itemPrice - flashDiscount : itemPrice;
                  
                  return (
                    <motion.div
                      key={item.id}
                      className="flex items-center space-x-4 bg-gray-50 rounded-lg p-4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      layout
                    >
                      <img
                        src={(item.product.images && item.product.images.length > 1 ? item.product.images[1] : item.product.image) || 'https://via.placeholder.com/150'}
                        alt={item.product.name || 'Producto'}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm mb-1">
                          {item.product.name}
                        </h4>
                        <p className="text-gray-500 text-xs mb-2">{item.product.brand}</p>
                        <div className="flex items-center space-x-2">
                          {flashDiscount > 0 ? (
                            <>
                              <span className="text-sm text-gray-400 line-through">
                                {formatPriceFromBackend(item.product.price)}
                              </span>
                              <span className="font-semibold text-green-600">
                                {formatPriceFromBackend(discountedPrice.toString())}
                              </span>
                              <span className="text-xs bg-green-100 text-green-800 px-1 rounded">
                                -{formatPriceFromBackend(flashDiscount.toString())}
                              </span>
                            </>
                          ) : (
                            <span className="font-semibold text-blue-600">
                              {formatPriceFromBackend(item.product.price)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end space-y-2">
                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2">
                          <motion.button
                            onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Minus className="h-4 w-4 text-gray-600" />
                          </motion.button>
                          
                          <span className="w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          
                          <motion.button
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
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
                  );
                })}
              </div>

              {/* Descuentos aplicados */}
              <div className="px-6">
                <DiscountSummary
                  discounts={cartWithDiscounts.discounts}
                  currency={currency}
                  formatPrice={formatPriceFromBackend}
                />
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 p-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">
                      {formatPriceFromBackend(originalTotal.toString())}
                    </span>
                  </div>
                  
                  {totalSavings > 0 && (
                    <div className="flex justify-between items-center text-green-600">
                      <span>Descuentos:</span>
                      <span className="font-medium">
                        -{formatPriceFromBackend(totalSavings.toString())}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span className="text-blue-600">
                      {formatPriceFromBackend(totalWithDiscounts.toString())}
                    </span>
                  </div>
                </div>
                
                <motion.button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Proceder al Checkout
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};