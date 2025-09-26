import { Button } from "@/src/components/common/Button";
import { MultiStepForm } from "@/src/components/forms/MultiStepForm";
import type { CategoriesData } from "@/src/components/forms/steps/CategoriesStep";
import { CategoriesStep } from "@/src/components/forms/steps/CategoriesStep";
import type { ImagesData } from "@/src/components/forms/steps/ImagesStep";
import { ImagesStep } from "@/src/components/forms/steps/ImagesStep";
import type { PricingData } from "@/src/components/forms/steps/PricingStep";
import { PricingStep } from "@/src/components/forms/steps/PricingStep";
import type { ProductDetailsData } from "@/src/components/forms/steps/ProductDetailsStep";
import { ProductDetailsStep } from "@/src/components/forms/steps/ProductDetailsStep";
import type { ReviewData } from "@/src/components/forms/steps/ReviewStep";
import { ReviewStep } from "@/src/components/forms/steps/ReviewStep";
import { IconSymbol } from "@/src/components/ui/icon-symbol";
import { Colors, Typography } from "@/src/constants/theme";
import {
  useCategories,
  useCreateProduct,
  useProduct,
  useUpdateProduct,
} from "@/src/hooks/api/useProducts";
import { useAuthStore } from "@/src/store/auth";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface FormData {
  productDetails: ProductDetailsData;
  categories: CategoriesData;
  pricing: PricingData;
  images: ImagesData;
  acceptTerms: boolean;
}

interface FormErrors {
  productDetails?: Partial<ProductDetailsData>;
  categories?: { categories?: string };
  pricing?: Partial<Record<keyof PricingData, string>>;
  images?: { images?: string };
  acceptTerms?: string;
}

interface ProductFormProps {
  mode: "create" | "edit";
  productId?: string;
}

const FORM_STEPS = [
  { id: 1, title: "Product Details", component: ProductDetailsStep },
  { id: 2, title: "Categories", component: CategoriesStep },
  { id: 3, title: "Pricing", component: PricingStep },
  { id: 4, title: "Images", component: ImagesStep },
  { id: 5, title: "Review", component: ReviewStep },
];

export const ProductForm: React.FC<ProductFormProps> = ({
  mode,
  productId,
}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";
  const { user } = useAuthStore();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    productDetails: {
      title: "",
      description: "",
    },
    categories: {
      categories: [],
    },
    pricing: {
      availableForSale: false,
      availableForRent: false,
      purchasePrice: "",
      rentPrice: "",
      rentOption: "day",
    },
    images: {
      images: [],
    },
    acceptTerms: mode === "create",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // Only fetch product data in edit mode
  const {
    data: product,
    isLoading: productLoading,
    error: productError,
  } = useProduct(productId || "");

  const { isLoading: categoriesLoading } = useCategories();

  // Initialize form data when product loads (edit mode only)
  useEffect(() => {
    if (mode === "edit" && product) {
      setFormData({
        productDetails: {
          title: product.title || "",
          description: product.description || "",
        },
        categories: {
          categories: product.categories || [],
        },
        pricing: {
          availableForSale: product.availableForSale || false,
          availableForRent: product.availableForRent || false,
          purchasePrice: product.purchasePrice?.toString() || "",
          rentPrice: product.rentPrice?.toString() || "",
          rentOption:
            (product.rentType?.toLowerCase().replace("ly", "") as
              | "day"
              | "hour"
              | "week"
              | "month") || "day",
        },
        images: {
          images:
            product.images?.map((img) =>
              typeof img === "string" ? img : img.url
            ) || [],
        },
        acceptTerms: true,
      });
    }
  }, [product, mode]);

  const validateStep = (stepIndex: number): boolean => {
    const newErrors: FormErrors = { ...errors };
    let isValid = true;

    switch (stepIndex) {
      case 0: // Product Details
        const productErrors: Partial<ProductDetailsData> = {};
        if (!formData.productDetails.title?.trim()) {
          productErrors.title = "Product title is required";
          isValid = false;
        } else if (formData.productDetails.title.length < 3) {
          productErrors.title = "Title must be at least 3 characters";
          isValid = false;
        } else if (formData.productDetails.title.length > 100) {
          productErrors.title = "Title must be less than 100 characters";
          isValid = false;
        }

        if (!formData.productDetails.description?.trim()) {
          productErrors.description = "Product description is required";
          isValid = false;
        } else if (formData.productDetails.description.length < 10) {
          productErrors.description =
            "Description must be at least 10 characters";
          isValid = false;
        } else if (formData.productDetails.description.length > 500) {
          productErrors.description =
            "Description must be less than 500 characters";
          isValid = false;
        }

        newErrors.productDetails = productErrors;
        break;

      case 1: // Categories
        const categoryErrors: { categories?: string } = {};
        if (
          !formData.categories.categories ||
          formData.categories.categories.length === 0
        ) {
          categoryErrors.categories = "Please select at least one category";
          isValid = false;
        } else if (formData.categories.categories.length > 3) {
          categoryErrors.categories = "Please select maximum 3 categories";
          isValid = false;
        }
        newErrors.categories = categoryErrors;
        break;

      case 2: // Pricing
        const pricingErrors: Partial<Record<keyof PricingData, string>> = {};

        if (
          !formData.pricing.availableForSale &&
          !formData.pricing.availableForRent
        ) {
          pricingErrors.availableForSale =
            "Please select at least one option (sale or rent)";
          isValid = false;
        }

        if (formData.pricing.availableForSale) {
          if (
            !formData.pricing.purchasePrice ||
            formData.pricing.purchasePrice.trim() === ""
          ) {
            pricingErrors.purchasePrice =
              "Purchase price is required when available for sale";
            isValid = false;
          } else {
            const price = parseFloat(formData.pricing.purchasePrice);
            if (isNaN(price) || price <= 0) {
              pricingErrors.purchasePrice = "Please enter a valid price";
              isValid = false;
            }
          }
        }

        if (formData.pricing.availableForRent) {
          if (
            !formData.pricing.rentPrice ||
            formData.pricing.rentPrice.trim() === ""
          ) {
            pricingErrors.rentPrice =
              "Rent price is required when available for rent";
            isValid = false;
          } else {
            const price = parseFloat(formData.pricing.rentPrice);
            if (isNaN(price) || price <= 0) {
              pricingErrors.rentPrice = "Please enter a valid rent price";
              isValid = false;
            }
          }
        }

        newErrors.pricing = pricingErrors;
        break;

      case 3: // Images (optional)
        break;

      case 4: // Review
        if (mode === "create" && !formData.acceptTerms) {
          newErrors.acceptTerms =
            "Please accept the terms and conditions to continue";
          isValid = false;
        }
        break;
    }

    setErrors(newErrors);

    if (isValid) {
      setCompletedSteps((prev) => new Set([...prev, stepIndex]));
    }

    return isValid;
  };

  const handleStepChange = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < FORM_STEPS.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    try {
      // In edit mode, preserve existing images if no new images are uploaded
      let imagesToSubmit = formData.images.images;
      if (mode === "edit" && product && imagesToSubmit.length === 0) {
        // Keep the original images if no new ones were uploaded - But not supported
        imagesToSubmit =
          product.images?.map((img) =>
            typeof img === "string" ? img : img.url
          ) || [];
      }

      const productData = {
        title: formData.productDetails.title.trim(),
        description: formData.productDetails.description.trim(),
        condition: "GOOD" as const,
        categoryIds: formData.categories.categories,
        images: imagesToSubmit,
        availableForSale: formData.pricing.availableForSale,
        availableForRent: formData.pricing.availableForRent,
        ...(formData.pricing.availableForSale && {
          purchasePrice: parseFloat(formData.pricing.purchasePrice),
        }),
        ...(formData.pricing.availableForRent && {
          rentPrice: parseFloat(formData.pricing.rentPrice),
          rentType:
            (formData.pricing.rentOption?.toUpperCase() as
              | "HOURLY"
              | "DAILY"
              | "WEEKLY"
              | "MONTHLY") || undefined,
        }),
      };

      if (mode === "create") {
        await createProduct.mutateAsync({
          data: productData as any,
          seller: user?.id?.toString(),
        });
        Alert.alert("Success!", "Your product has been created successfully.", [
          {
            text: "OK",
            onPress: () => {
              setTimeout(() => router.back(), 100);
            },
          },
        ]);
      } else {
        await updateProduct.mutateAsync({ id: productId!, data: productData });
        Alert.alert("Success", "Product updated successfully!", [
          {
            text: "OK",
            onPress: () => {
              setTimeout(() => router.back(), 100);
            },
          },
        ]);
      }
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : `Failed to ${mode} product`
      );
    }
  };

  const updateFormData = (step: keyof FormData, data: any) => {
    setFormData((prev) => {
      const next: FormData = { ...prev };
      (next as any)[step] = { ...(prev as any)[step], ...(data as any) };
      return next;
    });
  };

  const canGoNext = () => {
    return true; // We'll validate on next press
  };

  const canGoPrevious = () => {
    return currentStep > 0;
  };

  const renderCurrentStep = () => {
    const reviewData: ReviewData = {
      productDetails: formData.productDetails,
      categories: formData.categories,
      pricing: formData.pricing,
      images: formData.images,
      acceptTerms: formData.acceptTerms,
    };

    switch (currentStep) {
      case 0:
        return (
          <ProductDetailsStep
            data={formData.productDetails}
            onChange={(data) => updateFormData("productDetails", data)}
            errors={errors.productDetails}
            testID="product-details-step"
          />
        );
      case 1:
        return (
          <CategoriesStep
            data={formData.categories}
            onChange={(data) => updateFormData("categories", data)}
            errors={errors.categories}
            testID="categories-step"
          />
        );
      case 2:
        return (
          <PricingStep
            data={formData.pricing}
            onChange={(data) => updateFormData("pricing", data)}
            errors={errors.pricing}
            testID="pricing-step"
          />
        );
      case 3:
        return (
          <ImagesStep
            data={formData.images}
            onChange={(data) => updateFormData("images", data)}
            errors={errors.images}
            testID="images-step"
          />
        );
      case 4:
        return (
          <ReviewStep
            data={reviewData}
            onChange={(data) => {
              if ("acceptTerms" in data) {
                setFormData((prev) => ({
                  ...prev,
                  acceptTerms: data.acceptTerms!,
                }));
              }
            }}
            onEditStep={handleStepChange}
            errors={{ acceptTerms: errors.acceptTerms }}
            testID="review-step"
          />
        );
      default:
        return null;
    }
  };

  const formSteps = FORM_STEPS.map((step, index) => ({
    ...step,
    isCompleted: completedSteps.has(index),
    isValid: !Object.keys(errors).some((key) => {
      if (index === 0 && key === "productDetails")
        return Object.keys(errors.productDetails || {}).length > 0;
      if (index === 1 && key === "categories")
        return !!errors.categories?.categories;
      if (index === 2 && key === "pricing")
        return Object.keys(errors.pricing || {}).length > 0;
      if (index === 3 && key === "images") return !!errors.images?.images;
      if (index === 4 && key === "acceptTerms") return !!errors.acceptTerms;
      return false;
    }),
  }));

  const isLoading =
    mode === "edit" ? productLoading || categoriesLoading : categoriesLoading;
  const isSubmitting =
    mode === "create" ? createProduct.isPending : updateProduct.isPending;
  const submitButtonText =
    mode === "create" ? "Create Product" : "Update Product";
  const headerTitle = mode === "create" ? "Create Product" : "Edit Product";

  if (isLoading) {
    return (
      <>
        <StatusBar
          barStyle={theme === "dark" ? "light-content" : "dark-content"}
          backgroundColor={Colors[theme].background}
        />
        <SafeAreaView
          style={[
            styles.container,
            { backgroundColor: Colors[theme].background },
          ]}
        >
          <View style={styles.loadingContainer}>
            <IconSymbol name="spinner" size={32} color={Colors[theme].tint} />
          </View>
        </SafeAreaView>
      </>
    );
  }

  if (mode === "edit" && (productError || !product)) {
    return (
      <>
        <StatusBar
          barStyle={theme === "dark" ? "light-content" : "dark-content"}
          backgroundColor={Colors[theme].background}
        />
        <SafeAreaView
          style={[
            styles.container,
            { backgroundColor: Colors[theme].background },
          ]}
        >
          <View style={styles.errorContainer}>
            <IconSymbol
              name="chevron.left"
              size={24}
              color={Colors[theme].text}
            />
            <Text style={[styles.errorText, { color: Colors[theme].text }]}>
              Failed to load product
            </Text>
            <Button
              title="Go Back"
              onPress={() => router.back()}
              variant="secondary"
              style={styles.errorButton}
            />
          </View>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={Colors[theme].background}
      />
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: Colors[theme].background },
        ]}
      >
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          {/* Fixed Header */}
          <View
            style={[
              styles.fixedHeader,
              {
                backgroundColor: Colors[theme].background,
                borderBottomColor: Colors[theme].border,
              },
            ]}
          >
            <Pressable
              onPress={() => {
                Alert.alert(
                  `Cancel ${headerTitle}`,
                  `Are you sure you want to cancel? All ${
                    mode === "create"
                      ? "progress will be lost"
                      : "changes will be lost"
                  }.`,
                  [
                    { text: "Continue Editing", style: "cancel" },
                    {
                      text: "Cancel",
                      style: "destructive",
                      onPress: () => router.back(),
                    },
                  ]
                );
              }}
              style={styles.backButton}
            >
              <IconSymbol name="xmark" size={24} color={Colors[theme].text} />
            </Pressable>

            <Text
              style={[styles.headerTitle, { color: Colors[theme].text }]}
              numberOfLines={1}
            >
              {headerTitle}
            </Text>

            <View style={styles.backButton} />
          </View>

          {/* Multi-Step Form */}
          <MultiStepForm
            steps={formSteps}
            currentStep={currentStep}
            onStepChange={handleStepChange}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onSubmit={handleSubmit}
            canGoNext={canGoNext()}
            canGoPrevious={canGoPrevious()}
            isSubmitting={isSubmitting}
            submitButtonText={submitButtonText}
            showStepIndicator={true}
            showStepLabels={true}
            testID="multi-step-form"
          >
            {renderCurrentStep()}
          </MultiStepForm>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fixedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 1000,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    flex: 1,
    textAlign: "center",
    marginHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 24,
    textAlign: "center",
  },
  errorButton: {
    minWidth: 120,
  },
});

export default ProductForm;
