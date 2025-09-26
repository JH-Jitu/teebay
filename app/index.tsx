import { useAuthStore } from "@/src/store/auth";
import { Redirect } from "expo-router";

export default function IndexPage() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/auth/welcome" />;
}
