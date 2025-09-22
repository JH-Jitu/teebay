

import {
  BorderRadius,
  ComponentThemes,
  Spacing,
  Typography,
} from "@/src/constants/theme";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
  useColorScheme,
} from "react-native";





export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends Omit<TouchableOpacityProps, "style"> {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  loadingColor?: string;
}





export const Button: React.FC<ButtonProps> = ({
  title,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  loadingColor,
  onPress,
  ...props
}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";

  
  const variantTheme =
    ComponentThemes.button[variant][
      theme as keyof (typeof ComponentThemes.button)[typeof variant]
    ];

  
  const buttonStyles = [
    styles.base,
    styles[size],
    {
      backgroundColor: variantTheme.backgroundColor,
      borderColor: variantTheme.borderColor,
    },
    fullWidth && styles.fullWidth,
    (disabled || loading) && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`text_${size}`],
    { color: variantTheme.textColor },
    (disabled || loading) && styles.textDisabled,
    textStyle,
  ];

  
  const handlePress = (event: any) => {
    if (loading || disabled || !onPress) return;
    onPress(event);
  };

  
  const indicatorColor =
    loadingColor ||
    (variant === "primary" || variant === "destructive"
      ? "#FFFFFF"
      : variantTheme.textColor);

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      <View style={styles.content}>
        {}
        {leftIcon && !loading && (
          <View style={[styles.icon, styles.leftIcon]}>{leftIcon}</View>
        )}

        {}
        {loading && (
          <View style={[styles.icon, styles.leftIcon]}>
            <ActivityIndicator
              size={size === "sm" ? "small" : "small"}
              color={indicatorColor}
            />
          </View>
        )}

        {}
        <Text style={textStyles} numberOfLines={1}>
          {title}
        </Text>

        {}
        {rightIcon && !loading && (
          <View style={[styles.icon, styles.rightIcon]}>{rightIcon}</View>
        )}
      </View>
    </TouchableOpacity>
  );
};





const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  
  sm: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 36,
  },
  md: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    minHeight: 44,
  },
  lg: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    minHeight: 52,
  },

  
  disabled: {
    opacity: 0.5,
  },
  fullWidth: {
    width: "100%",
  },

  
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  
  icon: {
    alignItems: "center",
    justifyContent: "center",
  },
  leftIcon: {
    marginRight: Spacing.sm,
  },
  rightIcon: {
    marginLeft: Spacing.sm,
  },

  
  text: {
    fontWeight: Typography.fontWeight.medium,
    textAlign: "center",
  },
  text_sm: {
    fontSize: Typography.fontSize.sm,
  },
  text_md: {
    fontSize: Typography.fontSize.base,
  },
  text_lg: {
    fontSize: Typography.fontSize.lg,
  },
  textDisabled: {
    opacity: 0.7,
  },
});






export const PrimaryButton: React.FC<Omit<ButtonProps, "variant">> = (
  props
) => <Button variant="primary" {...props} />;


export const SecondaryButton: React.FC<Omit<ButtonProps, "variant">> = (
  props
) => <Button variant="secondary" {...props} />;


export const GhostButton: React.FC<Omit<ButtonProps, "variant">> = (props) => (
  <Button variant="ghost" {...props} />
);


export const DestructiveButton: React.FC<Omit<ButtonProps, "variant">> = (
  props
) => <Button variant="destructive" {...props} />;

export default Button;
