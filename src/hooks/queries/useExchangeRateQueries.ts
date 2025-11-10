import { useQuery } from '@tanstack/react-query';
import { exchangeRateService } from '../../services/ExchangeRateService';
import { queryKeys } from './queryKeys';

export const useExchangeRateQuery = () => {
  return useQuery({
    queryKey: queryKeys.exchangeRate.current,
    queryFn: () => exchangeRateService.getExchangeRate(),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
};


