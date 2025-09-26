import { Tabs } from "expo-router";
import React from "react";

import { AuthGuard } from "@/src/components/auth/AuthGuard";
import { HapticTab } from "@/src/components/haptic-tab";
import { IconSymbol } from "@/src/components/ui/icon-symbol";
import { Colors } from "@/src/constants/theme";
import { useColorScheme } from "react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "dark";

  return (
    <AuthGuard>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[theme].tint,
          tabBarInactiveTintColor: Colors[theme].tabIconDefault,
          tabBarStyle: {
            backgroundColor: Colors[theme].background,
            borderTopColor: Colors[theme].border,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "500",
          },
          backgroundColor: Colors[theme].background,
          headerShown: false,
          tabBarButton: HapticTab,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="house.fill" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: "Transactions",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="list.bullet" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="person.crop.circle" color={color} />
            ),
          }}
        />
      </Tabs>
    </AuthGuard>
  );
}
