

import { DefaultOptions, QueryClient } from "@tanstack/react-query";
import { API_CONFIG } from "./api";

const defaultOptions: DefaultOptions = {
  queries: {
    
    gcTime: API_CONFIG.CACHE_TIME,

    
    staleTime: API_CONFIG.STALE_TIME,

    
    retry: (failureCount, error: any) => {
      
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }

      
      return failureCount < API_CONFIG.RETRY_ATTEMPTS;
    },

    
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

    
    refetchOnWindowFocus: !__DEV__,

    
    refetchOnReconnect: true,

    
    refetchOnMount: true,
  },
  mutations: {
    
    retry: 1,

    
    retryDelay: API_CONFIG.RETRY_DELAY,
  },
};

export const queryClient = new QueryClient({
  defaultOptions,
});

export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions,

    
    mutationCache: undefined,
    queryCache: undefined,
  });
};

export const queryKeys = {
  
  auth: {
    all: ["auth"] as const,
    user: ["auth", "user"] as const,
    profile: ["auth", "profile"] as const,
  },

  
  products: {
    all: ["products"] as const,
    lists: () => [...queryKeys.products.all, "list"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.products.lists(), filters] as const,
    details: () => [...queryKeys.products.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.products.details(), id] as const,
    search: (query: string, filters?: Record<string, unknown>) =>
      [...queryKeys.products.all, "search", query, filters] as const,
    myProducts: () => [...queryKeys.products.all, "my"] as const,
    favorites: () => [...queryKeys.products.all, "favorites"] as const,
    featured: () => [...queryKeys.products.all, "featured"] as const,
    similar: (productId: string) =>
      [...queryKeys.products.all, "similar", productId] as const,
    byCategory: (categoryId: string) =>
      [...queryKeys.products.all, "category", categoryId] as const,
  },

  
  categories: {
    all: ["categories"] as const,
    lists: () => [...queryKeys.categories.all, "list"] as const,
    list: () => [...queryKeys.categories.lists()] as const,
    details: () => [...queryKeys.categories.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.categories.details(), id] as const,
  },

  
  transactions: {
    all: ["transactions"] as const,
    lists: () => [...queryKeys.transactions.all, "list"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.transactions.lists(), filters] as const,
    details: () => [...queryKeys.transactions.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.transactions.details(), id] as const,
    history: () => [...queryKeys.transactions.all, "history"] as const,
    bought: () => [...queryKeys.transactions.history(), "bought"] as const,
    sold: () => [...queryKeys.transactions.history(), "sold"] as const,
    borrowed: () => [...queryKeys.transactions.history(), "borrowed"] as const,
    lent: () => [...queryKeys.transactions.history(), "lent"] as const,
  },

  
  users: {
    all: ["users"] as const,
    lists: () => [...queryKeys.users.all, "list"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.users.lists(), filters] as const,
    details: () => [...queryKeys.users.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
  },

  
  notifications: {
    all: ["notifications"] as const,
    lists: () => [...queryKeys.notifications.all, "list"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.notifications.lists(), filters] as const,
    settings: () => [...queryKeys.notifications.all, "settings"] as const,
  },
} as const;

export const queryOptions = {
  
  products: {
    list: (filters?: Record<string, unknown>) => ({
      queryKey: queryKeys.products.list(filters),
      staleTime: 2 * 60 * 1000, 
    }),

    detail: (id: string) => ({
      queryKey: queryKeys.products.detail(id),
      staleTime: 5 * 60 * 1000, 
    }),

    myProducts: () => ({
      queryKey: queryKeys.products.myProducts(),
      staleTime: 30 * 1000, 
    }),

    favorites: () => ({
      queryKey: queryKeys.products.favorites(),
      staleTime: 1 * 60 * 1000, 
    }),
  },

  
  categories: {
    list: () => ({
      queryKey: queryKeys.categories.list(),
      staleTime: 10 * 60 * 1000, 
    }),
  },

  
  transactions: {
    history: () => ({
      queryKey: queryKeys.transactions.history(),
      staleTime: 1 * 60 * 1000, 
    }),

    detail: (id: string) => ({
      queryKey: queryKeys.transactions.detail(id),
      staleTime: 30 * 1000, 
    }),
  },

  
  auth: {
    user: () => ({
      queryKey: queryKeys.auth.user,
      staleTime: 5 * 60 * 1000, 
    }),
  },

  
  notifications: {
    list: () => ({
      queryKey: queryKeys.notifications.list(),
      staleTime: 30 * 1000, 
    }),
  },
} as const;

export const invalidateQueries = {
  
  allProducts: (queryClient: QueryClient) =>
    queryClient.invalidateQueries({ queryKey: queryKeys.products.all }),

  productDetails: (queryClient: QueryClient, productId: string) =>
    queryClient.invalidateQueries({
      queryKey: queryKeys.products.detail(productId),
    }),

  userProducts: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.products.myProducts(),
    });
    queryClient.invalidateQueries({ queryKey: queryKeys.products.favorites() });
  },

  
  allTransactions: (queryClient: QueryClient) =>
    queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all }),

  transactionHistory: (queryClient: QueryClient) =>
    queryClient.invalidateQueries({
      queryKey: queryKeys.transactions.history(),
    }),

  
  userAuth: (queryClient: QueryClient) =>
    queryClient.invalidateQueries({ queryKey: queryKeys.auth.all }),

  
  allNotifications: (queryClient: QueryClient) =>
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all }),
} as const;

export const optimisticUpdates = {
  
  addToFavorites: (queryClient: QueryClient, productId: string) => {
    queryClient.setQueryData(
      queryKeys.products.detail(productId),
      (oldData: any) => {
        if (oldData) {
          return {
            ...oldData,
            favoriteCount: (oldData.favoriteCount || 0) + 1,
            isFavorited: true,
          };
        }
        return oldData;
      }
    );
  },

  
  removeFromFavorites: (queryClient: QueryClient, productId: string) => {
    queryClient.setQueryData(
      queryKeys.products.detail(productId),
      (oldData: any) => {
        if (oldData) {
          return {
            ...oldData,
            favoriteCount: Math.max((oldData.favoriteCount || 1) - 1, 0),
            isFavorited: false,
          };
        }
        return oldData;
      }
    );
  },

  
  incrementViewCount: (queryClient: QueryClient, productId: string) => {
    queryClient.setQueryData(
      queryKeys.products.detail(productId),
      (oldData: any) => {
        if (oldData) {
          return {
            ...oldData,
            viewCount: (oldData.viewCount || 0) + 1,
          };
        }
        return oldData;
      }
    );
  },
} as const;
