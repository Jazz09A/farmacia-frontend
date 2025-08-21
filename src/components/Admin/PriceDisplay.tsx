import React from 'react';
import { useAdminCurrency } from '../../contexts/AdminCurrencyContext';

interface PriceDisplayProps {
  priceVes: number;
  priceRef: number;
  className?: string;
  showBothPrices?: boolean;
}

/**
 * Componente para mostrar precios en la divisa seleccionada en el admin
 * Usa directamente los precios del backend (price_ves y price_ref) sin conversión
 */
const PriceDisplay: React.FC<PriceDisplayProps> = ({
  priceVes,
  priceRef,
  className = '',
  showBothPrices = false
}) => {
  const { currency, formatPrice } = useAdminCurrency();

  // Seleccionar el precio correcto según la divisa
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
};

export default PriceDisplay;
