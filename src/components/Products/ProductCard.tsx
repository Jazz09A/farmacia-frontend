import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Star, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { useGlobalCurrency } from '../../contexts/GlobalCurrencyContext';
import ProductImage from '../common/ProductImage';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  className = ''
}) => {
  const { formatPriceFromBackend } = useGlobalCurrency();
  const isCompact = className.includes('text-sm');
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
            />
          </div>
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col space-y-2">
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
          <div className={`flex items-center ${isCompact ? 'justify-center' : 'justify-between'}`}>
            <div className="flex flex-col">
              {product.is_offer && product.original_price && (
                <span className={`${isCompact ? 'text-xs' : 'text-sm'} text-gray-400 line-through`}>
                  {formatPriceFromBackend(product.original_price)}
                </span>
              )}
              <span className={`${isCompact ? 'text-base' : 'text-xl'} font-bold text-gray-900`}>
                {formatPriceFromBackend(product.price)}
              </span>
            </div>
            {product.is_offer && !isCompact && (
              <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded-full font-medium">
                ¡Oferta!
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
};