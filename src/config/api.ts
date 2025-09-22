

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
      REFRESH: "/users/token/refresh/",
      LOGOUT: "/users/logout/",
      PROFILE: "/users/profile/",
      CHANGE_PASSWORD: "/users/change-password/",
    },

    
    PRODUCTS: {
      LIST: "/products/",
      CREATE: "/products/",
      DETAIL: (id: string) => `/products/${id}/`,
      UPDATE: (id: string) => `/products/${id}/`,
      DELETE: (id: string) => `/products/${id}/`,
      IMAGES: (id: string) => `/products/${id}/images/`,
      FAVORITES: "/products/favorites/",
      MY_PRODUCTS: "/products/my-products/",
    },

    
    CATEGORIES: {
      LIST: "/categories/",
      DETAIL: (id: string) => `/categories/${id}/`,
    },

    
    TRANSACTIONS: {
      LIST: "/transactions/",
      CREATE: "/transactions/",
      DETAIL: (id: string) => `/transactions/${id}/`,
      UPDATE: (id: string) => `/transactions/${id}/`,
      HISTORY: "/transactions/history/",
      BUY: "/transactions/buy/",
      RENT: "/transactions/rent/",
    },

    
    USERS: {
      LIST: "/users/",
      DETAIL: (id: string) => `/users/${id}/`,
      UPDATE_PROFILE: "/users/profile/",
    },

    
    NOTIFICATIONS: {
      LIST: "/notifications/",
      MARK_READ: (id: string) => `/notifications/${id}/mark-read/`,
      MARK_ALL_READ: "/notifications/mark-all-read/",
      SETTINGS: "/notifications/settings/",
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
