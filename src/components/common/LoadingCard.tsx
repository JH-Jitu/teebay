import { BorderRadius, Colors, Spacing } from "@/src/constants/theme";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, useColorScheme, View } from "react-native";

export interface LoadingCardProps {
  variant?: "product-list" | "product-grid" | "transaction" | "custom";
  width?: number | string;
  height?: number;
  style?: any;
  testID?: string;
}

export const LoadingCard: React.FC<LoadingCardProps> = ({
  variant = "product-list",
  width,
  height,
  style,
  testID,
}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const interpolatedColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors[theme].backgroundSecondary, Colors[theme].border],
  });

  const SkeletonBox: React.FC<{
    width: number | string;
    height: number;
    borderRadius?: number;
    style?: any;
  }> = ({
    width: boxWidth,
    height: boxHeight,
    borderRadius = BorderRadius.sm,
    style: boxStyle,
  }) => (
    <Animated.View
      style={[
        {
          width: boxWidth,
          height: boxHeight,
          backgroundColor: interpolatedColor,
          borderRadius,
        },
        boxStyle,
      ]}
    />
  );

  const renderProductListSkeleton = () => (
    <View
      style={[
        styles.productListCard,
        { backgroundColor: Colors[theme].background },
      ]}
    >
      <SkeletonBox width={80} height={80} borderRadius={BorderRadius.md} />
      <View style={styles.productListContent}>
        <SkeletonBox width="80%" height={20} style={styles.skeletonTitle} />
        <SkeletonBox
          width="100%"
          height={16}
          style={styles.skeletonDescription}
        />
        <SkeletonBox
          width="100%"
          height={16}
          style={styles.skeletonDescription}
        />
        <View style={styles.priceContainer}>
          <SkeletonBox width="40%" height={16} />
          <SkeletonBox width="35%" height={16} />
        </View>
        <SkeletonBox width="60%" height={14} style={styles.skeletonMeta} />
      </View>
    </View>
  );

  const renderProductGridSkeleton = () => (
    <View
      style={[
        styles.productGridCard,
        { backgroundColor: Colors[theme].background },
      ]}
    >
      <SkeletonBox width="100%" height={120} borderRadius={BorderRadius.md} />
      <View style={styles.productGridContent}>
        <SkeletonBox width="90%" height={16} style={styles.skeletonTitle} />
        <SkeletonBox width="70%" height={14} style={styles.skeletonMeta} />
        <SkeletonBox width="60%" height={14} style={styles.skeletonMeta} />
      </View>
    </View>
  );

  const renderTransactionSkeleton = () => (
    <View
      style={[
        styles.transactionCard,
        { backgroundColor: Colors[theme].background },
      ]}
    >
      <View style={styles.transactionHeader}>
        <View style={styles.transactionTypeInfo}>
          <SkeletonBox width={40} height={40} borderRadius={20} />
          <View style={styles.transactionTypeText}>
            <SkeletonBox width={80} height={16} style={styles.skeletonTitle} />
            <SkeletonBox width={60} height={14} style={styles.skeletonMeta} />
          </View>
        </View>
        <View style={styles.transactionAmount}>
          <SkeletonBox width={60} height={18} style={styles.skeletonTitle} />
          <SkeletonBox width={50} height={14} />
        </View>
      </View>
      <View style={styles.transactionContent}>
        <SkeletonBox width={60} height={60} borderRadius={BorderRadius.md} />
        <View style={styles.transactionProductInfo}>
          <SkeletonBox width="80%" height={16} style={styles.skeletonTitle} />
          <SkeletonBox width="60%" height={14} style={styles.skeletonMeta} />
        </View>
      </View>
    </View>
  );

  const renderCustomSkeleton = () => (
    <View style={[{ width, height }, style]}>
      <SkeletonBox width="100%" height={height || 100} />
    </View>
  );

  const containerStyle = [
    styles.container,
    style,
    { backgroundColor: Colors[theme].background },
  ];

  return (
    <View style={containerStyle} testID={testID}>
      {variant === "product-list" && renderProductListSkeleton()}
      {variant === "product-grid" && renderProductGridSkeleton()}
      {variant === "transaction" && renderTransactionSkeleton()}
      {variant === "custom" && renderCustomSkeleton()}
    </View>
  );
};

// Utility component for rendering multiple loading cards
export const LoadingCardList: React.FC<{
  count?: number;
  variant?: LoadingCardProps["variant"];
  style?: any;
}> = ({ count = 5, variant = "product-list", style }) => {
  return (
    <View style={style}>
      {Array.from({ length: count }).map((_, index) => (
        <LoadingCard
          key={index}
          variant={variant}
          testID={`loading-card-${index}`}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.xs,
  },

  // Product List Skeleton
  productListCard: {
    flexDirection: "row",
    marginHorizontal: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productListContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },

  // Product Grid Skeleton
  productGridCard: {
    margin: Spacing.xs,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flex: 0.5,
    minHeight: 200,
  },
  productGridContent: {
    padding: Spacing.md,
    flex: 1,
  },

  // Transaction Skeleton
  transactionCard: {
    marginHorizontal: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  transactionTypeInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  transactionTypeText: {
    flexDirection: "column",
  },
  transactionAmount: {
    alignItems: "flex-end",
  },
  transactionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  transactionProductInfo: {
    flex: 1,
  },

  // Common skeleton styles
  skeletonTitle: {
    marginBottom: Spacing.xs,
  },
  skeletonDescription: {
    marginBottom: Spacing.xs,
  },
  skeletonMeta: {
    marginBottom: Spacing.xs,
  },
  priceContainer: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xs,
  },
});

export default LoadingCard;
