import { v4 as uuidv4 } from 'uuid';
import { getDb, sql } from '../database';
import { InterviewAnswer } from '../../types';

function rowToAnswer(row: Record<string, unknown>): InterviewAnswer {
  return {
    id: row.id as string,
    questionId: row.question_id as string,
    sessionId: row.session_id as string,
    answer: row.answer as string,
    submittedAt: row.submitted_at as string,
  };
}

export async function saveAnswer(data: Omit<InterviewAnswer, 'id'>): Promise<InterviewAnswer> {
  const db = getDb();
  const id = uuidv4();
  await db.query(sql`
    INSERT INTO interview_answers (id, question_id, session_id, answer, submitted_at)
    VALUES (${id}, ${data.questionId}, ${data.sessionId}, ${data.answer}, ${data.submittedAt})
  `);
  return { ...data, id };
}

export async function getAnswersBySession(sessionId: string): Promise<InterviewAnswer[]> {
  const db = getDb();
  const rows = await db.query(sql`SELECT * FROM interview_answers WHERE session_id = ${sessionId} ORDER BY submitted_at ASC`) as Record<string, unknown>[];
  return rows.map(rowToAnswer);
}

export async function getAnswerByQuestionId(questionId: string): Promise<InterviewAnswer | null> {
  const db = getDb();
  const rows = await db.query(sql`SELECT * FROM interview_answers WHERE question_id = ${questionId}`) as Record<string, unknown>[];
  return rows.length > 0 ? rowToAnswer(rows[0]) : null;
}
