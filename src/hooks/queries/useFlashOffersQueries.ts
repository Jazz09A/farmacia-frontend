import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { flashOfferService, FlashOfferFilters } from '../../services/FlashOfferService';
import { queryKeys } from './queryKeys';
import { FlashOfferWithProduct, FlashOfferResponse, CreateFlashOfferPayload, FlashOffer } from '../../types';

// Queries
export const useFlashOffersPublicQuery = () => {
  return useQuery<FlashOfferResponse>({
    queryKey: queryKeys.flashOffers.public,
    queryFn: () => flashOfferService.getFlashOffersPublic(),
    staleTime: 30 * 1000, // 30 seconds - flash offers change frequently
    refetchInterval: 60 * 1000, // Refetch every minute
    refetchOnWindowFocus: false, // Evitar refetch al cambiar de ventana
    refetchOnMount: false, // No refetch si los datos están fresh (dentro de staleTime)
  });
};

export const useActiveFlashOffersQuery = () => {
  return useQuery<FlashOfferWithProduct[]>({
    queryKey: queryKeys.flashOffers.active,
    queryFn: () => flashOfferService.getActiveFlashOffers(),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
    refetchOnWindowFocus: false, // Evitar refetch al cambiar de ventana
    refetchOnMount: false, // No refetch si los datos están fresh
    select: (data) => {
      // Filter only active offers
      return data.filter(offer => flashOfferService.isOfferActive(offer));
    },
  });
};

export const useAdminFlashOffersQuery = (filters?: FlashOfferFilters) => {
  return useQuery<FlashOfferResponse>({
    queryKey: queryKeys.flashOffers.admin(filters),
    queryFn: () => flashOfferService.getAllFlashOffers(filters),
    staleTime: 1 * 60 * 1000, // 1 minute
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false, // Evitar refetch al cambiar de ventana
  });
};

export const useFlashOfferQuery = (offerId: string | undefined) => {
  return useQuery<FlashOfferWithProduct>({
    queryKey: queryKeys.flashOffers.detail(offerId || ''),
    queryFn: () => flashOfferService.getFlashOfferById(offerId!),
    enabled: !!offerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false, // Evitar refetch al cambiar de ventana
  });
};

// Mutations
export const useCreateFlashOfferMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<FlashOffer, Error, CreateFlashOfferPayload>({
    mutationFn: (payload) => flashOfferService.createFlashOffer(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.flashOffers.all });
    },
  });
};

export const useUpdateFlashOfferMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<FlashOffer, Error, { id: string; payload: Partial<CreateFlashOfferPayload> }>({
    mutationFn: ({ id, payload }) => flashOfferService.updateFlashOffer(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.flashOffers.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.flashOffers.detail(variables.id) });
    },
  });
};

export const useDeleteFlashOfferMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => flashOfferService.deleteFlashOffer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.flashOffers.all });
    },
  });
};

export const useToggleFlashOfferStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<FlashOffer, Error, { id: string; is_active: boolean }>({
    mutationFn: ({ id, is_active }) => flashOfferService.toggleFlashOfferStatus(id, is_active),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.flashOffers.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.flashOffers.detail(variables.id) });
    },
  });
};

