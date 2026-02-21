import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, FontSize, Spacing, BorderRadius } from "../constants/theme";
import { QuestionCard } from "../components/QuestionCard";
import type { Question, AnswerResult } from "../types";

export default function QuizScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerResult[]>([]);
  const [startTime] = useState(Date.now());

  const questions: Question[] = params.questions
    ? JSON.parse(params.questions as string)
    : [];

  const currentQuestion = questions[currentIndex];

  const handleAnswer = (answer: string, isCorrect: boolean) => {
    setAnswers((prev) => [
      ...prev,
      {
        question: currentQuestion.question,
        options: currentQuestion.options,
        correctAnswer: currentQuestion.correctAnswer,
        userAnswer: answer,
        category: currentQuestion.category,
        difficulty: currentQuestion.difficulty,
        isCorrect,
      },
    ]);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    } else {
      // Quiz complete
      const timeSeconds = Math.floor((Date.now() - startTime) / 1000);
      router.replace({
        pathname: "/results",
        params: {
          answers: JSON.stringify(answers),
          timeSeconds: String(timeSeconds),
        },
      });
    }
  };

  const handleQuit = () => {
    router.back();
  };

  if (!currentQuestion) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>No questions available</Text>
      </SafeAreaView>
    );
  }

  const correctSoFar = answers.filter((a) => a.isCorrect).length;
  const progress = (currentIndex + 1) / questions.length;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleQuit} style={styles.quitButton}>
          <Ionicons name="close" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
        </View>

        {/* Score */}
        <View style={styles.scoreContainer}>
          <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
          <Text style={styles.scoreText}>{correctSoFar}</Text>
        </View>
      </View>

      {/* Question */}
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false}>
        <QuestionCard
          question={currentQuestion}
          questionNumber={currentIndex + 1}
          totalQuestions={questions.length}
          onAnswer={handleAnswer}
          onNext={handleNext}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  quitButton: {
    padding: Spacing.sm,
  },
  progressContainer: {
    flex: 1,
  },
  progressTrack: {
    height: 8,
    backgroundColor: Colors.borderLight,
    borderRadius: BorderRadius.full,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  scoreText: {
    fontSize: FontSize.lg,
    fontWeight: "700",
    color: Colors.success,
  },
  errorText: {
    fontSize: FontSize.lg,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 100,
  },
});
