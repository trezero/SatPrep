import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../hooks/useStore";
import { Colors } from "../constants/theme";

export default function Index() {
  const router = useRouter();
  const { userId, isOnboarded, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!isOnboarded || !userId) {
      router.replace("/onboarding");
    } else {
      router.replace("/(tabs)");
    }
  }, [loading, userId, isOnboarded]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
});
