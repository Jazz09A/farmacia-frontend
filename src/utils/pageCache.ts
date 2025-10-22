/**
 * Sistema de caché temporal para páginas
 * Cache en memoria con expiración y límites
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheOptions {
  ttl?: number; // Time to live en milisegundos
  maxSize?: number; // Máximo número de entradas
}

class PageCache {
  private cache: Map<string, CacheEntry<any>>;
  private defaultTTL: number;
  private maxSize: number;
  private accessOrder: string[]; // Para implementar LRU (Least Recently Used)

  constructor(options: CacheOptions = {}) {
    this.cache = new Map();
    this.defaultTTL = options.ttl || 5 * 60 * 1000; // 5 minutos por defecto
    this.maxSize = options.maxSize || 50; // 50 entradas máximo
    this.accessOrder = [];
  }

  /**
   * Generar clave de caché
   */
  private generateKey(prefix: string, params?: Record<string, any>): string {
    if (!params) return prefix;
    
    // Ordenar parámetros para consistencia
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        acc[key] = params[key];
        return acc;
      }, {} as Record<string, any>);

    return `${prefix}:${JSON.stringify(sortedParams)}`;
  }

  /**
   * Obtener datos del caché
   */
  get<T>(key: string, params?: Record<string, any>): T | null {
    const cacheKey = this.generateKey(key, params);
    const entry = this.cache.get(cacheKey);

    if (!entry) {
      return null;
    }

    // Verificar si ha expirado
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(cacheKey);
      this.removeFromAccessOrder(cacheKey);
      return null;
    }

    // Actualizar orden de acceso (LRU)
    this.updateAccessOrder(cacheKey);

    return entry.data as T;
  }

  /**
   * Guardar datos en caché
   */
  set<T>(key: string, data: T, params?: Record<string, any>, ttl?: number): void {
    const cacheKey = this.generateKey(key, params);
    const now = Date.now();
    const expirationTime = ttl || this.defaultTTL;

    // Implementar límite de tamaño con LRU
    if (this.cache.size >= this.maxSize && !this.cache.has(cacheKey)) {
      this.evictLRU();
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt: now + expirationTime
    };

    this.cache.set(cacheKey, entry);
    this.updateAccessOrder(cacheKey);
  }

  /**
   * Verificar si existe y es válido
   */
  has(key: string, params?: Record<string, any>): boolean {
    return this.get(key, params) !== null;
  }

  /**
   * Eliminar entrada específica
   */
  delete(key: string, params?: Record<string, any>): void {
    const cacheKey = this.generateKey(key, params);
    this.cache.delete(cacheKey);
    this.removeFromAccessOrder(cacheKey);
  }

  /**
   * Limpiar todo el caché
   */
  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
  }

  /**
   * Limpiar entradas expiradas
   */
  cleanExpired(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      if (now > entry.expiresAt) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => {
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
    });
  }

  /**
   * Obtener estadísticas del caché
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys()),
      oldestEntry: this.getOldestEntry(),
      newestEntry: this.getNewestEntry()
    };
  }

  /**
   * Actualizar orden de acceso (LRU)
   */
  private updateAccessOrder(key: string): void {
    this.removeFromAccessOrder(key);
    this.accessOrder.push(key);
  }

  /**
   * Remover de orden de acceso
   */
  private removeFromAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  }

  /**
   * Eliminar entrada menos usada recientemente (LRU)
   */
  private evictLRU(): void {
    if (this.accessOrder.length === 0) return;

    const oldestKey = this.accessOrder[0];
    this.cache.delete(oldestKey);
    this.accessOrder.shift();
  }

  /**
   * Obtener entrada más antigua
   */
  private getOldestEntry(): { key: string; timestamp: number } | null {
    let oldest: { key: string; timestamp: number } | null = null;

    this.cache.forEach((entry, key) => {
      if (!oldest || entry.timestamp < oldest.timestamp) {
        oldest = { key, timestamp: entry.timestamp };
      }
    });

    return oldest;
  }

  /**
   * Obtener entrada más nueva
   */
  private getNewestEntry(): { key: string; timestamp: number } | null {
    let newest: { key: string; timestamp: number } | null = null;

    this.cache.forEach((entry, key) => {
      if (!newest || entry.timestamp > newest.timestamp) {
        newest = { key, timestamp: entry.timestamp };
      }
    });

    return newest;
  }

  /**
   * Invalidar caché que coincida con un patrón
   */
  invalidatePattern(pattern: string): void {
    const keysToDelete: string[] = [];

    this.cache.forEach((_, key) => {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.delete(key));
  }
}

// Instancias de caché para diferentes secciones
export const homePageCache = new PageCache({
  ttl: 5 * 60 * 1000, // 5 minutos
  maxSize: 20
});

export const catalogCache = new PageCache({
  ttl: 3 * 60 * 1000, // 3 minutos
  maxSize: 100 // Más entradas para diferentes combinaciones de filtros
});

export const productCache = new PageCache({
  ttl: 10 * 60 * 1000, // 10 minutos
  maxSize: 200
});

// Limpiar cachés expirados cada minuto
setInterval(() => {
  homePageCache.cleanExpired();
  catalogCache.cleanExpired();
  productCache.cleanExpired();
}, 60 * 1000);

export default PageCache;

