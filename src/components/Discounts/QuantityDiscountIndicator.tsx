import React from 'react';
import { QuantityDiscount } from '../../types/discounts';
import { Currency } from '../../types';

interface QuantityDiscountIndicatorProps {
  currentQuantity: number;
  applicableDiscount?: QuantityDiscount;
  formatPrice: (value: number) => string;
  onViewDetails?: () => void;
  className?: string;
}

export const QuantityDiscountIndicator: React.FC<QuantityDiscountIndicatorProps> = ({
  currentQuantity,
  applicableDiscount,
  formatPrice,
  onViewDetails,
  className = ''
}) => {
  if (!applicableDiscount) return null;

  const isActive = currentQuantity >= applicableDiscount.min_quantity;
  const remaining = Math.max(applicableDiscount.min_quantity - currentQuantity, 0);

  return (
    <div className={`p-3 rounded-lg border-2 transition-all duration-300 ${
      isActive 
        ? 'bg-green-50 border-green-300' 
        : 'bg-blue-50 border-blue-300'
    } ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className={`text-2xl mr-2 ${isActive ? 'text-green-600' : 'text-blue-600'}`}>
            {isActive ? '🎉' : '📈'}
          </span>
          <div>
            <p className={`font-semibold ${isActive ? 'text-green-800' : 'text-blue-800'}`}>
              {isActive ? '¡Descuento Aplicado!' : '¡Estás cerca de un descuento!'}
            </p>
            <p className="text-sm text-gray-600">
              {isActive 
                ? `Ahorras con ${applicableDiscount.name}`
                : `Agrega ${remaining} productos más para obtener ${applicableDiscount.name}`
              }
            </p>
          </div>
        </div>
        
        {onViewDetails && (
          <button
            onClick={onViewDetails}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Ver detalles
          </button>
        )}
      </div>
    </div>
  );
};

