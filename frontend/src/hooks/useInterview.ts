import { useState, useCallback, useRef } from 'react';
import type { InterviewQuestion, Evaluation, InterviewSession } from '../types';
import { getNextQuestion, evaluateAnswer as apiEvaluateAnswer, generateSummary, getModelAnswer } from '../api/interviewApi';
import toast from 'react-hot-toast';

export type InterviewState =
  | 'idle'
  | 'loading_question'
  | 'answering'
  | 'evaluating'
  | 'showing_feedback'
  | 'loading_summary'
  | 'complete'
  | 'error';

export interface EvaluationWithModel extends Evaluation {
  modelAnswerDetail?: { modelAnswer: string; keyPoints: string[]; tips: string[] };
}

export interface UseInterviewReturn {
  state: InterviewState;
  currentQuestion: InterviewQuestion | null;
  currentAnswer: string;
  currentEvaluation: EvaluationWithModel | null;
  questionIndex: number; // 0-based
  totalQuestions: number;
  allEvaluations: EvaluationWithModel[];
  modelAnswerVisible: boolean;
  summaryData: Record<string, unknown> | null;
  errorMessage: string | null;
  setCurrentAnswer: React.Dispatch<React.SetStateAction<string>>;
  loadQuestion: (num: number) => Promise<void>;
  retryLoadQuestion: () => Promise<void>;
  submitAnswer: () => Promise<void>;
  nextQuestion: () => void;
  revealModelAnswer: () => Promise<void>;
  finishSession: () => Promise<void>;
}

export function useInterview(session: InterviewSession): UseInterviewReturn {
  const [state, setState] = useState<InterviewState>('idle');
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [currentEvaluation, setCurrentEvaluation] = useState<EvaluationWithModel | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0); // 0-based
  const [allEvaluations, setAllEvaluations] = useState<EvaluationWithModel[]>([]);
  const [modelAnswerVisible, setModelAnswerVisible] = useState(false);
  const [summaryData, setSummaryData] = useState<Record<string, unknown> | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadingQuestionRef = useRef(false);
  const submittingAnswerRef = useRef(false);
  const loadingSummaryRef = useRef(false);

  const loadQuestion = useCallback(async (index: number) => {
    if (loadingQuestionRef.current) return;
    loadingQuestionRef.current = true;
    setState('loading_question');
    setCurrentAnswer('');
    setCurrentEvaluation(null);
    setModelAnswerVisible(false);
    setErrorMessage(null);

    try {
      const q = await getNextQuestion(session.id, index + 1); // 1-based on server
      setCurrentQuestion(q);
      setState('answering');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Interview generation is temporarily unavailable. Please try again.';
      setErrorMessage(msg);
      setState('error');
      toast.error(msg, { id: 'question-gen-error' });
    } finally {
      loadingQuestionRef.current = false;
    }
  }, [session.id]);

  const retryLoadQuestion = useCallback(async () => {
    await loadQuestion(questionIndex);
  }, [loadQuestion, questionIndex]);

  const submitAnswer = useCallback(async () => {
    if (!currentQuestion || !currentAnswer.trim() || submittingAnswerRef.current) return;
    submittingAnswerRef.current = true;
    setState('evaluating');
    setErrorMessage(null);

    try {
      const result = await apiEvaluateAnswer(session.id, currentQuestion.id, currentAnswer.trim());
      const evaluation: EvaluationWithModel = result.evaluation;
      setCurrentEvaluation(evaluation);
      setAllEvaluations((prev) => [...prev, evaluation]);
      setState('showing_feedback');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Answer evaluation is temporarily unavailable. Please try again.';
      setErrorMessage(msg);
      setState('answering');
      toast.error(msg, { id: 'eval-error' });
    } finally {
      submittingAnswerRef.current = false;
    }
  }, [currentQuestion, currentAnswer, session.id]);

  const nextQuestion = useCallback(() => {
    const next = questionIndex + 1;
    setQuestionIndex(next);
    loadQuestion(next);
  }, [questionIndex, loadQuestion]);

  const revealModelAnswer = useCallback(async () => {
    if (!currentQuestion) return;
    if (currentEvaluation?.modelAnswerDetail) {
      setModelAnswerVisible(true);
      return;
    }
    try {
      const detail = await getModelAnswer(session.id, currentQuestion.id);
      setCurrentEvaluation((prev) => prev ? { ...prev, modelAnswerDetail: detail } : prev);
      setModelAnswerVisible(true);
    } catch {
      setModelAnswerVisible(true);
    }
  }, [currentQuestion, currentEvaluation, session.id]);

  const finishSession = useCallback(async () => {
    if (loadingSummaryRef.current) return;
    loadingSummaryRef.current = true;
    setState('loading_summary');
    setErrorMessage(null);

    try {
      const summary = await generateSummary(session.id);
      setSummaryData(summary as unknown as Record<string, unknown>);
      setState('complete');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Could not generate the final report. Please try again.';
      setErrorMessage(msg);
      setState('showing_feedback');
      toast.error(msg, { id: 'summary-error' });
    } finally {
      loadingSummaryRef.current = false;
    }
  }, [session.id]);

  return {
    state,
    currentQuestion,
    currentAnswer,
    currentEvaluation,
    questionIndex,
    totalQuestions: session.questionCount,
    allEvaluations,
    modelAnswerVisible,
    summaryData,
    errorMessage,
    setCurrentAnswer,
    loadQuestion,
    retryLoadQuestion,
    submitAnswer,
    nextQuestion,
    revealModelAnswer,
    finishSession,
  };
}
