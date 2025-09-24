import { useAuthStore } from "@/src/store/auth";


export const useAuth = () => {
  const auth = useAuthStore();

  return {
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    biometricEnabled: auth.biometricEnabled,
    error: auth.error,

    login: auth.login,
    register: auth.register,
    logout: auth.logout,
    initializeAuth: auth.initializeAuth,
    enableBiometric: auth.enableBiometric,
    clearError: auth.clearError,
  };
};


export const useAuthActions = () =>
  useAuthStore((state) => ({
    login: state.login,
    register: state.register,
    logout: state.logout,
    initializeAuth: state.initializeAuth,
    enableBiometric: state.enableBiometric,
    clearError: state.clearError,
  }));

export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () =>
  useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
