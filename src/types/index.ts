





export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  profilePicture?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  biometricEnabled: boolean;
  lastLoginDate?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
}

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
  biometryType?: "TouchID" | "FaceID" | "Fingerprint" | "None";
}





export type CategoryName =
  | "ELECTRONICS"
  | "FURNITURE"
  | "HOME APPLIANCES"
  | "SPORTING GOODS"
  | "OUTDOOR"
  | "TOYS";

export interface Category {
  id: string;
  name: CategoryName;
  displayName: string;
  icon?: string;
}

export interface ProductImage {
  id: string;
  url: string;
  thumbnailUrl?: string;
  alt?: string;
  order: number;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  categories: Category[];
  images: ProductImage[];
  purchasePrice?: number;
  rentPrice?: number;
  rentType?: "HOURLY" | "DAILY" | "WEEKLY" | "MONTHLY";
  availableForSale: boolean;
  availableForRent: boolean;
  isActive: boolean;
  condition: "NEW" | "LIKE_NEW" | "GOOD" | "FAIR" | "POOR";
  owner: User;
  ownerId: string;
  location?: string;
  viewCount: number;
  favoriteCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCreateData {
  title: string;
  description: string;
  categoryIds: string[];
  images: string[];
  purchasePrice?: number;
  rentPrice?: number;
  rentType?: "HOURLY" | "DAILY" | "WEEKLY" | "MONTHLY";
  availableForSale: boolean;
  availableForRent: boolean;
  condition: "NEW" | "LIKE_NEW" | "GOOD" | "FAIR" | "POOR";
  location?: string;
}

export interface ProductFilters {
  categories?: string[];
  minPrice?: number;
  maxPrice?: number;
  condition?: string[];
  availableForSale?: boolean;
  availableForRent?: boolean;
  location?: string;
  search?: string;
}





export interface BaseTransaction {
  id: string;
  productId: string;
  product: Product;
  buyerId: string;
  buyer: User;
  sellerId: string;
  seller: User;
  amount: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "RETURNED";
  createdAt: string;
  updatedAt: string;
}

export interface BuyTransaction extends BaseTransaction {
  type: "BUY";
  shippingAddress?: string;
  trackingNumber?: string;
  deliveredAt?: string;
}

export interface RentTransaction extends BaseTransaction {
  type: "RENT";
  rentType: "HOURLY" | "DAILY" | "WEEKLY" | "MONTHLY";
  startDate: string;
  endDate: string;
  duration: number;
  returnedAt?: string;
  securityDeposit?: number;
  lateReturnFee?: number;
}

export type Transaction = BuyTransaction | RentTransaction;

export interface TransactionHistory {
  bought: BuyTransaction[];
  sold: BuyTransaction[];
  borrowed: RentTransaction[];
  lent: RentTransaction[];
}





export interface ApiResponse<T> {
  data: T | null;
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  status?: number;
  error?: ApiError;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  next?: string;
  previous?: string;
  totalPages: number;
  currentPage: number;
}

export interface ApiError {
  message: string;
  code?: string;
  field?: string;
  details?: Record<string, unknown>;
}





export interface FormStep {
  id: string;
  title: string;
  description?: string;
  isValid: boolean;
  isCompleted: boolean;
}

export interface MultiStepFormState {
  currentStep: number;
  steps: FormStep[];
  formData: Record<string, unknown>;
  canGoNext: boolean;
  canGoPrevious: boolean;
}

export interface FormFieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: unknown) => string | undefined;
}





export interface NotificationPayload {
  productId?: string;
  transactionId?: string;
  type: "PRODUCT_SOLD" | "PRODUCT_RENTED" | "TRANSACTION_UPDATE" | "REMINDER";
  title: string;
  body: string;
  data?: Record<string, string>;
}

export interface PushNotification {
  id: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  isRead: boolean;
  createdAt: string;
}





export interface AppSettings {
  theme: "light" | "dark" | "system";
  language: "en" | "es" | "fr";
  currency: "USD" | "EUR" | "GBP";
  pushNotificationsEnabled: boolean;
  biometricAuthEnabled: boolean;
  autoLoginEnabled: boolean;
}

export interface AppState {
  isInitialized: boolean;
  isOnline: boolean;
  settings: AppSettings;
  lastActiveDate: string;
}





export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  ProductDetails: { productId: string };
  ProductCreate: undefined;
  ProductEdit: { productId: string };
  Profile: { userId?: string };
  TransactionDetails: { transactionId: string };
  Settings: undefined;
};

export type TabParamList = {
  Home: undefined;
  Browse: undefined;
  Create: undefined;
  Transactions: undefined;
  Profile: undefined;
};





export interface ImageCacheConfig {
  maxAge: number;
  maxSize: number;
  quality: number;
}

export interface ListOptimization {
  itemHeight: number;
  getItemLayout?: (
    data: unknown,
    index: number
  ) => { length: number; offset: number; index: number };
  keyExtractor: (item: unknown, index: number) => string;
  windowSize?: number;
  initialNumToRender?: number;
  maxToRenderPerBatch?: number;
}





export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type LoadingState = "idle" | "loading" | "success" | "error";
export type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated?: string;
};
