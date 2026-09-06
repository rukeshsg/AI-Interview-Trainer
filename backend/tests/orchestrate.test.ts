import { orchestrateService } from '../src/services/orchestrateService';

describe('Orchestrate Service (Mock Mode)', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, ENABLE_MOCK_AI: 'true' };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('generates questions for given role, type, and question count', async () => {
    const questions = await orchestrateService.generateQuestions({
      sessionId: 'test-session-123',
      candidateName: 'Jane Doe',
      targetRole: 'Python Developer',
      experienceLevel: 'fresher',
      skills: ['Python', 'SQL'],
      interviewType: 'technical',
      difficulty: 'easy',
      questionCount: 3,
    });

    expect(questions).toHaveLength(3);
    expect(questions[0].sessionId).toBe('test-session-123');
    expect(questions[0].questionNumber).toBe(1);
    expect(questions[0].type).toBe('technical');
    expect(typeof questions[0].question).toBe('string');
  });

  it('evaluates submitted answer across all 5 dimensions', async () => {
    const evaluation = await orchestrateService.evaluateAnswer({
      sessionId: 'test-session-123',
      question: {
        id: 'q-1',
        sessionId: 'test-session-123',
        questionNumber: 1,
        question: 'What is a list vs tuple in Python?',
        topic: 'Python',
        difficulty: 'easy',
        type: 'technical',
      },
      answer: 'A list is mutable and a tuple is immutable in Python. Lists use square brackets while tuples use parentheses.',
      candidateProfile: {
        name: 'Jane Doe',
        targetRole: 'Python Developer',
        experienceLevel: 'fresher',
        skills: ['Python'],
      },
    });

    expect(evaluation.overallScore).toBeGreaterThanOrEqual(1);
    expect(evaluation.overallScore).toBeLessThanOrEqual(10);
    expect(evaluation.technicalAccuracy).toBeDefined();
    expect(evaluation.relevance).toBeDefined();
    expect(evaluation.clarity).toBeDefined();
    expect(evaluation.completeness).toBeDefined();
    expect(evaluation.communication).toBeDefined();
    expect(Array.isArray(evaluation.strengths)).toBe(true);
    expect(Array.isArray(evaluation.improvements)).toBe(true);
  });

  it('retrieves model answer for a question', async () => {
    const result = await orchestrateService.getModelAnswer({
      question: {
        id: 'q-1',
        sessionId: 'test-session-123',
        questionNumber: 1,
        question: 'What is a list vs tuple in Python?',
        topic: 'Python',
        difficulty: 'easy',
        type: 'technical',
      },
      targetRole: 'Python Developer',
      experienceLevel: 'fresher',
    });

    expect(typeof result.modelAnswer).toBe('string');
    expect(result.modelAnswer.length).toBeGreaterThan(0);
    expect(Array.isArray(result.keyPoints)).toBe(true);
    expect(Array.isArray(result.tips)).toBe(true);
  });

  it('generates 7-day preparation strategy', async () => {
    const strat = await orchestrateService.getPreparationStrategy({
      targetRole: 'Python Developer',
      experienceLevel: 'fresher',
      skills: ['Python', 'Django'],
      interviewType: 'technical',
    });

    expect(strat).toBeDefined();
    expect(strat.strategy).toBeDefined();
  });

  it('generates comprehensive final session summary', async () => {
    const summary = await orchestrateService.generateFinalSummary({
      candidateName: 'Jane Doe',
      targetRole: 'Python Developer',
      experienceLevel: 'fresher',
      questionsAndAnswers: [
        { question: 'Q1', answer: 'A1', score: 8 },
        { question: 'Q2', answer: 'A2', score: 7 },
      ],
      categoryAverages: { technical: 8, relevance: 7.5 },
      overallScore: 7.5,
      sessionId: 'test-session-123',
    });

    expect(summary.readinessSummary).toBeDefined();
    expect(Array.isArray(summary.strongAreas)).toBe(true);
    expect(Array.isArray(summary.weakAreas)).toBe(true);
    expect(Array.isArray(summary.recommendations)).toBe(true);
  });

  it('handles chat messages with interview coach', async () => {
    const result = await orchestrateService.chat({
      message: 'Give me 3 tips for my technical interview',
      sessionId: 'test-session-123',
    });

    expect(typeof result.reply).toBe('string');
    expect(result.reply.length).toBeGreaterThan(0);
  });
});
