import axios from 'axios';
import {
  GenerateQuestionsParams,
  EvaluateAnswerParams,
  ModelAnswerParams,
  ChatParams,
  InterviewQuestion,
  Evaluation,
  InterviewType,
  SessionSummary,
  ExperienceLevel,
} from '../types';
import {
  buildGenerateQuestionsPrompt,
  buildEvaluateAnswerPrompt,
  buildModelAnswerPrompt,
  buildChatPrompt,
  buildPreparationStrategyPrompt,
  buildFinalSummaryPrompt,
} from '../utils/promptBuilder';

// ────────────────────────────────────────────────────────────────────────────
// IBM Config helpers — read from process.env at call time (not module load)
// ────────────────────────────────────────────────────────────────────────────
function ibmConfig() {
  return {
    baseUrl:        process.env.IBM_ORCHESTRATE_BASE_URL || '',
    apiKey:         process.env.IBM_ORCHESTRATE_API_KEY  || '',
    agentId:        process.env.IBM_ORCHESTRATE_AGENT_ID || '',
    agentEnvId:     process.env.IBM_ORCHESTRATE_AGENT_ENV_ID || '',
    environment:    process.env.IBM_ORCHESTRATE_ENVIRONMENT || 'live',
    version:        process.env.IBM_ORCHESTRATE_AGENT_VERSION || 'v2.0',
    hostUrl:        process.env.IBM_ORCHESTRATE_HOST_URL || 'https://jp-tok.watson-orchestrate.cloud.ibm.com',
    orchestrationId: process.env.IBM_ORCHESTRATE_ORCHESTRATION_ID || '',
  };
}

// ────────────────────────────────────────────────────────────────────────────
// IBM watsonx Orchestrate agent response types
// ────────────────────────────────────────────────────────────────────────────
interface AgentMessage {
  id?: string;
  object?: string;
  choices?: Array<{
    index?: number;
    message?: {
      role?: string;
      content?: string;
    };
    delta?: {
      role?: string;
      content?: string;
    };
    text?: string;
  }>;
  output?: {
    generic?: Array<{
      response_type?: string;
      text?: string;
    }>;
  };
  result?: string;
  content?: string;
  text?: string;
  message?: string | { content?: string };
  response?: {
    text?: string;
    output?: string;
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Configuration validation
// ────────────────────────────────────────────────────────────────────────────
function validateConfig(): void {
  const mockMode = process.env.ENABLE_MOCK_AI === 'true';
  if (mockMode) return;

  const cfg = ibmConfig();
  const missing: string[] = [];
  if (!cfg.baseUrl)  missing.push('IBM_ORCHESTRATE_BASE_URL');
  if (!cfg.apiKey)   missing.push('IBM_ORCHESTRATE_API_KEY');
  if (!cfg.agentId)  missing.push('IBM_ORCHESTRATE_AGENT_ID');

  if (missing.length > 0) {
    throw new Error(
      `IBM watsonx Orchestrate configuration is incomplete. Missing: ${missing.join(', ')}. ` +
      `Set these in your .env file or set ENABLE_MOCK_AI=true for development mode.`
    );
  }
}

// ────────────────────────────────────────────────────────────────────────────
// IBM IAM Token Management
// ────────────────────────────────────────────────────────────────────────────
let cachedToken: string | null = null;
let tokenExpiry: number = 0;

export async function getIBMToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && now < tokenExpiry) return cachedToken;

  const apiKey = process.env.IBM_ORCHESTRATE_API_KEY;
  if (!apiKey) throw new Error('IBM_ORCHESTRATE_API_KEY not configured');

  try {
    const response = await axios.post(
      'https://iam.cloud.ibm.com/identity/token',
      new URLSearchParams({
        grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
        apikey: apiKey,
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 15000,
      }
    );

    cachedToken = response.data.access_token as string;
    tokenExpiry = now + 50 * 60 * 1000; // cache 50 min
    return cachedToken;
  } catch (error: unknown) {
    console.error('[IBM] Failed to obtain IAM token:', (error as Error).message);
    throw new Error('Failed to authenticate with IBM Cloud. Please check your API key configuration.');
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Agent Health & Connectivity Check
// ────────────────────────────────────────────────────────────────────────────
let lastHealthCheck: { reachable: boolean; timestamp: number } | null = null;

export async function checkAgentHealth(): Promise<{
  configured: boolean;
  reachable: boolean;
  mockMode: boolean;
  agent?: {
    id: string;
    version: string;
    environment: string;
  };
}> {
  const mockMode = process.env.ENABLE_MOCK_AI === 'true';
  const cfg = ibmConfig();
  const isConfigured = Boolean(cfg.baseUrl && cfg.apiKey && cfg.agentId);

  if (mockMode) {
    return {
      configured: isConfigured,
      reachable: true,
      mockMode: true,
      agent: {
        id: cfg.agentId || 'mock-agent',
        version: cfg.version,
        environment: 'mock',
      },
    };
  }

  if (!isConfigured) {
    return {
      configured: false,
      reachable: false,
      mockMode: false,
    };
  }

  // Cache reachability for 30 seconds to avoid excessive network requests
  const now = Date.now();
  if (lastHealthCheck && now - lastHealthCheck.timestamp < 30000) {
    return {
      configured: true,
      reachable: lastHealthCheck.reachable,
      mockMode: false,
      agent: {
        id: cfg.agentId,
        version: cfg.version,
        environment: cfg.environment,
      },
    };
  }

  try {
    const token = await getIBMToken();
    const cleanBase = cfg.baseUrl.replace(/\/$/, '');
    const checkUrl = `${cleanBase}/v1/orchestrate/agents/${cfg.agentId}`;

    const res = await axios.get(checkUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: 8000,
    });

    const isReachable = res.status === 200;
    lastHealthCheck = { reachable: isReachable, timestamp: now };

    return {
      configured: true,
      reachable: isReachable,
      mockMode: false,
      agent: {
        id: cfg.agentId,
        version: cfg.version,
        environment: cfg.environment,
      },
    };
  } catch (error) {
    console.error('[IBM Health Check] Agent unreachable:', (error as Error).message);
    lastHealthCheck = { reachable: false, timestamp: now };
    return {
      configured: true,
      reachable: false,
      mockMode: false,
      agent: {
        id: cfg.agentId,
        version: cfg.version,
        environment: cfg.environment,
      },
    };
  }
}

// ────────────────────────────────────────────────────────────────────────────
// IBM Agent Message — communicates with the live Interview Trainer Agent
// via the verified watsonx Orchestrate chat completions endpoint.
// ────────────────────────────────────────────────────────────────────────────
export async function sendMessageToAgent(
  prompt: string,
  history?: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<string> {
  const token = await getIBMToken();
  const cfg = ibmConfig();

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const cleanBase = cfg.baseUrl.replace(/\/$/, '');
  const url = `${cleanBase}/v1/orchestrate/${cfg.agentId}/chat/completions`;

  const messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [];
  if (history && history.length > 0) {
    for (const msg of history) {
      messages.push({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content,
      });
    }
  }
  messages.push({ role: 'user', content: prompt });

  try {
    const res = await axios.post(
      url,
      {
        messages,
        stream: false,
      },
      {
        headers,
        timeout: 60000,
        responseType: 'text',
      }
    );

    return extractTextFromAgentResponse(res.data);
  } catch (error: unknown) {
    const axiosErr = error as { response?: { status?: number; data?: unknown }; message?: string };
    if (axiosErr.response) {
      const status = axiosErr.response.status;
      console.error(
        `[IBM] Agent API error HTTP ${status}:`,
        typeof axiosErr.response.data === 'object'
          ? JSON.stringify(axiosErr.response.data).substring(0, 300)
          : String(axiosErr.response.data).substring(0, 300)
      );

      if (status === 401 || status === 403) {
        cachedToken = null; // force token refresh
        tokenExpiry = 0;
        throw new Error('IBM authentication failed. Please check your API key configuration.');
      }
      if (status === 404) {
        throw new Error('IBM Interview Trainer Agent not found. Please verify the Agent ID.');
      }
      throw new Error(`IBM Interview Trainer temporarily unavailable (HTTP ${status}). Please try again.`);
    }
    throw new Error(
      'IBM Interview Trainer is temporarily unavailable. Please check your network connection and try again.'
    );
  }
}

export function extractTextFromAgentResponse(data: unknown): string {
  if (!data) return '';

  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      return extractTextFromAgentResponse(parsed);
    } catch {
      // Check for SSE stream data lines
      if (data.includes('data:')) {
        let text = '';
        const lines = data.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data:') && !trimmed.includes('[DONE]')) {
            try {
              const json = JSON.parse(trimmed.slice(5).trim());
              if (json.choices?.[0]?.delta?.content) {
                text += json.choices[0].delta.content;
              } else if (json.choices?.[0]?.message?.content) {
                text += json.choices[0].message.content;
              } else if (json.delta?.content?.[0]?.text?.value) {
                text += json.delta.content[0].text.value;
              }
            } catch {}
          }
        }
        if (text) return text;
      }
      return data;
    }
  }

  if (typeof data === 'object' && data !== null) {
    const obj = data as Record<string, any>;
    if (obj.choices && Array.isArray(obj.choices) && obj.choices.length > 0) {
      const choice = obj.choices[0];
      if (choice.message?.content) return choice.message.content;
      if (choice.delta?.content) return choice.delta.content;
      if (typeof choice.text === 'string') return choice.text;
    }
    if (obj.output?.generic && Array.isArray(obj.output.generic)) {
      const textItem = obj.output.generic.find((g: any) => g.response_type === 'text' || g.text);
      if (textItem?.text) return textItem.text;
    }
    if (obj.response?.text) return obj.response.text;
    if (obj.response?.output) return obj.response.output;
    if (typeof obj.result === 'string') return obj.result;
    if (typeof obj.content === 'string') return obj.content;
    if (typeof obj.text === 'string') return obj.text;
    if (typeof obj.message === 'string') return obj.message;
    if (typeof obj.message === 'object' && obj.message?.content) return obj.message.content;

    return JSON.stringify(data);
  }

  return String(data);
}

// ────────────────────────────────────────────────────────────────────────────
// Response Parsing
// ────────────────────────────────────────────────────────────────────────────
export function parseAgentResponse(raw: string): Record<string, unknown> {
  if (!raw || raw.trim() === '') return {};

  // 1. Try direct JSON parse
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'object' && parsed !== null) return parsed as Record<string, unknown>;
  } catch {
    // not valid JSON
  }

  // 2. Try extracting JSON from markdown code fences
  const fenceMatch = raw.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (fenceMatch) {
    try {
      const parsed = JSON.parse(fenceMatch[1].trim());
      if (typeof parsed === 'object' && parsed !== null) return parsed as Record<string, unknown>;
    } catch {
      // not valid JSON
    }
  }

  // 3. Try extracting JSON object/array from anywhere in the string
  const jsonMatch = raw.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      if (typeof parsed === 'object' && parsed !== null) {
        if (Array.isArray(parsed)) {
          return { questions: parsed };
        }
        return parsed as Record<string, unknown>;
      }
    } catch {
      // not valid JSON
    }
  }

  // 4. Return raw text under a generic key
  return { rawText: raw };
}

function parseNumber(val: unknown, fallback = 7): number {
  if (typeof val === 'number') return Math.min(10, Math.max(0, val));
  if (typeof val === 'string') {
    const n = parseFloat(val);
    if (!isNaN(n)) return Math.min(10, Math.max(0, n));
  }
  return fallback;
}

function parseStringArray(val: unknown): string[] {
  if (Array.isArray(val)) return val.filter((v) => typeof v === 'string');
  if (typeof val === 'string') return val.split('\n').filter((s) => s.trim());
  return [];
}

// ────────────────────────────────────────────────────────────────────────────
// Mock mode responses (dev-only)
// ────────────────────────────────────────────────────────────────────────────
function getMockQuestions(params: GenerateQuestionsParams): InterviewQuestion[] {
  const templates: Record<string, string[]> = {
    technical: [
      `What is ${params.skills[0] || 'object-oriented programming'} and how have you used it?`,
      `Explain the difference between synchronous and asynchronous programming.`,
      `How would you optimize a slow database query?`,
      `Describe your approach to debugging a complex bug.`,
      `What design patterns have you used in your projects?`,
      `How does version control (Git) help in team development?`,
      `Explain RESTful API design principles.`,
      `What is the difference between SQL and NoSQL databases?`,
      `How would you implement error handling in your application?`,
      `What is your approach to code review?`,
      `Explain the concept of time and space complexity.`,
      `How do you ensure your code is testable?`,
      `What is dependency injection?`,
      `Describe your experience with CI/CD pipelines.`,
      `How do you handle state management in frontend applications?`,
    ],
    hr: [
      `Tell me about yourself and your journey as a ${params.targetRole}.`,
      `What are your greatest strengths relevant to this role?`,
      `Describe a weakness you are actively working to improve.`,
      `Where do you see yourself in 5 years?`,
      `Why are you interested in this position?`,
      `How do you handle working under pressure?`,
      `Describe your ideal work environment.`,
      `How do you prioritize tasks when you have multiple deadlines?`,
      `What motivates you in your professional life?`,
      `How do you handle feedback and criticism?`,
    ],
    behavioral: [
      `Tell me about a time you had to work with a difficult team member.`,
      `Describe a situation where you failed and what you learned from it.`,
      `Give an example of a time you showed leadership.`,
      `Tell me about a time you had to meet a tight deadline.`,
      `Describe a situation where you had to adapt to a major change.`,
      `Tell me about a challenging project you completed successfully.`,
      `Describe a time you had to resolve a conflict.`,
      `Give an example of when you went above and beyond your job responsibilities.`,
      `Tell me about a time you had to learn something new quickly.`,
      `Describe a situation where you had to make a difficult decision.`,
    ],
  };

  const types = params.interviewType === 'mixed'
    ? ['technical', 'hr', 'behavioral']
    : [params.interviewType];

  const difficulties: Array<'easy' | 'medium' | 'hard'> = ['easy', 'medium', 'hard'];
  const questions: InterviewQuestion[] = [];

  for (let i = 0; i < params.questionCount; i++) {
    const type = types[i % types.length] as 'technical' | 'hr' | 'behavioral';
    const typeQuestions = templates[type] || templates.technical;
    const question = typeQuestions[i % typeQuestions.length];
    const diff = params.difficulty === 'adaptive'
      ? difficulties[Math.min(Math.floor(i / 2), 2)]
      : (params.difficulty as 'easy' | 'medium' | 'hard');

    questions.push({
      id: '',
      sessionId: params.sessionId,
      questionNumber: i + 1,
      question,
      topic: type === 'technical' ? (params.skills[0] || 'General Technical') : type === 'hr' ? 'HR' : 'Behavioral',
      difficulty: diff,
      type,
    });
  }

  return questions;
}

function getMockEvaluation(params: EvaluateAnswerParams): Omit<Evaluation, 'id'> {
  const hasContent = params.answer.length > 50;
  const baseScore = hasContent ? 7.5 : 4.0;
  const variation = (Math.random() * 2 - 1) * 1.5;
  const score = Math.min(10, Math.max(1, Math.round((baseScore + variation) * 10) / 10));

  return {
    questionId: params.question.id,
    sessionId: params.sessionId,
    technicalAccuracy: Math.min(10, Math.max(1, score + (Math.random() - 0.5))),
    relevance: Math.min(10, Math.max(1, score + (Math.random() - 0.5) * 0.5)),
    clarity: Math.min(10, Math.max(1, score + (Math.random() - 0.5))),
    completeness: Math.min(10, Math.max(1, score - (hasContent ? 0 : 2))),
    communication: Math.min(10, Math.max(1, score + (Math.random() - 0.5) * 0.8)),
    overallScore: score,
    strengths: [
      'Good attempt at addressing the question',
      hasContent ? 'Provided a detailed response' : 'Showed understanding of the topic',
    ],
    improvements: [
      'Could elaborate further with specific examples',
      'Consider using the STAR method for structured responses',
    ],
    suggestions: [
      'Practice answering with concrete examples from your experience',
      'Structure your answer: situation → action → result',
    ],
    modelAnswer: `[MOCK MODE] A strong answer to "${params.question.question}" would demonstrate clear understanding of the concept, provide specific examples, and relate the answer to the ${params.candidateProfile.targetRole} role.`,
    rawResponse: '[Development mock response]',
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Public Service Methods
// ────────────────────────────────────────────────────────────────────────────

export async function generateQuestions(params: GenerateQuestionsParams): Promise<InterviewQuestion[]> {
  validateConfig();

  if (process.env.ENABLE_MOCK_AI === 'true') {
    console.log('[MOCK] generateQuestions called');
    return getMockQuestions(params);
  }

  const prompt = buildGenerateQuestionsPrompt(params);
  const raw = await sendMessageToAgent(prompt);
  const parsed = parseAgentResponse(raw);

  // Parse questions array or single question object
  let rawQuestions: unknown[] = [];
  if (Array.isArray(parsed.questions)) {
    rawQuestions = parsed.questions;
  } else if (Array.isArray(parsed)) {
    rawQuestions = parsed;
  } else if (parsed.question) {
    rawQuestions = [parsed];
  }

  if (rawQuestions.length === 0) {
    console.warn('[IBM] Could not parse questions from agent response, using fallback');
    return [{
      id: '',
      sessionId: params.sessionId,
      questionNumber: 1,
      question: parsed.rawText ? String(parsed.rawText).substring(0, 500) : 'Tell me about yourself and your experience with ' + params.targetRole,
      topic: 'General',
      difficulty: 'medium',
      type: params.interviewType === 'mixed' ? 'hr' : params.interviewType as 'technical' | 'hr' | 'behavioral',
    }];
  }

  return rawQuestions.slice(0, params.questionCount).map((q: unknown, i) => {
    const qObj = q as Record<string, unknown>;
    return {
      id: '',
      sessionId: params.sessionId,
      questionNumber: (typeof qObj.questionNumber === 'number' ? qObj.questionNumber : i + 1),
      question: String(qObj.question || 'Interview question'),
      topic: String(qObj.topic || 'General'),
      difficulty: (['easy', 'medium', 'hard'].includes(String(qObj.difficulty)) ? qObj.difficulty : 'medium') as 'easy' | 'medium' | 'hard',
      type: (['technical', 'hr', 'behavioral'].includes(String(qObj.type)) ? qObj.type : 'technical') as 'technical' | 'hr' | 'behavioral',
    };
  });
}

export async function evaluateAnswer(params: EvaluateAnswerParams): Promise<Omit<Evaluation, 'id'>> {
  validateConfig();

  if (process.env.ENABLE_MOCK_AI === 'true') {
    console.log('[MOCK] evaluateAnswer called');
    return getMockEvaluation(params);
  }

  const prompt = buildEvaluateAnswerPrompt(params);
  const raw = await sendMessageToAgent(prompt);
  const parsed = parseAgentResponse(raw);

  return {
    questionId: params.question.id,
    sessionId: params.sessionId,
    technicalAccuracy: parseNumber(parsed.technicalAccuracy),
    relevance: parseNumber(parsed.relevance),
    clarity: parseNumber(parsed.clarity),
    completeness: parseNumber(parsed.completeness),
    communication: parseNumber(parsed.communication),
    overallScore: parseNumber(parsed.overallScore),
    strengths: parseStringArray(parsed.strengths),
    improvements: parseStringArray(parsed.improvements),
    suggestions: parseStringArray(parsed.suggestions),
    modelAnswer: String(parsed.modelAnswer || ''),
    rawResponse: raw,
  };
}

export async function getModelAnswer(params: ModelAnswerParams): Promise<{
  modelAnswer: string;
  keyPoints: string[];
  tips: string[];
}> {
  validateConfig();

  if (process.env.ENABLE_MOCK_AI === 'true') {
    return {
      modelAnswer: `[MOCK] A strong answer to "${params.question.question}" for a ${params.experienceLevel} ${params.targetRole} would cover: key concepts, practical examples, and real-world application.`,
      keyPoints: ['Understand the core concept', 'Provide specific examples', 'Relate to the target role'],
      tips: ['Use STAR method for behavioral questions', 'Be concise but complete'],
    };
  }

  const prompt = buildModelAnswerPrompt(params);
  const raw = await sendMessageToAgent(prompt);
  const parsed = parseAgentResponse(raw);

  return {
    modelAnswer: String(parsed.modelAnswer || raw),
    keyPoints: parseStringArray(parsed.keyPoints),
    tips: parseStringArray(parsed.tips),
  };
}

export async function getPreparationStrategy(params: {
  targetRole: string;
  experienceLevel: ExperienceLevel;
  skills: string[];
  interviewType: InterviewType;
  targetCompany?: string;
}): Promise<Record<string, unknown>> {
  validateConfig();

  if (process.env.ENABLE_MOCK_AI === 'true') {
    return {
      strategy: `7-day preparation plan for ${params.targetRole} (${params.experienceLevel} level) [MOCK MODE]`,
      weeklyPlan: Array.from({ length: 7 }, (_, i) => ({
        day: i + 1,
        focus: ['Resume & Profile', 'Technical Concepts', 'Practice Questions', 'Mock Interview', 'Behavioral Stories', 'Company Research', 'Final Revision'][i],
        activities: ['Study key concepts', 'Practice with questions'],
        tips: ['Take notes', 'Review daily'],
      })),
      keyAreas: params.skills.slice(0, 3),
      resources: ['Online documentation', 'Practice platforms', 'Interview guides'],
    };
  }

  const prompt = buildPreparationStrategyPrompt(params);
  const raw = await sendMessageToAgent(prompt);
  const parsed = parseAgentResponse(raw);
  return Object.keys(parsed).length > 0 ? parsed : { strategy: raw };
}

export async function generateFinalSummary(params: {
  candidateName: string;
  targetRole: string;
  experienceLevel: ExperienceLevel;
  questionsAndAnswers: { question: string; answer: string; score: number }[];
  categoryAverages: Record<string, number>;
  overallScore: number;
  sessionId: string;
}): Promise<Pick<SessionSummary, 'strongAreas' | 'weakAreas' | 'recommendations' | 'readinessSummary'> & { overallAssessment?: string; nextSteps?: string[] }> {
  validateConfig();

  if (process.env.ENABLE_MOCK_AI === 'true') {
    return {
      strongAreas: ['Good communication skills', 'Relevant technical knowledge'],
      weakAreas: ['Could provide more specific examples', 'Depth of technical answers'],
      recommendations: [
        'Practice answering with the STAR method',
        'Review core technical concepts for your target role',
        'Prepare 3-5 specific examples from past experience',
      ],
      readinessSummary: `${params.candidateName} shows good potential for a ${params.targetRole} role with an overall score of ${params.overallScore.toFixed(1)}/10. [MOCK MODE]`,
      nextSteps: ['Continue practicing with mock interviews', 'Review weak areas identified', 'Prepare questions for the interviewer'],
    };
  }

  const prompt = buildFinalSummaryPrompt(params);
  const raw = await sendMessageToAgent(prompt);
  const parsed = parseAgentResponse(raw);

  return {
    strongAreas: parseStringArray(parsed.strongAreas),
    weakAreas: parseStringArray(parsed.weakAreas),
    recommendations: parseStringArray(parsed.recommendations),
    readinessSummary: String(parsed.readinessSummary || ''),
    overallAssessment: parsed.overallAssessment ? String(parsed.overallAssessment) : undefined,
    nextSteps: parseStringArray(parsed.nextSteps),
  };
}

export async function chat(params: ChatParams): Promise<{ reply: string }> {
  validateConfig();

  if (process.env.ENABLE_MOCK_AI === 'true') {
    return {
      reply: `[MOCK MODE] I'm the AI Interview Coach. You asked: "${params.message}". In production, I'll use the IBM watsonx Orchestrate Interview Trainer Agent to provide personalized coaching advice.`,
    };
  }

  const prompt = buildChatPrompt(params);
  const raw = await sendMessageToAgent(prompt, params.history);
  return { reply: raw };
}

// Export as named service object for clean imports
export const orchestrateService = {
  generateQuestions,
  evaluateAnswer,
  getModelAnswer,
  getPreparationStrategy,
  generateFinalSummary,
  chat,
  parseAgentResponse,
  extractTextFromAgentResponse,
  checkAgentHealth,
  getIBMToken,
};

export default orchestrateService;
