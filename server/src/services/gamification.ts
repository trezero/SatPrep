import Database from "better-sqlite3";

export const XP_PER_CORRECT = 25;
export const XP_PER_WRONG = 5; // still get some XP for trying
export const XP_STREAK_BONUS = 10; // bonus per streak day
export const XP_PERFECT_ROUND_BONUS = 100;

export const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 800, 1200, 1700, 2300, 3000, 3800,      // 1-10
  4700, 5700, 6800, 8000, 9500, 11000, 13000, 15000, 17500, 20000, // 11-20
  23000, 26500, 30000, 34000, 38500, 43500, 49000, 55000, 62000, 70000, // 21-30
];

export const ACHIEVEMENTS: Record<string, { name: string; description: string; icon: string }> = {
  first_question: { name: "First Step", description: "Answer your first question", icon: "star-outline" },
  ten_streak: { name: "On Fire", description: "10-day practice streak", icon: "flame" },
  thirty_streak: { name: "Unstoppable", description: "30-day practice streak", icon: "rocket" },
  hundred_correct: { name: "Century Club", description: "100 correct answers", icon: "trophy" },
  five_hundred_correct: { name: "Knowledge Master", description: "500 correct answers", icon: "medal" },
  perfect_round: { name: "Flawless", description: "Get every question right in a session", icon: "diamond" },
  math_master: { name: "Math Whiz", description: "Answer 50 math questions correctly", icon: "calculator" },
  reading_master: { name: "Bookworm", description: "Answer 50 reading questions correctly", icon: "book" },
  level_5: { name: "Rising Star", description: "Reach level 5", icon: "trending-up" },
  level_10: { name: "Dedicated", description: "Reach level 10", icon: "school" },
  level_20: { name: "SAT Scholar", description: "Reach level 20", icon: "school" },
  speed_demon: { name: "Speed Demon", description: "Complete a round in under 2 minutes", icon: "flash" },
  upload_psat: { name: "Know Thyself", description: "Upload your PSAT scores", icon: "document-text" },
};

export function calculateLevel(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

export function xpToNextLevel(xp: number): { current: number; needed: number; progress: number } {
  const level = calculateLevel(xp);
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] || 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + 10000;

  const current = xp - currentThreshold;
  const needed = nextThreshold - currentThreshold;
  const progress = current / needed;

  return { current, needed, progress: Math.min(progress, 1) };
}

export function calculateSessionXp(
  correct: number,
  total: number,
  streakDays: number
): { baseXp: number; streakBonus: number; perfectBonus: number; totalXp: number } {
  const baseXp = correct * XP_PER_CORRECT + (total - correct) * XP_PER_WRONG;
  const streakBonus = streakDays * XP_STREAK_BONUS;
  const perfectBonus = correct === total && total > 0 ? XP_PERFECT_ROUND_BONUS : 0;

  return {
    baseXp,
    streakBonus,
    perfectBonus,
    totalXp: baseXp + streakBonus + perfectBonus,
  };
}

export function checkAchievements(
  db: Database.Database,
  userId: string
): string[] {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as any;
  if (!user) return [];

  const newAchievements: string[] = [];
  const existing = new Set(
    (db.prepare("SELECT achievement_key FROM achievements WHERE user_id = ?").all(userId) as any[])
      .map(a => a.achievement_key)
  );

  const unlock = (key: string) => {
    if (!existing.has(key)) {
      db.prepare("INSERT OR IGNORE INTO achievements (user_id, achievement_key) VALUES (?, ?)")
        .run(userId, key);
      newAchievements.push(key);
    }
  };

  if (user.total_questions_answered >= 1) unlock("first_question");
  if (user.total_correct >= 100) unlock("hundred_correct");
  if (user.total_correct >= 500) unlock("five_hundred_correct");
  if (user.streak_days >= 10) unlock("ten_streak");
  if (user.streak_days >= 30) unlock("thirty_streak");
  if (user.level >= 5) unlock("level_5");
  if (user.level >= 10) unlock("level_10");
  if (user.level >= 20) unlock("level_20");

  // Check category-specific achievements
  const mathCorrect = db.prepare(
    "SELECT COUNT(*) as count FROM questions_history WHERE user_id = ? AND category = 'Math' AND is_correct = 1"
  ).get(userId) as any;
  if (mathCorrect.count >= 50) unlock("math_master");

  const readingCorrect = db.prepare(
    "SELECT COUNT(*) as count FROM questions_history WHERE user_id = ? AND category = 'Reading & Writing' AND is_correct = 1"
  ).get(userId) as any;
  if (readingCorrect.count >= 50) unlock("reading_master");

  // Check for PSAT upload
  const hasAnalysis = db.prepare(
    "SELECT COUNT(*) as count FROM psat_analyses WHERE user_id = ?"
  ).get(userId) as any;
  if (hasAnalysis.count > 0) unlock("upload_psat");

  return newAchievements;
}
