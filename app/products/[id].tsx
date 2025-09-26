import { Button } from "@/src/components/common/Button";
import { LoadingSpinner } from "@/src/components/common/LoadingSpinner";
import { IconSymbol } from "@/src/components/ui/icon-symbol";
import {
  BorderRadius,
  Colors,
  Spacing,
  Typography,
} from "@/src/constants/theme";
import { useProduct } from "@/src/hooks/api/useProducts";
import {
  useCreatePurchase,
  useCreateRental,
} from "@/src/hooks/api/useTransactions";
import { useAuthStore } from "@/src/store/auth";
import { router, useLocalSearchParams } from "expo-router";
import React, { lazy, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LazyBuyModal = lazy(() =>
  import("@/src/components/transaction/BuyModal").then((module) => ({
    default: module.BuyModal,
  }))
);
const LazyRentModal = lazy(() =>
  import("@/src/components/transaction/RentModal").then((module) => ({
    default: module.RentModal,
  }))
);

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";
  const { user } = useAuthStore();

  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showRentModal, setShowRentModal] = useState(false);

  const { data: product, isLoading, error } = useProduct(id || "");
  const createPurchase = useCreatePurchase();
  const createRental = useCreateRental();

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

  if (error || !product) {
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
            Product not found
          </Text>
          <Text
            style={[
              styles.errorDescription,
              { color: Colors[theme].textSecondary },
            ]}
          >
            The product you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </Text>
          <Button
            title="Go Back"
            onPress={() => router.back()}
            style={styles.errorButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  const isOwner = user?.id === product.owner?.id;

  const handleBuyConfirm = async () => {
    if (!user?.id) {
      Alert.alert("Error", "You must be logged in to purchase items");
      return;
    }

    try {
      await createPurchase.mutateAsync({
        buyer: user.id,
        product: Number(product.id),
      });
      setShowBuyModal(false);
      Alert.alert("Success", "Product purchased successfully!", [
        { text: "OK", onPress: () => router.push("/(tabs)/explore") },
      ]);
    } catch (error) {
      Alert.alert(
        "Purchase Failed",
        error instanceof Error ? error.message : "Failed to purchase product"
      );
    }
  };

  const handleRentConfirm = async (
    renterEmail: string,
    productId: string,
    rentOption: string,
    startDate: string,
    endDate: string
  ) => {
    if (!user?.id) {
      Alert.alert("Error", "You must be logged in to rent items");
      return;
    }

    try {
      await createRental.mutateAsync({
        renter: user.id,
        product: Number(productId),
        rent_option: rentOption,
        rent_period_start_date: startDate,
        rent_period_end_date: endDate,
      });
      setShowRentModal(false);
      Alert.alert("Success", "Product rented successfully!", [
        { text: "OK", onPress: () => router.push("/(tabs)/explore") },
      ]);
    } catch (error) {
      Alert.alert(
        "Rental Failed",
        error instanceof Error ? error.message : "Failed to rent product"
      );
    }
  };

  const handleEdit = () => {
    router.push(`/products/edit/${product.id}` as any);
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
          Product Details
        </Text>
        {isOwner ? (
          <Pressable style={styles.editButton} onPress={handleEdit}>
            <IconSymbol name="pencil" size={20} color={Colors[theme].tint} />
          </Pressable>
        ) : (
          <View style={styles.backButton} />
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: Colors[theme].background }}
        contentContainerStyle={{ paddingBottom: Spacing.xl }}
      >
        {/* Product Images */}
        <View style={styles.imageContainer}>
          {product?.product_image ? (
            <Image
              source={{
                uri:
                  product.product_image ||
                  (product.images &&
                  product.images.length > 0 &&
                  typeof product.images[0] === "string"
                    ? product.images[0]
                    : product.images?.[0]?.url) ||
                  "",
              }}
              style={[styles.productImage, { borderRadius: BorderRadius.lg }]}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[
                styles.placeholderImage,
                {
                  backgroundColor: Colors[theme].backgroundSecondary,
                  borderRadius: BorderRadius.lg,
                },
              ]}
            >
              <IconSymbol
                name="cube.box"
                size={80}
                color={Colors[theme].textSecondary}
              />
              <Text
                style={[
                  styles.placeholderText,
                  { color: Colors[theme].textSecondary },
                ]}
              >
                No Image Available
              </Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View
          style={[
            styles.content,
            { backgroundColor: Colors[theme].background },
          ]}
        >
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: Colors[theme].text }]}>
              {product.title}
            </Text>
            {!isOwner && (
              <View style={styles.availabilityBadge}>
                <Text
                  style={[
                    styles.availabilityText,
                    { color: Colors[theme].success },
                  ]}
                >
                  Available
                </Text>
              </View>
            )}
          </View>

          <Text
            style={[styles.description, { color: Colors[theme].textSecondary }]}
          >
            {product.description}
          </Text>

          {/* Pricing */}
          <View
            style={[
              styles.pricingSection,
              {
                backgroundColor: Colors[theme].backgroundSecondary,
                borderRadius: BorderRadius.md,
                padding: Spacing.md,
              },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: Colors[theme].text }]}>
              Pricing
            </Text>
            <View style={styles.pricingOptions}>
              {product.purchase_price && (
                <View style={styles.priceItem}>
                  <IconSymbol
                    name="cart"
                    size={20}
                    color={Colors[theme].success}
                  />
                  <Text
                    style={[styles.priceLabel, { color: Colors[theme].text }]}
                  >
                    Buy: ${product.purchase_price}
                  </Text>
                </View>
              )}
              {product.rent_price && (
                <View style={styles.priceItem}>
                  <IconSymbol
                    name="clock"
                    size={20}
                    color={Colors[theme].info}
                  />
                  <Text
                    style={[styles.priceLabel, { color: Colors[theme].text }]}
                  >
                    Rent: ${product.rent_price}/{product.rent_option}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Product Details */}
          <View
            style={[
              styles.detailsSection,
              {
                backgroundColor: Colors[theme].backgroundSecondary,
                borderRadius: BorderRadius.md,
                padding: Spacing.md,
              },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: Colors[theme].text }]}>
              Details
            </Text>

            <View style={styles.detailItem}>
              <Text
                style={[
                  styles.detailLabel,
                  { color: Colors[theme].textSecondary },
                ]}
              >
                Condition:
              </Text>
              <Text style={[styles.detailValue, { color: Colors[theme].text }]}>
                {product.condition?.replace("_", " ")}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Text
                style={[
                  styles.detailLabel,
                  { color: Colors[theme].textSecondary },
                ]}
              >
                Categories:
              </Text>
              <View style={styles.categoriesContainer}>
                {product.categories?.map((category, index) => (
                  <View
                    key={index}
                    style={[
                      styles.categoryBadge,
                      { backgroundColor: Colors[theme].tint + "20" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        { color: Colors[theme].tint },
                      ]}
                    >
                      {typeof category === "string"
                        ? category
                        : (category as any)?.name || category}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.detailItem}>
              <Text
                style={[
                  styles.detailLabel,
                  { color: Colors[theme].textSecondary },
                ]}
              >
                Owner:
              </Text>
              <Text style={[styles.detailValue, { color: Colors[theme].text }]}>
                {product.owner?.first_name} {product.owner?.last_name}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Text
                style={[
                  styles.detailLabel,
                  { color: Colors[theme].textSecondary },
                ]}
              >
                Views:
              </Text>
              <Text style={[styles.detailValue, { color: Colors[theme].text }]}>
                {product.viewCount}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      {!isOwner && (product.purchase_price || product.rent_price) && (
        <View
          style={[
            styles.actionContainer,
            {
              borderTopColor: Colors[theme].border,
              borderTopWidth: 1,
              backgroundColor: Colors[theme].background,
            },
          ]}
        >
          <View style={styles.actionButtonsRow}>
            {product.purchase_price && (
              <Button
                title={`Buy $${product.purchase_price}`}
                onPress={() => setShowBuyModal(true)}
                style={
                  product.rent_price ? styles.flexButton : styles.actionButton
                }
                disabled={createPurchase.isPending}
                loading={createPurchase.isPending}
                size="sm"
              />
            )}
            {product.rent_price && (
              <Button
                title={`Rent $${product.rent_price}/${
                  product.rent_option || "hour"
                }`}
                onPress={() => setShowRentModal(true)}
                variant="secondary"
                style={
                  product.purchase_price
                    ? styles.flexButton
                    : styles.actionButton
                }
                disabled={createRental.isPending}
                loading={createRental.isPending}
                size="sm"
              />
            )}
          </View>
        </View>
      )}

      {/* Enhanced Transaction Modals */}
      <LazyBuyModal
        visible={showBuyModal}
        product={product}
        onConfirm={handleBuyConfirm}
        onCancel={() => setShowBuyModal(false)}
        loading={createPurchase.isPending}
      />

      <LazyRentModal
        visible={showRentModal}
        product={product}
        onConfirm={handleRentConfirm}
        onCancel={() => setShowRentModal(false)}
        loading={createRental.isPending}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
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
    marginBottom: Spacing.md,
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
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    height: 300,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  productImage: {
    width: "100%",
    height: "100%",
    borderRadius: BorderRadius.lg,
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    borderRadius: BorderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.sm,
    textAlign: "center",
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  title: {
    flex: 1,
    fontSize: Typography.fontSize["2xl"],
    fontWeight: Typography.fontWeight.bold,
    marginRight: Spacing.md,
  },
  availabilityBadge: {
    backgroundColor: Colors.light.success + "20",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.light.success + "40",
  },
  availabilityText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
  },
  description: {
    fontSize: Typography.fontSize.base,
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.md,
  },
  pricingSection: {
    marginBottom: Spacing.xl,
  },
  pricingOptions: {
    gap: Spacing.sm,
  },
  priceItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  priceLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
  detailsSection: {
    marginBottom: Spacing.xl,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  detailLabel: {
    fontSize: Typography.fontSize.base,
    minWidth: 80,
  },
  detailValue: {
    fontSize: Typography.fontSize.base,
    flex: 1,
    fontWeight: Typography.fontWeight.medium,
  },
  categoriesContainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
  },
  categoryBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  categoryText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  actionContainer: {
    padding: Spacing.lg,
    paddingTop: Spacing.md,
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  actionButton: {
    minHeight: 40,
  },
  flexButton: {
    flex: 1,
    minHeight: 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  errorTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  errorDescription: {
    fontSize: Typography.fontSize.base,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  errorButton: {
    minWidth: 120,
  },
});
