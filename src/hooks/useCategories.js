import { useQuery } from '@tanstack/react-query';
import { categoryApi } from '../api';

export const useCategories = () => {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.getCategories,
    staleTime: 1000 * 60 * 10, // 10 minutes
    select: (data) => data.data,
  });

  return { categories, isLoading };
};