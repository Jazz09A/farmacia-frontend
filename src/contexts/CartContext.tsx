import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback, useRef } from 'react';
import { authService } from '../services/AuthService';
import { Cart } from '../types';
import { useAuth } from './AuthContext';
import cartCache from '../utils/cartCache';

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  fetchCart: (forceRefresh?: boolean) => Promise<void>;
  clearCart: () => Promise<void>;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const fetchingRef = useRef(false);
  const currentUserRef = useRef<string | null>(null);

  // 🚀 Función optimizada para cargar carrito
  const fetchCart = useCallback(async (forceRefresh: boolean = false) => {
    if (!isAuthenticated || !user?.id || fetchingRef.current) {
      return;
    }

    const userId = user.id;
    
    // Si cambió el usuario, limpiar carrito anterior
    if (currentUserRef.current && currentUserRef.current !== userId) {
      setCart(null);
      cartCache.clearUserCart(currentUserRef.current);
    }
    currentUserRef.current = userId;

    // 🔍 Verificar caché primero (solo si no es refresh forzado)
    if (!forceRefresh) {
      const cachedCart = cartCache.getCart(userId);
      if (cachedCart) {
        setCart(cachedCart);
        
        // Si el caché es relativamente nuevo, no hacer request API
        if (!cartCache.shouldRefresh(userId)) {
          return;
        }
      }
    }

    // 🌐 Fetch desde API
    fetchingRef.current = true;
    setLoading(true);
    
    try {
      const cartData = await authService.getCart();
      setCart(cartData);
      
      // 💾 Guardar en caché
      cartCache.setCart(userId, cartData);
      
    } catch (error) {
      console.error("Failed to fetch cart", error);
      
      // Si hay error, mantener datos del caché si existen
      const cachedCart = cartCache.getCart(userId);
      if (cachedCart) {
        setCart(cachedCart);
      } else {
        setCart(null);
      }
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [isAuthenticated, user?.id]);

  // 🗑️ Limpiar carrito
  const clearCart = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      await authService.clearCart();
      setCart(null);
      cartCache.clearUserCart(user.id);
    } catch (error) {
      console.error("Failed to clear cart", error);
      throw error;
    }
  }, [user?.id]);

  // ➕ Agregar al carrito con actualización optimista
  const addToCart = useCallback(async (productId: string, quantity: number) => {
    if (!user?.id) throw new Error('User not authenticated');

    try {
      // 🔄 Actualización optimista del UI
      setCart(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          total_unique_items: prev.total_unique_items + 1,
          // Nota: En un caso real, calcularías el precio exacto
        };
      });

      await authService.addToCart(productId, quantity);
      
      // 🔄 Refrescar desde servidor para datos exactos
      await fetchCart(true);
      
    } catch (error) {
      console.error("Failed to add to cart", error);
      // Revertir cambio optimista haciendo refresh
      await fetchCart(true);
      throw error;
    }
  }, [user?.id, fetchCart]);

  // ✏️ Actualizar cantidad
  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (!user?.id) throw new Error('User not authenticated');

    const originalCart = cart;
    
    try {
      // 🔄 Actualización optimista
      setCart(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items?.map(item => 
            item.id === itemId ? { ...item, quantity } : item
          ) || []
        };
      });

      await authService.updateCartItem(itemId, quantity);
      await fetchCart(true);
      
    } catch (error) {
      console.error("Failed to update cart item quantity", error);
      // Revertir a estado original
      setCart(originalCart);
      throw error;
    }
  }, [user?.id, cart, fetchCart]);

  // ❌ Remover del carrito
  const removeFromCart = useCallback(async (itemId: string) => {
    if (!user?.id) throw new Error('User not authenticated');

    const originalCart = cart;
    
    try {
      // 🔄 Actualización optimista
      setCart(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items?.filter(item => item.id !== itemId) || [],
          total_unique_items: Math.max(0, prev.total_unique_items - 1)
        };
      });

      await authService.removeFromCart(itemId);
      await fetchCart(true);
      
    } catch (error) {
      console.error("Failed to remove from cart", error);
      // Revertir a estado original
      setCart(originalCart);
      throw error;
    }
  }, [user?.id, cart, fetchCart]);

  // 🔄 Función para refrescar manualmente
  const refreshCart = useCallback(async () => {
    await fetchCart(true);
  }, [fetchCart]);

  // 🎯 Efecto principal: cargar carrito cuando cambie el usuario
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchCart(false); // Usar caché si está disponible
    } else {
      // Usuario no autenticado - limpiar estado
      setCart(null);
      setLoading(false);
      if (currentUserRef.current) {
        cartCache.clearUserCart(currentUserRef.current);
        currentUserRef.current = null;
      }
    }
  }, [isAuthenticated, user?.id, fetchCart]);

  // 🧹 Limpieza al desmontar
  useEffect(() => {
    return () => {
      fetchingRef.current = false;
    };
  }, []);

  return (
    <CartContext.Provider value={{ 
      cart, 
      loading, 
      fetchCart, 
      clearCart, 
      addToCart, 
      updateQuantity, 
      removeFromCart,
      refreshCart 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
