import { useState, useCallback } from 'react';
import { Currency } from '../types';

const EXCHANGE_RATE = 36.5; // Tasa de cambio de REF a VES

export const useCurrency = () => {
  const [currency, setCurrency] = useState<Currency>('VES');

  const toggleCurrency = useCallback(() => {
    setCurrency(prev => (prev === 'VES' ? 'REF' : 'VES'));
  }, []);

  /**
   * Formatea un valor numérico a un string de moneda.
   * @param value - El valor numérico a formatear.
   * @param valueCurrency - La moneda ('VES' o 'REF') del valor proporcionado.
   */
  const formatPrice = (value: number, valueCurrency: Currency) => {
    const symbol = valueCurrency === 'VES' ? 'Bs.' : '$';
    const options: Intl.NumberFormatOptions = {
      minimumFractionDigits: valueCurrency === 'REF' ? 2 : 0,
      maximumFractionDigits: valueCurrency === 'REF' ? 2 : 0,
    };
    const formattedValue = new Intl.NumberFormat('es-VE', options).format(value);
    return `${symbol} ${formattedValue}`;
  };

  const convertPrice = (price: number, fromCurrency: Currency) => {
    if (fromCurrency === currency) return price;
    return fromCurrency === 'VES' ? price / EXCHANGE_RATE : price * EXCHANGE_RATE;
  };

  return {
    currency,
    toggleCurrency,
    formatPrice,
    convertPrice,
    exchangeRate: EXCHANGE_RATE,
  };
};