import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback, useRef } from 'react';
import { authService } from '../services/AuthService';
import { Cart } from '../types';
import { CartWithDiscounts, QuantityDiscount } from '../types/discounts';
import { useAuth } from './AuthContext';
import cartCache from '../utils/cartCache';

// Función para migrar datos del carrito de la estructura antigua a la nueva
const migrateCartData = (cartData: any): Cart => {
  // Si ya tiene la estructura nueva, devolverlo tal como está
  if (cartData && typeof cartData.total === 'number' && cartData.items) {
    return cartData;
  }

  // Migrar de estructura antigua a nueva
  const migratedItems = cartData?.items?.map((item: any) => ({
    ...item,
    subtotal: item.subtotal || item.subtotal_ves || 0, // Usar subtotal_ves como fallback
    product: {
      ...item.product,
      price: item.product?.price?.toString() || '0',
      original_price: item.product?.original_price?.toString() || null,
      current_price: item.product?.current_price?.toString() || item.product?.price?.toString() || '0',
      rating: item.product?.rating?.toString() || '0',
      discount_percentage: item.product?.discount_percentage?.toString() || '0'
    }
  })) || [];

  // Calcular total si no existe o es 0
  let total = cartData?.total || cartData?.total_ves || 0;
  if (total === 0 && migratedItems.length > 0) {
    // Calcular total sumando los subtotales de los items
    total = migratedItems.reduce((sum: number, item: any) => {
      const subtotal = typeof item.subtotal === 'string' ? parseFloat(item.subtotal) : item.subtotal;
      return sum + (isNaN(subtotal) ? 0 : subtotal);
    }, 0);
  }

  return {
    items: migratedItems,
    total_items: cartData?.total_items || migratedItems.length,
    total_unique_items: cartData?.total_unique_items || new Set(migratedItems.map((item: any) => item.product.id)).size,
    total: total
  };
};

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  fetchCart: (forceRefresh?: boolean) => Promise<void>;
  clearCart: () => Promise<void>;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  refreshCart: () => Promise<void>;
  
  // Nuevas funcionalidades de descuentos
  cartWithDiscounts: CartWithDiscounts | null;
  applicableQuantityDiscount: QuantityDiscount | null;
  fetchCartWithDiscounts: () => Promise<void>;
  fetchApplicableDiscount: (quantity: number) => Promise<void>;
  refreshCartWithDiscounts: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const fetchingRef = useRef(false);
  const currentUserRef = useRef<string | null>(null);
  
  // Estados para descuentos
  const [cartWithDiscounts, setCartWithDiscounts] = useState<CartWithDiscounts | null>(null);
  const [applicableQuantityDiscount, setApplicableQuantityDiscount] = useState<QuantityDiscount | null>(null);

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
      
      // 🔄 Migrar datos del carrito si es necesario (estructura antigua -> nueva)
      const migratedCart = migrateCartData(cartData);
      
      setCart(migratedCart);
      
      // 💾 Guardar en caché
      cartCache.setCart(userId, migratedCart);
      
    } catch (error) {
      console.error("Failed to fetch cart", error);
      
      // Si hay error, mantener datos del caché si existen
      const cachedCart = cartCache.getCart(userId);
      if (cachedCart) {
        const migratedCachedCart = migrateCartData(cachedCart);
        setCart(migratedCachedCart);
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

  // ===== FUNCIONES DE DESCUENTOS =====

  // Obtener carrito con descuentos
  const fetchCartWithDiscounts = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      setCartWithDiscounts(null);
      return;
    }

    try {
      const cart = await authService.getCartWithDiscounts();
      setCartWithDiscounts(cart);
    } catch (error) {
      console.error('Error fetching cart with discounts:', error);
      setCartWithDiscounts(null);
    }
  }, [isAuthenticated, user?.id]);

  // Obtener descuento aplicable por cantidad
  const fetchApplicableDiscount = useCallback(async (quantity: number) => {
    if (quantity === 0) {
      setApplicableQuantityDiscount(null);
      return;
    }

    try {
      const discount = await authService.getApplicableQuantityDiscount(quantity);
      setApplicableQuantityDiscount(discount);
    } catch (error) {
      console.error('Error fetching applicable discount:', error);
      setApplicableQuantityDiscount(null);
    }
  }, []);

  // Refrescar carrito con descuentos
  const refreshCartWithDiscounts = useCallback(async () => {
    await fetchCartWithDiscounts();
  }, [fetchCartWithDiscounts]);

  // Auto-fetch descuentos cuando cambie el carrito
  useEffect(() => {
    if (cart?.total_items) {
      fetchApplicableDiscount(cart.total_items);
      fetchCartWithDiscounts();
    }
  }, [cart?.total_items, fetchApplicableDiscount, fetchCartWithDiscounts]);

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
      refreshCart,
      // Nuevas funcionalidades de descuentos
      cartWithDiscounts,
      applicableQuantityDiscount,
      fetchCartWithDiscounts,
      fetchApplicableDiscount,
      refreshCartWithDiscounts
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
