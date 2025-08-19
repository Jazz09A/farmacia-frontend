import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { authService } from '../services/AuthService';
import { Cart } from '../types';

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  fetchCart: () => void;
  clearCart: () => void;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const cartData = await authService.getCart();
      setCart(cartData);
    } catch (error) {
      console.error("Failed to fetch cart", error);
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      await authService.clearCart();
      setCart(null);
    } catch (error) {
      console.error("Failed to clear cart", error);
    }
  };

  const addToCart = async (productId: string, quantity: number) => {
    try {
      await authService.addToCart(productId, quantity);
      await fetchCart(); // Refetch cart after adding an item
    } catch (error) {
      console.error("Failed to add to cart", error);
      // Optionally, you can re-throw the error to be handled by the component
      throw error;
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      await authService.updateCartItem(itemId, quantity);
      await fetchCart(); // Refetch cart after updating quantity
    } catch (error) {
      console.error("Failed to update cart item quantity", error);
      throw error;
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      await authService.removeFromCart(itemId);
      await fetchCart(); // Refetch cart after removing item
    } catch (error) {
      console.error("Failed to remove from cart", error);
      throw error;
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <CartContext.Provider value={{ cart, loading, fetchCart, clearCart, addToCart, updateQuantity, removeFromCart }}>
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
