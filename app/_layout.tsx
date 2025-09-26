import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { queryClient } from "@/src/config/query";
import { Colors } from "@/src/constants/theme";
import { useNotifications } from "@/src/hooks/useNotifications";
import { useAuthStore } from "@/src/store/auth";
import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ActivityIndicator, useColorScheme, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "dark";
  const { isLoading } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useNotifications();

  useEffect(() => {
    const init = async () => {
      await useAuthStore.getState().initializeAuth();
      setIsInitialized(true);
    };
    init();
  }, []);

  if (!isInitialized || isLoading) {
    return (
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <SafeAreaView
            style={{
              flex: 1,
              backgroundColor: Colors[theme].background,
            }}
            edges={["top", "bottom"]}
          >
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: Colors[theme].background,
              }}
            >
              <ActivityIndicator size="large" color={Colors[theme].tint} />
            </View>
            <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
            <Toast />
          </SafeAreaView>
        </QueryClientProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <SafeAreaView
          style={{
            flex: 1,
            backgroundColor: Colors[theme].background,
          }}
          edges={["bottom"]}
        >
          <Stack
            screenOptions={{
              headerStyle: {
                backgroundColor: Colors[theme].background,
              },
              headerTintColor: Colors[theme].text,
              headerTitleStyle: {
                color: Colors[theme].text,
              },
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="auth" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="profile/edit"
              options={{
                headerShown: false,
                presentation: "modal",
              }}
            />
            <Stack.Screen
              name="profile/security"
              options={{
                headerShown: false,
                presentation: "modal",
              }}
            />
            <Stack.Screen
              name="products/[id]"
              options={{
                headerShown: false,
                presentation: "modal",
              }}
            />
            <Stack.Screen
              name="products/edit/[id]"
              options={{
                headerShown: false,
                presentation: "modal",
              }}
            />
            <Stack.Screen
              name="products/create-multistep"
              options={{
                headerShown: false,
                presentation: "modal",
              }}
            />
            <Stack.Screen
              name="transactions/[id]"
              options={{
                headerShown: false,
                presentation: "modal",
              }}
            />
          </Stack>
          <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
          <Toast />
        </SafeAreaView>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
