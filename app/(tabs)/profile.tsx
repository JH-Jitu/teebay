import { Button } from "@/src/components/common/Button";
import { Colors, Spacing, Typography } from "@/src/constants/theme";
import { useAuthStore } from "@/src/store/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, useColorScheme } from "react-native";
import Toast from "react-native-toast-message";

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";
  const { user, logout, isLoading, isAuthenticated } = useAuthStore();
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  console.log("Profile Screen - User:", user);
  console.log("Profile Screen - isAuthenticated:", isAuthenticated);

  useEffect(() => {
    checkBiometricStatus();
  }, []);

  const checkBiometricStatus = async () => {
    try {
      const enabled = await AsyncStorage.getItem("teebay_biometric_enabled");
      setBiometricEnabled(enabled === "true");

      
      const [userString, loginTime] = await AsyncStorage.multiGet([
        "teebay_user",
        "teebay_login_time",
      ]);
      console.log(
        "Profile Debug - Stored user:",
        userString[1] ? "exists" : "not found"
      );
      console.log("Profile Debug - Login time:", loginTime[1]);
      if (userString[1]) {
        console.log("Profile Debug - Parsed user:", JSON.parse(userString[1]));
      }
    } catch (error) {
      console.error("Error checking biometric status:", error);
    }
  };

  const handleRemoveBiometric = async () => {
    try {
      await AsyncStorage.multiRemove([
        "teebay_biometric_enabled",
        "teebay_biometric_email",
        "teebay_biometric_password",
      ]);
      setBiometricEnabled(false);
      Toast.show({
        type: "success",
        text1: "Biometric Removed",
        text2: "Biometric authentication has been disabled.",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to remove biometric authentication.",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      Toast.show({
        type: "success",
        text1: "Signed Out",
        text2: "You have been successfully signed out.",
      });
      router.replace("/auth/welcome");
    } catch (error) {
      Toast.show({
        type: "info",
        text1: "Signed Out",
        text2: "You have been signed out.",
      });
      router.replace("/auth/welcome");
    }
  };

  if (!user) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: Colors[theme].background },
        ]}
      >
        <Text style={[styles.title, { color: Colors[theme].text }]}>
          Not signed in
        </Text>
        <Text style={[styles.label, { color: Colors[theme].textSecondary }]}>
          isAuthenticated: {isAuthenticated ? "true" : "false"}
        </Text>
        <Text style={[styles.label, { color: Colors[theme].textSecondary }]}>
          User object: {user ? "exists" : "null"}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: Colors[theme].background }]}
    >
      <View style={styles.card}>
        <Text style={[styles.label, { color: Colors[theme].textSecondary }]}>
          Email
        </Text>
        <Text style={[styles.value, { color: Colors[theme].text }]}>
          {user.email}
        </Text>

        <Text style={[styles.label, { color: Colors[theme].textSecondary }]}>
          Name
        </Text>
        <Text style={[styles.value, { color: Colors[theme].text }]}>
          {user.first_name} {user.last_name}
        </Text>

        <Text style={[styles.label, { color: Colors[theme].textSecondary }]}>
          Address
        </Text>
        <Text style={[styles.value, { color: Colors[theme].text }]}>
          {user.address}
        </Text>
      </View>

      {biometricEnabled && (
        <Button
          title="Remove Biometric Authentication"
          onPress={handleRemoveBiometric}
          variant="secondary"
          style={{ marginBottom: Spacing.md }}
        />
      )}

      <Button title="Logout" onPress={handleLogout} loading={isLoading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  card: {
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.lg,
    borderColor: "#E5E5E5",
  },
  title: {
    fontSize: Typography.fontSize["2xl"],
    fontWeight: Typography.fontWeight.bold,
  },
  label: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    textTransform: "uppercase",
  },
  value: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
});
