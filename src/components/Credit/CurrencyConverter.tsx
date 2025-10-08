// Componente de calculadora de conversión de monedas según documentación

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRightLeft, Calculator } from 'lucide-react';
import { formatVES, formatUSD, convertVesToUsd, convertUsdToVes, formatExchangeRate } from '../../utils/currencyUtils';

interface CurrencyConverterProps {
  exchangeRate: string;
  className?: string;
}

export const CurrencyConverter: React.FC<CurrencyConverterProps> = ({ 
  exchangeRate, 
  className = '' 
}) => {
  const [vesAmount, setVesAmount] = useState('');
  const [usdAmount, setUsdAmount] = useState('');
  const [activeInput, setActiveInput] = useState<'VES' | 'USD' | null>(null);

  // Convertir VES a USD
  const convertVesToUsdAmount = (ves: string) => {
    if (!ves || !exchangeRate) return '';
    return convertVesToUsd(ves, exchangeRate);
  };

  // Convertir USD a VES
  const convertUsdToVesAmount = (usd: string) => {
    if (!usd || !exchangeRate) return '';
    return convertUsdToVes(usd, exchangeRate);
  };

  // Manejar cambio en VES
  const handleVesChange = (value: string) => {
    setVesAmount(value);
    setActiveInput('VES');
    
    if (value && !isNaN(parseFloat(value))) {
      const converted = convertVesToUsdAmount(value);
      setUsdAmount(converted);
    } else {
      setUsdAmount('');
    }
  };

  // Manejar cambio en USD
  const handleUsdChange = (value: string) => {
    setUsdAmount(value);
    setActiveInput('USD');
    
    if (value && !isNaN(parseFloat(value))) {
      const converted = convertUsdToVesAmount(value);
      setVesAmount(converted);
    } else {
      setVesAmount('');
    }
  };

  // Limpiar formulario
  const clearForm = () => {
    setVesAmount('');
    setUsdAmount('');
    setActiveInput(null);
  };

  // Formatear valores para mostrar
  const getFormattedVes = () => {
    if (!vesAmount || isNaN(parseFloat(vesAmount))) return '';
    return formatVES(vesAmount);
  };

  const getFormattedUsd = () => {
    if (!usdAmount || isNaN(parseFloat(usdAmount))) return '';
    return formatUSD(usdAmount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl shadow-lg p-6 ${className}`}
    >
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-bold text-gray-800">Calculadora de Conversión</h3>
      </div>

      {/* Tasa de cambio actual */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-blue-800">Tasa de cambio actual:</span>
          <span className="text-lg font-bold text-blue-900">
            {formatExchangeRate(exchangeRate)} VES/USD
          </span>
        </div>
      </div>

      {/* Campos de conversión */}
      <div className="space-y-4">
        {/* VES a USD */}
        <div>
          <label htmlFor="ves-amount" className="block text-sm font-medium text-gray-700 mb-2">
            Monto en VES (Bolívares)
          </label>
          <div className="relative">
            <input
              id="ves-amount"
              type="number"
              value={vesAmount}
              onChange={(e) => handleVesChange(e.target.value)}
              onFocus={() => setActiveInput('VES')}
              step="0.01"
              min="0"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                activeInput === 'VES' ? 'border-blue-500' : 'border-gray-300'
              }`}
              placeholder="0.00"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 text-sm font-medium">VES</span>
            </div>
          </div>
          {vesAmount && !isNaN(parseFloat(vesAmount)) && (
            <p className="mt-1 text-sm text-gray-600">
              {getFormattedVes()}
            </p>
          )}
        </div>

        {/* Flecha de conversión */}
        <div className="flex justify-center">
          <motion.div
            animate={{ rotate: activeInput ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="p-2 bg-gray-100 rounded-full"
          >
            <ArrowRightLeft className="w-5 h-5 text-gray-600" />
          </motion.div>
        </div>

        {/* USD a VES */}
        <div>
          <label htmlFor="usd-amount" className="block text-sm font-medium text-gray-700 mb-2">
            Monto en USD (Dólares)
          </label>
          <div className="relative">
            <input
              id="usd-amount"
              type="number"
              value={usdAmount}
              onChange={(e) => handleUsdChange(e.target.value)}
              onFocus={() => setActiveInput('USD')}
              step="0.01"
              min="0"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                activeInput === 'USD' ? 'border-blue-500' : 'border-gray-300'
              }`}
              placeholder="0.00"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 text-sm font-medium">USD</span>
            </div>
          </div>
          {usdAmount && !isNaN(parseFloat(usdAmount)) && (
            <p className="mt-1 text-sm text-gray-600">
              {getFormattedUsd()}
            </p>
          )}
        </div>
      </div>

      {/* Botón de limpiar */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={clearForm}
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Limpiar
        </button>
      </div>

      {/* Información adicional */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-800 mb-2">Información:</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Los cálculos se realizan en tiempo real</li>
          <li>• La tasa de cambio se actualiza automáticamente</li>
          <li>• Los montos se formatean según la moneda local</li>
          <li>• USD es la moneda base para el sistema de crédito</li>
        </ul>
      </div>
    </motion.div>
  );
};
