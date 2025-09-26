import { BiometricPrompt } from "@/src/components/auth/BiometricPrompt";
import { Button } from "@/src/components/common/Button";
import { Input } from "@/src/components/common/Input";
import { IconSymbol } from "@/src/components/ui/icon-symbol";
import {
  BorderRadius,
  Colors,
  Spacing,
  Typography,
} from "@/src/constants/theme";
import { useBiometric } from "@/src/hooks/auth/useBiometric";
import { useAuthStore } from "@/src/store/auth";
import * as LocalAuthentication from "expo-local-authentication";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function SecuritySettingsScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";
  const { user } = useAuthStore();
  const {
    biometricEnabled,
    disableBiometric,
    checkBiometricAvailability,
    enableBiometricAuth,
  } = useBiometric();
  const [biometricType, setBiometricType] = useState("Biometric");
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showBiometricSetup, setShowBiometricSetup] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const checkBiometricSupport = useCallback(async () => {
    try {
      const isAvailable = await checkBiometricAvailability();
      setBiometricAvailable(isAvailable);

      if (isAvailable) {
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
      console.warn("Error checking biometric support:", error);
      setBiometricAvailable(false);
    }
  }, [checkBiometricAvailability]);

  useEffect(() => {
    checkBiometricSupport();
  }, [checkBiometricSupport]);

  const handleBiometricToggle = async (value: boolean) => {
    try {
      if (value) {
        // Show biometric setup prompt
        setShowBiometricSetup(true);
      } else {
        await disableBiometric("disable");
      }
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Failed to update biometric settings"
      );
    }
  };

  const handleRemoveBiometricData = () => {
    Alert.alert(
      "Remove Biometric Data",
      "This will completely remove all biometric information. You'll need to set it up again.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await disableBiometric("remove");
              Alert.alert("Success", "Biometric data removed successfully");
            } catch {
              Alert.alert(
                "Error",
                "Failed to remove biometric data. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  const handleEnableBiometric = async () => {
    if (!user?.email) {
      Alert.alert("Error", "No user information available");
      return;
    }

    console.log({ user });

    try {
      const success = await enableBiometricAuth(user.email, user.password);

      if (success) {
        Toast.show({
          type: "success",
          text1: "Biometric Authentication Enabled",
          text2: `You can now use ${biometricType} to sign in.`,
        });
        setShowBiometricSetup(false);
      } else {
        Toast.show({
          type: "error",
          text1: "Setup Failed",
          text2: "Biometric authentication was cancelled or failed.",
        });
      }
    } catch (error) {
      console.error("Biometric setup error:", error);
      Alert.alert(
        "Setup Failed",
        "Failed to set up biometric authentication. Please try again."
      );
    }
  };

  const handleSkipBiometric = () => {
    setShowBiometricSetup(false);
  };

  const handlePasswordInputChange = (field: string, value: string) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validatePasswordForm = () => {
    const newErrors: Record<string, string> = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validatePasswordForm()) return;

    setLoading(true);
    try {
      // TODO: Implement actual API call to change password
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      Alert.alert("Success", "Password changed successfully", [
        {
          text: "OK",
          onPress: () => {
            setShowChangePassword(false);
            setPasswordData({
              currentPassword: "",
              newPassword: "",
              confirmPassword: "",
            });
          },
        },
      ]);
    } catch {
      Alert.alert("Error", "Failed to change password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Coming Soon",
              "Account deletion will be available in a future update."
            );
          },
        },
      ]
    );
  };

  const SecurityOption = ({
    icon,
    title,
    subtitle,
    rightComponent,
    onPress,
    danger = false,
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    rightComponent?: React.ReactNode;
    onPress?: () => void;
    danger?: boolean;
  }) => (
    <Pressable
      style={({ pressed }) => [
        styles.optionContainer,
        { backgroundColor: Colors[theme].backgroundSecondary },
        pressed && { opacity: 0.7 },
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.optionLeft}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: danger
                ? Colors[theme].error + "20"
                : Colors[theme].tint + "20",
            },
          ]}
        >
          <IconSymbol
            name={icon}
            size={20}
            color={danger ? Colors[theme].error : Colors[theme].tint}
          />
        </View>

        <View style={styles.optionText}>
          <Text
            style={[
              styles.optionTitle,
              { color: danger ? Colors[theme].error : Colors[theme].text },
            ]}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              style={[
                styles.optionSubtitle,
                { color: Colors[theme].textSecondary },
              ]}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      {rightComponent ||
        (onPress && (
          <IconSymbol
            name="chevron.right"
            size={16}
            color={Colors[theme].textSecondary}
          />
        ))}
    </Pressable>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: Colors[theme].background }]}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View
          style={[styles.header, { borderBottomColor: Colors[theme].border }]}
        >
          <Pressable
            style={styles.headerButton}
            onPress={() => router.back()}
            testID="back-button"
          >
            <IconSymbol
              name="chevron.left"
              size={24}
              color={Colors[theme].textSecondary}
            />
          </Pressable>

          <Text style={[styles.headerTitle, { color: Colors[theme].text }]}>
            Security Settings
          </Text>

          <View style={styles.headerButton} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Biometric Authentication */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: Colors[theme].text }]}>
              Authentication
            </Text>

            <SecurityOption
              icon="faceid"
              title={`${biometricType} Authentication`}
              subtitle={
                !biometricAvailable
                  ? "Not available on this device"
                  : biometricEnabled
                  ? "Enabled - Use your biometric to sign in"
                  : "Disabled - Use password only"
              }
              rightComponent={
                <Switch
                  value={biometricEnabled}
                  onValueChange={handleBiometricToggle}
                  disabled={!biometricAvailable}
                  trackColor={{
                    false: Colors[theme].border,
                    true: Colors[theme].tint + "50",
                  }}
                  thumbColor={
                    biometricEnabled
                      ? Colors[theme].tint
                      : Colors[theme].textMuted
                  }
                />
              }
            />

            {biometricEnabled && (
              <SecurityOption
                icon="trash"
                title="Remove Biometric Data"
                subtitle="Clear all stored biometric information"
                onPress={handleRemoveBiometricData}
                danger
              />
            )}
          </View>

          {/* Password Management */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: Colors[theme].text }]}>
              Password (Dummy)
            </Text>

            <SecurityOption
              icon="lock.fill"
              title="Change Password"
              subtitle="Update your account password"
              onPress={() => setShowChangePassword(!showChangePassword)}
            />

            {showChangePassword && (
              <View
                style={[
                  styles.passwordSection,
                  { backgroundColor: Colors[theme].background },
                ]}
              >
                <View style={styles.fieldContainer}>
                  <Text
                    style={[styles.fieldLabel, { color: Colors[theme].text }]}
                  >
                    Current Password
                  </Text>
                  <Input
                    value={passwordData.currentPassword}
                    onChangeText={(value) =>
                      handlePasswordInputChange("currentPassword", value)
                    }
                    placeholder="Enter current password"
                    secureTextEntry
                    error={errors.currentPassword}
                    testID="current-password-input"
                  />
                </View>

                <View style={styles.fieldContainer}>
                  <Text
                    style={[styles.fieldLabel, { color: Colors[theme].text }]}
                  >
                    New Password
                  </Text>
                  <Input
                    value={passwordData.newPassword}
                    onChangeText={(value) =>
                      handlePasswordInputChange("newPassword", value)
                    }
                    placeholder="Enter new password"
                    secureTextEntry
                    error={errors.newPassword}
                    testID="new-password-input"
                  />
                </View>

                <View style={styles.fieldContainer}>
                  <Text
                    style={[styles.fieldLabel, { color: Colors[theme].text }]}
                  >
                    Confirm New Password
                  </Text>
                  <Input
                    value={passwordData.confirmPassword}
                    onChangeText={(value) =>
                      handlePasswordInputChange("confirmPassword", value)
                    }
                    placeholder="Confirm new password"
                    secureTextEntry
                    error={errors.confirmPassword}
                    testID="confirm-password-input"
                  />
                </View>

                <View style={styles.passwordActions}>
                  <Button
                    title="Cancel"
                    variant="ghost"
                    onPress={() => setShowChangePassword(false)}
                    style={styles.passwordButton}
                  />
                  <Button
                    title="Update Password"
                    variant="primary"
                    onPress={handleChangePassword}
                    loading={loading}
                    disabled={loading}
                    style={styles.passwordButton}
                  />
                </View>
              </View>
            )}
          </View>

          {/* Danger Zone */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: Colors[theme].error }]}>
              Danger Zone (Dummy)
            </Text>

            <SecurityOption
              icon="trash"
              title="Delete Account"
              subtitle="Permanently delete your account and all data"
              onPress={handleDeleteAccount}
              danger
            />
          </View>
        </ScrollView>

        {/* Biometric Setup Prompt */}
        <BiometricPrompt
          visible={showBiometricSetup}
          onEnable={handleEnableBiometric}
          onSkip={handleSkipBiometric}
          onClose={handleSkipBiometric}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  headerButton: {
    minWidth: 60,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  content: {
    flex: 1,
    paddingTop: Spacing.md,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.md,
    marginHorizontal: Spacing.lg,
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.xs,
  },
  optionSubtitle: {
    fontSize: Typography.fontSize.sm,
  },
  passwordSection: {
    marginHorizontal: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.sm,
  },
  fieldContainer: {
    marginBottom: Spacing.md,
  },
  fieldLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.sm,
  },
  passwordActions: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  passwordButton: {
    flex: 1,
  },
  tipsContainer: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  tipsTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.sm,
  },
  tipsList: {
    gap: Spacing.xs,
  },
  tipItem: {
    fontSize: Typography.fontSize.sm,
    lineHeight: Typography.fontSize.sm * 1.4,
  },
});
