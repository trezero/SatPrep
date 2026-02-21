import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Colors } from "../constants/theme";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="quiz"
          options={{
            animation: "slide_from_bottom",
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="results"
          options={{ animation: "slide_from_bottom" }}
        />
        <Stack.Screen
          name="upload-psat"
          options={{ animation: "slide_from_right" }}
        />
      </Stack>
    </>
  );
}
