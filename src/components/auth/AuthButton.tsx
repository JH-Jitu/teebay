import {
  BorderRadius,
  Colors,
  Shadows,
  Spacing,
  Typography,
} from "@/src/constants/theme";
import type { AuthButtonProps } from "@/src/types";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

export const AuthButton: React.FC<AuthButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  icon,
  testID,
}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";

  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const isDisabled = disabled || loading;

  const handlePressIn = () => {
    if (!isDisabled) {
      scale.value = withSpring(0.95, { damping: 15, stiffness: 150 });
    }
  };

  const handlePressOut = () => {
    if (!isDisabled) {
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    }
  };

  React.useEffect(() => {
    opacity.value = withTiming(isDisabled ? 0.6 : 1, { duration: 200 });
  }, [isDisabled, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const getVariantStyles = () => {
    switch (variant) {
      case "secondary":
        return {
          backgroundColor: Colors[theme].background,
          borderColor: Colors[theme].border,
          borderWidth: 1,
        };
      case "biometric":
        return {
          backgroundColor: Colors[theme].primary + "20",
          borderColor: Colors[theme].primary,
          borderWidth: 1,
        };
      default:
        return {
          backgroundColor: Colors[theme].primary,
        };
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case "secondary":
        return Colors[theme].text;
      case "biometric":
        return Colors[theme].primary;
      default:
        return Colors[theme].background;
    }
  };

  const containerStyles = [
    styles.container,
    getVariantStyles(),
    variant === "primary" && !isDisabled && Shadows.sm,
  ];

  return (
    <AnimatedTouchableOpacity
      style={[containerStyles, animatedStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      activeOpacity={0.8}
      testID={testID}
      accessible={true}
      accessibilityLabel={loading ? "Loading" : title}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
    >
      <View style={styles.content}>
        {loading ? (
          <>
            <ActivityIndicator
              size="small"
              color={getTextColor()}
              style={styles.loader}
            />
            <Text style={[styles.text, { color: getTextColor() }]}>
              Loading...
            </Text>
          </>
        ) : (
          <>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <Text style={[styles.text, { color: getTextColor() }]}>
              {title}
            </Text>
          </>
        )}
      </View>
    </AnimatedTouchableOpacity>
  );
};

export const BiometricButton: React.FC<
  Omit<AuthButtonProps, "variant"> & { biometricType?: string }
> = ({ biometricType = "Biometric", ...props }) => {
  return (
    <AuthButton
      {...props}
      variant="biometric"
      title={`Login with Biometric`}
      icon={
        <Text style={styles.biometricIcon}>
          {biometricType.includes("Face") ? "👤" : "👆"}
        </Text>
      }
    />
  );
};

export const SocialButton: React.FC<
  Omit<AuthButtonProps, "variant"> & { provider: string }
> = ({ provider, ...props }) => {
  const getSocialIcon = () => {
    switch (provider.toLowerCase()) {
      case "google":
        return "🌐";
      case "apple":
        return "🍎";
      case "facebook":
        return "📘";
      default:
        return "🔗";
    }
  };

  return (
    <AuthButton
      {...props}
      variant="secondary"
      title={`Continue with ${provider}`}
      icon={<Text style={styles.socialIcon}>{getSocialIcon()}</Text>}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    minHeight: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    textAlign: "center",
  },
  loader: {
    marginRight: Spacing.sm,
  },
  iconContainer: {
    marginRight: Spacing.sm,
  },
  biometricIcon: {
    fontSize: 20,
  },
  socialIcon: {
    fontSize: 18,
  },
});

export default AuthButton;
