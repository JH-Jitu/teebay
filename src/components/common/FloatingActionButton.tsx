import { IconSymbol } from "@/src/components/ui/icon-symbol";
import { Colors, Shadows, Spacing } from "@/src/constants/theme";
import React from "react";
import { Pressable, StyleSheet, useColorScheme, ViewStyle } from "react-native";

export interface FloatingActionButtonProps {
  onPress: () => void;
  iconName?: string;
  style?: ViewStyle;
  testID?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
  iconName = "plus",
  style,
  testID,
}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";

  return (
    <Pressable
      style={({ pressed }) => [
        styles.fab,
        {
          backgroundColor: Colors[theme].tint,
          ...Shadows.lg,
        },
        pressed && styles.pressed,
        style,
      ]}
      onPress={onPress}
      testID={testID}
    >
      <IconSymbol name={iconName} size={24} color="white" />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: Spacing.xl,
    right: Spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    zIndex: 1000,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
});

export default FloatingActionButton;
