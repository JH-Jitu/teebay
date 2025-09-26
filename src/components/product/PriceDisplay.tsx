import { IconSymbol } from "@/src/components/ui/icon-symbol";
import { Colors, Spacing, Typography } from "@/src/constants/theme";
import React from "react";
import { StyleSheet, Text, useColorScheme, View } from "react-native";

export interface PriceDisplayProps {
  purchasePrice?: string | number;
  rentPrice?: string | number;
  rentOption?: "hour" | "day" | "week" | "month";
  variant?: "horizontal" | "vertical" | "compact";
  size?: "small" | "medium" | "large";
  showIcons?: boolean;
  currency?: string;
  testID?: string;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  purchasePrice,
  rentPrice,
  rentOption = "day",
  variant = "horizontal",
  size = "medium",
  showIcons = true,
  currency = "$",
  testID,
}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";

  const formatPrice = (price: string | number | undefined): string => {
    if (!price) return "";
    return `${currency}${typeof price === "string" ? price : price.toFixed(2)}`;
  };

  const getRentOptionLabel = (option: string): string => {
    switch (option) {
      case "hour":
        return "hr";
      case "day":
        return "day";
      case "week":
        return "wk";
      case "month":
        return "mo";
      default:
        return option;
    }
  };

  const getTextStyles = () => {
    const baseStyle = [styles.priceText];

    switch (size) {
      case "small":
        baseStyle.push(styles.smallText);
        break;
      case "large":
        baseStyle.push(styles.largeText);
        break;
      default:
        baseStyle.push(styles.mediumText);
    }

    return baseStyle;
  };

  const getLabelStyles = () => {
    const baseStyle = [styles.label];

    switch (size) {
      case "small":
        baseStyle.push(styles.smallLabel);
        break;
      case "large":
        baseStyle.push(styles.largeLabel);
        break;
      default:
        baseStyle.push(styles.mediumLabel);
    }

    return baseStyle;
  };

  const getIconSize = () => {
    switch (size) {
      case "small":
        return 14;
      case "large":
        return 22;
      default:
        return 18;
    }
  };

  const renderPurchasePrice = () => {
    if (!purchasePrice) return null;

    return (
      <View style={styles.priceItem}>
        {showIcons && (
          <IconSymbol
            name="cart"
            size={getIconSize()}
            color={Colors[theme].success}
          />
        )}
        <View style={styles.priceContent}>
          <Text style={[...getTextStyles(), { color: Colors[theme].success }]}>
            {formatPrice(purchasePrice)}
          </Text>
          <Text style={[...getLabelStyles(), { color: Colors[theme].success }]}>
            Buy
          </Text>
        </View>
      </View>
    );
  };

  const renderRentPrice = () => {
    if (!rentPrice) return null;

    return (
      <View style={styles.priceItem}>
        {showIcons && (
          <IconSymbol
            name="clock"
            size={getIconSize()}
            color={Colors[theme].info}
          />
        )}
        <View style={styles.priceContent}>
          <Text style={[...getTextStyles(), { color: Colors[theme].info }]}>
            {formatPrice(rentPrice)}/{getRentOptionLabel(rentOption)}
          </Text>
          <Text style={[...getLabelStyles(), { color: Colors[theme].info }]}>
            Rent
          </Text>
        </View>
      </View>
    );
  };

  if (!purchasePrice && !rentPrice) {
    return (
      <View style={styles.container} testID={testID}>
        <Text style={[styles.noPrice, { color: Colors[theme].textSecondary }]}>
          Price not available
        </Text>
      </View>
    );
  }

  const containerStyle = [
    styles.container,
    variant === "vertical" && styles.verticalContainer,
    variant === "compact" && styles.compactContainer,
  ];

  if (variant === "compact") {
    // Compact variant shows both prices in a condensed format
    return (
      <View style={containerStyle} testID={testID}>
        {purchasePrice && (
          <Text style={[styles.compactText, { color: Colors[theme].success }]}>
            Buy {formatPrice(purchasePrice)}
          </Text>
        )}
        {purchasePrice && rentPrice && (
          <Text
            style={[styles.separator, { color: Colors[theme].textSecondary }]}
          >
            •
          </Text>
        )}
        {rentPrice && (
          <Text style={[styles.compactText, { color: Colors[theme].info }]}>
            Rent {formatPrice(rentPrice)}/{getRentOptionLabel(rentOption)}
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={containerStyle} testID={testID}>
      {renderPurchasePrice()}
      {renderRentPrice()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  verticalContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: Spacing.xs,
  },
  compactContainer: {
    gap: Spacing.xs,
  },
  priceItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  priceContent: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  priceText: {
    fontWeight: Typography.fontWeight.bold,
  },
  label: {
    fontWeight: Typography.fontWeight.medium,
  },

  // Size variants
  smallText: {
    fontSize: Typography.fontSize.sm,
  },
  mediumText: {
    fontSize: Typography.fontSize.base,
  },
  largeText: {
    fontSize: Typography.fontSize.lg,
  },
  smallLabel: {
    fontSize: Typography.fontSize.xs,
  },
  mediumLabel: {
    fontSize: Typography.fontSize.xs,
  },
  largeLabel: {
    fontSize: Typography.fontSize.sm,
  },

  // Compact variant
  compactText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  separator: {
    fontSize: Typography.fontSize.sm,
    paddingHorizontal: Spacing.xs,
  },
  noPrice: {
    fontSize: Typography.fontSize.sm,
    fontStyle: "italic",
  },
});

export default PriceDisplay;
