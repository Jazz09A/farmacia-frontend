import React from 'react';

interface PriceWithDiscountProps {
  originalPrice: number;
  discountedPrice: number;
  currency?: string;
  showSavings?: boolean;
  savingsPercentage?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const PriceWithDiscount: React.FC<PriceWithDiscountProps> = ({
  originalPrice,
  discountedPrice,
  currency = 'USD',
  showSavings = true,
  savingsPercentage,
  className = '',
  size = 'md'
}) => {
  const hasDiscount = originalPrice > discountedPrice;
  const actualSavings = originalPrice - discountedPrice;
  const actualSavingsPercentage = savingsPercentage || (hasDiscount ? Math.round((actualSavings / originalPrice) * 100) : 0);

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  if (!hasDiscount) {
    return (
      <span className={`font-semibold ${sizeClasses[size]} ${className}`}>
        {formatPrice(originalPrice)}
      </span>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="flex items-center gap-2">
        {/* Precio original tachado */}
        <span className={`text-gray-500 line-through ${sizeClasses[size]}`}>
          {formatPrice(originalPrice)}
        </span>
        
        {/* Precio con descuento */}
        <span className={`font-bold text-green-600 ${sizeClasses[size]}`}>
          {formatPrice(discountedPrice)}
        </span>
        
        {/* Badge de ahorro */}
        {showSavings && actualSavingsPercentage > 0 && (
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
            -{actualSavingsPercentage}%
          </span>
        )}
      </div>
      
      {/* Información de ahorro */}
      {showSavings && actualSavings > 0 && (
        <div className="text-xs text-green-600 mt-1">
          Ahorras {formatPrice(actualSavings)}
        </div>
      )}
    </div>
  );
};

export default PriceWithDiscount;