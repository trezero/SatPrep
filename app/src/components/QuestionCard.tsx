import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, FontSize, Spacing, BorderRadius } from "../constants/theme";
import type { Question } from "../types";

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (answer: string, isCorrect: boolean) => void;
  onNext: () => void;
}

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  onNext,
}: QuestionCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const isCorrect = selectedAnswer === question.correctAnswer;

  const handleSelect = (answer: string) => {
    if (showResult) return;
    const answerLetter = answer.charAt(0);
    setSelectedAnswer(answerLetter);
    setShowResult(true);
    onAnswer(answerLetter, answerLetter === question.correctAnswer);
  };

  const getOptionStyle = (option: string) => {
    const letter = option.charAt(0);
    if (!showResult) {
      return selectedAnswer === letter ? styles.optionSelected : styles.option;
    }
    if (letter === question.correctAnswer) return styles.optionCorrect;
    if (letter === selectedAnswer && !isCorrect) return styles.optionWrong;
    return styles.option;
  };

  const getOptionTextStyle = (option: string) => {
    const letter = option.charAt(0);
    if (!showResult) {
      return selectedAnswer === letter ? styles.optionTextSelected : styles.optionText;
    }
    if (letter === question.correctAnswer) return styles.optionTextCorrect;
    if (letter === selectedAnswer && !isCorrect) return styles.optionTextWrong;
    return styles.optionText;
  };

  const getDifficultyColor = () => {
    switch (question.difficulty) {
      case "easy": return Colors.success;
      case "medium": return Colors.warning;
      case "hard": return Colors.error;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.questionInfo}>
          <Text style={styles.questionNumber}>
            {questionNumber} of {totalQuestions}
          </Text>
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor() + "20" }]}>
            <Text style={[styles.difficultyText, { color: getDifficultyColor() }]}>
              {question.difficulty.toUpperCase()}
            </Text>
          </View>
        </View>
        <View style={[styles.categoryBadge, {
          backgroundColor: question.category === "Math" ? Colors.math + "15" : Colors.reading + "15"
        }]}>
          <Text style={[styles.categoryText, {
            color: question.category === "Math" ? Colors.math : Colors.reading
          }]}>
            {question.subcategory}
          </Text>
        </View>
      </View>

      {/* Question */}
      <Text style={styles.questionText}>{question.question}</Text>

      {/* Options */}
      <View style={styles.options}>
        {question.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={getOptionStyle(option)}
            onPress={() => handleSelect(option)}
            activeOpacity={0.7}
            disabled={showResult}
          >
            <Text style={getOptionTextStyle(option)}>{option}</Text>
            {showResult && option.charAt(0) === question.correctAnswer && (
              <Ionicons name="checkmark-circle" size={22} color={Colors.success} />
            )}
            {showResult && option.charAt(0) === selectedAnswer && !isCorrect && option.charAt(0) !== question.correctAnswer && (
              <Ionicons name="close-circle" size={22} color={Colors.error} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Explanation */}
      {showResult && (
        <View style={[styles.explanation, isCorrect ? styles.explanationCorrect : styles.explanationWrong]}>
          <View style={styles.explanationHeader}>
            <Ionicons
              name={isCorrect ? "checkmark-circle" : "information-circle"}
              size={20}
              color={isCorrect ? Colors.success : Colors.error}
            />
            <Text style={[styles.explanationTitle, { color: isCorrect ? Colors.success : Colors.error }]}>
              {isCorrect ? "Correct!" : "Not quite!"}
            </Text>
          </View>
          <Text style={styles.explanationText}>{question.explanation}</Text>

          <TouchableOpacity style={styles.nextButton} onPress={onNext}>
            <Text style={styles.nextButtonText}>
              {questionNumber < totalQuestions ? "Next Question" : "See Results"}
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  questionInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  questionNumber: {
    fontSize: FontSize.md,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  difficultyBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  difficultyText: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  categoryText: {
    fontSize: FontSize.sm,
    fontWeight: "600",
  },
  questionText: {
    fontSize: FontSize.lg,
    color: Colors.text,
    lineHeight: 26,
    marginBottom: Spacing.xl,
  },
  options: {
    gap: Spacing.md,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
  },
  optionSelected: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.primaryLight + "15",
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
  },
  optionCorrect: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.success + "10",
    borderWidth: 2,
    borderColor: Colors.success,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
  },
  optionWrong: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.error + "10",
    borderWidth: 2,
    borderColor: Colors.error,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
  },
  optionText: {
    fontSize: FontSize.md,
    color: Colors.text,
    flex: 1,
  },
  optionTextSelected: {
    fontSize: FontSize.md,
    color: Colors.primary,
    fontWeight: "600",
    flex: 1,
  },
  optionTextCorrect: {
    fontSize: FontSize.md,
    color: Colors.success,
    fontWeight: "600",
    flex: 1,
  },
  optionTextWrong: {
    fontSize: FontSize.md,
    color: Colors.error,
    fontWeight: "600",
    flex: 1,
  },
  explanation: {
    marginTop: Spacing.xl,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  explanationCorrect: {
    backgroundColor: Colors.success + "10",
  },
  explanationWrong: {
    backgroundColor: Colors.error + "08",
  },
  explanationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  explanationTitle: {
    fontSize: FontSize.lg,
    fontWeight: "700",
  },
  explanationText: {
    fontSize: FontSize.md,
    color: Colors.text,
    lineHeight: 22,
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
  },
  nextButtonText: {
    color: "#FFF",
    fontSize: FontSize.lg,
    fontWeight: "700",
  },
});
