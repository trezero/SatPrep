import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, FontSize, Spacing, BorderRadius } from "../../constants/theme";
import { LeaderboardRow } from "../../components/LeaderboardRow";
import { useAuth } from "../../hooks/useStore";
import * as api from "../../services/api";
import type { User, School, LeaderboardEntry } from "../../types";

type Tab = "school" | "global";

export default function LeaderboardScreen() {
  const { userId } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("school");
  const [user, setUser] = useState<User | null>(null);
  const [school, setSchool] = useState<School | null>(null);
  const [schoolLeaderboard, setSchoolLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!userId) return;
    try {
      const userData = await api.getUser(userId);
      setUser(userData);

      // Load school leaderboard if user has a school
      if (userData.school_id) {
        const schoolData = await api.getSchoolLeaderboard(userData.school_id);
        setSchool(schoolData.school as School);
        setSchoolLeaderboard(schoolData.leaderboard);
      }

      // Load global leaderboard
      const globalData = await api.getGlobalLeaderboard();
      setGlobalLeaderboard(globalData.leaderboard);
    } catch (error) {
      console.error("Failed to load leaderboard:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  const currentLeaderboard = activeTab === "school" ? schoolLeaderboard : globalLeaderboard;
  const userRank = currentLeaderboard.findIndex((e) => e.id === userId) + 1;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Leaderboard</Text>
        {school && activeTab === "school" && (
          <Text style={styles.schoolName}>{school.name}</Text>
        )}
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "school" && styles.tabActive]}
          onPress={() => setActiveTab("school")}
        >
          <Ionicons
            name="school"
            size={18}
            color={activeTab === "school" ? Colors.primary : Colors.textSecondary}
          />
          <Text style={[styles.tabText, activeTab === "school" && styles.tabTextActive]}>
            My School
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "global" && styles.tabActive]}
          onPress={() => setActiveTab("global")}
        >
          <Ionicons
            name="globe"
            size={18}
            color={activeTab === "global" ? Colors.primary : Colors.textSecondary}
          />
          <Text style={[styles.tabText, activeTab === "global" && styles.tabTextActive]}>
            Global
          </Text>
        </TouchableOpacity>
      </View>

      {/* User's Rank Banner */}
      {userRank > 0 && (
        <View style={styles.rankBanner}>
          <Text style={styles.rankBannerText}>Your Rank</Text>
          <View style={styles.rankBadge}>
            <Text style={styles.rankNumber}>#{userRank}</Text>
          </View>
        </View>
      )}

      {/* Leaderboard List */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />
        }
      >
        {activeTab === "school" && !user?.school_id ? (
          <View style={styles.emptyState}>
            <Ionicons name="school-outline" size={64} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>No School Selected</Text>
            <Text style={styles.emptyText}>
              Choose your school in your profile to see the school leaderboard
            </Text>
          </View>
        ) : currentLeaderboard.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="trophy-outline" size={64} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>No entries yet</Text>
            <Text style={styles.emptyText}>
              Be the first to practice and claim the top spot!
            </Text>
          </View>
        ) : (
          currentLeaderboard.map((entry, index) => (
            <LeaderboardRow
              key={entry.id}
              entry={entry}
              rank={index + 1}
              isCurrentUser={entry.id === userId}
            />
          ))
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
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: "900",
    color: Colors.text,
  },
  schoolName: {
    fontSize: FontSize.md,
    color: Colors.primary,
    fontWeight: "600",
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: BorderRadius.md,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  tabActive: {
    backgroundColor: Colors.surface,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: FontSize.md,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.primary,
  },
  rankBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    backgroundColor: Colors.primary + "10",
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
  },
  rankBannerText: {
    fontSize: FontSize.md,
    fontWeight: "600",
    color: Colors.primary,
  },
  rankBadge: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  rankNumber: {
    color: "#FFF",
    fontSize: FontSize.lg,
    fontWeight: "800",
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: FontSize.xl,
    fontWeight: "700",
    color: Colors.text,
    marginTop: Spacing.lg,
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: Spacing.sm,
    lineHeight: 22,
    paddingHorizontal: Spacing.xxl,
  },
});
