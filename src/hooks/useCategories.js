import { useQuery } from '@tanstack/react-query';
import { categoryApi } from '../api';

export const useCategories = () => {
  const { 
    data: categories, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      console.log('🔄 useCategories: Fetching...');
      const response = await categoryApi.getCategories();
      console.log('📂 useCategories: Response:', response);
      console.log('📂 useCategories: Data:', response.data);
      
      // Backend returns array directly
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      // Handle wrapped responses
      if (response.data?.categories && Array.isArray(response.data.categories)) {
        return response.data.categories;
      }
      
      if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      
      console.warn('⚠️ useCategories: Unexpected format:', response.data);
      return [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    retryDelay: 1000,
    // ✅ Important: Don't cache empty results
    initialData: undefined,
  });

  // Log errors
  if (error) {
    console.error('❌ useCategories error:', error);
  }

  return { 
    categories: categories || [], // Always return array
    isLoading,
    error,
    refetch
  };
};