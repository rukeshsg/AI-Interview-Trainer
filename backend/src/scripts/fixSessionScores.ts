import { getDb, sql } from '../db/database';

async function fix() {
  const db = getDb();
  const evals = (await db.query(sql`SELECT session_id, overall_score FROM interview_evaluations`)) as Array<{ session_id: string; overall_score: number }>;
  console.log('Found evaluations count:', evals.length);

  const bySession: Record<string, number[]> = {};
  for (const e of evals) {
    if (!bySession[e.session_id]) bySession[e.session_id] = [];
    bySession[e.session_id].push(e.overall_score);
  }

  for (const [sId, scores] of Object.entries(bySession)) {
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const roundedScore = Math.round(avg * 10) / 10;
    console.log(`Setting session ${sId} score to ${roundedScore} (from ${scores.length} evaluations)`);
    await db.query(sql`UPDATE interview_sessions SET overall_score = ${roundedScore}, status = 'completed' WHERE id = ${sId}`);
  }

  const allSessions = await db.query(sql`SELECT id, status, overall_score FROM interview_sessions`);
  console.log('Current interview sessions:', allSessions);
  console.log('Done recalculating session scores!');
}

fix().catch(err => {
  console.error('Error fixing scores:', err);
});
