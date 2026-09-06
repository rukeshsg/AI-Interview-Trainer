import { v4 as uuidv4 } from 'uuid';
import { getDb, sql } from '../database';
import { InterviewQuestion, Difficulty, QuestionType } from '../../types';

function rowToQuestion(row: Record<string, unknown>): InterviewQuestion {
  return {
    id: row.id as string,
    sessionId: row.session_id as string,
    questionNumber: row.question_number as number,
    question: row.question as string,
    topic: row.topic as string,
    difficulty: row.difficulty as Difficulty,
    type: row.type as QuestionType,
  };
}

export async function saveQuestion(question: Omit<InterviewQuestion, 'id'>): Promise<InterviewQuestion> {
  const db = getDb();
  const id = uuidv4();
  await db.query(sql`
    INSERT INTO interview_questions
      (id, session_id, question_number, question, topic, difficulty, type)
    VALUES (${id}, ${question.sessionId}, ${question.questionNumber}, ${question.question}, ${question.topic}, ${question.difficulty}, ${question.type})
  `);
  return { ...question, id };
}

export async function saveQuestions(questions: Omit<InterviewQuestion, 'id'>[]): Promise<InterviewQuestion[]> {
  const saved: InterviewQuestion[] = [];
  for (const q of questions) {
    saved.push(await saveQuestion(q));
  }
  return saved;
}

export async function getQuestionsBySession(sessionId: string): Promise<InterviewQuestion[]> {
  const db = getDb();
  const rows = await db.query(sql`SELECT * FROM interview_questions WHERE session_id = ${sessionId} ORDER BY question_number ASC`) as Record<string, unknown>[];
  return rows.map(rowToQuestion);
}

export async function getQuestionById(id: string): Promise<InterviewQuestion | null> {
  const db = getDb();
  const rows = await db.query(sql`SELECT * FROM interview_questions WHERE id = ${id}`) as Record<string, unknown>[];
  return rows.length > 0 ? rowToQuestion(rows[0]) : null;
}
