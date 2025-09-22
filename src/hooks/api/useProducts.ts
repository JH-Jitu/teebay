

import { APP_CONFIG } from "@/src/config/app";
import {
  invalidateQueries,
  optimisticUpdates,
  queryKeys,
  queryOptions,
} from "@/src/config/query";
import { productService } from "@/src/services/product";
import type {
  PaginatedResponse,
  Product,
  ProductCreateData,
  ProductFilters,
} from "@/src/types";
import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";





export const useProducts = (
  page = 1,
  pageSize = APP_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE,
  filters?: ProductFilters
) => {
  return useQuery({
    ...queryOptions.products.list(filters),
    queryFn: () => productService.getProducts(page, pageSize, filters),
    enabled: true,
  });
};

export const useInfiniteProducts = (
  pageSize = APP_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE,
  filters?: ProductFilters
) => {
  return useInfiniteQuery({
    queryKey: queryKeys.products.list(filters),
    queryFn: ({ pageParam = 1 }) =>
      productService.getProducts(pageParam as number, pageSize, filters),
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.next) return undefined;
      return allPages.length + 1;
    },
    getPreviousPageParam: (firstPage, allPages) => {
      if (!firstPage.previous) return undefined;
      return allPages.length > 1 ? allPages.length - 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: queryOptions.products.list(filters).staleTime,
  });
};

export const useSearchProducts = (
  query: string,
  filters?: Omit<ProductFilters, "search">,
  enabled = true
) => {
  return useInfiniteQuery({
    queryKey: queryKeys.products.search(query, filters),
    queryFn: ({ pageParam = 1 }) =>
      productService.searchProducts(
        query,
        pageParam as number,
        APP_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE,
        filters
      ),
    getNextPageParam: (lastPage) => {
      return lastPage.next ? lastPage.currentPage + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: enabled && query.length >= 2, 
    staleTime: 30 * 1000, 
  });
};

export const useMyProducts = () => {
  return useInfiniteQuery({
    ...queryOptions.products.myProducts(),
    queryFn: ({ pageParam = 1 }) =>
      productService.getMyProducts(pageParam as number),
    getNextPageParam: (lastPage) => {
      return lastPage.next ? lastPage.currentPage + 1 : undefined;
    },
    initialPageParam: 1,
  });
};

export const useFavoriteProducts = () => {
  return useInfiniteQuery({
    ...queryOptions.products.favorites(),
    queryFn: ({ pageParam = 1 }) =>
      productService.getFavoriteProducts(pageParam as number),
    getNextPageParam: (lastPage) => {
      return lastPage.next ? lastPage.currentPage + 1 : undefined;
    },
    initialPageParam: 1,
  });
};

export const useFeaturedProducts = () => {
  return useQuery({
    queryKey: queryKeys.products.featured(),
    queryFn: () => productService.getFeaturedProducts(1, 10),
    staleTime: 5 * 60 * 1000, 
  });
};

export const useProductsByCategory = (categoryId: string, enabled = true) => {
  return useInfiniteQuery({
    queryKey: queryKeys.products.byCategory(categoryId),
    queryFn: ({ pageParam = 1 }) =>
      productService.getProductsByCategory(categoryId, pageParam as number),
    getNextPageParam: (lastPage) => {
      return lastPage.next ? lastPage.currentPage + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: enabled && !!categoryId,
    staleTime: 2 * 60 * 1000, 
  });
};





export const useProduct = (productId: string, enabled = true) => {
  const queryClient = useQueryClient();

  return useQuery({
    ...queryOptions.products.detail(productId),
    queryFn: async () => {
      
      optimisticUpdates.incrementViewCount(queryClient, productId);

      return productService.getProduct(productId);
    },
    enabled: enabled && !!productId,
  });
};

export const useSimilarProducts = (productId: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.products.similar(productId),
    queryFn: () => productService.getSimilarProducts(productId),
    enabled: enabled && !!productId,
    staleTime: 5 * 60 * 1000, 
  });
};





export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProductCreateData) => productService.createProduct(data),
    onSuccess: (newProduct) => {
      
      invalidateQueries.allProducts(queryClient);
      invalidateQueries.userProducts(queryClient);

      
      queryClient.setQueryData(
        queryKeys.products.myProducts(),
        (oldData: InfiniteData<PaginatedResponse<Product>> | undefined) => {
          if (oldData?.pages[0]) {
            return {
              ...oldData,
              pages: [
                {
                  ...oldData.pages[0],
                  data: [newProduct, ...oldData.pages[0].data],
                  count: oldData.pages[0].count + 1,
                },
                ...oldData.pages.slice(1),
              ],
            };
          }
          return oldData;
        }
      );
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<ProductCreateData>;
    }) => productService.updateProduct(id, data),
    onSuccess: (updatedProduct) => {
      
      queryClient.setQueryData(
        queryKeys.products.detail(updatedProduct.id),
        updatedProduct
      );

      
      invalidateQueries.allProducts(queryClient);
      invalidateQueries.userProducts(queryClient);
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => productService.deleteProduct(productId),
    onSuccess: (_, productId) => {
      
      queryClient.removeQueries({
        queryKey: queryKeys.products.detail(productId),
      });

      
      invalidateQueries.allProducts(queryClient);
      invalidateQueries.userProducts(queryClient);
    },
  });
};

export const useUploadProductImages = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      images,
      onProgress,
    }: {
      productId: string;
      images: string[];
      onProgress?: (progress: number) => void;
    }) => productService.uploadProductImages(productId, images, onProgress),
    onSuccess: (imageUrls, { productId }) => {
      
      queryClient.setQueryData(
        queryKeys.products.detail(productId),
        (oldData: Product | undefined) => {
          if (oldData) {
            return {
              ...oldData,
              images: [
                ...oldData.images,
                ...imageUrls.map((url, index) => ({
                  id: `temp_${Date.now()}_${index}`,
                  url,
                  order: oldData.images.length + index,
                })),
              ],
            };
          }
          return oldData;
        }
      );
    },
  });
};





export const useAddToFavorites = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => productService.addToFavorites(productId),
    onMutate: async (productId) => {
      
      optimisticUpdates.addToFavorites(queryClient, productId);

      
      return { productId };
    },
    onError: (error, productId) => {
      
      optimisticUpdates.removeFromFavorites(queryClient, productId);
    },
    onSuccess: () => {
      
      queryClient.invalidateQueries({
        queryKey: queryKeys.products.favorites(),
      });
    },
  });
};

export const useRemoveFromFavorites = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) =>
      productService.removeFromFavorites(productId),
    onMutate: async (productId) => {
      
      optimisticUpdates.removeFromFavorites(queryClient, productId);

      return { productId };
    },
    onError: (error, productId) => {
      
      optimisticUpdates.addToFavorites(queryClient, productId);
    },
    onSuccess: () => {
      
      queryClient.invalidateQueries({
        queryKey: queryKeys.products.favorites(),
      });
    },
  });
};





export const useCategories = () => {
  return useQuery({
    ...queryOptions.categories.list(),
    queryFn: () => productService.getCategories(),
  });
};

export const useCategory = (categoryId: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.categories.detail(categoryId),
    queryFn: () => productService.getCategory(categoryId),
    enabled: enabled && !!categoryId,
    staleTime: 10 * 60 * 1000, 
  });
};
