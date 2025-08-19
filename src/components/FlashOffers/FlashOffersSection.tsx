import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Zap, TrendingDown, AlertCircle, Timer } from 'lucide-react';
import { ProductCard } from '../Products/ProductCard';
import { Product } from '../../types';

const mockFlashOffers = [
  {
    id: '1',
    product_id: '1',
    discount: 10,
    active: true,
    endTime: new Date(Date.now() + 1000 * 60 * 60 * 24)
  }
]

interface FlashOffersSectionProps {
  currency: 'VES' | 'REF';
  onAddToCart: (product: Product, quantity: number) => void;
  formatPrice: (priceVES: number, priceREF: number) => string;
}

export const FlashOffersSection: React.FC<FlashOffersSectionProps> = ({
  currency,
  onAddToCart,
  formatPrice
}) => {
  const [timeLeft, setTimeLeft] = useState<Record<string, number>>({});
  const [urgentOffers, setUrgentOffers] = useState<string[]>([]);
  const hasActiveOffers = mockFlashOffers.some(offer => offer.active);

  useEffect(() => {
    if (!hasActiveOffers) return;

    const timer = setInterval(() => {
      const newTimeLeft: Record<string, number> = {};
      const newUrgentOffers: string[] = [];
      
      mockFlashOffers.forEach(offer => {
        if (offer.active) {
          const remaining = Math.max(0, offer.endTime.getTime() - Date.now());
          newTimeLeft[offer.id] = remaining;
          
          // Mark as urgent if less than 2 hours remaining
          if (remaining < 2 * 60 * 60 * 1000 && remaining > 0) {
            newUrgentOffers.push(offer.id);
          }
        }
      });
      
      setTimeLeft(newTimeLeft);
      setUrgentOffers(newUrgentOffers);
    }, 1000);

    return () => clearInterval(timer);
  }, [hasActiveOffers]);

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return {
      hours: hours.toString().padStart(2, '0'),
      minutes: minutes.toString().padStart(2, '0'),
      seconds: seconds.toString().padStart(2, '0'),
      formatted: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    };
  };

  const offerProducts = mockFlashOffers.filter((offer: any) => 
    mockFlashOffers.some(o => o.product_id === offer.id && o.active)
  );

  // Si no hay ofertas, no mostrar la sección (redistribución automática del layout)
  if (!hasActiveOffers || offerProducts.length === 0) return null;

  const totalOffers = offerProducts.length;
  const urgentCount = urgentOffers.length;

  return (
    <AnimatePresence mode="wait">
      <motion.section
        className="py-20 bg-medical-gradient relative overflow-hidden"
        initial={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0 }}
        animate={{ 
          opacity: 1, 
          height: 'auto',
          marginTop: '0px',
          marginBottom: '0px'
        }}
        exit={{ 
          opacity: 0, 
          height: 0,
          marginTop: '0px',
          marginBottom: '0px'
        }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
        layout
      >
        {/* Background Medical Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%232196F3' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="medical-container relative">
          {/* Enhanced Header */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {/* Flash Badge */}
            <motion.div
              className="inline-flex items-center justify-center mb-6"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="relative">
                <motion.div
                  className="flex items-center space-x-3 bg-medical-blue-gradient text-white px-8 py-4 rounded-3xl shadow-medical"
                  animate={{ 
                    boxShadow: [
                      '0 4px 20px 0 rgba(33, 150, 243, 0.3)',
                      '0 8px 30px 0 rgba(33, 150, 243, 0.5)',
                      '0 4px 20px 0 rgba(33, 150, 243, 0.3)'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <motion.div
                    animate={{ 
                      rotate: [0, 15, -15, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Zap className="h-6 w-6" />
                  </motion.div>
                  <span className="font-bold text-xl">OFERTAS FLASH MÉDICAS</span>
                  <motion.div
                    className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <span className="text-sm font-semibold">{totalOffers} productos</span>
                  </motion.div>
                </motion.div>

                {/* Pulse Ring */}
                <motion.div
                  className="absolute inset-0 border-2 border-medical-blue-400 rounded-3xl"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.5, 0, 0.5]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            </motion.div>
            
            <motion.h2
              className="text-4xl lg:text-5xl font-serif font-bold text-medical-gray-900 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Descuentos{' '}
              <span className="text-medical-gradient">Exclusivos</span>
              <br />por Tiempo Limitado
            </motion.h2>
            
            <motion.p
              className="text-xl text-medical-gray-600 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Aprovecha estos descuentos especiales en medicamentos para mejorar tu margen comercial.
              <br />
              <span className="text-medical-blue-600 font-semibold">
                Precios mayoristas con descuentos limitados
              </span>
            </motion.p>

            {/* Urgency Indicator */}
            {urgentCount > 0 && (
              <motion.div
                className="mt-6 inline-flex items-center space-x-2 bg-red-100 text-red-700 px-4 py-2 rounded-2xl border border-red-200"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <AlertCircle className="h-5 w-5" />
                </motion.div>
                <span className="font-medium">
                  ¡{urgentCount} oferta{urgentCount > 1 ? 's' : ''} terminan pronto!
                </span>
              </motion.div>
            )}
          </motion.div>

          {/* Enhanced Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {offerProducts.map((product: any, index: number) => {
              const offer = mockFlashOffers.find(o => o.product_id === product.id);
              const remainingTime = timeLeft[offer?.id || ''] || 0;
              const timeData = formatTime(remainingTime);
              const isUrgent = urgentOffers.includes(offer?.id || '');

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    duration: 0.6, 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 100,
                    damping: 15
                  }}
                  viewport={{ once: true }}
                  className="relative group"
                  whileHover={{ y: -5 }}
                >
                  {/* Enhanced Countdown Timer */}
                  <motion.div
                    className={`absolute -top-3 left-4 z-20 ${
                      isUrgent ? 'bg-red-gradient' : 'bg-medical-blue-gradient'
                    } text-white px-4 py-2 rounded-2xl shadow-medical font-bold flex items-center space-x-2`}
                    animate={isUrgent ? { 
                      boxShadow: [
                        '0 0 0 0 rgba(239, 68, 68, 0.7)', 
                        '0 0 0 8px rgba(239, 68, 68, 0)', 
                        '0 0 0 0 rgba(239, 68, 68, 0)'
                      ]
                    } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Timer className="h-4 w-4" />
                    <div className="flex items-center space-x-1 text-sm">
                      <span>{timeData.hours}</span>
                      <motion.span
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >:</motion.span>
                      <span>{timeData.minutes}</span>
                      <motion.span
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >:</motion.span>
                      <span>{timeData.seconds}</span>
                    </div>
                  </motion.div>

                  {/* Enhanced Product Card */}
                  <div className="card-medical-glass hover:shadow-medical-hover transition-all duration-400">
                    <ProductCard
                      product={product}
                      currency={currency}
                      onAddToCart={onAddToCart}
                      formatPrice={formatPrice}
                      className="border-none shadow-none bg-transparent"
                    />
                  </div>

                  {/* Enhanced Discount Badge */}
                  <motion.div
                    className="absolute top-4 right-4 bg-medical-green-gradient text-white px-3 py-1 rounded-2xl font-bold shadow-medical flex items-center space-x-1"
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: index * 0.1 + 0.5, type: "spring" }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <TrendingDown className="h-4 w-4" />
                    <span>-{offer?.discount}%</span>
                  </motion.div>

                  {/* Urgency Glow Effect */}
                  {isUrgent && (
                    <motion.div
                      className="absolute inset-0 border-2 border-red-400 rounded-xl"
                      animate={{ 
                        opacity: [0, 0.5, 0],
                        scale: [1, 1.02, 1]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Enhanced Call to Action */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                className="btn-medical-primary px-8 py-4 text-lg font-semibold flex items-center space-x-2 shadow-medical hover:shadow-medical-hover"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Flame className="h-5 w-5" />
                <span>Ver Todas las Ofertas Flash</span>
              </motion.button>

              {/* <motion.button
                className="btn-medical-glass px-6 py-4 font-medium flex items-center space-x-2"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Clock className="h-5 w-5" />
                <span>Configurar Alertas</span>
              </motion.button> */}
            </div>

            {/* Offer Statistics */}
            <motion.div
              className="mt-8 flex flex-wrap items-center justify-center gap-8 text-sm text-medical-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-medical-green-500 rounded-full"></div>
                <span>{totalOffers} productos en oferta</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-medical-blue-500 rounded-full"></div>
                <span>Hasta 50% de descuento</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Solo por tiempo limitado</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Floating Action Notification */}
        <AnimatePresence>
          {urgentCount > 0 && (
            <motion.div
              className="fixed bottom-6 right-6 z-50 glass-card p-4 rounded-2xl shadow-elegant border border-red-200 max-w-sm"
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <div className="flex items-center space-x-3">
                <motion.div
                  className="p-2 bg-red-100 rounded-xl"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </motion.div>
                <div>
                  <p className="font-semibold text-medical-gray-900">¡Ofertas por terminar!</p>
                  <p className="text-sm text-medical-gray-600">
                    {urgentCount} producto{urgentCount > 1 ? 's' : ''} con tiempo limitado
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>
    </AnimatePresence>
  );
};