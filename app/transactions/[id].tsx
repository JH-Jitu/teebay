import { LoadingSpinner } from "@/src/components/common/LoadingSpinner";
import { IconSymbol } from "@/src/components/ui/icon-symbol";
import {
  BorderRadius,
  Colors,
  Spacing,
  Typography,
} from "@/src/constants/theme";
import { useProduct } from "@/src/hooks/api/useProducts";
import { usePurchase, useRental } from "@/src/hooks/api/useTransactions";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TransactionDetailScreen() {
  const { id, type } = useLocalSearchParams<{
    id: string;
    type: "purchase" | "rental";
  }>();
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "dark";

  const {
    data: purchase,
    isLoading: purchaseLoading,
    error: purchaseError,
  } = usePurchase(id || "", type === "purchase");
  const {
    data: rental,
    isLoading: rentalLoading,
    error: rentalError,
  } = useRental(id || "", type === "rental");

  const transaction = type === "purchase" ? purchase : rental;
  const isLoading = type === "purchase" ? purchaseLoading : rentalLoading;
  const error = type === "purchase" ? purchaseError : rentalError;

  const { data: product } = useProduct(
    transaction?.productId || "",
    !!transaction?.productId
  );

  if (isLoading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: Colors[theme].background },
        ]}
      >
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  if (error || !transaction) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: Colors[theme].background },
        ]}
      >
        <View style={styles.errorContainer}>
          <IconSymbol
            name="info.circle.fill"
            size={64}
            color={Colors[theme].textSecondary}
          />
          <Text style={[styles.errorTitle, { color: Colors[theme].text }]}>
            Transaction not found
          </Text>
          <Text
            style={[
              styles.errorDescription,
              { color: Colors[theme].textSecondary },
            ]}
          >
            The transaction you&apos;re looking for doesn&apos;t exist.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleProductPress = () => {
    if (product?.id) {
      console.log("Navigating to product from transaction:", product.id);
      router.push(`/products/${product.id}` as any);
    } else {
      console.log("No product ID available for navigation");
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: Colors[theme].background }]}
    >
      {/* Fixed Header */}
      <View
        style={[
          styles.fixedHeader,
          {
            borderBottomColor: Colors[theme].border,
            borderBottomWidth: 1,
            backgroundColor: Colors[theme].background,
          },
        ]}
      >
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol
            name="chevron.left"
            size={24}
            color={Colors[theme].text}
          />
        </Pressable>
        <Text
          style={[styles.headerTitle, { color: Colors[theme].text }]}
          numberOfLines={1}
        >
          {type === "purchase" ? "Purchase Details" : "Rental Details"}
        </Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: Colors[theme].background }}
        contentContainerStyle={{ padding: Spacing.lg }}
      >
        {/* Transaction Info */}
        <View
          style={[
            styles.transactionCard,
            { backgroundColor: Colors[theme].backgroundSecondary },
          ]}
        >
          <View style={styles.transactionHeader}>
            <View style={styles.typeContainer}>
              <IconSymbol
                name={type === "purchase" ? "cart" : "clock"}
                size={20}
                color={
                  type === "purchase"
                    ? Colors[theme].success
                    : Colors[theme].info
                }
              />
              <Text
                style={[
                  styles.transactionType,
                  {
                    color:
                      type === "purchase"
                        ? Colors[theme].success
                        : Colors[theme].info,
                  },
                ]}
              >
                {type === "purchase" ? "Purchase" : "Rental"}
              </Text>
            </View>
            <Text
              style={[
                styles.transactionId,
                { color: Colors[theme].textSecondary },
              ]}
            >
              ID: {transaction.id}
            </Text>
          </View>

          <View style={styles.transactionDetails}>
            {type === "purchase" ? (
              <>
                <View style={styles.detailRow}>
                  <Text
                    style={[
                      styles.detailLabel,
                      { color: Colors[theme].textSecondary },
                    ]}
                  >
                    Purchase Date:
                  </Text>
                  <Text
                    style={[styles.detailValue, { color: Colors[theme].text }]}
                  >
                    {formatDate(
                      transaction.type === "BUY"
                        ? transaction.purchase_date
                        : ""
                    )}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text
                    style={[
                      styles.detailLabel,
                      { color: Colors[theme].textSecondary },
                    ]}
                  >
                    Buyer:
                  </Text>
                  <Text
                    style={[styles.detailValue, { color: Colors[theme].text }]}
                  >
                    {transaction.type === "BUY"
                      ? transaction.buyer?.first_name ||
                        `User ${transaction.buyerId}`
                      : "N/A"}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text
                    style={[
                      styles.detailLabel,
                      { color: Colors[theme].textSecondary },
                    ]}
                  >
                    Seller:
                  </Text>
                  <Text
                    style={[styles.detailValue, { color: Colors[theme].text }]}
                  >
                    {transaction.seller?.first_name ||
                      `User ${transaction.sellerId}`}
                  </Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.detailRow}>
                  <Text
                    style={[
                      styles.detailLabel,
                      { color: Colors[theme].textSecondary },
                    ]}
                  >
                    Rental Period:
                  </Text>
                  <Text
                    style={[styles.detailValue, { color: Colors[theme].text }]}
                  >
                    {transaction.type === "RENT"
                      ? `${formatDate(
                          transaction.rent_period_start_date
                        )} - ${formatDate(transaction.rent_period_end_date)}`
                      : "N/A"}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text
                    style={[
                      styles.detailLabel,
                      { color: Colors[theme].textSecondary },
                    ]}
                  >
                    Rent Option:
                  </Text>
                  <Text
                    style={[styles.detailValue, { color: Colors[theme].text }]}
                  >
                    {transaction.type === "RENT"
                      ? transaction.rent_option
                      : "N/A"}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text
                    style={[
                      styles.detailLabel,
                      { color: Colors[theme].textSecondary },
                    ]}
                  >
                    Renter:
                  </Text>
                  <Text
                    style={[styles.detailValue, { color: Colors[theme].text }]}
                  >
                    {transaction.type === "RENT"
                      ? transaction.renter?.first_name ||
                        `User ${transaction.renterId}`
                      : "N/A"}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text
                    style={[
                      styles.detailLabel,
                      { color: Colors[theme].textSecondary },
                    ]}
                  >
                    Total Price:
                  </Text>
                  <Text
                    style={[styles.detailValue, { color: Colors[theme].text }]}
                  >
                    $
                    {transaction.type === "RENT"
                      ? transaction.total_price || transaction.amount
                      : transaction.amount}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Product Info */}
        {product && (
          <Pressable
            style={[
              styles.productCard,
              { backgroundColor: Colors[theme].backgroundSecondary },
            ]}
            onPress={handleProductPress}
          >
            <Text style={[styles.sectionTitle, { color: Colors[theme].text }]}>
              Product Details
            </Text>

            <View style={styles.productInfo}>
              <View style={styles.productImageContainer}>
                {product.product_image ? (
                  <Image
                    source={{ uri: product.product_image }}
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={[
                      styles.placeholderImage,
                      { backgroundColor: Colors[theme].background },
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

              <View style={styles.productDetails}>
                <Text
                  style={[styles.productTitle, { color: Colors[theme].text }]}
                >
                  {product.title}
                </Text>
                <Text
                  style={[
                    styles.productDescription,
                    { color: Colors[theme].textSecondary },
                  ]}
                  numberOfLines={2}
                >
                  {product.description}
                </Text>

                <View style={styles.priceContainer}>
                  {product.purchase_price && (
                    <Text
                      style={[styles.price, { color: Colors[theme].success }]}
                    >
                      Buy: ${product.purchase_price}
                    </Text>
                  )}
                  {product.rent_price && (
                    <Text style={[styles.price, { color: Colors[theme].info }]}>
                      Rent: ${product.rent_price}/{product.rent_option}
                    </Text>
                  )}
                </View>
              </View>

              <IconSymbol
                name="chevron.right"
                size={20}
                color={Colors[theme].textSecondary}
              />
            </View>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fixedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    zIndex: 1000,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    flex: 1,
    textAlign: "center",
    marginHorizontal: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  transactionCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  typeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  transactionType: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  transactionId: {
    fontSize: Typography.fontSize.sm,
  },
  transactionDetails: {
    gap: Spacing.sm,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: Typography.fontSize.sm,
    flex: 1,
  },
  detailValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    flex: 1,
    textAlign: "right",
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.md,
  },
  productCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  productInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  productImageContainer: {
    width: 60,
    height: 60,
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
  productDetails: {
    flex: 1,
  },
  productTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.xs,
  },
  productDescription: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.sm,
  },
  priceContainer: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  price: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  errorTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  errorDescription: {
    fontSize: Typography.fontSize.base,
    textAlign: "center",
    lineHeight: 24,
  },
});
