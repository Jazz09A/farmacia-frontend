import React from 'react';
import { CartDiscounts } from '../../types/discounts';
import { Currency } from '../../types';

interface DiscountSummaryProps {
  discounts: CartDiscounts;
  currency: Currency;
  formatPrice: (value: number) => string;
  className?: string;
}

export const DiscountSummary: React.FC<DiscountSummaryProps> = ({
  discounts,
  currency,
  formatPrice,
  className = ''
}) => {
  if (discounts.total_discount === 0) return null;

  return (
    <div className={`discount-summary bg-green-50 border border-green-200 rounded-lg p-4 mb-4 ${className}`}>
      <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
        <span className="mr-2">🎉</span>
        Descuentos Aplicados
      </h3>
      
      <div className="space-y-2">
        {discounts.quantity_discount && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-green-700">
              {discounts.quantity_discount.name}
            </span>
            <span className="font-semibold text-green-800">
              -{formatPrice(discounts.quantity_discount_amount)}
            </span>
          </div>
        )}
        
        {discounts.flash_discount_total > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-green-700">
              Ofertas Flash
            </span>
            <span className="font-semibold text-green-800">
              -{formatPrice(discounts.flash_discount_total)}
            </span>
          </div>
        )}
        
        <div className="border-t border-green-200 pt-2 mt-2">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-green-800">
              Ahorro Total
            </span>
            <span className="font-bold text-green-900 text-lg">
              -{formatPrice(discounts.total_discount)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

