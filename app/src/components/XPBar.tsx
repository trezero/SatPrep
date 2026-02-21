import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors, FontSize, Spacing, BorderRadius } from "../constants/theme";

interface XPBarProps {
  current: number;
  needed: number;
  level: number;
  showLabel?: boolean;
}

export function XPBar({ current, needed, level, showLabel = true }: XPBarProps) {
  const progress = Math.min(current / needed, 1);

  return (
    <View style={styles.container}>
      {showLabel && (
        <View style={styles.labelRow}>
          <Text style={styles.levelText}>Level {level}</Text>
          <Text style={styles.xpText}>
            {current} / {needed} XP
          </Text>
        </View>
      )}
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress * 100}%` }]} />
        <View style={[styles.shimmer, { width: `${progress * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%" },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.xs,
  },
  levelText: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.primary,
  },
  xpText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  track: {
    height: 10,
    backgroundColor: Colors.borderLight,
    borderRadius: BorderRadius.full,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
  },
  shimmer: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: BorderRadius.full,
  },
});
