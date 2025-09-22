

import { queryKeys } from "@/src/config/query";
import { authService } from "@/src/services/auth";
import { useAuthStore } from "@/src/store/auth";
import type { LoginCredentials, RegisterData } from "@/src/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";





export const useAuth = () => {
  const auth = useAuthStore();

  return {
    
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    biometricEnabled: auth.biometricEnabled,
    error: auth.error,
    token: auth.token,

    
    login: auth.login,
    register: auth.register,
    logout: auth.logout,
    refreshUser: auth.refreshUser,
    clearError: auth.clearError,

    
    enableBiometric: auth.enableBiometric,
    disableBiometric: auth.disableBiometric,
    autoLoginWithBiometric: auth.autoLoginWithBiometric,
  };
};

export const useLogin = () => {
  const login = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => login(credentials),
    onSuccess: () => {
      console.log("Login successful");
    },
    onError: (error) => {
      console.error("Login failed:", error);
    },
  });
};

export const useRegister = () => {
  const register = useAuthStore((state) => state.register);

  return useMutation({
    mutationFn: (data: RegisterData) => register(data),
    onSuccess: () => {
      console.log("Registration successful");
    },
    onError: (error) => {
      console.error("Registration failed:", error);
    },
  });
};

export const useLogout = () => {
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      console.log("Logout successful");
    },
    onError: (error) => {
      console.error("Logout failed:", error);
    },
  });
};

export const useRefreshUser = () => {
  const refreshUser = useAuthStore((state) => state.refreshUser);

  return useMutation({
    mutationFn: () => refreshUser(),
    onSuccess: () => {
      console.log("User data refreshed");
    },
    onError: (error) => {
      console.error("Failed to refresh user data:", error);
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    }) => authService.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      console.log("Password changed successfully");
    },
    onError: (error) => {
      console.error("Failed to change password:", error);
    },
  });
};





export const useAuthInitialization = () => {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  const initMutation = useMutation({
    mutationFn: () => initializeAuth(),
    onSuccess: () => {
      console.log("Auth initialization completed");
    },
    onError: (error) => {
      console.error("Auth initialization failed:", error);
    },
  });

  
  useEffect(() => {
    if (
      !initMutation.isSuccess &&
      !initMutation.isPending &&
      !isAuthenticated
    ) {
      initMutation.mutate();
    }
  }, [initMutation.isSuccess, initMutation.isPending, isAuthenticated]);

  return {
    initialize: initMutation.mutate,
    isInitializing: initMutation.isPending || isLoading,
    isInitialized: initMutation.isSuccess,
    initError: initMutation.error,
    isAuthenticated,
  };
};





export const useAuthSession = () => {
  const { isAuthenticated, user, token, refreshUser } = useAuth();
  const refreshMutation = useRefreshUser();

  
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const refreshInterval = setInterval(() => {
      refreshMutation.mutate();
    }, 5 * 60 * 1000); 

    return () => clearInterval(refreshInterval);
  }, [isAuthenticated, token, refreshMutation.mutate]);

  return {
    isValid: isAuthenticated && !!user && !!token,
    user,
    lastRefresh: refreshMutation.isSuccess ? new Date() : null,
    isRefreshing: refreshMutation.isPending,
    refreshError: refreshMutation.error,
  };
};

export const useTokenExpiration = () => {
  const { token, logout } = useAuth();

  const checkTokenExpiration = useCallback(() => {
    if (!token) return false;

    try {
      
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Date.now() / 1000;

      return payload.exp < currentTime;
    } catch (error) {
      console.error("Error checking token expiration:", error);
      return true; 
    }
  }, [token]);

  const handleExpiredToken = useCallback(async () => {
    console.warn("Token expired, logging out user");
    await logout();
  }, [logout]);

  
  useEffect(() => {
    if (!token) return;

    const checkInterval = setInterval(() => {
      if (checkTokenExpiration()) {
        handleExpiredToken();
      }
    }, 60 * 1000); 

    return () => clearInterval(checkInterval);
  }, [token, checkTokenExpiration, handleExpiredToken]);

  return {
    isExpired: checkTokenExpiration(),
    checkExpiration: checkTokenExpiration,
    handleExpiredToken,
  };
};





export const useAuthGuard = (redirectTo?: string) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { isInitialized } = useAuthInitialization();

  const canAccess = isInitialized && isAuthenticated;
  const shouldRedirect = isInitialized && !isAuthenticated && !isLoading;

  return {
    canAccess,
    shouldRedirect,
    redirectTo: redirectTo || "/auth/login",
    isLoading: !isInitialized || isLoading,
  };
};

export const useGuestGuard = (redirectTo?: string) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { isInitialized } = useAuthInitialization();

  const canAccess = isInitialized && !isAuthenticated;
  const shouldRedirect = isInitialized && isAuthenticated && !isLoading;

  return {
    canAccess,
    shouldRedirect,
    redirectTo: redirectTo || "/",
    isLoading: !isInitialized || isLoading,
  };
};

export const useCurrentUser = () => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.auth.user(),
    queryFn: () => authService.getCurrentUser(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, 
  });
};





export const useAutoLogin = () => {
  const { autoLoginWithBiometric, biometricEnabled } = useAuth();
  const { isInitialized } = useAuthInitialization();

  const attemptAutoLogin = useCallback(async () => {
    if (!isInitialized || !biometricEnabled) {
      return false;
    }

    try {
      return await autoLoginWithBiometric();
    } catch (error) {
      console.error("Auto-login failed:", error);
      return false;
    }
  }, [isInitialized, biometricEnabled, autoLoginWithBiometric]);

  return {
    attemptAutoLogin,
    canAutoLogin: isInitialized && biometricEnabled,
  };
};





export const useAuthStatus = () => {
  return useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
  }));
};

export const useUser = () => {
  return useAuthStore((state) => state.user);
};

export const useAuthActions = () => {
  return useAuthStore((state) => ({
    login: state.login,
    register: state.register,
    logout: state.logout,
    refreshUser: state.refreshUser,
    clearError: state.clearError,
    enableBiometric: state.enableBiometric,
    disableBiometric: state.disableBiometric,
    autoLoginWithBiometric: state.autoLoginWithBiometric,
  }));
};
