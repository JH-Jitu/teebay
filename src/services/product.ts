

import { API_CONFIG } from "@/src/config/api";
import { APP_CONFIG } from "@/src/config/app";
import type {
  Category,
  PaginatedResponse,
  Product,
  ProductCreateData,
  ProductFilters,
} from "@/src/types";
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

      const response = await apiService.get<PaginatedResponse<Product>>(
        `${API_CONFIG.ENDPOINTS.PRODUCTS.LIST}?${params.toString()}`
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch products");
      }

      return response.data;
    } catch (error) {
      console.error("Get products error:", error);
      throw error;
    }
  }

  
  async getProduct(id: string): Promise<Product> {
    try {
      const response = await apiService.get<Product>(
        API_CONFIG.ENDPOINTS.PRODUCTS.DETAIL(id)
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch product");
      }

      return response.data;
    } catch (error) {
      console.error("Get product error:", error);
      throw error;
    }
  }

  
  async createProduct(data: ProductCreateData): Promise<Product> {
    try {
      const response = await apiService.post<Product>(
        API_CONFIG.ENDPOINTS.PRODUCTS.CREATE,
        data
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to create product");
      }

      return response.data;
    } catch (error) {
      console.error("Create product error:", error);
      throw error;
    }
  }

  
  async updateProduct(
    id: string,
    data: Partial<ProductCreateData>
  ): Promise<Product> {
    try {
      const response = await apiService.patch<Product>(
        API_CONFIG.ENDPOINTS.PRODUCTS.UPDATE(id),
        data
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to update product");
      }

      return response.data;
    } catch (error) {
      console.error("Update product error:", error);
      throw error;
    }
  }

  
  async deleteProduct(id: string): Promise<void> {
    try {
      const response = await apiService.delete(
        API_CONFIG.ENDPOINTS.PRODUCTS.DELETE(id)
      );

      if (!response.success) {
        throw new Error(response.message || "Failed to delete product");
      }
    } catch (error) {
      console.error("Delete product error:", error);
      throw error;
    }
  }

  
  async uploadProductImages(
    productId: string,
    images: string[],
    onProgress?: (progress: number) => void
  ): Promise<string[]> {
    try {
      const formData = new FormData();

      images.forEach((imageUri, index) => {
        formData.append("images", {
          uri: imageUri,
          type: "image/jpeg",
          name: `product_image_${index}.jpg`,
        } as any);
      });

      const response = await apiService.uploadFile<{ images: string[] }>(
        API_CONFIG.ENDPOINTS.PRODUCTS.IMAGES(productId),
        formData,
        onProgress
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to upload images");
      }

      return response.data.images;
    } catch (error) {
      console.error("Upload product images error:", error);
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

      const response = await apiService.get<PaginatedResponse<Product>>(
        `${API_CONFIG.ENDPOINTS.PRODUCTS.MY_PRODUCTS}?${params.toString()}`
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch my products");
      }

      return response.data;
    } catch (error) {
      console.error("Get my products error:", error);
      throw error;
    }
  }

  
  async addToFavorites(productId: string): Promise<void> {
    try {
      const response = await apiService.post(
        API_CONFIG.ENDPOINTS.PRODUCTS.FAVORITES,
        {
          product_id: productId,
        }
      );

      if (!response.success) {
        throw new Error(response.message || "Failed to add to favorites");
      }
    } catch (error) {
      console.error("Add to favorites error:", error);
      throw error;
    }
  }

  
  async removeFromFavorites(productId: string): Promise<void> {
    try {
      const response = await apiService.delete(
        `${API_CONFIG.ENDPOINTS.PRODUCTS.FAVORITES}?product_id=${productId}`
      );

      if (!response.success) {
        throw new Error(response.message || "Failed to remove from favorites");
      }
    } catch (error) {
      console.error("Remove from favorites error:", error);
      throw error;
    }
  }

  
  async getFavoriteProducts(
    page = 1,
    pageSize = APP_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE
  ): Promise<PaginatedResponse<Product>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });

      const response = await apiService.get<PaginatedResponse<Product>>(
        `${API_CONFIG.ENDPOINTS.PRODUCTS.FAVORITES}?${params.toString()}`
      );

      if (!response.success || !response.data) {
        throw new Error(
          response.message || "Failed to fetch favorite products"
        );
      }

      return response.data;
    } catch (error) {
      console.error("Get favorite products error:", error);
      throw error;
    }
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
      const response = await apiService.get<Category[]>(
        API_CONFIG.ENDPOINTS.CATEGORIES.LIST
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch categories");
      }

      return response.data;
    } catch (error) {
      console.error("Get categories error:", error);
      throw error;
    }
  }

  
  async getCategory(id: string): Promise<Category> {
    try {
      const response = await apiService.get<Category>(
        API_CONFIG.ENDPOINTS.CATEGORIES.DETAIL(id)
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch category");
      }

      return response.data;
    } catch (error) {
      console.error("Get category error:", error);
      throw error;
    }
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
}


export const productService = new ProductService();
export default productService;
