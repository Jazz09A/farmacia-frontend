// 🔥 Custom hooks for Flash Offers
import { useState, useEffect, useCallback, useRef } from 'react';
import { flashOfferService, FlashOfferFilters } from '../services/FlashOfferService';
import { FlashOfferWithProduct, FlashOfferResponse, CreateFlashOfferPayload } from '../types';

// 🔥 Hook para obtener ofertas flash activas (público)
export const useFlashOffers = (refreshInterval?: number) => {
  const [offers, setOffers] = useState<FlashOfferWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasActiveOffers, setHasActiveOffers] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const fetchOffers = useCallback(async () => {
    try {
      setError(null);
      const data = await flashOfferService.getFlashOffersPublic();
      
      // Verificar que data y flash_offers existan antes de filtrar
      if (!data || !Array.isArray(data.flash_offers)) {
        console.warn('Invalid flash offers data structure:', data);
        setOffers([]);
        setHasActiveOffers(false);
        return;
      }
      
      // Filtrar solo ofertas realmente activas
      const activeOffers = data.flash_offers.filter((offer: FlashOfferWithProduct) => flashOfferService.isOfferActive(offer));
      
      setOffers(activeOffers);
      setHasActiveOffers(activeOffers.length > 0);
    } catch (err) {
      console.error('Error fetching flash offers:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setOffers([]);
      setHasActiveOffers(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar tiempo restante en ofertas activas
  const updateRemainingTimes = useCallback(() => {
    setOffers(currentOffers => 
      currentOffers.map(offer => ({
        ...offer,
        remaining_time: Math.max(0, new Date(offer.end_time).getTime() - Date.now())
      })).filter(offer => offer.remaining_time > 0) // Remover ofertas expiradas
    );
  }, []);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  // Intervalo para actualizar tiempo restante y refresh automático
  useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        updateRemainingTimes();
        
        // Cada 5 minutos, refetch para obtener nuevas ofertas
        if (Date.now() % (5 * 60 * 1000) < (refreshInterval || 1000)) {
          fetchOffers();
        }
      }, refreshInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refreshInterval, updateRemainingTimes, fetchOffers]);

  return {
    offers,
    loading,
    error,
    hasActiveOffers,
    refreshOffers: fetchOffers,
    updateTimes: updateRemainingTimes,
  };
};

// 🔥 Hook para gestión admin de ofertas flash
export const useAdminFlashOffers = (filters?: FlashOfferFilters) => {
  const [data, setData] = useState<FlashOfferResponse>({
    flash_offers: [],
    total_count: 0,
    active_count: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOffers = useCallback(async (newFilters?: FlashOfferFilters) => {
    try {
      setLoading(true);
      setError(null);
      const response = await flashOfferService.getAllFlashOffers(newFilters || filters);
      setData(response);
    } catch (err) {
      console.error('Error fetching admin flash offers:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createOffer = useCallback(async (payload: CreateFlashOfferPayload) => {
    try {
      setLoading(true);
      const newOffer = await flashOfferService.createFlashOffer(payload);
      await fetchOffers(); // Refresh list
      return newOffer;
    } catch (err) {
      console.error('Error creating flash offer:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchOffers]);

  const updateOffer = useCallback(async (id: string, payload: Partial<CreateFlashOfferPayload>) => {
    try {
      setLoading(true);
      const updatedOffer = await flashOfferService.updateFlashOffer(id, payload);
      await fetchOffers(); // Refresh list
      return updatedOffer;
    } catch (err) {
      console.error('Error updating flash offer:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchOffers]);

  const deleteOffer = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await flashOfferService.deleteFlashOffer(id);
      await fetchOffers(); // Refresh list
    } catch (err) {
      console.error('Error deleting flash offer:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchOffers]);

  const toggleOfferStatus = useCallback(async (id: string, isActive: boolean) => {
    try {
      const updatedOffer = await flashOfferService.toggleFlashOfferStatus(id, isActive);
      
      // Update local state immediately for better UX
      setData(current => ({
        ...current,
        flash_offers: current.flash_offers.map(offer => 
          offer.id === id ? { ...offer, is_active: isActive } : offer
        ),
        active_count: isActive ? current.active_count + 1 : current.active_count - 1,
      }));
      
      return updatedOffer;
    } catch (err) {
      console.error('Error toggling flash offer status:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  return {
    offers: data.flash_offers,
    totalCount: data.total_count,
    activeCount: data.active_count,
    loading,
    error,
    actions: {
      refresh: fetchOffers,
      create: createOffer,
      update: updateOffer,
      delete: deleteOffer,
      toggleStatus: toggleOfferStatus,
    },
  };
};

// 🔥 Hook para una oferta flash específica
export const useFlashOffer = (offerId?: string) => {
  const [offer, setOffer] = useState<FlashOfferWithProduct | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOffer = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await flashOfferService.getFlashOfferById(id);
      setOffer(data);
    } catch (err) {
      console.error('Error fetching flash offer:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setOffer(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (offerId) {
      fetchOffer(offerId);
    }
  }, [offerId, fetchOffer]);

  return {
    offer,
    loading,
    error,
    refetch: () => offerId ? fetchOffer(offerId) : Promise.resolve(),
  };
};

// 🔥 Hook para countdown timer de oferta específica
export const useFlashOfferCountdown = (endTime: string, onExpire?: () => void) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const updateCountdown = useCallback(() => {
    const now = Date.now();
    const end = new Date(endTime).getTime();
    const remaining = Math.max(0, end - now);

    setTimeLeft(remaining);
    
    if (remaining === 0 && !isExpired) {
      setIsExpired(true);
      onExpire?.();
    }
  }, [endTime, isExpired, onExpire]);

  useEffect(() => {
    updateCountdown(); // Initial calculation
    
    intervalRef.current = setInterval(updateCountdown, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [updateCountdown]);

  const formatTime = useCallback((ms: number) => {
    return flashOfferService.formatRemainingTime(ms);
  }, []);

  return {
    timeLeft,
    isExpired,
    formattedTime: formatTime(timeLeft),
    hours: Math.floor(timeLeft / (1000 * 60 * 60)),
    minutes: Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((timeLeft % (1000 * 60)) / 1000),
  };
};

// 🔥 Hook para detectar visibilidad y optimizar performance
export const useFlashOfferVisibility = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [threshold]);

  return { ref, isVisible };
};

