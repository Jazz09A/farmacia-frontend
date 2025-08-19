// 🚀 Hook optimizado para manejo del carrito con caché inteligente
import { useCallback, useEffect, useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import cartCache from '../utils/cartCache';

interface OptimizedCartHook {
  cart: any;
  loading: boolean;
  itemCount: number;
  isEmpty: boolean;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  isInCart: (productId: string) => boolean;
  getItemQuantity: (productId: string) => number;
}

export const useOptimizedCart = (): OptimizedCartHook => {
  const { cart, loading, addToCart, removeFromCart, updateQuantity, clearCart, refreshCart } = useCart();
  const { user } = useAuth();
  const [optimisticUpdates, setOptimisticUpdates] = useState<Record<string, number>>({});

  // 🧹 Limpiar actualizaciones optimistas cuando cambie el carrito real
  useEffect(() => {
    if (cart) {
      setOptimisticUpdates({});
    }
  }, [cart?.items]);

  // 📊 Cálculos derivados
  const itemCount = cart?.total_unique_items || 0;
  const isEmpty = itemCount === 0;

  // 🔍 Verificar si un producto está en el carrito
  const isInCart = useCallback((productId: string): boolean => {
    if (!cart?.items) return false;
    return cart.items.some(item => item.product_id === productId);
  }, [cart?.items]);

  // 📦 Obtener cantidad de un producto específico
  const getItemQuantity = useCallback((productId: string): number => {
    if (!cart?.items) return 0;
    
    // Verificar actualizaciones optimistas primero
    if (optimisticUpdates[productId] !== undefined) {
      return optimisticUpdates[productId];
    }
    
    const item = cart.items.find(item => item.product_id === productId);
    return item?.quantity || 0;
  }, [cart?.items, optimisticUpdates]);

  // ➕ Agregar al carrito con feedback optimista mejorado
  const optimizedAddToCart = useCallback(async (productId: string, quantity: number) => {
    if (!user?.id) {
      throw new Error('Usuario no autenticado');
    }

    // 🔄 Actualización optimista del contador local
    setOptimisticUpdates(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + quantity
    }));

    try {
      await addToCart(productId, quantity);
      
      // 💾 Actualizar caché después del éxito
      if (cart) {
        cartCache.setCart(user.id, cart);
      }
      
    } catch (error) {
      // ↩️ Revertir actualización optimista en caso de error
      setOptimisticUpdates(prev => {
        const updated = { ...prev };
        delete updated[productId];
        return updated;
      });
      
      throw error;
    }
  }, [user?.id, addToCart, cart]);

  // ❌ Remover del carrito con actualización optimista
  const optimizedRemoveFromCart = useCallback(async (itemId: string) => {
    if (!user?.id) {
      throw new Error('Usuario no autenticado');
    }

    // Encontrar el producto para la actualización optimista
    const item = cart?.items?.find(item => item.id === itemId);
    if (item) {
      setOptimisticUpdates(prev => ({
        ...prev,
        [item.product_id]: 0
      }));
    }

    try {
      await removeFromCart(itemId);
      
      if (cart) {
        cartCache.setCart(user.id, cart);
      }
      
    } catch (error) {
      // Revertir actualización optimista
      if (item) {
        setOptimisticUpdates(prev => {
          const updated = { ...prev };
          delete updated[item.product_id];
          return updated;
        });
      }
      
      throw error;
    }
  }, [user?.id, removeFromCart, cart]);

  // ✏️ Actualizar cantidad con optimismo
  const optimizedUpdateQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (!user?.id) {
      throw new Error('Usuario no autenticado');
    }

    // Encontrar el producto para la actualización optimista
    const item = cart?.items?.find(item => item.id === itemId);
    if (item) {
      setOptimisticUpdates(prev => ({
        ...prev,
        [item.product_id]: quantity
      }));
    }

    try {
      await updateQuantity(itemId, quantity);
      
      if (cart) {
        cartCache.setCart(user.id, cart);
      }
      
    } catch (error) {
      // Revertir actualización optimista
      if (item) {
        setOptimisticUpdates(prev => {
          const updated = { ...prev };
          delete updated[item.product_id];
          return updated;
        });
      }
      
      throw error;
    }
  }, [user?.id, updateQuantity, cart]);

  // 🧹 Limpiar carrito
  const optimizedClearCart = useCallback(async () => {
    if (!user?.id) return;

    setOptimisticUpdates({});
    
    try {
      await clearCart();
      cartCache.clearUserCart(user.id);
    } catch (error) {
      throw error;
    }
  }, [user?.id, clearCart]);

  // 🔄 Refrescar carrito
  const optimizedRefreshCart = useCallback(async () => {
    setOptimisticUpdates({});
    await refreshCart();
  }, [refreshCart]);

  return {
    cart,
    loading,
    itemCount,
    isEmpty,
    addToCart: optimizedAddToCart,
    removeFromCart: optimizedRemoveFromCart,
    updateQuantity: optimizedUpdateQuantity,
    clearCart: optimizedClearCart,
    refreshCart: optimizedRefreshCart,
    isInCart,
    getItemQuantity
  };
};

export default useOptimizedCart;
