import {
  EmptyState,
  ProductListEmptyState,
  SearchEmptyState,
} from "@/src/components/common/EmptyState";
import { FloatingActionButton } from "@/src/components/common/FloatingActionButton";
import { LoadingCardList } from "@/src/components/common/LoadingCard";
import { SortOption, SortOptions } from "@/src/components/common/SortOptions";
import {
  CategoryChip,
  CategoryName,
} from "@/src/components/product/CategoryChip";
import { ProductCard } from "@/src/components/product/ProductCard";
import { IconSymbol } from "@/src/components/ui/icon-symbol";
import {
  BorderRadius,
  Colors,
  Spacing,
  Typography,
} from "@/src/constants/theme";
import {
  useCategories,
  useDeleteProduct,
  useInfiniteProducts,
} from "@/src/hooks/api/useProducts";
import type { Category, Product } from "@/src/types";
import { router } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PRODUCT_CARD_HEIGHT = 140;

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<CategoryName[]>(
    []
  );
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [sortOption, setSortOption] = useState<string>("date_oldest");

  const { data: categoriesData, isLoading: categoriesLoading } =
    useCategories();

  const {
    data,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useInfiniteProducts();
  const deleteProduct = useDeleteProduct();

  const products = useMemo(() => {
    if (!data?.pages) return [];
    let allProducts = data.pages.flatMap((page) => page.data);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      allProducts = allProducts.filter(
        (product) =>
          product.title.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query)
      );
    }

    if (selectedCategories.length > 0) {
      allProducts = allProducts.filter((product) =>
        product.categories?.some((category) =>
          selectedCategories.includes(category as CategoryName)
        )
      );
    }

    // Sort the products based on selected option
    const sorted = allProducts.sort((a, b) => {
      let comparison = 0;

      switch (sortOption) {
        case "date_newest":
          const dateA_newest = new Date(a.date_posted).getTime();
          const dateB_newest = new Date(b.date_posted).getTime();
          comparison = dateB_newest - dateA_newest;
          break;
        case "date_oldest":
          const dateA_oldest = new Date(a.date_posted).getTime();
          const dateB_oldest = new Date(b.date_posted).getTime();
          comparison = dateA_oldest - dateB_oldest;
          break;
        case "price":
          const priceA = parseFloat(a.purchase_price || a.rent_price || "0");
          const priceB = parseFloat(b.purchase_price || b.rent_price || "0");
          comparison = priceA - priceB;
          break;
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "category":
          const categoryA = a.categories[0] || "";
          const categoryB = b.categories[0] || "";
          comparison = categoryA.localeCompare(categoryB);
          break;
        default:
          comparison = 0;
      }

      return comparison;
    });

    return sorted;
  }, [data, searchQuery, selectedCategories, sortOption]);

  // Sort options for products
  const sortOptions: SortOption[] = useMemo(
    () => [
      { key: "date_newest", label: "Date (Newest)" },
      { key: "date_oldest", label: "Date (Oldest)" },
      { key: "price", label: "Price" },
      { key: "title", label: "Name" },
      { key: "category", label: "Category" },
    ],
    []
  );

  const handleProductPress = useCallback((product: Product) => {
    router.push(`/products/${product.id}` as any);
  }, []);

  const handleCategoryToggle = useCallback(
    (category: Category | CategoryName) => {
      const categoryId = typeof category === "string" ? category : category.id;
      setSelectedCategories((prev) => {
        if (prev.includes(categoryId)) {
          return prev.filter((c) => c !== categoryId);
        } else {
          return [...prev, categoryId];
        }
      });
    },
    []
  );

  const handleClearCategories = useCallback(() => {
    setSelectedCategories([]);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    setSelectedCategories([]);
  }, []);

  const handleAddProduct = useCallback(() => {
    router.push("/products/create-multistep");
  }, []);

  const handleLoadMore = useCallback(() => {
    // TODO: Backend not ready for pagination
  }, []);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const toggleViewMode = useCallback(() => {
    setViewMode((prev) => (prev === "list" ? "grid" : "list"));
  }, []);

  const handleSortChange = useCallback((option: string) => {
    setSortOption(option);
  }, []);

  const handleEditProduct = useCallback((product: Product) => {
    router.push(`/products/edit/${product.id}` as any);
  }, []);

  const handleDeleteProduct = useCallback(
    (product: Product) => {
      Alert.alert(
        "Delete Product",
        `Are you sure you want to delete "${product.title}"? This action cannot be undone.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                await deleteProduct.mutateAsync(product.id);
                Alert.alert("Success", "Product deleted successfully!");
              } catch (error) {
                Alert.alert(
                  "Error",
                  error instanceof Error
                    ? error.message
                    : "Failed to delete product"
                );
              }
            },
          },
        ]
      );
    },
    [deleteProduct]
  );

  const renderProduct = useCallback(
    ({ item }: { item: Product }) => (
      <ProductCard
        product={item}
        variant={viewMode}
        onPress={handleProductPress}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
        showOwnerInfo={true}
        showActions={true}
        testID={`product-card-${item.id}`}
      />
    ),
    [viewMode, handleProductPress, handleEditProduct, handleDeleteProduct]
  );

  const renderListHeader = useCallback(
    () => (
      <View
        style={[
          styles.headerContainer,
          { backgroundColor: Colors[theme].background },
        ]}
      >
        {/* Search Bar */}
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: Colors[theme].backgroundSecondary },
          ]}
        >
          <IconSymbol
            name="magnifyingglass"
            size={20}
            color={Colors[theme].textSecondary}
          />
          <TextInput
            style={[styles.searchInput, { color: Colors[theme].text }]}
            placeholder="Search products..."
            placeholderTextColor={Colors[theme].textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            testID="search-input"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")} testID="clear-search">
              <IconSymbol
                name="xmark.circle.fill"
                size={20}
                color={Colors[theme].textSecondary}
              />
            </Pressable>
          )}
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <View style={styles.filtersHeader}>
            <Text style={[styles.filtersTitle, { color: Colors[theme].text }]}>
              Categories
            </Text>
            <View style={styles.filtersActions}>
              {selectedCategories.length > 0 && (
                <Pressable
                  onPress={handleClearCategories}
                  testID="clear-categories"
                >
                  <Text
                    style={[styles.clearButton, { color: Colors[theme].tint }]}
                  >
                    Clear ({selectedCategories.length})
                  </Text>
                </Pressable>
              )}
              <Pressable onPress={toggleViewMode} testID="toggle-view-mode">
                <IconSymbol
                  name={
                    viewMode === "list" ? "rectangle.grid.3x2" : "list.bullet"
                  }
                  size={25}
                  color={Colors[theme].text}
                />
              </Pressable>
            </View>
          </View>

          {/* Categories */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
            style={styles.categoriesScrollView}
          >
            {categoriesLoading ? (
              <Text
                style={[
                  styles.loadingText,
                  { color: Colors[theme].textSecondary },
                ]}
              >
                Loading categories...
              </Text>
            ) : (
              categoriesData?.map((category) => (
                <CategoryChip
                  key={category.id}
                  category={category}
                  selected={selectedCategories.includes(category.id)}
                  onPress={handleCategoryToggle}
                  size="medium"
                  testID={`category-filter-${category.id}`}
                />
              ))
            )}
          </ScrollView>
        </View>

        {(searchQuery || selectedCategories.length > 0) && (
          <View
            style={[
              styles.resultsSummary,
              { backgroundColor: Colors[theme].backgroundSecondary },
            ]}
          >
            <Text
              style={[
                styles.resultsText,
                { color: Colors[theme].textSecondary },
              ]}
            >
              {products.length} products found
              {searchQuery && ` for "${searchQuery}"`}
              {selectedCategories.length > 0 &&
                ` in ${selectedCategories.length} categories`}
            </Text>
          </View>
        )}

        {/* Sort Options */}
        <SortOptions
          options={sortOptions}
          selectedOption={sortOption}
          onSortChange={handleSortChange}
          style={{ backgroundColor: Colors[theme].background }}
        />
      </View>
    ),
    [
      theme,
      searchQuery,
      selectedCategories,
      viewMode,
      products.length,
      categoriesData,
      categoriesLoading,
      handleClearCategories,
      handleCategoryToggle,
      toggleViewMode,
      sortOptions,
      sortOption,
      handleSortChange,
    ]
  );

  const renderListFooter = useCallback(() => {
    if (isFetchingNextPage) {
      return (
        <View style={styles.footerContainer}>
          <LoadingCardList count={3} variant="product-list" />
        </View>
      );
    }
    if (!hasNextPage && products.length > 0) {
      return (
        <View style={styles.footerContainer}>
          <Text
            style={[
              styles.endOfListText,
              { color: Colors[theme].textSecondary },
            ]}
          >
            You&apos;ve reached the end of the list
          </Text>
        </View>
      );
    }
    return null;
  }, [isFetchingNextPage, hasNextPage, products.length, theme]);

  const getItemLayout = useCallback(
    (data: any, index: number) => ({
      length: PRODUCT_CARD_HEIGHT,
      offset: PRODUCT_CARD_HEIGHT * index,
      index,
    }),
    []
  );

  const keyExtractor = useCallback(
    (item: Product, index: number) =>
      item?.id?.toString() || `product-${index}`,
    []
  );

  if (isLoading && !data) {
    return (
      <SafeAreaView style={styles.container}>
        {renderListHeader()}
        <LoadingCardList count={8} variant="product-list" />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.container}>
        {renderListHeader()}
        <EmptyState
          title="Something went wrong"
          description="Unable to load products. Please check your connection and try again."
          iconName="exclamationmark.triangle"
          buttonTitle="Try Again"
          onButtonPress={handleRefresh}
          variant="error"
        />
      </SafeAreaView>
    );
  }

  if (products.length === 0) {
    if (searchQuery || selectedCategories.length > 0) {
      return (
        <SafeAreaView style={styles.container}>
          {renderListHeader()}
          <SearchEmptyState
            searchQuery={searchQuery || selectedCategories.join(", ")}
            onClearSearch={handleClearSearch}
          />
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={styles.container}>
        {renderListHeader()}
        <ProductListEmptyState onAddProduct={handleAddProduct} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: Colors[theme].background,
        },
      ]}
    >
      {renderListHeader()}

      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={keyExtractor}
        ListFooterComponent={renderListFooter}
        // Performance optimizations
        removeClippedSubviews={true}
        maxToRenderPerBatch={15}
        updateCellsBatchingPeriod={50}
        windowSize={15}
        initialNumToRender={15}
        getItemLayout={viewMode === "list" ? getItemLayout : undefined}
        disableVirtualization={false}
        // Grid configuration
        numColumns={viewMode === "grid" ? 2 : 1}
        key={viewMode}
        // Loading and refresh
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            colors={[Colors[theme].tint]}
            tintColor={Colors[theme].tint}
          />
        }
        // Styling
        contentContainerStyle={
          products.length === 0 ? styles.emptyContainer : undefined
        }
        showsVerticalScrollIndicator={false}
        testID="products-list"
      />

      <FloatingActionButton
        onPress={handleAddProduct}
        iconName="plus"
        testID="add-product-fab"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  emptyContainer: {
    flex: 1,
  },

  // Header
  headerContainer: {
    backgroundColor: Colors.light.background,
    paddingBottom: Spacing.md,
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    paddingVertical: Spacing.xs,
  },

  // Filters
  filtersContainer: {
    paddingHorizontal: Spacing.md,
  },
  filtersHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  filtersTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  filtersActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  clearButton: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  categoriesScrollView: {
    maxHeight: 50,
  },
  categoriesContainer: {
    flexDirection: "row",
    gap: Spacing.sm,
    paddingLeft: 0,
    paddingRight: Spacing.md,
    paddingVertical: Spacing.xs,
  },

  // Results
  resultsSummary: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  resultsText: {
    fontSize: Typography.fontSize.sm,
    textAlign: "center",
  },

  // Footer
  footerContainer: {
    paddingVertical: Spacing.lg,
  },
  endOfListText: {
    fontSize: Typography.fontSize.sm,
    textAlign: "center",
    fontStyle: "italic",
  },
  loadingText: {
    fontSize: Typography.fontSize.sm,
    textAlign: "center",
    fontStyle: "italic",
    padding: Spacing.md,
  },
});
