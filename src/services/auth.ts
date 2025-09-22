

import { API_CONFIG } from "@/src/config/api";
import { APP_CONFIG } from "@/src/config/app";
import type {
  BiometricAuthResult,
  LoginCredentials,
  RegisterData,
  User,
} from "@/src/types";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import { apiService } from "./api";





export const login = async (
  credentials: LoginCredentials
): Promise<{ user: User; token: string; refreshToken: string }> => {
  try {
    
    let response = await apiService.post<any>(
      API_CONFIG.ENDPOINTS.AUTH.LOGIN,
      credentials
    );

    
    if (!response.success && (credentials as any).email) {
      const altPayload = {
        username: (credentials as any).email,
        password: (credentials as any).password,
      };
      const retry = await apiService.post<any>(
        API_CONFIG.ENDPOINTS.AUTH.LOGIN,
        altPayload
      );
      if (retry.success) response = retry;
    }

    if (!response.success || !response.data) {
      const serverDetail = (response as any)?.error?.details;
      const message =
        (typeof serverDetail === "string" && serverDetail) ||
        (serverDetail?.detail as string) ||
        response.message ||
        "Login failed";
      throw new Error(message);
    }

    const data: any = response.data;
    const tokenSource: any = data.tokens || data;
    let token: string | null =
      tokenSource.access ||
      tokenSource.access_token ||
      tokenSource.token ||
      null;
    let refreshToken: string =
      tokenSource.refresh ||
      tokenSource.refresh_token ||
      tokenSource.refreshToken ||
      "";
    let user: User | null =
      data.user || data.profile || data.data?.user || null;

    // If token exists but user missing, fetch profile using the token
    if (token && !user) {
      try {
        await SecureStore.setItemAsync(APP_CONFIG.STORAGE.TOKEN_KEY, token);
        const profileResp = await apiService.get<User>(
          API_CONFIG.ENDPOINTS.AUTH.PROFILE
        );
        if (profileResp.success && profileResp.data) {
          user = profileResp.data;
        }
      } catch {
        // ignore, will be handled below if user remains null
      }
    }

    // Some backends (your DRF setup) return only the user object without tokens
    // Proceed with session/cookie auth path by storing user and empty tokens
    if (!user) {
      throw new Error("Login response missing user profile");
    }

    if (!token) {
      token = "";
      refreshToken = "";
    }

    await storeAuthData(user, token, refreshToken);
    return { user, token, refreshToken };
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const register = async (
  data: RegisterData
): Promise<{ user: User; token: string; refreshToken: string }> => {
  try {
    const response = await apiService.post<{
      user: User;
      access: string;
      refresh: string;
    }>(API_CONFIG.ENDPOINTS.AUTH.REGISTER, data);

    if (!response.success || !response.data) {
      throw new Error(response.message || "Registration failed");
    }

    const { user, access: token, refresh: refreshToken } = response.data;
    await storeAuthData(user, token, refreshToken);
    return { user, token, refreshToken };
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  try {
    const refreshToken = await SecureStore.getItemAsync(
      APP_CONFIG.STORAGE.REFRESH_TOKEN_KEY
    );

    if (refreshToken) {
      await apiService.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT, {
        refresh: refreshToken,
      });
    }
  } catch (error) {
    console.warn("Server logout failed, continuing with local logout:", error);
  } finally {
    await clearAuthData();
  }
};

export const getCurrentUser = async (): Promise<User> => {
  try {
    const response = await apiService.get<any>(
      API_CONFIG.ENDPOINTS.AUTH.PROFILE
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || "Failed to get user profile");
    }

    const data: any = response.data;
    return (data?.user as User) || (data as User);
  } catch (error) {
    console.error("Get current user error:", error);
    throw error;
  }
};

export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  try {
    const response = await apiService.post(
      API_CONFIG.ENDPOINTS.AUTH.CHANGE_PASSWORD,
      {
        old_password: currentPassword,
        new_password: newPassword,
      }
    );

    if (!response.success) {
      throw new Error(response.message || "Failed to change password");
    }
  } catch (error) {
    console.error("Change password error:", error);
    throw error;
  }
};





export const storeAuthData = async (
  user: User,
  token: string,
  refreshToken: string
): Promise<void> => {
  try {
    await Promise.all([
      SecureStore.setItemAsync(
        APP_CONFIG.STORAGE.USER_KEY,
        JSON.stringify(user)
      ),
      SecureStore.setItemAsync(APP_CONFIG.STORAGE.TOKEN_KEY, token),
      SecureStore.setItemAsync(
        APP_CONFIG.STORAGE.REFRESH_TOKEN_KEY,
        refreshToken
      ),
    ]);
  } catch (error) {
    console.error("Error storing auth data:", error);
    throw new Error("Failed to store authentication data");
  }
};

export const clearAuthData = async (): Promise<void> => {
  try {
    await Promise.all([
      SecureStore.deleteItemAsync(APP_CONFIG.STORAGE.USER_KEY),
      SecureStore.deleteItemAsync(APP_CONFIG.STORAGE.TOKEN_KEY),
      SecureStore.deleteItemAsync(APP_CONFIG.STORAGE.REFRESH_TOKEN_KEY),
      SecureStore.deleteItemAsync(APP_CONFIG.STORAGE.BIOMETRIC_KEY),
    ]);
  } catch (error) {
    console.error("Error clearing auth data:", error);
  }
};

export const getStoredAuthData = async (): Promise<{
  user: User | null;
  token: string | null;
  refreshToken: string | null;
}> => {
  try {
    const [userString, token, refreshToken] = await Promise.all([
      SecureStore.getItemAsync(APP_CONFIG.STORAGE.USER_KEY),
      SecureStore.getItemAsync(APP_CONFIG.STORAGE.TOKEN_KEY),
      SecureStore.getItemAsync(APP_CONFIG.STORAGE.REFRESH_TOKEN_KEY),
    ]);

    const user = userString ? JSON.parse(userString) : null;
    return { user, token, refreshToken };
  } catch (error) {
    console.error("Error getting stored auth data:", error);
    return { user: null, token: null, refreshToken: null };
  }
};





export const isBiometricAvailable = async (): Promise<boolean> => {
  try {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return compatible && enrolled;
  } catch {
    return false;
  }
};

export const getBiometricTypes = async (): Promise<
  LocalAuthentication.AuthenticationType[]
> => {
  try {
    return await LocalAuthentication.supportedAuthenticationTypesAsync();
  } catch {
    return [];
  }
};

export const authenticateWithBiometric = async (
  reason = "Authenticate to access your account"
): Promise<BiometricAuthResult> => {
  try {
    const isAvailable = await isBiometricAvailable();
    if (!isAvailable) {
      return {
        success: false,
        error: "Biometric authentication is not available",
        biometryType: "None",
      };
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: reason,
      fallbackLabel: "Use Passcode",
      disableDeviceFallback: false,
    });

    if (result.success) {
      const types = await getBiometricTypes();
      const biometryType = types.includes(
        LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
      )
        ? "FaceID"
        : types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)
        ? "Fingerprint"
        : "TouchID";

      return { success: true, biometryType };
    }

    return {
      success: false,
      error: result.error || "Biometric authentication failed",
      biometryType: "None",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Authentication failed",
      biometryType: "None",
    };
  }
};

export const enableBiometricAuth = async (): Promise<boolean> => {
  try {
    const isAvailable = await isBiometricAvailable();
    if (!isAvailable) {
      throw new Error("Biometric authentication is not available");
    }

    const authResult = await authenticateWithBiometric(
      "Enable biometric authentication for quick access"
    );
    if (!authResult.success) {
      throw new Error(authResult.error || "Biometric authentication failed");
    }

    await SecureStore.setItemAsync(APP_CONFIG.STORAGE.BIOMETRIC_KEY, "true");
    return true;
  } catch (error) {
    console.error("Enable biometric auth error:", error);
    throw error;
  }
};

export const disableBiometricAuth = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(APP_CONFIG.STORAGE.BIOMETRIC_KEY);
  } catch (error) {
    console.error("Disable biometric auth error:", error);
    throw error;
  }
};

export const isBiometricEnabled = async (): Promise<boolean> => {
  try {
    const enabled = await SecureStore.getItemAsync(
      APP_CONFIG.STORAGE.BIOMETRIC_KEY
    );
    return enabled === "true";
  } catch {
    return false;
  }
};

export const autoLoginWithBiometric = async (): Promise<{
  success: boolean;
  user?: User;
  error?: string;
}> => {
  try {
    const isBiometricOn = await isBiometricEnabled();
    if (!isBiometricOn) {
      return { success: false, error: "Biometric authentication not enabled" };
    }

    const authResult = await authenticateWithBiometric(
      "Use biometric authentication to sign in"
    );
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    const { user } = await getStoredAuthData();
    if (!user) {
      return { success: false, error: "No stored user data found" };
    }

    return { success: true, user };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Auto-login failed",
    };
  }
};





export const authService = {
  login,
  register,
  logout,
  getCurrentUser,
  changePassword,
  storeAuthData,
  clearAuthData,
  getStoredAuthData,
  isBiometricAvailable,
  getBiometricTypes,
  authenticateWithBiometric,
  enableBiometricAuth,
  disableBiometricAuth,
  isBiometricEnabled,
  autoLoginWithBiometric,
};

export default authService;
