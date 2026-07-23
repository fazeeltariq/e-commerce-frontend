import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartApi } from '../api';
import { useAuth } from '../context/AuthContext';

export const useCart = () => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // ✅ Only fetch cart if user is authenticated
  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: cartApi.getCart,
    staleTime: 1000 * 30,
    enabled: isAuthenticated,  // ✅ THIS IS THE FIX
    select: (data) => data.data,
  });

  const addToCart = useMutation({
    mutationFn: ({ productId, quantity }) => cartApi.addToCart(productId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries(['cart']);
    },
    onError: (error) => {
      console.error('Failed to add to cart:', error);
    },
  });

  const updateQuantity = useMutation({
    mutationFn: ({ productId, quantity }) => cartApi.updateQuantity(productId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries(['cart']);
    },
    onError: (error) => {
      console.error('Failed to update cart:', error);
    },
  });

  const removeFromCart = useMutation({
    mutationFn: (productId) => cartApi.removeFromCart(productId),
    onSuccess: () => {
      queryClient.invalidateQueries(['cart']);
    },
    onError: (error) => {
      console.error('Failed to remove from cart:', error);
    },
  });

  const clearCart = useMutation({
    mutationFn: cartApi.clearCart,
    onSuccess: () => {
      queryClient.invalidateQueries(['cart']);
    },
    onError: (error) => {
      console.error('Failed to clear cart:', error);
    },
  });

  const totalItems = cart?.products?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return {
    cart,
    isLoading,
    totalItems,
    addToCart: addToCart.mutate,
    updateQuantity: updateQuantity.mutate,
    removeFromCart: removeFromCart.mutate,
    clearCart: clearCart.mutate,
    isAdding: addToCart.isPending,
  };
};