function resolveDevBaseUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (envUrl && typeof envUrl === "string" && envUrl.length > 0) return envUrl;
  return "http://192.168.0.113:8000/api";
}

export const API_CONFIG = {
  BASE_URL: __DEV__ ? resolveDevBaseUrl() : "https://your-production-api.com",

  TIMEOUT: 10000,

  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,

  CACHE_TIME: 5 * 60 * 1000,
  STALE_TIME: 1 * 60 * 1000,

  ENDPOINTS: {
    AUTH: {
      LOGIN: "/users/login/",
      REGISTER: "/users/register/",
    },

    PRODUCTS: {
      LIST: "/products/",
      CREATE: "/products/",
      DETAIL: (id: string) => `/products/${id}/`,
      UPDATE: (id: string) => `/products/${id}/`,
      DELETE: (id: string) => `/products/${id}/`,
    },

    CATEGORIES: {
      LIST: "/products/categories/",
    },

    TRANSACTIONS: {
      PURCHASES: "/transactions/purchases/",
      RENTALS: "/transactions/rentals/",
      PURCHASE_DETAIL: (id: string) => `/transactions/purchases/${id}/`,
      RENTAL_DETAIL: (id: string) => `/transactions/rentals/${id}/`,
    },

    USERS: {
      LIST: "/users/",
    },
  },
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const CONTENT_TYPES = {
  JSON: "application/json",
  FORM_DATA: "multipart/form-data",
  URL_ENCODED: "application/x-www-form-urlencoded",
} as const;
