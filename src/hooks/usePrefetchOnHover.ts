import { useCallback, useRef } from 'react';
import { authenticatedImageCache } from '../utils/authenticatedImageCache';

/**
 * Hook para precargar imágenes cuando el usuario hace hover
 * Mejora la percepción de velocidad al navegar entre productos
 * 
 * Uso:
 * const prefetch = usePrefetchOnHover();
 * <div onMouseEnter={() => prefetch(imageUrl)}>...</div>
 */
export const usePrefetchOnHover = () => {
  const prefetchedUrls = useRef(new Set<string>());

  const prefetch = useCallback((imageUrl: string | undefined) => {
    if (!imageUrl || prefetchedUrls.current.has(imageUrl)) return;
    
    // Solo prefetch para imágenes autenticadas
    if (imageUrl.includes('/api/v1/images/')) {
      prefetchedUrls.current.add(imageUrl);
      
      // Prefetch en background con baja prioridad usando requestIdleCallback
      const doPrefetch = () => {
        authenticatedImageCache.getImage(imageUrl, false).catch(() => {
          // Silenciar errores de prefetch - no son críticos
          // Si falla, la imagen se cargará cuando sea visible
        });
      };

      if ('requestIdleCallback' in window) {
        requestIdleCallback(doPrefetch, { timeout: 2000 });
      } else {
        setTimeout(doPrefetch, 100);
      }
    } else {
      // Para URLs públicas, usar prefetch nativo del navegador
      prefetchedUrls.current.add(imageUrl);
      
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.as = 'image';
      link.href = imageUrl;
      document.head.appendChild(link);
    }
  }, []);

  /**
   * Prefetch múltiples imágenes a la vez
   */
  const prefetchMultiple = useCallback((imageUrls: (string | undefined)[]) => {
    imageUrls.forEach(url => {
      if (url) prefetch(url);
    });
  }, [prefetch]);

  /**
   * Limpiar URLs prefetcheadas (útil al cambiar de página)
   */
  const clearPrefetched = useCallback(() => {
    prefetchedUrls.current.clear();
  }, []);

  return { prefetch, prefetchMultiple, clearPrefetched };
};

export default usePrefetchOnHover;

