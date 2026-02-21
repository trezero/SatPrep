import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, FontSize, Spacing, BorderRadius } from "../../constants/theme";
import { useAuth } from "../../hooks/useStore";
import * as api from "../../services/api";

type QuestionCount = 5 | 10 | 15;

export default function PracticeScreen() {
  const router = useRouter();
  const { userId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState<QuestionCount>(10);

  const startPractice = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { questions, weakAreas, hasAnalysis } = await api.generateQuestions(userId, questionCount);
      // Navigate to quiz screen with questions
      router.push({
        pathname: "/quiz",
        params: {
          questions: JSON.stringify(questions),
          weakAreas: JSON.stringify(weakAreas),
          hasAnalysis: String(hasAnalysis),
        },
      });
    } catch (error) {
      console.error("Failed to generate questions:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Practice</Text>
        <Text style={styles.subtitle}>Sharpen your skills with SAT-style questions</Text>

        {/* Question Count Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How many questions?</Text>
          <View style={styles.countSelector}>
            {([5, 10, 15] as QuestionCount[]).map((count) => (
              <TouchableOpacity
                key={count}
                style={[
                  styles.countOption,
                  questionCount === count && styles.countOptionSelected,
                ]}
                onPress={() => setQuestionCount(count)}
              >
                <Text
                  style={[
                    styles.countText,
                    questionCount === count && styles.countTextSelected,
                  ]}
                >
                  {count}
                </Text>
                <Text
                  style={[
                    styles.countLabel,
                    questionCount === count && styles.countLabelSelected,
                  ]}
                >
                  {count === 5 ? "Quick" : count === 10 ? "Standard" : "Deep Dive"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Practice Modes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Practice Modes</Text>

          <TouchableOpacity
            style={styles.modeCard}
            onPress={startPractice}
            disabled={loading}
          >
            <View style={[styles.modeIcon, { backgroundColor: Colors.primary + "15" }]}>
              <Ionicons name="flash" size={28} color={Colors.primary} />
            </View>
            <View style={styles.modeInfo}>
              <Text style={styles.modeName}>Smart Practice</Text>
              <Text style={styles.modeDescription}>
                AI-powered questions targeting your weak spots
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modeCard}
            onPress={startPractice}
            disabled={loading}
          >
            <View style={[styles.modeIcon, { backgroundColor: Colors.math + "15" }]}>
              <Ionicons name="calculator" size={28} color={Colors.math} />
            </View>
            <View style={styles.modeInfo}>
              <Text style={styles.modeName}>Math Focus</Text>
              <Text style={styles.modeDescription}>
                Algebra, geometry, problem solving & data analysis
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modeCard}
            onPress={startPractice}
            disabled={loading}
          >
            <View style={[styles.modeIcon, { backgroundColor: Colors.reading + "15" }]}>
              <Ionicons name="book" size={28} color={Colors.reading} />
            </View>
            <View style={styles.modeInfo}>
              <Text style={styles.modeName}>Reading & Writing</Text>
              <Text style={styles.modeDescription}>
                Comprehension, grammar, vocabulary & rhetoric
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
          </TouchableOpacity>
        </View>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Ionicons name="bulb" size={22} color={Colors.warning} />
          <Text style={styles.tipsText}>
            Practice daily to build your streak and earn bonus XP!
          </Text>
        </View>
      </ScrollView>

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Generating your questions...</Text>
            <Text style={styles.loadingSubtext}>
              Our AI is crafting questions just for you
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: "900",
    color: Colors.text,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: 4,
    marginBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  countSelector: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  countOption: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.border,
  },
  countOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + "08",
  },
  countText: {
    fontSize: FontSize.xxl,
    fontWeight: "800",
    color: Colors.textSecondary,
  },
  countTextSelected: {
    color: Colors.primary,
  },
  countLabel: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
    marginTop: 4,
  },
  countLabelSelected: {
    color: Colors.primary,
  },
  modeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  modeIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  modeInfo: {
    flex: 1,
  },
  modeName: {
    fontSize: FontSize.lg,
    fontWeight: "700",
    color: Colors.text,
  },
  modeDescription: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  tipsCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.warning + "12",
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  tipsText: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.text,
    lineHeight: 22,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxl,
    alignItems: "center",
    marginHorizontal: Spacing.xxl,
    width: "80%",
  },
  loadingText: {
    fontSize: FontSize.lg,
    fontWeight: "700",
    color: Colors.text,
    marginTop: Spacing.lg,
  },
  loadingSubtext: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: "center",
  },
});
