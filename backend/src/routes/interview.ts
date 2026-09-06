import { Router, Request, Response, NextFunction } from 'express';
import { validateBody } from '../middleware/validateRequest';
import { createError } from '../middleware/errorHandler';
import { createSession, getSessionById, updateSession, getAllSessions } from '../db/repositories/sessionRepository';
import { saveQuestion, getQuestionsBySession, getQuestionById } from '../db/repositories/questionRepository';
import { saveAnswer, getAnswersBySession } from '../db/repositories/answerRepository';
import { saveEvaluation, getEvaluationsBySession } from '../db/repositories/evaluationRepository';
import { getProfileById } from '../db/repositories/profileRepository';
import { orchestrateService } from '../services/orchestrateService';
import { calculateCategoryAverages, calculateOverallScore } from '../utils/scoreCalculator';
import { InterviewType, Difficulty, InterviewMode, ExperienceLevel, GenerateQuestionsParams, EvaluateAnswerParams } from '../types';

const router = Router();

// POST /api/interview/start — create a new session
router.post(
  '/start',
  validateBody([
    { field: 'candidateId', type: 'string', required: true },
    { field: 'role', type: 'string', required: true },
    { field: 'experienceLevel', type: 'string', required: true, enum: ['fresher', 'entry', 'intermediate', 'experienced'] },
    { field: 'interviewType', type: 'string', required: true, enum: ['technical', 'hr', 'behavioral', 'mixed'] },
    { field: 'difficulty', type: 'string', required: true, enum: ['easy', 'medium', 'hard', 'adaptive'] },
    { field: 'questionCount', type: 'number', required: true },
    { field: 'interviewMode', type: 'string', required: false, enum: ['text', 'voice'] },
  ]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { candidateId, role, experienceLevel, interviewType, difficulty, questionCount, interviewMode = 'text' } = req.body;

      const profile = await getProfileById(candidateId);
      if (!profile) {
        throw createError('Candidate profile not found', 404, 'PROFILE_NOT_FOUND');
      }

      const session = await createSession({
        candidateId,
        role,
        experienceLevel: experienceLevel as ExperienceLevel,
        interviewType: interviewType as InterviewType,
        difficulty: difficulty as Difficulty,
        questionCount: Math.min(15, Math.max(1, questionCount)),
        interviewMode: (interviewMode || 'text') as InterviewMode,
      });

      res.status(201).json(session);
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/interview/question — get the next question
router.post(
  '/question',
  validateBody([
    { field: 'sessionId', type: 'string', required: true },
    { field: 'questionNumber', type: 'number', required: true },
  ]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sessionId, questionNumber } = req.body;

      const session = await getSessionById(sessionId);
      if (!session) throw createError('Session not found', 404, 'SESSION_NOT_FOUND');
      if (session.status !== 'active') throw createError('Session is not active', 400, 'SESSION_INACTIVE');

      const profile = await getProfileById(session.candidateId);
      if (!profile) throw createError('Profile not found', 404, 'PROFILE_NOT_FOUND');

      // Check if question already generated
      const existingQuestions = await getQuestionsBySession(sessionId);
      const existing = existingQuestions.find((q) => q.questionNumber === questionNumber);
      if (existing) {
        return res.json(existing);
      }

      // Build difficulty for this question
      let effectiveDifficulty: Difficulty = session.difficulty;
      if (session.difficulty === 'adaptive') {
        const progress = questionNumber / session.questionCount;
        effectiveDifficulty = progress < 0.3 ? 'easy' : progress < 0.7 ? 'medium' : 'hard';
      }

      // Generate one new question from the IBM agent
      const params: GenerateQuestionsParams = {
        sessionId,
        candidateName: profile.name,
        targetRole: session.role,
        experienceLevel: session.experienceLevel,
        skills: profile.skills,
        interviewType: session.interviewType,
        difficulty: effectiveDifficulty,
        questionCount: 1,
        resumeContext: profile.resumeText,
        targetCompany: profile.targetCompany,
      };

      const questions = await orchestrateService.generateQuestions(params);
      const q = questions[0];

      if (!q) throw createError('Failed to generate question', 500, 'GENERATION_FAILED');

      q.sessionId = sessionId;
      q.questionNumber = questionNumber;

      const saved = await saveQuestion(q);
      return res.json(saved);
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/interview/evaluate — submit answer and get evaluation
router.post(
  '/evaluate',
  validateBody([
    { field: 'sessionId', type: 'string', required: true },
    { field: 'questionId', type: 'string', required: true },
    { field: 'answer', type: 'string', required: true, minLength: 1 },
  ]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sessionId, questionId, answer } = req.body;

      const session = await getSessionById(sessionId);
      if (!session) throw createError('Session not found', 404, 'SESSION_NOT_FOUND');

      const question = await getQuestionById(questionId);
      if (!question || question.sessionId !== sessionId) {
        throw createError('Question not found in this session', 404, 'QUESTION_NOT_FOUND');
      }

      const profile = await getProfileById(session.candidateId);
      if (!profile) throw createError('Profile not found', 404, 'PROFILE_NOT_FOUND');

      // Save the answer
      const savedAnswer = await saveAnswer({
        questionId,
        sessionId,
        answer: answer.trim(),
        submittedAt: new Date().toISOString(),
      });

      // Evaluate via IBM agent
      const params: EvaluateAnswerParams = {
        sessionId,
        question,
        answer: answer.trim(),
        candidateProfile: {
          name: profile.name,
          targetRole: session.role,
          experienceLevel: session.experienceLevel,
          skills: profile.skills,
        },
      };

      const evalData = await orchestrateService.evaluateAnswer(params);
      const evaluation = await saveEvaluation(evalData);

      // Update session's running overall score so dashboard and history reflect scores in real time
      const sessionEvals = await getEvaluationsBySession(sessionId);
      if (sessionEvals.length > 0) {
        const runningScore = calculateOverallScore(sessionEvals);
        await updateSession(sessionId, { overallScore: runningScore });
      }

      res.json({ answer: savedAnswer, evaluation });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/interview/model-answer
router.post(
  '/model-answer',
  validateBody([
    { field: 'sessionId', type: 'string', required: true },
    { field: 'questionId', type: 'string', required: true },
  ]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sessionId, questionId } = req.body;

      const session = await getSessionById(sessionId);
      if (!session) throw createError('Session not found', 404, 'SESSION_NOT_FOUND');

      const question = await getQuestionById(questionId);
      if (!question) throw createError('Question not found', 404, 'QUESTION_NOT_FOUND');

      const result = await orchestrateService.getModelAnswer({
        question,
        targetRole: session.role,
        experienceLevel: session.experienceLevel,
      });

      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/interview/summary — finalize session
router.post(
  '/summary',
  validateBody([
    { field: 'sessionId', type: 'string', required: true },
  ]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sessionId } = req.body;

      const session = await getSessionById(sessionId);
      if (!session) throw createError('Session not found', 404, 'SESSION_NOT_FOUND');

      const profile = await getProfileById(session.candidateId);
      if (!profile) throw createError('Profile not found', 404, 'PROFILE_NOT_FOUND');

      const questions = await getQuestionsBySession(sessionId);
      const answers = await getAnswersBySession(sessionId);
      const evaluations = await getEvaluationsBySession(sessionId);

      const overallScore = calculateOverallScore(evaluations);
      const categoryAverages = calculateCategoryAverages(evaluations);

      const questionsAndAnswers = questions.map((q) => {
        const answer = answers.find((a) => a.questionId === q.id);
        const evaluation = evaluations.find((e) => e.questionId === q.id);
        return {
          question: q.question,
          answer: answer?.answer || '',
          score: evaluation?.overallScore || 0,
        };
      });

      const summaryData = await orchestrateService.generateFinalSummary({
        candidateName: profile.name,
        targetRole: session.role,
        experienceLevel: session.experienceLevel,
        questionsAndAnswers,
        categoryAverages: categoryAverages as unknown as Record<string, number>,
        overallScore,
        sessionId,
      });

      await updateSession(sessionId, {
        status: 'completed',
        overallScore,
        completedAt: new Date().toISOString(),
      });

      res.json({
        sessionId,
        overallScore,
        categoryAverages,
        ...summaryData,
        questions,
        answers,
        evaluations,
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/interviews — list all sessions
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessions = await getAllSessions();
    res.json(sessions);
  } catch (err) {
    next(err);
  }
});

// GET /api/interviews/:id — get full session detail
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = await getSessionById(req.params.id);
    if (!session) throw createError('Session not found', 404, 'SESSION_NOT_FOUND');

    const [profile, questions, answers, evaluations] = await Promise.all([
      getProfileById(session.candidateId),
      getQuestionsBySession(req.params.id),
      getAnswersBySession(req.params.id),
      getEvaluationsBySession(req.params.id),
    ]);

    const overallScore = evaluations.length > 0 ? calculateOverallScore(evaluations) : (session.overallScore ?? 0);
    const categoryAverages = calculateCategoryAverages(evaluations);

    // Aggregate strengths, growth areas, recommendations across all question evaluations
    const strongAreas = Array.from(new Set(evaluations.flatMap((e) => e.strengths || [])));
    const weakAreas = Array.from(new Set(evaluations.flatMap((e) => e.improvements || [])));
    const recommendations = Array.from(new Set(evaluations.flatMap((e) => e.suggestions || [])));

    const readinessSummary = overallScore >= 8
      ? 'Strong domain foundation and clear structured communication. Demonstrated high proficiency.'
      : overallScore >= 6
      ? 'Solid fundamental knowledge with opportunities to provide more concrete metrics and depth in real-world scenarios.'
      : 'Requires focused practice on foundational principles, structured STAR answering, and role-specific depth.';

    res.json({
      ...session,
      profile,
      questions,
      answers,
      evaluations,
      overallScore,
      categoryAverages,
      strongAreas: strongAreas.length > 0 ? strongAreas : ['Structured responses', 'Clear communication'],
      weakAreas: weakAreas.length > 0 ? weakAreas : ['Incorporate more quantitative metrics'],
      recommendations: recommendations.length > 0 ? recommendations : ['Practice timed behavioral questions'],
      readinessSummary,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
