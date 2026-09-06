import { getDb, sql } from './database';

export async function initializeDatabase(): Promise<void> {
  const db = getDb();

  await db.query(sql`
    CREATE TABLE IF NOT EXISTS candidate_profiles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      target_role TEXT NOT NULL,
      experience_level TEXT NOT NULL,
      skills TEXT NOT NULL DEFAULT '[]',
      years_experience REAL NOT NULL DEFAULT 0,
      target_company TEXT,
      industry TEXT,
      career_goal TEXT,
      resume_text TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  await db.query(sql`
    CREATE TABLE IF NOT EXISTS interview_sessions (
      id TEXT PRIMARY KEY,
      candidate_id TEXT NOT NULL,
      role TEXT NOT NULL,
      experience_level TEXT NOT NULL,
      interview_type TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      question_count INTEGER NOT NULL,
      interview_mode TEXT NOT NULL DEFAULT 'text',
      status TEXT NOT NULL DEFAULT 'active',
      overall_score REAL,
      started_at TEXT NOT NULL,
      completed_at TEXT
    )
  `);

  await db.query(sql`
    CREATE TABLE IF NOT EXISTS interview_questions (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      question_number INTEGER NOT NULL,
      question TEXT NOT NULL,
      topic TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      type TEXT NOT NULL
    )
  `);

  await db.query(sql`
    CREATE TABLE IF NOT EXISTS interview_answers (
      id TEXT PRIMARY KEY,
      question_id TEXT NOT NULL,
      session_id TEXT NOT NULL,
      answer TEXT NOT NULL,
      submitted_at TEXT NOT NULL
    )
  `);

  await db.query(sql`
    CREATE TABLE IF NOT EXISTS interview_evaluations (
      id TEXT PRIMARY KEY,
      question_id TEXT NOT NULL,
      session_id TEXT NOT NULL,
      technical_accuracy REAL NOT NULL DEFAULT 0,
      relevance REAL NOT NULL DEFAULT 0,
      clarity REAL NOT NULL DEFAULT 0,
      completeness REAL NOT NULL DEFAULT 0,
      communication REAL NOT NULL DEFAULT 0,
      overall_score REAL NOT NULL DEFAULT 0,
      strengths TEXT NOT NULL DEFAULT '[]',
      improvements TEXT NOT NULL DEFAULT '[]',
      suggestions TEXT NOT NULL DEFAULT '[]',
      model_answer TEXT NOT NULL DEFAULT '',
      raw_response TEXT
    )
  `);
}
