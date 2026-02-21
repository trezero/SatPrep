import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors, FontSize, Spacing, BorderRadius } from "../constants/theme";
import { useAuth } from "../hooks/useStore";
import * as api from "../services/api";
import type { School } from "../types";

type Step = "welcome" | "name" | "zip" | "school" | "ready";

export default function Onboarding() {
  const router = useRouter();
  const { login, completeOnboarding } = useAuth();
  const [step, setStep] = useState<Step>("welcome");
  const [displayName, setDisplayName] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchingSchools, setSearchingSchools] = useState(false);

  const handleSearchSchools = async () => {
    if (zipCode.length < 3) return;
    setSearchingSchools(true);
    try {
      const results = await api.searchSchools(zipCode);
      setSchools(results);
    } catch (error) {
      console.error("Failed to search schools:", error);
    } finally {
      setSearchingSchools(false);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const user = await api.createUser(displayName, selectedSchool?.id);
      await login(user.id);
      await completeOnboarding();
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Failed to create user:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderWelcome = () => (
    <View style={styles.stepContainer}>
      <View style={styles.heroIcon}>
        <Ionicons name="school" size={80} color={Colors.primary} />
      </View>
      <Text style={styles.heroTitle}>SAT Prep</Text>
      <Text style={styles.heroSubtitle}>Level up your scores</Text>
      <Text style={styles.description}>
        Practice SAT questions personalized to your weak spots.{"\n"}
        Compete with classmates. Track your progress.{"\n"}
        Let's crush that SAT!
      </Text>
      <TouchableOpacity style={styles.primaryButton} onPress={() => setStep("name")}>
        <Text style={styles.primaryButtonText}>Get Started</Text>
        <Ionicons name="arrow-forward" size={20} color="#FFF" />
      </TouchableOpacity>
    </View>
  );

  const renderNameStep = () => (
    <View style={styles.stepContainer}>
      <Ionicons name="person-circle" size={64} color={Colors.primary} />
      <Text style={styles.stepTitle}>What should we call you?</Text>
      <Text style={styles.stepSubtitle}>Pick a display name for the leaderboard</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your display name"
        placeholderTextColor={Colors.textLight}
        value={displayName}
        onChangeText={setDisplayName}
        maxLength={20}
        autoFocus
      />
      <TouchableOpacity
        style={[styles.primaryButton, !displayName.trim() && styles.buttonDisabled]}
        onPress={() => setStep("zip")}
        disabled={!displayName.trim()}
      >
        <Text style={styles.primaryButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );

  const renderZipStep = () => (
    <View style={styles.stepContainer}>
      <Ionicons name="location" size={64} color={Colors.secondary} />
      <Text style={styles.stepTitle}>Find your school</Text>
      <Text style={styles.stepSubtitle}>Enter your zip code to find nearby schools</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter zip code"
        placeholderTextColor={Colors.textLight}
        value={zipCode}
        onChangeText={setZipCode}
        keyboardType="number-pad"
        maxLength={5}
        autoFocus
      />
      <TouchableOpacity
        style={[styles.primaryButton, zipCode.length < 3 && styles.buttonDisabled]}
        onPress={() => {
          handleSearchSchools();
          setStep("school");
        }}
        disabled={zipCode.length < 3}
      >
        <Text style={styles.primaryButtonText}>Search Schools</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.textButton} onPress={() => setStep("ready")}>
        <Text style={styles.textButtonText}>Skip for now</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSchoolStep = () => (
    <View style={[styles.stepContainer, { flex: 1 }]}>
      <Text style={styles.stepTitle}>Select your school</Text>
      {searchingSchools ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      ) : schools.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="search" size={48} color={Colors.textLight} />
          <Text style={styles.emptyText}>No schools found near {zipCode}</Text>
          <TouchableOpacity style={styles.textButton} onPress={() => setStep("zip")}>
            <Text style={styles.textButtonText}>Try another zip code</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={schools}
          keyExtractor={(item) => String(item.id)}
          style={styles.schoolList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.schoolCard,
                selectedSchool?.id === item.id && styles.schoolCardSelected,
              ]}
              onPress={() => setSelectedSchool(item)}
            >
              <View style={styles.schoolInfo}>
                <Text style={styles.schoolName}>{item.name}</Text>
                <Text style={styles.schoolLocation}>
                  {item.city}, {item.state} {item.zip}
                </Text>
                {item.student_count != null && item.student_count > 0 && (
                  <Text style={styles.schoolStudents}>
                    {item.student_count} student{item.student_count !== 1 ? "s" : ""} practicing
                  </Text>
                )}
              </View>
              {selectedSchool?.id === item.id && (
                <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
              )}
            </TouchableOpacity>
          )}
        />
      )}
      {schools.length > 0 && (
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={[styles.primaryButton, !selectedSchool && styles.buttonDisabled]}
            onPress={() => setStep("ready")}
            disabled={!selectedSchool}
          >
            <Text style={styles.primaryButtonText}>Continue</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.textButton} onPress={() => setStep("ready")}>
            <Text style={styles.textButtonText}>Skip — choose later</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderReadyStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.readyIcon}>
        <Ionicons name="rocket" size={80} color={Colors.primary} />
      </View>
      <Text style={styles.heroTitle}>You're all set!</Text>
      <Text style={styles.description}>
        Hey <Text style={{ fontWeight: "700", color: Colors.primary }}>{displayName}</Text>!{"\n\n"}
        Upload your PSAT scores to get personalized practice, or jump right into general SAT prep questions.
      </Text>

      <View style={styles.featureList}>
        {[
          { icon: "document-text", text: "Upload PSAT for personalized practice" },
          { icon: "game-controller", text: "Fun quiz-style questions" },
          { icon: "trophy", text: "Compete on your school leaderboard" },
          { icon: "trending-up", text: "Track your progress over time" },
        ].map((feature, i) => (
          <View key={i} style={styles.featureRow}>
            <Ionicons name={feature.icon as any} size={22} color={Colors.primary} />
            <Text style={styles.featureText}>{feature.text}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleComplete}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <>
            <Text style={styles.primaryButtonText}>Let's Go!</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFF" />
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Progress dots */}
        <View style={styles.progressDots}>
          {(["welcome", "name", "zip", "school", "ready"] as Step[]).map((s, i) => (
            <View
              key={s}
              style={[
                styles.dot,
                step === s && styles.dotActive,
                (["welcome", "name", "zip", "school", "ready"] as Step[]).indexOf(step) > i &&
                  styles.dotCompleted,
              ]}
            />
          ))}
        </View>

        {/* Back button */}
        {step !== "welcome" && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              const steps: Step[] = ["welcome", "name", "zip", "school", "ready"];
              const currentIndex = steps.indexOf(step);
              if (currentIndex > 0) setStep(steps[currentIndex - 1]);
            }}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
        )}

        {step === "welcome" && renderWelcome()}
        {step === "name" && renderNameStep()}
        {step === "zip" && renderZipStep()}
        {step === "school" && renderSchoolStep()}
        {step === "ready" && renderReadyStep()}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: 60,
    paddingBottom: 40,
  },
  progressDots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.xxl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.primary,
  },
  dotCompleted: {
    backgroundColor: Colors.primaryLight,
  },
  backButton: {
    marginBottom: Spacing.lg,
    padding: Spacing.sm,
    alignSelf: "flex-start",
  },
  stepContainer: {
    alignItems: "center",
    paddingTop: Spacing.xxl,
  },
  heroIcon: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.primary + "15",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  heroTitle: {
    fontSize: FontSize.xxxl,
    fontWeight: "900",
    color: Colors.text,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  heroSubtitle: {
    fontSize: FontSize.xl,
    color: Colors.primaryLight,
    fontWeight: "600",
    marginBottom: Spacing.xl,
  },
  stepTitle: {
    fontSize: FontSize.xxl,
    fontWeight: "800",
    color: Colors.text,
    textAlign: "center",
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  stepSubtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  description: {
    fontSize: FontSize.lg,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 26,
    marginBottom: Spacing.xxl,
  },
  input: {
    width: "100%",
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    fontSize: FontSize.lg,
    color: Colors.text,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xxl,
    width: "100%",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: "#FFF",
    fontSize: FontSize.lg,
    fontWeight: "700",
  },
  textButton: {
    marginTop: Spacing.lg,
    padding: Spacing.sm,
  },
  textButtonText: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
  },
  schoolList: {
    width: "100%",
    maxHeight: 400,
    marginTop: Spacing.lg,
  },
  schoolCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  schoolCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + "08",
  },
  schoolInfo: {
    flex: 1,
  },
  schoolName: {
    fontSize: FontSize.md,
    fontWeight: "600",
    color: Colors.text,
  },
  schoolLocation: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  schoolStudents: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    marginTop: 4,
  },
  bottomActions: {
    width: "100%",
    marginTop: Spacing.lg,
    alignItems: "center",
  },
  emptyState: {
    alignItems: "center",
    marginTop: 60,
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  readyIcon: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.primary + "15",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  featureList: {
    width: "100%",
    gap: Spacing.lg,
    marginBottom: Spacing.xxl,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  featureText: {
    fontSize: FontSize.md,
    color: Colors.text,
  },
});
