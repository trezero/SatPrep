import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, FontSize, Spacing, BorderRadius, getLevelColor, getLevelTitle } from "../../constants/theme";
import { XPBar } from "../../components/XPBar";
import { AchievementBadge } from "../../components/AchievementBadge";
import { useAuth } from "../../hooks/useStore";
import * as api from "../../services/api";
import type { User } from "../../types";

const ALL_ACHIEVEMENTS = [
  { key: "first_question", name: "First Step", description: "Answer your first question", icon: "star-outline" },
  { key: "ten_streak", name: "On Fire", description: "10-day practice streak", icon: "flame" },
  { key: "thirty_streak", name: "Unstoppable", description: "30-day practice streak", icon: "rocket" },
  { key: "hundred_correct", name: "Century Club", description: "100 correct answers", icon: "trophy" },
  { key: "five_hundred_correct", name: "Knowledge Master", description: "500 correct answers", icon: "medal" },
  { key: "perfect_round", name: "Flawless", description: "Perfect round", icon: "diamond" },
  { key: "math_master", name: "Math Whiz", description: "50 math correct", icon: "calculator" },
  { key: "reading_master", name: "Bookworm", description: "50 reading correct", icon: "book" },
  { key: "level_5", name: "Rising Star", description: "Reach level 5", icon: "trending-up" },
  { key: "level_10", name: "Dedicated", description: "Reach level 10", icon: "school" },
  { key: "level_20", name: "SAT Scholar", description: "Reach level 20", icon: "school" },
  { key: "speed_demon", name: "Speed Demon", description: "Finish in under 2 min", icon: "flash" },
  { key: "upload_psat", name: "Know Thyself", description: "Upload PSAT scores", icon: "document-text" },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { userId, logout } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    if (!userId) return;
    try {
      const data = await api.getUser(userId);
      setUser(data);
    } catch (error) {
      console.error("Failed to load user:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, [loadUser])
  );

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/onboarding");
        },
      },
    ]);
  };

  if (loading || !user) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  const accuracy =
    user.total_questions_answered > 0
      ? Math.round((user.total_correct / user.total_questions_answered) * 100)
      : 0;

  const unlockedKeys = new Set(user.achievements?.map((a) => a.key) || []);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={[styles.avatar, { backgroundColor: getLevelColor(user.level) + "30" }]}>
            <Text style={[styles.avatarText, { color: getLevelColor(user.level) }]}>
              {user.display_name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.displayName}>{user.display_name}</Text>
          <Text style={styles.levelTitle}>{getLevelTitle(user.level)}</Text>
          {user.school_name && (
            <View style={styles.schoolBadge}>
              <Ionicons name="school" size={14} color={Colors.primary} />
              <Text style={styles.schoolText}>{user.school_name}</Text>
            </View>
          )}
        </View>

        {/* XP Progress */}
        <View style={styles.card}>
          <XPBar
            current={user.levelProgress?.current || 0}
            needed={user.levelProgress?.needed || 100}
            level={user.level}
          />
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Ionicons name="star" size={22} color={Colors.primary} />
            <Text style={styles.statValue}>{user.xp.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="checkmark-done" size={22} color={Colors.success} />
            <Text style={styles.statValue}>{accuracy}%</Text>
            <Text style={styles.statLabel}>Accuracy</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="flame" size={22} color={Colors.warning} />
            <Text style={styles.statValue}>{user.streak_days}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="help-circle" size={22} color={Colors.accent} />
            <Text style={styles.statValue}>{user.total_questions_answered}</Text>
            <Text style={styles.statLabel}>Questions</Text>
          </View>
        </View>

        {/* Category Breakdown */}
        {user.categoryStats && user.categoryStats.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Category Breakdown</Text>
            {user.categoryStats.map((stat) => {
              const catAccuracy = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
              const isMath = stat.category === "Math";
              return (
                <View key={stat.category} style={styles.categoryRow}>
                  <View style={styles.categoryInfo}>
                    <View
                      style={[
                        styles.categoryDot,
                        { backgroundColor: isMath ? Colors.math : Colors.reading },
                      ]}
                    />
                    <Text style={styles.categoryName}>{stat.category}</Text>
                  </View>
                  <View style={styles.categoryStats}>
                    <Text style={styles.categoryAccuracy}>{catAccuracy}%</Text>
                    <Text style={styles.categoryCount}>
                      {stat.correct}/{stat.total}
                    </Text>
                  </View>
                  <View style={styles.categoryBar}>
                    <View
                      style={[
                        styles.categoryFill,
                        {
                          width: `${catAccuracy}%`,
                          backgroundColor: isMath ? Colors.math : Colors.reading,
                        },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Achievements */}
        <Text style={styles.sectionTitle}>
          Achievements ({unlockedKeys.size}/{ALL_ACHIEVEMENTS.length})
        </Text>
        <View style={styles.achievementsGrid}>
          {ALL_ACHIEVEMENTS.map((achievement) => (
            <AchievementBadge
              key={achievement.key}
              achievement={achievement}
              unlocked={unlockedKeys.has(achievement.key)}
            />
          ))}
        </View>

        {/* Recent Sessions */}
        {user.recentSessions && user.recentSessions.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Recent Sessions</Text>
            {user.recentSessions.slice(0, 5).map((session) => (
              <View key={session.id} style={styles.sessionRow}>
                <View style={styles.sessionInfo}>
                  <Text style={styles.sessionCategory}>{session.category}</Text>
                  <Text style={styles.sessionDate}>
                    {new Date(session.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.sessionResults}>
                  <Text style={styles.sessionScore}>
                    {session.correct_answers}/{session.total_questions}
                  </Text>
                  <Text style={styles.sessionXp}>+{session.xp_earned} XP</Text>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push("/upload-psat")}>
            <Ionicons name="document-text" size={20} color={Colors.primary} />
            <Text style={styles.actionButtonText}>Upload PSAT Scores</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out" size={20} color={Colors.error} />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.background },
  scrollContent: { padding: Spacing.lg, paddingBottom: 100 },
  profileHeader: { alignItems: "center", marginBottom: Spacing.xl },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: "center", justifyContent: "center", marginBottom: Spacing.md,
  },
  avatarText: { fontSize: FontSize.xxxl, fontWeight: "900" },
  displayName: { fontSize: FontSize.xxl, fontWeight: "800", color: Colors.text },
  levelTitle: { fontSize: FontSize.md, color: Colors.primary, fontWeight: "600", marginTop: 4 },
  schoolBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: Colors.primary + "10", borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, marginTop: Spacing.sm,
  },
  schoolText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: "600" },
  card: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    padding: Spacing.xl, marginBottom: Spacing.lg,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  statsGrid: {
    flexDirection: "row", backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.xl,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  statItem: { flex: 1, alignItems: "center" },
  statValue: { fontSize: FontSize.xl, fontWeight: "800", color: Colors.text, marginTop: 4 },
  statLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: Colors.borderLight, marginVertical: 4 },
  sectionTitle: {
    fontSize: FontSize.xl, fontWeight: "700", color: Colors.text,
    marginBottom: Spacing.md, marginTop: Spacing.sm,
  },
  categoryRow: { marginBottom: Spacing.lg },
  categoryInfo: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  categoryDot: { width: 10, height: 10, borderRadius: 5, marginRight: Spacing.sm },
  categoryName: { fontSize: FontSize.md, fontWeight: "600", color: Colors.text },
  categoryStats: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  categoryAccuracy: { fontSize: FontSize.sm, fontWeight: "700", color: Colors.text },
  categoryCount: { fontSize: FontSize.sm, color: Colors.textSecondary },
  categoryBar: {
    height: 6, backgroundColor: Colors.borderLight,
    borderRadius: BorderRadius.full, overflow: "hidden",
  },
  categoryFill: { height: "100%", borderRadius: BorderRadius.full },
  achievementsGrid: {
    flexDirection: "row", flexWrap: "wrap",
    justifyContent: "center", marginBottom: Spacing.xl,
  },
  sessionRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: Colors.surface, borderRadius: BorderRadius.md,
    padding: Spacing.md, marginBottom: Spacing.sm,
  },
  sessionInfo: {},
  sessionCategory: { fontSize: FontSize.md, fontWeight: "600", color: Colors.text },
  sessionDate: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  sessionResults: { alignItems: "flex-end" },
  sessionScore: { fontSize: FontSize.md, fontWeight: "700", color: Colors.text },
  sessionXp: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: "600" },
  actions: { marginTop: Spacing.xl, gap: Spacing.md },
  actionButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.sm,
    backgroundColor: Colors.surface, borderRadius: BorderRadius.md,
    padding: Spacing.lg, borderWidth: 1.5, borderColor: Colors.primary + "30",
  },
  actionButtonText: { fontSize: FontSize.md, fontWeight: "600", color: Colors.primary },
  logoutButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.sm,
    padding: Spacing.lg,
  },
  logoutText: { fontSize: FontSize.md, color: Colors.error },
});
