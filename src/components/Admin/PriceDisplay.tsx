import React from 'react';
import { useAdminCurrency } from '../../contexts/AdminCurrencyContext';

interface PriceDisplayProps {
  price: number; // USD
  originalPrice?: number; // USD
  className?: string;
  showBothPrices?: boolean;
}

/**
 * Componente para mostrar precios en la divisa seleccionada en el admin
 * Muestra precio basado en USD y convierte a VES solo para display
 */
const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  originalPrice,
  className = '',
  showBothPrices = false
}) => {
  const { currency, formatPrice } = useAdminCurrency();

  // Seleccionar el precio correcto según la divisa
  const getDisplayPrice = () => {
    const display = currency === 'VES' ? price * 36.5 : price; // TODO: tasa dinámica
    return { price: display, displayCurrency: currency };
  };

  const { price, displayCurrency } = getDisplayPrice();

  if (showBothPrices) {
    return (
      <div className={`space-y-1 ${className}`}>
        <div className="font-semibold">
          {formatPrice(price, displayCurrency)}
        </div>
        <div className="text-xs text-gray-500">
          USD: {formatPrice(price, 'USD' as any)} | VES: {formatPrice(price * 36.5, 'VES' as any)}
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
