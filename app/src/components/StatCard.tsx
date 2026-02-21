import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, FontSize, Spacing, BorderRadius } from "../constants/theme";

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
  color?: string;
  subtitle?: string;
}

export function StatCard({ icon, label, value, color = Colors.primary, subtitle }: StatCardProps) {
  return (
    <View style={styles.card}>
      <View style={[styles.iconContainer, { backgroundColor: color + "15" }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: "center",
    flex: 1,
    marginHorizontal: Spacing.xs,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  value: {
    fontSize: FontSize.xxl,
    fontWeight: "800",
    color: Colors.text,
  },
  label: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
    marginTop: 2,
  },
});
