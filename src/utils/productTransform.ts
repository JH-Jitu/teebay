import type { Product } from "@/src/types";

// Transform backend API response to frontend Product interface
export const transformBackendProduct = (backendProduct: any): Product => {
  return {
    // Backend fields as-is
    id: backendProduct.id?.toString() || "",
    seller: backendProduct.seller,
    title: backendProduct.title || "",
    description: backendProduct.description || "",
    categories: backendProduct.categories || [],
    product_image: backendProduct.product_image,
    purchase_price: backendProduct.purchase_price,
    rent_price: backendProduct.rent_price,
    rent_option: backendProduct.rent_option,
    date_posted: backendProduct.date_posted,

    // Frontend computed fields for compatibility
    images: backendProduct.product_image
      ? [
          {
            id: "1",
            url: backendProduct.product_image,
            thumbnailUrl: backendProduct.product_image,
            alt: backendProduct.title,
            order: 0,
          },
        ]
      : [],

    purchasePrice: backendProduct.purchase_price
      ? parseFloat(backendProduct.purchase_price)
      : undefined,
    rentPrice: backendProduct.rent_price
      ? parseFloat(backendProduct.rent_price)
      : undefined,

    rentType: backendProduct.rent_option
      ? mapRentOptionToType(backendProduct.rent_option)
      : undefined,

    availableForSale: !!backendProduct.purchase_price,
    availableForRent: !!backendProduct.rent_price,

    isActive: true, // Assume active if returned by API
    condition: "GOOD", // Default condition

    // Create mock owner from seller ID for now
    owner: {
      id: backendProduct.seller?.toString() || "",
      email: "",
      first_name: "User",
      last_name: backendProduct.seller?.toString() || "",
    },
    ownerId: backendProduct.seller?.toString() || "",

    viewCount: 0,
    favoriteCount: 0,
    createdAt: backendProduct.date_posted,
    updatedAt: backendProduct.date_posted,
  };
};

// Map backend rent_option to frontend rentType
const mapRentOptionToType = (
  rentOption: string
): "HOURLY" | "DAILY" | "WEEKLY" | "MONTHLY" => {
  switch (rentOption.toLowerCase()) {
    case "hour":
      return "HOURLY";
    case "day":
      return "DAILY";
    case "week":
      return "WEEKLY";
    case "month":
      return "MONTHLY";
    default:
      return "DAILY";
  }
};

// Transform frontend Product to backend format for create/update
export const transformToBackendProduct = (
  frontendProduct: any,
  seller?: string
) => {
  return {
    title: frontendProduct.title,
    description: frontendProduct.description,
    categories: frontendProduct.categories || frontendProduct.categoryIds,
    product_image: frontendProduct.images?.[0] || frontendProduct.product_image,
    purchase_price:
      frontendProduct.purchasePrice?.toString() ||
      frontendProduct.purchase_price,
    // Backend requires rent_price and rent_option even when not renting
    rent_price:
      frontendProduct.rentPrice?.toString() ||
      frontendProduct.rent_price ||
      "0.00",
    rent_option: frontendProduct.rentType
      ? mapTypeToRentOption(frontendProduct.rentType)
      : frontendProduct.rent_option || "day",
    // Add seller ID if provided
    ...(seller && { seller: seller }),
  };
};

// Map frontend rentType to backend rent_option
const mapTypeToRentOption = (rentType: string): string => {
  switch (rentType) {
    case "HOURLY":
      return "hour";
    case "DAILY":
      return "day";
    case "WEEKLY":
      return "week";
    case "MONTHLY":
      return "month";
    default:
      return "day";
  }
};
