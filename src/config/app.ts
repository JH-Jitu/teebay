

export const APP_CONFIG = {
  
  NAME: "TeeBay",
  VERSION: "1.0.0",
  PACKAGE_NAME: "com.teebay.appname",

  
  SECURITY: {
    
    ACCESS_TOKEN_KEY: "teebay_access_token",
    REFRESH_TOKEN_KEY: "teebay_refresh_token",
    USER_DATA_KEY: "teebay_user_data",
    BIOMETRIC_KEY: "teebay_biometric_enabled",

    
    TOKEN_REFRESH_BUFFER: 5 * 60 * 1000,

    
    BIOMETRIC_PROMPT: {
      title: "Authenticate",
      subtitle: "Use your biometric to access TeeBay",
      description: "Place your finger on the sensor or look at the camera",
      fallbackLabel: "Use Password",
      cancelLabel: "Cancel",
    },
  },

  
  STORAGE: {
    
    USER_KEY: "teebay_user",
    TOKEN_KEY: "teebay_token",
    REFRESH_TOKEN_KEY: "teebay_refresh_token",
    BIOMETRIC_KEY: "teebay_biometric_enabled",

    
    SETTINGS_KEY: "teebay_settings",
    ONBOARDING_COMPLETED_KEY: "teebay_onboarding_completed",
    LAST_SYNC_KEY: "teebay_last_sync",
    DRAFT_PRODUCT_KEY: "teebay_draft_product",

    
    IMAGE_CACHE_SIZE: 100,
    DATA_CACHE_SIZE: 50,
  },

  
  PERFORMANCE: {
    
    INITIAL_NUM_TO_RENDER: 10,
    MAX_TO_RENDER_PER_BATCH: 5,
    WINDOW_SIZE: 10,

    
    IMAGE_QUALITY: 0.8,
    THUMBNAIL_SIZE: { width: 300, height: 300 },
    LARGE_IMAGE_SIZE: { width: 1200, height: 1200 },

    
    REQUEST_TIMEOUT: 10000,
    UPLOAD_TIMEOUT: 30000,

    
    ANIMATION_DURATION: 300,
    SPRING_CONFIG: {
      damping: 15,
      stiffness: 150,
    },
  },

  
  UI: {
    
    SPACING: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
    },

    
    BORDER_RADIUS: {
      sm: 4,
      md: 8,
      lg: 12,
      xl: 16,
      round: 9999,
    },

    
    SHADOWS: {
      sm: {
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      },
      md: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
      },
      lg: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
      },
    },

    
    FONT_SIZES: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 32,
    },

    
    ICON_SIZES: {
      xs: 16,
      sm: 20,
      md: 24,
      lg: 32,
      xl: 48,
    },
  },

  
  FORMS: {
    
    MIN_PASSWORD_LENGTH: 8,
    MAX_TITLE_LENGTH: 100,
    MAX_DESCRIPTION_LENGTH: 1000,
    MAX_IMAGES_PER_PRODUCT: 5,

    
    MAX_IMAGE_SIZE: 5 * 1024 * 1024, 
    ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],

    
    STEPS: {
      PRODUCT_CREATE: [
        { id: "basic", title: "Basic Information", required: true },
        { id: "categories", title: "Categories", required: true },
        { id: "pricing", title: "Pricing", required: true },
        { id: "images", title: "Images", required: false },
        { id: "review", title: "Review", required: true },
      ],
    },

    
    AUTO_SAVE_INTERVAL: 30000, 
  },

  
  CATEGORIES: [
    {
      id: "electronics",
      name: "ELECTRONICS",
      displayName: "Electronics",
      icon: "smartphone",
    },
    {
      id: "furniture",
      name: "FURNITURE",
      displayName: "Furniture",
      icon: "chair",
    },
    {
      id: "home-appliances",
      name: "HOME APPLIANCES",
      displayName: "Home Appliances",
      icon: "washing-machine",
    },
    {
      id: "sporting-goods",
      name: "SPORTING GOODS",
      displayName: "Sporting Goods",
      icon: "football",
    },
    { id: "outdoor", name: "OUTDOOR", displayName: "Outdoor", icon: "tree" },
    { id: "toys", name: "TOYS", displayName: "Toys", icon: "puzzle" },
  ] as const,

  
  RENT_TYPES: [
    { value: "HOURLY", label: "Per Hour" },
    { value: "DAILY", label: "Per Day" },
    { value: "WEEKLY", label: "Per Week" },
    { value: "MONTHLY", label: "Per Month" },
  ] as const,

  
  CONDITIONS: [
    { value: "NEW", label: "New", description: "Brand new, never used" },
    {
      value: "LIKE_NEW",
      label: "Like New",
      description: "Excellent condition, minimal wear",
    },
    {
      value: "GOOD",
      label: "Good",
      description: "Good condition, normal wear",
    },
    {
      value: "FAIR",
      label: "Fair",
      description: "Fair condition, noticeable wear",
    },
    {
      value: "POOR",
      label: "Poor",
      description: "Poor condition, significant wear",
    },
  ] as const,

  
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
  },

  
  ERRORS: {
    NETWORK: "Network error. Please check your connection.",
    TIMEOUT: "Request timed out. Please try again.",
    UNAUTHORIZED: "You are not authorized. Please log in again.",
    FORBIDDEN: "You do not have permission to perform this action.",
    NOT_FOUND: "The requested resource was not found.",
    SERVER_ERROR: "Server error. Please try again later.",
    UNKNOWN: "An unexpected error occurred.",
    BIOMETRIC_NOT_AVAILABLE:
      "Biometric authentication is not available on this device.",
    BIOMETRIC_NOT_ENROLLED:
      "No biometric credentials are enrolled on this device.",
  },
} as const;


export const getEnvironmentConfig = () => {
  return {
    isDevelopment: __DEV__,
    isProduction: !__DEV__,
    enableDebugLogs: __DEV__,
    enablePerformanceMonitoring: !__DEV__,
    enableCrashReporting: !__DEV__,
  };
};
