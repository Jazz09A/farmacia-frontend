import { useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCartWithDiscountsQuery } from './queries/useAuthQueries';

export const useCartWithDiscounts = () => {
  const { isAuthenticated } = useAuth();
  const query = useCartWithDiscountsQuery(isAuthenticated);

  const refreshCart = useCallback(async () => {
    await query.refetch();
  }, [query]);

  return useMemo(() => ({
    cartWithDiscounts: query.data ?? null,
    loading: query.isLoading || query.isFetching,
    error: query.error instanceof Error ? query.error.message : null,
    refreshCart,
  }), [query.data, query.error, query.isFetching, query.isLoading, refreshCart]);
};

export default useCartWithDiscounts;

