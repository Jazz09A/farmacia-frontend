import { useState, useCallback } from 'react';
import { Currency } from '../types';

// Tasas de cambio (placeholder). En producción, obtener desde API y almacenar en contexto/global store.
const EXCHANGE_RATES = {
  VES_TO_USD: 36.5,
};

export const useCurrency = () => {
  const [currency, setCurrency] = useState<Currency>('VES');

  const toggleCurrency = useCallback(() => {
    setCurrency(prev => {
      switch (prev) {
        case 'VES': return 'USD';
        case 'USD': return 'VES';
        default: return 'VES';
      }
    });
  }, []);

  const setCurrencyDirect = useCallback((newCurrency: Currency) => {
    setCurrency(newCurrency);
  }, []);

  /**
   * Obtiene el símbolo de la moneda
   */
  const getCurrencySymbol = (curr: Currency) => {
    switch (curr) {
      case 'VES': return 'Bs.';
      case 'USD': return '$';
      default: return 'Bs.';
    }
  };

  /**
   * Obtiene el nombre completo de la moneda
   */
  const getCurrencyName = (curr: Currency) => {
    switch (curr) {
      case 'VES': return 'Bolívares';
      case 'USD': return 'Dólares';
      default: return 'Bolívares';
    }
  };

  /**
   * Formatea un valor numérico a un string de moneda.
   * @param value - El valor numérico a formatear.
   * @param valueCurrency - La moneda del valor proporcionado.
   */
  const formatPrice = (value: number, valueCurrency: Currency = currency) => {
    const symbol = getCurrencySymbol(valueCurrency);
    const options: Intl.NumberFormatOptions = {
      minimumFractionDigits: valueCurrency === 'VES' ? 0 : 2,
      maximumFractionDigits: valueCurrency === 'VES' ? 0 : 2,
    };
    const formattedValue = new Intl.NumberFormat('es-VE', options).format(value);
    return `${symbol} ${formattedValue}`;
  };

  /**
   * Convierte un precio de una moneda a otra
   */
  const convertPrice = (price: number, fromCurrency: Currency, toCurrency: Currency = currency) => {
    if (fromCurrency === toCurrency) return price;

    // USD es la moneda interna. Convertir solo USD <-> VES
    if (fromCurrency === 'USD' && toCurrency === 'VES') {
      return price * EXCHANGE_RATES.VES_TO_USD;
    }
    if (fromCurrency === 'VES' && toCurrency === 'USD') {
      return price / EXCHANGE_RATES.VES_TO_USD;
    }
    return price;
  };

  /**
   * Obtiene el precio en la moneda actual
   */
  // Con el modelo USD-unificado, los precios vienen en USD y se convierten para display
  const getDisplayPrice = (priceUsd: number, displayCurrency: Currency = currency) => {
    return convertPrice(priceUsd, 'USD', displayCurrency);
  };

  return {
    currency,
    toggleCurrency,
    setCurrency: setCurrencyDirect,
    formatPrice,
    convertPrice,
    getDisplayPrice,
    getCurrencySymbol,
    getCurrencyName,
    exchangeRates: EXCHANGE_RATES,
  };
};