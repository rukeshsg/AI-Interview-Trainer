// Shared TypeScript types — mirrors backend/src/types/index.ts

export type ExperienceLevel = 'fresher' | 'entry' | 'intermediate' | 'experienced';
export type InterviewType = 'technical' | 'hr' | 'behavioral' | 'mixed';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'adaptive';
export type QuestionType = 'technical' | 'hr' | 'behavioral';
export type SessionStatus = 'active' | 'completed' | 'abandoned';
export type InterviewMode = 'text' | 'voice';

export interface CandidateProfile {
  id: string;
  name: string;
  targetRole: string;
  experienceLevel: ExperienceLevel;
  skills: string[];
  yearsExperience: number;
  targetCompany?: string;
  industry?: string;
  careerGoal?: string;
  resumeText?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewConfig {
  interviewType: InterviewType;
  difficulty: Difficulty;
  questionCount: number;
  interviewMode: InterviewMode;
  useResumeContext: boolean;
  showModelAnswers: boolean;
}

export interface InterviewQuestion {
  id: string;
  sessionId: string;
  questionNumber: number;
  question: string;
  topic: string;
  difficulty: Difficulty;
  type: QuestionType;
}

export interface InterviewAnswer {
  id: string;
  questionId: string;
  sessionId: string;
  answer: string;
  submittedAt: string;
}

export interface Evaluation {
  id: string;
  questionId: string;
  sessionId: string;
  technicalAccuracy: number;
  relevance: number;
  clarity: number;
  completeness: number;
  communication: number;
  overallScore: number;
  strengths: string[];
  improvements: string[];
  suggestions: string[];
  modelAnswer: string;
}

export interface InterviewSession {
  id: string;
  candidateId: string;
  role: string;
  experienceLevel: ExperienceLevel;
  interviewType: InterviewType;
  difficulty: Difficulty;
  questionCount: number;
  interviewMode: InterviewMode;
  status: SessionStatus;
  overallScore?: number;
  startedAt: string;
  completedAt?: string;
  profile?: CandidateProfile;
  questions?: InterviewQuestion[];
  answers?: InterviewAnswer[];
  evaluations?: Evaluation[];
  categoryAverages?: CategoryAverages;
  strongAreas?: string[];
  weakAreas?: string[];
  recommendations?: string[];
  readinessSummary?: string;
}

export interface CategoryAverages {
  technicalAccuracy: number;
  relevance: number;
  clarity: number;
  completeness: number;
  communication: number;
}

export interface ResumeData {
  skills: string[];
  experience: string[];
  education: string[];
  projects: string[];
  certifications: string[];
  rawText: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AppState {
  profile: CandidateProfile | null;
  resumeData: ResumeData | null;
  currentSession: InterviewSession | null;
}
