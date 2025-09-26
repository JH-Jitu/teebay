import { Colors, Spacing, Typography } from "@/src/constants/theme";
import type { AuthContainerProps } from "@/src/types";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const AuthContainer: React.FC<AuthContainerProps> = ({
  children,
  title,
  subtitle,
  showBackButton = false,
  onBackPress,
}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: Colors[theme].background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + Spacing.lg,
            paddingBottom: insets.bottom + Spacing.lg,
          },
        ]}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        decelerationRate="fast"
        bounces={Platform.OS === "ios"}
        overScrollMode={Platform.OS === "android" ? "never" : "auto"}
      >
        {showBackButton && (
          <Animated.View
            entering={FadeInUp.delay(100).duration(400)}
            style={styles.backButtonContainer}
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={onBackPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text
                style={[styles.backButtonText, { color: Colors[theme].text }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                ← Back
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        <Animated.View
          entering={FadeInUp.delay(200).duration(500)}
          style={styles.headerContainer}
        >
          <View style={styles.logoContainer}>
            <View
              style={[styles.logo, { backgroundColor: Colors[theme].primary }]}
            >
              <Text style={styles.logoText}>TB</Text>
            </View>
          </View>

          <Text style={[styles.title, { color: Colors[theme].text }]}>
            {title}
          </Text>

          {subtitle && (
            <Text
              style={[styles.subtitle, { color: Colors[theme].textSecondary }]}
            >
              {subtitle}
            </Text>
          )}
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(300).duration(500)}
          style={styles.contentContainer}
        >
          {children}
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export const AuthCard: React.FC<{
  children: React.ReactNode;
  title?: string;
}> = ({ children, title }) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";

  return (
    <Animated.View
      entering={FadeInUp.delay(400).duration(400)}
      style={[
        styles.card,
        {
          backgroundColor: Colors[theme].surface,
          borderColor: Colors[theme].border,
        },
      ]}
    >
      {title && (
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: Colors[theme].text }]}>
            {title}
          </Text>
        </View>
      )}
      <View style={styles.cardContent}>{children}</View>
    </Animated.View>
  );
};

export const AuthDivider: React.FC<{ text?: string }> = ({ text = "or" }) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";

  return (
    <View style={styles.dividerContainer}>
      <View
        style={[styles.dividerLine, { backgroundColor: Colors[theme].border }]}
      />
      <Text
        style={[styles.dividerText, { color: Colors[theme].textSecondary }]}
      >
        {text}
      </Text>
      <View
        style={[styles.dividerLine, { backgroundColor: Colors[theme].border }]}
      />
    </View>
  );
};

export const AuthFooter: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <Animated.View
      entering={FadeInUp.delay(500).duration(400)}
      style={styles.footer}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Spacing.lg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
    minHeight: "100%",
  },
  backButtonContainer: {
    position: "absolute",
    top: Spacing.md,
    left: Spacing.lg,
    zIndex: 1,
  },
  backButton: {
    padding: Spacing.sm,
  },
  backButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  logoContainer: {
    marginBottom: Spacing.lg,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    fontSize: Typography.fontSize["3xl"],
    fontWeight: Typography.fontWeight.bold,
    color: "#FFFFFF",
  },
  title: {
    fontSize: Typography.fontSize["3xl"],
    fontWeight: Typography.fontWeight.bold,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.normal,
    textAlign: "center",
    paddingHorizontal: Spacing.md,
  },
  contentContainer: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginVertical: Spacing.md,
    overflow: "hidden",
  },
  cardHeader: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  cardTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    textAlign: "center",
  },
  cardContent: {
    padding: Spacing.lg,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: Spacing.md,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  footer: {
    marginTop: Spacing.xl,
    alignItems: "center",
  },
});

export default AuthContainer;
