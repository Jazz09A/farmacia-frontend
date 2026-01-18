import React from 'react';

interface DiscountProgressBarProps {
  currentQuantity: number;
  targetQuantity: number;
  discountName: string;
  discountValue: string;
  className?: string;
}

export const DiscountProgressBar: React.FC<DiscountProgressBarProps> = ({
  currentQuantity,
  targetQuantity,
  discountName,
  discountValue,
  className = ''
}) => {
  const progress = Math.min((currentQuantity / targetQuantity) * 100, 100);
  const remaining = Math.max(targetQuantity - currentQuantity, 0);

  return (
    <div className={`discount-progress bg-gray-100 rounded-lg p-4 ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">
          {discountName}
        </span>
        <span className="text-sm font-bold text-green-600">
          {discountValue}
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div
          className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <p className="text-xs text-gray-600 text-center">
        {remaining > 0 
          ? `Agrega ${remaining} productos más para obtener este descuento`
          : '¡Descuento aplicado!'
        }
      </p>
    </div>
  );
};

