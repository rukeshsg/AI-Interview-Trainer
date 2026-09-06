import { getDb, sql } from '../db/database';

async function check() {
  const db = getDb();
  const session = await db.query(sql`SELECT * FROM interview_sessions WHERE id LIKE 'daf72cdf%'`);
  console.log('Session:', JSON.stringify(session, null, 2));
  const questions = await db.query(sql`SELECT * FROM interview_questions WHERE session_id LIKE 'daf72cdf%'`);
  console.log('Questions:', JSON.stringify(questions, null, 2));
  const answers = await db.query(sql`SELECT * FROM interview_answers WHERE session_id LIKE 'daf72cdf%'`);
  console.log('Answers:', JSON.stringify(answers, null, 2));
  const evals = await db.query(sql`SELECT * FROM interview_evaluations WHERE session_id LIKE 'daf72cdf%'`);
  console.log('Evaluations:', JSON.stringify(evals, null, 2));
}

check().catch(console.error);
