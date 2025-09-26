export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  address: string;
  firebase_console_manager_token: string;
  password: string;
  date_joined: string;
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
  first_name: string;
  last_name: string;
  address: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  address: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  address: string;
  firebase_console_manager_token: string;
  password: string;
  date_joined: string;
}

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
  biometryType?: "TouchID" | "FaceID" | "Fingerprint" | "None";
}

export interface AuthInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: string;
  testID?: string;
}

export interface AuthButtonProps {
  title: string;
  onPress: () => void;
  variant: "primary" | "secondary" | "biometric";
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  testID?: string;
}

export interface AuthContainerProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
}

export interface BiometricPromptProps {
  visible: boolean;
  onEnable: () => void;
  onSkip: () => void;
  onClose: () => void;
}

export interface BiometricCapabilities {
  hasHardware: boolean;
  hasFingerprint: boolean;
  hasFaceID: boolean;
  isEnrolled: boolean;
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
  seller: string | number;
  title: string;
  description: string;
  categories: string[];
  product_image?: string;
  purchase_price?: string;
  rent_price?: string;
  rent_option?: "hour" | "day" | "week" | "month";
  date_posted: string;

  images?: ProductImage[];
  purchasePrice?: number;
  rentPrice?: number;
  rentType?: "HOURLY" | "DAILY" | "WEEKLY" | "MONTHLY";
  availableForSale?: boolean;
  availableForRent?: boolean;
  isActive?: boolean;
  condition?: "NEW" | "LIKE_NEW" | "GOOD" | "FAIR" | "POOR";
  owner?: User;
  ownerId?: string;
  location?: string;
  viewCount?: number;
  favoriteCount?: number;
  createdAt?: string;
  updatedAt?: string;
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

export interface PurchaseApiResponse {
  id: number;
  buyer: number;
  seller: number;
  product: number;
  purchase_date: string;
}

export interface RentalApiResponse {
  id: number;
  renter: number;
  seller: number;
  product: number;
  rent_option: "hour" | "day" | "week" | "month";
  rent_period_start_date: string;
  rent_period_end_date: string;
  total_price: string;
  rent_date: string;
}

export interface BaseTransaction {
  id: string;
  productId: string;
  product?: Product;
  sellerId: string;
  seller?: User;
  createdAt: string;
  updatedAt: string;
  amount?: number;
  status?: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "RETURNED";
}

export interface BuyTransaction extends BaseTransaction {
  type: "BUY";
  buyerId: string;
  buyer?: User;
  purchase_date: string;
  rent_date?: never;
  rent_option?: never;
  rent_period_start_date?: never;
  rent_period_end_date?: never;
  total_price?: never;
  renterId?: never;
  renter?: never;
}

export interface RentTransaction extends BaseTransaction {
  type: "RENT";
  renterId: string;
  renter?: User;
  rent_option: "hour" | "day" | "week" | "month";
  rent_period_start_date: string;
  rent_period_end_date: string;
  total_price: string;
  rent_date: string;
  purchase_date?: never;
  buyerId?: never;
  buyer?: never;
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
