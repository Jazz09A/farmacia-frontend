import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/AdminService';
import type { Order } from '../../types';
import type { QuoteDetailResponse } from '../../types/quotes';
import { queryKeys } from './queryKeys';

export const useAdminDashboardQuery = (timeRange: string = '7') => {
  return useQuery({
    queryKey: queryKeys.admin.dashboard(timeRange),
    queryFn: () => adminService.getDashboardMetrics(timeRange),
    staleTime: 60 * 1000,
  });
};

export const useAdminOrdersQuery = (params: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}) => {
  // Legacy /admin/orders no montado — preferir useAdminQuotesQuery
  return useQuery({
    queryKey: queryKeys.admin.orders(params),
    queryFn: () => adminService.getOrders(params),
    enabled: false,
    staleTime: Infinity,
    retry: false,
    keepPreviousData: true as any,
  });
};

export const useAdminQuotesQuery = (params: {
  page?: number;
  page_size?: number;
  status?: string;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}) => {
  return useQuery({
    queryKey: queryKeys.admin.quotes(params),
    queryFn: () => adminService.getQuotes(params),
    staleTime: 30 * 1000,
    keepPreviousData: true as any,
  });
};

export const useAdminQuoteDetailQuery = (quoteId: string, enabled: boolean = true) => {
  return useQuery<QuoteDetailResponse>({
    queryKey: queryKeys.admin.quote(quoteId),
    queryFn: () => adminService.getQuoteDetail(quoteId),
    enabled: !!quoteId && enabled,
    staleTime: 2 * 60 * 1000,
  });
};

export const useAdminOrderDetailsQuery = (orderId: string, enabled: boolean = true) => {
  // Legacy /admin/order/{id} no montado — preferir useAdminQuoteDetailQuery
  return useQuery<Order>({
    queryKey: queryKeys.admin.order(orderId),
    queryFn: () => adminService.getOrderDetails(orderId),
    enabled: false && !!orderId && enabled,
    staleTime: Infinity,
    retry: false,
  });
};

export const useAdminCustomersQuery = () => {
  return useQuery({
    queryKey: queryKeys.admin.customers,
    queryFn: () => adminService.getCustomers(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCustomerStatsQuery = (userId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.admin.customerStats(userId),
    queryFn: () => adminService.getCustomerStats(userId),
    enabled: !!userId && enabled,
    staleTime: 5 * 60 * 1000,
  });
};

export const useAdminAnalyticsQuery = (timeRange: string = 'month') => {
  return useQuery({
    queryKey: queryKeys.admin.analytics(timeRange),
    queryFn: () => adminService.getAdvancedAnalytics(timeRange),
    staleTime: 60 * 1000,
  });
};

export const useUpdateOrderStatusMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) => adminService.updateOrderStatus(orderId, status),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.orders({}) as any });
      qc.invalidateQueries({ queryKey: queryKeys.admin.order(variables.orderId) });
    },
  });
};

export const useUpdatePaymentStatusMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, paymentStatus }: { orderId: string; paymentStatus: 'completed' | 'failed' }) =>
      adminService.updatePaymentStatus(orderId, paymentStatus),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.orders({}) as any });
      qc.invalidateQueries({ queryKey: queryKeys.admin.order(variables.orderId) });
    },
  });
};

export const useDeleteOrderMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => adminService.deleteOrder(orderId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.orders({}) as any });
    },
  });
};

export const useBulkUploadProductsMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => adminService.bulkUploadProducts(file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });
};

export const useCreateProductMutationAdmin = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (product: any) => adminService.createProduct(product),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });
};


