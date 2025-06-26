import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Hash, RefreshCw } from 'lucide-react';

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

  // Simular conversión con loading state
  const handleToggle = () => {
    setIsConverting(true);
    setTimeout(() => {
      onToggle();
      setIsConverting(false);
    }, 600);
  };

  return (
    <motion.button
      onClick={handleToggle}
      disabled={isConverting}
      className={`relative flex items-center px-4 py-3 rounded-full transition-all duration-300 backdrop-blur-md border ${
        isScrolled
          ? 'bg-white/90 text-gray-700 border-gray-200 hover:bg-white hover:shadow-md'
          : 'bg-white/20 text-white border-white/30 hover:bg-white/30'
      } ${isConverting ? 'cursor-not-allowed opacity-75' : ''}`}
      whileHover={!isConverting ? { 
        scale: 1.05,
        rotate: [0, -2, 2, 0],
      } : {}}
      whileTap={!isConverting ? { 
        scale: 0.95 
      } : {}}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 17,
        rotate: { duration: 0.5 }
      }}
    >
      <div className="flex items-center space-x-2">
        {/* Currency Icon with Flip Animation */}
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
          {isConverting ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : currency === 'REF' ? (
            <DollarSign className="h-5 w-5" />
          ) : (
            <Hash className="h-5 w-5" />
          )}
        </motion.div>

        {/* Currency Label */}
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
            className={`text-xs leading-none mt-0.5 ${
              isScrolled ? 'text-gray-500' : 'text-white/70'
            }`}
            initial={{ y: 5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.25 }}
          >
            {currency === 'REF' ? 'US Dollar' : 'Bolívar'}
          </motion.span>
        </motion.div>
      </div>

      {/* Conversion Loading Bar */}
      {isConverting && (
        <motion.div
          className={`absolute bottom-0 left-0 h-0.5 rounded-b-full ${
            isScrolled ? 'bg-blue-500' : 'bg-white'
          }`}
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 0.6 }}
        />
      )}

      {/* Pulse Ring Animation on Currency Change */}
      <motion.div
        className={`absolute inset-0 rounded-full border-2 ${
          isScrolled ? 'border-blue-400' : 'border-white'
        }`}
        initial={{ scale: 1, opacity: 0 }}
        animate={{
          scale: isConverting ? [1, 1.2, 1] : 1,
          opacity: isConverting ? [0, 0.3, 0] : 0
        }}
        transition={{ duration: 0.6 }}
        key={`${currency}-pulse-${isConverting}`}
      />
    </motion.button>
  );
};