/* @refresh reset */
import React, { createContext, useContext, useMemo, useState, ReactNode, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/AuthService';
import { Cart } from '../types';
import { CartWithDiscounts, QuantityDiscount } from '../types/discounts';
import { useAuth } from './AuthContext';
import { useCartQuery, useCartWithDiscountsQuery, useQuantityDiscountQuery } from '../hooks/queries/useAuthQueries';
import { queryKeys } from '../hooks/queries/queryKeys';

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
  cartLoading: boolean;
  cartWithDiscounts: CartWithDiscounts | null;
  cartWithDiscountsLoading: boolean;
  applicableQuantityDiscount: QuantityDiscount | null;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  refreshCartWithDiscounts: () => Promise<void>;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const [actionLoading, setActionLoading] = useState(false);

  const cartQuery = useCartQuery(isAuthenticated);
  const cartWithDiscountsQuery = useCartWithDiscountsQuery(isAuthenticated);

  const totalItems = cartQuery.data?.total_items ?? 0;
  const quantityDiscountQuery = useQuantityDiscountQuery(totalItems, isAuthenticated);

  const runWithSessionValidation = useCallback(async <T,>(action: () => Promise<T>): Promise<T> => {
    const token = authService.getCurrentToken();
    if (!token) {
      throw new Error('No hay sesión activa para completar esta acción.');
    }

    setActionLoading(true);

    try {
      return await action();
    } finally {
      setActionLoading(false);
    }
  }, []);

  const invalidateCartQueries = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.cart }),
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.cartWithDiscounts }),
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.quantityDiscountRoot }),
    ]);
  }, [queryClient]);

  const addToCart = useCallback(async (productId: string, quantity: number) => {
    await runWithSessionValidation(async () => {
      await authService.addToCart(productId, quantity);
      await invalidateCartQueries();
    });
  }, [invalidateCartQueries, runWithSessionValidation]);

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    await runWithSessionValidation(async () => {
      await authService.updateCartItem(itemId, quantity);
      await invalidateCartQueries();
    });
  }, [invalidateCartQueries, runWithSessionValidation]);

  const removeFromCart = useCallback(async (itemId: string) => {
    await runWithSessionValidation(async () => {
      await authService.removeFromCart(itemId);
      await invalidateCartQueries();
    });
  }, [invalidateCartQueries, runWithSessionValidation]);

  const clearCart = useCallback(async () => {
    await runWithSessionValidation(async () => {
      await authService.clearCart();
      await invalidateCartQueries();
    });
  }, [invalidateCartQueries, runWithSessionValidation]);

  const refreshCart = useCallback(async () => {
    await invalidateCartQueries();
  }, [invalidateCartQueries]);

  const refreshCartWithDiscounts = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.cartWithDiscounts }),
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.quantityDiscountRoot }),
    ]);
  }, [queryClient]);

  const contextValue: CartContextType = useMemo(() => ({
    cart: cartQuery.data ?? null,
    cartLoading: cartQuery.isLoading || cartQuery.isFetching,
    cartWithDiscounts: cartWithDiscountsQuery.data ?? null,
    cartWithDiscountsLoading: cartWithDiscountsQuery.isLoading || cartWithDiscountsQuery.isFetching,
    applicableQuantityDiscount: quantityDiscountQuery.data ?? null,
      addToCart, 
      updateQuantity, 
      removeFromCart,
    clearCart,
    refreshCart,
    refreshCartWithDiscounts,
    loading: actionLoading || cartQuery.isLoading || cartWithDiscountsQuery.isLoading || quantityDiscountQuery.isLoading,
  }), [
    actionLoading,
    addToCart,
    cartQuery.data,
    cartQuery.isFetching,
    cartQuery.isLoading,
    cartWithDiscountsQuery.data,
    cartWithDiscountsQuery.isFetching,
    cartWithDiscountsQuery.isLoading,
    clearCart,
    quantityDiscountQuery.data,
    quantityDiscountQuery.isLoading,
      refreshCart,
    refreshCartWithDiscounts,
    removeFromCart,
    updateQuantity,
  ]);

  return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
