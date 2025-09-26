import { Button } from "@/src/components/common/Button";
import { IconSymbol } from "@/src/components/ui/icon-symbol";
import { Colors, Spacing, Typography } from "@/src/constants/theme";
import React from "react";
import { StyleSheet, Text, useColorScheme, View } from "react-native";

export interface EmptyStateProps {
  title: string;
  description: string;
  iconName?: string;
  iconSize?: number;
  buttonTitle?: string;
  onButtonPress?: () => void;
  variant?: "default" | "error" | "search" | "loading";
  testID?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  iconName = "cube.box",
  iconSize = 80,
  buttonTitle,
  onButtonPress,
  variant = "default",
  testID,
}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";

  const getIconColor = () => {
    switch (variant) {
      case "error":
        return Colors[theme].error;
      case "search":
        return Colors[theme].info;
      case "loading":
        return Colors[theme].tint;
      default:
        return Colors[theme].textSecondary;
    }
  };

  const getDefaultIcon = () => {
    switch (variant) {
      case "error":
        return "exclamationmark.triangle";
      case "search":
        return "magnifyingglass";
      case "loading":
        return "arrow.clockwise";
      default:
        return iconName;
    }
  };

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.content}>
        <IconSymbol
          name={getDefaultIcon()}
          size={iconSize}
          color={getIconColor()}
        />

        <Text style={[styles.title, { color: Colors[theme].text }]}>
          {title}
        </Text>

        <Text
          style={[styles.description, { color: Colors[theme].textSecondary }]}
        >
          {description}
        </Text>

        {buttonTitle && onButtonPress && (
          <Button
            title={buttonTitle}
            onPress={onButtonPress}
            style={styles.button}
            variant={variant === "error" ? "destructive" : "primary"}
          />
        )}
      </View>
    </View>
  );
};

// Predefined empty states for common scenarios
export const ProductListEmptyState: React.FC<{
  onAddProduct?: () => void;
}> = ({ onAddProduct }) => (
  <EmptyState
    title="No products found"
    description="Start by adding your first product to the marketplace"
    iconName="cube.box"
    buttonTitle="Add Product"
    onButtonPress={onAddProduct}
    testID="product-list-empty-state"
  />
);

export const MyProductsEmptyState: React.FC<{
  onAddProduct?: () => void;
}> = ({ onAddProduct }) => (
  <EmptyState
    title="You haven't added any products yet"
    description="Create your first product listing to start selling or renting"
    iconName="plus"
    buttonTitle="Create Product"
    onButtonPress={onAddProduct}
    testID="my-products-empty-state"
  />
);

export const TransactionsEmptyState: React.FC<{
  type: "bought" | "sold" | "borrowed" | "lent";
}> = ({ type }) => {
  const getContent = () => {
    switch (type) {
      case "bought":
        return {
          title: "No purchases yet",
          description: "Products you buy will appear here",
          icon: "cart",
        };
      case "sold":
        return {
          title: "Nothing sold yet",
          description: "Products you sell will appear here",
          icon: "dollarsign",
        };
      case "borrowed":
        return {
          title: "No rentals yet",
          description: "Products you rent will appear here",
          icon: "clock",
        };
      case "lent":
        return {
          title: "Nothing lent yet",
          description: "Products you lend will appear here",
          icon: "arrow.up.right",
        };
      default:
        return {
          title: "No transactions yet",
          description: "Your transaction history will appear here",
          icon: "doc",
        };
    }
  };

  const content = getContent();

  return (
    <EmptyState
      title={content.title}
      description={content.description}
      iconName={content.icon}
      testID={`${type}-transactions-empty-state`}
    />
  );
};

export const SearchEmptyState: React.FC<{
  searchQuery: string;
  onClearSearch?: () => void;
}> = ({ searchQuery, onClearSearch }) => (
  <EmptyState
    title="No results found"
    description={`No products match "${searchQuery}". Try adjusting your search terms.`}
    variant="search"
    buttonTitle="Clear Search"
    onButtonPress={onClearSearch}
    testID="search-empty-state"
  />
);

export const ErrorState: React.FC<{
  title?: string;
  description?: string;
  onRetry?: () => void;
}> = ({
  title = "Something went wrong",
  description = "We couldn't load the content. Please try again.",
  onRetry,
}) => (
  <EmptyState
    title={title}
    description={description}
    variant="error"
    buttonTitle={onRetry ? "Try Again" : undefined}
    onButtonPress={onRetry}
    testID="error-state"
  />
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl,
  },
  content: {
    alignItems: "center",
    maxWidth: 300,
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    textAlign: "center",
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  description: {
    fontSize: Typography.fontSize.base,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  button: {
    minWidth: 150,
  },
});

export default EmptyState;
