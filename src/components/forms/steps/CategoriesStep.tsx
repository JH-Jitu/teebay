import {
  CategoryChip,
  CategoryName,
} from "@/src/components/product/CategoryChip";
import { Colors, Spacing, Typography } from "@/src/constants/theme";
import { useCategories } from "@/src/hooks/api/useProducts";
import type { Category } from "@/src/types";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";

export interface CategoriesData {
  categories: CategoryName[];
}

export interface CategoriesStepProps {
  data: CategoriesData;
  onChange: (data: Partial<CategoriesData>) => void;
  errors?: { categories?: string };
  testID?: string;
}

export const CategoriesStep: React.FC<CategoriesStepProps> = ({
  data,
  onChange,
  errors,
  testID,
}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";

  const { data: categoriesData, isLoading: categoriesLoading } =
    useCategories();
  const allCategories = categoriesData || [];
  const selectedCategories = data.categories || [];
  const maxCategories = 3;
  const minCategories = 1;

  const handleCategoryToggle = (category: Category | CategoryName) => {
    const categoryId = typeof category === "string" ? category : category.id;
    const isSelected = selectedCategories.includes(categoryId);

    if (isSelected) {
      const newCategories = selectedCategories.filter((c) => c !== categoryId);
      onChange({ categories: newCategories });
    } else {
      if (selectedCategories.length < maxCategories) {
        const newCategories = [...selectedCategories, categoryId];
        onChange({ categories: newCategories });
      }
    }
  };

  const isSelectionValid = () => {
    return (
      selectedCategories.length >= minCategories &&
      selectedCategories.length <= maxCategories
    );
  };

  const getSelectionStatus = () => {
    const count = selectedCategories.length;
    if (count === 0) {
      return {
        message: `Select at least ${minCategories} category`,
        color: Colors[theme].textSecondary,
      };
    }
    if (count < minCategories) {
      return {
        message: `Select at least ${minCategories} category`,
        color: Colors[theme].error,
      };
    }
    if (count >= maxCategories) {
      return {
        message: "Maximum categories selected",
        color: Colors[theme].warning,
      };
    }
    return {
      message: `${maxCategories - count} more can be selected`,
      color: Colors[theme].success,
    };
  };

  const selectionStatus = getSelectionStatus();

  const renderCategoryGrid = () => {
    if (categoriesLoading) {
      return (
        <View style={styles.loadingContainer}>
          <Text
            style={[styles.loadingText, { color: Colors[theme].textSecondary }]}
          >
            Loading categories...
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.categoryGrid}>
        {allCategories.map((category) => {
          const categoryId = category.id;
          const isSelected = selectedCategories.includes(categoryId);
          const isDisabled =
            !isSelected && selectedCategories.length >= maxCategories;

          return (
            <CategoryChip
              key={categoryId}
              category={category}
              selected={isSelected}
              onPress={handleCategoryToggle}
              size="large"
              disabled={isDisabled}
              testID={`category-chip-${categoryId}`}
            />
          );
        })}
      </View>
    );
  };

  const renderSelectedCategories = () => {
    if (selectedCategories.length === 0) return null;

    return (
      <View style={styles.selectedSection}>
        <Text style={[styles.selectedTitle, { color: Colors[theme].text }]}>
          Selected Categories ({selectedCategories.length})
        </Text>
        <View style={styles.selectedList}>
          {selectedCategories.map((categoryId) => {
            const category = allCategories.find((c) => c.id === categoryId);
            return (
              <CategoryChip
                key={`selected-${categoryId}`}
                category={category || categoryId}
                selected={true}
                onPress={handleCategoryToggle}
                size="medium"
                testID={`selected-category-${categoryId}`}
              />
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      testID={testID}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.stepTitle, { color: Colors[theme].text }]}>
            Choose Categories
          </Text>
          <Text
            style={[
              styles.stepDescription,
              { color: Colors[theme].textSecondary },
            ]}
          >
            Select up to {maxCategories} categories that best describe your
            product. This helps buyers find your item.
          </Text>
        </View>

        {/* Selection Status */}
        <View
          style={[
            styles.statusContainer,
            { backgroundColor: Colors[theme].backgroundSecondary },
          ]}
        >
          <Text style={[styles.statusText, { color: selectionStatus.color }]}>
            {selectionStatus.message}
          </Text>
          <View style={styles.progressDots}>
            {Array.from({ length: maxCategories }).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  {
                    backgroundColor:
                      index < selectedCategories.length
                        ? Colors[theme].success
                        : Colors[theme].border,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Category Grid */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors[theme].text }]}>
            All Categories
          </Text>
          {renderCategoryGrid()}
        </View>

        {/* Selected Categories */}
        {renderSelectedCategories()}

        {/* Error Display */}
        {errors?.categories && (
          <View
            style={[
              styles.errorContainer,
              {
                backgroundColor: Colors[theme].error + "10",
                borderColor: Colors[theme].error + "20",
              },
            ]}
          >
            <Text style={[styles.errorText, { color: Colors[theme].error }]}>
              {errors.categories}
            </Text>
          </View>
        )}

        {/* Validation Summary */}
        <View
          style={[
            styles.validationSummary,
            {
              backgroundColor: isSelectionValid()
                ? Colors[theme].success + "10"
                : Colors[theme].warning + "10",
            },
          ]}
        >
          <Text
            style={[
              styles.validationText,
              {
                color: isSelectionValid()
                  ? Colors[theme].success
                  : Colors[theme].warning,
              },
            ]}
          >
            {isSelectionValid()
              ? "✓ Category selection is valid"
              : `⚠ Please select ${minCategories}-${maxCategories} categories`}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  stepTitle: {
    fontSize: Typography.fontSize["2xl"],
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.sm,
  },
  stepDescription: {
    fontSize: Typography.fontSize.base,
    lineHeight: 24,
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: 12,
  },
  statusText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
  progressDots: {
    flexDirection: "row",
    gap: Spacing.xs,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.md,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  selectedSection: {
    marginBottom: Spacing.xl,
  },
  selectedTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.md,
  },
  selectedList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  guidelinesContainer: {
    padding: Spacing.lg,
    borderRadius: 12,
    marginBottom: Spacing.xl,
  },
  guidelinesTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.md,
  },
  guidelinesList: {
    gap: Spacing.sm,
  },
  guidelineItem: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 20,
  },
  errorContainer: {
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  errorText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  validationSummary: {
    padding: Spacing.md,
    borderRadius: 12,
  },
  validationText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    textAlign: "center",
  },
  loadingContainer: {
    padding: Spacing.xl,
    alignItems: "center",
  },
  loadingText: {
    fontSize: Typography.fontSize.base,
    fontStyle: "italic",
  },
});

export default CategoriesStep;
