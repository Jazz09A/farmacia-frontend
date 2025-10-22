import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGlobalCurrency } from '../../contexts/GlobalCurrencyContext';
import { DollarSign, Hash, TrendingUp, Clock, AlertCircle } from 'lucide-react';

const ExchangeRateDisplay: React.FC = () => {
  const { exchangeRateData, isLoadingRates, currency, toggleCurrency } = useGlobalCurrency();
  const [isToggling, setIsToggling] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleToggle = () => {
    setIsToggling(true);
    setTimeout(() => {
      toggleCurrency();
      setIsToggling(false);
    }, 600);
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('es-VE', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'cached':
        return 'bg-blue-100 text-blue-700';
      case 'live':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'cached':
        return 'Caché';
      case 'live':
        return 'En vivo';
      default:
        return status;
    }
  };

  // Estado de carga inicial
  if (isLoadingRates && !exchangeRateData) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 bg-white/90 border border-gray-200 rounded-full backdrop-blur-md">
        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm text-gray-600">Cargando tasa...</span>
      </div>
    );
  }

  // Estado de error
  if (!exchangeRateData) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 bg-red-50/90 border border-red-200 rounded-full backdrop-blur-md">
        <AlertCircle className="w-4 h-4 text-red-600" />
        <span className="text-sm text-red-600">Error</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <motion.button
        onClick={handleToggle}
        disabled={isToggling}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`relative flex items-center px-4 py-3 rounded-full transition-all duration-300 backdrop-blur-md border bg-white/90 text-medical-blue-900 border-gray-200 hover:bg-white hover:shadow-md ${
          isToggling ? 'cursor-not-allowed opacity-75' : ''
        }`}
        whileHover={!isToggling ? { 
          scale: 1.05,
          rotate: [0, -2, 2, 0],
        } : {}}
        whileTap={!isToggling ? { 
          scale: 0.95 
        } : {}}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 17,
          rotate: { duration: 0.5 }
        }}
      >
        <div className="flex items-center space-x-3">
          {/* Icono de moneda con animación de flip */}
          <motion.div
            className="relative w-5 h-5 flex items-center justify-center"
            key={currency}
            initial={{ rotateY: -90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            transition={{ 
              duration: 0.5, 
              type: "spring", 
              stiffness: 300, 
              damping: 20 
            }}
          >
            {currency === 'USD' ? (
              <DollarSign className="h-5 w-5 text-blue-600" />
            ) : (
              <Hash className="h-5 w-5 text-blue-600" />
            )}
          </motion.div>

          {/* Información de moneda actual */}
          <motion.div
            className="flex flex-col items-start"
            key={`${currency}-container`}
            initial={{ x: 10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <motion.span
              className="text-sm font-semibold leading-none"
              key={`${currency}-label`}
              initial={{ y: 5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              {currency}
            </motion.span>
            <motion.span
              className="text-xs text-gray-500 leading-none mt-0.5"
              initial={{ y: 5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.25 }}
            >
              {currency === 'USD' ? 'US Dollar' : 'Bolívar'}
            </motion.span>
          </motion.div>

          {/* Badge de tasa de cambio */}
          <motion.div
            className="flex items-center space-x-1 px-2 py-1 rounded-md bg-blue-50 border border-blue-200"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <TrendingUp className="h-3 w-3 text-blue-600" />
            <span className="text-xs font-bold text-blue-700">
              {exchangeRateData.rate.toFixed(2)}
            </span>
          </motion.div>
        </div>

        {/* Barra de loading al cambiar moneda */}
        {isToggling && (
          <motion.div
            className="absolute bottom-0 left-0 h-0.5 rounded-b-full bg-blue-500"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.6 }}
          />
        )}

        {/* Efecto de pulso al cambiar */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-blue-400"
          initial={{ scale: 1, opacity: 0 }}
          animate={{
            scale: isToggling ? [1, 1.2, 1] : 1,
            opacity: isToggling ? [0, 0.3, 0] : 0
          }}
          transition={{ duration: 0.6 }}
          key={`${currency}-pulse-${isToggling}`}
        />
      </motion.button>

      {/* Tooltip con información detallada */}
      <AnimatePresence>
        {showTooltip && !isToggling && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 right-0 z-50 w-72 bg-white rounded-lg shadow-lg border border-gray-200 p-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900">
                  Tasa de Cambio BCV
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(exchangeRateData.status)}`}>
                  {getStatusText(exchangeRateData.status)}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Tasa:</span>
                  <span className="font-bold text-blue-600">
                    $1 USD = {exchangeRateData.rate.toFixed(2)} Bs.S
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Fuente:</span>
                  <span className="font-medium text-gray-900">
                    {exchangeRateData.source}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Actualización:
                  </span>
                  <span className="text-xs text-gray-700">
                    {formatTimestamp(exchangeRateData.timestamp)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Moneda actual:</span>
                  <span className="font-medium text-gray-900">
                    {currency === 'USD' ? 'Dólares (USD)' : 'Bolívares (VES)'}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Clic para cambiar entre USD y VES. Los precios se convertirán usando la tasa oficial del BCV.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExchangeRateDisplay;