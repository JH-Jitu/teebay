import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { queryClient } from "@/src/config/query";
import { useAuthStore } from "@/src/store/auth";
import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const initializeAuth = useAuthStore((s) => s.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <SafeAreaView
          style={{
            flex: 1,
            backgroundColor: colorScheme === "dark" ? "#0F172A" : "#FFFFFF",
          }}
          edges={["top", "bottom"]}
        >
          <Stack
            screenOptions={{
              headerStyle: {
                backgroundColor: colorScheme === "dark" ? "#1E293B" : "#FFFFFF",
              },
              headerTintColor: colorScheme === "dark" ? "#F8FAFC" : "#11181C",
            }}
          >
            <Stack.Screen name="auth" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="modal"
              options={{ presentation: "modal", title: "Modal" }}
            />
          </Stack>
          <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
          <Toast />
        </SafeAreaView>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
