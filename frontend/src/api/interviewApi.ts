import client from './client';
import type {
  InterviewSession,
  InterviewQuestion,
  Evaluation,
  InterviewType,
  Difficulty,
  InterviewMode,
  ExperienceLevel,
} from '../types';

export interface StartSessionPayload {
  candidateId: string;
  role: string;
  experienceLevel: ExperienceLevel;
  interviewType: InterviewType;
  difficulty: Difficulty;
  questionCount: number;
  interviewMode?: InterviewMode;
}

export interface EvaluateAnswerResponse {
  answer: { id: string; questionId: string; answer: string; submittedAt: string };
  evaluation: Evaluation;
}

export interface SessionSummaryResponse {
  sessionId: string;
  overallScore: number;
  categoryAverages: Record<string, number>;
  strongAreas: string[];
  weakAreas: string[];
  recommendations: string[];
  readinessSummary: string;
  questions: InterviewQuestion[];
  answers: { questionId: string; answer: string }[];
  evaluations: Evaluation[];
}

export async function startSession(data: StartSessionPayload): Promise<InterviewSession> {
  const response = await client.post<InterviewSession>('/interview/start', data);
  return response.data;
}

export async function getNextQuestion(sessionId: string, questionNumber: number): Promise<InterviewQuestion> {
  const response = await client.post<InterviewQuestion>('/interview/question', { sessionId, questionNumber });
  return response.data;
}

export async function evaluateAnswer(
  sessionId: string,
  questionId: string,
  answer: string
): Promise<EvaluateAnswerResponse> {
  const response = await client.post<EvaluateAnswerResponse>('/interview/evaluate', {
    sessionId,
    questionId,
    answer,
  });
  return response.data;
}

export async function getModelAnswer(
  sessionId: string,
  questionId: string
): Promise<{ modelAnswer: string; keyPoints: string[]; tips: string[] }> {
  const response = await client.post('/interview/model-answer', { sessionId, questionId });
  return response.data;
}

export async function generateSummary(sessionId: string): Promise<SessionSummaryResponse> {
  const response = await client.post<SessionSummaryResponse>('/interview/summary', { sessionId });
  return response.data;
}

export async function getAllSessions(): Promise<InterviewSession[]> {
  const response = await client.get<InterviewSession[]>('/interviews');
  return response.data;
}

export async function getSessionDetail(id: string): Promise<InterviewSession & SessionSummaryResponse> {
  const response = await client.get<InterviewSession & SessionSummaryResponse>(`/interviews/${id}`);
  return response.data;
}
