import { Button } from "@/src/components/common/Button";
import { Input, PasswordInput } from "@/src/components/common/Input";
import { LoadingSpinner } from "@/src/components/common/LoadingSpinner";
import { Modal } from "@/src/components/common/Modal";
import { Colors, Spacing, Typography } from "@/src/constants/theme";
import { useAuth } from "@/src/hooks/auth/useAuth";
import { useBiometric } from "@/src/hooks/auth/useBiometric";
import { firebaseService } from "@/src/services/firebase-expo";
import { useAppStore } from "@/src/store/app";
import { useAuthStore } from "@/src/store/auth";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TestScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";

  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("jitu@gmail.com");
  const [password, setPassword] = useState("123456");

  const { user, isAuthenticated, login, logout } = useAuth();
  const authStore = useAuthStore();
  const {
    checkBiometricAvailability,
    authenticateWithBiometric,
    biometricEnabled,
  } = useBiometric();
  const appStore = useAppStore();

  const addResult = (message: string, success: boolean = true) => {
    const prefix = success ? "✅" : "❌";
    setTestResults((prev) => [`${prefix} ${message}`, ...prev]);
  };

  const testApiService = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://192.168.0.113:8000/api/users/");
      addResult(`Django Backend: ${response.ok ? "Connected ✓" : "Offline ✗"}`);
      addResult("API Service tests completed");
    } catch (error) {
      addResult(`API Service Error: ${error}`, false);
    }
    setLoading(false);
  };

  const testAuthService = async () => {
    setLoading(true);
    try {
      await login(email, password);
      addResult(`Auth Login Test: Success - User: ${email}`);
      addResult("Auth Service tests completed");
    } catch (error) {
      addResult(`Auth Service Error: ${error}`, false);
    }
    setLoading(false);
  };

  const testNotifications = async () => {
    setLoading(true);
    try {
      await firebaseService.initialize();
      addResult("Firebase Service: Initialized ✓");

      const permission = await firebaseService.requestNotificationPermission();
      addResult(
        `Notification Permission: ${permission ? "Granted ✓" : "Denied ✗"}`
      );

      try {
        const token = await firebaseService.getFCMToken();
        if (token) {
          addResult(`FCM Token: Retrieved ✓`);
          addResult(`Token Preview: ${token.substring(0, 20)}...`);

          try {
            await useAuthStore.getState().updateFCMToken(token);
            addResult("FCM Token: Updated in backend ✓");
          } catch (updateError) {
            addResult(
              `FCM Token: Backend update failed - ${updateError}`,
              false
            );
          }
        } else {
          addResult("FCM Token: Unavailable (timeout/no dev build) ✗", false);
        }
      } catch (tokenError) {
        addResult(`FCM Token: Error - ${tokenError}`, false);
      }

      addResult("Notification tests completed ✓");
    } catch (error) {
      addResult(`Notification Error: ${error}`, false);
    } finally {
      setLoading(false);
    }
  };

  const showLocalNotification = async () => {
    try {
      await firebaseService.showLocalNotification({
        id: Date.now().toString(),
        title: "Local Notification",
        body: "This verifies notification UI without FCM.",
        data: {},
        isRead: false,
        createdAt: new Date().toISOString(),
      });
      addResult("Local Notification shown ✓");
    } catch (e) {
      addResult(`Local Notification error: ${e}`, false);
    }
  };

  const testBiometric = async () => {
    try {
      addResult("Testing biometric capabilities...");

      const isAvailable = await checkBiometricAvailability();
      addResult(`Biometric Available: ${isAvailable ? "✓" : "✗"}`);
      addResult(`Biometric Enabled: ${biometricEnabled ? "✓" : "✗"}`);

      if (isAvailable) {
        try {
          const result = await authenticateWithBiometric();
          addResult(`Biometric Test: ${result ? "✓" : "✗"}`);
        } catch (authError) {
          addResult(`Auth Error: ${authError}`, false);
        }
      } else {
        addResult("Biometric auth not available on this device", false);
      }

      addResult("Biometric tests completed ✓");
    } catch (error) {
      addResult(`Biometric Error: ${error}`, false);
    }
  };

  const testUserProfile = async () => {
    try {
      addResult("Testing user profile...");

      if (!user) {
        addResult("No user logged in ✗", false);
        return;
      }

      addResult(`User ID: ${user.id}`);
      addResult(`Email: ${user.email}`);
      addResult(`Name: ${user.first_name} ${user.last_name}`);
      addResult(`Address: ${user.address}`);

      if (user.firebase_console_manager_token) {
        addResult(
          `FCM Token: ${user.firebase_console_manager_token.substring(
            0,
            20
          )}...`
        );
      } else {
        addResult("No FCM token stored", false);
      }

      try {
        const currentUser = await authService.getCurrentUser();
        addResult("Profile refresh: ✓");
        addResult(`Backend sync: ${currentUser.id === user.id ? "✓" : "✗"}`);
      } catch (profileError) {
        addResult(`Profile refresh failed: ${profileError}`, false);
      }

      addResult("User profile tests completed ✓");
    } catch (error) {
      addResult(`Profile Error: ${error}`, false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      addResult("Logout successful ✓");
      addResult("Redirecting to auth...");
    } catch (error) {
      addResult(`Logout error: ${error}`, false);
    }
  };

  const testStores = () => {
    try {
      addResult(`Auth Store - Authenticated: ${authStore.isAuthenticated}`);
      addResult(`Auth Store - User: ${authStore.user?.email || "No user"}`);

      addResult(`App Store - Theme: ${appStore.settings.theme}`);
      addResult(`App Store - Language: ${appStore.settings.language}`);

      appStore.toggleTheme();
      addResult("Theme toggled successfully");

      addResult("Store tests completed");
    } catch (error) {
      addResult(`Store Error: ${error}`, false);
    }
  };

  const runAllTests = async () => {
    setTestResults([]);
    addResult("🚀 Starting comprehensive tests...");

    await testApiService();
    await testAuthService();
    await testBiometric();
    await testNotifications();
    testStores();

    addResult("🎉 All tests completed!");
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: Colors[theme].background }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}
      >
        <ScrollView
          style={[
            styles.container,
            { backgroundColor: Colors[theme].background },
          ]}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
        >
          {}
          <View style={styles.header}>
            <Text style={[styles.title, { color: Colors[theme].text }]}>
              🧪 TeeBay Services Test Lab
            </Text>
            <Text
              style={[styles.subtitle, { color: Colors[theme].textSecondary }]}
            >
              Test all functional services and hooks
            </Text>
          </View>

          {}
          <View style={[styles.section, { borderColor: Colors[theme].border }]}>
            <Text style={[styles.sectionTitle, { color: Colors[theme].text }]}>
              Current Status
            </Text>
            <Text
              style={[
                styles.statusText,
                { color: Colors[theme].textSecondary },
              ]}
            >
              Authenticated: {isAuthenticated ? "✅ Yes" : "❌ No"}
            </Text>
            <Text
              style={[
                styles.statusText,
                { color: Colors[theme].textSecondary },
              ]}
            >
              User: {user?.email || "Not logged in"}
            </Text>
            <Text
              style={[
                styles.statusText,
                { color: Colors[theme].textSecondary },
              ]}
            >
              Theme: {appStore.settings.theme}
            </Text>
            <Text
              style={[
                styles.statusText,
                { color: Colors[theme].textSecondary },
              ]}
            >
              Biometric: {biometricEnabled ? "Enabled" : "Disabled"}
            </Text>
            <Text style={[styles.statusText, { color: Colors[theme].info }]}>
              💡 Make sure Django backend is running on http:
            </Text>
          </View>

          {}
          <View style={[styles.section, { borderColor: Colors[theme].border }]}>
            <Text style={[styles.sectionTitle, { color: Colors[theme].text }]}>
              Test Credentials
            </Text>
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter test email"
            />
            <PasswordInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter test password"
            />
          </View>

          {}
          <View style={[styles.section, { borderColor: Colors[theme].border }]}>
            <Text style={[styles.sectionTitle, { color: Colors[theme].text }]}>
              Individual Tests
            </Text>

            <View style={styles.buttonRow}>
              <Button
                title="🌐 Test API"
                onPress={testApiService}
                loading={loading}
                style={styles.testButton}
                size="sm"
              />
              <Button
                title="🔐 Test Auth"
                onPress={testAuthService}
                loading={loading}
                style={styles.testButton}
                size="sm"
              />
            </View>

            <View style={styles.buttonRow}>
              <Button
                title="👆 Test Biometric"
                onPress={testBiometric}
                loading={loading}
                style={styles.testButton}
                size="sm"
              />
              <Button
                title="🔔 Test Notifications"
                onPress={testNotifications}
                loading={loading}
                style={styles.testButton}
                size="sm"
              />
              <Button
                title="🔔 Show Local"
                onPress={showLocalNotification}
                style={styles.testButton}
                size="sm"
              />
              <Button
                title="👆 Test Biometric"
                onPress={testBiometric}
                style={styles.testButton}
                size="sm"
              />
              <Button
                title="👤 Test Profile"
                onPress={testUserProfile}
                style={styles.testButton}
                size="sm"
              />
              <Button
                title="🚪 Logout"
                onPress={handleLogout}
                style={styles.testButton}
                size="sm"
              />
            </View>

            <View style={styles.buttonRow}>
              <Button
                title="🏪 Test Stores"
                onPress={testStores}
                style={styles.testButton}
                size="sm"
              />
              <Button
                title="📱 Test Modal"
                onPress={() => setShowModal(true)}
                variant="secondary"
                style={styles.testButton}
                size="sm"
              />
            </View>

            <View style={styles.buttonRow}>
              <Button
                title="🚀 Run All Tests"
                onPress={runAllTests}
                loading={loading}
                variant="primary"
                style={styles.fullButton}
              />
            </View>

            <View style={styles.buttonRow}>
              <Button
                title="🗑️ Clear Results"
                onPress={clearResults}
                variant="ghost"
                style={styles.fullButton}
              />
            </View>
          </View>

          {}
          <View style={[styles.section, { borderColor: Colors[theme].border }]}>
            <Text style={[styles.sectionTitle, { color: Colors[theme].text }]}>
              Test Results ({testResults.length})
            </Text>

            {loading && (
              <LoadingSpinner
                size="small"
                message="Running tests..."
                style={styles.loader}
              />
            )}

            <ScrollView
              style={[
                styles.resultsContainer,
                { backgroundColor: Colors[theme].backgroundSecondary },
              ]}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
            >
              {testResults.length === 0 ? (
                <Text
                  style={[styles.emptyText, { color: Colors[theme].textMuted }]}
                >
                  No test results yet. Run some tests!
                </Text>
              ) : (
                testResults.map((result, index) => (
                  <Text
                    key={index}
                    style={[
                      styles.resultText,
                      { color: Colors[theme].text },
                      result.startsWith("❌") && { color: Colors[theme].error },
                      result.startsWith("✅") && {
                        color: Colors[theme].success,
                      },
                    ]}
                  >
                    {result}
                  </Text>
                ))
              )}
            </ScrollView>
          </View>

          {}
          <View style={[styles.section, { borderColor: Colors[theme].border }]}>
            <Text style={[styles.sectionTitle, { color: Colors[theme].text }]}>
              Quick Actions
            </Text>

            <View style={styles.buttonRow}>
              {isAuthenticated ? (
                <Button
                  title="Logout"
                  onPress={logout}
                  variant="destructive"
                  style={styles.fullButton}
                />
              ) : (
                <Button
                  title="Quick Login"
                  onPress={() => login(email, password)}
                  variant="primary"
                  style={styles.fullButton}
                />
              )}
            </View>
          </View>

          {}
          <Modal
            visible={showModal}
            onClose={() => setShowModal(false)}
            title="Test Modal"
            size="medium"
          >
            <View style={styles.modalContent}>
              <Text style={[styles.modalText, { color: Colors[theme].text }]}>
                This is a test modal to verify the Modal component is working
                correctly!
              </Text>
              <Button
                title="Close Modal"
                onPress={() => setShowModal(false)}
                style={styles.modalButton}
              />
            </View>
          </Modal>

          {}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.md,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize["3xl"],
    fontWeight: Typography.fontWeight.bold,
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    textAlign: "center",
  },
  section: {
    borderWidth: 1,
    borderRadius: 8,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.md,
  },
  statusText: {
    fontSize: Typography.fontSize.base,
    marginBottom: Spacing.xs,
  },
  buttonRow: {
    flexDirection: "row",
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  testButton: {
    flex: 1,
  },
  fullButton: {
    flex: 1,
  },
  loader: {
    marginVertical: Spacing.md,
  },
  resultsContainer: {
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: 0,
    minHeight: 100,
    maxHeight: 300,
  },
  emptyText: {
    textAlign: "center",
    fontStyle: "italic",
    marginTop: Spacing.lg,
  },
  resultText: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.xs,
    fontFamily: "monospace",
  },
  modalContent: {
    alignItems: "center",
  },
  modalText: {
    fontSize: Typography.fontSize.base,
    textAlign: "center",
    marginBottom: Spacing.xl,
    lineHeight: Typography.lineHeight.relaxed,
  },
  modalButton: {
    width: "100%",
  },
  bottomSpacing: {
    height: Spacing.xl,
  },
});
