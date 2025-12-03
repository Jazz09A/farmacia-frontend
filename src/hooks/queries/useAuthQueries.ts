import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../../services/AuthService';
import type { User, Cart, Order } from '../../types';
import type { CartWithDiscounts, QuantityDiscount } from '../../types/discounts';
import type { LoginData, JuridicoRegisterData, AuthResponse } from '../../types/auth';
import { queryKeys } from './queryKeys';

// ===== QUERIES =====

export const useAuthUserQuery = (enabled: boolean = true) => {
  return useQuery<User | null>({
    queryKey: queryKeys.auth.user,
    queryFn: () => authService.getMe(),
    enabled,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
  });
};

export const useCartQuery = (enabled: boolean = true) => {
  return useQuery<Cart>({
    queryKey: queryKeys.auth.cart,
    queryFn: () => authService.getCart(),
    enabled,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useCartWithDiscountsQuery = (enabled: boolean = true) => {
  return useQuery<CartWithDiscounts>({
    queryKey: queryKeys.auth.cartWithDiscounts,
    queryFn: () => authService.getCartWithDiscounts(),
    enabled,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useQuantityDiscountQuery = (quantity: number, enabled: boolean) => {
  return useQuery<QuantityDiscount | null>({
    queryKey: queryKeys.auth.quantityDiscount(quantity),
    queryFn: () => authService.getApplicableQuantityDiscount(quantity),
    enabled: enabled && quantity > 0,
    staleTime: 2 * 60 * 1000,
  });
};

export const useUserOrdersQuery = () => {
  return useQuery<Order[]>({
    queryKey: queryKeys.auth.orders,
    queryFn: () => authService.getUserOrders(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useOrderDetailsQuery = (orderId: string, enabled: boolean = true) => {
  return useQuery<Order>({
    queryKey: queryKeys.auth.order(orderId),
    queryFn: () => authService.getOrderDetails(orderId),
    enabled: enabled && !!orderId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUserAddressesQuery = (
  options?: {
    include_checkout_preview?: boolean;
    cart_total?: number;
  },
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: [...queryKeys.auth.addresses, options],
    queryFn: () => authService.getUserAddresses(options),
    staleTime: 10 * 60 * 1000,
    enabled,
  });
};

// ===== MUTATIONS =====

export const useLoginMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation<AuthResponse, Error, LoginData>({
    mutationFn: (data: LoginData) => authService.login(data),
    onSuccess: (response) => {
      if (response.success && response.data?.user) {
        queryClient.setQueryData(queryKeys.auth.user, response.data.user);
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.cart });
      }
    },
  });
};

export const useRegisterMutation = () => {
  return useMutation<AuthResponse, Error, JuridicoRegisterData>({
    mutationFn: (data: JuridicoRegisterData) => authService.registerJuridico(data),
  });
};

export const useRefreshTokenMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation<AuthResponse, Error, void>({
    mutationFn: () => authService.refreshToken(),
    onError: (error) => {
      // If refresh fails, invalidate all queries and clear cache
      console.error('Refresh token mutation failed:', error);
      queryClient.clear();
    },
    onSuccess: (response) => {
      // If refresh succeeds, invalidate user query to refetch with new token
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.user });
      }
    },
  });
};

export const useAddToCartMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      authService.addToCart(productId, quantity),
    onMutate: async ({ productId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.auth.cart });
      await queryClient.cancelQueries({ queryKey: queryKeys.auth.cartWithDiscounts });
      
      const previousCart = queryClient.getQueryData<Cart>(queryKeys.auth.cart);
      
      if (previousCart) {
        queryClient.setQueryData<Cart>(queryKeys.auth.cart, {
          ...previousCart,
          total_items: previousCart.total_items + quantity,
        });
      }
      
      return { previousCart };
    },
    onError: (err, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(queryKeys.auth.cart, context.previousCart);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.cart });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.cartWithDiscounts });
    },
  });
};

export const useUpdateCartItemMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      authService.updateCartItem(itemId, quantity),
    onMutate: async ({ itemId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.auth.cart });
      await queryClient.cancelQueries({ queryKey: queryKeys.auth.cartWithDiscounts });
      
      const previousCart = queryClient.getQueryData<Cart>(queryKeys.auth.cart);
      
      if (previousCart) {
        const updatedItems = previousCart.items.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        );
        queryClient.setQueryData<Cart>(queryKeys.auth.cart, {
          ...previousCart,
          items: updatedItems,
        });
      }
      
      return { previousCart };
    },
    onError: (err, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(queryKeys.auth.cart, context.previousCart);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.cart });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.cartWithDiscounts });
    },
  });
};

export const useRemoveFromCartMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (itemId: string) => authService.removeFromCart(itemId),
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.auth.cart });
      await queryClient.cancelQueries({ queryKey: queryKeys.auth.cartWithDiscounts });
      
      const previousCart = queryClient.getQueryData<Cart>(queryKeys.auth.cart);
      
      if (previousCart) {
        const updatedItems = previousCart.items.filter(item => item.id !== itemId);
        const removedItem = previousCart.items.find(item => item.id === itemId);
        queryClient.setQueryData<Cart>(queryKeys.auth.cart, {
          ...previousCart,
          items: updatedItems,
          total_items: Math.max(0, previousCart.total_items - (removedItem?.quantity || 0)),
          total_unique_items: updatedItems.length,
        });
      }
      
      return { previousCart };
    },
    onError: (err, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(queryKeys.auth.cart, context.previousCart);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.cart });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.cartWithDiscounts });
    },
  });
};

export const useClearCartMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => authService.clearCart(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.cart });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.cartWithDiscounts });
    },
  });
};

export const useCreateOrderMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (orderData: {
      shipping_address_id: string;
      payment_method: string;
      payment_currency: 'USD' | 'VES';
      payment_capture_url: string;
      customer_notes: string;
    }) => authService.createOrder(orderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.orders });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.cart });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.cartWithDiscounts });
    },
  });
};

export const useCreateAddressMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (addressData: any) => authService.createUserAddress(addressData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.addresses });
    },
  });
};

export const useVerifyEmailMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (token: string) => authService.verifyEmailToken(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user });
    },
  });
};

