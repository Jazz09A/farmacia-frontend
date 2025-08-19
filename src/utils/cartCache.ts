// 🚀 Sistema de caché optimizado para carritos por usuario
import { Cart } from '../types';

interface CachedCart {
  data: Cart;
  timestamp: number;
  userId: string;
  version: number;
}

class CartCacheManager {
  private static instance: CartCacheManager;
  private cache = new Map<string, CachedCart>();
  private readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutos
  private readonly STORAGE_KEY = 'cart_cache_v2';

  private constructor() {
    this.loadFromStorage();
    this.setupCleanupInterval();
  }

  public static getInstance(): CartCacheManager {
    if (!CartCacheManager.instance) {
      CartCacheManager.instance = new CartCacheManager();
    }
    return CartCacheManager.instance;
  }

  // 🔒 Obtener carrito del caché si es válido
  getCart(userId: string): Cart | null {
    const cached = this.cache.get(userId);
    
    if (!cached) {
      return null;
    }

    // Verificar si el caché expiró
    if (Date.now() - cached.timestamp > this.CACHE_TTL) {
      this.cache.delete(userId);
      this.saveToStorage();
      return null;
    }

    return cached.data;
  }

  // 🚀 Guardar carrito en caché
  setCart(userId: string, cart: Cart): void {
    const cached: CachedCart = {
      data: cart,
      timestamp: Date.now(),
      userId,
      version: Date.now() // Version para detectar cambios
    };

    this.cache.set(userId, cached);
    this.saveToStorage();
  }

  // 🗑️ Limpiar caché de un usuario específico
  clearUserCart(userId: string): void {
    this.cache.delete(userId);
    this.saveToStorage();
  }

  // 🧹 Limpiar todo el caché
  clearAll(): void {
    this.cache.clear();
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // 💾 Persistir en localStorage (solo datos no sensibles)
  private saveToStorage(): void {
    try {
      const cacheArray = Array.from(this.cache.entries()).map(([userId, cached]) => ({
        userId,
        timestamp: cached.timestamp,
        version: cached.version,
        itemCount: cached.data.total_unique_items || 0,
        totalVes: cached.data.total_ves || 0
      }));

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cacheArray));
    } catch (error) {
      console.warn('Failed to save cart cache to storage:', error);
    }
  }

  // 📚 Cargar metadatos desde localStorage
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return;

      const cacheArray = JSON.parse(stored);
      // Solo cargamos metadatos, no datos sensibles del carrito
      // Los datos reales se cargarán desde la API cuando sea necesario
    } catch (error) {
      console.warn('Failed to load cart cache from storage:', error);
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  // ⏰ Limpieza automática de caché expirado
  private setupCleanupInterval(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [userId, cached] of this.cache.entries()) {
        if (now - cached.timestamp > this.CACHE_TTL) {
          this.cache.delete(userId);
        }
      }
      this.saveToStorage();
    }, 5 * 60 * 1000); // Limpiar cada 5 minutos
  }

  // 🔍 Verificar si necesita actualización
  shouldRefresh(userId: string): boolean {
    const cached = this.cache.get(userId);
    if (!cached) return true;

    const age = Date.now() - cached.timestamp;
    return age > (this.CACHE_TTL / 2); // Refrescar si tiene más de 5 minutos
  }

  // 📊 Obtener estadísticas del caché
  getStats() {
    return {
      size: this.cache.size,
      users: Array.from(this.cache.keys()),
      oldestEntry: Math.min(...Array.from(this.cache.values()).map(c => c.timestamp))
    };
  }
}

export const cartCache = CartCacheManager.getInstance();
export default cartCache;
