/**
 * Servicio de caché para imágenes autenticadas
 * Evita múltiples fetches de la misma imagen y gestiona una cola de requests
 */

import { AUTH_STORAGE_KEYS, resolveApiUrl } from '../services/api/apiClient';

interface CacheEntry {
  blobUrl: string;
  timestamp: number;
  refCount: number; // Contador de referencias para evitar revocar URLs en uso
}

interface PendingRequest {
  url: string;
  resolve: (blobUrl: string) => void;
  reject: (error: Error) => void;
}

class AuthenticatedImageCache {
  private cache: Map<string, CacheEntry>;
  private pendingRequests: Map<string, PendingRequest[]>;
  private maxCacheSize: number;
  private maxAge: number; // 1 hora
  private maxConcurrentRequests: number;
  private activeRequests: number;
  private requestQueue: Array<() => void>;

  constructor(
    maxCacheSize: number = 100,
    maxAge: number = 60 * 60 * 1000, // 1 hora
    maxConcurrentRequests: number = 6
  ) {
    this.cache = new Map();
    this.pendingRequests = new Map();
    this.maxCacheSize = maxCacheSize;
    this.maxAge = maxAge;
    this.maxConcurrentRequests = maxConcurrentRequests;
    this.activeRequests = 0;
    this.requestQueue = [];

    // Limpiar caché expirado cada 5 minutos
    if (typeof window !== 'undefined') {
      setInterval(() => this.cleanExpired(), 5 * 60 * 1000);
    }
  }

  /**
   * Obtener imagen del caché o cargarla si no existe
   */
  async getImage(src: string, priority: boolean = false): Promise<string> {
    // Si no es una imagen autenticada, devolver directamente
    if (!src.includes('/api/v1/images/')) {
      return src;
    }

    const imageUrl = resolveApiUrl(src);

    // Verificar caché
    const cached = this.cache.get(imageUrl);
    if (cached && Date.now() - cached.timestamp < this.maxAge) {
      cached.refCount++;
      return cached.blobUrl;
    }

    // Si hay una petición pendiente para esta URL, esperar a que termine
    const pending = this.pendingRequests.get(imageUrl);
    if (pending) {
      return new Promise((resolve, reject) => {
        pending.push({ url: imageUrl, resolve, reject });
      });
    }

    // Crear nueva petición
    return new Promise((resolve, reject) => {
      const request: PendingRequest = { url: imageUrl, resolve, reject };
      this.pendingRequests.set(imageUrl, [request]);

      const loadImage = async () => {
        try {
          this.activeRequests++;

          const token = localStorage.getItem(AUTH_STORAGE_KEYS.token);
          if (!token) {
            throw new Error('No hay token de autenticación');
          }

          const response = await fetch(imageUrl, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (!response.ok) {
            throw new Error(`Error al cargar imagen: ${response.status}`);
          }

          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);

          // Guardar en caché
          this.setCache(imageUrl, blobUrl);

          // Resolver todas las peticiones pendientes
          const pendingReqs = this.pendingRequests.get(imageUrl) || [];
          pendingReqs.forEach(req => req.resolve(blobUrl));
          this.pendingRequests.delete(imageUrl);

        } catch (error) {
          // Rechazar todas las peticiones pendientes
          const pendingReqs = this.pendingRequests.get(imageUrl) || [];
          pendingReqs.forEach(req => req.reject(error as Error));
          this.pendingRequests.delete(imageUrl);
        } finally {
          this.activeRequests--;
          this.processQueue();
        }
      };

      if (priority || this.activeRequests < this.maxConcurrentRequests) {
        loadImage();
      } else {
        this.requestQueue.push(loadImage);
      }
    });
  }

  /**
   * Procesar la cola de requests
   */
  private processQueue(): void {
    while (
      this.requestQueue.length > 0 &&
      this.activeRequests < this.maxConcurrentRequests
    ) {
      const nextRequest = this.requestQueue.shift();
      if (nextRequest) {
        nextRequest();
      }
    }
  }

  /**
   * Guardar en caché
   */
  private setCache(url: string, blobUrl: string): void {
    // Limpiar caché si está lleno
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        const entry = this.cache.get(firstKey);
        if (entry && entry.refCount === 0) {
          URL.revokeObjectURL(entry.blobUrl);
          this.cache.delete(firstKey);
        }
      }
    }

    this.cache.set(url, {
      blobUrl,
      timestamp: Date.now(),
      refCount: 1
    });
  }

  /**
   * Liberar referencia a una imagen
   */
  releaseImage(src: string): void {
    if (!src.includes('/api/v1/images/')) {
      return;
    }

    const imageUrl = resolveApiUrl(src);

    const cached = this.cache.get(imageUrl);
    if (cached) {
      cached.refCount--;
      // Si no hay referencias y ha pasado mucho tiempo, revocar la URL
      if (cached.refCount === 0 && Date.now() - cached.timestamp > this.maxAge / 2) {
        URL.revokeObjectURL(cached.blobUrl);
        this.cache.delete(imageUrl);
      }
    }
  }

  /**
   * Limpiar entradas expiradas del caché
   */
  private cleanExpired(): void {
    const now = Date.now();
    for (const [url, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.maxAge && entry.refCount === 0) {
        URL.revokeObjectURL(entry.blobUrl);
        this.cache.delete(url);
      }
    }
  }

  /**
   * Limpiar todo el caché
   */
  clear(): void {
    for (const entry of this.cache.values()) {
      URL.revokeObjectURL(entry.blobUrl);
    }
    this.cache.clear();
    this.pendingRequests.clear();
    this.requestQueue = [];
  }
}

// Instancia singleton
export const authenticatedImageCache = new AuthenticatedImageCache();
