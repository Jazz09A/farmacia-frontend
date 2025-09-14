import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Star, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';

interface ProductCardProps {
  product: Product;
  currency: 'VES' | 'USD' | 'REF';
  formatPrice: (priceVES: number, priceREF: number) => string;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  currency,
  formatPrice,
  className = ''
}) => {
  return (
    <Link to={`/product/${product.id}`} className="block">
      <motion.div
        className={`bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer ${className}`}
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {/* Image Container */}
        <div className="relative overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            decoding="async"
            height="192"
          />
          
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
          <motion.button
            className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Heart className="h-4 w-4" />
          </motion.button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Brand */}
          <p className="text-blue-600 text-sm font-medium mb-1">{product.brand}</p>
          
          {/* Name */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
          
          {/* Rating */}
          <div className="flex items-center space-x-2 mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(product.rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">({product.review_count})</span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col">
              {product.is_offer && product.original_price && (
                <span className="text-sm text-gray-400 line-through">
                  {currency === 'VES' 
                    ? `Bs. ${product.original_price.toLocaleString('es-VE')}`
                    : `$ ${product.original_price.toFixed(2)}`
                  }
                </span>
              )}
              <span className="text-xl font-bold text-gray-900">
                {currency === 'VES' 
                  ? `Bs. ${product.price_ves.toLocaleString('es-VE')}` 
                  : `$ ${product.price_ref.toFixed(2)}`
                }
              </span>
            </div>
            {product.is_offer && (
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