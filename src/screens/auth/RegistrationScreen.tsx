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
  AuthInput,
  BiometricPrompt,
} from "@/src/components/auth";
import { Colors, Spacing, Typography } from "@/src/constants/theme";
import { useRegistrationForm } from "@/src/hooks/forms/useAuthForms";
import {
  getPasswordStrengthColor,
  getPasswordStrengthText,
  validatePasswordStrength,
} from "@/src/schemas/auth";
import { useAuthStore } from "@/src/store/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";

export const RegistrationScreen: React.FC = () => {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";

  const { register, isLoading } = useAuthStore();
  const [showBiometricPrompt, setShowBiometricPrompt] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
  } = useRegistrationForm();

  const watchedValues = watch();
  const passwordStrength = validatePasswordStrength(
    watchedValues.password || ""
  );

  const onSubmit = async (data: any) => {
    try {
      if (
        !data.email ||
        !data.password ||
        !data.first_name ||
        !data.last_name ||
        !data.address ||
        !data.termsAccepted
      )
        return;
      const registrationData = {
        email: data.email,
        password: data.password,
        first_name: data.first_name,
        last_name: data.last_name,
        address: data.address,
      };

      await register(registrationData);

      setNewUserEmail(data.email);

      Toast.show({
        type: "success",
        text1: "Welcome to TeeBay!",
        text2: "Your account has been created successfully.",
      });

      
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (hasHardware && isEnrolled) {
        setShowBiometricPrompt(true);
      } else {
        router.replace("/");
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Please check your information and try again.";
      Toast.show({
        type: "error",
        text1: "Registration Failed",
        text2: message,
      });
    }
  };

  const handleEnableBiometric = async () => {
    try {
      
      await AsyncStorage.multiSet([
        ["teebay_biometric_enabled", "true"],
        ["teebay_biometric_email", newUserEmail],
        ["teebay_biometric_password", "stored"], 
      ]);
      setShowBiometricPrompt(false);
      Toast.show({
        type: "success",
        text1: "Biometrics Enabled",
        text2: "Your biometric authentication is now set up for quick sign in.",
      });
      router.replace("/");
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Biometric Setup Failed",
        text2:
          "Unable to set up biometric authentication. You can enable it later in settings.",
      });
      router.replace("/");
    }
  };

  const handleSkipBiometric = () => {
    setShowBiometricPrompt(false);
    router.replace("/");
  };

  const navigateToLogin = () => {
    router.push("/auth/login");
  };

  const navigateBack = () => {
    router.back();
  };

  const handleQuickFill = () => {
    setValue("email", "newuser@example.com");
    setValue("password", "password123");
    setValue("confirmPassword", "password123");
    setValue("first_name", "John");
    setValue("last_name", "Doe");
    setValue("address", "123 Main Street, City, State 12345");
    setValue("termsAccepted", true);
  };

  return (
    <AuthContainer
      title="Create Account"
      subtitle="Join TeeBay and start trading today"
      showBackButton
      onBackPress={navigateBack}
    >
      <View style={styles.container}>
        <Animated.View
          entering={FadeInUp.delay(100).duration(500)}
          style={styles.formContainer}
        >
          <View style={styles.form}>
            <View style={styles.nameRow}>
              <View style={styles.nameField}>
                <AuthInput
                  label="First Name"
                  value={watchedValues.first_name || ""}
                  onChangeText={(text) =>
                    setValue("first_name", text, { shouldValidate: true })
                  }
                  placeholder="First name"
                  autoCapitalize="words"
                  error={errors.first_name?.message}
                  testID="first-name-input"
                />
              </View>
              <View style={styles.nameField}>
                <AuthInput
                  label="Last Name"
                  value={watchedValues.last_name || ""}
                  onChangeText={(text) =>
                    setValue("last_name", text, { shouldValidate: true })
                  }
                  placeholder="Last name"
                  autoCapitalize="words"
                  error={errors.last_name?.message}
                  testID="last-name-input"
                />
              </View>
            </View>

            <AuthInput
              label="Email"
              value={watchedValues.email || ""}
              onChangeText={(text) =>
                setValue("email", text, { shouldValidate: true })
              }
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email?.message}
              testID="email-input"
            />

            <View>
              <AuthInput
                label="Password"
                value={watchedValues.password || ""}
                onChangeText={(text) =>
                  setValue("password", text, { shouldValidate: true })
                }
                placeholder="Create a password"
                secureTextEntry
                error={errors.password?.message}
                testID="password-input"
              />

              {watchedValues.password && watchedValues.password.length > 0 && (
                <View style={styles.passwordStrengthContainer}>
                  <View style={styles.passwordStrengthBar}>
                    <View
                      style={[
                        styles.passwordStrengthFill,
                        {
                          width: `${(passwordStrength.score / 6) * 100}%`,
                          backgroundColor: getPasswordStrengthColor(
                            passwordStrength.score
                          ),
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.passwordStrengthText,
                      {
                        color: getPasswordStrengthColor(passwordStrength.score),
                      },
                    ]}
                  >
                    {getPasswordStrengthText(passwordStrength.score)}
                  </Text>
                </View>
              )}
            </View>

            <AuthInput
              label="Confirm Password"
              value={watchedValues.confirmPassword || ""}
              onChangeText={(text) =>
                setValue("confirmPassword", text, { shouldValidate: true })
              }
              placeholder="Confirm your password"
              secureTextEntry
              error={errors.confirmPassword?.message}
              testID="confirm-password-input"
            />

            <AuthInput
              label="Address"
              value={watchedValues.address || ""}
              onChangeText={(text) =>
                setValue("address", text, { shouldValidate: true })
              }
              placeholder="Enter your complete address"
              autoCapitalize="words"
              error={errors.address?.message}
              testID="address-input"
            />

            <View style={styles.termsContainer}>
              <TouchableOpacity
                style={styles.termsCheckboxContainer}
                onPress={() =>
                  setValue("termsAccepted", !watchedValues.termsAccepted, {
                    shouldValidate: true,
                  })
                }
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkbox,
                    { borderColor: Colors[theme].border },
                    watchedValues.termsAccepted && {
                      backgroundColor: Colors[theme].primary,
                    },
                  ]}
                >
                  {watchedValues.termsAccepted && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
                <Text style={[styles.termsText, { color: Colors[theme].text }]}>
                  I agree to the{" "}
                  <Text
                    style={[styles.termsLink, { color: Colors[theme].primary }]}
                  >
                    Terms of Service
                  </Text>{" "}
                  and{" "}
                  <Text
                    style={[styles.termsLink, { color: Colors[theme].primary }]}
                  >
                    Privacy Policy
                  </Text>
                </Text>
              </TouchableOpacity>
              {errors.termsAccepted && (
                <Text
                  style={[styles.errorText, { color: Colors[theme].error }]}
                >
                  {errors.termsAccepted.message}
                </Text>
              )}
            </View>

            <AuthButton
              title="Create Account"
              variant="primary"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              disabled={!isValid || isLoading}
              testID="create-account-button"
            />

            <TouchableOpacity
              style={styles.quickFillButton}
              onPress={handleQuickFill}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.quickFillText, { color: Colors[theme].primary }]}
              >
                Quick Fill (Demo)
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(300).duration(500)}
          style={styles.footer}
        >
          <View style={styles.signInContainer}>
            <Text
              style={[
                styles.signInText,
                { color: Colors[theme].textSecondary },
              ]}
            >
              Already have an account?{" "}
            </Text>
            <TouchableOpacity onPress={navigateToLogin} activeOpacity={0.7}>
              <Text
                style={[styles.signInLink, { color: Colors[theme].primary }]}
              >
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <BiometricPrompt
          visible={showBiometricPrompt}
          onEnable={handleEnableBiometric}
          onSkip={handleSkipBiometric}
          onClose={handleSkipBiometric}
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
  nameRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  nameField: {
    flex: 1,
  },
  passwordStrengthContainer: {
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  passwordStrengthBar: {
    height: 4,
    backgroundColor: "#E5E5E5",
    borderRadius: 2,
    overflow: "hidden",
  },
  passwordStrengthFill: {
    height: "100%",
    borderRadius: 2,
  },
  passwordStrengthText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    alignSelf: "flex-end",
  },
  termsContainer: {
    gap: Spacing.xs,
  },
  termsCheckboxContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    marginRight: Spacing.sm,
    marginTop: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  checkmark: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  termsText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.normal,
  },
  termsLink: {
    fontWeight: Typography.fontWeight.semibold,
    textDecorationLine: "underline",
  },
  errorText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    marginLeft: 32,
  },
  quickFillButton: {
    alignSelf: "center",
    padding: Spacing.sm,
  },
  quickFillText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    textDecorationLine: "underline",
  },
  footer: {
    alignItems: "center",
    paddingTop: Spacing.xl,
  },
  signInContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  signInText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.normal,
  },
  signInLink: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
});

export default RegistrationScreen;
