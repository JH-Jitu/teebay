import { DropdownMenu } from "@/src/components/common/DropdownMenu";
import { LoadingSpinner } from "@/src/components/common/LoadingSpinner";
import { SortOption, SortOptions } from "@/src/components/common/SortOptions";
import { IconSymbol } from "@/src/components/ui/icon-symbol";
import {
  BorderRadius,
  Colors,
  Spacing,
  Typography,
} from "@/src/constants/theme";
import {
  useDeletePurchase,
  useDeleteRental,
  usePurchases,
  useRentals,
} from "@/src/hooks/api/useTransactions";
import type { Transaction } from "@/src/types";
import { router, useFocusEffect } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type TabType = "purchases" | "rentals";

const TransactionCard = ({
  transaction,
  onDelete,
}: {
  transaction: Transaction;
  onDelete: (id: string, type: "BUY" | "RENT") => void;
}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return Colors[theme].success;
      case "PENDING":
        return Colors[theme].warning;
      case "CANCELLED":
        return Colors[theme].error;
      default:
        return Colors[theme].info;
    }
  };

  const getTransactionIcon = (type: string) => {
    return type === "BUY" ? "cart" : "clock";
  };

  const handlePress = () => {
    const transactionType = transaction.type === "BUY" ? "purchase" : "rental";
    router.push(
      `/transactions/${transaction.id}?type=${transactionType}` as any
    );
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Transaction",
      `Are you sure you want to delete this ${
        transaction.type === "BUY" ? "purchase" : "rental"
      }? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete(transaction.id, transaction.type),
        },
      ]
    );
  };

  const menuItems = [
    {
      id: "delete",
      label: "Delete",
      iconName: "trash",
      onPress: handleDelete,
      destructive: true,
    },
  ];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.transactionCard,
        { backgroundColor: Colors[theme].backgroundSecondary },
        pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
      ]}
      onPress={handlePress}
    >
      <View style={styles.transactionHeader}>
        <View style={styles.transactionInfo}>
          <IconSymbol
            name={getTransactionIcon(transaction.type)}
            size={24}
            color={Colors[theme].tint}
          />
          <View style={styles.transactionDetails}>
            <Text style={[styles.productTitle, { color: Colors[theme].text }]}>
              {transaction.product?.title || "Product"}
            </Text>
            <Text
              style={[
                styles.transactionType,
                { color: Colors[theme].textSecondary },
              ]}
            >
              {transaction.type === "BUY" ? "Purchase" : "Rental"}
            </Text>
          </View>
        </View>

        <View style={styles.statusContainer}>
          <Text style={[styles.amount, { color: Colors[theme].text }]}>
            $
            {transaction.amount ||
              (transaction.type === "RENT" ? transaction.total_price : "0")}
          </Text>
          <Text
            style={[
              styles.status,
              { color: getStatusColor(transaction.status || "COMPLETED") },
            ]}
          >
            {transaction.status || "COMPLETED"}
          </Text>
        </View>

        <DropdownMenu items={menuItems} style={styles.transactionActions} />
      </View>

      <View style={styles.transactionMeta}>
        <Text style={[styles.date, { color: Colors[theme].textSecondary }]}>
          {new Date(
            transaction.type === "BUY"
              ? transaction.purchase_date
              : transaction.rent_date
          ).toLocaleDateString()}
        </Text>
        <Text
          style={[styles.participant, { color: Colors[theme].textSecondary }]}
        >
          {transaction.type === "BUY" ? "Sold by" : "Rented from"} User{" "}
          {transaction?.sellerId || "Unknown"}
        </Text>
      </View>
    </Pressable>
  );
};

export default function TransactionsScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "dark";
  const [activeTab, setActiveTab] = useState<TabType>("purchases");
  const [sortOption, setSortOption] = useState<string>("date_oldest");

  const {
    data: purchasesData,
    isLoading: isLoadingPurchases,
    refetch: refetchPurchases,
    isRefetching: isRefetchingPurchases,
  } = usePurchases();

  const {
    data: rentalsData,
    isLoading: isLoadingRentals,
    refetch: refetchRentals,
    isRefetching: isRefetchingRentals,
  } = useRentals();

  const deletePurchaseMutation = useDeletePurchase();
  const deleteRentalMutation = useDeleteRental();

  useFocusEffect(
    React.useCallback(() => {
      const timer = setTimeout(() => {
        setActiveTab((prev) => prev);
      }, 100);

      return () => clearTimeout(timer);
    }, [])
  );

  const sortOptions: SortOption[] = React.useMemo(
    () => [
      { key: "date_newest", label: "Date (Newest)" },
      { key: "date_oldest", label: "Date (Oldest)" },
      { key: "amount", label: "Amount" },
      { key: "type", label: "Type" },
    ],
    []
  );

  const sortedData = React.useMemo(() => {
    const purchases = purchasesData?.data ?? [];
    const rentals = rentalsData?.data ?? [];
    const data = activeTab === "purchases" ? purchases : rentals;

    const sorted = [...data].sort((a, b) => {
      let comparison = 0;

      switch (sortOption) {
        case "date_newest":
          const dateA_newest = new Date(
            a.type === "BUY" ? a.purchase_date : a.rent_date
          ).getTime();
          const dateB_newest = new Date(
            b.type === "BUY" ? b.purchase_date : b.rent_date
          ).getTime();
          comparison = dateB_newest - dateA_newest;
          break;
        case "date_oldest":
          const dateA_oldest = new Date(
            a.type === "BUY" ? a.purchase_date : a.rent_date
          ).getTime();
          const dateB_oldest = new Date(
            b.type === "BUY" ? b.purchase_date : b.rent_date
          ).getTime();
          comparison = dateA_oldest - dateB_oldest;
          break;
        case "amount":
          const amountA =
            a.amount || (a.type === "RENT" ? parseFloat(a.total_price) : 0);
          const amountB =
            b.amount || (b.type === "RENT" ? parseFloat(b.total_price) : 0);
          comparison = amountA - amountB;
          break;
        case "type":
          comparison = a.type.localeCompare(b.type);
          break;
        default:
          comparison = 0;
      }

      return comparison;
    });

    return sorted;
  }, [purchasesData?.data, rentalsData?.data, activeTab, sortOption]);

  const activeData = sortedData;
  const isLoading =
    activeTab === "purchases" ? isLoadingPurchases : isLoadingRentals;
  const isRefetching =
    activeTab === "purchases" ? isRefetchingPurchases : isRefetchingRentals;

  const handleRefresh = () => {
    if (activeTab === "purchases") {
      refetchPurchases();
    } else {
      refetchRentals();
    }
  };

  const handleDeleteTransaction = async (id: string, type: "BUY" | "RENT") => {
    try {
      if (type === "BUY") {
        await deletePurchaseMutation.mutateAsync(id);
      } else {
        await deleteRentalMutation.mutateAsync(id);
      }

      if (activeTab === "purchases") {
        refetchPurchases();
      } else {
        refetchRentals();
      }
    } catch (error) {
      console.error("Failed to delete transaction:", error);
      Alert.alert("Error", "Failed to delete transaction. Please try again.", [
        { text: "OK" },
      ]);
    }
  };

  const handleSortChange = (option: string) => {
    setSortOption(option);
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <TransactionCard transaction={item} onDelete={handleDeleteTransaction} />
  );

  const renderFooter = () => {
    return null;
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <IconSymbol
        name="list.bullet"
        size={64}
        color={Colors[theme].textSecondary}
      />
      <Text style={[styles.emptyTitle, { color: Colors[theme].text }]}>
        No {activeTab} yet
      </Text>
      <Text
        style={[
          styles.emptyDescription,
          { color: Colors[theme].textSecondary },
        ]}
      >
        {activeTab === "purchases"
          ? "Your purchase history will appear here"
          : "Your rental history will appear here"}
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: Colors[theme].background },
        ]}
      >
        <View
          style={[
            styles.fixedHeader,
            { backgroundColor: Colors[theme].background },
          ]}
        >
          <Text style={[styles.title, { color: Colors[theme].text }]}>
            Transactions
          </Text>

          <View style={styles.tabContainer}>
            <Pressable
              style={[
                styles.tab,
                activeTab === "purchases" && styles.activeTab,
                activeTab === "purchases" && {
                  backgroundColor: Colors[theme].tint,
                },
              ]}
              onPress={() => {
                setActiveTab("purchases");
                setTimeout(() => {
                  setActiveTab("purchases");
                }, 50);
              }}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color:
                      activeTab === "purchases"
                        ? "white"
                        : Colors[theme].textSecondary,
                  },
                ]}
              >
                Purchases
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.tab,
                activeTab === "rentals" && styles.activeTab,
                activeTab === "rentals" && {
                  backgroundColor: Colors[theme].tint,
                },
              ]}
              onPress={() => {
                setActiveTab("rentals");
                setTimeout(() => {
                  setActiveTab("rentals");
                }, 50);
              }}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color:
                      activeTab === "rentals"
                        ? "white"
                        : Colors[theme].textSecondary,
                  },
                ]}
              >
                Rentals
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Sort Options */}
        <SortOptions
          options={sortOptions}
          selectedOption={sortOption}
          onSortChange={handleSortChange}
          style={{ backgroundColor: Colors[theme].background }}
        />

        <View style={styles.scrollView}>
          <LoadingSpinner />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: Colors[theme].background }]}
    >
      {/* Fixed Header with Tabs */}
      <View
        style={[
          styles.fixedHeader,
          { backgroundColor: Colors[theme].background },
        ]}
      >
        <Text style={[styles.title, { color: Colors[theme].text }]}>
          Transactions
        </Text>

        <View style={styles.tabContainer}>
          <Pressable
            style={[
              styles.tab,
              activeTab === "purchases" && styles.activeTab,
              activeTab === "purchases" && {
                backgroundColor: Colors[theme].tint,
              },
            ]}
            onPress={() => {
              setActiveTab("purchases");
              // Force a small delay to ensure proper state update
              setTimeout(() => {
                setActiveTab("purchases");
              }, 50);
            }}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    activeTab === "purchases"
                      ? "white"
                      : Colors[theme].textSecondary,
                },
              ]}
            >
              Purchases
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.tab,
              activeTab === "rentals" && styles.activeTab,
              activeTab === "rentals" && {
                backgroundColor: Colors[theme].tint,
              },
            ]}
            onPress={() => {
              setActiveTab("rentals");
              setTimeout(() => {
                setActiveTab("rentals");
              }, 50);
            }}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    activeTab === "rentals"
                      ? "white"
                      : Colors[theme].textSecondary,
                },
              ]}
            >
              Rentals
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Sort Options */}
      <SortOptions
        options={sortOptions}
        selectedOption={sortOption}
        onSortChange={handleSortChange}
        style={{ backgroundColor: Colors[theme].background }}
      />

      {/* Scrollable Content */}
      <FlatList
        data={activeData}
        renderItem={renderTransaction}
        keyExtractor={(item, index) => item?.id || `transaction-${index}`}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyState}
        // onEndReached removed since all data loads at once
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            tintColor={Colors[theme].tint}
          />
        }
        contentContainerStyle={
          activeData.length === 0 ? styles.emptyContainer : styles.scrollContent
        }
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
  },
  fixedHeader: {
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Spacing.md,
  },
  title: {
    fontSize: Typography.fontSize["3xl"],
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.lg,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
  },
  activeTab: {
    // backgroundColor set dynamically
  },
  tabText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  transactionCard: {
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
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  transactionInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  transactionDetails: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  productTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.xs,
  },
  transactionType: {
    fontSize: Typography.fontSize.sm,
  },
  statusContainer: {
    alignItems: "flex-end",
  },
  transactionActions: {
    marginLeft: Spacing.sm,
  },
  amount: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.xs,
  },
  status: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    textTransform: "capitalize",
  },
  transactionMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  date: {
    fontSize: Typography.fontSize.xs,
  },
  participant: {
    fontSize: Typography.fontSize.xs,
  },
  footer: {
    padding: Spacing.lg,
    alignItems: "center",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyDescription: {
    fontSize: Typography.fontSize.base,
    textAlign: "center",
  },
});
