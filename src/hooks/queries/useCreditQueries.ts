import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import creditService from '../../services/CreditService';
import { queryKeys } from './queryKeys';

export const useCreditInfoQuery = () => {
  return useQuery({
    queryKey: queryKeys.credit.info,
    queryFn: () => creditService.getCreditInfo(),
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
};

export const useCreditDashboardQuery = () => {
  return useQuery({
    queryKey: queryKeys.credit.dashboard,
    queryFn: () => creditService.getCreditDashboard(),
    staleTime: 2 * 60 * 1000,
  });
};

export const useCreditOrdersQuery = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: queryKeys.credit.orders(page, limit),
    queryFn: () => creditService.getCreditOrders(page, limit),
    staleTime: 60 * 1000,
    keepPreviousData: true as any,
  });
};

export const useCreditOrderDetailsQuery = (orderId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.credit.order(orderId),
    queryFn: () => creditService.getCreditOrderDetails(orderId),
    enabled: !!orderId && enabled,
    staleTime: 2 * 60 * 1000,
  });
};

export const useOrderPaymentsQuery = (orderId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.credit.orderPayments(orderId),
    queryFn: () => creditService.getOrderPayments(orderId),
    enabled: !!orderId && enabled,
    staleTime: 2 * 60 * 1000,
  });
};

export const useMyPaymentsQuery = () => {
  return useQuery({
    queryKey: queryKeys.credit.myPayments,
    queryFn: () => creditService.getMyPayments(),
    staleTime: 2 * 60 * 1000,
  });
};

export const usePendingPaymentsQuery = () => {
  return useQuery({
    queryKey: queryKeys.credit.pendingPayments,
    queryFn: () => creditService.getPendingPayments(),
    staleTime: 60 * 1000,
  });
};

export const useAllPaymentsQuery = (filters?: {
  status?: 'all' | 'pending' | 'approved' | 'rejected';
  dateRange?: 'all' | 'today' | 'week' | 'month';
  amountRange?: 'all' | 'low' | 'medium' | 'high';
  searchTerm?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.credit.allPayments(filters),
    queryFn: () => creditService.getAllPayments(filters),
    staleTime: 60 * 1000,
    keepPreviousData: true as any,
  });
};

export const useAdminCreditDashboardQuery = () => {
  return useQuery({
    queryKey: queryKeys.credit.adminDashboard,
    queryFn: () => creditService.getAdminDashboard(),
    staleTime: 60 * 1000,
  });
};

export const useCreateCreditOrderMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => creditService.createCreditOrder(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.credit.orders(1, 10) as any });
    },
  });
};

export const useCreatePaymentMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => creditService.createPayment(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.credit.myPayments });
    },
  });
};

export const useApprovePaymentMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ paymentId, approvalData }: { paymentId: string; approvalData: any }) =>
      creditService.approvePayment(paymentId, approvalData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.credit.pendingPayments });
      qc.invalidateQueries({ queryKey: queryKeys.credit.allPayments({}) as any });
    },
  });
};

export const useAssignCreditMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, amount }: { userId: string; amount: number }) => creditService.assignCredit(userId, amount),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.credit.info });
      qc.invalidateQueries({ queryKey: queryKeys.credit.adminDashboard });
    },
  });
};


