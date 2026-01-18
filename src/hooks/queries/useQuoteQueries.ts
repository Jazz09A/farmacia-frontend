import { useQuery } from '@tanstack/react-query';
import quoteService, { QuoteListParams } from '../../services/api/quotes';
import { queryKeys } from './queryKeys';
import type { QuoteDetailResponse, QuoteStatusDescriptor, QuoteListResponse } from '../../types/quotes';

export const useQuoteStatusesQuery = (enabled: boolean = true) =>
  useQuery<QuoteStatusDescriptor[]>({
    queryKey: queryKeys.quotes.statuses,
    queryFn: () => quoteService.getQuoteStatuses(),
    staleTime: 30 * 60 * 1000,
    enabled,
  });

export const useQuoteListQuery = (params: QuoteListParams, enabled: boolean = true) =>
  useQuery<QuoteListResponse>({
    queryKey: queryKeys.quotes.list(params),
    queryFn: () => quoteService.listUserQuotes(params),
    keepPreviousData: true,
    enabled,
  });

export const useQuoteDetailQuery = (quoteId: string, enabled: boolean = true) =>
  useQuery<QuoteDetailResponse>({
    queryKey: queryKeys.quotes.detail(quoteId),
    queryFn: () => quoteService.getQuoteDetail(quoteId),
    enabled: enabled && Boolean(quoteId),
    staleTime: 5 * 60 * 1000,
  });

