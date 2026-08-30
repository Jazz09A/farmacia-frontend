import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  useAdminFlashOffersQuery,
  useCreateFlashOfferMutation,
  useUpdateFlashOfferMutation,
  useDeleteFlashOfferMutation,
  useToggleFlashOfferStatusMutation,
} from '../../../hooks/queries/useFlashOffersQueries';
import { FlashOfferFilters, flashOfferService } from '../../../services/FlashOfferService';
import { FlashOfferWithProduct, CreateFlashOfferPayload } from '../../../types';
import { useQueryClient } from '@tanstack/react-query';
import {
  FlashOfferFormValues,
  defaultFormValues,
  mapFormValuesToPayload,
  mapOfferToFormValues,
} from './flashOfferFormUtils';

export function useAdminFlashOffersPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<FlashOfferFilters>({
    active_only: false,
    sort_by: 'created_at',
    sort_order: 'desc',
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<FlashOfferWithProduct | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showEditDiscountModal, setShowEditDiscountModal] = useState(false);
  const [discountData, setDiscountData] = useState<any>(null);
  const [updatingDiscount, setUpdatingDiscount] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const notificationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notificationHideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: flashOffersResponse, isLoading: loading, error, refetch } = useAdminFlashOffersQuery(filters);
  const createMutation = useCreateFlashOfferMutation();
  const updateMutation = useUpdateFlashOfferMutation();
  const deleteMutation = useDeleteFlashOfferMutation();
  const toggleStatusMutation = useToggleFlashOfferStatusMutation();

  const offers = flashOffersResponse?.flash_offers || [];
  const totalCount = flashOffersResponse?.total_count || 0;
  const activeCount = flashOffersResponse?.active_count || 0;

  const showNotification = (type: 'success' | 'error', message: string) => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    if (notificationHideTimeoutRef.current) {
      clearTimeout(notificationHideTimeoutRef.current);
    }

    setNotification({ type, message });

    if (typeof window !== 'undefined' && 'requestAnimationFrame' in window) {
      window.requestAnimationFrame(() => setNotificationVisible(true));
    } else {
      setNotificationVisible(true);
    }

    notificationTimeoutRef.current = setTimeout(() => {
      setNotificationVisible(false);
      notificationHideTimeoutRef.current = setTimeout(() => {
        setNotification(null);
      }, 250);
    }, 3500);
  };

  const actions = {
    refresh: async () => {
      setIsRefreshing(true);
      try {
        await refetch();
        showNotification('success', 'Ofertas actualizadas correctamente');
      } catch (error) {
        showNotification('error', 'Error al actualizar las ofertas');
      } finally {
        setIsRefreshing(false);
      }
    },
    create: async (payload: CreateFlashOfferPayload) => {
      try {
        await createMutation.mutateAsync(payload);
        await queryClient.invalidateQueries({ queryKey: ['flashOffers'] });
        await refetch();
        showNotification('success', 'Oferta flash creada correctamente');
        setShowCreateModal(false);
      } catch (error) {
        showNotification('error', 'Error al crear la oferta flash');
        throw error;
      }
    },
    update: async (id: string, payload: Partial<CreateFlashOfferPayload>) => {
      try {
        await updateMutation.mutateAsync({ id, payload });
        await queryClient.invalidateQueries({ queryKey: ['flashOffers'] });
        await refetch();
        showNotification('success', 'Oferta flash actualizada correctamente');
      } catch (error) {
        showNotification('error', 'Error al actualizar la oferta flash');
        throw error;
      }
    },
    delete: async (id: string) => {
      try {
        await deleteMutation.mutateAsync(id);
        await queryClient.invalidateQueries({ queryKey: ['flashOffers'] });
        await refetch();
        showNotification('success', 'Oferta flash eliminada correctamente');
      } catch (error) {
        showNotification('error', 'Error al eliminar la oferta flash');
        throw error;
      }
    },
    toggleStatus: async (id: string, is_active: boolean) => {
      try {
        await toggleStatusMutation.mutateAsync({ id, is_active });
        await queryClient.invalidateQueries({ queryKey: ['flashOffers'] });
        await refetch();
        showNotification('success', `Oferta ${is_active ? 'activada' : 'desactivada'} correctamente`);
      } catch (error) {
        showNotification('error', 'Error al cambiar el estado de la oferta');
        throw error;
      }
    },
  };

  const handleCloseNotification = () => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    if (notificationHideTimeoutRef.current) {
      clearTimeout(notificationHideTimeoutRef.current);
    }
    setNotificationVisible(false);
    notificationHideTimeoutRef.current = setTimeout(() => setNotification(null), 200);
  };

  useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current);
      if (notificationHideTimeoutRef.current) clearTimeout(notificationHideTimeoutRef.current);
    };
  }, []);

  const fetchArticleDiscountCached = useCallback(async (coDesc: string) => {
    const normalizedCode = coDesc?.trim();

    if (!coDesc) {
      throw new Error('Código de descuento inválido');
    }

    return queryClient.fetchQuery({
      queryKey: ['article-discount', normalizedCode],
      queryFn: () => flashOfferService.getArticleDiscount(normalizedCode),
      staleTime: 5 * 60 * 1000,
      gcTime: 15 * 60 * 1000,
    });
  }, [queryClient]);

  const handleViewArticleDiscount = async (coDesc: string) => {
    try {
      const data = await fetchArticleDiscountCached(coDesc);
      setDiscountData(data);
      setShowDiscountModal(true);
    } catch (error) {
      console.error('Error fetching article discount:', error);
      showNotification('error', 'No se pudo mostrar los detalles del descuento.');
    }
  };

  const handleOfferRowClick = (offer: FlashOfferWithProduct) => {
    const discountCode = offer.co_desc;

    if (!discountCode) {
      showNotification('error', 'No se encontró el código del descuento.');
      return;
    }
    setSelectedOffer(offer);
    handleViewArticleDiscount(discountCode);
  };

  const handleOfferRowKeyDown = (event: React.KeyboardEvent<HTMLTableRowElement>, offer: FlashOfferWithProduct) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleOfferRowClick(offer);
    }
  };

  const handleEditArticleDiscount = async (coDesc: string) => {
    try {
      const data = await fetchArticleDiscountCached(coDesc);
      setDiscountData(data);
      setShowEditDiscountModal(true);
    } catch (error) {
      console.error('Error fetching article discount for edit:', error);
      showNotification('error', 'No se pudo cargar la información para editar este descuento.');
    }
  };

  const handleSaveArticleDiscount = async (coDesc: string, payload: any) => {
    setUpdatingDiscount(true);
    try {
      await flashOfferService.updateArticleDiscount(coDesc, payload);
      const updatedData = await fetchArticleDiscountCached(coDesc);
      queryClient.setQueryData(['article-discount', coDesc.trim()], updatedData);
      setDiscountData(updatedData);
      setShowEditDiscountModal(false);
      showNotification('success', 'Descuento actualizado correctamente.');
    } catch (error) {
      console.error('Error updating article discount:', error);
      showNotification('error', 'No se pudo guardar el descuento. Intenta nuevamente.');
      throw error;
    } finally {
      setUpdatingDiscount(false);
    }
  };

  const handleDeleteOffer = async (offerId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta oferta flash?')) {
      try {
        await actions.delete(offerId);
      } catch (error) {
        console.error('Error deleting offer:', error);
      }
    }
  };

  const editInitialValues = useMemo(() => {
    return selectedOffer ? mapOfferToFormValues(selectedOffer) : defaultFormValues;
  }, [selectedOffer]);

  const handleCreateSubmit = async (values: FlashOfferFormValues) => {
    try {
      const payload = mapFormValuesToPayload(values);
      await actions.create(payload);
    } catch (error) {
      console.error('Error creating flash offer:', error);
    }
  };

  const handleEditSubmit = async (values: FlashOfferFormValues) => {
    if (!selectedOffer?.id) return;
    const payload = mapFormValuesToPayload(values);
    await actions.update(selectedOffer.id, payload);
  };

  const openEditModal = async (offer: FlashOfferWithProduct) => {
    try {
      const discountCode = offer.co_desc;
      let updatedOffer = { ...offer };

      if (discountCode) {
        try {
          const erpData = await flashOfferService.getArticleDiscount(discountCode);

          if (erpData && erpData.success) {
            updatedOffer = {
              ...updatedOffer,
              discount_value: erpData.porc1 ? parseFloat(erpData.porc1) : updatedOffer.discount_value,
              discount_type: erpData.porc1 ? 'percentage' : updatedOffer.discount_type,
              start_time: erpData.fecha_ini || updatedOffer.start_time,
              end_time: erpData.fecha_fin || updatedOffer.end_time,
              max_quantity: erpData.campo1 ? parseInt(erpData.campo1) : updatedOffer.max_quantity,
            };
          }
        } catch (e) {
          console.warn('No se pudo obtener info del ERP al editar, usando datos locales', e);
        }
      }

      setSelectedOffer(updatedOffer);
      setShowEditModal(true);
    } catch (error) {
      console.error('Error al preparar edición:', error);
      setSelectedOffer(offer);
      setShowEditModal(true);
    }
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedOffer(null);
  };

  return {
    filters,
    setFilters,
    showCreateModal,
    setShowCreateModal,
    selectedOffer,
    showEditModal,
    showDiscountModal,
    setShowDiscountModal,
    showEditDiscountModal,
    setShowEditDiscountModal,
    discountData,
    updatingDiscount,
    isRefreshing,
    notification,
    notificationVisible,
    loading,
    error,
    offers,
    totalCount,
    activeCount,
    createMutation,
    updateMutation,
    actions,
    handleCloseNotification,
    handleOfferRowClick,
    handleOfferRowKeyDown,
    handleEditArticleDiscount,
    handleSaveArticleDiscount,
    handleDeleteOffer,
    editInitialValues,
    handleCreateSubmit,
    handleEditSubmit,
    openEditModal,
    closeCreateModal,
    closeEditModal,
    fetchProfitData: flashOfferService.getArticleDiscount.bind(flashOfferService),
  };
}
