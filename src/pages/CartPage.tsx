import React from 'react';
import { Link } from 'react-router-dom';
import { useGlobalCurrency } from '../contexts/GlobalCurrencyContext';
import { motion } from 'framer-motion';
import { Plus, Minus, ShoppingCart, ArrowLeft, Trash2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { DiscountProgressWidget } from '../components/Discounts';

const CartPage: React.FC = () => {
  const { formatPriceFromBackend, currency } = useGlobalCurrency();
  const { cart, loading, updateQuantity, removeFromCart } = useCart();

  const handleIncreaseQuantity = async (itemId: string, currentQuantity: number) => {
    try {
      await updateQuantity(itemId, currentQuantity + 1);
    } catch (error) {
      console.error('Error increasing quantity:', error);
      alert('Error al aumentar la cantidad. Por favor, inténtalo de nuevo.');
    }
  };

  const handleDecreaseQuantity = async (itemId: string, currentQuantity: number) => {
    if (currentQuantity <= 1) {
      // If quantity is 1, remove the item completely
      handleRemoveItem(itemId);
      return;
    }
    
    try {
      await updateQuantity(itemId, currentQuantity - 1);
    } catch (error) {
      console.error('Error decreasing quantity:', error);
      alert('Error al disminuir la cantidad. Por favor, inténtalo de nuevo.');
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este producto del carrito?')) {
      try {
        await removeFromCart(itemId);
      } catch (error) {
        console.error('Error removing item:', error);
        alert('Error al eliminar el producto. Por favor, inténtalo de nuevo.');
      }
    }
  };

  if (loading) {
    return <LoadingSpinner message="Cargando carrito..." />;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-medical-gray-50 pt-24 text-center px-4">
        <ShoppingCart className="w-24 h-24 text-medical-gray-300 mb-6" />
        <h1 className="text-3xl font-bold text-medical-gray-800 mb-2">Tu carrito está vacío</h1>
        <p className="text-medical-gray-600 mb-8">
          Parece que no has añadido nada a tu carrito. ¡Explora nuestro catálogo farmacéutico!
        </p>
        <Link
          to="/catalog"
          className="px-8 py-4 bg-medical-primary text-white font-semibold rounded-2xl shadow-medical hover:bg-medical-primary-dark transition-all"
        >
          Ir al Catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-medical-gray-50 pt-32">
      <div className="medical-container">
        <h1 className="text-4xl font-bold text-medical-gray-900 mb-8">Tu Carrito de Compras</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Widget de progreso hacia descuentos */}
            <DiscountProgressWidget />
            
            {cart.items.map((item, index) => (
              <motion.div
                key={item.id}
                className="flex items-start space-x-6 bg-white p-6 rounded-2xl shadow-soft"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <img 
                  src={(item.product.images && item.product.images.length > 1 ? item.product.images[1] : item.product.image) || 'https://via.placeholder.com/150'} 
                  alt={item.product.name} 
                  className="w-24 h-24 object-cover rounded-xl" 
                />
                <div className="flex-grow">
                  <Link to={`/producto/${item.product.id}`} className="font-bold text-lg text-medical-gray-800 hover:text-medical-primary transition-colors">
                    {item.product.name}
                  </Link>
                  <p className="text-sm text-medical-gray-500">{item.product.brand}</p>
                  <div className="flex items-center border border-medical-gray-200 rounded-lg mt-4 w-fit">
                    <button 
                      onClick={() => handleDecreaseQuantity(item.id, item.quantity)} 
                      className="p-2 text-medical-gray-500 hover:text-medical-primary transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-3 text-md font-semibold">{item.quantity}</span>
                    <button 
                      onClick={() => handleIncreaseQuantity(item.id, item.quantity)} 
                      className="p-2 text-medical-gray-500 hover:text-medical-primary transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-medical-primary">
                    {formatPriceFromBackend(item.subtotal)}
                  </p>
                  <p className="text-sm text-medical-gray-500">
                    {formatPriceFromBackend(item.subtotal, currency === 'VES' ? 'USD' : 'VES')}
                  </p>
                  <button 
                    onClick={() => handleRemoveItem(item.id)} 
                    className="text-medical-gray-400 hover:text-red-500 mt-4 transition-colors"
                    title="Eliminar producto del carrito"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-2xl shadow-soft sticky top-28">
              <h2 className="text-2xl font-bold text-medical-gray-800 border-b pb-4 mb-6">Resumen del Pedido Comercial</h2>
              <div className="space-y-4 text-medical-gray-700">
                <div className="flex justify-between">
                  <span>Subtotal ({cart.total_items} productos)</span>
                  <span className="font-semibold">{formatPriceFromBackend(cart.total)}</span>
                </div>
                <div className="flex justify-between font-bold text-xl text-medical-gray-900 border-t pt-4 mt-4">
                  <span>Total</span>
                  <span>{formatPriceFromBackend(cart.total)}</span>
                </div>
                <p className="text-right text-medical-gray-500 text-sm">
                  Total aprox. {formatPriceFromBackend(cart.total, currency === 'VES' ? 'USD' : 'VES')}
                </p>
              </div>

              <div className="mt-8 space-y-4">
                <Link
                  to="/checkout"
                  className="w-full text-center block px-6 py-4 bg-medical-primary text-white font-semibold rounded-2xl shadow-medical hover:bg-medical-primary-dark transition-all"
                >
                  Finalizar Compra
                </Link>
                <Link
                  to="/catalogo"
                  className="w-full flex items-center justify-center gap-2 text-center px-6 py-3 text-medical-primary font-semibold transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Seguir Comprando
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
