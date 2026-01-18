import React from 'react';
import { motion } from 'framer-motion';
import { Star, ShieldCheck, Flame, Percent } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { useGlobalCurrency } from '../../contexts/GlobalCurrencyContext';
import ProductImage from '../common/ProductImage';

interface ProductCardProps {
  product: Product;
  className?: string;
  priority?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  className = '',
  priority = false
}) => {
  const { formatPriceFromBackend } = useGlobalCurrency();
  const isCompact = className.includes('text-sm');
  
  // Calcular precios con descuento
  const hasFlashOffer = product.is_offer && product.original_price;
  const hasProfitDiscount = product.profit_discount && (product.profit_discount.is_active === true || product.profit_discount.is_active === 'true');
  
  // Precio original (sin descuento)
  const originalPrice = hasFlashOffer 
    ? product.original_price 
    : hasProfitDiscount 
      ? product.price 
      : null;
  
  // Precio con descuento
  let discountedPrice = product.price;
  if (hasProfitDiscount && product.profit_discount.best_discount_percentage) {
    const discountPercent = parseFloat(product.profit_discount.best_discount_percentage);
    const originalPriceNum = parseFloat(product.price);
    discountedPrice = (originalPriceNum * (1 - discountPercent / 100)).toFixed(2);
  }
  
  const showOriginalPrice = hasFlashOffer || hasProfitDiscount;
  
  return (
    <Link to={`/product/${product.id}`} className="block">
      <motion.div
        className={`bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer ${className}`}
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {/* Image Container */}
        <div className="relative overflow-hidden bg-gray-50">
          <div className={`aspect-square w-full flex items-center justify-center ${isCompact ? 'p-2' : 'p-4'} relative`}>
            <ProductImage
              src={product.image}
              images={product.images}
              alt={product.name}
              className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
              size={isCompact ? "md" : "lg"}
              priority={priority}
            />
          </div>
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col space-y-2 z-10">
            {product.is_offer && (
              <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold flex items-center shadow-lg">
                <Flame className="h-3 w-3 mr-1" />
                FLASH
              </span>
            )}
            {product.profit_discount && (product.profit_discount.is_active === true || product.profit_discount.is_active === 'true') && (
              <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold flex items-center shadow-lg">
                <Percent className="h-3 w-3 mr-1" />
                DESCUENTO
              </span>
            )}
            {product.prescription && (
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center">
                <ShieldCheck className="h-3 w-3 mr-1" />
                Rx
              </span>
            )}
            {!product.in_stock && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                Agotado
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          {/* <motion.button
            className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Heart className="h-4 w-4" />
          </motion.button> */}
        </div>

        {/* Content */}
        <div className={isCompact ? "p-3" : "p-6"}>
          {/* Brand */}
          {!isCompact && (
            <p className="text-blue-600 text-sm font-medium mb-1">{product.brand}</p>
          )}
          
          {/* Name */}
          <h3 className={`${isCompact ? 'text-sm' : 'text-lg'} font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors`}>
            {product.name}
          </h3>
          
          {/* Rating */}
          {!isCompact && (
            <div className="flex items-center space-x-2 mb-3">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(parseFloat(product.rating))
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">({product.review_count})</span>
            </div>
          )}

          {/* Price */}
          <div className={`flex items-center ${isCompact ? 'justify-center flex-col gap-1' : 'justify-between'}`}>
            <div className="flex flex-col items-center">
              {showOriginalPrice && originalPrice && (
                <span className={`${isCompact ? 'text-xs' : 'text-sm'} text-gray-400 line-through`}>
                  {formatPriceFromBackend(originalPrice)}
                </span>
              )}
              <span className={`${isCompact ? 'text-base' : 'text-xl'} font-bold ${showOriginalPrice ? 'text-red-600' : 'text-gray-900'}`}>
                {formatPriceFromBackend(showOriginalPrice ? discountedPrice : product.price)}
              </span>
            </div>
            {(product.is_offer || hasProfitDiscount) && (
              <div className="flex items-center gap-1">
                {product.is_offer && (
                  <span className={`bg-gradient-to-r from-red-500 to-orange-500 text-white ${isCompact ? 'text-[9px] px-1.5 py-0.5' : 'text-[10px] px-2 py-1'} rounded-full font-bold shadow-md flex items-center whitespace-nowrap`}>
                    <Flame className={`${isCompact ? 'h-2 w-2 mr-0.5' : 'h-2.5 w-2.5 mr-0.5'}`} />
                    FLASH
                  </span>
                )}
                {hasProfitDiscount && (
                  <span className={`bg-gradient-to-r from-red-500 to-orange-500 text-white ${isCompact ? 'text-[9px] px-1.5 py-0.5' : 'text-[10px] px-2 py-1'} rounded-full font-bold shadow-md flex items-center whitespace-nowrap`}>
                    <Percent className={`${isCompact ? 'h-2 w-2 mr-0.5' : 'h-2.5 w-2.5 mr-0.5'}`} />
                    -{product.profit_discount.best_discount_percentage}%
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
};