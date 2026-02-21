import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, FontSize, Spacing, BorderRadius, getLevelTitle } from "../../constants/theme";
import { XPBar } from "../../components/XPBar";
import { StatCard } from "../../components/StatCard";
import { useAuth } from "../../hooks/useStore";
import * as api from "../../services/api";
import type { User } from "../../types";

export default function HomeScreen() {
  const router = useRouter();
  const { userId } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadUser = useCallback(async () => {
    if (!userId) return;
    try {
      const data = await api.getUser(userId);
      setUser(data);
    } catch (error) {
      console.error("Failed to load user:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, [loadUser])
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  if (!user) return null;

  const accuracy =
    user.total_questions_answered > 0
      ? Math.round((user.total_correct / user.total_questions_answered) * 100)
      : 0;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadUser(); }} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hey, {user.display_name}!</Text>
            <Text style={styles.levelTitle}>{getLevelTitle(user.level)}</Text>
          </View>
          <View style={styles.streakBadge}>
            <Ionicons name="flame" size={20} color={Colors.warning} />
            <Text style={styles.streakText}>{user.streak_days}</Text>
          </View>
        </View>

        {/* Level Progress */}
        <View style={styles.card}>
          <XPBar
            current={user.levelProgress?.current || 0}
            needed={user.levelProgress?.needed || 100}
            level={user.level}
          />
          <Text style={styles.totalXp}>{user.xp.toLocaleString()} total XP</Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <StatCard
            icon="checkmark-circle"
            label="Accuracy"
            value={`${accuracy}%`}
            color={Colors.success}
          />
          <StatCard
            icon="help-circle"
            label="Questions"
            value={user.total_questions_answered}
            color={Colors.primary}
          />
          <StatCard
            icon="flame"
            label="Streak"
            value={`${user.streak_days}d`}
            color={Colors.warning}
          />
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: Colors.primary }]}
            onPress={() => router.push("/(tabs)/practice")}
          >
            <Ionicons name="play-circle" size={36} color="#FFF" />
            <Text style={styles.actionTitle}>Practice Now</Text>
            <Text style={styles.actionSubtitle}>Start a quiz session</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: Colors.secondary }]}
            onPress={() => router.push("/upload-psat")}
          >
            <Ionicons name="document-text" size={36} color="#FFF" />
            <Text style={styles.actionTitle}>Upload PSAT</Text>
            <Text style={styles.actionSubtitle}>Get personalized prep</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: Colors.accent }]}
            onPress={() => router.push("/(tabs)/leaderboard")}
          >
            <Ionicons name="trophy" size={36} color="#FFF" />
            <Text style={styles.actionTitle}>Leaderboard</Text>
            <Text style={styles.actionSubtitle}>See school rankings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: Colors.warningDark }]}
            onPress={() => router.push("/(tabs)/profile")}
          >
            <Ionicons name="stats-chart" size={36} color="#FFF" />
            <Text style={styles.actionTitle}>My Stats</Text>
            <Text style={styles.actionSubtitle}>Track your progress</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Achievements */}
        {user.achievements && user.achievements.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Recent Achievements</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {user.achievements.slice(0, 5).map((achievement) => (
                <View key={achievement.key} style={styles.achievementCard}>
                  <Ionicons
                    name={(achievement.icon as any) || "star"}
                    size={28}
                    color={Colors.warning}
                  />
                  <Text style={styles.achievementName}>{achievement.name}</Text>
                </View>
              ))}
            </ScrollView>
          </>
        )}

        {/* PSAT Analysis Summary */}
        {!user.recentSessions?.length && (
          <View style={styles.tipCard}>
            <Ionicons name="bulb" size={24} color={Colors.warning} />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Pro Tip</Text>
              <Text style={styles.tipText}>
                Upload your PSAT score report to get questions tailored to your weak areas!
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  greeting: {
    fontSize: FontSize.xxl,
    fontWeight: "800",
    color: Colors.text,
  },
  levelTitle: {
    fontSize: FontSize.md,
    color: Colors.primary,
    fontWeight: "600",
    marginTop: 2,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.warning + "15",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  streakText: {
    fontSize: FontSize.lg,
    fontWeight: "800",
    color: Colors.warningDark,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  totalXp: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: Spacing.sm,
  },
  statsRow: {
    flexDirection: "row",
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.xl,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  actionCard: {
    width: "48%",
    flexGrow: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    minHeight: 120,
    justifyContent: "flex-end",
  },
  actionTitle: {
    color: "#FFF",
    fontSize: FontSize.lg,
    fontWeight: "700",
    marginTop: Spacing.sm,
  },
  actionSubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  achievementCard: {
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginRight: Spacing.md,
    width: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  achievementName: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Colors.text,
    textAlign: "center",
    marginTop: Spacing.sm,
  },
  tipCard: {
    flexDirection: "row",
    backgroundColor: Colors.warning + "12",
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.md,
    gap: Spacing.md,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: FontSize.md,
    fontWeight: "700",
    color: Colors.warningDark,
  },
  tipText: {
    fontSize: FontSize.sm,
    color: Colors.text,
    marginTop: 4,
    lineHeight: 20,
  },
});
