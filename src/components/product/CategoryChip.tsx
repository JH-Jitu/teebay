import { IconSymbol } from "@/src/components/ui/icon-symbol";
import {
  BorderRadius,
  Colors,
  Spacing,
  Typography,
} from "@/src/constants/theme";
import type { Category } from "@/src/types";
import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";

export type CategoryName = string;

export interface CategoryChipProps {
  category: Category | CategoryName;
  selected?: boolean;
  onPress?: (category: Category | CategoryName) => void;
  size?: "small" | "medium" | "large";
  showIcon?: boolean;
  disabled?: boolean;
  testID?: string;
}

export const CategoryChip: React.FC<CategoryChipProps> = ({
  category,
  selected = false,
  onPress,
  size = "medium",
  disabled = false,
  testID,
}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";

  const categoryLabel =
    typeof category === "string"
      ? category
      : category.displayName || category.name;

  const categoryColor = selected ? Colors[theme].tint : "#6B7280";

  const handlePress = () => {
    if (!disabled && onPress) {
      onPress(category);
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        selected
          ? {
              backgroundColor: categoryColor + "20",
              borderColor: categoryColor,
              borderWidth: 2,
            }
          : {
              backgroundColor: Colors[theme].backgroundSecondary,
              borderColor: Colors[theme].border,
              borderWidth: 1,
            },
        disabled && styles.disabled,
        size === "small" && styles.smallContainer,
        size === "large" && styles.largeContainer,
        size === "medium" && styles.mediumContainer,
        pressed && !disabled && styles.pressed,
      ]}
      onPress={handlePress}
      disabled={disabled}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={`${categoryLabel} category ${
        selected ? "selected" : "not selected"
      }`}
    >
      <Text
        style={[
          styles.text,
          selected ? { color: categoryColor } : { color: Colors[theme].text },
          size === "small" && styles.smallText,
          size === "large" && styles.largeText,
          size === "medium" && styles.mediumText,
        ]}
      >
        {categoryLabel}
      </Text>
      {selected && (
        <View style={[styles.checkmark, { backgroundColor: categoryColor }]}>
          <IconSymbol name="checkmark" size={12} color="white" />
        </View>
      )}
    </Pressable>
  );
};

export const getCategoryLabel = (category: Category | CategoryName): string => {
  if (typeof category === "string") {
    return category;
  }
  return category.displayName || category.name;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.full,
    position: "relative",
  },

  // Size variants
  smallContainer: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    gap: Spacing.xs,
  },
  mediumContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  largeContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },

  text: {
    fontWeight: Typography.fontWeight.medium,
  },

  // Text size variants
  smallText: {
    fontSize: Typography.fontSize.xs,
  },
  mediumText: {
    fontSize: Typography.fontSize.sm,
  },
  largeText: {
    fontSize: Typography.fontSize.base,
  },

  checkmark: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: Spacing.xs,
  },

  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },

  disabled: {
    opacity: 0.5,
  },
});

export default CategoryChip;
