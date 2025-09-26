import { Input } from "@/src/components/common/Input";
import { Colors, Spacing, Typography } from "@/src/constants/theme";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";

export interface ProductDetailsData {
  title: string;
  description: string;
}

export interface ProductDetailsStepProps {
  data: ProductDetailsData;
  onChange: (data: Partial<ProductDetailsData>) => void;
  errors?: Partial<ProductDetailsData>;
  testID?: string;
}

export const ProductDetailsStep: React.FC<ProductDetailsStepProps> = ({
  data,
  onChange,
  errors,
  testID,
}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";

  const handleTitleChange = (title: string) => {
    onChange({ title });
  };

  const handleDescriptionChange = (description: string) => {
    onChange({ description });
  };

  const getTitleCharacterCount = () => {
    const maxLength = 100;
    const currentLength = data.title?.length || 0;
    return {
      current: currentLength,
      max: maxLength,
      isValid: currentLength <= maxLength,
    };
  };

  const getDescriptionCharacterCount = () => {
    const maxLength = 500;
    const currentLength = data.description?.length || 0;
    return {
      current: currentLength,
      max: maxLength,
      isValid: currentLength <= maxLength,
    };
  };

  const titleCount = getTitleCharacterCount();
  const descriptionCount = getDescriptionCharacterCount();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      testID={testID}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.stepTitle, { color: Colors[theme].text }]}>
            Product Details
          </Text>
          <Text
            style={[
              styles.stepDescription,
              { color: Colors[theme].textSecondary },
            ]}
          >
            Tell us about your product. Be descriptive and accurate to attract
            the right buyers and renters.
          </Text>
        </View>

        {/* Title Input */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.fieldLabel, { color: Colors[theme].text }]}>
            Product Title *
          </Text>
          <Text
            style={[styles.fieldHint, { color: Colors[theme].textSecondary }]}
          >
            Choose a clear, descriptive title that buyers will search for
          </Text>

          <Input
            value={data.title || ""}
            onChangeText={handleTitleChange}
            placeholder="e.g. iPhone 14 Pro Max 256GB"
            error={errors?.title}
            maxLength={100}
            testID="product-title-input"
          />

          <View style={styles.characterCountContainer}>
            <Text
              style={[
                styles.characterCount,
                {
                  color: titleCount.isValid
                    ? Colors[theme].textSecondary
                    : Colors[theme].error,
                },
              ]}
            >
              {titleCount.current}/{titleCount.max} characters
            </Text>
          </View>
        </View>

        {/* Description Input */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.fieldLabel, { color: Colors[theme].text }]}>
            Description *
          </Text>
          <Text
            style={[styles.fieldHint, { color: Colors[theme].textSecondary }]}
          >
            Provide details about condition, features, and what makes your
            product special
          </Text>

          <Input
            value={data.description || ""}
            onChangeText={handleDescriptionChange}
            placeholder="Describe your product in detail..."
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            error={errors?.description}
            maxLength={500}
            testID="product-description-input"
          />

          <View style={styles.characterCountContainer}>
            <Text
              style={[
                styles.characterCount,
                {
                  color: descriptionCount.isValid
                    ? Colors[theme].textSecondary
                    : Colors[theme].error,
                },
              ]}
            >
              {descriptionCount.current}/{descriptionCount.max} characters
            </Text>
          </View>
        </View>

        {/* Validation Summary */}
        {(errors?.title || errors?.description) && (
          <View
            style={[
              styles.errorSummary,
              {
                backgroundColor: Colors[theme].error + "10",
                borderColor: Colors[theme].error + "20",
              },
            ]}
          >
            <Text style={[styles.errorTitle, { color: Colors[theme].error }]}>
              Please fix the following issues:
            </Text>
            {errors?.title && (
              <Text style={[styles.errorItem, { color: Colors[theme].error }]}>
                • {errors.title}
              </Text>
            )}
            {errors?.description && (
              <Text style={[styles.errorItem, { color: Colors[theme].error }]}>
                • {errors.description}
              </Text>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
  fieldContainer: {
    marginBottom: Spacing.xl,
  },
  fieldLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.xs,
  },
  fieldHint: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  input: {
    marginBottom: Spacing.xs,
  },
  textAreaInput: {
    minHeight: 120,
    paddingTop: Spacing.md,
  },
  characterCountContainer: {
    alignItems: "flex-end",
  },
  characterCount: {
    fontSize: Typography.fontSize.xs,
  },
  tipsContainer: {
    padding: Spacing.lg,
    borderRadius: 12,
    marginBottom: Spacing.xl,
  },
  tipsTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.md,
  },
  tipsList: {
    gap: Spacing.sm,
  },
  tipItem: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 20,
  },
  errorSummary: {
    padding: Spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
  },
  errorTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.md,
  },
  errorItem: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.xs,
  },
});

export default ProductDetailsStep;
