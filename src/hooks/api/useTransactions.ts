import { productService } from "@/src/services/product";
import { deletePurchase, deleteRental } from "@/src/services/transaction";
import type {
  BuyTransaction,
  Product,
  PurchaseApiResponse,
  RentalApiResponse,
  RentTransaction,
} from "@/src/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Data interfaces for transactions
export interface CreatePurchaseData {
  buyer: number;
  product: number;
}

export interface CreateRentalData {
  renter: number;
  product: number;
  rent_option: string;
  rent_period_start_date: string;
  rent_period_end_date: string;
}

// Transform API response to frontend transaction format
const transformPurchase = (
  apiData: PurchaseApiResponse,
  product?: Product
): BuyTransaction => ({
  id: apiData.id.toString(),
  type: "BUY",
  productId: apiData.product.toString(),
  product,
  buyerId: apiData.buyer.toString(),
  sellerId: apiData.seller.toString(),
  purchase_date: apiData.purchase_date,
  createdAt: apiData.purchase_date,
  updatedAt: apiData.purchase_date,
  amount: product?.purchase_price
    ? parseFloat(product.purchase_price)
    : undefined,
  status: "COMPLETED", // Default status since API doesn't provide it
});

const transformRental = (
  apiData: RentalApiResponse,
  product?: Product
): RentTransaction => ({
  id: apiData.id.toString(),
  type: "RENT",
  productId: apiData.product.toString(),
  product,
  renterId: apiData.renter.toString(),
  sellerId: apiData.seller.toString(),
  rent_option: apiData.rent_option,
  rent_period_start_date: apiData.rent_period_start_date,
  rent_period_end_date: apiData.rent_period_end_date,
  total_price: apiData.total_price,
  rent_date: apiData.rent_date,
  createdAt: apiData.rent_date,
  updatedAt: apiData.rent_date,
  amount: parseFloat(apiData.total_price),
  status: "COMPLETED", // Default status since API doesn't provide it
});

const QUERY_KEYS = {
  purchases: {
    all: ["purchases"] as const,
    list: () => [...QUERY_KEYS.purchases.all, "list"] as const,
    detail: (id: string) =>
      [...QUERY_KEYS.purchases.all, "detail", id] as const,
  },
  rentals: {
    all: ["rentals"] as const,
    list: () => [...QUERY_KEYS.rentals.all, "list"] as const,
    detail: (id: string) => [...QUERY_KEYS.rentals.all, "detail", id] as const,
  },
} as const;

export const usePurchases = () => {
  return useQuery({
    queryKey: QUERY_KEYS.purchases.list(),
    queryFn: async () => {
      const purchasesData = await productService.getPurchases();
      if (!purchasesData?.data) return { data: [] };

      // Fetch product details for each purchase
      const purchasesWithProducts = await Promise.all(
        purchasesData.data.map(async (purchase: PurchaseApiResponse) => {
          try {
            const product = await productService.getProduct(
              purchase.product.toString()
            );
            return transformPurchase(purchase, product);
          } catch (error) {
            console.warn(`Failed to fetch product ${purchase.product}:`, error);
            return transformPurchase(purchase);
          }
        })
      );

      return { data: purchasesWithProducts };
    },
    staleTime: 2 * 60 * 1000,
  });
};

export const useRentals = () => {
  return useQuery({
    queryKey: QUERY_KEYS.rentals.list(),
    queryFn: async () => {
      const rentalsData = await productService.getRentals();
      if (!rentalsData?.data) return { data: [] };

      // Fetch product details for each rental
      const rentalsWithProducts = await Promise.all(
        rentalsData.data.map(async (rental: RentalApiResponse) => {
          try {
            const product = await productService.getProduct(
              rental.product.toString()
            );
            return transformRental(rental, product);
          } catch (error) {
            console.warn(`Failed to fetch product ${rental.product}:`, error);
            return transformRental(rental);
          }
        })
      );

      return { data: rentalsWithProducts };
    },
    staleTime: 2 * 60 * 1000,
  });
};

export const usePurchase = (id: string, enabled = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.purchases.detail(id),
    queryFn: async () => {
      const purchaseData = await productService.getPurchase(id);
      if (!purchaseData?.data) return null;

      try {
        const product = await productService.getProduct(
          purchaseData.data.product.toString()
        );
        return transformPurchase(purchaseData.data, product);
      } catch (error) {
        console.warn(
          `Failed to fetch product ${purchaseData.data.product}:`,
          error
        );
        return transformPurchase(purchaseData.data);
      }
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useRental = (id: string, enabled = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.rentals.detail(id),
    queryFn: async () => {
      const rentalData = await productService.getRental(id);
      if (!rentalData?.data) return null;

      try {
        const product = await productService.getProduct(
          rentalData.data.product.toString()
        );
        return transformRental(rentalData.data, product);
      } catch (error) {
        console.warn(
          `Failed to fetch product ${rentalData.data.product}:`,
          error
        );
        return transformRental(rentalData.data);
      }
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreatePurchase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePurchaseData) =>
      productService.createPurchase(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.purchases.all,
      });
    },
  });
};

export const useCreateRental = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRentalData) => productService.createRental(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.rentals.all,
      });
    },
  });
};

export const useDeletePurchase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePurchase(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.purchases.all,
      });
    },
  });
};

export const useDeleteRental = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteRental(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.rentals.all,
      });
    },
  });
};

// Update methods not implemented in backend yet
// export const useUpdatePurchase = () => { ... }
// export const useUpdateRental = () => { ... }
