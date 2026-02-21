import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, FontSize, Spacing, BorderRadius, getLevelColor } from "../constants/theme";
import type { LeaderboardEntry } from "../types";

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  rank: number;
  isCurrentUser?: boolean;
}

export function LeaderboardRow({ entry, rank, isCurrentUser }: LeaderboardRowProps) {
  const getRankDisplay = () => {
    if (rank === 1) return { icon: "trophy" as const, color: Colors.gold };
    if (rank === 2) return { icon: "medal" as const, color: Colors.silver };
    if (rank === 3) return { icon: "medal" as const, color: Colors.bronze };
    return null;
  };

  const medal = getRankDisplay();

  return (
    <View style={[styles.row, isCurrentUser && styles.currentUserRow]}>
      <View style={styles.rankContainer}>
        {medal ? (
          <Ionicons name={medal.icon} size={24} color={medal.color} />
        ) : (
          <Text style={styles.rankText}>{rank}</Text>
        )}
      </View>

      <View style={styles.avatarContainer}>
        <View style={[styles.avatar, { backgroundColor: getLevelColor(entry.level) + "30" }]}>
          <Text style={[styles.avatarText, { color: getLevelColor(entry.level) }]}>
            {entry.display_name.charAt(0).toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.info}>
        <Text style={[styles.name, isCurrentUser && styles.currentUserName]} numberOfLines={1}>
          {entry.display_name}
          {isCurrentUser && " (You)"}
        </Text>
        <View style={styles.statsRow}>
          <Text style={styles.statText}>Lv. {entry.level}</Text>
          <Text style={styles.statDivider}>|</Text>
          <Text style={styles.statText}>{entry.accuracy}% accuracy</Text>
          {entry.streak_days > 0 && (
            <>
              <Text style={styles.statDivider}>|</Text>
              <Ionicons name="flame" size={12} color={Colors.warning} />
              <Text style={styles.streakText}>{entry.streak_days}</Text>
            </>
          )}
        </View>
      </View>

      <View style={styles.xpContainer}>
        <Text style={styles.xpValue}>{entry.xp.toLocaleString()}</Text>
        <Text style={styles.xpLabel}>XP</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  currentUserRow: {
    backgroundColor: Colors.primary + "10",
    borderWidth: 1.5,
    borderColor: Colors.primary + "30",
  },
  rankContainer: {
    width: 36,
    alignItems: "center",
  },
  rankText: {
    fontSize: FontSize.lg,
    fontWeight: "700",
    color: Colors.textSecondary,
  },
  avatarContainer: {
    marginHorizontal: Spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: FontSize.lg,
    fontWeight: "800",
  },
  info: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  name: {
    fontSize: FontSize.md,
    fontWeight: "600",
    color: Colors.text,
  },
  currentUserName: {
    color: Colors.primary,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  statText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  statDivider: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
    marginHorizontal: 4,
  },
  streakText: {
    fontSize: FontSize.xs,
    color: Colors.warning,
    fontWeight: "600",
    marginLeft: 2,
  },
  xpContainer: {
    alignItems: "flex-end",
  },
  xpValue: {
    fontSize: FontSize.lg,
    fontWeight: "800",
    color: Colors.primary,
  },
  xpLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
});
