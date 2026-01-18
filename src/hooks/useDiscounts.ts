import { useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCart } from '../contexts/CartContext';
import { useQuantityDiscountQuery } from './queries/useAuthQueries';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/AuthService';
import { queryKeys } from './queries/queryKeys';

export const useDiscounts = () => {
  const { cart } = useCart();
  const { isAuthenticated } = useAuth();
  const quantity = cart?.total_items ?? 0;
  const discountQuery = useQuantityDiscountQuery(quantity, isAuthenticated);
  const queryClient = useQueryClient();

  const fetchApplicableDiscount = useCallback(async (nextQuantity: number) => {
    if (!isAuthenticated) return;
    if (nextQuantity <= 0) {
      return;
    }

    if (nextQuantity === quantity) {
      await discountQuery.refetch();
      return;
    }

    await queryClient.fetchQuery({
      queryKey: queryKeys.auth.quantityDiscount(nextQuantity),
      queryFn: () => authService.getApplicableQuantityDiscount(nextQuantity),
    });
  }, [discountQuery, isAuthenticated, queryClient, quantity]);

  const applicableDiscount = discountQuery.data ?? null;

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

  return useMemo(() => ({
    applicableDiscount,
    loading: discountQuery.isLoading || discountQuery.isFetching,
    fetchApplicableDiscount,
    calculatePotentialSavings,
  }), [applicableDiscount, calculatePotentialSavings, discountQuery.isFetching, discountQuery.isLoading, fetchApplicableDiscount]);
};

export default useDiscounts;

