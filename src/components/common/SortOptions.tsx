import {
  BorderRadius,
  Colors,
  Spacing,
  Typography,
} from "@/src/constants/theme";
import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";

export interface SortOption {
  key: string;
  label: string;
}

export interface SortOptionsProps {
  options: SortOption[];
  selectedOption: string;
  onSortChange: (option: string) => void;
  style?: any;
}

export const SortOptions: React.FC<SortOptionsProps> = ({
  options,
  selectedOption,
  onSortChange,
  style,
}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";

  return (
    <View style={[styles.container, style]}>
      <View style={styles.sortContainer}>
        <Text style={[styles.label, { color: Colors[theme].textSecondary }]}>
          Sort by:
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.optionsContainer}
          style={styles.optionsScrollView}
        >
          {options.map((option) => (
            <Pressable
              key={option.key}
              style={[
                styles.option,
                selectedOption === option.key && styles.selectedOption,
                selectedOption === option.key && {
                  backgroundColor: Colors[theme].tint,
                },
              ]}
              onPress={() => onSortChange(option.key)}
            >
              <Text
                style={[
                  styles.optionText,
                  {
                    color:
                      selectedOption === option.key
                        ? "white"
                        : Colors[theme].textSecondary,
                  },
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  sortContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    marginRight: Spacing.sm,
  },
  optionsContainer: {
    flexDirection: "row",
    gap: Spacing.xs,
    paddingRight: Spacing.lg,
  },
  optionsScrollView: {
    flex: 1,
  },
  option: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedOption: {
    // backgroundColor set dynamically
  },
  optionText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
  },
});
