import { ProductForm } from "@/src/components/forms/ProductForm";
import { useLocalSearchParams } from "expo-router";
import React from "react";

export default function EditProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ProductForm mode="edit" productId={id} />;
}
