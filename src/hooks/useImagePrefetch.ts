import { useEffect, useRef } from 'react';
import { preloadImage, getHighQualityUrl } from '../utils/imageOptimization';

interface PrefetchOptions {
  enabled?: boolean;
  priority?: 'high' | 'low';
  delay?: number;
}

/**
 * Hook para precargar imágenes de forma inteligente
 * Útil para precargar imágenes de productos visibles pronto
 */
export const useImagePrefetch = (
  imageUrls: string[],
  options: PrefetchOptions = {}
) => {
  const {
    enabled = true,
    priority = 'low',
    delay = 0
  } = options;

  const prefetchedRef = useRef(new Set<string>());

  useEffect(() => {
    if (!enabled || imageUrls.length === 0) return;

    const timeoutId = setTimeout(() => {
      imageUrls.forEach(url => {
        // No precargar si ya se precargó
        if (prefetchedRef.current.has(url)) return;

        // Usar requestIdleCallback para no bloquear el thread principal
        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => {
            const optimizedUrl = getHighQualityUrl(url, 600);
            preloadImage(optimizedUrl)
              .then(() => {
                prefetchedRef.current.add(url);
              })
              .catch(() => {
                // Silenciar errores de prefetch - no críticos
                // Si la imagen no se puede precargar, se cargará cuando sea visible
              });
          }, { timeout: priority === 'high' ? 1000 : 5000 });
        } else {
          // Fallback para navegadores sin requestIdleCallback
          setTimeout(() => {
            const optimizedUrl = getHighQualityUrl(url, 600);
            preloadImage(optimizedUrl)
              .then(() => {
                prefetchedRef.current.add(url);
              })
              .catch(() => {
                // Silenciar errores de prefetch - no críticos
              });
          }, 100);
        }
      });
    }, delay);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [imageUrls, enabled, priority, delay]);
};

/**
 * Hook para precargar la siguiente página de productos
 * Útil en el catálogo para mejorar UX al cambiar de página
 */
export const usePrefetchNextPage = (
  currentProducts: Array<{ image?: string; images?: string[] }>,
  enabled: boolean = true
) => {
  const imageUrls = currentProducts
    .map(product => {
      if (product.images && product.images.length >= 2) {
        return product.images[1];
      }
      return product.image || (product.images && product.images[0]);
    })
    .filter((url): url is string => !!url);

  useImagePrefetch(imageUrls, {
    enabled,
    priority: 'low',
    delay: 1000 // Esperar 1 segundo antes de empezar a precargar
  });
};

export default useImagePrefetch;

