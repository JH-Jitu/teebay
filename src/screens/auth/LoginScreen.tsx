import { router } from "expo-router";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import Toast from "react-native-toast-message";

import {
  AuthButton,
  AuthContainer,
  AuthDivider,
  AuthInput,
  BiometricButton,
  BiometricLoginPrompt,
} from "@/src/components/auth";
import { Colors, Spacing, Typography } from "@/src/constants/theme";
import { useBiometric } from "@/src/hooks/auth/useBiometric";
import { useLoginForm } from "@/src/hooks/forms/useAuthForms";
import { useAuthStore } from "@/src/store/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const LoginScreen: React.FC = () => {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";

  const { login, isLoading } = useAuthStore();
  const [showBiometricPrompt, setShowBiometricPrompt] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState<string>("Biometric");
  const [showEnablePrompt, setShowEnablePrompt] = useState(false);
  const [biometricBusy, setBiometricBusy] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
  } = useLoginForm();

  const watchedValues = watch();

  const {
    checkBiometricAvailability: checkBiometricAvailable,
    authenticateWithBiometric,
    enableBiometricAuth,
  } = useBiometric();

  React.useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const isAvailable = await checkBiometricAvailable();
      setBiometricAvailable(isAvailable);
      const enabled = await AsyncStorage.getItem("teebay_biometric_enabled");
      setBiometricEnabled(enabled === "true");
    } catch (error) {
      console.warn("Error checking biometric availability:", error);
    }
  };

  const onSubmit = async (data: { email: string; password: string }) => {
    try {
      if (!data.email || !data.password) return;
      await login(data.email.trim(), data.password);

      if (rememberMe) {
        await AsyncStorage.multiSet([
          ["teebay_biometric_email", data.email],
          ["teebay_biometric_password", data.password],
        ]);
      }

      Toast.show({
        type: "success",
        text1: "Welcome back!",
        text2: "You have successfully signed in.",
      });
      router.replace("/");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to sign in. Please check your email and password and try again.";
      Toast.show({
        type: "error",
        text1: "Sign In Failed",
        text2: message,
      });
    }
  };

  const handleBiometricLogin = async () => {
    if (biometricBusy) return;
    setBiometricBusy(true);
    try {
      const success = await authenticateWithBiometric();
      if (success) {
        const [email, password] = await AsyncStorage.multiGet([
          "teebay_biometric_email",
          "teebay_biometric_password",
        ]);

        console.log(
          "Biometric login - Email:",
          email[1] ? "exists" : "not found"
        );
        console.log(
          "Biometric login - Password:",
          password[1] ? "exists" : "not found"
        );

        if (email[1] && password[1]) {
          console.log("Attempting login with stored credentials...");
          await login(email[1], password[1]);
          Toast.show({
            type: "success",
            text1: "Biometric Sign In Successful",
            text2: "Welcome back!",
          });
          router.replace("/");
        } else {
          Toast.show({
            type: "error",
            text1: "No Stored Credentials",
            text2: "Please enable biometric authentication first.",
          });
        }
      } else {
        Toast.show({
          type: "error",
          text1: "Biometric Authentication Failed",
          text2: `${biometricType} authentication failed. Please try again or use your password.`,
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Authentication Error",
        text2:
          "Unable to complete biometric authentication. Please try again or use your password.",
      });
    } finally {
      setShowBiometricPrompt(false);
      setBiometricBusy(false);
    }
  };

  const handleEnableBiometric = async () => {
    if (biometricBusy) return;
    try {
      setBiometricBusy(true);
      const email = (watchedValues.email || "").trim();
      const password = watchedValues.password || "";
      if (!email || !password) {
        Toast.show({
          type: "error",
          text1: "Missing Information",
          text2: "Please enter your email and password to enable biometrics.",
        });
        return;
      }
      setShowEnablePrompt(false);

      await AsyncStorage.multiSet([
        ["teebay_biometric_email", email],
        ["teebay_biometric_password", password],
        ["teebay_biometric_enabled", "true"],
      ]);

      const success = await enableBiometricAuth(email, password);
      if (success) {
        setBiometricEnabled(true);
      } else {
        await AsyncStorage.multiRemove([
          "teebay_biometric_email",
          "teebay_biometric_password",
          "teebay_biometric_enabled",
        ]);
        throw new Error("Biometric authentication test failed");
      }
      Toast.show({
        type: "success",
        text1: "Biometrics Enabled",
        text2: `${biometricType} authentication is now enabled for quick sign in.`,
      });
    } catch (e) {
      Toast.show({
        type: "error",
        text1: "Setup Failed",
        text2:
          "Unable to enable biometrics on this device. You can try again after signing in.",
      });
    } finally {
      setBiometricBusy(false);
    }
  };

  const handleQuickLogin = () => {
    setValue("email", "jitu@gmail.com", { shouldValidate: true });
    setValue("password", "123456", { shouldValidate: true });
  };

  const handleForgotPassword = () => {
    Toast.show({
      type: "info",
      text1: "Forgot Password",
      text2:
        "Password reset functionality will be implemented in the next phase.",
    });
  };

  const navigateToRegister = () => {
    router.push("/auth/register");
  };

  const navigateBack = () => {
    router.back();
  };

  return (
    <AuthContainer
      title="Welcome Back"
      subtitle="Sign in to your TeeBay account"
      showBackButton
      onBackPress={navigateBack}
    >
      <View style={styles.container}>
        <Animated.View
          entering={FadeInUp.delay(100).duration(500)}
          style={styles.formContainer}
        >
          {biometricAvailable && (
            <>
              {biometricEnabled ? (
                <BiometricButton
                  title={`Login with ${biometricType}`}
                  biometricType={biometricType}
                  onPress={() => setShowBiometricPrompt(true)}
                  testID="biometric-login-button"
                />
              ) : (
                <AuthButton
                  title={`Enable ${biometricType}`}
                  variant="biometric"
                  onPress={handleEnableBiometric}
                  testID="enable-biometric-button"
                />
              )}
              <AuthDivider />
            </>
          )}

          <View style={styles.form}>
            <AuthInput
              label="Email"
              value={watchedValues.email || ""}
              onChangeText={(text) => setValue("email", text)}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email?.message}
              testID="email-input"
            />

            <AuthInput
              label="Password"
              value={watchedValues.password || ""}
              onChangeText={(text) => setValue("password", text)}
              placeholder="Enter your password"
              secureTextEntry
              error={errors.password?.message}
              testID="password-input"
            />

            <View style={styles.formOptions}>
              <TouchableOpacity
                style={styles.rememberMeContainer}
                onPress={() => setRememberMe(!rememberMe)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkbox,
                    { borderColor: Colors[theme].border },
                    rememberMe && { backgroundColor: Colors[theme].primary },
                  ]}
                >
                  {rememberMe && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text
                  style={[styles.rememberMeText, { color: Colors[theme].text }]}
                >
                  Remember me
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleForgotPassword}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.forgotPasswordText,
                    { color: Colors[theme].primary },
                  ]}
                >
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            </View>

            <AuthButton
              title="Sign In"
              variant="primary"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              disabled={!isValid || isLoading}
              testID="sign-in-button"
            />

            <TouchableOpacity
              style={styles.quickLoginButton}
              onPress={handleQuickLogin}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.quickLoginText,
                  { color: Colors[theme].primary },
                ]}
              >
                Quick Login (Demo)
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(300).duration(500)}
          style={styles.footer}
        >
          <View style={styles.signUpContainer}>
            <Text
              style={[
                styles.signUpText,
                { color: Colors[theme].textSecondary },
              ]}
            >
              Don&apos;t have an account?{" "}
            </Text>
            <TouchableOpacity onPress={navigateToRegister} activeOpacity={0.7}>
              <Text
                style={[styles.signUpLink, { color: Colors[theme].primary }]}
              >
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <BiometricLoginPrompt
          visible={showBiometricPrompt}
          onAuthenticate={handleBiometricLogin}
          onCancel={() => setShowBiometricPrompt(false)}
          biometricType={biometricType}
        />
      </View>
    </AuthContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  formContainer: {
    flex: 1,
  },
  form: {
    gap: Spacing.lg,
  },
  formOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: Spacing.sm,
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    marginRight: Spacing.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  checkmark: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  rememberMeText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  forgotPasswordText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  quickLoginButton: {
    alignSelf: "center",
    padding: Spacing.sm,
  },
  quickLoginText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    textDecorationLine: "underline",
  },
  footer: {
    alignItems: "center",
    paddingTop: Spacing.xl,
  },
  signUpContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  signUpText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.normal,
  },
  signUpLink: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
});

export default LoginScreen;
