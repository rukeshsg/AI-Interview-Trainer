import {
  GenerateQuestionsParams,
  EvaluateAnswerParams,
  ModelAnswerParams,
  ChatParams,
  InterviewQuestion,
  Evaluation,
  SessionSummary,
  Difficulty,
  QuestionType,
  InterviewType,
} from '../types';

// ────────────────────────────────────────────────────────────────────────────
// Prompt builders — one function per agent mode
// ────────────────────────────────────────────────────────────────────────────

export function buildGenerateQuestionsPrompt(params: GenerateQuestionsParams): string {
  const { candidateName, targetRole, experienceLevel, skills, interviewType, difficulty, questionCount, resumeContext, targetCompany } = params;

  const skillsStr = skills.length > 0 ? skills.join(', ') : 'general skills';
  const companyStr = targetCompany ? ` at ${targetCompany}` : '';
  const resumeStr = resumeContext
    ? `\n\nResume Context:\n${resumeContext.substring(0, 1500)}`
    : '';

  const difficultyInstruction =
    difficulty === 'adaptive'
      ? 'Start with easy questions and gradually increase difficulty.'
      : `Use ${difficulty} difficulty throughout.`;

  const typeInstruction = {
    technical: `Focus on technical skills: ${skillsStr}. Include coding concepts, problem-solving, and technical knowledge questions.`,
    hr: 'Focus on HR questions: self-introduction, strengths, weaknesses, career goals, motivation, teamwork, communication.',
    behavioral: 'Focus on behavioral STAR-method scenarios: teamwork, conflict resolution, failure, leadership, deadline pressure, problem solving, adaptability.',
    mixed: `Mix technical (${skillsStr}), HR, and behavioral questions intelligently based on the role.`,
  }[interviewType];

  return `You are an expert interview coach. Generate exactly ${questionCount} interview questions for the following candidate.

Candidate Profile:
- Name: ${candidateName}
- Target Role: ${targetRole}${companyStr}
- Experience Level: ${experienceLevel}
- Skills: ${skillsStr}
- Interview Type: ${interviewType}

Instructions:
- ${typeInstruction}
- ${difficultyInstruction}
- Questions must be appropriate for a ${experienceLevel} candidate targeting a ${targetRole} role.
- Do NOT reveal answers or model answers.
- Make questions specific and relevant.${resumeStr}

Return the questions in this exact JSON format:
{
  "questions": [
    {
      "questionNumber": 1,
      "question": "...",
      "topic": "...",
      "difficulty": "easy|medium|hard",
      "type": "technical|hr|behavioral"
    }
  ]
}`;
}

export function buildEvaluateAnswerPrompt(params: EvaluateAnswerParams): string {
  const { question, answer, candidateProfile } = params;

  return `You are an expert interview evaluator. Evaluate the following interview answer.

Question Details:
- Question: ${question.question}
- Topic: ${question.topic}
- Difficulty: ${question.difficulty}
- Type: ${question.type}

Candidate Profile:
- Name: ${candidateProfile.name}
- Target Role: ${candidateProfile.targetRole}
- Experience Level: ${candidateProfile.experienceLevel}

Candidate's Answer:
"${answer}"

Evaluate the answer across these dimensions (score each 1-10):
1. Technical Accuracy — Is the information correct and precise?
2. Relevance — Does the answer address the question directly?
3. Clarity — Is the answer clear and well-structured?
4. Completeness — Is the answer thorough enough for the experience level?
5. Communication — Is the answer well-communicated and professional?

Return your evaluation in this exact JSON format:
{
  "technicalAccuracy": <1-10>,
  "relevance": <1-10>,
  "clarity": <1-10>,
  "completeness": <1-10>,
  "communication": <1-10>,
  "overallScore": <1-10>,
  "strengths": ["...", "..."],
  "improvements": ["...", "..."],
  "suggestions": ["Specific actionable suggestion 1", "Specific actionable suggestion 2"],
  "modelAnswer": "A comprehensive model answer for this question at the ${candidateProfile.experienceLevel} level."
}

Be constructive and professional. Do not guarantee job success or employment outcomes.`;
}

export function buildModelAnswerPrompt(params: ModelAnswerParams): string {
  return `You are an expert interview coach. Provide a comprehensive model answer for the following interview question.

Question: ${params.question.question}
Topic: ${params.question.topic}
Type: ${params.question.type}
Difficulty: ${params.question.difficulty}
Target Role: ${params.targetRole}
Experience Level: ${params.experienceLevel}

Provide a thorough model answer that:
1. Directly addresses the question
2. Is appropriate for a ${params.experienceLevel} candidate
3. Demonstrates strong knowledge
4. Uses clear structure
5. Is realistic and achievable

Return as JSON:
{
  "modelAnswer": "...",
  "keyPoints": ["Point 1", "Point 2", "Point 3"],
  "tips": ["Tip 1", "Tip 2"]
}`;
}

export function buildChatPrompt(params: ChatParams): string {
  const profileContext = params.profile
    ? `\nCandidate Profile:\n- Name: ${params.profile.name || 'User'}\n- Target Role: ${params.profile.targetRole || 'Software Engineer'}\n- Experience Level: ${params.profile.experienceLevel || 'fresher'}\n- Skills: ${params.profile.skills?.join(', ') || 'technical skills'}\n\nCRITICAL INSTRUCTION: When greeting or addressing the candidate, strictly use their name "${params.profile.name || 'User'}" and their target role "${params.profile.targetRole || 'Software Engineer'}". Never use any other candidate name.`
    : '';

  const historyContext =
    params.history && params.history.length > 0
      ? '\n\nConversation History:\n' +
        params.history
          .slice(-6)
          .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
          .join('\n')
      : '';

  return `You are an expert AI interview coach powered by IBM watsonx Orchestrate.${profileContext}${historyContext}

User: ${params.message}

Provide helpful, structured, and actionable interview coaching guidance. Format your response cleanly with clear headings, bullet points, and code blocks where appropriate.`;
}

export function buildPreparationStrategyPrompt(params: {
  targetRole: string;
  experienceLevel: string;
  skills: string[];
  interviewType: InterviewType;
  targetCompany?: string;
}): string {
  const skillsStr = params.skills.join(', ') || 'general skills';
  const companyStr = params.targetCompany ? ` at ${params.targetCompany}` : '';

  return `You are an expert interview preparation coach. Create a 7-day interview preparation strategy.

Candidate Profile:
- Target Role: ${params.targetRole}${companyStr}
- Experience Level: ${params.experienceLevel}
- Key Skills: ${skillsStr}
- Interview Type: ${params.interviewType}

Create a detailed 7-day preparation plan with specific daily activities, resources, and practice areas.

Return as JSON:
{
  "strategy": "Overview of the preparation strategy",
  "weeklyPlan": [
    {
      "day": 1,
      "focus": "...",
      "activities": ["Activity 1", "Activity 2"],
      "tips": ["Tip 1"]
    }
  ],
  "keyAreas": ["Area 1", "Area 2"],
  "resources": ["Resource 1", "Resource 2"]
}`;
}

export function buildFinalSummaryPrompt(params: {
  candidateName: string;
  targetRole: string;
  experienceLevel: string;
  questionsAndAnswers: { question: string; answer: string; score: number }[];
  categoryAverages: Record<string, number>;
  overallScore: number;
}): string {
  const qaText = params.questionsAndAnswers
    .map((qa, i) => `Q${i + 1}: ${qa.question}\nAnswer: ${qa.answer}\nScore: ${qa.score}/10`)
    .join('\n\n');

  return `You are an expert interview coach. Generate a comprehensive final performance report.

Candidate: ${params.candidateName}
Role: ${params.targetRole}
Experience Level: ${params.experienceLevel}
Overall Score: ${params.overallScore.toFixed(1)}/10

Category Averages:
${Object.entries(params.categoryAverages)
  .map(([k, v]) => `- ${k}: ${v.toFixed(1)}/10`)
  .join('\n')}

Questions & Answers:
${qaText}

Generate a professional final summary with:
1. Overall performance assessment
2. Strong areas (2-3 specific strengths)
3. Weak areas (2-3 areas for improvement)
4. Specific recommendations (3-5 actionable steps)
5. Interview readiness summary (1-2 sentences)
6. Suggested next steps

Return as JSON:
{
  "strongAreas": ["...", "..."],
  "weakAreas": ["...", "..."],
  "recommendations": ["...", "...", "..."],
  "readinessSummary": "...",
  "nextSteps": ["...", "..."],
  "overallAssessment": "..."
}`;
}
