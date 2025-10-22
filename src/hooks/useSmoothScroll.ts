import { useCallback, useEffect, useRef } from 'react';

interface SmoothScrollOptions {
  duration?: number;
  easing?: (t: number) => number;
  offset?: number;
}

/**
 * Funciones de easing predefinidas
 */
export const easingFunctions = {
  linear: (t: number) => t,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => --t * t * t + 1,
  easeInOutCubic: (t: number) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1),
  easeInQuart: (t: number) => t * t * t * t,
  easeOutQuart: (t: number) => 1 - --t * t * t * t,
  easeInOutQuart: (t: number) => (t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t)
};

/**
 * Hook para scroll suave con control fino
 */
export const useSmoothScroll = () => {
  const rafRef = useRef<number | null>(null);
  const isScrollingRef = useRef(false);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  /**
   * Scroll suave a una posición específica
   */
  const smoothScrollTo = useCallback((
    targetPosition: number,
    options: SmoothScrollOptions = {}
  ) => {
    const {
      duration = 600,
      easing = easingFunctions.easeInOutCubic,
      offset = 0
    } = options;

    // Cancelar scroll anterior si existe
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    const startPosition = window.pageYOffset;
    const distance = targetPosition + offset - startPosition;
    const startTime = performance.now();

    isScrollingRef.current = true;

    const scroll = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easing(progress);
      
      window.scrollTo(0, startPosition + distance * easedProgress);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(scroll);
      } else {
        isScrollingRef.current = false;
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(scroll);
  }, []);

  /**
   * Scroll suave a un elemento
   */
  const smoothScrollToElement = useCallback((
    elementOrId: string | HTMLElement,
    options: SmoothScrollOptions = {}
  ) => {
    const element = typeof elementOrId === 'string'
      ? document.getElementById(elementOrId)
      : elementOrId;

    if (!element) {
      console.warn(`Element not found: ${elementOrId}`);
      return;
    }

    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    smoothScrollTo(elementPosition, options);
  }, [smoothScrollTo]);

  /**
   * Scroll suave al inicio
   */
  const smoothScrollToTop = useCallback((options: SmoothScrollOptions = {}) => {
    smoothScrollTo(0, options);
  }, [smoothScrollTo]);

  /**
   * Cancelar scroll en progreso
   */
  const cancelScroll = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      isScrollingRef.current = false;
    }
  }, []);

  return {
    smoothScrollTo,
    smoothScrollToElement,
    smoothScrollToTop,
    cancelScroll,
    isScrolling: isScrollingRef.current
  };
};

export default useSmoothScroll;

