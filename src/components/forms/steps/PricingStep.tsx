import { Button } from "@/src/components/common/Button";
import { Input } from "@/src/components/common/Input";
import { IconSymbol } from "@/src/components/ui/icon-symbol";
import {
  BorderRadius,
  Colors,
  Spacing,
  Typography,
} from "@/src/constants/theme";
import Feather from "@expo/vector-icons/Feather";
import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";

export interface PricingData {
  availableForSale: boolean;
  availableForRent: boolean;
  purchasePrice: string;
  rentPrice: string;
  rentOption: "hour" | "day" | "week" | "month";
}

export interface PricingStepProps {
  data: PricingData;
  onChange: (data: Partial<PricingData>) => void;
  errors?: Partial<Record<keyof PricingData, string>>;
  testID?: string;
}

const RENT_OPTIONS = [
  { value: "hour", label: "Per Hour", icon: "clock" },
  { value: "day", label: "Per Day", icon: "calendar" },
] as const;

const PRICING_SUGGESTIONS = {
  sale: ["$10", "$25", "$50", "$100", "$250", "$500"],
  rent: ["$5", "$10", "$20", "$50", "$100", "$200"],
};

export const PricingStep: React.FC<PricingStepProps> = ({
  data,
  onChange,
  errors,
  testID,
}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";

  const handleOptionToggle = (
    option: "availableForSale" | "availableForRent"
  ) => {
    const newValue = !data[option];
    onChange({ [option]: newValue });

    if (!newValue) {
      if (option === "availableForSale") {
        onChange({ purchasePrice: "" });
      } else {
        onChange({ rentPrice: "" });
      }
    }
  };

  const handlePriceChange = (
    field: "purchasePrice" | "rentPrice",
    value: string
  ) => {
    const cleanValue = value.replace(/[^0-9.]/g, "");

    const parts = cleanValue.split(".");
    const formattedValue =
      parts.length > 2 ? `${parts[0]}.${parts.slice(1).join("")}` : cleanValue;

    onChange({ [field]: formattedValue });
  };

  const handleRentOptionChange = (
    option: "hour" | "day" | "week" | "month"
  ) => {
    onChange({ rentOption: option });
  };

  const handlePriceSuggestion = (
    field: "purchasePrice" | "rentPrice",
    price: string
  ) => {
    const numericPrice = price.replace("$", "");
    onChange({ [field]: numericPrice });
  };

  const isValidPricing = () => {
    if (!data.availableForSale && !data.availableForRent) return false;
    if (data.availableForSale && !data.purchasePrice) return false;
    if (data.availableForRent && !data.rentPrice) return false;
    return true;
  };

  const getEstimatedEarnings = () => {
    const purchasePrice = parseFloat(data.purchasePrice) || 0;
    const rentPrice = parseFloat(data.rentPrice) || 0;

    let rentMultiplier = 1;
    switch (data.rentOption) {
      case "hour":
        rentMultiplier = 24 * 7; // Week earnings
        break;
      case "day":
        rentMultiplier = 7; // Week earnings
        break;
      case "week":
        rentMultiplier = 1; // Week earnings
        break;
      case "month":
        rentMultiplier = 0.25; // Week earnings (1/4 month)
        break;
    }

    return {
      purchase: purchasePrice,
      rentWeekly: rentPrice * rentMultiplier,
    };
  };

  const earnings = getEstimatedEarnings();

  const renderPricingOption = (
    type: "sale" | "rent",
    isEnabled: boolean,
    onToggle: () => void
  ) => (
    <Pressable
      style={[
        styles.pricingOptionContainer,
        {
          backgroundColor: isEnabled
            ? Colors[theme].tint + "10"
            : Colors[theme].backgroundSecondary,
          borderColor: isEnabled ? Colors[theme].tint : Colors[theme].border,
          borderWidth: isEnabled ? 2 : 1,
        },
      ]}
      onPress={onToggle}
      testID={`pricing-option-${type}`}
    >
      <View style={styles.pricingOptionHeader}>
        <IconSymbol
          name={type === "sale" ? "cart" : "clock"}
          size={24}
          color={isEnabled ? Colors[theme].tint : Colors[theme].textSecondary}
        />
        <Text
          style={[
            styles.pricingOptionTitle,
            { color: isEnabled ? Colors[theme].tint : Colors[theme].text },
          ]}
        >
          {type === "sale" ? "Available for Sale" : "Available for Rent"}
        </Text>
        <View
          style={[
            styles.checkbox,
            {
              backgroundColor: isEnabled ? Colors[theme].tint : "transparent",
              borderColor: isEnabled
                ? Colors[theme].tint
                : Colors[theme].border,
            },
          ]}
        >
          {isEnabled && <IconSymbol name="checkmark" size={16} color="white" />}
        </View>
      </View>
      <Text
        style={[
          styles.pricingOptionDescription,
          { color: Colors[theme].textSecondary },
        ]}
      >
        {type === "sale"
          ? "Sell your product permanently to one buyer"
          : "Rent your product temporarily to multiple users"}
      </Text>
    </Pressable>
  );

  const renderPriceSuggestions = (field: "purchasePrice" | "rentPrice") => (
    <View style={styles.suggestionsContainer}>
      <Text
        style={[
          styles.suggestionsLabel,
          { color: Colors[theme].textSecondary },
        ]}
      >
        Quick select:
      </Text>
      <View style={styles.suggestionsList}>
        {(field === "purchasePrice"
          ? PRICING_SUGGESTIONS.sale
          : PRICING_SUGGESTIONS.rent
        ).map((price) => (
          <Button
            key={price}
            title={price}
            variant="secondary"
            size="small"
            onPress={() => handlePriceSuggestion(field, price)}
            style={styles.suggestionButton}
          />
        ))}
      </View>
    </View>
  );

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
            Set Your Pricing
          </Text>
          <Text
            style={[
              styles.stepDescription,
              { color: Colors[theme].textSecondary },
            ]}
          >
            Choose whether to sell, rent, or both. Set competitive prices based
            on your product&apos;s value and market demand.
          </Text>
        </View>

        {/* Pricing Options */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors[theme].text }]}>
            Availability Options
          </Text>

          {renderPricingOption("sale", data.availableForSale, () =>
            handleOptionToggle("availableForSale")
          )}

          {renderPricingOption("rent", data.availableForRent, () =>
            handleOptionToggle("availableForRent")
          )}
        </View>

        {/* Sale Pricing */}
        {data.availableForSale && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: Colors[theme].text }]}>
              Sale Price *
            </Text>
            <Input
              value={data.purchasePrice}
              onChangeText={(value) =>
                handlePriceChange("purchasePrice", value)
              }
              placeholder="0.00"
              keyboardType="numeric"
              error={errors?.purchasePrice}
              leftIcon={
                <Feather
                  name="dollar-sign"
                  size={24}
                  color={Colors[theme].textSecondary}
                />
              }
              testID="purchase-price-input"
            />
            {renderPriceSuggestions("purchasePrice")}
          </View>
        )}

        {/* Rent Pricing */}
        {data.availableForRent && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: Colors[theme].text }]}>
              Rental Price *
            </Text>

            <View style={styles.rentPriceContainer}>
              <View style={styles.rentPriceInput}>
                <Input
                  value={data.rentPrice}
                  onChangeText={(value) =>
                    handlePriceChange("rentPrice", value)
                  }
                  placeholder="0.00"
                  keyboardType="numeric"
                  error={errors?.rentPrice}
                  leftIcon={
                    <Feather
                      name="dollar-sign"
                      size={24}
                      color={Colors[theme].textSecondary}
                    />
                  }
                  testID="rent-price-input"
                />
              </View>

              <Text
                style={[
                  styles.perLabel,
                  { color: Colors[theme].textSecondary },
                ]}
              >
                per
              </Text>

              <View style={styles.rentOptionsContainer}>
                {RENT_OPTIONS.map((option) => (
                  <Pressable
                    key={option.value}
                    style={[
                      styles.rentOptionButton,
                      {
                        backgroundColor:
                          data.rentOption === option.value
                            ? Colors[theme].tint
                            : Colors[theme].backgroundSecondary,
                        borderColor:
                          data.rentOption === option.value
                            ? Colors[theme].tint
                            : Colors[theme].border,
                      },
                    ]}
                    onPress={() => handleRentOptionChange(option.value)}
                    testID={`rent-option-${option.value}`}
                  >
                    <IconSymbol
                      name={option.icon}
                      size={16}
                      color={
                        data.rentOption === option.value
                          ? "white"
                          : Colors[theme].textSecondary
                      }
                    />
                    <Text
                      style={[
                        styles.rentOptionText,
                        {
                          color:
                            data.rentOption === option.value
                              ? "white"
                              : Colors[theme].text,
                        },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {renderPriceSuggestions("rentPrice")}
          </View>
        )}

        {/* Earnings Estimate */}
        {isValidPricing() && (
          <View
            style={[
              styles.earningsContainer,
              { backgroundColor: Colors[theme].backgroundSecondary },
            ]}
          >
            <Text style={[styles.earningsTitle, { color: Colors[theme].text }]}>
              💰 Estimated Earnings
            </Text>
            <View style={styles.earningsList}>
              {data.availableForSale && earnings.purchase > 0 && (
                <Text
                  style={[
                    styles.earningsItem,
                    { color: Colors[theme].success },
                  ]}
                >
                  • One-time sale: ${earnings.purchase.toFixed(2)}
                </Text>
              )}
              {data.availableForRent && earnings.rentWeekly > 0 && (
                <Text
                  style={[styles.earningsItem, { color: Colors[theme].info }]}
                >
                  • Weekly rental potential: ${earnings.rentWeekly.toFixed(2)}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Validation */}
        <View
          style={[
            styles.validationContainer,
            {
              backgroundColor: isValidPricing()
                ? Colors[theme].success + "10"
                : Colors[theme].warning + "10",
            },
          ]}
        >
          <Text
            style={[
              styles.validationText,
              {
                color: isValidPricing()
                  ? Colors[theme].success
                  : Colors[theme].warning,
              },
            ]}
          >
            {isValidPricing()
              ? "✓ Pricing configuration is complete"
              : "⚠ Please select at least one option and set the price"}
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
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.md,
  },

  // Pricing Options
  pricingOptionContainer: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  pricingOptionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  pricingOptionTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    flex: 1,
  },
  pricingOptionDescription: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },

  // Price Suggestions
  suggestionsContainer: {
    marginTop: Spacing.md,
  },
  suggestionsLabel: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.sm,
  },
  suggestionsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  suggestionButton: {
    minWidth: 60,
  },

  // Rent Pricing
  rentPriceContainer: {
    marginBottom: Spacing.md,
  },
  rentPriceInput: {
    marginBottom: Spacing.md,
  },
  perLabel: {
    fontSize: Typography.fontSize.base,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  rentOptionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  rentOptionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  rentOptionText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },

  // Earnings
  earningsContainer: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
  },
  earningsTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.md,
  },
  earningsList: {
    gap: Spacing.sm,
  },
  earningsItem: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },

  // Tips
  tipsContainer: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
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

  // Validation
  validationContainer: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  validationText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    textAlign: "center",
  },
});

export default PricingStep;
