import { useState, useEffect, useCallback } from 'react';
import { homePageCache, catalogCache, productCache } from '../utils/pageCache';

type CacheType = 'home' | 'catalog' | 'product';

interface UsePageCacheOptions {
  cacheType: CacheType;
  key: string;
  params?: Record<string, any>;
  ttl?: number;
}

interface UsePageCacheReturn<T> {
  cachedData: T | null;
  setCachedData: (data: T, customTtl?: number) => void;
  clearCache: () => void;
  isCached: boolean;
  refetch: () => void;
}

/**
 * Hook para usar el sistema de caché de páginas
 */
export const usePageCache = <T = any>(
  options: UsePageCacheOptions
): UsePageCacheReturn<T> => {
  const { cacheType, key, params, ttl } = options;
  
  // Seleccionar el caché apropiado
  const cache = 
    cacheType === 'home' ? homePageCache :
    cacheType === 'catalog' ? catalogCache :
    productCache;

  const [cachedData, setCachedDataState] = useState<T | null>(() => {
    return cache.get<T>(key, params);
  });

  const [refetchTrigger, setRefetchTrigger] = useState(0);

  // Verificar si hay datos en caché
  const isCached = cache.has(key, params);

  // Obtener datos del caché
  useEffect(() => {
    const data = cache.get<T>(key, params);
    setCachedDataState(data);
  }, [key, JSON.stringify(params), refetchTrigger]);

  // Guardar datos en caché
  const setCachedData = useCallback((data: T, customTtl?: number) => {
    cache.set(key, data, params, customTtl || ttl);
    setCachedDataState(data);
  }, [cache, key, JSON.stringify(params), ttl]);

  // Limpiar caché específico
  const clearCache = useCallback(() => {
    cache.delete(key, params);
    setCachedDataState(null);
  }, [cache, key, JSON.stringify(params)]);

  // Refetch (actualizar desde caché)
  const refetch = useCallback(() => {
    setRefetchTrigger(prev => prev + 1);
  }, []);

  return {
    cachedData,
    setCachedData,
    clearCache,
    isCached,
    refetch
  };
};

/**
 * Hook específico para caché del home
 */
export const useHomeCache = <T = any>(key: string, params?: Record<string, any>) => {
  return usePageCache<T>({
    cacheType: 'home',
    key,
    params,
    ttl: 5 * 60 * 1000 // 5 minutos
  });
};

/**
 * Hook específico para caché del catálogo
 */
export const useCatalogCache = <T = any>(key: string, params?: Record<string, any>) => {
  return usePageCache<T>({
    cacheType: 'catalog',
    key,
    params,
    ttl: 3 * 60 * 1000 // 3 minutos
  });
};

/**
 * Hook específico para caché de productos
 */
export const useProductCache = <T = any>(key: string, params?: Record<string, any>) => {
  return usePageCache<T>({
    cacheType: 'product',
    key,
    params,
    ttl: 10 * 60 * 1000 // 10 minutos
  });
};

export default usePageCache;

