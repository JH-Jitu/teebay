import {
  BorderRadius,
  Colors,
  Spacing,
  Typography,
} from "@/src/constants/theme";
import type { AuthInputProps } from "@/src/types";
import React, { useState } from "react";
import {
  KeyboardTypeOptions,
  StyleSheet,
  Text,
  TextInput,
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

export const AuthInput: React.FC<AuthInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  error,
  autoCapitalize = "none",
  keyboardType = "default",
  testID,
}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  const focusAnimation = useSharedValue(0);
  const errorAnimation = useSharedValue(0);

  const handleFocus = () => {
    setIsFocused(true);
    focusAnimation.value = withSpring(1, { damping: 12, stiffness: 100 });
  };

  const handleBlur = () => {
    setIsFocused(false);
    focusAnimation.value = withSpring(0, { damping: 12, stiffness: 100 });
  };

  React.useEffect(() => {
    errorAnimation.value = withTiming(error ? 1 : 0, { duration: 200 });
  }, [error]);

  const animatedLabelStyle = useAnimatedStyle(() => {
    const translateY = focusAnimation.value * -10;
    const scale = 1 - focusAnimation.value * 0.12;
    const opacity = 0.7 + focusAnimation.value * 0.3;

    return {
      transform: [{ translateY }, { scale }],
      opacity,
    };
  });

  const animatedBorderStyle = useAnimatedStyle(() => {
    const borderWidth = 1 + focusAnimation.value * 1;
    return { borderWidth };
  });

  const animatedErrorStyle = useAnimatedStyle(() => {
    const opacity = errorAnimation.value;
    const translateY = (1 - errorAnimation.value) * -5;
    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  const getBorderColor = () => {
    if (error) return Colors[theme].error;
    if (isFocused) return Colors[theme].primary;
    return Colors[theme].border;
  };

  const getTextColor = () => {
    return Colors[theme].text;
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const containerStyles = [
    styles.container,
    {
      borderColor: getBorderColor(),
      backgroundColor: Colors[theme].inputBackground,
    },
  ];

  return (
    <View style={styles.wrapper} testID={testID}>
      <Animated.View style={[containerStyles, animatedBorderStyle]}>
        <Animated.Text
          style={[
            styles.label,
            { color: getBorderColor() },
            animatedLabelStyle,
          ]}
        >
          {label}
        </Animated.Text>

        <View style={styles.inputWrapper}>
          <TextInput
            style={[styles.input, { color: getTextColor() }]}
            value={value}
            onChangeText={onChangeText}
            placeholder={label ? undefined : placeholder}
            placeholderTextColor={Colors[theme].textSecondary}
            secureTextEntry={secureTextEntry && !isPasswordVisible}
            autoCapitalize={autoCapitalize}
            keyboardType={keyboardType as KeyboardTypeOptions}
            onFocus={handleFocus}
            onBlur={handleBlur}
            selectionColor={Colors[theme].primary}
            autoCorrect={false}
            spellCheck={false}
            testID={`${testID}-input`}
            accessible={true}
            accessibilityLabel={label}
            accessibilityHint={error || `Enter your ${label?.toLowerCase()}`}
            accessibilityRole="text"
          />

          {secureTextEntry && (
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={togglePasswordVisibility}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              testID={`${testID}-toggle-password`}
              accessible={true}
              accessibilityLabel={`${
                isPasswordVisible ? "Hide" : "Show"
              } password`}
              accessibilityRole="button"
            >
              <Text
                style={[styles.eyeIcon, { color: Colors[theme].textSecondary }]}
              >
                {isPasswordVisible ? "👁️" : "👁️‍🗨️"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      {error && (
        <Animated.View style={[styles.errorContainer, animatedErrorStyle]}>
          <Text style={[styles.errorText, { color: Colors[theme].error }]}>
            {error}
          </Text>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.md,
  },
  container: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 56,
    justifyContent: "center",
    position: "relative",
  },
  label: {
    position: "absolute",
    left: Spacing.md,
    top: Spacing.sm,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    zIndex: 1,
    backgroundColor: "transparent",
    paddingHorizontal: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.normal,
    paddingVertical: 0,
    minHeight: 24,
  },
  eyeButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  eyeIcon: {
    fontSize: 20,
  },
  errorContainer: {
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  errorText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    
  },
});

export default AuthInput;
