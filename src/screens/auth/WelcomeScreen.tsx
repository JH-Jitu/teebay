import { router, useRootNavigationState } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, useColorScheme } from "react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  AuthButton,
  AuthContainer,
  AuthDivider,
  BiometricButton,
} from "@/src/components/auth";
import { Colors, Spacing, Typography } from "@/src/constants/theme";
import { useAuthStore } from "@/src/store/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";
import Toast from "react-native-toast-message";

export const WelcomeScreen: React.FC = () => {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";
  const insets = useSafeAreaInsets();

  const { isAuthenticated, login, isLoading } = useAuthStore();
  const navigationState = useRootNavigationState();
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<string>("Biometric");

  const logoScale = useSharedValue(1);

  useEffect(() => {
    if (!navigationState?.key) return;
    if (isAuthenticated) return;
    checkBiometricAvailability();
    startLogoAnimation();
  }, [isAuthenticated, navigationState?.key]);

  const checkBiometricAvailability = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const biometricEnabled = await AsyncStorage.getItem(
        "teebay_biometric_enabled"
      );

      if (hasHardware && isEnrolled && biometricEnabled === "true") {
        setBiometricAvailable(true);

        const types =
          await LocalAuthentication.supportedAuthenticationTypesAsync();
        if (
          types.includes(
            LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
          )
        ) {
          setBiometricType("Face ID");
        } else if (
          types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)
        ) {
          setBiometricType("Fingerprint");
        } else {
          setBiometricType("Biometric");
        }
      }
    } catch (error) {
      console.warn("Error checking biometric availability:", error);
    }
  };

  const startLogoAnimation = () => {
    logoScale.value = withRepeat(
      withTiming(1.05, { duration: 2000 }),
      -1,
      true
    );
  };

  const animatedLogoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  const handleBiometricLogin = async () => {
    try {
      const [emailPair, passwordPair] = await AsyncStorage.multiGet([
        "teebay_biometric_email",
        "teebay_biometric_password",
      ]);

      const storedEmail = emailPair?.[1];
      const storedPassword = passwordPair?.[1];

      if (!storedEmail || !storedPassword) {
        Toast.show({
          type: "error",
          text1: "No Stored Credentials",
          text2: "Please enable biometric sign-in from the Login screen first.",
        });
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Sign in with biometrics",
        cancelLabel: "Cancel",
      });

      if (!result.success) {
        Toast.show({
          type: "error",
          text1: "Biometric Authentication Failed",
          text2: "Please try again or use your password.",
        });
        return;
      }

      await login(storedEmail, storedPassword);
      Toast.show({
        type: "success",
        text1: "Welcome back!",
        text2: "Signed in with biometrics.",
      });
      router.replace("/");
    } catch (error) {
      console.warn("Biometric login error:", error);
      Toast.show({
        type: "error",
        text1: "Authentication Error",
        text2: "Unable to complete biometric authentication.",
      });
    }
  };

  const navigateToLogin = () => {
    router.push("/auth/login");
  };

  const navigateToRegister = () => {
    router.push("/auth/register");
  };

  return (
    <AuthContainer
      title="Welcome to TeeBay"
      subtitle="Your marketplace for buying, selling, and renting products"
    >
      <View style={styles.container}>
        <Animated.View
          entering={FadeInUp.delay(100).duration(600)}
          style={[styles.logoContainer, animatedLogoStyle]}
        >
          <View
            style={[styles.logo, { backgroundColor: Colors[theme].primary }]}
          >
            <Text style={styles.logoText}>TB</Text>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(200).duration(500)}
          style={styles.welcomeContent}
        >
          <Text style={[styles.welcomeTitle, { color: Colors[theme].text }]}>
            Ready to start trading?
          </Text>
          <Text
            style={[
              styles.welcomeSubtitle,
              { color: Colors[theme].textSecondary },
            ]}
          >
            Join thousands of users buying, selling, and renting products safely
            and easily.
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(400).duration(500)}
          style={styles.buttonContainer}
        >
          {biometricAvailable && (
            <>
              <BiometricButton
                title={`Login with ${biometricType}`}
                biometricType={biometricType}
                onPress={handleBiometricLogin}
                loading={isLoading}
                testID="biometric-login-button"
              />
              <AuthDivider />
            </>
          )}

          <AuthButton
            title="Sign In"
            onPress={navigateToLogin}
            variant="primary"
            testID="sign-in-button"
          />

          <AuthButton
            title="Create Account"
            onPress={navigateToRegister}
            variant="secondary"
            testID="create-account-button"
          />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(600).duration(500)}
          style={styles.featuresContainer}
        >
          <Text style={[styles.featuresTitle, { color: Colors[theme].text }]}>
            Why TeeBay?
          </Text>

          <View style={styles.featuresList}>
            {[
              {
                icon: "🛡️",
                title: "Secure Transactions",
                description: "Safe and protected payments",
              },
              {
                icon: "📱",
                title: "Easy to Use",
                description: "Simple interface for everyone",
              },
              {
                icon: "💰",
                title: "Best Prices",
                description: "Competitive marketplace rates",
              },
              {
                icon: "🌍",
                title: "Local & Global",
                description: "Buy and sell anywhere",
              },
            ].map((feature, index) => (
              <Animated.View
                key={index}
                entering={FadeInUp.delay(800 + index * 100).duration(400)}
                style={styles.featureItem}
              >
                <Text style={styles.featureIcon}>{feature.icon}</Text>
                <View style={styles.featureText}>
                  <Text
                    style={[styles.featureTitle, { color: Colors[theme].text }]}
                  >
                    {feature.title}
                  </Text>
                  <Text
                    style={[
                      styles.featureDescription,
                      { color: Colors[theme].textSecondary },
                    ]}
                  >
                    {feature.description}
                  </Text>
                </View>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(1200).duration(400)}
          style={[
            styles.footer,
            { paddingBottom: Math.max(insets.bottom, Spacing.lg) },
          ]}
        >
          <Text
            style={[styles.footerText, { color: Colors[theme].textSecondary }]}
          >
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </Animated.View>
      </View>
    </AuthContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    fontSize: Typography.fontSize["4xl"],
    fontWeight: Typography.fontWeight.bold,
    color: "#FFFFFF",
  },
  welcomeContent: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  welcomeTitle: {
    fontSize: Typography.fontSize["2xl"],
    fontWeight: Typography.fontWeight.bold,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  welcomeSubtitle: {
    fontSize: Typography.fontSize.base,
    textAlign: "center",
    paddingHorizontal: Spacing.md,
  },
  buttonContainer: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  featuresContainer: {
    marginBottom: Spacing.xl,
  },
  featuresTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  featuresList: {
    gap: Spacing.md,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
    width: 32,
    textAlign: "center",
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: Typography.fontSize.xs,
  },
  footer: {
    alignItems: "center",
    paddingTop: Spacing.lg,
  },
  footerText: {
    fontSize: Typography.fontSize.xs,
    textAlign: "center",
    paddingHorizontal: Spacing.lg,
  },
});

export default WelcomeScreen;
