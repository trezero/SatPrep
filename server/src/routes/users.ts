import { Router, Request, Response } from "express";
import Database from "better-sqlite3";
import { v4 as uuidv4 } from "uuid";
import { calculateLevel, xpToNextLevel, checkAchievements, ACHIEVEMENTS } from "../services/gamification";

export function createUserRoutes(db: Database.Database): Router {
  const router = Router();

  // Create a new user
  router.post("/", (req: Request, res: Response) => {
    const { displayName, schoolId } = req.body;
    if (!displayName) {
      res.status(400).json({ error: "displayName is required" });
      return;
    }

    const id = uuidv4();
    db.prepare(
      `INSERT INTO users (id, display_name, school_id) VALUES (?, ?, ?)`
    ).run(id, displayName, schoolId || null);

    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
    res.status(201).json(user);
  });

  // Get user profile
  router.get("/:id", (req: Request, res: Response) => {
    const user = db.prepare(`
      SELECT u.*, s.name as school_name, s.city as school_city, s.state as school_state
      FROM users u
      LEFT JOIN schools s ON u.school_id = s.id
      WHERE u.id = ?
    `).get(req.params.id) as any;

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const levelProgress = xpToNextLevel(user.xp);
    const achievements = db.prepare(
      "SELECT achievement_key, unlocked_at FROM achievements WHERE user_id = ?"
    ).all(user.id) as any[];

    const recentSessions = db.prepare(
      `SELECT * FROM practice_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT 10`
    ).all(user.id);

    // Category breakdown
    const categoryStats = db.prepare(`
      SELECT category,
        COUNT(*) as total,
        SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct
      FROM questions_history
      WHERE user_id = ?
      GROUP BY category
    `).all(user.id);

    res.json({
      ...user,
      levelProgress,
      achievements: achievements.map(a => ({
        ...ACHIEVEMENTS[a.achievement_key],
        key: a.achievement_key,
        unlockedAt: a.unlocked_at,
      })),
      recentSessions,
      categoryStats,
    });
  });

  // Update user's school
  router.patch("/:id/school", (req: Request, res: Response) => {
    const { schoolId } = req.body;
    db.prepare("UPDATE users SET school_id = ? WHERE id = ?").run(schoolId, req.params.id);
    res.json({ success: true });
  });

  // Update streak (called on app open)
  router.post("/:id/check-streak", (req: Request, res: Response) => {
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id) as any;
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const lastPractice = user.last_practice_date;

    if (!lastPractice) {
      res.json({ streak: 0, message: "Start practicing to build your streak!" });
      return;
    }

    const lastDate = new Date(lastPractice);
    const todayDate = new Date(today);
    const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays > 1) {
      // Streak broken
      db.prepare("UPDATE users SET streak_days = 0 WHERE id = ?").run(user.id);
      res.json({ streak: 0, message: "Your streak was reset. Start a new one today!" });
    } else {
      res.json({ streak: user.streak_days, message: `${user.streak_days}-day streak! Keep it up!` });
    }
  });

  // Get user stats summary
  router.get("/:id/stats", (req: Request, res: Response) => {
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id) as any;
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const weeklyActivity = db.prepare(`
      SELECT date(created_at) as day,
        COUNT(*) as questions,
        SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct
      FROM questions_history
      WHERE user_id = ? AND created_at >= date('now', '-7 days')
      GROUP BY date(created_at)
      ORDER BY day
    `).all(user.id);

    const subcategoryBreakdown = db.prepare(`
      SELECT category,
        json_extract(question_text, '$') as subcategory_info,
        COUNT(*) as total,
        SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct
      FROM questions_history
      WHERE user_id = ?
      GROUP BY category
    `).all(user.id);

    const accuracy = user.total_questions_answered > 0
      ? Math.round((user.total_correct / user.total_questions_answered) * 100)
      : 0;

    res.json({
      totalQuestions: user.total_questions_answered,
      totalCorrect: user.total_correct,
      accuracy,
      xp: user.xp,
      level: user.level,
      streak: user.streak_days,
      levelProgress: xpToNextLevel(user.xp),
      weeklyActivity,
      subcategoryBreakdown,
    });
  });

  return router;
}
