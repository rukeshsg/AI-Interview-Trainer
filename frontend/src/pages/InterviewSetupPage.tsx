import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings, PlayCircle, Mic2, MessageSquare, Code2, Users, Brain,
  Target, Sparkles, CheckCircle2, FileText, ArrowRight, ShieldCheck,
  Zap, Clock, Award, UserCheck, Flame
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useApp } from '../context/AppContext';
import { startSession } from '../api/interviewApi';
import { checkVoiceStatus } from '../services/voiceService';
import type { VoiceStatus } from '../services/voiceService';
import toast from 'react-hot-toast';
import type { InterviewType, Difficulty, InterviewMode } from '../types';

const STEPS = [
  { id: 1, label: 'Profile', desc: 'Candidate info', completed: true },
  { id: 2, label: 'Resume', desc: 'Skills & context', completed: true },
  { id: 3, label: 'Calibration', desc: 'Session setup', active: true },
];

interface TypeOption {
  value: InterviewType;
  label: string;
  badge: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  topics: string[];
}

const TYPE_OPTIONS: TypeOption[] = [
  {
    value: 'technical',
    label: 'Technical Coding & Architecture',
    badge: 'Code & Systems',
    desc: 'Deep dive into data structures, algorithms, frameworks, and role-specific architecture.',
    icon: Code2,
    topics: ['Algorithms', 'Data Structures', 'Frameworks', 'System Design'],
  },
  {
    value: 'hr',
    label: 'HR & Culture Fit',
    badge: 'Culture & Goals',
    desc: 'Self-introduction, company alignment, career trajectory, strengths, and communication.',
    icon: Users,
    topics: ['Self Intro', 'Career Goals', 'Strengths & Growth', 'Company Alignment'],
  },
  {
    value: 'behavioral',
    label: 'Behavioral & Leadership (STAR)',
    badge: 'STAR Method',
    desc: 'Real-world scenarios assessing teamwork, conflict resolution, ownership, and adaptability.',
    icon: Brain,
    topics: ['Team Conflict', 'Leadership', 'Failure & Learning', 'Under Pressure'],
  },
  {
    value: 'mixed',
    label: 'Comprehensive Mixed Simulation',
    badge: 'Full Round',
    desc: 'A realistic, full-spectrum interview round combining Technical, HR, and Behavioral scenarios.',
    icon: Target,
    topics: ['Technical Coding', 'STAR Scenarios', 'Culture Fit', 'Problem Solving'],
  },
];

interface DifficultyOption {
  value: Difficulty;
  label: string;
  badge: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}

const DIFFICULTY_OPTIONS: DifficultyOption[] = [
  {
    value: 'easy',
    label: 'Foundational',
    badge: 'Entry Level',
    desc: 'Core definitions, basic syntax, and standard conceptual fundamentals.',
    icon: ShieldCheck,
  },
  {
    value: 'medium',
    label: 'Professional',
    badge: 'Recommended',
    desc: 'Standard production engineering scenarios, problem solving, and best practices.',
    icon: Award,
  },
  {
    value: 'hard',
    label: 'Advanced',
    badge: 'Senior Level',
    desc: 'Complex edge cases, optimization trade-offs, and architecture design depth.',
    icon: Flame,
  },
  {
    value: 'adaptive',
    label: 'Adaptive AI',
    badge: 'Dynamic Scale',
    desc: 'Dynamic difficulty that automatically scales up or down based on your answer quality.',
    icon: Zap,
  },
];

const Q_COUNTS = [
  { count: 5, label: 'Quick Round', duration: '~15 mins', desc: 'Focused high-impact questions' },
  { count: 10, label: 'Standard Round', duration: '~30 mins', desc: 'Comprehensive depth analysis' },
  { count: 15, label: 'Marathon Round', duration: '~45 mins', desc: 'Complete exhaustive simulation' },
];

export default function InterviewSetupPage() {
  const navigate = useNavigate();
  const { profile, resumeData, setCurrentSession } = useApp();

  const [interviewType, setInterviewType] = useState<InterviewType>('technical');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [questionCount, setQuestionCount] = useState(5);
  const [interviewMode, setInterviewMode] = useState<InterviewMode>('text');
  const [loading, setLoading] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>({
    available: true,
    stt: true,
    tts: true,
    provider: 'IBM Watson Speech Services',
  });

  useEffect(() => {
    checkVoiceStatus().then((status) => {
      setVoiceStatus(status);
    });
  }, []);

  if (!profile) {
    navigate('/prepare');
    return null;
  }

  async function handleStart() {
    if (loading) return;
    setLoading(true);
    try {
      const session = await startSession({
        candidateId: profile!.id,
        role: profile!.targetRole,
        experienceLevel: profile!.experienceLevel,
        interviewType,
        difficulty,
        questionCount,
        interviewMode,
      });
      setCurrentSession(session);
      navigate(`/interview/${session.id}`);
    } catch {
      toast.error('Could not start the interview. Please try again.', { id: 'start-session-err' });
    } finally {
      setLoading(false);
    }
  }

  const selectedTypeObj = TYPE_OPTIONS.find((t) => t.value === interviewType);
  const selectedDiffObj = DIFFICULTY_OPTIONS.find((d) => d.value === difficulty);
  const selectedCountObj = Q_COUNTS.find((q) => q.count === questionCount);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Stepper Header */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Step 3 of 3 · Final Calibration
              </span>
              <span className="text-xs text-slate-400 font-medium">IBM watsonx Orchestrate</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Interview Calibration & Setup
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Customize interview dimensions, question volume, and evaluation criteria for your target role.
            </p>
          </div>

          {/* Stepper Progress */}
          <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/60 self-start md:self-auto">
            {STEPS.map((step, idx) => (
              <React.Fragment key={step.id}>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold transition-colors ${
                      step.completed
                        ? 'bg-emerald-500 text-white shadow-xs shadow-emerald-200'
                        : step.active
                        ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-200 ring-2 ring-indigo-200'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {step.completed ? <CheckCircle2 className="w-4 h-4" /> : step.id}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className={`text-xs font-bold leading-none ${step.active ? 'text-indigo-900' : 'text-slate-700'}`}>
                      {step.label}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{step.desc}</p>
                  </div>
                </div>
                {idx < STEPS.length - 1 && <div className="w-6 h-px bg-slate-300" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Config (Left) + Ticket Launchpad (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Form */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Interview Type */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-600" />
                  1. Select Interview Domain
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Choose the interview evaluation format and scenario focus.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {TYPE_OPTIONS.map((t) => {
                const Icon = t.icon;
                const isSelected = interviewType === t.value;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setInterviewType(t.value)}
                    className={`relative flex flex-col justify-between p-4.5 rounded-2xl border text-left transition-all duration-200 group ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20 shadow-sm shadow-indigo-100'
                        : 'border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/60 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                              : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <span
                          className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border ${
                            isSelected
                              ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}
                        >
                          {t.badge}
                        </span>
                      </div>
                      <h4
                        className={`text-sm font-bold leading-snug ${
                          isSelected ? 'text-indigo-950' : 'text-slate-900'
                        }`}
                      >
                        {t.label}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{t.desc}</p>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-200/60">
                      {t.topics.map((topic) => (
                        <span
                          key={topic}
                          className="text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Difficulty Level */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-indigo-600" />
                  2. Choose Target Difficulty
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Calibrate question complexity according to your interview goals.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {DIFFICULTY_OPTIONS.map((d) => {
                const isSelected = difficulty === d.value;
                return (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setDifficulty(d.value)}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20 shadow-sm'
                        : 'border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/60 bg-white'
                    }`}
                  >
                    <span
                      className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full mb-2 ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {d.badge}
                    </span>
                    <h5
                      className={`text-sm font-bold ${
                        isSelected ? 'text-indigo-950' : 'text-slate-900'
                      }`}
                    >
                      {d.label}
                    </h5>
                    <p className="text-[11px] text-slate-400 mt-1 leading-tight line-clamp-2">
                      {d.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Question Count */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-600" />
                  3. Question Volume & Duration
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select the length of your live practice simulation.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {Q_COUNTS.map((q) => {
                const isSelected = questionCount === q.count;
                return (
                  <button
                    key={q.count}
                    type="button"
                    onClick={() => setQuestionCount(q.count)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 shadow-sm'
                        : 'border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/60 bg-white'
                    }`}
                  >
                    <div className="flex items-baseline justify-between mb-1">
                      <span
                        className={`text-lg font-extrabold ${
                          isSelected ? 'text-indigo-700' : 'text-slate-900'
                        }`}
                      >
                        {q.count} Questions
                      </span>
                      <span className="text-xs font-semibold text-slate-400">{q.duration}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-700">{q.label}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{q.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Interview Mode */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Mic2 className="w-5 h-5 text-indigo-600" />
                  4. Practice Mode
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Choose how you will respond to the IBM Interview Trainer questions.
                </p>
              </div>
              {voiceStatus.available && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  IBM Watson Speech Ready
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <button
                type="button"
                onClick={() => setInterviewMode('text')}
                className={`flex items-start gap-3.5 p-4.5 rounded-2xl border text-left transition-all ${
                  interviewMode === 'text'
                    ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 shadow-sm'
                    : 'border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/60 bg-white'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    interviewMode === 'text'
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h5
                    className={`text-sm font-bold ${
                      interviewMode === 'text' ? 'text-indigo-950' : 'text-slate-900'
                    }`}
                  >
                    Text & Code Mode
                  </h5>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Type structured answers with code snippets and review before submitting.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setInterviewMode('voice')}
                className={`flex items-start gap-3.5 p-4.5 rounded-2xl border text-left transition-all ${
                  interviewMode === 'voice'
                    ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 shadow-sm'
                    : 'border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/60 bg-white'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    interviewMode === 'voice'
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Mic2 className="w-5 h-5" />
                </div>
                <div>
                  <h5
                    className={`text-sm font-bold ${
                      interviewMode === 'voice' ? 'text-indigo-950' : 'text-slate-900'
                    }`}
                  >
                    Voice Interview Mode
                  </h5>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Listen to audio questions and speak your response with real-time STT transcription.
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Executive Session Pass & Launchpad */}
        <div className="lg:col-span-5 sticky top-6">
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-800 space-y-6">
            {/* Header Badge */}
            <div className="flex items-center justify-between pb-5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">
                  Ready to Launch
                </span>
              </div>
              <span className="text-xs text-slate-400 font-medium">Session #22</span>
            </div>

            {/* Candidate Card */}
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4.5 flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-black text-base flex items-center justify-center shadow-md shadow-indigo-950">
                {profile.name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-white truncate">{profile.name}</h4>
                <p className="text-xs text-indigo-300 truncate font-medium">{profile.targetRole}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-slate-700/80 text-slate-300">
                    {profile.experienceLevel}
                  </span>
                  {profile.resumeText && (
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Resume Attached
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Session Specifications */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-slate-800/80">
                <span className="text-slate-400">Interview Domain</span>
                <span className="font-bold text-slate-100">{selectedTypeObj?.label}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-800/80">
                <span className="text-slate-400">Target Difficulty</span>
                <span className="font-bold text-slate-100">{selectedDiffObj?.label} ({selectedDiffObj?.badge})</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-800/80">
                <span className="text-slate-400">Question Volume</span>
                <span className="font-bold text-slate-100">
                  {questionCount} Questions ({selectedCountObj?.duration})
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-800/80">
                <span className="text-slate-400">Response Mode</span>
                <span className="font-bold text-slate-100 capitalize">{interviewMode} Response</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-800/80">
                <span className="text-slate-400">AI Coach Engine</span>
                <span className="font-bold text-indigo-300">IBM watsonx Orchestrate v2.0</span>
              </div>
            </div>

            {/* Skills Tags */}
            {profile.skills && profile.skills.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Target Evaluation Skills
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-[11px] font-medium bg-slate-800 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-700/60"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Launch Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleStart}
                disabled={loading}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold text-base shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2.5 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Preparing Interview Room...</span>
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-5 h-5 text-white" />
                    <span>Start Mock Interview</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
              <p className="text-[11px] text-slate-400 text-center mt-3">
                Questions and rubric evaluations are generated live by IBM watsonx Orchestrate.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
