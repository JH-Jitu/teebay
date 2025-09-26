import { Button } from "@/src/components/common/Button";
import { Modal } from "@/src/components/common/Modal";
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
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";

export interface BuyModalProps {
  visible: boolean;
  product: Product;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export const BuyModal: React.FC<BuyModalProps> = ({
  visible,
  product,
  onConfirm,
  onCancel,
  loading = false,
}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";

  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    onCancel();
  };

  const renderProductSummary = () => (
    <View style={styles.productSummary}>
      <View style={styles.productImage}>
        {product.product_image ? (
          <Image
            source={{ uri: product.product_image }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              styles.placeholderImage,
              { backgroundColor: Colors[theme].backgroundSecondary },
            ]}
          >
            <IconSymbol
              name="cube.box"
              size={32}
              color={Colors[theme].textSecondary}
            />
          </View>
        )}
      </View>

      <View style={styles.productInfo}>
        <Text
          style={[styles.productTitle, { color: Colors[theme].text }]}
          numberOfLines={2}
        >
          {product.title}
        </Text>
        <Text style={[styles.productPrice, { color: Colors[theme].success }]}>
          ${product.purchase_price}
        </Text>
      </View>
    </View>
  );

  const renderOrderSummary = () => (
    <View
      style={[
        styles.orderSummary,
        { backgroundColor: Colors[theme].backgroundSecondary },
      ]}
    >
      <Text style={[styles.sectionTitle, { color: Colors[theme].text }]}>
        Order Summary
      </Text>

      <View style={styles.summaryRow}>
        <Text
          style={[styles.summaryLabel, { color: Colors[theme].textSecondary }]}
        >
          Item Price
        </Text>
        <Text style={[styles.summaryValue, { color: Colors[theme].text }]}>
          ${product.purchase_price}
        </Text>
      </View>

      <View style={styles.summaryRow}>
        <Text
          style={[styles.summaryLabel, { color: Colors[theme].textSecondary }]}
        >
          Processing Fee
        </Text>
        <Text style={[styles.summaryValue, { color: Colors[theme].text }]}>
          $0
        </Text>
      </View>

      <View style={[styles.summaryRow, styles.totalRow]}>
        <Text style={[styles.totalLabel, { color: Colors[theme].text }]}>
          Total
        </Text>
        <Text style={[styles.totalValue, { color: Colors[theme].text }]}>
          ${(parseFloat(product.purchase_price || "0") + 0).toFixed(2)}
        </Text>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      onClose={handleCancel}
      title="Complete Purchase"
      size="large"
    >
      <ScrollView
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
        style={styles.scrollContainer}
        nestedScrollEnabled={true}
      >
        {renderProductSummary()}

        <View style={styles.confirmationSection}>
          <Text style={[styles.sectionTitle, { color: Colors[theme].text }]}>
            Confirm Purchase
          </Text>
          <Text
            style={[
              styles.confirmationText,
              { color: Colors[theme].textSecondary },
            ]}
          >
            Are you sure you want to purchase this item for $
            {product.purchase_price}?
          </Text>
        </View>

        {renderOrderSummary()}

        <View
          style={[
            styles.termsSection,
            { backgroundColor: Colors[theme].info + "10" },
          ]}
        >
          <IconSymbol
            name="info.circle.fill"
            size={20}
            color={Colors[theme].info}
          />
          <Text style={[styles.termsText, { color: Colors[theme].info }]}>
            By completing this purchase, you agree to our Terms of Service and
            understand that this transaction is final.
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.actions, { borderTopColor: Colors[theme].border }]}>
        <Button
          title="Cancel"
          variant="ghost"
          onPress={handleCancel}
          style={styles.actionButton}
          disabled={loading}
        />
        <Button
          title={loading ? "Processing..." : "Complete Purchase"}
          variant="primary"
          onPress={handleConfirm}
          loading={loading}
          disabled={loading}
          style={styles.actionButton}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    padding: Spacing.lg,
  },
  productSummary: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xl,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.md,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: BorderRadius.md,
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.xs,
  },
  productPrice: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  confirmationSection: {
    marginBottom: Spacing.xl,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.dark.backgroundSecondary,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.sm,
  },
  confirmationText: {
    fontSize: Typography.fontSize.sm,
    lineHeight: Typography.fontSize.sm * 1.4,
    textAlign: "center",
  },
  orderSummary: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  summaryLabel: {
    fontSize: Typography.fontSize.base,
  },
  summaryValue: {
    fontSize: Typography.fontSize.base,
  },
  totalRow: {
    borderTopWidth: 1,
    paddingTop: Spacing.sm,
    marginTop: Spacing.sm,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  totalValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  termsSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  termsText: {
    flex: 1,
    fontSize: Typography.fontSize.xs,
    lineHeight: Typography.fontSize.xs * 1.4,
  },
  actions: {
    flexDirection: "row",
    padding: Spacing.lg,
    borderTopWidth: 1,
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});
