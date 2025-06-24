import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Hash, TrendingUp, Info, RefreshCw } from 'lucide-react';

interface CurrencyToggleProps {
  currency: 'VES' | 'REF';
  onToggle: () => void;
  isScrolled: boolean;
}

export const CurrencyToggle: React.FC<CurrencyToggleProps> = ({
  currency,
  onToggle,
  isScrolled
}) => {
  const [isConverting, setIsConverting] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [exchangeRate] = useState(36.5); // Tasa de cambio REF/VES
  const [lastUpdate] = useState(new Date());

  // Simular conversión con loading state
  const handleToggle = () => {
    setIsConverting(true);
    setTimeout(() => {
      onToggle();
      setIsConverting(false);
    }, 400);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-VE', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="relative">
      {/* Main Toggle Button */}
      <motion.button
        onClick={handleToggle}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        disabled={isConverting}
        className={`relative flex items-center px-4 py-2.5 rounded-2xl transition-all duration-400 backdrop-blur-md group ${
          isScrolled
            ? 'glass-card shadow-medical hover:shadow-medical-hover text-medical-gray-700 border-medical-gray-200'
            : 'glass-medical text-white border-white/30 hover:glass-card hover:text-medical-gray-700'
        } ${isConverting ? 'cursor-not-allowed opacity-75' : 'hover:scale-105'}`}
        whileHover={!isConverting ? { scale: 1.05 } : {}}
        whileTap={!isConverting ? { scale: 0.95 } : {}}
      >
        <div className="flex items-center space-x-3">
          {/* Currency Icon with Flip Animation */}
          <motion.div
            className="relative w-5 h-5 flex items-center justify-center"
            key={currency}
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            transition={{ 
              duration: 0.4, 
              type: "spring", 
              stiffness: 300, 
              damping: 20 
            }}
          >
            {currency === 'REF' ? (
              <DollarSign className="h-5 w-5" />
            ) : (
              <Hash className="h-5 w-5" />
            )}
            
            {/* Loading Spinner Overlay */}
            {isConverting && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <RefreshCw className="h-4 w-4 animate-spin text-medical-blue-600" />
              </motion.div>
            )}
          </motion.div>

          {/* Currency Label */}
          <div className="flex flex-col items-start">
            <motion.span
              className="text-sm font-semibold leading-none"
              key={`${currency}-label`}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {currency}
            </motion.span>
            <motion.span
              className={`text-xs leading-none mt-0.5 ${
                isScrolled ? 'text-medical-gray-500' : 'text-white/70'
              }`}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.15 }}
            >
              {currency === 'REF' ? 'US Dollar' : 'Bolívar'}
            </motion.span>
          </div>

          {/* Exchange Rate Indicator */}
          <motion.div
            className={`ml-2 text-xs ${
              isScrolled ? 'text-medical-green-600' : 'text-green-200'
            }`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <TrendingUp className="h-3 w-3" />
          </motion.div>
        </div>

        {/* Pulse Ring Animation */}
        <motion.div
          className="absolute inset-0 rounded-2xl border-2 border-medical-blue-400"
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: currency === 'REF' ? [0, 1.1, 0] : [0, 1.1, 0],
            opacity: [0, 0.4, 0]
          }}
          transition={{ duration: 0.8, times: [0, 0.5, 1] }}
          key={`${currency}-pulse`}
        />

        {/* Conversion Loading Bar */}
        {isConverting && (
          <motion.div
            className="absolute bottom-0 left-0 h-0.5 bg-medical-blue-gradient rounded-b-2xl"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.4 }}
          />
        )}
      </motion.button>

      {/* Enhanced Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-50"
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <div className="glass-card rounded-xl p-4 shadow-elegant border border-white/30 min-w-64">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-medical-gray-900 flex items-center">
                  <Info className="h-4 w-4 mr-2 text-medical-blue-600" />
                  Conversión de Divisa
                </h4>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  currency === 'REF' 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-blue-100 text-blue-600'
                }`}>
                  Activa: {currency}
                </span>
              </div>

              {/* Exchange Rate Info */}
              <div className="space-y-2 mb-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-medical-gray-600">Tasa de cambio:</span>
                  <span className="text-sm font-semibold text-medical-gray-900">
                    $1 = Bs. {exchangeRate.toLocaleString('es-VE')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-medical-gray-600">Última actualización:</span>
                  <span className="text-sm text-medical-gray-500">
                    {formatTime(lastUpdate)}
                  </span>
                </div>
              </div>

              {/* Quick Conversion Examples */}
              <div className="border-t border-medical-gray-200 pt-3">
                <p className="text-xs text-medical-gray-600 mb-2">Ejemplos de conversión:</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-medical-gray-600">$10.00</span>
                    <span className="text-medical-gray-900">≈ Bs. {(10 * exchangeRate).toLocaleString('es-VE')}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-medical-gray-600">$50.00</span>
                    <span className="text-medical-gray-900">≈ Bs. {(50 * exchangeRate).toLocaleString('es-VE')}</span>
                  </div>
                </div>
              </div>

              {/* Action Hint */}
              <div className="mt-3 pt-3 border-t border-medical-gray-200">
                <p className="text-xs text-medical-gray-500 text-center">
                  Haz clic para cambiar a {currency === 'REF' ? 'VES' : 'REF'}
                </p>
              </div>

              {/* Tooltip Arrow */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2">
                <div className="w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-white"></div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};