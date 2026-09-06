import { v4 as uuidv4 } from 'uuid';
import { getDb, sql } from '../database';
import { Evaluation } from '../../types';

function rowToEvaluation(row: Record<string, unknown>): Evaluation {
  return {
    id: row.id as string,
    questionId: row.question_id as string,
    sessionId: row.session_id as string,
    technicalAccuracy: row.technical_accuracy as number,
    relevance: row.relevance as number,
    clarity: row.clarity as number,
    completeness: row.completeness as number,
    communication: row.communication as number,
    overallScore: row.overall_score as number,
    strengths: JSON.parse((row.strengths as string) || '[]'),
    improvements: JSON.parse((row.improvements as string) || '[]'),
    suggestions: JSON.parse((row.suggestions as string) || '[]'),
    modelAnswer: row.model_answer as string,
    rawResponse: (row.raw_response as string) || undefined,
  };
}

export async function saveEvaluation(data: Omit<Evaluation, 'id'>): Promise<Evaluation> {
  const db = getDb();
  const id = uuidv4();
  await db.query(sql`
    INSERT INTO interview_evaluations
      (id, question_id, session_id, technical_accuracy, relevance, clarity,
       completeness, communication, overall_score, strengths, improvements,
       suggestions, model_answer, raw_response)
    VALUES (
      ${id}, ${data.questionId}, ${data.sessionId},
      ${data.technicalAccuracy}, ${data.relevance}, ${data.clarity},
      ${data.completeness}, ${data.communication}, ${data.overallScore},
      ${JSON.stringify(data.strengths)},
      ${JSON.stringify(data.improvements)},
      ${JSON.stringify(data.suggestions)},
      ${data.modelAnswer},
      ${data.rawResponse || null}
    )
  `);
  return { ...data, id };
}

export async function getEvaluationsBySession(sessionId: string): Promise<Evaluation[]> {
  const db = getDb();
  const rows = await db.query(sql`SELECT * FROM interview_evaluations WHERE session_id = ${sessionId}`) as Record<string, unknown>[];
  return rows.map(rowToEvaluation);
}

export async function getEvaluationByQuestionId(questionId: string): Promise<Evaluation | null> {
  const db = getDb();
  const rows = await db.query(sql`SELECT * FROM interview_evaluations WHERE question_id = ${questionId}`) as Record<string, unknown>[];
  return rows.length > 0 ? rowToEvaluation(rows[0]) : null;
}
