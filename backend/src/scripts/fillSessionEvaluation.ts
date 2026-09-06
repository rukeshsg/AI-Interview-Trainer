import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config();

import { getDb, sql } from '../db/database';
import { orchestrateService } from '../services/orchestrateService';
import { calculateOverallScore, calculateCategoryAverages } from '../utils/scoreCalculator';
import { getProfileById } from '../db/repositories/profileRepository';
import { getQuestionsBySession } from '../db/repositories/questionRepository';
import { getAnswersBySession, saveAnswer } from '../db/repositories/answerRepository';
import { getEvaluationsBySession, saveEvaluation } from '../db/repositories/evaluationRepository';
import { updateSession } from '../db/repositories/sessionRepository';

async function fillSession() {
  const sessionId = 'daf72cdf-2a66-4aaf-9819-a90bbfc96909';
  const db = getDb();

  const sessions = (await db.query(sql`SELECT * FROM interview_sessions WHERE id = ${sessionId}`)) as any[];
  if (sessions.length === 0) {
    console.log('Session not found');
    return;
  }
  const session = sessions[0];
  const profile = (await getProfileById(session.candidate_id)) || {
    id: session.candidate_id,
    name: 'RUKESH S G',
    targetRole: 'Machine learning engineer',
    experienceLevel: 'fresher',
    skills: ['Python', 'TensorFlow', 'PyTorch', 'Scikit-Learn', 'Deep Learning'],
  };

  const questions = await getQuestionsBySession(sessionId);
  if (questions.length === 0) {
    console.log('No questions found');
    return;
  }

  const q = questions[0];
  console.log('Evaluating Question 1:', q.question);

  const candidateAnswer = `During my final year project, our team of four had a strict 3-week deadline to build and deploy an end-to-end customer churn prediction pipeline with MLflow and FastAPI. My specific role was data preprocessing, feature engineering, and model training using XGBoost and LightGBM. When we hit performance bottlenecks on large CSVs, I refactored the pipeline using Polars and optimized hyperparameter tuning with Optuna, reducing training time from 45 minutes to 8 minutes. I held daily 15-minute syncs with our frontend teammate to lock down API request/response schemas early. We delivered the project two days before the deadline with an 89% ROC-AUC score. I learned how proactive communication and modular code prevent last-minute integration bottlenecks.`;

  // Save the answer
  const savedAnswer = await saveAnswer({
    questionId: q.id,
    sessionId: session.id,
    answer: candidateAnswer,
    submittedAt: new Date().toISOString(),
  });
  console.log('Saved answer:', savedAnswer.id);

  // Evaluate via IBM Agent
  console.log('Calling IBM watsonx Orchestrate to evaluate answer...');
  const evalData = await orchestrateService.evaluateAnswer({
    sessionId,
    question: q,
    answer: candidateAnswer,
    candidateProfile: {
      name: profile.name,
      targetRole: session.role,
      experienceLevel: session.experience_level,
      skills: profile.skills,
    },
  });

  const evaluation = await saveEvaluation(evalData);
  console.log('Saved evaluation overall score:', evaluation.overallScore);
  console.log('Evaluation rubrics:', {
    technicalAccuracy: evaluation.technicalAccuracy,
    relevance: evaluation.relevance,
    clarity: evaluation.clarity,
    completeness: evaluation.completeness,
    communication: evaluation.communication,
  });

  const allQuestions = await getQuestionsBySession(sessionId);
  const allAnswers = await getAnswersBySession(sessionId);
  const allEvals = await getEvaluationsBySession(sessionId);

  const overallScore = calculateOverallScore(allEvals);
  const categoryAverages = calculateCategoryAverages(allEvals);

  const qAndA = allQuestions.map((ques: any) => {
    const ans = allAnswers.find((a: any) => a.questionId === ques.id);
    const ev = allEvals.find((e: any) => e.questionId === ques.id);
    return {
      question: ques.question,
      answer: ans?.answer || '',
      score: ev?.overallScore || 0,
    };
  });

  console.log('Calling IBM watsonx Orchestrate to generate final report summary...');
  const summaryData = await orchestrateService.generateFinalSummary({
    candidateName: profile.name,
    targetRole: session.role,
    experienceLevel: session.experience_level,
    questionsAndAnswers: qAndA,
    categoryAverages: categoryAverages as unknown as Record<string, number>,
    overallScore,
    sessionId,
  });

  await updateSession(sessionId, {
    status: 'completed',
    overallScore,
    completedAt: new Date().toISOString(),
  });

  console.log('Session updated to completed with overallScore:', overallScore);
  console.log('Final Summary generated successfully!');
}

fillSession().catch(console.error);
