import { getStoredFCMToken } from "@/src/services/notifications";
import type { RegisterData, User } from "@/src/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

interface SimpleAuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  biometricEnabled: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  enableBiometric: () => Promise<void>;
  disableBiometric: (action: "disable" | "remove") => Promise<void>;
  setLoading: (loading: boolean) => void;
  clearError: () => void;
}

const apiCall = async (endpoint: string, method: string, data?: any) => {
  const baseUrl =
    process.env.EXPO_PUBLIC_API_BASE_URL || "http://192.168.0.113:8000/api";

  console.log(`API Call: ${method} ${baseUrl}${endpoint}`, data);

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    console.log(`API Response: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error: ${response.status} - ${errorText}`);
      throw new Error(
        `Login failed: ${response.status} ${response.statusText}`
      );
    }

    const result = await response.json();
    console.log("API Success:", result);
    return result;
  } catch (error) {
    console.error("API Call Error:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network error. Please check your connection.");
  }
};

export const useAuthStore = create<SimpleAuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  biometricEnabled: false,
  error: null,

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });

      const fcmToken = await getStoredFCMToken();

      const response = await apiCall("/users/login/", "POST", {
        email,
        password,
        fcm_token: fcmToken || "",
      });

      // Extract user from login response
      const userData = response.user;

      await AsyncStorage.setItem("teebay_user", JSON.stringify(userData));
      await AsyncStorage.setItem("teebay_login_time", new Date().toISOString());

      set({
        user: userData,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      set({
        isLoading: false,
        error: errorMessage,
        isAuthenticated: false,
        user: null,
      });
      throw error;
    }
  },

  register: async (userData: RegisterData) => {
    try {
      set({ isLoading: true, error: null });

      const fcmToken = await getStoredFCMToken();

      const response = await apiCall("/users/register/", "POST", {
        ...userData,
        firebase_console_manager_token: fcmToken || "",
      });

      // Extract user from register response (assuming similar structure)
      const user = response.user || response;

      await AsyncStorage.setItem("teebay_user", JSON.stringify(user));
      await AsyncStorage.setItem("teebay_login_time", new Date().toISOString());

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Registration failed";
      set({
        isLoading: false,
        error: errorMessage,
        isAuthenticated: false,
        user: null,
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true });

      await AsyncStorage.multiRemove(["teebay_user", "teebay_login_time"]);

      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      console.warn("Logout storage clear error:", error);
    }
  },

  initializeAuth: async () => {
    try {
      set({ isLoading: true });

      const [userString, loginTimeString, biometricEnabled] =
        await AsyncStorage.multiGet([
          "teebay_user",
          "teebay_login_time",
          "teebay_biometric_enabled",
        ]);

      const user = userString[1] ? JSON.parse(userString[1]) : null;
      const loginTime = loginTimeString[1]
        ? new Date(loginTimeString[1])
        : null;
      const biometric = biometricEnabled[1] === "true";

      const isValid =
        loginTime && Date.now() - loginTime.getTime() < 7 * 24 * 60 * 60 * 1000;

      if (user && isValid) {
        set({
          user,
          isAuthenticated: true,
          biometricEnabled: biometric,
          isLoading: false,
          error: null,
        });
      } else {
        await AsyncStorage.multiRemove(["teebay_user", "teebay_login_time"]);
        set({
          user: null,
          isAuthenticated: false,
          biometricEnabled: false,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        biometricEnabled: false,
        isLoading: false,
        error: null,
      });
      console.warn("Auth initialization error:", error);
    }
  },

  enableBiometric: async () => {
    try {
      const { user } = get();
      if (!user) return;

      await AsyncStorage.multiSet([
        ["teebay_biometric_enabled", "true"],
        ["teebay_biometric_email", user.email],
        ["teebay_biometric_password", user.password],
      ]);

      set({ biometricEnabled: true });
    } catch (error) {
      console.warn("Enable biometric error:", error);
      throw error;
    }
  },

  disableBiometric: async (action: "disable" | "remove") => {
    try {
      if (action === "remove") {
        await AsyncStorage.multiRemove([
          "teebay_biometric_enabled",
          "teebay_biometric_email",
          "teebay_biometric_password",
        ]);
      } else {
        await AsyncStorage.multiRemove(["teebay_biometric_enabled"]);
      }

      set({ biometricEnabled: false });
    } catch (error) {
      console.warn("Disable biometric error:", error);
      throw error;
    }
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  clearError: () => {
    set({ error: null });
  },
}));

export const useAuth = () =>
  useAuthStore((state) => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    biometricEnabled: state.biometricEnabled,
    error: state.error,
  }));

export const useAuthActions = () =>
  useAuthStore((state) => ({
    login: state.login,
    register: state.register,
    logout: state.logout,
    initializeAuth: state.initializeAuth,
    enableBiometric: state.enableBiometric,
    clearError: state.clearError,
  }));
