import React from 'react';
import { useAdminCurrency } from '../../contexts/AdminCurrencyContext';

interface SmartPriceDisplayProps {
  // Monto principal en USD (puede ser string o number)
  amountUsd?: number | string;
  // Prop legacy para compatibilidad
  amount?: number | string;
  className?: string;
  showBothPrices?: boolean;
}

/**
 * Componente inteligente para mostrar precios que se adapta a los datos disponibles
 */
const SmartPriceDisplay: React.FC<SmartPriceDisplayProps> = ({
  amountUsd,
  amount, // Prop legacy
  className = '',
  showBothPrices = false
}) => {
  const { currency, formatPrice } = useAdminCurrency();

  // Usar amountUsd si está disponible, sino usar amount (legacy)
  const priceValue = amountUsd !== undefined ? amountUsd : amount;

  // Convertir string a number si es necesario
  const numericValue = typeof priceValue === 'string' ? parseFloat(priceValue) : priceValue;

  if (typeof numericValue === 'number' && !isNaN(numericValue) && numericValue > 0) {
    // Formatear solo con símbolo $ (sin texto adicional)
    const formatted = numericValue.toLocaleString('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return <span className={className}>${formatted}</span>;
  }

  // No hay datos para mostrar
  return <span className={className}>--</span>;
};

export default SmartPriceDisplay;
