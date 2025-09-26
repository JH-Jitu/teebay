import {
  BorderRadius,
  Colors,
  ComponentThemes,
  Spacing,
  Typography,
} from "@/src/constants/theme";
import React, { forwardRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
  useColorScheme,
} from "react-native";

export type InputVariant = "default" | "outlined" | "filled";
export type InputSize = "sm" | "md" | "lg";

export interface InputProps extends Omit<TextInputProps, "style"> {
  label?: string;
  error?: string;
  hint?: string;
  variant?: InputVariant;
  size?: InputSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  fullWidth?: boolean;
  required?: boolean;
  disabled?: boolean;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  hintStyle?: TextStyle;
}

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      hint,
      variant = "default",
      size = "lg",
      leftIcon,
      rightIcon,
      onRightIconPress,
      fullWidth = true,
      required = false,
      disabled = false,
      containerStyle,
      inputStyle,
      labelStyle,
      errorStyle,
      hintStyle,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? "light";
    const [isFocused, setIsFocused] = useState(false);

    const inputTheme =
      ComponentThemes.input.default[
        theme as keyof typeof ComponentThemes.input.default
      ];

    const getBorderColor = () => {
      if (error) return Colors[theme].error;
      if (isFocused) return Colors[theme].primary;
      return inputTheme.borderColor;
    };

    const handleFocus = (event: any) => {
      setIsFocused(true);
      onFocus?.(event);
    };

    const handleBlur = (event: any) => {
      setIsFocused(false);
      onBlur?.(event);
    };

    const containerStyles = [
      styles.container,
      fullWidth && styles.fullWidth,
      containerStyle,
    ];

    const inputContainerStyles = [
      styles.inputContainer,
      styles[size],
      styles[variant],
      {
        backgroundColor: inputTheme.backgroundColor,
        borderColor: getBorderColor(),
      },
      isFocused && styles.focused,
      error && styles.error,
      disabled && styles.disabled,
    ];

    const textInputStyles = [
      styles.input,
      styles[`input_${size}`],
      {
        color: inputTheme.textColor,
      },
      disabled && styles.inputDisabled,
      inputStyle,
    ];

    const labelStyles = [
      styles.label,
      { color: Colors[theme].text },
      error && { color: Colors[theme].error },
      labelStyle,
    ];

    const errorStyles = [
      styles.errorText,
      { color: Colors[theme].error },
      errorStyle,
    ];

    const hintStyles = [
      styles.hintText,
      { color: Colors[theme].textMuted },
      hintStyle,
    ];

    return (
      <View style={containerStyles}>
        {label && (
          <Text style={labelStyles}>
            {label}
            {required && <Text style={{ color: Colors[theme].error }}> *</Text>}
          </Text>
        )}
        <View style={inputContainerStyles}>
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
          <TextInput
            ref={ref}
            style={textInputStyles}
            placeholderTextColor={inputTheme.placeholderColor}
            selectionColor={Colors[theme].primary}
            cursorColor={Colors[theme].primary}
            editable={!disabled}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
          {rightIcon && (
            <TouchableOpacity
              style={styles.rightIcon}
              onPress={onRightIconPress}
              disabled={!onRightIconPress}
              activeOpacity={onRightIconPress ? 0.7 : 1}
            >
              {rightIcon}
            </TouchableOpacity>
          )}
        </View>
        {error && <Text style={errorStyles}>{error}</Text>}
        {hint && !error && <Text style={hintStyles}>{hint}</Text>}
      </View>
    );
  }
);

Input.displayName = "Input";

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  fullWidth: {
    width: "100%",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: BorderRadius.md,
  },

  default: {
    backgroundColor: "transparent",
  },
  outlined: {
    backgroundColor: "transparent",
  },
  filled: {},

  sm: {
    minHeight: 36,
    paddingHorizontal: Spacing.sm,
  },
  md: {
    minHeight: 44,
    paddingHorizontal: Spacing.md,
  },
  lg: {
    minHeight: 52,
    paddingHorizontal: Spacing.lg,
  },

  focused: {},
  error: {},
  disabled: {
    opacity: 0.5,
  },

  input: {
    flex: 1,
    fontSize: Typography.fontSize.base,

    paddingVertical: Spacing.sm,
  },
  input_sm: {
    fontSize: Typography.fontSize.sm,
  },
  input_md: {
    fontSize: Typography.fontSize.base,
  },
  input_lg: {
    fontSize: Typography.fontSize.lg,
  },
  inputDisabled: {
    opacity: 0.7,
  },

  leftIcon: {
    marginRight: Spacing.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  rightIcon: {
    marginLeft: Spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 24,
    minHeight: 24,
  },

  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.xs,
  },

  errorText: {
    fontSize: Typography.fontSize.xs,
    marginTop: Spacing.xs,
  },

  hintText: {
    fontSize: Typography.fontSize.xs,
    marginTop: Spacing.xs,
  },
});

export const EmailInput: React.FC<
  Omit<InputProps, "keyboardType" | "autoCapitalize" | "autoComplete">
> = (props) => (
  <Input
    keyboardType="email-address"
    autoCapitalize="none"
    autoComplete="email"
    textContentType="emailAddress"
    {...props}
  />
);

export const PasswordInput: React.FC<
  Omit<InputProps, "secureTextEntry" | "autoCapitalize" | "autoComplete">
> = (props) => {
  const [isSecure, setIsSecure] = useState(true);
  const colorScheme = useColorScheme();

  return (
    <Input
      secureTextEntry={isSecure}
      autoCapitalize="none"
      autoComplete="password"
      textContentType="password"
      placeholder="Enter password"
      rightIcon={
        <Text
          style={{
            color: Colors[colorScheme ?? "dark"].textSecondary,
          }}
        >
          {isSecure ? "Show" : "Hide"}
        </Text>
      }
      onRightIconPress={() => setIsSecure(!isSecure)}
      {...props}
    />
  );
};

export const PhoneInput: React.FC<
  Omit<InputProps, "keyboardType" | "autoComplete">
> = (props) => (
  <Input
    keyboardType="phone-pad"
    autoComplete="tel"
    textContentType="telephoneNumber"
    {...props}
  />
);

export const SearchInput: React.FC<
  Omit<InputProps, "placeholder" | "autoCapitalize">
> = (props) => (
  <Input
    placeholder="Search..."
    autoCapitalize="none"
    clearButtonMode="while-editing"
    returnKeyType="search"
    {...props}
  />
);

export const NumericInput: React.FC<Omit<InputProps, "keyboardType">> = (
  props
) => <Input keyboardType="numeric" {...props} />;

export const CurrencyInput: React.FC<
  Omit<InputProps, "keyboardType" | "leftIcon">
> = (props) => {
  const colorScheme = useColorScheme();

  return (
    <Input
      keyboardType="numeric"
      leftIcon={
        <Text
          style={{
            color: Colors[colorScheme ?? "light"].textSecondary,
          }}
        >
          $
        </Text>
      }
      {...props}
    />
  );
};

export default Input;
