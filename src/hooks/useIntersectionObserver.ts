import { useEffect, useRef, useState, RefObject } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  freezeOnceVisible?: boolean;
}

interface UseIntersectionObserverReturn {
  ref: RefObject<HTMLDivElement>;
  isIntersecting: boolean;
  entry: IntersectionObserverEntry | null;
}

/**
 * Hook para observar cuando un elemento es visible en el viewport
 * Útil para lazy loading, animaciones al scroll, etc.
 */
export const useIntersectionObserver = (
  options: UseIntersectionObserverOptions = {}
): UseIntersectionObserverReturn => {
  const {
    threshold = 0,
    root = null,
    rootMargin = '0px',
    freezeOnceVisible = false
  } = options;

  const ref = useRef<HTMLDivElement>(null);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const frozen = useRef(false);

  useEffect(() => {
    const element = ref.current;
    const hasIOSupport = !!window.IntersectionObserver;

    if (!hasIOSupport || !element) {
      return;
    }

    // Si está congelado y ya fue visible, no hacer nada
    if (frozen.current) {
      return;
    }

    const observerCallback: IntersectionObserverCallback = ([entry]) => {
      setEntry(entry);
      setIsIntersecting(entry.isIntersecting);

      // Congelar cuando se vuelve visible si está habilitado
      if (entry.isIntersecting && freezeOnceVisible) {
        frozen.current = true;
      }
    };

    const observerOptions: IntersectionObserverInit = {
      threshold,
      root,
      rootMargin
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, root, rootMargin, freezeOnceVisible]);

  return { ref, isIntersecting, entry };
};

export default useIntersectionObserver;

