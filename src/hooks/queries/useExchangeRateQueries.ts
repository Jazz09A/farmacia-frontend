import { useQuery } from '@tanstack/react-query';
import { exchangeRateService } from '../../services/ExchangeRateService';
import { queryKeys } from './queryKeys';

export const useExchangeRateQuery = () => {
  return useQuery({
    queryKey: queryKeys.exchangeRate.current,
    queryFn: () => exchangeRateService.getExchangeRate(),
    staleTime: 60 * 60 * 1000,
    gcTime: 2 * 60 * 60 * 1000,
    refetchInterval: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};


