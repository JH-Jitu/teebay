import { useAuthStore } from "@/src/store/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";
import { useCallback, useState } from "react";

export const useBiometric = () => {
  const { biometricEnabled, enableBiometric, disableBiometric } =
    useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const checkBiometricAvailability = useCallback(async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      return hasHardware && isEnrolled;
    } catch {
      return false;
    }
  }, []);

  const authenticateWithBiometric = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate with biometrics",
        cancelLabel: "Cancel",
      });
      return result.success;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const enableBiometricAuth = useCallback(
    async (email: string, password: string) => {
      try {
        const success = await authenticateWithBiometric();
        if (success) {
          await AsyncStorage.multiSet([
            ["teebay_biometric_enabled", "true"],
            ["teebay_biometric_email", email],
            ["teebay_biometric_password", password],
          ]);
          enableBiometric();
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    [authenticateWithBiometric, enableBiometric]
  );

  return {
    biometricEnabled,
    isLoading,
    checkBiometricAvailability,
    authenticateWithBiometric,
    enableBiometricAuth,
    disableBiometric,
  };
};
