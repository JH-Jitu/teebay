import {
  BorderRadius,
  Colors,
  Shadows,
  Spacing,
  Typography,
} from "@/src/constants/theme";
import React, { useEffect } from "react";
import {
  Dimensions,
  Platform,
  Modal as RNModal,
  StatusBar,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
  useColorScheme,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Button } from "./Button";

export type ModalSize = "small" | "medium" | "large" | "fullscreen";
export type ModalPosition = "center" | "bottom" | "top";

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: ModalSize;
  position?: ModalPosition;
  closeOnBackdrop?: boolean;
  showCloseButton?: boolean;
  animationType?: "slide" | "fade" | "none";
  style?: ViewStyle;
  containerStyle?: ViewStyle;
  overlayStyle?: ViewStyle;
  headerStyle?: ViewStyle;
  titleStyle?: TextStyle;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  children,
  title,
  size = "medium",
  position = "center",
  closeOnBackdrop = true,
  showCloseButton = true,
  animationType = "slide",
  style,
  containerStyle,
  overlayStyle,
  headerStyle,
  titleStyle,
}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(
    position === "bottom" ? 300 : position === "top" ? -300 : 0
  );
  const scale = useSharedValue(0.8);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 300 });
      translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(
        position === "bottom" ? 300 : position === "top" ? -300 : 0,
        { duration: 200 }
      );
      scale.value = withTiming(0.8, { duration: 200 });
    }
  }, [visible, position, opacity, translateY, scale]);

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const containerAnimatedStyle = useAnimatedStyle(() => {
    if (position === "center") {
      return {
        opacity: opacity.value,
        transform: [{ scale: scale.value }],
      };
    } else {
      return {
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
      };
    }
  });

  const handleBackdropPress = () => {
    if (closeOnBackdrop) {
      onClose();
    }
  };

  const getModalDimensions = () => {
    const { width, height } = Dimensions.get("window");

    switch (size) {
      case "small":
        return { width: Math.min(320, width * 0.8), maxHeight: height * 0.5 };
      case "medium":
        return { width: Math.min(400, width * 0.9), maxHeight: height * 0.7 };
      case "large":
        return { width: Math.min(500, width * 0.95), maxHeight: height * 0.8 };
      case "fullscreen":
        return { width: width, height: height };
      default:
        return { width: Math.min(400, width * 0.9), maxHeight: height * 0.7 };
    }
  };

  const modalDimensions = getModalDimensions();

  const overlayStyles = [
    styles.overlay,
    { backgroundColor: Colors[theme].background + "CC" },
    overlayStyle,
  ];

  const containerStyles = [
    styles.container,
    styles[position],
    styles[size],
    {
      backgroundColor: Colors[theme].background,
      ...modalDimensions,
    },
    size !== "fullscreen" && {
      borderRadius: BorderRadius.lg,
      ...Shadows.lg,
    },
    containerStyle,
  ];

  const headerStyles = [
    styles.header,
    { borderBottomColor: Colors[theme].border },
    headerStyle,
  ];

  const titleStyles = [styles.title, { color: Colors[theme].text }, titleStyle];

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {}
      {Platform.OS === "android" && (
        <StatusBar backgroundColor="rgba(0,0,0,0.5)" translucent />
      )}

      {}
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <Animated.View style={[overlayStyles, overlayAnimatedStyle]}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[containerStyles, containerAnimatedStyle, style]}
            >
              {}
              {(title || showCloseButton) && (
                <View style={headerStyles}>
                  <View style={styles.headerContent}>
                    {title && (
                      <Text style={titleStyles} numberOfLines={1}>
                        {title}
                      </Text>
                    )}

                    {showCloseButton && (
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
                    )}
                  </View>
                </View>
              )}

              {}
              <View style={styles.content}>{children}</View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
};

export interface ConfirmModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  loading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  onConfirm,
  onCancel,
  title = "Confirm",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  destructive = false,
  loading = false,
}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";

  return (
    <Modal
      visible={visible}
      onClose={onCancel}
      title={title}
      size="small"
      closeOnBackdrop={!loading}
      showCloseButton={false}
    >
      <View style={styles.confirmContent}>
        <Text style={[styles.confirmMessage, { color: Colors[theme].text }]}>
          {message}
        </Text>

        <View style={styles.confirmButtons}>
          <Button
            title={cancelText}
            variant="secondary"
            onPress={onCancel}
            disabled={loading}
            style={styles.confirmButton}
          />
          <Button
            title={confirmText}
            variant={destructive ? "destructive" : "primary"}
            onPress={onConfirm}
            loading={loading}
            style={styles.confirmButton}
          />
        </View>
      </View>
    </Modal>
  );
};

export interface AlertModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  buttonText?: string;
  type?: "info" | "success" | "warning" | "error";
}

export const AlertModal: React.FC<AlertModalProps> = ({
  visible,
  onClose,
  title,
  message,
  buttonText = "OK",
  type = "info",
}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";

  const getTypeColor = () => {
    switch (type) {
      case "success":
        return Colors[theme].success;
      case "warning":
        return Colors[theme].warning;
      case "error":
        return Colors[theme].error;
      default:
        return Colors[theme].info;
    }
  };

  const modalProps: any = {
    visible,
    onClose,
    size: "small" as const,
    showCloseButton: false,
  };

  if (title !== undefined) {
    modalProps.title = title;
  }

  return (
    <Modal {...modalProps}>
      <View style={styles.alertContent}>
        <View
          style={[styles.alertIcon, { backgroundColor: getTypeColor() + "20" }]}
        >
          <Text style={[styles.alertIconText, { color: getTypeColor() }]}>
            {type === "success"
              ? "✓"
              : type === "warning"
              ? "⚠"
              : type === "error"
              ? "✕"
              : "ℹ"}
          </Text>
        </View>

        <Text style={[styles.alertMessage, { color: Colors[theme].text }]}>
          {message}
        </Text>

        <Button
          title={buttonText}
          onPress={onClose}
          fullWidth
          style={styles.alertButton}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.md,
  },

  container: {
    overflow: "hidden",
    height: "100%",
  },

  center: {},
  bottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  top: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: BorderRadius.lg,
    borderBottomRightRadius: BorderRadius.lg,
  },

  small: {},
  medium: {},
  large: {},
  fullscreen: {
    borderRadius: 0,
  },

  header: {
    borderBottomWidth: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: Typography.fontSize["2xl"],
    fontWeight: Typography.fontWeight.semibold,
    flex: 1,
  },
  closeButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.md,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },

  content: {
    flex: 1,
  },

  confirmContent: {
    alignItems: "center",
  },
  confirmMessage: {
    fontSize: Typography.fontSize.base,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  confirmButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  confirmButton: {
    flex: 1,
    marginHorizontal: Spacing.xs,
  },

  alertContent: {
    alignItems: "center",
  },
  alertIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  alertIconText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  alertMessage: {
    fontSize: Typography.fontSize.base,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  alertButton: {
    width: "100%",
  },
});

export default Modal;
