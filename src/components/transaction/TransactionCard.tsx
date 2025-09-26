import { IconSymbol } from "@/src/components/ui/icon-symbol";
import {
  BorderRadius,
  Colors,
  Spacing,
  Typography,
} from "@/src/constants/theme";
import type { BuyTransaction, RentTransaction } from "@/src/types";
import React from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";

export interface TransactionCardProps {
  transaction: BuyTransaction | RentTransaction;
  type: "bought" | "sold" | "borrowed" | "lent";
  onPress?: (transaction: BuyTransaction | RentTransaction) => void;
  testID?: string;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  type,
  onPress,
  testID,
}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";

  const isRental = "startDate" in transaction && "endDate" in transaction;
  const isPurchase = !isRental;

  const handlePress = () => {
    onPress?.(transaction);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return Colors[theme].success;
      case "pending":
        return Colors[theme].warning;
      case "cancelled":
        return Colors[theme].error;
      case "active":
        return Colors[theme].info;
      default:
        return Colors[theme].textSecondary;
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case "bought":
        return "cart";
      case "sold":
        return "dollarsign";
      case "borrowed":
        return "clock";
      case "lent":
        return "arrow.up.right";
      default:
        return "doc";
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case "bought":
        return Colors[theme].info;
      case "sold":
        return Colors[theme].success;
      case "borrowed":
        return Colors[theme].warning;
      case "lent":
        return Colors[theme].tint;
      default:
        return Colors[theme].textSecondary;
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case "bought":
        return "Purchased";
      case "sold":
        return "Sold";
      case "borrowed":
        return "Rented";
      case "lent":
        return "Lent";
      default:
        return "Transaction";
    }
  };

  const getParticipantLabel = () => {
    switch (type) {
      case "bought":
        return "Sold by";
      case "sold":
        return "Bought by";
      case "borrowed":
        return "Rented from";
      case "lent":
        return "Rented to";
      default:
        return "With";
    }
  };

  const getParticipantName = () => {
    if ("buyer" in transaction) {
      return type === "sold"
        ? `${transaction.buyer?.first_name} ${transaction.buyer?.last_name}`.trim()
        : `${transaction.seller?.first_name} ${transaction.seller?.last_name}`.trim();
    }
    if ("renter" in transaction) {
      return type === "lent"
        ? `${transaction.renter?.first_name} ${transaction.renter?.last_name}`.trim()
        : `${transaction.seller?.first_name} ${transaction.seller?.last_name}`.trim();
    }
    return "Unknown";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getTransactionDate = () => {
    if (isPurchase && "createdAt" in transaction) {
      return formatDate(transaction.createdAt);
    }
    if (isRental && "startDate" in transaction) {
      return formatDate(transaction.startDate);
    }
    return "Date unavailable";
  };

  const renderProductImage = () => {
    const imageUrl =
      transaction.product?.product_image ||
      (transaction.product?.images && transaction.product.images.length > 0
        ? typeof transaction.product.images[0] === "string"
          ? transaction.product.images[0]
          : transaction.product.images[0].url
        : null);

    return (
      <View style={styles.productImageContainer}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.productImage}
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
              size={24}
              color={Colors[theme].textSecondary}
            />
          </View>
        )}
      </View>
    );
  };

  const renderRentalDuration = () => {
    if (
      !isRental ||
      !("startDate" in transaction) ||
      !("endDate" in transaction)
    ) {
      return null;
    }

    const start = new Date(transaction.startDate);
    const end = new Date(transaction.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return (
      <Text style={[styles.duration, { color: Colors[theme].textSecondary }]}>
        {diffDays} {diffDays === 1 ? "day" : "days"}
      </Text>
    );
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: Colors[theme].background },
        pressed && styles.pressed,
      ]}
      onPress={handlePress}
      testID={testID}
    >
      <View style={styles.header}>
        <View style={styles.typeInfo}>
          <View
            style={[
              styles.typeIcon,
              { backgroundColor: getTypeColor() + "20" },
            ]}
          >
            <IconSymbol name={getTypeIcon()} size={20} color={getTypeColor()} />
          </View>
          <View style={styles.typeText}>
            <Text style={[styles.typeLabel, { color: Colors[theme].text }]}>
              {getTypeLabel()}
            </Text>
            <Text style={[styles.date, { color: Colors[theme].textSecondary }]}>
              {getTransactionDate()}
            </Text>
          </View>
        </View>

        <View style={styles.statusContainer}>
          <Text style={[styles.amount, { color: Colors[theme].text }]}>
            ${transaction.amount || "0.00"}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(transaction.status) + "20" },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(transaction.status) },
              ]}
            >
              {transaction.status}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        {renderProductImage()}

        <View style={styles.productInfo}>
          <Text
            style={[styles.productTitle, { color: Colors[theme].text }]}
            numberOfLines={2}
          >
            {transaction.product?.title || "Product"}
          </Text>

          <View style={styles.participantInfo}>
            <Text
              style={[
                styles.participantLabel,
                { color: Colors[theme].textSecondary },
              ]}
            >
              {getParticipantLabel()} {getParticipantName()}
            </Text>
          </View>

          {renderRentalDuration()}
        </View>

        <IconSymbol
          name="chevron.right"
          size={20}
          color={Colors[theme].textSecondary}
        />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.xs,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  typeInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  typeText: {
    flexDirection: "column",
  },
  typeLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  date: {
    fontSize: Typography.fontSize.sm,
  },
  statusContainer: {
    alignItems: "flex-end",
  },
  amount: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    textTransform: "uppercase",
  },
  content: {
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
  productInfo: {
    flex: 1,
  },
  productTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.xs,
  },
  participantInfo: {
    marginBottom: Spacing.xs,
  },
  participantLabel: {
    fontSize: Typography.fontSize.sm,
  },
  duration: {
    fontSize: Typography.fontSize.sm,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});

export default TransactionCard;
