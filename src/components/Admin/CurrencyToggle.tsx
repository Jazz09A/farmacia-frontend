import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, DollarSign } from 'lucide-react';
import { useAdminCurrency } from '../../contexts/AdminCurrencyContext';
import { Currency } from '../../types';

const CurrencyToggle: React.FC = () => {
  const { currency, setCurrency, getCurrencySymbol, getCurrencyName } = useAdminCurrency();
  const [isOpen, setIsOpen] = useState(false);

  const currencies: Currency[] = ['VES', 'USD'];

  const handleCurrencySelect = (newCurrency: Currency) => {
    setCurrency(newCurrency);
    setIsOpen(false);
  };

  const getCurrencyColor = (curr: Currency) => {
    switch (curr) {
      case 'VES': return 'bg-yellow-500';
      case 'USD': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getCurrencyFlag = (curr: Currency) => {
    switch (curr) {
      case 'VES': return '🇻🇪';
      case 'USD': return '🇺🇸';
      default: return '💰';
    }
  };

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
        title={`Moneda actual: ${getCurrencyName(currency)}`}
      >
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getCurrencyFlag(currency)}</span>
          <div className="flex items-center space-x-1">
            <span className="font-semibold text-gray-700 text-base">{getCurrencySymbol(currency)}</span>
            {currency === 'VES' && <span className="text-sm text-gray-500">VES</span>}
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-30"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-40 overflow-hidden"
            >
              <div className="py-2">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                  Seleccionar Moneda
                </div>
                
                {currencies.map((curr) => (
                  <button
                    key={curr}
                    onClick={() => handleCurrencySelect(curr)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-50 transition-colors ${
                      currency === curr ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                    }`}
                  >
                    <span className="text-lg">{getCurrencyFlag(curr)}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{getCurrencyName(curr)}</span>
                        <span className="text-sm font-mono">{getCurrencySymbol(curr)}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {curr === 'VES' && 'Bolívares Venezolanos'}
                        {curr === 'USD' && 'Dólares'}
                      </div>
                    </div>
                    
                    {currency === curr && (
                      <div className={`w-2 h-2 rounded-full ${getCurrencyColor(curr)}`} />
                    )}
                  </button>
                ))}
              </div>
              
              <div className="border-t border-gray-100 px-3 py-2 bg-gray-50">
                <p className="text-xs text-gray-500 text-center">
                  Los precios se actualizarán automáticamente
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CurrencyToggle;
