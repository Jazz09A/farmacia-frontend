import { useQuery } from '@tanstack/react-query';
import { userService } from '../../services/UserService';
import type { UserStats } from '../../services/UserService';
import { queryKeys } from './queryKeys';

const userQueryKeys = {
  stats: ['user', 'stats'] as const,
};

export const useUserStatsQuery = (enabled: boolean = true) => {
  return useQuery<UserStats>({
    queryKey: userQueryKeys.stats,
    queryFn: () => userService.getUserStats(),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
};

