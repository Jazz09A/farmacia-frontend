// 🔥 Flash Offers Section Component
import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, ChevronLeft, ChevronRight, Clock, Zap } from 'lucide-react';
import { useFlashOffersPublicQuery } from '../../hooks/queries/useFlashOffersQueries';
import { useFlashOfferVisibility } from '../../hooks/useFlashOffers';
import { flashOfferService } from '../../services/FlashOfferService';
import FlashOfferCard from './FlashOfferCard';
import { FlashOfferWithProduct } from '../../types';

interface FlashOffersSectionProps {
  className?: string;
  maxItems?: number;
  refreshInterval?: number;
  title?: string;
  subtitle?: string;
}

export const FlashOffersSection: React.FC<FlashOffersSectionProps> = ({
  className = '',
  maxItems = 6,
  refreshInterval = 1000, // 1 segundo para countdown
  title = "⚡ Ofertas Flash",
  subtitle = "¡Descuentos increíbles por tiempo limitado!",
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { ref: visibilityRef, isVisible } = useFlashOfferVisibility(0.1);
  
  // Usar React Query para obtener ofertas flash
  const { data: flashOffersResponse, isLoading: loading, error } = useFlashOffersPublicQuery();
  
  // Filtrar solo ofertas activas
  const offers: FlashOfferWithProduct[] = flashOffersResponse?.flash_offers
    ? flashOffersResponse.flash_offers.filter(offer => flashOfferService.isOfferActive(offer))
    : [];
  
  const hasActiveOffers = offers.length > 0;

  // No renderizar si no hay ofertas activas
  if (!hasActiveOffers && !loading) {
    return null; // UX optimizado: no mostrar sección vacía
  }

  const displayOffers = offers.slice(0, maxItems);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  // Estado de loading con skeleton
  if (loading) {
    return (
      <motion.section
        ref={visibilityRef}
        className={`py-12 bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 ${className}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <div className="w-48 h-8 bg-gray-300 rounded-lg mx-auto mb-2 animate-pulse" />
            <div className="w-64 h-4 bg-gray-200 rounded mx-auto animate-pulse" />
          </div>
          <div className="flex space-x-6 overflow-hidden">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-80 h-96 bg-gray-200 rounded-2xl animate-pulse flex-shrink-0" />
            ))}
          </div>
        </div>
      </motion.section>
    );
  }

  // Estado de error con fallback elegante
  if (error) {
    return (
      <motion.section
        ref={visibilityRef}
        className={`py-12 bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 ${className}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
            <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-600 mb-2">
              Sin Ofertas Flash
            </h3>
            <p className="text-gray-500">
              No hay ofertas flash disponibles en este momento. 
              ¡Revisa más tarde para encontrar descuentos increíbles!
            </p>
          </div>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section
      ref={visibilityRef}
      className={`py-12 bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 relative overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-red-200 rounded-full opacity-20 animate-bounce" />
        <div className="absolute top-1/2 -right-8 w-32 h-32 bg-orange-200 rounded-full opacity-20 animate-pulse" />
        <div className="absolute -bottom-8 left-1/3 w-20 h-20 bg-yellow-200 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-4xl font-bold bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 bg-clip-text text-transparent mb-2 flex items-center justify-center space-x-3">
            <Flame className="w-10 h-10 text-red-500 animate-pulse" />
            <span>{title}</span>
            <Flame className="w-10 h-10 text-orange-500 animate-pulse" />
          </h2>
          <p className="text-xl text-gray-600 font-medium">{subtitle}</p>
          
          {/* Flash Indicator */}
          <div className="flex items-center justify-center mt-4 space-x-2">
            <Clock className="w-5 h-5 text-red-500" />
            <span className="text-red-600 font-bold animate-pulse">
              ¡Solo por tiempo limitado!
            </span>
            <Clock className="w-5 h-5 text-red-500" />
          </div>
        </motion.div>

        {/* Navigation Buttons - Solo en mobile cuando hay scroll */}
        {displayOffers.length > 3 && (
          <>
            <button
              onClick={scrollLeft}
              className="sm:hidden absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white hover:bg-gray-50 shadow-lg rounded-full p-3 transition-all duration-300 hover:scale-110"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
            <button
              onClick={scrollRight}
              className="sm:hidden absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white hover:bg-gray-50 shadow-lg rounded-full p-3 transition-all duration-300 hover:scale-110"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-6 h-6 text-gray-600" />
            </button>
          </>
        )}

        {/* Offers Grid/Scroll - Responsive: Grid en desktop, scroll en mobile */}
        <div className="relative">
          {/* Mobile: Scroll horizontal */}
          <motion.div
            ref={scrollRef}
            className="
              sm:hidden flex space-x-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth
            "
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {displayOffers.map((offer, index) => (
              <motion.div
                key={offer.id || `${offer.product_id}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex-shrink-0 w-[280px]"
              >
                <FlashOfferCard
                  offer={offer}
                  size="medium"
                  showQuantity={true}
                  onAddToCart={(productId) => {
                    // Analytics tracking
                  }}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Desktop: Grid simétrico */}
          <motion.div
            className="
              hidden sm:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6
            "
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {displayOffers.map((offer, index) => (
              <motion.div
                key={offer.id || `${offer.product_id}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="w-full"
              >
                <FlashOfferCard
                  offer={offer}
                  size="medium"
                  showQuantity={true}
                  onAddToCart={(productId) => {
                    // Analytics tracking
                  }}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Footer CTA */}
        {offers.length > maxItems && (
          <motion.div
            className="text-center mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <p className="text-gray-600 mb-4">
              ¡Y {offers.length - maxItems} ofertas flash más disponibles!
            </p>
            <button className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-8 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
              Ver Todas las Ofertas Flash
            </button>
          </motion.div>
        )}
      </div>
    </motion.section>
  );
};

export default FlashOffersSection;