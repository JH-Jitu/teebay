

import { Colors, Spacing, Typography } from "@/src/constants/theme";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
  useColorScheme,
} from "react-native";





export type LoadingSize = "small" | "large";

export interface LoadingSpinnerProps {
  size?: LoadingSize;
  color?: string;
  message?: string;
  overlay?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}





export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "large",
  color,
  message,
  overlay = false,
  style,
  textStyle,
}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";

  
  const spinnerColor = color || Colors[theme].primary;

  
  const containerStyles = [
    styles.container,
    overlay && styles.overlay,
    overlay && { backgroundColor: Colors[theme].background + "CC" }, 
    style,
  ];

  const textStyles = [styles.text, { color: Colors[theme].text }, textStyle];

  return (
    <View style={containerStyles}>
      <ActivityIndicator size={size} color={spinnerColor} />
      {message && <Text style={textStyles}>{message}</Text>}
    </View>
  );
};





export interface FullScreenLoadingProps {
  message?: string;
  color?: string;
}

export const FullScreenLoading: React.FC<FullScreenLoadingProps> = ({
  message = "Loading...",
  color,
}) => {
  const props: any = {
    size: "large" as const,
    message,
    overlay: true,
    style: styles.fullScreen,
  };

  if (color !== undefined) {
    props.color = color;
  }

  return <LoadingSpinner {...props} />;
};





export interface InlineLoadingProps {
  message?: string;
  size?: LoadingSize;
  color?: string;
  style?: ViewStyle;
}

export const InlineLoading: React.FC<InlineLoadingProps> = ({
  message,
  size = "small",
  color,
  style,
}) => {
  const props: any = {
    size,
    message,
    style: StyleSheet.flatten([styles.inline, style]),
  };

  if (color !== undefined) {
    props.color = color;
  }

  return <LoadingSpinner {...props} />;
};





export interface ButtonLoadingProps {
  color?: string;
}

export const ButtonLoading: React.FC<ButtonLoadingProps> = ({
  color = "#FFFFFF",
}) => {
  return (
    <ActivityIndicator
      size="small"
      color={color}
      style={styles.buttonLoading}
    />
  );
};





export interface SectionLoadingProps {
  title?: string;
  message?: string;
  height?: number;
  color?: string;
}

export const SectionLoading: React.FC<SectionLoadingProps> = ({
  title,
  message = "Loading...",
  height = 200,
  color,
}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";

  const spinnerProps: any = {
    size: "large" as const,
    message,
  };

  if (color !== undefined) {
    spinnerProps.color = color;
  }

  return (
    <View style={[styles.section, { height }]}>
      {title && (
        <Text style={[styles.sectionTitle, { color: Colors[theme].text }]}>
          {title}
        </Text>
      )}
      <LoadingSpinner {...spinnerProps} />
    </View>
  );
};





const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.md,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  fullScreen: {
    flex: 1,
  },
  inline: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  buttonLoading: {
    
  },
  section: {
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  text: {
    fontSize: Typography.fontSize.base,
    lineHeight: Typography.lineHeight.normal,
    marginTop: Spacing.md,
    textAlign: "center",
  },
});

export default LoadingSpinner;
