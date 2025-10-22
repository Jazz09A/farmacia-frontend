import { useState, useCallback, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { authService } from '../services/AuthService';
import { QuantityDiscount, ApplicableDiscountResponse } from '../types/discounts';

export const useDiscounts = () => {
  const { cart } = useCart();
  const [applicableDiscount, setApplicableDiscount] = useState<QuantityDiscount | null>(null);
  const [loading, setLoading] = useState(false);

  // Obtener descuento aplicable por cantidad
  const fetchApplicableDiscount = useCallback(async (quantity: number) => {
    if (quantity === 0) {
      setApplicableDiscount(null);
      return;
    }

    setLoading(true);
    try {
      const discount = await authService.getApplicableQuantityDiscount(quantity);
      setApplicableDiscount(discount);
    } catch (error) {
      console.error('Error fetching applicable discount:', error);
      setApplicableDiscount(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Calcular ahorro potencial
  const calculatePotentialSavings = useCallback((
    cartTotal: number,
    quantity: number
  ): number => {
    if (!applicableDiscount || quantity < applicableDiscount.min_quantity) {
      return 0;
    }

    if (applicableDiscount.discount_type === 'percentage') {
      return cartTotal * (applicableDiscount.discount_value / 100);
    } else {
      return applicableDiscount.discount_value;
    }
  }, [applicableDiscount]);

  // Auto-fetch cuando cambie la cantidad del carrito
  useEffect(() => {
    if (cart?.total_items) {
      fetchApplicableDiscount(cart.total_items);
    }
  }, [cart?.total_items, fetchApplicableDiscount]);

  return {
    applicableDiscount,
    loading,
    fetchApplicableDiscount,
    calculatePotentialSavings
  };
};

