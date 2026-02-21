import { Router, Request, Response } from "express";
import Database from "better-sqlite3";
import { generateQuestions, generateFollowUpExplanation, type WeakArea } from "../services/claude";
import {
  calculateSessionXp,
  calculateLevel,
  checkAchievements,
  ACHIEVEMENTS,
} from "../services/gamification";

export function createPracticeRoutes(db: Database.Database): Router {
  const router = Router();

  // Generate a new practice set for a user
  router.post("/generate", async (req: Request, res: Response) => {
    try {
      const { userId, count = 10 } = req.body;
      if (!userId) {
        res.status(400).json({ error: "userId is required" });
        return;
      }

      // Get user's weak areas from their latest PSAT analysis
      const analysis = db.prepare(
        "SELECT * FROM psat_analyses WHERE user_id = ? ORDER BY created_at DESC LIMIT 1"
      ).get(userId) as any;

      let weakAreas: WeakArea[];
      if (analysis) {
        weakAreas = JSON.parse(analysis.weak_areas);
      } else {
        // Default weak areas for users without PSAT analysis
        weakAreas = [
          { category: "Math", subcategory: "Algebra", severity: "medium" as const, description: "Linear equations and inequalities" },
          { category: "Math", subcategory: "Problem Solving", severity: "medium" as const, description: "Word problems and data analysis" },
          { category: "Reading & Writing", subcategory: "Reading Comprehension", severity: "medium" as const, description: "Main idea and supporting details" },
          { category: "Reading & Writing", subcategory: "Grammar", severity: "medium" as const, description: "Sentence structure and punctuation" },
          { category: "Reading & Writing", subcategory: "Vocabulary", severity: "low" as const, description: "Words in context" },
        ];
      }

      // Get previously asked questions to avoid repeats
      const previousQuestions = (db.prepare(
        "SELECT question_text FROM questions_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 20"
      ).all(userId) as any[]).map(q => q.question_text);

      const questions = await generateQuestions(weakAreas, Math.min(count, 15), previousQuestions);

      res.json({
        questions,
        weakAreas: weakAreas.map(a => a.subcategory),
        hasAnalysis: !!analysis,
      });
    } catch (error) {
      console.error("Error generating questions:", error);
      res.status(500).json({ error: "Failed to generate questions" });
    }
  });

  // Submit a completed practice session
  router.post("/submit", (req: Request, res: Response) => {
    try {
      const { userId, answers, timeSeconds } = req.body;
      if (!userId || !answers || !Array.isArray(answers)) {
        res.status(400).json({ error: "userId and answers array are required" });
        return;
      }

      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as any;
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const correctCount = answers.filter((a: any) => a.isCorrect).length;
      const totalCount = answers.length;

      // Determine primary category
      const categories = answers.map((a: any) => a.category);
      const primaryCategory = categories.sort(
        (a: string, b: string) =>
          categories.filter((v: string) => v === b).length -
          categories.filter((v: string) => v === a).length
      )[0] || "Mixed";

      // Calculate XP
      const xpResult = calculateSessionXp(correctCount, totalCount, user.streak_days);

      const submitTransaction = db.transaction(() => {
        // Create practice session
        const sessionResult = db.prepare(
          `INSERT INTO practice_sessions (user_id, category, total_questions, correct_answers, xp_earned, time_seconds)
           VALUES (?, ?, ?, ?, ?, ?)`
        ).run(userId, primaryCategory, totalCount, correctCount, xpResult.totalXp, timeSeconds || null);

        const sessionId = sessionResult.lastInsertRowid;

        // Store individual question results
        const insertQuestion = db.prepare(
          `INSERT INTO questions_history (user_id, session_id, question_text, options, correct_answer, user_answer, category, difficulty, is_correct)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        );

        for (const answer of answers) {
          insertQuestion.run(
            userId,
            sessionId,
            answer.question,
            JSON.stringify(answer.options),
            answer.correctAnswer,
            answer.userAnswer,
            answer.category,
            answer.difficulty,
            answer.isCorrect ? 1 : 0
          );
        }

        // Update user stats
        const newXp = user.xp + xpResult.totalXp;
        const newLevel = calculateLevel(newXp);
        const today = new Date().toISOString().split("T")[0];
        const lastPractice = user.last_practice_date;

        let newStreak = user.streak_days;
        if (lastPractice !== today) {
          const lastDate = lastPractice ? new Date(lastPractice) : null;
          const todayDate = new Date(today);
          if (lastDate) {
            const diffDays = Math.floor(
              (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
            );
            newStreak = diffDays <= 1 ? user.streak_days + 1 : 1;
          } else {
            newStreak = 1;
          }
        }

        db.prepare(`
          UPDATE users SET
            xp = ?,
            level = ?,
            streak_days = ?,
            last_practice_date = ?,
            total_questions_answered = total_questions_answered + ?,
            total_correct = total_correct + ?
          WHERE id = ?
        `).run(newXp, newLevel, newStreak, today, totalCount, correctCount, userId);

        // Check for new achievements
        if (timeSeconds && timeSeconds < 120 && totalCount >= 5) {
          db.prepare("INSERT OR IGNORE INTO achievements (user_id, achievement_key) VALUES (?, ?)")
            .run(userId, "speed_demon");
        }
        if (correctCount === totalCount && totalCount > 0) {
          db.prepare("INSERT OR IGNORE INTO achievements (user_id, achievement_key) VALUES (?, ?)")
            .run(userId, "perfect_round");
        }

        const newAchievements = checkAchievements(db, userId);

        return {
          sessionId,
          xpResult,
          newXp,
          newLevel,
          newStreak,
          newAchievements: newAchievements.map(key => ({
            key,
            ...ACHIEVEMENTS[key],
          })),
          accuracy: Math.round((correctCount / totalCount) * 100),
        };
      });

      const result = submitTransaction();
      res.json(result);
    } catch (error) {
      console.error("Error submitting session:", error);
      res.status(500).json({ error: "Failed to submit session" });
    }
  });

  // Get explanation for a wrong answer
  router.post("/explain", async (req: Request, res: Response) => {
    try {
      const { question, correctAnswer, userAnswer } = req.body;
      const explanation = await generateFollowUpExplanation(question, correctAnswer, userAnswer);
      res.json({ explanation });
    } catch (error) {
      console.error("Error generating explanation:", error);
      res.status(500).json({ error: "Failed to generate explanation" });
    }
  });

  return router;
}
