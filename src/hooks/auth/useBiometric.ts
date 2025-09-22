

import { authService } from "@/src/services/auth";
import { useAuthStore } from "@/src/store/auth";
import type { BiometricAuthResult } from "@/src/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";





export const useBiometricAvailability = () => {
  return useQuery({
    queryKey: ["biometric", "availability"],
    queryFn: () => authService.isBiometricAvailable(),
    staleTime: 5 * 60 * 1000, 
  });
};

export const useBiometricTypes = () => {
  return useQuery({
    queryKey: ["biometric", "types"],
    queryFn: () => authService.getBiometricTypes(),
    staleTime: 5 * 60 * 1000, 
  });
};

export const useBiometricEnabled = () => {
  return useQuery({
    queryKey: ["biometric", "enabled"],
    queryFn: () => authService.isBiometricEnabled(),
    staleTime: 1 * 60 * 1000, 
  });
};





export const useBiometricAuth = () => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [lastResult, setLastResult] = useState<BiometricAuthResult | null>(
    null
  );

  const authenticate = useCallback(async (): Promise<BiometricAuthResult> => {
    setIsAuthenticating(true);
    try {
      const result = await authService.authenticateWithBiometric();
      setLastResult(result);
      return result;
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  return {
    authenticate,
    isAuthenticating,
    lastResult,
    clearLastResult: () => setLastResult(null),
  };
};

export const useEnableBiometric = () => {
  const enableBiometric = useAuthStore((state) => state.enableBiometric);

  return useMutation({
    mutationFn: () => enableBiometric(),
    onSuccess: () => {
      console.log("Biometric authentication enabled successfully");
    },
    onError: (error) => {
      console.error("Failed to enable biometric authentication:", error);
    },
  });
};

export const useDisableBiometric = () => {
  const disableBiometric = useAuthStore((state) => state.disableBiometric);

  return useMutation({
    mutationFn: () => disableBiometric(),
    onSuccess: () => {
      console.log("Biometric authentication disabled successfully");
    },
    onError: (error) => {
      console.error("Failed to disable biometric authentication:", error);
    },
  });
};

export const useAutoLoginWithBiometric = () => {
  const autoLoginWithBiometric = useAuthStore(
    (state) => state.autoLoginWithBiometric
  );

  return useMutation({
    mutationFn: () => autoLoginWithBiometric(),
    onSuccess: (success) => {
      if (success) {
        console.log("Auto-login with biometric successful");
      } else {
        console.log("Auto-login with biometric failed");
      }
    },
    onError: (error) => {
      console.error("Auto-login with biometric error:", error);
    },
  });
};





export const useBiometricManager = () => {
  const availability = useBiometricAvailability();
  const types = useBiometricTypes();
  const enabled = useBiometricEnabled();
  const enableMutation = useEnableBiometric();
  const disableMutation = useDisableBiometric();
  const autoLogin = useAutoLoginWithBiometric();
  const biometricAuth = useBiometricAuth();

  const isSupported = availability.data === true;
  const isEnabled = enabled.data === true;
  const biometricTypes = types.data || [];

  return {
    
    isSupported,
    isEnabled,
    biometricTypes,
    isLoading: availability.isLoading || enabled.isLoading,

    
    authenticate: biometricAuth.authenticate,
    isAuthenticating: biometricAuth.isAuthenticating,
    lastAuthResult: biometricAuth.lastResult,
    clearLastAuthResult: biometricAuth.clearLastResult,

    
    enable: enableMutation.mutateAsync,
    disable: disableMutation.mutateAsync,
    isEnabling: enableMutation.isPending,
    isDisabling: disableMutation.isPending,
    enableError: enableMutation.error,
    disableError: disableMutation.error,

    
    autoLogin: autoLogin.mutateAsync,
    isAutoLogging: autoLogin.isPending,
    autoLoginError: autoLogin.error,

    
    refresh: () => {
      availability.refetch();
      enabled.refetch();
      types.refetch();
    },
  };
};

export const useBiometricSetup = () => {
  const [setupStep, setSetupStep] = useState<
    "check" | "enable" | "test" | "complete"
  >("check");
  const [setupError, setSetupError] = useState<string | null>(null);

  const biometricManager = useBiometricManager();

  const startSetup = useCallback(async () => {
    try {
      setSetupError(null);
      setSetupStep("check");

      
      if (!biometricManager.isSupported) {
        throw new Error(
          "Biometric authentication is not supported on this device"
        );
      }

      setSetupStep("enable");

      
      await biometricManager.enable();

      setSetupStep("test");

      
      const testResult = await biometricManager.authenticate();
      if (!testResult.success) {
        throw new Error(
          testResult.error || "Biometric authentication test failed"
        );
      }

      setSetupStep("complete");
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Setup failed";
      setSetupError(errorMessage);
      setSetupStep("check");
      return false;
    }
  }, [biometricManager]);

  const resetSetup = useCallback(() => {
    setSetupStep("check");
    setSetupError(null);
  }, []);

  return {
    setupStep,
    setupError,
    startSetup,
    resetSetup,
    isSetupInProgress: setupStep !== "check" && setupStep !== "complete",
    isSetupComplete: setupStep === "complete",
  };
};

export const useBiometricPrompt = () => {
  const [isPromptVisible, setIsPromptVisible] = useState(false);
  const biometricAuth = useBiometricAuth();

  const showPrompt = useCallback(async (): Promise<BiometricAuthResult> => {
    setIsPromptVisible(true);
    try {
      const result = await biometricAuth.authenticate();
      return result;
    } finally {
      setIsPromptVisible(false);
    }
  }, [biometricAuth.authenticate]);

  const hidePrompt = useCallback(() => {
    setIsPromptVisible(false);
  }, []);

  return {
    showPrompt,
    hidePrompt,
    isPromptVisible,
    isAuthenticating: biometricAuth.isAuthenticating,
    lastResult: biometricAuth.lastResult,
  };
};





export const useBiometricCapability = () => {
  const types = useBiometricTypes();
  const availability = useBiometricAvailability();

  const getCapabilityDescription = useCallback(() => {
    if (!availability.data) {
      return "Biometric authentication is not available on this device";
    }

    const biometricTypes = types.data || [];
    if (biometricTypes.length === 0) {
      return "No biometric authentication methods are enrolled";
    }

    
    const typeDescriptions = biometricTypes.map((type) => {
      switch (type) {
        case 1: 
          return "Fingerprint";
        case 2: 
          return "Face ID";
        case 3: 
          return "Iris";
        default:
          return "Biometric";
      }
    });

    return `Available: ${typeDescriptions.join(", ")}`;
  }, [availability.data, types.data]);

  return {
    description: getCapabilityDescription(),
    isLoading: availability.isLoading || types.isLoading,
  };
};

export const useBiometricErrorHandler = () => {
  const handleError = useCallback((error: string) => {
    console.error("Biometric authentication error:", error);

    
    

    switch (error) {
      case "UserCancel":
        return "Authentication was cancelled";
      case "UserFallback":
        return "User chose to use device passcode";
      case "SystemCancel":
        return "Authentication was cancelled by the system";
      case "BiometryNotAvailable":
        return "Biometric authentication is not available";
      case "BiometryNotEnrolled":
        return "No biometric credentials are enrolled";
      case "BiometryLockout":
        return "Biometric authentication is locked due to too many failed attempts";
      default:
        return "Biometric authentication failed";
    }
  }, []);

  return { handleError };
};
