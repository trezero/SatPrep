export interface User {
  id: string;
  display_name: string;
  school_id: number | null;
  xp: number;
  level: number;
  streak_days: number;
  last_practice_date: string | null;
  total_questions_answered: number;
  total_correct: number;
  created_at: string;
  school_name?: string;
  school_city?: string;
  school_state?: string;
  levelProgress?: LevelProgress;
  achievements?: Achievement[];
  recentSessions?: PracticeSession[];
  categoryStats?: CategoryStat[];
}

export interface LevelProgress {
  current: number;
  needed: number;
  progress: number;
}

export interface Achievement {
  key: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface School {
  id: number;
  name: string;
  city: string;
  state: string;
  zip: string;
  student_count?: number;
}

export interface PracticeSession {
  id: number;
  user_id: string;
  category: string;
  total_questions: number;
  correct_answers: number;
  xp_earned: number;
  time_seconds: number | null;
  created_at: string;
}

export interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  category: string;
  subcategory: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface AnswerResult {
  question: string;
  options: string[];
  correctAnswer: string;
  userAnswer: string;
  category: string;
  difficulty: string;
  isCorrect: boolean;
}

export interface SessionResult {
  sessionId: number;
  xpResult: {
    baseXp: number;
    streakBonus: number;
    perfectBonus: number;
    totalXp: number;
  };
  newXp: number;
  newLevel: number;
  newStreak: number;
  newAchievements: Achievement[];
  accuracy: number;
}

export interface LeaderboardEntry {
  id: string;
  display_name: string;
  xp: number;
  level: number;
  streak_days: number;
  total_questions_answered: number;
  total_correct: number;
  accuracy: number;
  school_name?: string;
}

export interface PSATAnalysis {
  overallScore: number;
  mathScore: number;
  readingWritingScore: number;
  weakAreas: WeakArea[];
  strongAreas: string[];
  summary: string;
}

export interface WeakArea {
  category: string;
  subcategory: string;
  severity: "high" | "medium" | "low";
  description: string;
}

export interface CategoryStat {
  category: string;
  total: number;
  correct: number;
}
