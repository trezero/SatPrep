import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, FontSize, Spacing, BorderRadius } from "../constants/theme";
import { useAuth } from "../hooks/useStore";
import * as api from "../services/api";
import type { AnswerResult, SessionResult } from "../types";

export default function ResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { userId } = useAuth();
  const [result, setResult] = useState<SessionResult | null>(null);
  const [loading, setLoading] = useState(true);

  const answers: AnswerResult[] = params.answers
    ? JSON.parse(params.answers as string)
    : [];
  const timeSeconds = parseInt(params.timeSeconds as string) || 0;

  useEffect(() => {
    submitResults();
  }, []);

  const submitResults = async () => {
    if (!userId || answers.length === 0) {
      setLoading(false);
      return;
    }
    try {
      const sessionResult = await api.submitSession(userId, answers, timeSeconds);
      setResult(sessionResult);
    } catch (error) {
      console.error("Failed to submit results:", error);
    } finally {
      setLoading(false);
    }
  };

  const correctCount = answers.filter((a) => a.isCorrect).length;
  const accuracy = answers.length > 0 ? Math.round((correctCount / answers.length) * 100) : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getPerformanceMessage = () => {
    if (accuracy === 100) return { text: "PERFECT!", emoji: "trophy", color: Colors.gold };
    if (accuracy >= 80) return { text: "Amazing!", emoji: "star", color: Colors.primary };
    if (accuracy >= 60) return { text: "Nice work!", emoji: "thumbs-up", color: Colors.success };
    if (accuracy >= 40) return { text: "Keep going!", emoji: "muscle", color: Colors.warning };
    return { text: "Don't give up!", emoji: "heart", color: Colors.accent };
  };

  const performance = getPerformanceMessage();

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Calculating your results...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Performance Hero */}
        <View style={styles.hero}>
          <View style={[styles.heroIcon, { backgroundColor: performance.color + "20" }]}>
            <Ionicons name={performance.emoji as any} size={60} color={performance.color} />
          </View>
          <Text style={[styles.heroTitle, { color: performance.color }]}>
            {performance.text}
          </Text>
          <Text style={styles.heroAccuracy}>{accuracy}% Accuracy</Text>
          <Text style={styles.heroScore}>
            {correctCount} of {answers.length} correct
          </Text>
        </View>

        {/* XP Breakdown */}
        {result && (
          <View style={styles.xpCard}>
            <Text style={styles.xpTitle}>XP Earned</Text>
            <View style={styles.xpRow}>
              <Text style={styles.xpLabel}>Base XP</Text>
              <Text style={styles.xpValue}>+{result.xpResult.baseXp}</Text>
            </View>
            {result.xpResult.streakBonus > 0 && (
              <View style={styles.xpRow}>
                <View style={styles.xpLabelRow}>
                  <Ionicons name="flame" size={16} color={Colors.warning} />
                  <Text style={styles.xpLabel}>Streak Bonus</Text>
                </View>
                <Text style={[styles.xpValue, { color: Colors.warning }]}>
                  +{result.xpResult.streakBonus}
                </Text>
              </View>
            )}
            {result.xpResult.perfectBonus > 0 && (
              <View style={styles.xpRow}>
                <View style={styles.xpLabelRow}>
                  <Ionicons name="diamond" size={16} color={Colors.accent} />
                  <Text style={styles.xpLabel}>Perfect Bonus</Text>
                </View>
                <Text style={[styles.xpValue, { color: Colors.accent }]}>
                  +{result.xpResult.perfectBonus}
                </Text>
              </View>
            )}
            <View style={styles.xpDivider} />
            <View style={styles.xpRow}>
              <Text style={styles.xpTotalLabel}>Total</Text>
              <Text style={styles.xpTotalValue}>+{result.xpResult.totalXp} XP</Text>
            </View>
          </View>
        )}

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Ionicons name="time" size={22} color={Colors.secondary} />
            <Text style={styles.statValue}>{formatTime(timeSeconds)}</Text>
            <Text style={styles.statLabel}>Time</Text>
          </View>
          {result && (
            <>
              <View style={styles.statBox}>
                <Ionicons name="flame" size={22} color={Colors.warning} />
                <Text style={styles.statValue}>{result.newStreak}d</Text>
                <Text style={styles.statLabel}>Streak</Text>
              </View>
              <View style={styles.statBox}>
                <Ionicons name="trending-up" size={22} color={Colors.primary} />
                <Text style={styles.statValue}>Lv.{result.newLevel}</Text>
                <Text style={styles.statLabel}>Level</Text>
              </View>
            </>
          )}
        </View>

        {/* New Achievements */}
        {result?.newAchievements && result.newAchievements.length > 0 && (
          <View style={styles.achievementsCard}>
            <Text style={styles.achievementsTitle}>New Achievements!</Text>
            {result.newAchievements.map((achievement) => (
              <View key={achievement.key} style={styles.achievementRow}>
                <Ionicons
                  name={(achievement.icon as any) || "star"}
                  size={24}
                  color={Colors.warning}
                />
                <View style={styles.achievementInfo}>
                  <Text style={styles.achievementName}>{achievement.name}</Text>
                  <Text style={styles.achievementDesc}>{achievement.description}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Question Review */}
        <Text style={styles.reviewTitle}>Question Review</Text>
        {answers.map((answer, index) => (
          <View
            key={index}
            style={[styles.reviewCard, answer.isCorrect ? styles.reviewCorrect : styles.reviewWrong]}
          >
            <View style={styles.reviewHeader}>
              <Ionicons
                name={answer.isCorrect ? "checkmark-circle" : "close-circle"}
                size={20}
                color={answer.isCorrect ? Colors.success : Colors.error}
              />
              <Text style={styles.reviewNumber}>Q{index + 1}</Text>
              <View style={styles.reviewBadges}>
                <Text style={styles.reviewCategory}>{answer.category}</Text>
                <Text style={styles.reviewDifficulty}>{answer.difficulty}</Text>
              </View>
            </View>
            <Text style={styles.reviewQuestion} numberOfLines={2}>{answer.question}</Text>
            {!answer.isCorrect && (
              <Text style={styles.reviewAnswer}>
                Your answer: {answer.userAnswer} | Correct: {answer.correctAnswer}
              </Text>
            )}
          </View>
        ))}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.replace("/(tabs)/practice")}
          >
            <Ionicons name="refresh" size={20} color="#FFF" />
            <Text style={styles.primaryButtonText}>Practice Again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.replace("/(tabs)")}
          >
            <Text style={styles.secondaryButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { fontSize: FontSize.lg, color: Colors.textSecondary, marginTop: Spacing.lg },
  scrollContent: { padding: Spacing.lg, paddingBottom: 100 },
  hero: { alignItems: "center", marginBottom: Spacing.xxl },
  heroIcon: {
    width: 120, height: 120, borderRadius: 60,
    alignItems: "center", justifyContent: "center", marginBottom: Spacing.lg,
  },
  heroTitle: { fontSize: FontSize.xxxl, fontWeight: "900" },
  heroAccuracy: { fontSize: FontSize.xxl, fontWeight: "700", color: Colors.text, marginTop: Spacing.sm },
  heroScore: { fontSize: FontSize.lg, color: Colors.textSecondary, marginTop: 4 },
  xpCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    padding: Spacing.xl, marginBottom: Spacing.lg,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  xpTitle: { fontSize: FontSize.lg, fontWeight: "700", color: Colors.text, marginBottom: Spacing.md },
  xpRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing.sm },
  xpLabelRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  xpLabel: { fontSize: FontSize.md, color: Colors.textSecondary },
  xpValue: { fontSize: FontSize.md, fontWeight: "700", color: Colors.success },
  xpDivider: { height: 1, backgroundColor: Colors.borderLight, marginVertical: Spacing.sm },
  xpTotalLabel: { fontSize: FontSize.lg, fontWeight: "700", color: Colors.text },
  xpTotalValue: { fontSize: FontSize.xl, fontWeight: "800", color: Colors.primary },
  statsRow: {
    flexDirection: "row", gap: Spacing.md, marginBottom: Spacing.xl,
  },
  statBox: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    padding: Spacing.lg, alignItems: "center",
  },
  statValue: { fontSize: FontSize.xl, fontWeight: "800", color: Colors.text, marginTop: 4 },
  statLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  achievementsCard: {
    backgroundColor: Colors.warning + "10", borderRadius: BorderRadius.lg,
    padding: Spacing.xl, marginBottom: Spacing.xl,
  },
  achievementsTitle: {
    fontSize: FontSize.lg, fontWeight: "700", color: Colors.warningDark, marginBottom: Spacing.md,
  },
  achievementRow: { flexDirection: "row", alignItems: "center", gap: Spacing.md, marginBottom: Spacing.md },
  achievementInfo: { flex: 1 },
  achievementName: { fontSize: FontSize.md, fontWeight: "700", color: Colors.text },
  achievementDesc: { fontSize: FontSize.sm, color: Colors.textSecondary },
  reviewTitle: { fontSize: FontSize.xl, fontWeight: "700", color: Colors.text, marginBottom: Spacing.md },
  reviewCard: { borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.sm },
  reviewCorrect: { backgroundColor: Colors.success + "08" },
  reviewWrong: { backgroundColor: Colors.error + "08" },
  reviewHeader: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, marginBottom: 4 },
  reviewNumber: { fontSize: FontSize.sm, fontWeight: "700", color: Colors.text },
  reviewBadges: { flexDirection: "row", gap: Spacing.sm, marginLeft: "auto" },
  reviewCategory: { fontSize: FontSize.xs, color: Colors.textSecondary },
  reviewDifficulty: { fontSize: FontSize.xs, color: Colors.textLight, textTransform: "capitalize" },
  reviewQuestion: { fontSize: FontSize.sm, color: Colors.text, lineHeight: 20 },
  reviewAnswer: { fontSize: FontSize.xs, color: Colors.error, marginTop: 4 },
  actions: { marginTop: Spacing.xl, gap: Spacing.md },
  primaryButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.sm,
    backgroundColor: Colors.primary, borderRadius: BorderRadius.md, padding: Spacing.lg,
  },
  primaryButtonText: { color: "#FFF", fontSize: FontSize.lg, fontWeight: "700" },
  secondaryButton: {
    alignItems: "center", padding: Spacing.lg,
  },
  secondaryButtonText: { color: Colors.textSecondary, fontSize: FontSize.md, fontWeight: "600" },
});
