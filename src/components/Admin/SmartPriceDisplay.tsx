import React from 'react';
import { useAdminCurrency } from '../../contexts/AdminCurrencyContext';

interface SmartPriceDisplayProps {
  // Monto principal en USD
  amountUsd?: number;
  className?: string;
  showBothPrices?: boolean;
}

/**
 * Componente inteligente para mostrar precios que se adapta a los datos disponibles
 */
const SmartPriceDisplay: React.FC<SmartPriceDisplayProps> = ({
  amountUsd,
  className = '',
  showBothPrices = false
}) => {
  const { currency, formatPrice } = useAdminCurrency();

  if (typeof amountUsd === 'number') {
    const display = currency === 'VES' ? amountUsd * 36.5 : amountUsd; // TODO: obtener tasa del contexto admin
    return <span className={className}>{formatPrice(display, currency)}</span>;
  }

  // No hay datos para mostrar
  return <span className={className}>--</span>;
};

export default SmartPriceDisplay;
