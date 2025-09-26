import { DropdownMenu } from "@/src/components/common/DropdownMenu";
import { IconSymbol } from "@/src/components/ui/icon-symbol";
import {
  BorderRadius,
  Colors,
  Spacing,
  Typography,
} from "@/src/constants/theme";
import type { Product } from "@/src/types";
import React from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";

export interface ProductCardProps {
  product: Product;
  variant?: "grid" | "list";
  onPress: (product: Product) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  showOwnerInfo?: boolean;
  showActions?: boolean;
  testID?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  variant = "list",
  onPress,
  onEdit,
  onDelete,
  showOwnerInfo = true,
  showActions = false,
  testID,
}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";

  const handlePress = () => {
    onPress(product);
  };

  const handleEdit = () => {
    onEdit?.(product);
  };

  const handleDelete = () => {
    onDelete?.(product);
  };

  const renderImage = () => (
    <View
      style={[
        styles.imageContainer,
        variant === "grid" ? styles.gridImage : styles.listImage,
      ]}
    >
      {product?.product_image ? (
        <Image
          source={{ uri: product.product_image }}
          style={[
            styles.productImage,
            variant === "grid" ? styles.gridImage : styles.listImage,
          ]}
          resizeMode="cover"
        />
      ) : (
        <View
          style={[
            styles.placeholderImage,
            { backgroundColor: Colors[theme].backgroundSecondary },
            variant === "grid" ? styles.gridImage : styles.listImage,
          ]}
        >
          <IconSymbol
            name="cube.box"
            size={variant === "grid" ? 32 : 24}
            color={Colors[theme].textSecondary}
          />
        </View>
      )}
    </View>
  );

  const renderPricing = () => (
    <View style={styles.pricingContainer}>
      {product.purchase_price && (
        <View style={styles.priceItem}>
          <IconSymbol name="cart" size={14} color={Colors[theme].success} />
          <Text style={[styles.priceText, { color: Colors[theme].success }]}>
            ${product.purchase_price}
          </Text>
        </View>
      )}
      {product.rent_price && (
        <View style={styles.priceItem}>
          <IconSymbol name="clock" size={14} color={Colors[theme].info} />
          <Text style={[styles.priceText, { color: Colors[theme].info }]}>
            ${product.rent_price}/{product.rent_option}
          </Text>
        </View>
      )}
    </View>
  );

  const renderActions = () => {
    if (!showActions || (!onEdit && !onDelete)) return null;

    const menuItems = [];

    if (onEdit) {
      menuItems.push({
        id: "edit",
        label: "Edit",
        iconName: "pencil",
        onPress: handleEdit,
      });
    }

    if (onDelete) {
      menuItems.push({
        id: "delete",
        label: "Delete",
        iconName: "trash",
        onPress: handleDelete,
        destructive: true,
      });
    }

    return <DropdownMenu items={menuItems} style={styles.actionsMenu} />;
  };

  if (variant === "grid") {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.gridCard,
          { backgroundColor: Colors[theme].backgroundSecondary },
          pressed && styles.pressed,
        ]}
        onPress={handlePress}
        testID={testID}
      >
        {renderImage()}
        <View style={styles.flexDotContent}>
          <View style={styles.gridContent}>
            <View>
              <Text
                style={[styles.gridTitle, { color: Colors[theme].text }]}
                numberOfLines={2}
              >
                {product.title}
              </Text>
              {renderPricing()}
              {showOwnerInfo && product.owner && (
                <Text
                  style={[
                    styles.ownerText,
                    { color: Colors[theme].textSecondary },
                  ]}
                >
                  by {product.owner.first_name}
                </Text>
              )}
            </View>
          </View>
          <View>{renderActions()}</View>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.listCard,
        { backgroundColor: Colors[theme].backgroundSecondary },
        pressed && styles.pressed,
      ]}
      onPress={handlePress}
      testID={testID}
    >
      {renderImage()}

      <View style={styles.listContent}>
        <View style={styles.listHeader}>
          <Text
            style={[styles.listTitle, { color: Colors[theme].text }]}
            numberOfLines={2}
          >
            {product.title}
          </Text>
          {renderActions()}
        </View>

        <Text
          style={[styles.description, { color: Colors[theme].textSecondary }]}
          numberOfLines={2}
        >
          {product.description}
        </Text>

        {renderPricing()}

        <View style={styles.metaInfo}>
          {showOwnerInfo && product.owner && (
            <Text
              style={[styles.ownerText, { color: Colors[theme].textSecondary }]}
            >
              by {product.owner.first_name} {product.owner.last_name}
            </Text>
          )}
          <Text
            style={[styles.dateText, { color: Colors[theme].textSecondary }]}
          >
            {new Date(product.date_posted).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  // Grid variant styles
  gridCard: {
    margin: Spacing.sm,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flex: 0.5,
    minHeight: 200,
    // flexDirection: "row",
    // alignItems: "flex-end",
    // justifyContent: "space-between",
  },
  flexDotContent: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  gridImage: {
    // width: "100%",
    height: 120,
    borderRadius: BorderRadius.md,
  },
  gridContent: {
    padding: Spacing.md,
    flex: 1,
  },
  gridTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.xs,
  },

  // List variant styles
  listCard: {
    flexDirection: "row",
    marginHorizontal: Spacing.sm,
    marginVertical: Spacing.xs,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listImage: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
  },
  listContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.xs,
  },
  listTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    flex: 1,
    marginRight: Spacing.md,
  },

  // Shared styles
  imageContainer: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  description: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.sm,
  },
  pricingContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  priceItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  priceText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  metaInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ownerText: {
    fontSize: Typography.fontSize.xs,
  },
  dateText: {
    fontSize: Typography.fontSize.xs,
  },
  actionsContainer: {
    flexDirection: "row",
    gap: Spacing.xs,
  },
  actionsMenu: {
    marginLeft: Spacing.sm,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});

export default ProductCard;
