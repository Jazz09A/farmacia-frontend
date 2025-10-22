import { useCallback, useRef, useEffect } from 'react';

interface ScrollOptions {
  smooth?: boolean;
  offset?: number;
  duration?: number;
}

interface UseOptimizedScrollReturn {
  scrollToTop: (options?: ScrollOptions) => void;
  scrollToElement: (elementId: string, options?: ScrollOptions) => void;
  scrollToPosition: (position: number, options?: ScrollOptions) => void;
  isScrolling: boolean;
}

/**
 * Hook optimizado para scroll con mejor performance
 * Usa requestAnimationFrame y throttling para evitar repaints excesivos
 */
export const useOptimizedScroll = (): UseOptimizedScrollReturn => {
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const rafRef = useRef<number | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  /**
   * Scroll suave personalizado con easing
   */
  const smoothScrollTo = useCallback((target: number, duration: number = 600) => {
    const start = window.pageYOffset;
    const distance = target - start;
    const startTime = performance.now();

    // Función de easing (ease-in-out)
    const easeInOutCubic = (t: number): number => {
      return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    const scroll = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easing = easeInOutCubic(progress);
      
      window.scrollTo(0, start + distance * easing);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(scroll);
      } else {
        isScrollingRef.current = false;
        rafRef.current = null;
      }
    };

    isScrollingRef.current = true;
    rafRef.current = requestAnimationFrame(scroll);
  }, []);

  /**
   * Scroll a la posición especificada
   */
  const scrollToPosition = useCallback((position: number, options: ScrollOptions = {}) => {
    const { smooth = true, offset = 0, duration = 600 } = options;
    const targetPosition = Math.max(0, position + offset);

    // Cancelar scroll anterior si existe
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    // Si ya estamos cerca de la posición, no hacer nada
    if (Math.abs(window.pageYOffset - targetPosition) < 5) {
      return;
    }

    if (smooth) {
      smoothScrollTo(targetPosition, duration);
    } else {
      // Scroll instantáneo optimizado
      requestAnimationFrame(() => {
        window.scrollTo({
          top: targetPosition,
          left: 0,
          behavior: 'auto'
        });
      });
    }
  }, [smoothScrollTo]);

  /**
   * Scroll al inicio de la página
   */
  const scrollToTop = useCallback((options: ScrollOptions = {}) => {
    scrollToPosition(0, options);
  }, [scrollToPosition]);

  /**
   * Scroll a un elemento específico
   */
  const scrollToElement = useCallback((elementId: string, options: ScrollOptions = {}) => {
    const { smooth = true, offset = -80, duration = 600 } = options; // Offset negativo para navbar

    requestAnimationFrame(() => {
      const element = document.getElementById(elementId);
      
      if (element) {
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        scrollToPosition(elementPosition, { smooth, offset, duration });
      }
    });
  }, [scrollToPosition]);

  return {
    scrollToTop,
    scrollToElement,
    scrollToPosition,
    isScrolling: isScrollingRef.current
  };
};

export default useOptimizedScroll;

