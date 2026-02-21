import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(__dirname, "../../data/satprep.db");

export function initDb(): Database.Database {
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS schools (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      zip TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      display_name TEXT NOT NULL,
      school_id INTEGER REFERENCES schools(id),
      xp INTEGER DEFAULT 0,
      level INTEGER DEFAULT 1,
      streak_days INTEGER DEFAULT 0,
      last_practice_date TEXT,
      total_questions_answered INTEGER DEFAULT 0,
      total_correct INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS psat_analyses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL REFERENCES users(id),
      raw_analysis TEXT NOT NULL,
      weak_areas TEXT NOT NULL,
      strong_areas TEXT NOT NULL,
      overall_score INTEGER,
      math_score INTEGER,
      reading_writing_score INTEGER,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS practice_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL REFERENCES users(id),
      category TEXT NOT NULL,
      total_questions INTEGER NOT NULL,
      correct_answers INTEGER NOT NULL,
      xp_earned INTEGER NOT NULL,
      time_seconds INTEGER,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS questions_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL REFERENCES users(id),
      session_id INTEGER REFERENCES practice_sessions(id),
      question_text TEXT NOT NULL,
      options TEXT NOT NULL,
      correct_answer TEXT NOT NULL,
      user_answer TEXT,
      category TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      is_correct INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL REFERENCES users(id),
      achievement_key TEXT NOT NULL,
      unlocked_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, achievement_key)
    );

    CREATE INDEX IF NOT EXISTS idx_users_school ON users(school_id);
    CREATE INDEX IF NOT EXISTS idx_users_xp ON users(xp DESC);
    CREATE INDEX IF NOT EXISTS idx_practice_sessions_user ON practice_sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_schools_zip ON schools(zip);
  `);

  return db;
}
