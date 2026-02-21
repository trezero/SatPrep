import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, FontSize, Spacing, BorderRadius } from "../constants/theme";
import { useAuth } from "../hooks/useStore";
import * as api from "../services/api";
import type { PSATAnalysis } from "../types";

export default function UploadPSATScreen() {
  const router = useRouter();
  const { userId } = useAuth();
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analysis, setAnalysis] = useState<PSATAnalysis | null>(null);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets.length > 0) {
        const file = result.assets[0];
        setSelectedFile(file.uri);
        setFileName(file.name);
      }
    } catch (error) {
      console.error("Error picking document:", error);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !userId) return;
    setUploading(true);
    try {
      const fileContent = await FileSystem.readAsStringAsync(selectedFile, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const result = await api.uploadPSAT(userId, fileContent);
      setAnalysis(result.analysis);

      if (result.newAchievements.length > 0) {
        Alert.alert(
          "Achievement Unlocked!",
          result.newAchievements.map((a) => `${a.name}: ${a.description}`).join("\n")
        );
      }
    } catch (error) {
      console.error("Error uploading PSAT:", error);
      Alert.alert("Upload Failed", "Could not analyze your PSAT scores. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return Colors.error;
      case "medium": return Colors.warning;
      case "low": return Colors.success;
      default: return Colors.textSecondary;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upload PSAT Scores</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {!analysis ? (
          <>
            {/* Upload Area */}
            <View style={styles.uploadSection}>
              <TouchableOpacity style={styles.uploadArea} onPress={pickDocument}>
                <View style={styles.uploadIcon}>
                  <Ionicons
                    name={selectedFile ? "document" : "cloud-upload"}
                    size={48}
                    color={selectedFile ? Colors.success : Colors.primary}
                  />
                </View>
                <Text style={styles.uploadTitle}>
                  {selectedFile ? fileName : "Tap to select your PSAT PDF"}
                </Text>
                <Text style={styles.uploadSubtitle}>
                  {selectedFile
                    ? "Tap to choose a different file"
                    : "Upload your PSAT score report PDF"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Info */}
            <View style={styles.infoCard}>
              <Ionicons name="information-circle" size={22} color={Colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>How it works</Text>
                <Text style={styles.infoText}>
                  Our AI analyzes your PSAT score report to identify your weak areas, then generates
                  personalized SAT practice questions targeting those specific topics.
                </Text>
              </View>
            </View>

            {/* Upload Button */}
            <TouchableOpacity
              style={[styles.uploadButton, !selectedFile && styles.buttonDisabled]}
              onPress={handleUpload}
              disabled={!selectedFile || uploading}
            >
              {uploading ? (
                <View style={styles.uploadingContainer}>
                  <ActivityIndicator color="#FFF" />
                  <Text style={styles.uploadButtonText}>Analyzing with AI...</Text>
                </View>
              ) : (
                <>
                  <Ionicons name="sparkles" size={20} color="#FFF" />
                  <Text style={styles.uploadButtonText}>Analyze My Scores</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Analysis Results */}
            <View style={styles.analysisHeader}>
              <Ionicons name="checkmark-circle" size={48} color={Colors.success} />
              <Text style={styles.analysisTitle}>Analysis Complete!</Text>
            </View>

            {/* Scores */}
            <View style={styles.scoresCard}>
              <Text style={styles.scoresTitle}>Your Scores</Text>
              <View style={styles.scoresRow}>
                <View style={styles.scoreBox}>
                  <Text style={styles.scoreValue}>{analysis.overallScore}</Text>
                  <Text style={styles.scoreLabel}>Overall</Text>
                </View>
                <View style={styles.scoreBox}>
                  <Text style={[styles.scoreValue, { color: Colors.math }]}>
                    {analysis.mathScore}
                  </Text>
                  <Text style={styles.scoreLabel}>Math</Text>
                </View>
                <View style={styles.scoreBox}>
                  <Text style={[styles.scoreValue, { color: Colors.reading }]}>
                    {analysis.readingWritingScore}
                  </Text>
                  <Text style={styles.scoreLabel}>R&W</Text>
                </View>
              </View>
            </View>

            {/* Summary */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Summary</Text>
              <Text style={styles.summaryText}>{analysis.summary}</Text>
            </View>

            {/* Weak Areas */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Areas to Improve</Text>
              {analysis.weakAreas.map((area, index) => (
                <View key={index} style={styles.weakAreaRow}>
                  <View style={[styles.severityDot, { backgroundColor: getSeverityColor(area.severity) }]} />
                  <View style={styles.weakAreaInfo}>
                    <Text style={styles.weakAreaName}>
                      {area.category} — {area.subcategory}
                    </Text>
                    <Text style={styles.weakAreaDesc}>{area.description}</Text>
                  </View>
                  <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(area.severity) + "15" }]}>
                    <Text style={[styles.severityText, { color: getSeverityColor(area.severity) }]}>
                      {area.severity}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Strong Areas */}
            {analysis.strongAreas.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Your Strengths</Text>
                <View style={styles.strongAreasGrid}>
                  {analysis.strongAreas.map((area, index) => (
                    <View key={index} style={styles.strongAreaBadge}>
                      <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                      <Text style={styles.strongAreaText}>{area}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Start Practicing */}
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => router.replace("/(tabs)/practice")}
            >
              <Ionicons name="play" size={20} color="#FFF" />
              <Text style={styles.uploadButtonText}>Start Personalized Practice</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
  },
  backButton: { padding: Spacing.sm },
  headerTitle: { fontSize: FontSize.xl, fontWeight: "700", color: Colors.text },
  scrollContent: { padding: Spacing.lg, paddingBottom: 100 },
  uploadSection: { marginBottom: Spacing.xl },
  uploadArea: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xl,
    borderWidth: 2, borderColor: Colors.primary + "30", borderStyle: "dashed",
    padding: Spacing.xxl, alignItems: "center",
  },
  uploadIcon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primary + "10", alignItems: "center",
    justifyContent: "center", marginBottom: Spacing.lg,
  },
  uploadTitle: { fontSize: FontSize.lg, fontWeight: "700", color: Colors.text, textAlign: "center" },
  uploadSubtitle: {
    fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: "center", marginTop: Spacing.sm,
  },
  infoCard: {
    flexDirection: "row", backgroundColor: Colors.primary + "08",
    borderRadius: BorderRadius.lg, padding: Spacing.lg, gap: Spacing.md, marginBottom: Spacing.xl,
  },
  infoContent: { flex: 1 },
  infoTitle: { fontSize: FontSize.md, fontWeight: "700", color: Colors.primary },
  infoText: { fontSize: FontSize.sm, color: Colors.text, lineHeight: 20, marginTop: 4 },
  uploadButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.sm,
    backgroundColor: Colors.primary, borderRadius: BorderRadius.md, padding: Spacing.lg,
  },
  buttonDisabled: { opacity: 0.5 },
  uploadingContainer: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  uploadButtonText: { color: "#FFF", fontSize: FontSize.lg, fontWeight: "700" },
  analysisHeader: { alignItems: "center", marginBottom: Spacing.xl },
  analysisTitle: {
    fontSize: FontSize.xxl, fontWeight: "800", color: Colors.text, marginTop: Spacing.md,
  },
  scoresCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    padding: Spacing.xl, marginBottom: Spacing.lg,
  },
  scoresTitle: { fontSize: FontSize.lg, fontWeight: "700", color: Colors.text, marginBottom: Spacing.md },
  scoresRow: { flexDirection: "row", justifyContent: "space-around" },
  scoreBox: { alignItems: "center" },
  scoreValue: { fontSize: 36, fontWeight: "900", color: Colors.text },
  scoreLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4 },
  card: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    padding: Spacing.xl, marginBottom: Spacing.lg,
  },
  cardTitle: { fontSize: FontSize.lg, fontWeight: "700", color: Colors.text, marginBottom: Spacing.md },
  summaryText: { fontSize: FontSize.md, color: Colors.text, lineHeight: 24 },
  weakAreaRow: {
    flexDirection: "row", alignItems: "center", gap: Spacing.md, marginBottom: Spacing.md,
  },
  severityDot: { width: 10, height: 10, borderRadius: 5 },
  weakAreaInfo: { flex: 1 },
  weakAreaName: { fontSize: FontSize.md, fontWeight: "600", color: Colors.text },
  weakAreaDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  severityBadge: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.full,
  },
  severityText: { fontSize: FontSize.xs, fontWeight: "700", textTransform: "uppercase" },
  strongAreasGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  strongAreaBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: Colors.success + "10", borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
  },
  strongAreaText: { fontSize: FontSize.sm, color: Colors.success, fontWeight: "600" },
});
