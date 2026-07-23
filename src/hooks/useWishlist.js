import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wishlistApi } from '../api';
import { useAuth } from '../context/AuthContext';

export const useWishlist = () => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // ✅ Only fetch wishlist if user is authenticated
  const { data: wishlist, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: wishlistApi.getWishlist,
    staleTime: 1000 * 30,
    enabled: isAuthenticated,  // ✅ THIS IS THE FIX
    select: (data) => data.data,
  });

  const addToWishlist = useMutation({
    mutationFn: (productId) => wishlistApi.addToWishlist(productId),
    onSuccess: () => {
      queryClient.invalidateQueries(['wishlist']);
    },
    onError: (error) => {
      console.error('Failed to add to wishlist:', error);
    },
  });

  const removeFromWishlist = useMutation({
    mutationFn: (productId) => wishlistApi.removeFromWishlist(productId),
    onSuccess: () => {
      queryClient.invalidateQueries(['wishlist']);
    },
    onError: (error) => {
      console.error('Failed to remove from wishlist:', error);
    },
  });

  const isInWishlist = (productId) => {
    if (!wishlist?.products) return false;
    return wishlist.products.some(p => p._id === productId || p === productId);
  };

  return {
    wishlist,
    isLoading,
    totalItems: wishlist?.products?.length || 0,
    addToWishlist: addToWishlist.mutate,
    removeFromWishlist: removeFromWishlist.mutate,
    isInWishlist,
    isAdding: addToWishlist.isPending,
  };
};