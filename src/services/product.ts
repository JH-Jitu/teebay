import { API_CONFIG } from "@/src/config/api";
import { APP_CONFIG } from "@/src/config/app";
import type {
  Category,
  PaginatedResponse,
  Product,
  ProductCreateData,
  ProductFilters,
  PurchaseApiResponse,
  RentalApiResponse,
} from "@/src/types";
import {
  transformBackendProduct,
  transformToBackendProduct,
} from "@/src/utils/productTransform";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiService } from "./api";

class ProductService {
  async getProducts(
    page = 1,
    pageSize = APP_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE,
    filters?: ProductFilters
  ): Promise<PaginatedResponse<Product>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });

      if (filters) {
        if (filters.search) {
          params.append("search", filters.search);
        }
        if (filters.categories && filters.categories.length > 0) {
          filters.categories.forEach((categoryId) => {
            params.append("categories", categoryId);
          });
        }
        if (filters.minPrice !== undefined) {
          params.append("min_price", filters.minPrice.toString());
        }
        if (filters.maxPrice !== undefined) {
          params.append("max_price", filters.maxPrice.toString());
        }
        if (filters.condition && filters.condition.length > 0) {
          filters.condition.forEach((condition) => {
            params.append("condition", condition);
          });
        }
        if (filters.availableForSale !== undefined) {
          params.append(
            "available_for_sale",
            filters.availableForSale.toString()
          );
        }
        if (filters.availableForRent !== undefined) {
          params.append(
            "available_for_rent",
            filters.availableForRent.toString()
          );
        }
        if (filters.location) {
          params.append("location", filters.location);
        }
      }

      const response = await apiService.get<Product[]>(
        `${API_CONFIG.ENDPOINTS.PRODUCTS.LIST}?${params.toString()}`
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch products");
      }

      // Backend returns a simple array, transform to paginated format
      const products = Array.isArray(response.data)
        ? response.data.map(transformBackendProduct)
        : [];

      const transformedData: PaginatedResponse<Product> = {
        count: products.length,
        next: undefined,
        previous: undefined,
        currentPage: page,
        totalPages: 1,
        data: products,
      };

      return transformedData;
    } catch (error) {
      console.error("Get products error:", error);
      throw error;
    }
  }

  async getProduct(id: string): Promise<Product> {
    try {
      const response = await apiService.get<any>(
        API_CONFIG.ENDPOINTS.PRODUCTS.DETAIL(id)
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch product");
      }

      return transformBackendProduct(response.data);
    } catch (error) {
      console.error("Get product error:", error);
      throw error;
    }
  }

  async createProduct(
    data: ProductCreateData,
    seller?: string
  ): Promise<Product> {
    try {
      console.log("Creating product with data:", data);

      // If there's an image, we need to use multipart form data
      if (
        data.images &&
        data.images.length > 0 &&
        data.images[0].startsWith("file://")
      ) {
        console.log("Using multipart form data for image upload");
        return await this.createProductWithImage(data, seller);
      }

      // Transform frontend data to backend format
      const backendData = transformToBackendProduct(data, seller);
      console.log("Transformed backend data:", backendData);

      const response = await apiService.post<any>(
        API_CONFIG.ENDPOINTS.PRODUCTS.CREATE,
        backendData
      );

      console.log("Product creation response:", response);

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to create product");
      }

      return transformBackendProduct(response.data);
    } catch (error) {
      console.error("Create product error:", error);
      throw error;
    }
  }

  private async createProductWithImage(
    data: ProductCreateData,
    seller?: string
  ): Promise<Product> {
    try {
      console.log("Creating product with image, data:", data);
      const formData = new FormData();

      // Add product fields
      formData.append("title", data.title);
      formData.append("description", data.description);

      if (data.categoryIds && Array.isArray(data.categoryIds)) {
        data.categoryIds.forEach((category: string) => {
          formData.append("categories", category);
        });
        console.log("Added categories:", data.categoryIds);
      }

      // Add seller ID (required by the backend)
      if (seller) {
        formData.append("seller", seller);
        console.log("Added seller ID:", seller);
      }

      if (data.purchasePrice) {
        formData.append("purchase_price", data.purchasePrice.toString());
      }

      // Backend requires rent_price and rent_option even when not renting
      if (data.rentPrice) {
        formData.append("rent_price", data.rentPrice.toString());
      } else {
        formData.append("rent_price", "0.00"); // Default value
      }

      if (data.rentType) {
        // Transform frontend rentType to backend rent_option
        const rentOption = data.rentType.toLowerCase().replace("ly", ""); // DAILY -> day, HOURLY -> hour
        formData.append(
          "rent_option",
          rentOption === "hour"
            ? "hour"
            : rentOption === "dai"
            ? "day"
            : rentOption === "week"
            ? "week"
            : "day"
        );
      } else {
        formData.append("rent_option", "day"); // Default value
      }

      // Add image file
      if (data.images && data.images.length > 0) {
        const imageUri = data.images[0];
        const filename = imageUri.split("/").pop() || "product_image.jpg";
        const fileType = filename.split(".").pop() || "jpg";

        formData.append("product_image", {
          uri: imageUri,
          type: `image/${fileType}`,
          name: filename,
        } as any);
      }

      console.log(
        "Submitting FormData to:",
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS.CREATE}`
      );

      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS.CREATE}`,
        {
          method: "POST",
          // DO NOT set Content-Type for FormData - let fetch set it automatically with boundary
          body: formData,
        }
      );

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(
          `Failed to create product: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();
      console.log("Success response:", result);
      return transformBackendProduct(result);
    } catch (error) {
      console.error("Create product with image error:", error);
      throw error;
    }
  }

  async updateProduct(
    id: string,
    data: Partial<ProductCreateData>
  ): Promise<Product> {
    try {
      // If there's a new image, we need to use multipart form data
      if (
        data.images &&
        data.images.length > 0 &&
        data.images[0].startsWith("file://")
      ) {
        return await this.updateProductWithImage(id, data);
      }

      // Transform frontend data to backend format
      const backendData = transformToBackendProduct(data);

      // Add user ID to the request for authentication
      const userData = await AsyncStorage.getItem("teebay_user");
      if (userData) {
        const user = JSON.parse(userData);
        backendData.seller = user.id;
      }

      const response = await apiService.patch<any>(
        API_CONFIG.ENDPOINTS.PRODUCTS.UPDATE(id),
        backendData
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to update product");
      }

      return transformBackendProduct(response.data);
    } catch (error) {
      console.error("Update product error:", error);
      throw error;
    }
  }

  private async updateProductWithImage(
    id: string,
    data: Partial<ProductCreateData>
  ): Promise<Product> {
    try {
      const formData = new FormData();

      // Add user ID for authentication
      const userData = await AsyncStorage.getItem("teebay_user");
      if (userData) {
        const user = JSON.parse(userData);
        formData.append("seller", user.id.toString());
      }

      // Add product fields
      if (data.title) formData.append("title", data.title);
      if (data.description) formData.append("description", data.description);

      if (data.categoryIds && Array.isArray(data.categoryIds)) {
        data.categoryIds.forEach((category: string) => {
          formData.append("categories", category);
        });
      }

      if (data.purchasePrice) {
        formData.append("purchase_price", data.purchasePrice.toString());
      }

      if (data.rentPrice) {
        formData.append("rent_price", data.rentPrice.toString());
      }

      if (data.rentType) {
        // Transform frontend rentType to backend rent_option
        const rentOption = data.rentType.toLowerCase().replace("ly", ""); // DAILY -> day, HOURLY -> hour
        formData.append(
          "rent_option",
          rentOption === "hour"
            ? "hour"
            : rentOption === "dai"
            ? "day"
            : rentOption === "week"
            ? "week"
            : "day"
        );
      }

      // Add image file
      if (data.images && data.images.length > 0) {
        const imageUri = data.images[0];
        const filename = imageUri.split("/").pop() || "product_image.jpg";
        const fileType = filename.split(".").pop() || "jpg";

        formData.append("product_image", {
          uri: imageUri,
          type: `image/${fileType}`,
          name: filename,
        } as any);
      }

      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS.UPDATE(id)}`,
        {
          method: "PATCH",
          // DO NOT set Content-Type for FormData - let fetch set it automatically
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to update product: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();
      return transformBackendProduct(result);
    } catch (error) {
      console.error("Update product with image error:", error);
      throw error;
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      // Add user ID for authentication
      const userData = await AsyncStorage.getItem("teebay_user");
      if (userData) {
        const user = JSON.parse(userData);
        // For DELETE requests, we need to include the user ID in the request body
        const response = await apiService.delete(
          API_CONFIG.ENDPOINTS.PRODUCTS.DELETE(id),
          { seller: user.id }
        );

        if (!response.success) {
          throw new Error(response.message || "Failed to delete product");
        }
      } else {
        throw new Error("User not authenticated");
      }
    } catch (error) {
      console.error("Delete product error:", error);
      throw error;
    }
  }

  async uploadProductImage(
    productId: string,
    imageUri: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      const formData = new FormData();

      const filename = imageUri.split("/").pop() || "product_image.jpg";
      const fileType = filename.split(".").pop() || "jpg";

      formData.append("product_image", {
        uri: imageUri,
        type: `image/${fileType}`,
        name: filename,
      } as any);

      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS.UPDATE(
          productId
        )}`,
        {
          method: "PATCH",
          // DO NOT set Content-Type for FormData - let fetch set it automatically
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to upload image: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();
      return result.product_image || imageUri;
    } catch (error) {
      console.error("Upload product image error:", error);
      throw error;
    }
  }

  async getMyProducts(
    page = 1,
    pageSize = APP_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE
  ): Promise<PaginatedResponse<Product>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });

      // Use the main products endpoint and filter by current user on frontend
      const response = await apiService.get<PaginatedResponse<any>>(
        `${API_CONFIG.ENDPOINTS.PRODUCTS.LIST}?${params.toString()}`
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch my products");
      }

      // Transform backend response to frontend format
      const transformedData = {
        ...response.data,
        data: response.data.data?.map(transformBackendProduct) || [],
      };

      return transformedData;
    } catch (error) {
      console.error("Get my products error:", error);
      throw error;
    }
  }

  async addToFavorites(productId: string): Promise<void> {
    throw new Error("Favorites functionality not implemented in backend");
  }

  async removeFromFavorites(productId: string): Promise<void> {
    throw new Error("Favorites functionality not implemented in backend");
  }

  async getFavoriteProducts(
    page = 1,
    pageSize = APP_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE
  ): Promise<PaginatedResponse<Product>> {
    throw new Error("Favorites functionality not implemented in backend");
  }

  async searchProducts(
    query: string,
    page = 1,
    pageSize = APP_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE,
    filters?: Omit<ProductFilters, "search">
  ): Promise<PaginatedResponse<Product>> {
    try {
      return await this.getProducts(page, pageSize, {
        ...filters,
        search: query,
      });
    } catch (error) {
      console.error("Search products error:", error);
      throw error;
    }
  }

  async getCategories(): Promise<Category[]> {
    try {
      const response = await apiService.get<{ value: string; label: string }[]>(
        API_CONFIG.ENDPOINTS.CATEGORIES.LIST
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch categories");
      }

      // Transform backend response to frontend Category interface
      const categories: Category[] = response.data.map((backendCategory) => ({
        id: backendCategory.value,
        name: backendCategory.value.toUpperCase().replace("_", " ") as any,
        displayName: backendCategory.label,
        icon: this.getCategoryIcon(backendCategory.value),
      }));

      return categories;
    } catch (error) {
      console.error("Get categories error:", error);
      throw error;
    }
  }

  // Helper function to map category names to icons
  private getCategoryIcon(categoryValue: string): string {
    const iconMap: Record<string, string> = {
      electronics: "smartphone",
      furniture: "chair",
      home_appliances: "washing-machine",
      sporting_goods: "football",
      outdoor: "tree",
      toys: "puzzle",
    };
    return iconMap[categoryValue] || "tag";
  }

  async getCategory(id: string): Promise<Category> {
    // Backend returns categories as strings, not objects with details
    throw new Error("Individual category details not supported by backend");
  }

  async getProductsByCategory(
    categoryId: string,
    page = 1,
    pageSize = APP_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE
  ): Promise<PaginatedResponse<Product>> {
    try {
      return await this.getProducts(page, pageSize, {
        categories: [categoryId],
      });
    } catch (error) {
      console.error("Get products by category error:", error);
      throw error;
    }
  }

  async getFeaturedProducts(
    page = 1,
    pageSize = APP_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE
  ): Promise<PaginatedResponse<Product>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
        featured: "true",
      });

      const response = await apiService.get<PaginatedResponse<Product>>(
        `${API_CONFIG.ENDPOINTS.PRODUCTS.LIST}?${params.toString()}`
      );

      if (!response.success || !response.data) {
        throw new Error(
          response.message || "Failed to fetch featured products"
        );
      }

      return response.data;
    } catch (error) {
      console.error("Get featured products error:", error);
      throw error;
    }
  }

  async getSimilarProducts(productId: string, limit = 10): Promise<Product[]> {
    try {
      const params = new URLSearchParams({
        similar_to: productId,
        limit: limit.toString(),
      });

      const response = await apiService.get<Product[]>(
        `${API_CONFIG.ENDPOINTS.PRODUCTS.LIST}?${params.toString()}`
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch similar products");
      }

      return response.data;
    } catch (error) {
      console.error("Get similar products error:", error);
      throw error;
    }
  }

  // Transaction methods
  async createPurchase(data: { buyer: number; product: number }): Promise<any> {
    try {
      const response = await apiService.post<any>(
        API_CONFIG.ENDPOINTS.TRANSACTIONS.PURCHASES,
        {
          buyer: data.buyer,
          product: data.product,
          // shipping_address: data.shippingAddress,
        }
      );

      console.log({ data, response });

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to create purchase");
      }

      return response.data;
    } catch (error) {
      console.error("Create purchase error:", error);
      throw error;
    }
  }

  async createRental(data: {
    renter: number;
    product: number;
    rent_option: string;
    rent_period_start_date: string;
    rent_period_end_date: string;
  }): Promise<any> {
    try {
      const response = await apiService.post<any>(
        API_CONFIG.ENDPOINTS.TRANSACTIONS.RENTALS,
        {
          renter: data.renter,
          product: data.product,
          rent_option: data.rent_option,
          rent_period_start_date: data.rent_period_start_date,
          rent_period_end_date: data.rent_period_end_date,
        }
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to create rental");
      }

      return response.data;
    } catch (error) {
      console.error("Create rental error:", error);
      throw error;
    }
  }

  async getPurchases(): Promise<{ data: PurchaseApiResponse[] }> {
    try {
      const response = await apiService.get<PurchaseApiResponse[]>(
        API_CONFIG.ENDPOINTS.TRANSACTIONS.PURCHASES
      );

      // Handle both success response and direct array response
      const data = response.success ? response.data : response;
      const purchases = Array.isArray(data) ? data : [];

      return { data: purchases };
    } catch (error) {
      console.error("Get purchases error:", error);
      throw error;
    }
  }

  async getRentals(): Promise<{ data: RentalApiResponse[] }> {
    try {
      const response = await apiService.get<RentalApiResponse[]>(
        API_CONFIG.ENDPOINTS.TRANSACTIONS.RENTALS
      );

      // Handle both success response and direct array response
      const data = response.success ? response.data : response;
      const rentals = Array.isArray(data) ? data : [];

      return { data: rentals };
    } catch (error) {
      console.error("Get rentals error:", error);
      throw error;
    }
  }

  async getPurchase(id: string): Promise<{ data: PurchaseApiResponse }> {
    try {
      const response = await apiService.get<PurchaseApiResponse>(
        API_CONFIG.ENDPOINTS.TRANSACTIONS.PURCHASE_DETAIL(id)
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch purchase");
      }

      return { data: response.data };
    } catch (error) {
      console.error("Get purchase error:", error);
      throw error;
    }
  }

  async getRental(id: string): Promise<{ data: RentalApiResponse }> {
    try {
      const response = await apiService.get<RentalApiResponse>(
        API_CONFIG.ENDPOINTS.TRANSACTIONS.RENTAL_DETAIL(id)
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch rental");
      }

      return { data: response.data };
    } catch (error) {
      console.error("Get rental error:", error);
      throw error;
    }
  }
}

export const productService = new ProductService();
export default productService;
