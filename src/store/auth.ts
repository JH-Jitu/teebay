

import { authService } from "@/src/services/auth";
import type { AuthState, LoginCredentials, RegisterData } from "@/src/types";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface AuthStore {
  
  user: AuthState["user"];
  token: AuthState["token"];
  refreshToken: AuthState["refreshToken"];
  isAuthenticated: AuthState["isAuthenticated"];
  isLoading: AuthState["isLoading"];
  biometricEnabled: AuthState["biometricEnabled"];
  lastLoginDate: AuthState["lastLoginDate"];
  error: string | null;

  
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  enableBiometric: () => Promise<void>;
  disableBiometric: () => Promise<void>;
  autoLoginWithBiometric: () => Promise<boolean>;
  setLoading: (loading: boolean) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>()(
  subscribeWithSelector((set, get) => ({
    
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
    biometricEnabled: false,
    lastLoginDate: undefined,
    error: null,

    
    login: async (credentials: LoginCredentials) => {
      try {
        set({ isLoading: true, error: null });

        const { user, token, refreshToken } = await authService.login(
          credentials
        );

        set({
          user,
          token,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
          lastLoginDate: new Date().toISOString(),
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
          token: null,
          refreshToken: null,
        });
        throw error;
      }
    },

    register: async (data: RegisterData) => {
      try {
        set({ isLoading: true, error: null });

        const { user, token, refreshToken } = await authService.register(data);

        set({
          user,
          token,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
          lastLoginDate: new Date().toISOString(),
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
          token: null,
          refreshToken: null,
        });
        throw error;
      }
    },

    logout: async () => {
      try {
        set({ isLoading: true });

        await authService.logout();

        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          biometricEnabled: false,
          lastLoginDate: undefined,
          error: null,
        });
      } catch (error) {
        
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          biometricEnabled: false,
          lastLoginDate: undefined,
          error: null,
        });
        console.warn("Logout error:", error);
      }
    },

    refreshUser: async () => {
      try {
        const { isAuthenticated } = get();
        if (!isAuthenticated) return;

        set({ isLoading: true, error: null });

        const user = await authService.getCurrentUser();

        set({
          user,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to refresh user";
        set({
          isLoading: false,
          error: errorMessage,
        });

        
        if (error instanceof Error && error.message.includes("Unauthorized")) {
          get().logout();
        }
      }
    },

    initializeAuth: async () => {
      try {
        set({ isLoading: true, error: null });

        const { user, token, refreshToken } =
          await authService.getStoredAuthData();

        if (user && token) {
          
          const biometricEnabled = await authService.isBiometricEnabled();

          set({
            user,
            token,
            refreshToken,
            isAuthenticated: true,
            biometricEnabled,
            isLoading: false,
            error: null,
          });

          
          try {
            await get().refreshUser();
          } catch (error) {
            
            console.warn("Failed to refresh user on init:", error);
          }
        } else {
          set({
            isLoading: false,
            isAuthenticated: false,
            error: null,
          });
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to initialize auth";
        set({
          isLoading: false,
          error: errorMessage,
          isAuthenticated: false,
        });
      }
    },

    enableBiometric: async () => {
      try {
        set({ isLoading: true, error: null });

        const enabled = await authService.enableBiometricAuth();

        set({
          biometricEnabled: enabled,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to enable biometric auth";
        set({
          isLoading: false,
          error: errorMessage,
          biometricEnabled: false,
        });
        throw error;
      }
    },

    disableBiometric: async () => {
      try {
        set({ isLoading: true, error: null });

        await authService.disableBiometricAuth();

        set({
          biometricEnabled: false,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to disable biometric auth";
        set({
          isLoading: false,
          error: errorMessage,
        });
        throw error;
      }
    },

    autoLoginWithBiometric: async () => {
      try {
        set({ isLoading: true, error: null });

        const result = await authService.autoLoginWithBiometric();

        if (result.success && result.user) {
          set({
            user: result.user,
            isAuthenticated: true,
            isLoading: false,
            lastLoginDate: new Date().toISOString(),
            error: null,
          });
          return true;
        } else {
          set({
            isLoading: false,
            error: result.error || "Biometric login failed",
          });
          return false;
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Biometric login failed";
        set({
          isLoading: false,
          error: errorMessage,
        });
        return false;
      }
    },

    setLoading: (loading: boolean) => {
      set({ isLoading: loading });
    },

    clearError: () => {
      set({ error: null });
    },
  }))
);


useAuthStore.subscribe(
  (state) => state.isAuthenticated,
  (isAuthenticated, previousIsAuthenticated) => {
    if (isAuthenticated !== previousIsAuthenticated) {
      console.log("Auth state changed:", { isAuthenticated });

      
      
      
      
    }
  }
);


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
    refreshUser: state.refreshUser,
    initializeAuth: state.initializeAuth,
    enableBiometric: state.enableBiometric,
    disableBiometric: state.disableBiometric,
    autoLoginWithBiometric: state.autoLoginWithBiometric,
    clearError: state.clearError,
  }));
