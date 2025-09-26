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
import Feather from "@expo/vector-icons/Feather";
import React, { useState } from "react";
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
// Using built-in date picker functionality

export interface RentModalProps {
  visible: boolean;
  product: Product;
  onConfirm: (
    renterEmail: string,
    productId: string,
    rentOption: string,
    startDate: string,
    endDate: string
  ) => void;
  onCancel: () => void;
  loading?: boolean;
}

interface RentDuration {
  id: string;
  label: string;
  days: number;
  multiplier: number;
}

const RENT_DURATIONS: RentDuration[] = [
  { id: "1day", label: "1 Day", days: 1, multiplier: 1 },
  { id: "3days", label: "3 Days", days: 3, multiplier: 3 },
  { id: "1week", label: "1 Week", days: 7, multiplier: 7 },
  { id: "2weeks", label: "2 Weeks", days: 14, multiplier: 14 },
  { id: "1month", label: "1 Month", days: 30, multiplier: 30 },
];

export const RentModal: React.FC<RentModalProps> = ({
  visible,
  product,
  onConfirm,
  onCancel,
  loading = false,
}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";

  const [selectedDuration, setSelectedDuration] = useState<RentDuration>(
    RENT_DURATIONS[0]
  );
  const [rentOption, setRentOption] = useState<"hour" | "day">("hour");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 24 * 60 * 60 * 1000)
  );

  const resetForm = () => {
    setSelectedDuration(RENT_DURATIONS[0]);
  };

  const handleConfirm = () => {
    const formatDateTime = (date: Date) => {
      return date.toISOString().replace("T", " ").slice(0, 19);
    };

    onConfirm(
      "",
      product.id,
      rentOption,
      formatDateTime(startDate),
      formatDateTime(endDate)
    );
    resetForm();
  };

  const handleCancel = () => {
    onCancel();
    resetForm();
  };

  const handleStartDatePress = () => {
    Alert.alert(
      "Select Start Date",
      "Choose when you want to start the rental",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Today",
          onPress: () => {
            const today = new Date();
            setStartDate(today);
            // Auto-update end date
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            setEndDate(tomorrow);
          },
        },
        {
          text: "Tomorrow",
          onPress: () => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            setStartDate(tomorrow);
            // Auto-update end date
            const dayAfter = new Date(tomorrow);
            dayAfter.setDate(tomorrow.getDate() + 1);
            setEndDate(dayAfter);
          },
        },
        {
          text: "Next Week",
          onPress: () => {
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 7);
            setStartDate(nextWeek);
            // Auto-update end date
            const weekAfter = new Date(nextWeek);
            weekAfter.setDate(nextWeek.getDate() + 7);
            setEndDate(weekAfter);
          },
        },
      ]
    );
  };

  const handleEndDatePress = () => {
    Alert.alert("Select End Date", "Choose when you want to return the item", [
      { text: "Cancel", style: "cancel" },
      {
        text: "1 Day",
        onPress: () => {
          const oneDay = new Date(startDate);
          oneDay.setDate(startDate.getDate() + 1);
          setEndDate(oneDay);
        },
      },
      {
        text: "1 Week",
        onPress: () => {
          const oneWeek = new Date(startDate);
          oneWeek.setDate(startDate.getDate() + 7);
          setEndDate(oneWeek);
        },
      },
      {
        text: "1 Month",
        onPress: () => {
          const oneMonth = new Date(startDate);
          oneMonth.setMonth(startDate.getMonth() + 1);
          setEndDate(oneMonth);
        },
      },
    ]);
  };

  const calculateTotalPrice = () => {
    const basePrice = parseFloat(product.rent_price || "0");
    const totalDays = selectedDuration.days;

    // Adjust price based on rent_option
    let dailyRate = basePrice;
    if (product.rent_option === "hour") {
      dailyRate = basePrice * 24; // Convert hourly to daily
    } else if (product.rent_option === "day") {
      dailyRate = basePrice; // Already daily
    }

    const totalPrice = dailyRate * totalDays;
    const serviceFee = 0; // 5% service fee, minimum $1.99

    return {
      basePrice: totalPrice,
      serviceFee,
      total: totalPrice + serviceFee,
    };
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
        <Text style={[styles.productPrice, { color: Colors[theme].info }]}>
          ${product.rent_price}/{product.rent_option}
        </Text>
      </View>
    </View>
  );

  const renderRentOptionSelector = () => (
    <View style={styles.rentOptionSection}>
      <Text style={[styles.sectionTitle, { color: Colors[theme].text }]}>
        Rent Option
      </Text>
      <View style={styles.rentOptions}>
        {["hour", "day"].map((option) => {
          const isSelected = rentOption === option;
          const displayText = option === "hour" ? "Per Hour" : "Per Day";
          return (
            <Pressable
              key={option}
              style={[
                styles.rentOptionButton,
                {
                  backgroundColor: isSelected
                    ? Colors[theme].tint + "20"
                    : Colors[theme].backgroundSecondary,
                  borderColor: isSelected
                    ? Colors[theme].tint
                    : Colors[theme].border,
                },
              ]}
              onPress={() => setRentOption(option as "hour" | "day")}
            >
              <Text
                style={[
                  styles.rentOptionText,
                  {
                    color: isSelected ? Colors[theme].tint : Colors[theme].text,
                    fontWeight: isSelected ? "600" : "500",
                  },
                ]}
              >
                {displayText}
              </Text>
              {isSelected && (
                <IconSymbol
                  name="checkmark"
                  size={16}
                  color={Colors[theme].tint}
                />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  const renderRentalDetails = () => {
    return (
      <View
        style={[
          styles.rentalDetails,
          { backgroundColor: Colors[theme].backgroundSecondary },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: Colors[theme].text }]}>
          Rental Period
        </Text>

        <View style={styles.detailRow}>
          <Feather
            name="calendar"
            size={20}
            color={Colors[theme].textSecondary}
          />
          <View style={styles.detailContent}>
            <Text
              style={[
                styles.detailLabel,
                { color: Colors[theme].textSecondary },
              ]}
            >
              Start Date & Time
            </Text>
            <Pressable style={styles.dateButton} onPress={handleStartDatePress}>
              <Text
                style={[styles.dateButtonText, { color: Colors[theme].text }]}
              >
                {startDate.toLocaleDateString()} at{" "}
                {startDate.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
              <IconSymbol
                name="chevron.right"
                size={16}
                color={Colors[theme].textSecondary}
              />
            </Pressable>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Feather
            name="calendar"
            size={20}
            color={Colors[theme].textSecondary}
          />
          <View style={styles.detailContent}>
            <Text
              style={[
                styles.detailLabel,
                { color: Colors[theme].textSecondary },
              ]}
            >
              End Date & Time
            </Text>
            <Pressable style={styles.dateButton} onPress={handleEndDatePress}>
              <Text
                style={[styles.dateButtonText, { color: Colors[theme].text }]}
              >
                {endDate.toLocaleDateString()} at{" "}
                {endDate.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
              <IconSymbol
                name="chevron.right"
                size={16}
                color={Colors[theme].textSecondary}
              />
            </Pressable>
          </View>
        </View>

        <View style={styles.detailRow}>
          <IconSymbol
            name="clock"
            size={18}
            color={Colors[theme].textSecondary}
          />
          <View style={styles.detailContent}>
            <Text
              style={[
                styles.detailLabel,
                { color: Colors[theme].textSecondary },
              ]}
            >
              Duration
            </Text>
            <Text style={[styles.detailValue, { color: Colors[theme].text }]}>
              {Math.max(
                1,
                Math.ceil(
                  (endDate.getTime() - startDate.getTime()) /
                    (1000 * 60 * 60 * 24)
                )
              )}{" "}
              {selectedDuration.days === 1 ? "day" : "days"}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderPricingSummary = () => {
    const pricing = calculateTotalPrice();

    return (
      <View
        style={[
          styles.pricingSummary,
          { backgroundColor: Colors[theme].backgroundSecondary },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: Colors[theme].text }]}>
          Pricing Summary
        </Text>

        <View style={styles.summaryRow}>
          <Text
            style={[
              styles.summaryLabel,
              { color: Colors[theme].textSecondary },
            ]}
          >
            Rental Cost ({selectedDuration.days}{" "}
            {selectedDuration.days === 1 ? "day" : "days"})
          </Text>
          <Text style={[styles.summaryValue, { color: Colors[theme].text }]}>
            ${pricing.basePrice.toFixed(2)}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text
            style={[
              styles.summaryLabel,
              { color: Colors[theme].textSecondary },
            ]}
          >
            Service Fee
          </Text>
          <Text style={[styles.summaryValue, { color: Colors[theme].text }]}>
            ${pricing.serviceFee.toFixed(2)}
          </Text>
        </View>

        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={[styles.totalLabel, { color: Colors[theme].text }]}>
            Total
          </Text>
          <Text style={[styles.totalValue, { color: Colors[theme].text }]}>
            ${pricing.total.toFixed(2)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      onClose={handleCancel}
      title="Rent This Item"
      size="large"
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
      >
        {renderProductSummary()}
        {renderRentOptionSelector()}
        {renderRentalDetails()}
        {renderPricingSummary()}

        <View
          style={[
            styles.termsSection,
            { backgroundColor: Colors[theme].warning + "10" },
          ]}
        >
          <IconSymbol
            name="exclamationmark.triangle"
            size={20}
            color={Colors[theme].warning}
          />
          <Text style={[styles.termsText, { color: Colors[theme].warning }]}>
            Please return the item on time and in good condition. Late returns
            may incur additional fees.
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
          title={loading ? "Processing..." : "Start Rental"}
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
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
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
  rentOptionSection: {
    marginBottom: Spacing.lg,
  },
  rentOptions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  rentOptionButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  rentOptionText: {
    fontSize: Typography.fontSize.sm,
  },
  dateButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.dark.background,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  dateButtonText: {
    fontSize: Typography.fontSize.sm,
    flex: 1,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.xs,
  },
  sectionDescription: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.md,
  },
  durationOptions: {
    gap: Spacing.sm,
  },
  durationOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  durationLabel: {
    fontSize: Typography.fontSize.base,
  },
  rentalDetails: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.xs,
  },
  detailValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
  pricingSummary: {
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
