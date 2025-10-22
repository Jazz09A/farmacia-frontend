// 🔥 Flash Offer Card Component
import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Flame, ShoppingCart, Zap } from 'lucide-react';
import { FlashOfferWithProduct } from '../../types';
import { useFlashOfferCountdown } from '../../hooks/useFlashOffers';
import { flashOfferService } from '../../services/FlashOfferService';
import { useGlobalCurrency } from '../../contexts/GlobalCurrencyContext';
import { useCart } from '../../contexts/CartContext';

interface FlashOfferCardProps {
  offer: FlashOfferWithProduct;
  onAddToCart?: (productId: string) => void;
  size?: 'small' | 'medium' | 'large';
  showQuantity?: boolean;
  className?: string;
}

export const FlashOfferCard: React.FC<FlashOfferCardProps> = ({
  offer,
  onAddToCart,
  size = 'medium',
  showQuantity = true,
  className = '',
}) => {
  const { currency } = useGlobalCurrency();
  const { addToCart } = useCart();
  const { formattedTime, isExpired } = useFlashOfferCountdown(offer.end_time);

  // Calcular precios
  const originalPrice = currency === 'VES' ? offer.product.price_ves : offer.product.price_ref;
  const discountedPrice = flashOfferService.calculateDiscountedPrice(
    originalPrice,
    offer.discount_type,
    offer.discount_value
  );
  const savings = flashOfferService.calculateSavings(originalPrice, discountedPrice);
  const discountPercentage = offer.discount_type === 'percentage' 
    ? offer.discount_value 
    : Math.round((savings / originalPrice) * 100);

  const handleAddToCart = async () => {
    if (isExpired || !offer.product.in_stock) return;
    
    try {
      await addToCart(offer.product.id, 1);
      onAddToCart?.(offer.product.id);
    } catch (error) {
      console.error('Error adding flash offer to cart:', error);
    }
  };

  // Configuraciones por tamaño
  const sizeConfig = {
    small: {
      container: 'w-64',
      image: 'h-32',
      title: 'text-sm font-medium',
      price: 'text-lg',
      originalPrice: 'text-xs',
      badge: 'text-xs px-2 py-1',
      button: 'text-sm px-3 py-2',
    },
    medium: {
      container: 'w-80',
      image: 'h-40',
      title: 'text-base font-semibold',
      price: 'text-xl',
      originalPrice: 'text-sm',
      badge: 'text-sm px-3 py-1.5',
      button: 'text-base px-4 py-2',
    },
    large: {
      container: 'w-96',
      image: 'h-48',
      title: 'text-lg font-bold',
      price: 'text-2xl',
      originalPrice: 'text-base',
      badge: 'text-base px-4 py-2',
      button: 'text-lg px-6 py-3',
    },
  };

  const config = sizeConfig[size];

  if (isExpired) return null; // No mostrar ofertas expiradas

  return (
    <motion.div
      className={`${config.container} bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl shadow-lg border-2 border-red-200 overflow-hidden relative ${className}`}
      whileHover={{ y: -8, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
      transition={{ duration: 0.3 }}
    >
      {/* Flash Badge */}
      <div className="absolute top-0 left-0 z-20">
        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-br-2xl flex items-center space-x-1 shadow-lg">
          <Flame className="w-4 h-4" />
          <span className="font-bold text-sm">FLASH</span>
        </div>
      </div>

      {/* Discount Badge */}
      <div className="absolute top-0 right-0 z-20">
        <div className={`bg-yellow-400 text-yellow-900 ${config.badge} rounded-bl-2xl font-bold shadow-lg`}>
          -{discountPercentage}%
        </div>
      </div>

      {/* Quantity Progress Bar (si aplica) */}
      {showQuantity && offer.max_quantity && (
        <div className="absolute top-12 right-0 left-0 z-10">
          <div className="bg-red-600 bg-opacity-90 text-white text-center py-1">
            <div className="flex items-center justify-center space-x-2">
              <Zap className="w-4 h-4" />
              <span className="text-xs font-bold">
                {offer.availability_percentage?.toFixed(0)}% Disponible
              </span>
            </div>
            <div className="w-full bg-red-800 h-1 mt-1">
              <div 
                className="bg-yellow-400 h-1 transition-all duration-300"
                style={{ width: `${offer.availability_percentage || 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Product Image */}
      <div className={`${config.image} bg-white p-4 flex items-center justify-center relative overflow-hidden`}>
        <img
          src={offer.product.images && offer.product.images.length > 1 ? offer.product.images[1] : offer.product.image}
          alt={offer.product.name}
          className="max-w-full max-h-full object-contain"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h3 className={`${config.title} text-gray-800 line-clamp-2 hover:text-red-600 transition-colors`}>
          {offer.product.name}
        </h3>

        {/* Brand */}
        <p className="text-sm text-gray-600">{offer.product.brand}</p>

        {/* Prices */}
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className={`${config.price} font-bold text-red-600`}>
              {currency === 'VES' 
                ? `Bs. ${discountedPrice.toLocaleString('es-VE')}` 
                : `$ ${discountedPrice.toFixed(2)}`
              }
            </span>
            <span className={`${config.originalPrice} text-gray-500 line-through`}>
              {currency === 'VES' 
                ? `Bs. ${originalPrice.toLocaleString('es-VE')}` 
                : `$ ${originalPrice.toFixed(2)}`
              }
            </span>
          </div>
          <p className="text-sm text-green-600 font-medium">
            Ahorra {currency === 'VES' 
              ? `Bs. ${savings.toLocaleString('es-VE')}` 
              : `$ ${savings.toFixed(2)}`
            }
          </p>
        </div>

        {/* Countdown Timer */}
        <div className="bg-red-100 rounded-lg p-2 flex items-center justify-center space-x-2">
          <Clock className="w-4 h-4 text-red-600" />
          <span className="text-sm font-bold text-red-700">
            Termina en: {formattedTime}
          </span>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={!offer.product.in_stock || isExpired}
          className={`w-full ${config.button} bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl`}
        >
          <ShoppingCart className="w-5 h-5" />
          <span>
            {!offer.product.in_stock ? 'Sin Stock' : 'Añadir al Carrito'}
          </span>
        </button>
      </div>
    </motion.div>
  );
};

export default FlashOfferCard;

