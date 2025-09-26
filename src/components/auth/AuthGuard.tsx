import { useAuthStore } from "@/src/store/auth";
import { Redirect } from "expo-router";
import React from "react";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: string;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  fallback = "/auth/welcome",
}) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  // Show nothing while loading (let parent handle loading state)
  if (isLoading) {
    return null;
  }

  // Redirect to fallback if not authenticated
  if (!isAuthenticated) {
    return <Redirect href={fallback} />;
  }

  // Render children if authenticated
  return <>{children}</>;
};
