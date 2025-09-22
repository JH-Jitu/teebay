

import { API_CONFIG, HTTP_STATUS } from "@/src/config/api";
import { APP_CONFIG } from "@/src/config/app";
import type { ApiError, ApiResponse } from "@/src/types";
import axios, { AxiosInstance, isAxiosError } from "axios";
import * as SecureStore from "expo-secure-store";





let axiosInstance: AxiosInstance | null = null;
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];





const getAxiosInstance = (): AxiosInstance => {
  if (!axiosInstance) {
    axiosInstance = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    setupInterceptors();
  }
  return axiosInstance;
};

const setupInterceptors = () => {
  if (!axiosInstance) return;

  axiosInstance.interceptors.request.use(
    async (config) => {
      const token = await getStoredToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve) => {
            refreshSubscribers.push((token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(axiosInstance!.request(originalRequest));
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const newToken = await refreshAuthToken();
          refreshSubscribers.forEach((cb) => cb(newToken));
          refreshSubscribers = [];
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance!.request(originalRequest);
        } catch (refreshError) {
          await clearAuthTokens();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
      return Promise.reject(error);
    }
  );
};

const getStoredToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(APP_CONFIG.STORAGE.TOKEN_KEY);
  } catch {
    return null;
  }
};

const refreshAuthToken = async (): Promise<string> => {
  const refreshToken = await SecureStore.getItemAsync(
    APP_CONFIG.STORAGE.REFRESH_TOKEN_KEY
  );
  if (!refreshToken) throw new Error("No refresh token available");

  const response = await axiosInstance!.post(
    API_CONFIG.ENDPOINTS.AUTH.REFRESH,
    { refresh: refreshToken }
  );
  const { access: newToken } = response.data;
  await SecureStore.setItemAsync(APP_CONFIG.STORAGE.TOKEN_KEY, newToken);
  return newToken;
};

const clearAuthTokens = async (): Promise<void> => {
  try {
    await Promise.all([
      SecureStore.deleteItemAsync(APP_CONFIG.STORAGE.TOKEN_KEY),
      SecureStore.deleteItemAsync(APP_CONFIG.STORAGE.REFRESH_TOKEN_KEY),
      SecureStore.deleteItemAsync(APP_CONFIG.STORAGE.USER_KEY),
    ]);
  } catch (error) {
    console.error("Error clearing auth tokens:", error);
  }
};

const createApiError = (error: any, defaultMessage: string): ApiError => {
  if (isAxiosError(error)) {
    const status = error.response?.status;
    let message = defaultMessage;

    if (error.code === "ECONNABORTED") {
      message = "Request timed out. Please try again.";
    } else if (error.message === "Network Error") {
      message = "Network error. Please check your connection.";
    } else if (status) {
      switch (status) {
        case HTTP_STATUS.UNAUTHORIZED:
          message = "You are not authorized. Please log in again.";
          break;
        case HTTP_STATUS.FORBIDDEN:
          message = "You do not have permission to perform this action.";
          break;
        case HTTP_STATUS.NOT_FOUND:
          message = "The requested resource was not found.";
          break;
        case HTTP_STATUS.INTERNAL_SERVER_ERROR:
          message = "Server error. Please try again later.";
          break;
        default:
          message = error.response?.data?.message || defaultMessage;
      }
    }

    return {
      message,
      code: error.code || status?.toString() || "UNKNOWN",
      details: error.response?.data,
    };
  }

  return {
    message: defaultMessage,
    code: "UNKNOWN",
    details: error,
  };
};





export const get = async <T>(
  url: string,
  params?: Record<string, unknown>
): Promise<ApiResponse<T>> => {
  try {
    const instance = getAxiosInstance();
    const response = await instance.get(url, { params });
    return {
      success: true,
      data: response.data,
      message: "Request successful",
      status: response.status,
    };
  } catch (error) {
    const apiError = createApiError(error, "Failed to fetch data");
    return {
      success: false,
      data: null,
      message: apiError.message,
      error: apiError,
      status: isAxiosError(error) ? error.response?.status : undefined,
    };
  }
};

export const post = async <T>(
  url: string,
  data?: unknown
): Promise<ApiResponse<T>> => {
  try {
    const instance = getAxiosInstance();
    const response = await instance.post(url, data);
    return {
      success: true,
      data: response.data,
      message: "Request successful",
      status: response.status,
    };
  } catch (error) {
    const apiError = createApiError(error, "Failed to create resource");
    return {
      success: false,
      data: null,
      message: apiError.message,
      error: apiError,
      status: isAxiosError(error) ? error.response?.status : undefined,
    };
  }
};

export const put = async <T>(
  url: string,
  data?: unknown
): Promise<ApiResponse<T>> => {
  try {
    const instance = getAxiosInstance();
    const response = await instance.put(url, data);
    return {
      success: true,
      data: response.data,
      message: "Request successful",
      status: response.status,
    };
  } catch (error) {
    const apiError = createApiError(error, "Failed to update resource");
    return {
      success: false,
      data: null,
      message: apiError.message,
      error: apiError,
      status: isAxiosError(error) ? error.response?.status : undefined,
    };
  }
};

export const patch = async <T>(
  url: string,
  data?: unknown
): Promise<ApiResponse<T>> => {
  try {
    const instance = getAxiosInstance();
    const response = await instance.patch(url, data);
    return {
      success: true,
      data: response.data,
      message: "Request successful",
      status: response.status,
    };
  } catch (error) {
    const apiError = createApiError(error, "Failed to update resource");
    return {
      success: false,
      data: null,
      message: apiError.message,
      error: apiError,
      status: isAxiosError(error) ? error.response?.status : undefined,
    };
  }
};

export const del = async <T>(url: string): Promise<ApiResponse<T>> => {
  try {
    const instance = getAxiosInstance();
    const response = await instance.delete(url);
    return {
      success: true,
      data: response.data,
      message: "Request successful",
      status: response.status,
    };
  } catch (error) {
    const apiError = createApiError(error, "Failed to delete resource");
    return {
      success: false,
      data: null,
      message: apiError.message,
      error: apiError,
      status: isAxiosError(error) ? error.response?.status : undefined,
    };
  }
};

export const uploadFile = async (
  url: string,
  file: File | Blob,
  fieldName = "file"
): Promise<ApiResponse<any>> => {
  try {
    const instance = getAxiosInstance();
    const formData = new FormData();
    formData.append(fieldName, file);

    const response = await instance.post(url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return {
      success: true,
      data: response.data,
      message: "File uploaded successfully",
      status: response.status,
    };
  } catch (error) {
    const apiError = createApiError(error, "Failed to upload file");
    return {
      success: false,
      data: null,
      message: apiError.message,
      error: apiError,
      status: isAxiosError(error) ? error.response?.status : undefined,
    };
  }
};

export const downloadFile = async (url: string): Promise<ApiResponse<Blob>> => {
  try {
    const instance = getAxiosInstance();
    const response = await instance.get(url, { responseType: "blob" });
    return {
      success: true,
      data: response.data,
      message: "File downloaded successfully",
      status: response.status,
    };
  } catch (error) {
    const apiError = createApiError(error, "Failed to download file");
    return {
      success: false,
      data: null,
      message: apiError.message,
      error: apiError,
      status: isAxiosError(error) ? error.response?.status : undefined,
    };
  }
};





export const apiService = {
  get,
  post,
  put,
  patch,
  delete: del,
  uploadFile,
  downloadFile,
  clearAuthTokens,
};

export default apiService;
