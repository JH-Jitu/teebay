import { API_CONFIG, HTTP_STATUS } from "@/src/config/api";
import type { ApiError, ApiResponse } from "@/src/types";
import axios, { AxiosInstance, isAxiosError } from "axios";

// Simple axios instance without authentication complexity
let axiosInstance: AxiosInstance | null = null;

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
  }
  return axiosInstance;
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

// HTTP Methods
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

export const del = async <T>(
  url: string,
  data?: unknown
): Promise<ApiResponse<T>> => {
  try {
    const instance = getAxiosInstance();
    const response = await instance.delete(url, { data });
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

// API Service object
export const apiService = {
  get,
  post,
  put,
  patch,
  delete: del,
  uploadFile,
  downloadFile,
};

export default apiService;
