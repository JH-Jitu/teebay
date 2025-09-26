import { Button } from "@/src/components/common/Button";
import { CategoryChip } from "@/src/components/product/CategoryChip";
import { PriceDisplay } from "@/src/components/product/PriceDisplay";
import { IconSymbol } from "@/src/components/ui/icon-symbol";
import {
  BorderRadius,
  Colors,
  Spacing,
  Typography,
} from "@/src/constants/theme";
import React, { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  useColorScheme,
  View,
} from "react-native";
import type { CategoriesData } from "./CategoriesStep";
import type { ImagesData } from "./ImagesStep";
import type { PricingData } from "./PricingStep";
import type { ProductDetailsData } from "./ProductDetailsStep";

export interface ReviewData {
  productDetails: ProductDetailsData;
  categories: CategoriesData;
  pricing: PricingData;
  images: ImagesData;
  acceptTerms: boolean;
}

export interface ReviewStepProps {
  data: ReviewData;
  onChange: (data: Partial<ReviewData>) => void;
  onEditStep: (stepIndex: number) => void;
  errors?: { acceptTerms?: string };
  testID?: string;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  data,
  onChange,
  onEditStep,
  errors,
  testID,
}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  );

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const handleTermsToggle = (value: boolean) => {
    onChange({ acceptTerms: value });
  };

  const renderSectionHeader = (
    title: string,
    stepIndex: number,
    isValid: boolean,
    sectionKey: string
  ) => {
    const isExpanded = expandedSections.has(sectionKey);

    return (
      <View style={styles.sectionHeader}>
        <Pressable
          style={styles.sectionHeaderContent}
          onPress={() => toggleSection(sectionKey)}
          testID={`review-section-${sectionKey}`}
        >
          <View style={styles.sectionHeaderLeft}>
            <View
              style={[
                styles.sectionNumber,
                {
                  backgroundColor: isValid
                    ? Colors[theme].success
                    : Colors[theme].warning,
                },
              ]}
            >
              <Text style={styles.sectionNumberText}>{stepIndex + 1}</Text>
            </View>
            <Text style={[styles.sectionTitle, { color: Colors[theme].text }]}>
              {title}
            </Text>
          </View>
          <View style={styles.sectionHeaderRight}>
            <Button
              title="Edit"
              variant="secondary"
              size="sm"
              onPress={() => onEditStep(stepIndex)}
              style={styles.editButton}
              testID={`edit-step-${stepIndex}`}
            />
            <IconSymbol
              name={isExpanded ? "chevron.up" : "chevron.down"}
              size={20}
              color={Colors[theme].textSecondary}
            />
          </View>
        </Pressable>
      </View>
    );
  };

  const renderProductDetails = () => {
    const isExpanded = expandedSections.has("details");
    const isValid = !!(
      data.productDetails.title && data.productDetails.description
    );

    return (
      <View
        style={[styles.section, { backgroundColor: Colors[theme].background }]}
      >
        {renderSectionHeader("Product Details", 0, isValid, "details")}

        {isExpanded && (
          <View style={styles.sectionContent}>
            <View style={styles.detailItem}>
              <Text
                style={[
                  styles.detailLabel,
                  { color: Colors[theme].textSecondary },
                ]}
              >
                Title:
              </Text>
              <Text style={[styles.detailValue, { color: Colors[theme].text }]}>
                {data.productDetails.title || "Not specified"}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Text
                style={[
                  styles.detailLabel,
                  { color: Colors[theme].textSecondary },
                ]}
              >
                Description:
              </Text>
              <Text style={[styles.detailValue, { color: Colors[theme].text }]}>
                {data.productDetails.description || "Not specified"}
              </Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderCategories = () => {
    const isExpanded = expandedSections.has("categories");
    const isValid =
      data.categories.categories && data.categories.categories.length > 0;

    return (
      <View
        style={[styles.section, { backgroundColor: Colors[theme].background }]}
      >
        {renderSectionHeader("Categories", 1, isValid, "categories")}

        {isExpanded && (
          <View style={styles.sectionContent}>
            {isValid ? (
              <View style={styles.categoriesGrid}>
                {data.categories.categories.map((category) => (
                  <CategoryChip
                    key={category}
                    category={category}
                    selected={true}
                    size="medium"
                  />
                ))}
              </View>
            ) : (
              <Text
                style={[
                  styles.emptyText,
                  { color: Colors[theme].textSecondary },
                ]}
              >
                No categories selected
              </Text>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderPricing = () => {
    const isExpanded = expandedSections.has("pricing");
    const isValid =
      (data.pricing.availableForSale && data.pricing.purchasePrice) ||
      (data.pricing.availableForRent && data.pricing.rentPrice);

    return (
      <View
        style={[styles.section, { backgroundColor: Colors[theme].background }]}
      >
        {renderSectionHeader("Pricing", 2, isValid, "pricing")}

        {isExpanded && (
          <View style={styles.sectionContent}>
            {isValid ? (
              <PriceDisplay
                purchasePrice={
                  data.pricing.availableForSale
                    ? data.pricing.purchasePrice
                    : undefined
                }
                rentPrice={
                  data.pricing.availableForRent
                    ? data.pricing.rentPrice
                    : undefined
                }
                rentOption={data.pricing.rentOption}
                variant="vertical"
                size="large"
                showIcons={true}
              />
            ) : (
              <Text
                style={[
                  styles.emptyText,
                  { color: Colors[theme].textSecondary },
                ]}
              >
                No pricing configured
              </Text>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderImages = () => {
    const isExpanded = expandedSections.has("images");
    const hasImages = data.images.images && data.images.images.length > 0;

    return (
      <View
        style={[styles.section, { backgroundColor: Colors[theme].background }]}
      >
        {renderSectionHeader("Images", 3, true, "images")}{" "}
        {/* Images are optional */}
        {isExpanded && (
          <View style={styles.sectionContent}>
            {hasImages ? (
              <View style={styles.imagesGrid}>
                {data.images.images.map((uri, index) => (
                  <Image
                    key={index}
                    source={{ uri }}
                    style={styles.reviewImage}
                    resizeMode="cover"
                  />
                ))}
              </View>
            ) : (
              <Text
                style={[
                  styles.emptyText,
                  { color: Colors[theme].textSecondary },
                ]}
              >
                No images added
              </Text>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderProductPreview = () => (
    <View
      style={[
        styles.previewContainer,
        { backgroundColor: Colors[theme].backgroundSecondary },
      ]}
    >
      <Text style={[styles.previewTitle, { color: Colors[theme].text }]}>
        📱 Product Preview
      </Text>
      <Text
        style={[
          styles.previewDescription,
          { color: Colors[theme].textSecondary },
        ]}
      >
        This is how your product will appear to buyers:
      </Text>

      <View
        style={[
          styles.previewCard,
          { backgroundColor: Colors[theme].background },
        ]}
      >
        <View style={styles.previewHeader}>
          {data.images.images && data.images.images.length > 0 ? (
            <Image
              source={{ uri: data.images.images[0] }}
              style={styles.previewImage}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[
                styles.previewImagePlaceholder,
                { backgroundColor: Colors[theme].backgroundSecondary },
              ]}
            >
              <IconSymbol
                name="camera"
                size={32}
                color={Colors[theme].textSecondary}
              />
            </View>
          )}

          <View style={styles.previewContent}>
            <Text
              style={[
                styles.previewProductTitle,
                { color: Colors[theme].text },
              ]}
              numberOfLines={2}
            >
              {data.productDetails.title || "Product Title"}
            </Text>

            <PriceDisplay
              purchasePrice={
                data.pricing.availableForSale
                  ? data.pricing.purchasePrice
                  : undefined
              }
              rentPrice={
                data.pricing.availableForRent
                  ? data.pricing.rentPrice
                  : undefined
              }
              rentOption={data.pricing.rentOption}
              variant="compact"
              size="small"
            />

            {data.categories.categories &&
              data.categories.categories.length > 0 && (
                <View style={styles.previewCategories}>
                  {data.categories.categories.slice(0, 2).map((category) => (
                    <CategoryChip
                      key={category}
                      category={category}
                      selected={true}
                      size="small"
                    />
                  ))}
                  {data.categories.categories.length > 2 && (
                    <Text
                      style={[
                        styles.previewMoreCategories,
                        { color: Colors[theme].textSecondary },
                      ]}
                    >
                      +{data.categories.categories.length - 2} more
                    </Text>
                  )}
                </View>
              )}
          </View>
        </View>
      </View>
    </View>
  );

  const renderTermsAndConditions = () => (
    <View style={styles.termsContainer}>
      <Text style={[styles.termsTitle, { color: Colors[theme].text }]}>
        Terms and Conditions
      </Text>

      <View style={styles.termsCheckbox}>
        <Switch
          value={data.acceptTerms}
          onValueChange={handleTermsToggle}
          trackColor={{
            false: Colors[theme].border,
            true: Colors[theme].tint + "50",
          }}
          thumbColor={
            data.acceptTerms
              ? Colors[theme].tint
              : Colors[theme].backgroundSecondary
          }
          testID="accept-terms-switch"
        />
        <Pressable
          style={styles.termsTextContainer}
          onPress={() => handleTermsToggle(!data.acceptTerms)}
        >
          <Text style={[styles.termsText, { color: Colors[theme].text }]}>
            I agree to the{" "}
            <Text style={[styles.termsLink, { color: Colors[theme].tint }]}>
              Terms of Service
            </Text>{" "}
            and{" "}
            <Text style={[styles.termsLink, { color: Colors[theme].tint }]}>
              Privacy Policy
            </Text>
          </Text>
        </Pressable>
      </View>

      {errors?.acceptTerms && (
        <Text style={[styles.termsError, { color: Colors[theme].error }]}>
          {errors.acceptTerms}
        </Text>
      )}
    </View>
  );

  const isFormValid = () => {
    return (
      data.productDetails.title &&
      data.productDetails.description &&
      data.categories.categories &&
      data.categories.categories.length > 0 &&
      ((data.pricing.availableForSale && data.pricing.purchasePrice) ||
        (data.pricing.availableForRent && data.pricing.rentPrice)) &&
      data.acceptTerms
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
            Review & Submit
          </Text>
          <Text
            style={[
              styles.stepDescription,
              { color: Colors[theme].textSecondary },
            ]}
          >
            Review all your product information before publishing. You can edit
            any section by tapping the edit button.
          </Text>
        </View>

        {/* Sections */}
        {renderProductDetails()}
        {renderCategories()}
        {renderPricing()}
        {renderImages()}

        {/* Product Preview */}
        {renderProductPreview()}

        {/* Terms and Conditions */}
        {renderTermsAndConditions()}

        {/* Final Validation */}
        <View
          style={[
            styles.finalValidationContainer,
            {
              backgroundColor: isFormValid()
                ? Colors[theme].success + "10"
                : Colors[theme].warning + "10",
            },
          ]}
        >
          <Text
            style={[
              styles.finalValidationText,
              {
                color: isFormValid()
                  ? Colors[theme].success
                  : Colors[theme].warning,
              },
            ]}
          >
            {isFormValid()
              ? "✓ Ready to publish your product!"
              : "⚠ Please complete all required sections and accept terms"}
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
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.sm,
  },
  stepDescription: {
    fontSize: Typography.fontSize.base,
    lineHeight: 24,
  },

  // Sections
  section: {
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  sectionHeaderContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  sectionHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  sectionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  sectionNumberText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: "white",
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    flex: 1,
  },
  editButton: {
    minWidth: 60,
  },
  sectionContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },

  // Details
  detailItem: {
    marginBottom: Spacing.md,
  },
  detailLabel: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.xs,
  },
  detailValue: {
    fontSize: Typography.fontSize.base,
    lineHeight: 24,
  },

  // Categories
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },

  // Images
  imagesGrid: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  reviewImage: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.md,
  },

  // Empty states
  emptyText: {
    fontSize: Typography.fontSize.base,
    fontStyle: "italic",
  },

  // Preview
  previewContainer: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
  },
  previewTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.sm,
  },
  previewDescription: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.lg,
  },
  previewCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  previewHeader: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
  },
  previewImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  previewContent: {
    flex: 1,
  },
  previewProductTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.sm,
  },
  previewCategories: {
    flexDirection: "column",
    alignItems: "center",
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  previewMoreCategories: {
    fontSize: Typography.fontSize.xs,
  },

  // Terms
  termsContainer: {
    marginBottom: Spacing.xl,
  },
  termsTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.md,
  },
  termsCheckbox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
  },
  termsTextContainer: {
    flex: 1,
    paddingTop: 2, // Align with switch
  },
  termsText: {
    fontSize: Typography.fontSize.base,
    lineHeight: 24,
  },
  termsLink: {
    fontWeight: Typography.fontWeight.medium,
  },
  termsError: {
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.sm,
    marginLeft: 44, // Align with text
  },

  // Final Validation
  finalValidationContainer: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  finalValidationText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    textAlign: "center",
  },
});

export default ReviewStep;
