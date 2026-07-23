import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wishlistApi } from '../api';

export const useWishlist = () => {
  const queryClient = useQueryClient();

  const { data: wishlist, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: wishlistApi.getWishlist,
    staleTime: 1000 * 30,
    select: (data) => data.data,
  });

  const addToWishlist = useMutation({
    mutationFn: (productId) => wishlistApi.addToWishlist(productId),
    onSuccess: () => {
      queryClient.invalidateQueries(['wishlist']);
      // ✅ No toast notification
    },
    onError: (error) => {
      // ✅ No toast notification
      console.error('Failed to add to wishlist:', error);
    },
  });

  const removeFromWishlist = useMutation({
    mutationFn: (productId) => wishlistApi.removeFromWishlist(productId),
    onSuccess: () => {
      queryClient.invalidateQueries(['wishlist']);
      // ✅ No toast notification
    },
    onError: (error) => {
      console.error('Failed to remove from wishlist:', error);
    },
  });

  const isInWishlist = (productId) => {
    return wishlist?.products?.some(p => p._id === productId || p === productId) || false;
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