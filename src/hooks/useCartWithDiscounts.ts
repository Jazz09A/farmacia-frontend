import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/AuthService';
import { CartWithDiscounts } from '../types/discounts';

export const useCartWithDiscounts = () => {
  const { user, isAuthenticated } = useAuth();
  const [cartWithDiscounts, setCartWithDiscounts] = useState<CartWithDiscounts | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener carrito con descuentos
  const fetchCartWithDiscounts = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      setCartWithDiscounts(null);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const cart = await authService.getCartWithDiscounts();
      setCartWithDiscounts(cart);
    } catch (err) {
      console.error('Error fetching cart with discounts:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar el carrito');
      setCartWithDiscounts(null);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  // Auto-fetch cuando cambie la autenticación
  useEffect(() => {
    fetchCartWithDiscounts();
  }, [fetchCartWithDiscounts]);

  // Refrescar carrito
  const refreshCart = useCallback(() => {
    fetchCartWithDiscounts();
  }, [fetchCartWithDiscounts]);

  return {
    cartWithDiscounts,
    loading,
    error,
    refreshCart
  };
};

