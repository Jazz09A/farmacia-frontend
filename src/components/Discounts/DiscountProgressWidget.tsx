import React from 'react';
import { useCart } from '../../contexts/CartContext';
import { useGlobalCurrency } from '../../contexts/GlobalCurrencyContext';
import { DiscountProgressBar } from './DiscountProgressBar';
import { QuantityDiscountIndicator } from './QuantityDiscountIndicator';

export const DiscountProgressWidget: React.FC = () => {
  const { cart, applicableQuantityDiscount } = useCart();
  const { formatPriceFromBackend } = useGlobalCurrency();

  if (!cart || !applicableQuantityDiscount) return null;

  const currentQuantity = cart.total_items;
  const targetQuantity = applicableQuantityDiscount.min_quantity;
  const isActive = currentQuantity >= targetQuantity;

  const discountValue = applicableQuantityDiscount.discount_type === 'percentage' 
    ? `${applicableQuantityDiscount.discount_value}%`
    : formatPriceFromBackend(applicableQuantityDiscount.discount_value.toString());

  return (
    <div className="space-y-4">
      {/* Indicador de descuento aplicado o próximo */}
      <QuantityDiscountIndicator
        currentQuantity={currentQuantity}
        applicableDiscount={applicableQuantityDiscount}
        formatPrice={formatPriceFromBackend}
      />

      {/* Barra de progreso hacia el descuento */}
      {!isActive && (
        <DiscountProgressBar
          currentQuantity={currentQuantity}
          targetQuantity={targetQuantity}
          discountName={applicableQuantityDiscount.name}
          discountValue={discountValue}
        />
      )}
    </div>
  );
};

