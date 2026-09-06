import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Brain, ChevronRight, LogOut, Eye,
  CheckCircle, TrendingUp, Volume2, VolumeX, Mic, MicOff, AlertCircle,
  RefreshCw, Sparkles, ShieldCheck
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge, difficultyBadge, typeBadge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Textarea } from '../components/ui/FormControls';
import { Spinner, ProgressBar } from '../components/ui/Feedback';
import { ConfirmModal } from '../components/ui/Modal';
import { useInterview } from '../hooks/useInterview';
import { getSessionDetail } from '../api/interviewApi';
import {
  speakText,
  stopSpeaking,
  startSpeechRecognition,
  isSpeechRecognitionSupported,
} from '../services/voiceService';
import type { InterviewSession } from '../types';
import toast from 'react-hot-toast';

function ScoreRing({ score }: { score: number }) {
  const color = score >= 8 ? 'text-emerald-600' : score >= 6 ? 'text-amber-600' : 'text-rose-600';
  return (
    <div className={`text-3xl font-extrabold ${color} flex items-baseline tracking-tight`}>
      {score.toFixed(1)}<span className="text-sm text-slate-400 font-medium ml-0.5">/10</span>
    </div>
  );
}

export default function MockInterviewPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  useEffect(() => {
    if (!sessionId) return;
    getSessionDetail(sessionId)
      .then(setSession)
      .catch(() => navigate('/dashboard'))
      .finally(() => setLoadingSession(false));
  }, [sessionId, navigate]);

  if (loadingSession || !session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Spinner size="lg" text="Preparing your personalized interview workspace..." />
        <p className="text-xs text-slate-400">Loading candidate session data...</p>
      </div>
    );
  }

  return <InterviewWorkspace session={session} navigate={navigate} />;
}

function InterviewWorkspace({ session, navigate }: {
  session: InterviewSession; navigate: (p: string) => void;
}) {
  const iv = useInterview(session);
  const [showExitModal, setShowExitModal] = useState(false);
  const isLastQuestion = iv.questionIndex >= iv.totalQuestions - 1;

  // Voice state
  const isVoiceMode = session.interviewMode === 'voice';
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const stopListeningRef = useRef<(() => void) | null>(null);
  const stopSpeakingRef = useRef<(() => void) | null>(null);

  // Auto-load first question
  useEffect(() => {
    iv.loadQuestion(0);
  }, []);

  // Handle cleanup on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      if (stopListeningRef.current) stopListeningRef.current();
    };
  }, []);

  // When a new question loads, if in voice mode, optionally speak it
  useEffect(() => {
    if (iv.state === 'answering' && iv.currentQuestion && isVoiceMode) {
      handleSpeakQuestion(iv.currentQuestion.question);
    }
  }, [iv.currentQuestion?.id, iv.state]);

  function handleSpeakQuestion(text: string) {
    if (isSpeakingQuestion) {
      stopSpeaking();
      setIsSpeakingQuestion(false);
      return;
    }

    setIsSpeakingQuestion(true);
    speakText(
      text,
      () => setIsSpeakingQuestion(true),
      () => setIsSpeakingQuestion(false),
      (err) => {
        setIsSpeakingQuestion(false);
        console.warn('[Voice TTS] Audio playback note:', err);
      }
    ).then((stopFn) => {
      stopSpeakingRef.current = stopFn;
    });
  }

  function handleToggleMicrophone() {
    if (isListening) {
      if (stopListeningRef.current) {
        stopListeningRef.current();
        stopListeningRef.current = null;
      }
      setIsListening(false);
      return;
    }

    if (!isSpeechRecognitionSupported()) {
      setVoiceError('Speech recognition is not supported in this browser. Please type your answer or use Chrome/Edge.');
      return;
    }

    setVoiceError(null);
    setIsListening(true);

    const stopFn = startSpeechRecognition(
      (transcript, isFinal) => {
        if (isFinal) {
          iv.setCurrentAnswer((prev: string) => {
            const clean = transcript.trim();
            if (!clean) return prev;
            return prev ? `${prev.trim()} ${clean}` : clean;
          });
        }
      },
      (err) => {
        setIsListening(false);
        setVoiceError(err);
        toast.error(err, { id: 'voice-rec-err' });
      },
      () => {
        setIsListening(false);
      }
    );

    stopListeningRef.current = stopFn;
  }

  function handleExit() {
    setShowExitModal(true);
  }

  if (iv.state === 'loading_summary') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center animate-pulse">
          <Brain className="w-8 h-8 text-indigo-600" />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-bold text-slate-900 mb-1">Evaluating Performance & Generating Report</h2>
          <p className="text-sm text-slate-500">IBM watsonx Orchestrate is synthesizing your interview insights...</p>
        </div>
        <Spinner size="md" />
      </div>
    );
  }

  if (iv.state === 'complete' && iv.summaryData) {
    navigate(`/reports/${session.id}`);
    return null;
  }

  const currentQNum = iv.questionIndex + 1;
  const pct = Math.min(100, Math.max(5, (currentQNum / iv.totalQuestions) * 100));

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* 1. Header Area (10-15%) */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                <Brain className="w-3.5 h-3.5" />
                Live Session
              </span>
              <span className="text-xs text-slate-400 font-medium">Session ID: {session.id.slice(0, 8)}...</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{session.role} Interview</h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge variant={typeBadge(session.interviewType)}>{session.interviewType}</Badge>
              <Badge variant={difficultyBadge(session.difficulty)}>{session.difficulty}</Badge>
              <Badge variant={session.interviewMode === 'voice' ? 'purple' : 'info'}>
                {session.interviewMode === 'voice' ? '🎙️ Voice Mode' : '💬 Text Mode'}
              </Badge>
            </div>
          </div>

          <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2">
            <div className="text-right">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Progress</span>
              <p className="text-sm font-bold text-slate-900">
                Question {currentQNum} of {iv.totalQuestions}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleExit} icon={<LogOut className="w-4 h-4" />}>
              Exit Interview
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-2 mt-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* 2. AI Interviewer Bubble */}
      <div className="flex items-start gap-3.5 mb-5">
        <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm shadow-indigo-200">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div className="bg-gradient-to-br from-indigo-50/80 to-slate-50 border border-indigo-100 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-indigo-950 shadow-sm">
          <div className="flex items-center gap-1.5 font-semibold text-xs text-indigo-700 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            AI Interview Coach (IBM watsonx)
          </div>
          {iv.state === 'loading_question' && 'Formulating your next question using your role profile & industry rubrics...'}
          {iv.state === 'answering' && 'Take your time and answer as you would in a real interview. You can type or use the voice recorder.'}
          {iv.state === 'evaluating' && 'Analyzing your response across technical accuracy, clarity, and communication...'}
          {iv.state === 'showing_feedback' && 'Here is your evaluation with rubric scores and actionable improvement tips.'}
          {iv.state === 'error' && 'Interview question generation encountered an interruption. You can retry below.'}
          {iv.state === 'idle' && "Welcome to your mock interview session! Let's get started."}
        </div>
      </div>

      {/* 3. Question Card or Loading / Error State (35-40%) */}
      {iv.state === 'loading_question' && (
        <Card className="mb-6 border-indigo-100 bg-white/90">
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between">
              <div className="h-5 bg-slate-200 rounded-full animate-pulse w-28" />
              <div className="h-5 bg-slate-200 rounded-full animate-pulse w-20" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 rounded animate-pulse w-full" />
              <div className="h-4 bg-slate-200 rounded animate-pulse w-5/6" />
              <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4" />
            </div>
            <div className="flex items-center gap-2 pt-2 text-xs text-indigo-600 font-medium">
              <Spinner size="sm" />
              <span>Generating tailored question from RAG knowledge base...</span>
            </div>
          </div>
        </Card>
      )}

      {iv.state === 'error' && (
        <Card className="mb-6 border-rose-200 bg-rose-50/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center flex-shrink-0 text-rose-600">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Unable to generate the interview question</h3>
                <p className="text-xs text-slate-600 mt-1 max-w-lg">
                  {iv.errorMessage || 'The AI service temporarily timed out or was interrupted. Please click Retry to generate the question.'}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                  Your candidate profile and session state are fully preserved.
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                onClick={iv.retryLoadQuestion}
                icon={<RefreshCw className="w-4 h-4" />}
              >
                Retry Question
              </Button>
            </div>
          </div>
        </Card>
      )}

      {iv.currentQuestion && iv.state !== 'loading_question' && iv.state !== 'error' && (
        <Card className="mb-6 border-slate-200/80 bg-white shadow-sm">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700">
                Question {iv.currentQuestion.questionNumber}
              </span>
              <Badge variant={typeBadge(iv.currentQuestion.type)}>{iv.currentQuestion.type}</Badge>
              <Badge variant={difficultyBadge(iv.currentQuestion.difficulty)}>{iv.currentQuestion.difficulty}</Badge>
              <span className="text-xs font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                {iv.currentQuestion.topic}
              </span>
            </div>
            {/* AI Speech button */}
            <button
              onClick={() => iv.currentQuestion && handleSpeakQuestion(iv.currentQuestion.question)}
              className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/60 px-3 py-1.5 rounded-lg transition-colors"
              title="Hear question spoken with IBM TTS"
            >
              {isSpeakingQuestion ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                  <span>Stop Audio</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Listen to Question</span>
                </>
              )}
            </button>
          </div>
          <p className="text-lg font-semibold text-slate-900 leading-relaxed tracking-tight">
            {iv.currentQuestion.question}
          </p>
        </Card>
      )}

      {/* 4. Answer Area (30-35%) */}
      {iv.state === 'answering' && (
        <div className="mb-6 space-y-4">
          {/* Dedicated Voice Interview Workspace */}
          {isVoiceMode && (
            <div className={`border-2 rounded-3xl p-6 transition-all text-center ${
              isListening
                ? 'bg-rose-50/60 border-rose-300 shadow-md ring-4 ring-rose-100'
                : iv.currentAnswer
                ? 'bg-emerald-50/40 border-emerald-200'
                : 'bg-slate-50/80 border-slate-200/90'
            }`}>
              {/* State 1: Listening */}
              {isListening && (
                <div className="flex flex-col items-center justify-center py-2 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-200 animate-pulse ring-8 ring-rose-100">
                    <Mic className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                      <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                      Listening to speech...
                    </span>
                    <p className="text-sm font-semibold text-slate-800 mt-2">Speak naturally — your words appear below in real time</p>
                    <p className="text-xs text-slate-500 mt-0.5">Click Stop Recording when you finish this thought.</p>
                  </div>
                  <Button
                    variant="danger"
                    size="md"
                    onClick={handleToggleMicrophone}
                    icon={<MicOff className="w-4 h-4" />}
                  >
                    Stop Recording
                  </Button>
                </div>
              )}

              {/* State 2: Transcript Ready for Review */}
              {!isListening && iv.currentAnswer && (
                <div className="flex flex-col items-center justify-center py-1 space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Transcript Ready for Review</span>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Review, format, or edit your transcribed answer in the box below before submitting.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleMicrophone}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 bg-white border border-indigo-200 px-3 py-1.5 rounded-xl shadow-2xs hover:bg-indigo-50 transition-colors mt-1"
                  >
                    <Mic className="w-3.5 h-3.5" /> Continue Speaking / Add More
                  </button>
                </div>
              )}

              {/* State 3: Ready to Speak */}
              {!isListening && !iv.currentAnswer && (
                <div className="flex flex-col items-center justify-center py-3 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-100">
                    <Mic className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Ready to speak</h3>
                    <p className="text-xs text-slate-500 mt-0.5 max-w-sm mx-auto">
                      Click the button below to start your response. Speak clearly at a natural pace.
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleToggleMicrophone}
                    icon={<Mic className="w-4 h-4" />}
                  >
                    Start Recording Answer
                  </Button>
                </div>
              )}
            </div>
          )}

          {voiceError && (
            <div className="flex items-start justify-between gap-2 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Voice Input Notice</p>
                  <p className="text-slate-600 mt-0.5">{voiceError}</p>
                </div>
              </div>
              <Button size="sm" variant="secondary" onClick={handleToggleMicrophone}>
                Try Again
              </Button>
            </div>
          )}

          {/* Transcript / Answer Editing Box */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                {isVoiceMode ? 'Live Spoken Transcript & Editor' : 'Your Candidate Answer'}
              </label>
              <span className="text-xs text-slate-400 font-medium font-mono">
                {iv.currentAnswer.length} chars
              </span>
            </div>

            <Textarea
              value={iv.currentAnswer}
              onChange={(e) => iv.setCurrentAnswer(e.target.value)}
              rows={6}
              placeholder={
                isVoiceMode
                  ? "Your spoken response will appear here in real-time. You can edit, format, or type additional details before submitting..."
                  : "Type your structured interview response here. Mention specific examples, technical concepts, or STAR details..."
              }
              showCount={false}
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-3">
                {isSpeechRecognitionSupported() && !isVoiceMode && (
                  <button
                    type="button"
                    onClick={handleToggleMicrophone}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 bg-indigo-50/80 hover:bg-indigo-100/80 px-3 py-1.5 rounded-xl border border-indigo-200/50 transition-colors"
                  >
                    <Mic className="w-3.5 h-3.5" /> {isListening ? 'Stop Recording' : 'Dictate with Voice'}
                  </button>
                )}
                <span className="text-xs text-slate-400">
                  {isVoiceMode
                    ? 'Review your transcript carefully before submitting.'
                    : 'Be as detailed and structured as in a real interview.'}
                </span>
              </div>
              <Button
                onClick={() => {
                  if (isListening && stopListeningRef.current) {
                    stopListeningRef.current();
                    setIsListening(false);
                  }
                  iv.submitAnswer();
                }}
                disabled={!iv.currentAnswer.trim()}
                icon={<ChevronRight className="w-4 h-4" />}
                size="md"
              >
                Submit Answer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Evaluating State */}
      {iv.state === 'evaluating' && (
        <Card className="mb-6 border-indigo-100 bg-white">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-8 text-center sm:text-left">
            <Spinner size="lg" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Evaluating Your Response</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Scoring technical depth, clarity, relevance, and structuring actionable feedback...
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* 6. Evaluation & Feedback */}
      {iv.state === 'showing_feedback' && iv.currentEvaluation && (
        <Card className="mb-6 border-slate-200/80 bg-white shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Evaluation Result</span>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">Performance Breakdown</h2>
            </div>
            <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200/60">
              <span className="text-xs font-medium text-slate-500">Overall Score:</span>
              <ScoreRing score={iv.currentEvaluation.overallScore} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {[
              { label: 'Technical Accuracy', val: iv.currentEvaluation.technicalAccuracy },
              { label: 'Relevance',           val: iv.currentEvaluation.relevance },
              { label: 'Clarity',             val: iv.currentEvaluation.clarity },
              { label: 'Completeness',        val: iv.currentEvaluation.completeness },
              { label: 'Communication',       val: iv.currentEvaluation.communication },
            ].map(({ label, val }) => (
              <div key={label} className="bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                <ProgressBar
                  label={label}
                  value={val}
                  max={10}
                  color={val >= 8 ? 'green' : val >= 6 ? 'indigo' : 'yellow'}
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {iv.currentEvaluation.strengths.length > 0 && (
              <div className="bg-emerald-50/60 border border-emerald-200/60 rounded-xl p-4">
                <p className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 mb-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" /> Key Strengths
                </p>
                <ul className="space-y-1.5">
                  {iv.currentEvaluation.strengths.map((s, i) => (
                    <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                      <span className="text-emerald-500 font-bold mt-0.5">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {iv.currentEvaluation.improvements.length > 0 && (
              <div className="bg-amber-50/60 border border-amber-200/60 rounded-xl p-4">
                <p className="text-xs font-bold text-amber-800 flex items-center gap-1.5 mb-2">
                  <TrendingUp className="w-4 h-4 text-amber-600" /> Areas to Improve
                </p>
                <ul className="space-y-1.5">
                  {iv.currentEvaluation.improvements.map((s, i) => (
                    <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                      <span className="text-amber-500 font-bold mt-0.5">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Model answer toggle */}
          <div className="border-t border-slate-100 pt-4">
            {!iv.modelAnswerVisible ? (
              <button
                onClick={iv.revealModelAnswer}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 bg-indigo-50/60 hover:bg-indigo-100/60 px-3.5 py-2 rounded-xl transition-colors border border-indigo-200/60"
              >
                <Eye className="w-4 h-4" /> Show Recommended Model Answer
              </button>
            ) : (
              <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4">
                <p className="text-xs font-bold text-indigo-800 flex items-center gap-1.5 mb-2">
                  <Eye className="w-4 h-4 text-indigo-600" /> IBM Recommended Model Answer
                </p>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                  {iv.currentEvaluation.modelAnswerDetail?.modelAnswer || iv.currentEvaluation.modelAnswer}
                </p>
              </div>
            )}
          </div>

          {/* Next / Finish Buttons */}
          <div className="flex justify-end mt-6 pt-4 border-t border-slate-100">
            {isLastQuestion ? (
              <Button onClick={iv.finishSession} icon={<ChevronRight className="w-4 h-4" />} size="md">
                Finish Interview & View Final Report
              </Button>
            ) : (
              <Button onClick={iv.nextQuestion} icon={<ChevronRight className="w-4 h-4" />} size="md">
                Proceed to Next Question
              </Button>
            )}
          </div>
        </Card>
      )}

      <ConfirmModal
        open={showExitModal}
        onClose={() => setShowExitModal(false)}
        onConfirm={() => navigate('/dashboard')}
        title="Exit Interview Session?"
        message="Are you sure you want to exit? Your candidate answers so far are saved, but the session will be marked as paused."
        confirmLabel="Exit to Dashboard"
        danger
      />
    </div>
  );
}
