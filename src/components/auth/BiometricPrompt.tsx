import {
  BorderRadius,
  Colors,
  Shadows,
  Spacing,
  Typography,
} from "@/src/constants/theme";
import type { BiometricPromptProps } from "@/src/types";
import React, { useEffect } from "react";
import {
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  useColorScheme,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

export const BiometricPrompt: React.FC<BiometricPromptProps> = ({
  visible,
  onEnable,
  onSkip,
  onClose,
}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";

  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const iconScale = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });

      const iconAnimation = () => {
        iconScale.value = withSpring(
          1.2,
          { damping: 8, stiffness: 100 },
          () => {
            iconScale.value = withSpring(
              1,
              { damping: 8, stiffness: 100 },
              () => {
                if (visible) {
                  setTimeout(iconAnimation, 2000);
                }
              }
            );
          }
        );
      };
      iconAnimation();
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      scale.value = withTiming(0.8, { duration: 200 });
    }
  }, [visible]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const handleBackdropPress = () => {
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <Animated.View style={[styles.overlay, overlayStyle]}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.container,
                { backgroundColor: Colors[theme].surface },
                containerStyle,
              ]}
            >
              <View style={styles.content}>
                <Animated.View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: Colors[theme].primary + "20" },
                    iconStyle,
                  ]}
                >
                  <Text style={[styles.icon, { color: Colors[theme].primary }]}>
                    👆
                  </Text>
                </Animated.View>

                <Text style={[styles.title, { color: Colors[theme].text }]}>
                  Secure Your Account
                </Text>

                <Text
                  style={[
                    styles.description,
                    { color: Colors[theme].textSecondary },
                  ]}
                >
                  Enable biometric authentication for quick and secure access to
                  your TeeBay account. You can use your fingerprint or face
                  recognition to sign in.
                </Text>

                <View style={styles.benefitsList}>
                  {[
                    "🔒 Enhanced security",
                    "⚡ Quick access",
                    "🎯 No need to remember passwords",
                    "🛡️ Your data stays on your device",
                  ].map((benefit, index) => (
                    <View key={index} style={styles.benefitItem}>
                      <Text
                        style={[
                          styles.benefitText,
                          { color: Colors[theme].text },
                        ]}
                      >
                        {benefit}
                      </Text>
                    </View>
                  ))}
                </View>

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[
                      styles.button,
                      styles.primaryButton,
                      { backgroundColor: Colors[theme].primary },
                    ]}
                    onPress={onEnable}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.buttonText, styles.primaryButtonText]}>
                      Enable Biometric
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.button,
                      styles.secondaryButton,
                      { borderColor: Colors[theme].border },
                    ]}
                    onPress={onSkip}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        { color: Colors[theme].textSecondary },
                      ]}
                    >
                      Skip for Now
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text
                    style={[
                      styles.closeButtonText,
                      { color: Colors[theme].textSecondary },
                    ]}
                  >
                    ✕
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export const BiometricLoginPrompt: React.FC<{
  visible: boolean;
  onAuthenticate: () => void;
  onCancel: () => void;
  biometricType?: string;
}> = ({ visible, onAuthenticate, onCancel, biometricType = "biometric" }) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";

  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      scale.value = withTiming(0.8, { duration: 200 });
    }
  }, [visible]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <Animated.View style={[styles.overlay, overlayStyle]}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.loginContainer,
                { backgroundColor: Colors[theme].surface },
                containerStyle,
              ]}
            >
              <View style={styles.loginContent}>
                <View
                  style={[
                    styles.loginIcon,
                    { backgroundColor: Colors[theme].primary },
                  ]}
                >
                  <Text style={styles.loginIconText}>
                    {biometricType.toLowerCase().includes("face") ? "👤" : "👆"}
                  </Text>
                </View>

                <Text
                  style={[styles.loginTitle, { color: Colors[theme].text }]}
                >
                  {biometricType} Login
                </Text>

                <Text
                  style={[
                    styles.loginDescription,
                    { color: Colors[theme].textSecondary },
                  ]}
                >
                  Use your {biometricType.toLowerCase()} to sign in to TeeBay
                </Text>

                <View style={styles.loginButtonContainer}>
                  <TouchableOpacity
                    style={[
                      styles.button,
                      styles.primaryButton,
                      { backgroundColor: Colors[theme].primary },
                    ]}
                    onPress={onAuthenticate}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.buttonText, styles.primaryButtonText]}>
                      Authenticate
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.button,
                      styles.secondaryButton,
                      { borderColor: Colors[theme].border },
                    ]}
                    onPress={onCancel}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        { color: Colors[theme].textSecondary },
                      ]}
                    >
                      Use Password
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  container: {
    borderRadius: BorderRadius.lg,
    maxWidth: Math.min(400, width * 0.9),
    width: "100%",
    ...Shadows.lg,
  },
  content: {
    padding: Spacing.xl,
    alignItems: "center",
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  icon: {
    fontSize: 32,
  },
  title: {
    fontSize: Typography.fontSize["2xl"],
    fontWeight: Typography.fontWeight.bold,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  description: {
    fontSize: Typography.fontSize.base,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  benefitsList: {
    width: "100%",
    marginBottom: Spacing.xl,
  },
  benefitItem: {
    marginBottom: Spacing.sm,
  },
  benefitText: {
    fontSize: Typography.fontSize.sm,
  },
  buttonContainer: {
    width: "100%",
    gap: Spacing.md,
  },
  button: {
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 50,
  },
  primaryButton: {
    ...Shadows.sm,
  },
  secondaryButton: {
    borderWidth: 1,
    backgroundColor: "transparent",
  },
  buttonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    textAlign: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
  },
  closeButton: {
    position: "absolute",
    top: Spacing.md,
    right: Spacing.md,
    padding: Spacing.sm,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  loginContainer: {
    borderRadius: BorderRadius.lg,
    maxWidth: Math.min(320, width * 0.85),
    width: "100%",
    ...Shadows.lg,
  },
  loginContent: {
    padding: Spacing.lg,
    alignItems: "center",
  },
  loginIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  loginIconText: {
    fontSize: 24,
    color: "#FFFFFF",
  },
  loginTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  loginDescription: {
    fontSize: Typography.fontSize.sm,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  loginButtonContainer: {
    width: "100%",
    gap: Spacing.sm,
  },
});

export default BiometricPrompt;
