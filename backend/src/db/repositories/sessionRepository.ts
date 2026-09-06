import { v4 as uuidv4 } from 'uuid';
import { getDb, sql } from '../database';
import {
  InterviewSession, ExperienceLevel, InterviewType, Difficulty, SessionStatus, InterviewMode
} from '../../types';

function rowToSession(row: Record<string, unknown>): InterviewSession {
  return {
    id: row.id as string,
    candidateId: row.candidate_id as string,
    role: row.role as string,
    experienceLevel: row.experience_level as ExperienceLevel,
    interviewType: row.interview_type as InterviewType,
    difficulty: row.difficulty as Difficulty,
    questionCount: row.question_count as number,
    interviewMode: (row.interview_mode as InterviewMode) || 'text',
    status: row.status as SessionStatus,
    overallScore: row.overall_score != null ? (row.overall_score as number) : undefined,
    startedAt: row.started_at as string,
    completedAt: (row.completed_at as string) || undefined,
  };
}

export async function createSession(data: {
  candidateId: string;
  role: string;
  experienceLevel: ExperienceLevel;
  interviewType: InterviewType;
  difficulty: Difficulty;
  questionCount: number;
  interviewMode: InterviewMode;
}): Promise<InterviewSession> {
  const db = getDb();
  const id = uuidv4();
  const now = new Date().toISOString();

  await db.query(sql`
    INSERT INTO interview_sessions
      (id, candidate_id, role, experience_level, interview_type, difficulty,
       question_count, interview_mode, status, started_at)
    VALUES (
      ${id}, ${data.candidateId}, ${data.role}, ${data.experienceLevel},
      ${data.interviewType}, ${data.difficulty}, ${data.questionCount},
      ${data.interviewMode}, 'active', ${now}
    )
  `);

  return (await getSessionById(id))!;
}

export async function getSessionById(id: string): Promise<InterviewSession | null> {
  const db = getDb();
  const rows = await db.query(sql`SELECT * FROM interview_sessions WHERE id = ${id}`) as Record<string, unknown>[];
  return rows.length > 0 ? rowToSession(rows[0]) : null;
}

export async function updateSession(id: string, data: Partial<Pick<InterviewSession, 'status' | 'overallScore' | 'completedAt'>>): Promise<InterviewSession | null> {
  const db = getDb();
  const existing = await getSessionById(id);
  if (!existing) return null;

  await db.query(sql`
    UPDATE interview_sessions SET
      status = ${data.status ?? existing.status},
      overall_score = ${data.overallScore ?? existing.overallScore ?? null},
      completed_at = ${data.completedAt ?? existing.completedAt ?? null}
    WHERE id = ${id}
  `);

  return getSessionById(id);
}

export async function getSessionsByProfile(candidateId: string): Promise<InterviewSession[]> {
  const db = getDb();
  const rows = await db.query(sql`SELECT * FROM interview_sessions WHERE candidate_id = ${candidateId} ORDER BY started_at DESC`) as Record<string, unknown>[];
  return rows.map(rowToSession);
}

export async function getAllSessions(): Promise<InterviewSession[]> {
  const db = getDb();
  const rows = await db.query(sql`SELECT * FROM interview_sessions ORDER BY started_at DESC`) as Record<string, unknown>[];
  return rows.map(rowToSession);
}
