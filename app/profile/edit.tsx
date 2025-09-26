import { Button } from "@/src/components/common/Button";
import { Input } from "@/src/components/common/Input";
import { IconSymbol } from "@/src/components/ui/icon-symbol";
import {
  BorderRadius,
  Colors,
  Spacing,
  Typography,
} from "@/src/constants/theme";
import { useAuthStore } from "@/src/store/auth";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditProfileScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";
  const { user } = useAuthStore();

  const [formData, setFormData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    address: user?.address || "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = "First name is required";
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // TODO: Implement actual API call to update user profile
      await new Promise((resolve) => setTimeout(resolve, 1000));

      Alert.alert("Success", "Profile updated successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

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
            onPress={handleCancel}
            testID="cancel-button"
          >
            <IconSymbol
              name="chevron.left"
              size={24}
              color={Colors[theme].text}
            />
          </Pressable>

          <Text style={[styles.headerTitle, { color: Colors[theme].text }]}>
            Edit Profile
          </Text>

          <Pressable
            style={styles.headerButton}
            onPress={handleSave}
            disabled={loading}
            testID="save-button"
          >
            <Text
              style={[
                styles.saveButtonText,
                {
                  color: loading
                    ? Colors[theme].textSecondary
                    : Colors[theme].tint,
                },
              ]}
            >
              {loading ? "Saving..." : "Save"}
            </Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Profile Image Section */}
          <View style={styles.profileSection}>
            <View
              style={[
                styles.profileImageContainer,
                { backgroundColor: Colors[theme].backgroundSecondary },
              ]}
            >
              <View
                style={[
                  styles.profileImage,
                  { backgroundColor: Colors[theme].tint + "20" },
                ]}
              >
                <Text
                  style={[
                    styles.profileInitials,
                    { color: Colors[theme].tint },
                  ]}
                >
                  {formData.first_name[0]?.toUpperCase()}
                  {formData.last_name[0]?.toUpperCase()}
                </Text>
              </View>

              <Pressable
                style={[
                  styles.editImageButton,
                  { backgroundColor: Colors[theme].tint },
                ]}
                onPress={() => {
                  Alert.alert(
                    "Coming Soon",
                    "Profile picture upload will be available in a future update."
                  );
                }}
              >
                <IconSymbol name="camera" size={16} color="white" />
              </Pressable>
            </View>

            <Text
              style={[styles.imageHint, { color: Colors[theme].textSecondary }]}
            >
              Tap to update your profile picture
            </Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formSection}>
            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: Colors[theme].text }]}>
                First Name
              </Text>
              <Input
                value={formData.first_name}
                onChangeText={(value) => handleInputChange("first_name", value)}
                placeholder="Enter your first name"
                error={errors.first_name}
                testID="first-name-input"
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: Colors[theme].text }]}>
                Last Name
              </Text>
              <Input
                value={formData.last_name}
                onChangeText={(value) => handleInputChange("last_name", value)}
                placeholder="Enter your last name"
                error={errors.last_name}
                testID="last-name-input"
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: Colors[theme].text }]}>
                Email Address
              </Text>
              <Input
                value={formData.email}
                onChangeText={(value) => handleInputChange("email", value)}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
                testID="email-input"
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: Colors[theme].text }]}>
                Address
              </Text>
              <Input
                value={formData.address}
                onChangeText={(value) => handleInputChange("address", value)}
                placeholder="Enter your address"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                error={errors.address}
                testID="address-input"
              />
            </View>
          </View>

          {/* Tips Section */}
          <View
            style={[
              styles.tipsContainer,
              { backgroundColor: Colors[theme].backgroundSecondary },
            ]}
          >
            <Text style={[styles.tipsTitle, { color: Colors[theme].text }]}>
              💡 Profile Tips
            </Text>
            <View style={styles.tipsList}>
              <Text
                style={[styles.tipItem, { color: Colors[theme].textSecondary }]}
              >
                • Use your real name to build trust with other users
              </Text>
              <Text
                style={[styles.tipItem, { color: Colors[theme].textSecondary }]}
              >
                • Keep your contact information up to date
              </Text>
              <Text
                style={[styles.tipItem, { color: Colors[theme].textSecondary }]}
              >
                • A complete profile gets better response rates
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Actions */}
        <View
          style={[
            styles.bottomActions,
            {
              backgroundColor: Colors[theme].background,
              borderTopColor: Colors[theme].border,
            },
          ]}
        >
          <Button
            title="Cancel"
            variant="ghost"
            onPress={handleCancel}
            style={styles.actionButton}
          />
          <Button
            title="Save Changes"
            variant="primary"
            onPress={handleSave}
            loading={loading}
            disabled={loading}
            style={styles.actionButton}
          />
        </View>
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
  saveButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  profileImageContainer: {
    position: "relative",
    borderRadius: BorderRadius.full,
    padding: Spacing.xs,
    marginBottom: Spacing.md,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  profileInitials: {
    fontSize: Typography.fontSize["3xl"],
    fontWeight: Typography.fontWeight.bold,
  },
  editImageButton: {
    position: "absolute",
    bottom: Spacing.xs,
    right: Spacing.xs,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  imageHint: {
    fontSize: Typography.fontSize.sm,
    textAlign: "center",
  },
  formSection: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  fieldContainer: {
    marginBottom: Spacing.lg,
  },
  fieldLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.sm,
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
  bottomActions: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});
