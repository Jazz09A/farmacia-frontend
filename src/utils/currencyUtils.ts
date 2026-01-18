// Utilidades para formateo de monedas según documentación

/**
 * Formatear monto en VES (Bolívares)
 */
export const formatVES = (amount: string | number): string => {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numericAmount)) {
    return 'Bs. 0,00';
  }
  
  return new Intl.NumberFormat('es-VE', {
    style: 'currency',
    currency: 'VES',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numericAmount);
};

/**
 * Formatear monto en USD (Dólares estadounidenses)
 */
export const formatUSD = (amount: string | number): string => {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numericAmount)) {
    return '$0.00';
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numericAmount);
};

// Alias para compatibilidad con código existente
export const formatREF = formatUSD;


/**
 * Convertir VES a USD usando tasa de cambio
 */
export const convertVesToUsd = (vesAmount: string | number, exchangeRate: string | number): string => {
  const ves = typeof vesAmount === 'string' ? parseFloat(vesAmount) : vesAmount;
  const rate = typeof exchangeRate === 'string' ? parseFloat(exchangeRate) : exchangeRate;
  
  if (isNaN(ves) || isNaN(rate) || rate === 0) {
    return '0.00';
  }
  
  return (ves / rate).toFixed(2);
};

/**
 * Convertir USD a VES usando tasa de cambio
 */
export const convertUsdToVes = (usdAmount: string | number, exchangeRate: string | number): string => {
  const usd = typeof usdAmount === 'string' ? parseFloat(usdAmount) : usdAmount;
  const rate = typeof exchangeRate === 'string' ? parseFloat(exchangeRate) : exchangeRate;
  
  if (isNaN(usd) || isNaN(rate) || rate === 0) {
    return '0.00';
  }
  
  return (usd * rate).toFixed(2);
};

// Alias para compatibilidad con código existente
export const convertVesToRef = convertVesToUsd;
export const convertRefToVes = convertUsdToVes;

/**
 * Formatear tasa de cambio
 */
export const formatExchangeRate = (rate: string | number): string => {
  const numericRate = typeof rate === 'string' ? parseFloat(rate) : rate;
  
  if (isNaN(numericRate)) {
    return '0.00';
  }
  
  return new Intl.NumberFormat('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4
  }).format(numericRate);
};

/**
 * Validar si un string es un número decimal válido
 */
export const isValidDecimal = (value: string): boolean => {
  if (!value || value.trim() === '') return false;
  
  const numericValue = parseFloat(value);
  return !isNaN(numericValue) && isFinite(numericValue) && numericValue >= 0;
};

/**
 * Convertir string a decimal válido
 */
export const toDecimal = (value: string | number): string => {
  if (typeof value === 'number') {
    return value.toFixed(2);
  }
  
  const numericValue = parseFloat(value);
  if (isNaN(numericValue)) {
    return '0.00';
  }
  
  return numericValue.toFixed(2);
};

/**
 * Comparar dos montos decimales
 */
export const compareDecimals = (a: string, b: string): number => {
  const numA = parseFloat(a);
  const numB = parseFloat(b);
  
  if (isNaN(numA) || isNaN(numB)) return 0;
  
  return numA - numB;
};

/**
 * Sumar dos montos decimales
 */
export const addDecimals = (a: string, b: string): string => {
  const numA = parseFloat(a) || 0;
  const numB = parseFloat(b) || 0;
  
  return (numA + numB).toFixed(2);
};

/**
 * Restar dos montos decimales
 */
export const subtractDecimals = (a: string, b: string): string => {
  const numA = parseFloat(a) || 0;
  const numB = parseFloat(b) || 0;
  
  return (numA - numB).toFixed(2);
};

/**
 * Determinar si un método de pago es venezolano (VES) o extranjero (USD)
 */
export const getPaymentMethodCurrency = (paymentMethodId: string): 'VES' | 'USD' => {
  // Métodos de pago venezolanos
  const venezuelanMethods = [
    'pago-movil',
    'transferencia',
    'efectivo-ves'
  ];
  
  // Métodos de pago extranjeros
  const foreignMethods = [
    'zelle',
    'paypal',
    'transferencia-usd',
    'efectivo-usd',
    'credito'
  ];
  
  if (venezuelanMethods.includes(paymentMethodId)) {
    return 'VES';
  }
  
  if (foreignMethods.includes(paymentMethodId)) {
    return 'USD';
  }
  
  // Para efectivo, asumir VES por defecto
  if (paymentMethodId === 'efectivo') {
    return 'VES';
  }
  
  // Por defecto, asumir USD para métodos no reconocidos
  return 'USD';
};

/**
 * Obtener el total de la orden en la moneda correcta según el método de pago
 */
export const getOrderTotalInPaymentCurrency = (
  orderTotalVes: number,
  orderTotalUsd: number,
  paymentMethodId: string
): number => {
  const currency = getPaymentMethodCurrency(paymentMethodId);
  return currency === 'VES' ? orderTotalVes : orderTotalUsd;
};
