import { IconSymbol } from "@/src/components/ui/icon-symbol";
import {
  BorderRadius,
  Colors,
  Spacing,
  Typography,
} from "@/src/constants/theme";
import { useBiometric } from "@/src/hooks/auth/useBiometric";
import { useAuthStore } from "@/src/store/auth";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ProfileOption = ({
  icon,
  title,
  subtitle,
  onPress,
  showArrow = true,
  danger = false,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showArrow?: boolean;
  danger?: boolean;
}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";

  return (
    <Pressable
      style={({ pressed }) => [
        styles.optionContainer,
        { backgroundColor: Colors[theme].backgroundSecondary },
        pressed && { opacity: 0.7 },
      ]}
      onPress={onPress}
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

      {showArrow && (
        <IconSymbol
          name="chevron.right"
          size={16}
          color={Colors[theme].textSecondary}
        />
      )}
    </Pressable>
  );
};

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";
  const { user, logout, isAuthenticated } = useAuthStore();
  const { biometricEnabled } = useBiometric();

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/auth/welcome");
        },
      },
    ]);
  };

  const handleEditProfile = () => {
    router.push("/profile/edit");
  };

  const handleSecuritySettings = () => {
    router.push("/profile/security");
  };

  const handleAbout = () => {
    Alert.alert(
      "About TeeBay",
      "TeeBay v1.0.0\n\nA marketplace for buying and renting products.",
      [{ text: "OK" }]
    );
  };

  if (!isAuthenticated || !user) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: Colors[theme].background },
        ]}
      >
        <View style={styles.errorState}>
          <Text style={[styles.errorText, { color: Colors[theme].text }]}>
            Please sign in to view your profile
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: Colors[theme].background }]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.profileImageContainer}>
            <View
              style={[
                styles.profileImage,
                { backgroundColor: Colors[theme].tint + "20" },
              ]}
            >
              <Text
                style={[styles.profileInitials, { color: Colors[theme].tint }]}
              >
                {user.first_name?.[0]?.toUpperCase() || "U"}
                {user.last_name?.[0]?.toUpperCase() || ""}
              </Text>
            </View>
          </View>

          <Text style={[styles.userName, { color: Colors[theme].text }]}>
            {user.first_name || "Unknown"} {user.last_name || "User"}
          </Text>
          <Text
            style={[styles.userEmail, { color: Colors[theme].textSecondary }]}
          >
            {user.email || "No email"}
          </Text>

          {user.address && (
            <View style={styles.addressContainer}>
              <IconSymbol
                name="location.fill"
                size={16}
                color={Colors[theme].textSecondary}
              />
              <Text
                style={[
                  styles.userAddress,
                  { color: Colors[theme].textSecondary },
                ]}
              >
                {user.address}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors[theme].text }]}>
            Account
          </Text>

          <ProfileOption
            icon="person.crop.circle"
            title="Edit Profile"
            subtitle="Update your personal information"
            onPress={handleEditProfile}
          />

          <ProfileOption
            icon="lock.fill"
            title="Security"
            subtitle={biometricEnabled ? "Biometric enabled" : "Password only"}
            onPress={handleSecuritySettings}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors[theme].text }]}>
            General
          </Text>

          <ProfileOption
            icon="info.circle.fill"
            title="About"
            subtitle="App version and information"
            onPress={handleAbout}
          />
        </View>

        <View style={styles.section}>
          <ProfileOption
            icon="arrow.right.circle.fill"
            title="Sign Out"
            onPress={handleLogout}
            showArrow={false}
            danger
          />
        </View>

        <View style={styles.footer}>
          <Text
            style={[styles.footerText, { color: Colors[theme].textSecondary }]}
          >
            Member since{" "}
            {user.date_joined
              ? new Date(user.date_joined).toLocaleDateString()
              : "Unknown"}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    padding: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  profileImageContainer: {
    marginBottom: Spacing.lg,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  profileInitials: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
  },
  userName: {
    fontSize: Typography.fontSize["2xl"],
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs,
  },
  userEmail: {
    fontSize: Typography.fontSize.base,
    marginBottom: Spacing.sm,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  userAddress: {
    fontSize: Typography.fontSize.sm,
  },
  section: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.md,
    marginLeft: Spacing.sm,
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
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
  footer: {
    alignItems: "center",
    padding: Spacing.xl,
  },
  footerText: {
    fontSize: Typography.fontSize.sm,
  },
  errorState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: Typography.fontSize.base,
  },
});
