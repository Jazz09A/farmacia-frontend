import React from 'react';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Star, ShieldCheck } from 'lucide-react';
import { Product } from '../../types';

interface ProductCardProps {
  product: Product;
  currency: 'VES' | 'REF';
  onAddToCart: (productId: string) => void;
  formatPrice: (priceVES: number, priceREF: number) => string;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  currency,
  onAddToCart,
  formatPrice,
  className = ''
}) => {
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product.id);
  };

  return (
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
          {!product.inStock && (
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
          <span className="text-sm text-gray-500">({product.reviews})</span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            {product.isOffer && product.originalPrice && (
              <span className="text-sm text-gray-400 line-through">
                {currency === 'VES' 
                  ? `Bs. ${product.originalPrice.toLocaleString('es-VE')}`
                  : `$ ${(product.originalPrice / 36.5).toFixed(2)}`
                }
              </span>
            )}
            <span className="text-xl font-bold text-gray-900">
              {formatPrice(product.priceVES, product.priceREF)}
            </span>
          </div>
          {product.isOffer && (
            <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded-full font-medium">
              ¡Oferta!
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <motion.button
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center space-x-2 ${
            product.inStock
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
          whileHover={product.inStock ? { scale: 1.02, y: -1 } : {}}
          whileTap={product.inStock ? { scale: 0.98 } : {}}
        >
          <ShoppingCart className="h-4 w-4" />
          <span>{product.inStock ? 'Agregar al Carrito' : 'No Disponible'}</span>
        </motion.button>
      </div>
    </motion.div>
  );
};