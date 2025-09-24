import { Stack } from "expo-router";
import React from "react";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: "modal",
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="welcome"
        options={{
          title: "Welcome",
        }}
      />
      <Stack.Screen
        name="login"
        options={{
          title: "Sign In",
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          title: "Create Account",
        }}
      />
    </Stack>
  );
}
