import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, FontSize, Spacing, BorderRadius } from "../constants/theme";
import type { Achievement } from "../types";

interface AchievementBadgeProps {
  achievement: Achievement;
  unlocked: boolean;
  compact?: boolean;
}

export function AchievementBadge({ achievement, unlocked, compact }: AchievementBadgeProps) {
  if (compact) {
    return (
      <View style={[styles.compactBadge, !unlocked && styles.locked]}>
        <Ionicons
          name={(achievement.icon as any) || "star"}
          size={20}
          color={unlocked ? Colors.warning : Colors.textLight}
        />
      </View>
    );
  }

  return (
    <View style={[styles.badge, !unlocked && styles.locked]}>
      <View style={[styles.iconCircle, unlocked && styles.iconCircleUnlocked]}>
        <Ionicons
          name={(achievement.icon as any) || "star"}
          size={28}
          color={unlocked ? Colors.warning : Colors.textLight}
        />
      </View>
      <Text style={[styles.name, !unlocked && styles.lockedText]} numberOfLines={1}>
        {achievement.name}
      </Text>
      <Text style={[styles.description, !unlocked && styles.lockedText]} numberOfLines={2}>
        {achievement.description}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: "center",
    padding: Spacing.md,
    width: 100,
  },
  locked: {
    opacity: 0.4,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  iconCircleUnlocked: {
    backgroundColor: Colors.warning + "20",
    borderColor: Colors.warning,
  },
  name: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.text,
    textAlign: "center",
  },
  description: {
    fontSize: 9,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 2,
  },
  lockedText: {
    color: Colors.textLight,
  },
  compactBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 3,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
});
