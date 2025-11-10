import { useQuery } from '@tanstack/react-query';
import { invoiceService } from '../../services/InvoiceService';
import { queryKeys } from './queryKeys';

export const useInvoiceSummaryQuery = () => {
  return useQuery({
    queryKey: queryKeys.invoices.summary,
    queryFn: () => invoiceService.getSummary(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useInvoicesQuery = (status: 'pending' | 'paid' | 'all' = 'all') => {
  return useQuery({
    queryKey: queryKeys.invoices.list(status),
    queryFn: () => invoiceService.getAllInvoices(status === 'all' ? undefined : status),
    staleTime: 2 * 60 * 1000,
    keepPreviousData: true as any,
  });
};

export const usePendingInvoicesQuery = () => {
  return useQuery({
    queryKey: queryKeys.invoices.pending,
    queryFn: () => invoiceService.getPendingInvoices(),
    staleTime: 2 * 60 * 1000,
  });
};

export const usePaidInvoicesQuery = () => {
  return useQuery({
    queryKey: queryKeys.invoices.paid,
    queryFn: () => invoiceService.getPaidInvoices(),
    staleTime: 2 * 60 * 1000,
  });
};

export const useInvoiceDetailsQuery = (invoiceNumber: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.invoices.details(invoiceNumber),
    queryFn: () => invoiceService.getInvoiceDetails(invoiceNumber),
    enabled: !!invoiceNumber && enabled,
    staleTime: 5 * 60 * 1000,
  });
};

export const useInvoicePaymentHistoryQuery = () => {
  return useQuery({
    queryKey: queryKeys.invoices.payments,
    queryFn: () => invoiceService.getPaymentHistory(),
    staleTime: 5 * 60 * 1000,
  });
};


