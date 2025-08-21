import React from 'react';
import { useAdminCurrency } from '../../contexts/AdminCurrencyContext';

interface SmartPriceDisplayProps {
  // Para cuando solo tenemos un valor (como en dashboard metrics)
  amount?: number;
  // Para cuando tenemos ambos precios del backend
  priceVes?: number;
  priceRef?: number;
  className?: string;
  showBothPrices?: boolean;
}

/**
 * Componente inteligente para mostrar precios que se adapta a los datos disponibles
 */
const SmartPriceDisplay: React.FC<SmartPriceDisplayProps> = ({
  amount,
  priceVes,
  priceRef,
  className = '',
  showBothPrices = false
}) => {
  const { currency, formatPrice } = useAdminCurrency();

  // Si tenemos ambos precios del backend (caso ideal)
  if (priceVes !== undefined && priceRef !== undefined) {
    const getDisplayPrice = () => {
      switch (currency) {
        case 'VES':
          return { price: priceVes, displayCurrency: 'VES' as const };
        case 'USD':
        case 'REF':
          return { price: priceRef, displayCurrency: currency };
        default:
          return { price: priceVes, displayCurrency: 'VES' as const };
      }
    };

    const { price, displayCurrency } = getDisplayPrice();

    if (showBothPrices) {
      return (
        <div className={`space-y-1 ${className}`}>
          <div className="font-semibold">
            {formatPrice(price, displayCurrency)}
          </div>
          <div className="text-xs text-gray-500">
            VES: {formatPrice(priceVes, 'VES')} | USD/REF: {formatPrice(priceRef, 'USD')}
          </div>
        </div>
      );
    }

    return (
      <span className={className}>
        {formatPrice(price, displayCurrency)}
      </span>
    );
  }

  // Si solo tenemos un valor (fallback para datos legacy o dashboard)
  if (amount !== undefined) {
    // Asumimos que el amount está en la divisa que el backend está configurado para enviar
    // Por ahora, asumimos VES y convertimos si es necesario
    const displayPrice = currency === 'VES' ? amount : amount / 36.5; // Conversión básica
    
    return (
      <span className={className}>
        {formatPrice(displayPrice, currency)}
      </span>
    );
  }

  // No hay datos para mostrar
  return <span className={className}>--</span>;
};

export default SmartPriceDisplay;
