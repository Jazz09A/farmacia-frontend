import { useState, useCallback } from 'react';
import { Currency } from '../types';

// Tasas de cambio (estas deberían venir de una API en producción)
const EXCHANGE_RATES = {
  VES_TO_REF: 36.5,
  VES_TO_USD: 36.5, // Mismo que REF por ahora
  REF_TO_USD: 1.0,  // REF es equivalente a USD
};

export const useCurrency = () => {
  const [currency, setCurrency] = useState<Currency>('VES');

  const toggleCurrency = useCallback(() => {
    setCurrency(prev => {
      switch (prev) {
        case 'VES': return 'USD';
        case 'USD': return 'REF';
        case 'REF': return 'VES';
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
      case 'REF': return '$';
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
      case 'REF': return 'Precio Ref.';
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

    // Convertir todo a VES primero como moneda base
    let priceInVES = price;
    if (fromCurrency === 'REF' || fromCurrency === 'USD') {
      priceInVES = price * EXCHANGE_RATES.VES_TO_REF;
    }

    // Luego convertir de VES a la moneda objetivo
    switch (toCurrency) {
      case 'VES':
        return priceInVES;
      case 'REF':
      case 'USD':
        return priceInVES / EXCHANGE_RATES.VES_TO_REF;
      default:
        return priceInVES;
    }
  };

  /**
   * Obtiene el precio en la moneda actual
   */
  const getPriceInCurrency = (priceVes: number, priceRef: number) => {
    switch (currency) {
      case 'VES':
        return priceVes;
      case 'USD':
      case 'REF':
        return priceRef;
      default:
        return priceVes;
    }
  };

  return {
    currency,
    toggleCurrency,
    setCurrency: setCurrencyDirect,
    formatPrice,
    convertPrice,
    getPriceInCurrency,
    getCurrencySymbol,
    getCurrencyName,
    exchangeRates: EXCHANGE_RATES,
  };
};