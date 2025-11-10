// 🔥 Custom hooks for Flash Offers - UI hooks only
// Note: Data fetching hooks have been migrated to React Query (useFlashOffersQueries.ts)
// These hooks are for UI functionality only (countdown, visibility detection)

import { useState, useEffect, useCallback, useRef } from 'react';
import { flashOfferService } from '../services/FlashOfferService';

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

