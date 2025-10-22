import { useState, useCallback, useEffect } from 'react';
import { Currency } from '../types';
import { exchangeRateService, ExchangeRateData } from '../services/ExchangeRateService';

// Tasas de cambio por defecto (fallback)
const DEFAULT_EXCHANGE_RATES = {
  USD_TO_VES: 36.5,
  VES_TO_USD: 1 / 36.5,
};

export const useCurrency = () => {
  const [currency, setCurrency] = useState<Currency>('USD');
  const [exchangeRates, setExchangeRates] = useState(DEFAULT_EXCHANGE_RATES);
  const [exchangeRateData, setExchangeRateData] = useState<ExchangeRateData | null>(null);
  const [isLoadingRates, setIsLoadingRates] = useState(false);

  const toggleCurrency = useCallback(() => {
    setCurrency(prev => {
      switch (prev) {
        case 'VES': return 'USD';
        case 'USD': return 'VES';
        default: return 'USD';
      }
    });
  }, []);

  const setCurrencyDirect = useCallback((newCurrency: Currency) => {
    setCurrency(newCurrency);
  }, []);

  // Cargar tasas de cambio al inicializar
  useEffect(() => {
    const loadExchangeRates = async () => {
      setIsLoadingRates(true);
      try {
        const data = await exchangeRateService.getExchangeRate();
        setExchangeRateData(data);
        setExchangeRates({
          USD_TO_VES: data.rate,
          VES_TO_USD: 1 / data.rate,
        });
      } catch (error) {
        console.warn('Failed to load exchange rates, using defaults:', error);
        // Mantener las tasas por defecto en caso de error
      } finally {
        setIsLoadingRates(false);
      }
    };

    loadExchangeRates();
  }, []);

  // Función para actualizar las tasas de cambio manualmente
  const refreshExchangeRates = useCallback(async () => {
    setIsLoadingRates(true);
    try {
      const data = await exchangeRateService.getExchangeRate(true); // Forzar actualización
      setExchangeRateData(data);
      setExchangeRates({
        USD_TO_VES: data.rate,
        VES_TO_USD: 1 / data.rate,
      });
    } catch (error) {
      console.error('Failed to refresh exchange rates:', error);
      throw error;
    } finally {
      setIsLoadingRates(false);
    }
  }, []);

  /**
   * Obtiene el símbolo de la moneda
   */
  const getCurrencySymbol = (curr: Currency) => {
    switch (curr) {
      case 'VES': return 'Bs.S';
      case 'USD': return '$';
      default: return '$';
    }
  };

  /**
   * Obtiene el nombre completo de la moneda
   */
  const getCurrencyName = (curr: Currency) => {
    switch (curr) {
      case 'VES': return 'Bolívares';
      case 'USD': return 'Dólares';
      default: return 'Dólares';
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
   * @param price - Precio como string o number (viene del backend como string)
   * @param fromCurrency - Moneda origen
   * @param toCurrency - Moneda destino
   */
  const convertPrice = (price: string | number, fromCurrency: Currency, toCurrency: Currency = currency) => {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    
    if (isNaN(numericPrice)) return 0;
    if (fromCurrency === toCurrency) return numericPrice;

    // USD es la moneda interna. Convertir solo USD <-> VES
    if (fromCurrency === 'USD' && toCurrency === 'VES') {
      return numericPrice * exchangeRates.USD_TO_VES;
    }
    if (fromCurrency === 'VES' && toCurrency === 'USD') {
      return numericPrice * exchangeRates.VES_TO_USD;
    }
    return numericPrice;
  };

  /**
   * Obtiene el precio en la moneda actual
   * @param priceUsd - Precio en USD (viene como string del backend)
   * @param displayCurrency - Moneda para mostrar
   */
  const getDisplayPrice = (priceUsd: string | number, displayCurrency: Currency = currency) => {
    return convertPrice(priceUsd, 'USD', displayCurrency);
  };

  /**
   * Formatea un precio que viene del backend (string USD) para mostrar en la moneda actual
   * @param priceUsd - Precio en USD como string del backend
   * @param displayCurrency - Moneda para mostrar (opcional, usa la moneda actual)
   */
  const formatPriceFromBackend = (priceUsd: string | number, displayCurrency: Currency = currency) => {
    // Validar que el precio sea válido
    if (priceUsd === null || priceUsd === undefined || priceUsd === '') {
      return formatPrice(0, displayCurrency);
    }
    
    const convertedPrice = getDisplayPrice(priceUsd, displayCurrency);
    
    // Verificar que la conversión sea válida
    if (isNaN(convertedPrice) || !isFinite(convertedPrice)) {
      console.warn('Invalid price conversion:', { priceUsd, displayCurrency, convertedPrice });
      return formatPrice(0, displayCurrency);
    }
    
    return formatPrice(convertedPrice, displayCurrency);
  };

  return {
    currency,
    toggleCurrency,
    setCurrency: setCurrencyDirect,
    formatPrice,
    convertPrice,
    getDisplayPrice,
    formatPriceFromBackend,
    getCurrencySymbol,
    getCurrencyName,
    exchangeRates,
    exchangeRateData,
    isLoadingRates,
    refreshExchangeRates,
  };
};