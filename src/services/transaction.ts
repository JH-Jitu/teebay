import { API_CONFIG } from "@/src/config/api";
import type {
  BuyTransaction,
  PaginatedResponse,
  PurchaseApiResponse,
  RentalApiResponse,
  RentTransaction,
} from "@/src/types";
import { apiService } from "./api";

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

export const getPurchases = async (
  page = 1,
  pageSize = 20
): Promise<PaginatedResponse<BuyTransaction>> => {
  const response = await apiService.get<PaginatedResponse<BuyTransaction>>(
    API_CONFIG.ENDPOINTS.TRANSACTIONS.PURCHASES,
    { page, page_size: pageSize }
  );

  if (!response.success) {
    throw new Error(response.message || "Failed to fetch purchases");
  }

  return response.data!;
};

export const getRentals = async (
  page = 1,
  pageSize = 20
): Promise<PaginatedResponse<RentTransaction>> => {
  const response = await apiService.get<PaginatedResponse<RentTransaction>>(
    API_CONFIG.ENDPOINTS.TRANSACTIONS.RENTALS,
    { page, page_size: pageSize }
  );

  if (!response.success) {
    throw new Error(response.message || "Failed to fetch rentals");
  }

  return response.data!;
};

export const getPurchase = async (
  id: string
): Promise<{ data: PurchaseApiResponse }> => {
  const response = await apiService.get<PurchaseApiResponse>(
    API_CONFIG.ENDPOINTS.TRANSACTIONS.PURCHASE_DETAIL(id)
  );

  if (!response.success) {
    throw new Error(response.message || "Failed to fetch purchase");
  }

  return { data: response.data! };
};

export const getRental = async (
  id: string
): Promise<{ data: RentalApiResponse }> => {
  const response = await apiService.get<RentalApiResponse>(
    API_CONFIG.ENDPOINTS.TRANSACTIONS.RENTAL_DETAIL(id)
  );

  if (!response.success) {
    throw new Error(response.message || "Failed to fetch rental");
  }

  return { data: response.data! };
};

export const createPurchase = async (
  data: CreatePurchaseData
): Promise<BuyTransaction> => {
  const response = await apiService.post<BuyTransaction>(
    API_CONFIG.ENDPOINTS.TRANSACTIONS.PURCHASES,
    data
  );

  if (!response.success) {
    throw new Error(response.message || "Failed to create purchase");
  }

  return response.data!;
};

export const createRental = async (
  data: CreateRentalData
): Promise<RentTransaction> => {
  const response = await apiService.post<RentTransaction>(
    API_CONFIG.ENDPOINTS.TRANSACTIONS.RENTALS,
    data
  );

  if (!response.success) {
    throw new Error(response.message || "Failed to create rental");
  }

  return response.data!;
};

export const updatePurchase = async (
  id: string,
  data: Partial<CreatePurchaseData>
): Promise<BuyTransaction> => {
  const response = await apiService.put<BuyTransaction>(
    API_CONFIG.ENDPOINTS.TRANSACTIONS.PURCHASE_DETAIL(id),
    data
  );

  if (!response.success) {
    throw new Error(response.message || "Failed to update purchase");
  }

  return response.data!;
};

export const updateRental = async (
  id: string,
  data: Partial<CreateRentalData>
): Promise<RentTransaction> => {
  const response = await apiService.put<RentTransaction>(
    API_CONFIG.ENDPOINTS.TRANSACTIONS.RENTAL_DETAIL(id),
    data
  );

  if (!response.success) {
    throw new Error(response.message || "Failed to update rental");
  }

  return response.data!;
};

export const deletePurchase = async (id: string): Promise<void> => {
  const response = await apiService.delete(
    API_CONFIG.ENDPOINTS.TRANSACTIONS.PURCHASE_DETAIL(id)
  );

  if (!response.success) {
    throw new Error(response.message || "Failed to delete purchase");
  }
};

export const deleteRental = async (id: string): Promise<void> => {
  const response = await apiService.delete(
    API_CONFIG.ENDPOINTS.TRANSACTIONS.RENTAL_DETAIL(id)
  );

  if (!response.success) {
    throw new Error(response.message || "Failed to delete rental");
  }
};
