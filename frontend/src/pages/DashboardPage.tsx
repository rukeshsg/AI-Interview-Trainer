import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock, PlayCircle, Code2, Users, Brain, FileUp, MessageSquare,
  Sparkles, ChevronRight, Award, Target, BarChart2, CheckCircle2
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge, typeBadge } from '../components/ui/Badge';
import { Spinner, EmptyState, ProgressBar } from '../components/ui/Feedback';
import { useApp } from '../context/AppContext';
import { getAllSessions, startSession } from '../api/interviewApi';
import type { InterviewSession, InterviewType } from '../types';
import toast from 'react-hot-toast';

function ScoreBadge({ score }: { score?: number }) {
  if (score === undefined || score === null) {
    return <span className="text-xs text-slate-400 font-medium">In Progress</span>;
  }
  const color = score >= 8 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : score >= 6 ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-rose-700 bg-rose-50 border-rose-200';
  return (
    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${color}`}>
      {score.toFixed(1)} <span className="text-[10px] font-normal opacity-75">/10</span>
    </span>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { profile, setCurrentSession } = useApp();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingType, setStartingType] = useState<string | null>(null);

  useEffect(() => {
    getAllSessions()
      .then(setSessions)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const completed = sessions.filter((s) => s.status === 'completed');
  const scoredSessions = sessions.filter((s) => typeof s.overallScore === 'number' && s.overallScore > 0);
  const scores = scoredSessions.map((s) => s.overallScore as number);
  const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const bestScore = scores.length ? Math.max(...scores) : 0;
  const totalQuestions = sessions.reduce((acc, s) => acc + (s.questionCount || 5), 0);

  const progressAreas = [
    { label: 'Technical Concepts', value: Math.min(10, avgScore > 0 ? avgScore * 0.95 : 0) },
    { label: 'HR & Communication', value: Math.min(10, avgScore > 0 ? avgScore * 1.05 : 0) },
    { label: 'Behavioral Situations', value: Math.min(10, avgScore > 0 ? avgScore * 0.9 : 0) },
    { label: 'Interview Readiness', value: (completed.length > 0 || scoredSessions.length > 0) ? Math.min(10, avgScore + Math.max(completed.length, scoredSessions.length) * 0.4) : 0 },
  ];

  async function handleQuickStart(type?: InterviewType) {
    if (!profile) {
      toast('Please set up your candidate profile first.', { icon: '👤' });
      navigate('/prepare');
      return;
    }

    if (!type) {
      navigate('/prepare/setup');
      return;
    }

    setStartingType(type);
    try {
      const session = await startSession({
        candidateId: profile.id,
        role: profile.targetRole,
        experienceLevel: profile.experienceLevel,
        interviewType: type,
        difficulty: 'medium',
        questionCount: 5,
        interviewMode: 'text',
      });
      setCurrentSession(session);
      navigate(`/interview/${session.id}`);
    } catch {
      toast.error('Could not start quick session. Please try again.');
    } finally {
      setStartingType(null);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5" /> Powered by IBM watsonx Orchestrate
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back{profile?.name ? `, ${profile.name.split(' ')[0]}` : ''}!
            </h1>
            <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
              {profile
                ? `Preparing for your ${profile.targetRole} role with AI-curated interview questions and personalized scoring.`
                : 'Build your profile and start your mock interview journey today.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              onClick={() => handleQuickStart()}
              icon={<PlayCircle className="w-5 h-5" />}
              className="shadow-lg shadow-indigo-600/30"
            >
              Start Interview
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => navigate('/chat')}
              icon={<MessageSquare className="w-5 h-5" />}
              className="bg-white/10 text-white hover:bg-white/20 border-white/10"
            >
              AI Assistant
            </Button>
          </div>
        </div>

        {/* Decorative ambient background orb */}
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Interviews Completed',
            value: completed.length > 0 ? `${completed.length}` : `${scoredSessions.length}`,
            subtext: sessions.length > 0 ? `${sessions.length} total sessions created` : 'Start your first mock test',
            icon: Target,
            color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 dark:text-indigo-400',
            isScore: false,
          },
          {
            label: 'Average Score',
            value: avgScore > 0 ? `${avgScore.toFixed(1)}` : 'Not Rated',
            unit: avgScore > 0 ? '/ 10' : undefined,
            subtext: scores.length > 0 ? `Across ${scores.length} scored session${scores.length > 1 ? 's' : ''}` : 'Complete a test to get rated',
            icon: BarChart2,
            color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400',
            isScore: avgScore > 0,
          },
          {
            label: 'Best Performance',
            value: bestScore > 0 ? `${bestScore.toFixed(1)}` : 'Not Rated',
            unit: bestScore > 0 ? '/ 10' : undefined,
            subtext: bestScore > 0 ? 'Highest interview rating' : 'Awaiting first test rating',
            icon: Award,
            color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-400',
            isScore: bestScore > 0,
          },
          {
            label: 'Questions Practiced',
            value: `${totalQuestions || 0}`,
            subtext: 'Curated by IBM Agent',
            icon: CheckCircle2,
            color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/50 dark:text-blue-400',
            isScore: false,
          },
        ].map(({ label, value, unit, subtext, icon: Icon, color, isScore }) => (
          <div
            key={label}
            className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</span>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-1.5">
                <p className={`text-2xl sm:text-3xl font-extrabold ${value === 'Not Rated' ? 'text-slate-400 dark:text-slate-500 text-xl sm:text-2xl' : 'text-slate-900 dark:text-white'}`}>
                  {value}
                </p>
                {unit && (
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">{unit}</span>
                )}
              </div>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 font-medium">
              {subtext}
            </p>
          </div>
        ))}
      </div>

      {/* Main Grid: Quick Actions & Recent Sessions */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Quick Action Cards & Practice Modes */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" /> Practice Modes & Actions
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                {
                  type: 'technical' as InterviewType,
                  title: 'Technical Practice',
                  desc: 'Code concepts, system design, databases, APIs',
                  icon: Code2,
                  color: 'from-blue-600 to-indigo-600',
                },
                {
                  type: 'hr' as InterviewType,
                  title: 'HR & Cultural Fit',
                  desc: 'Career goals, motivation, strengths, soft skills',
                  icon: Users,
                  color: 'from-emerald-600 to-teal-600',
                },
                {
                  type: 'behavioral' as InterviewType,
                  title: 'Behavioral (STAR)',
                  desc: 'Conflict resolution, leadership, situational response',
                  icon: Brain,
                  color: 'from-purple-600 to-violet-600',
                },
                {
                  action: () => navigate('/prepare/resume'),
                  title: 'Upload Resume',
                  desc: 'Extract skills and target role from PDF/DOCX resume',
                  icon: FileUp,
                  color: 'from-amber-500 to-orange-500',
                },
              ].map(({ type, action, title, desc, icon: Icon, color }) => (
                <button
                  key={title}
                  onClick={() => (action ? action() : handleQuickStart(type))}
                  disabled={startingType === type}
                  className="group bg-white text-left p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${color} text-white flex items-center justify-center mb-3 shadow-md group-hover:scale-105 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{title}</p>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{desc}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600">
                    <span>{startingType === type ? 'Preparing...' : 'Start Practice'}</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Sessions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" /> Recent Interview Sessions
              </h2>
              {sessions.length > 0 && (
                <button
                  onClick={() => navigate('/history')}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  View full history <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {loading ? (
              <Card className="py-8"><Spinner text="Loading sessions..." /></Card>
            ) : sessions.length === 0 ? (
              <Card className="py-8">
                <EmptyState
                  icon={<Clock className="w-6 h-6 text-slate-400" />}
                  title="No interview sessions yet"
                  description="Start your first mock interview and your real-time score evaluations will appear here."
                  action={<Button size="sm" onClick={() => handleQuickStart()}>Start Your First Interview</Button>}
                />
              </Card>
            ) : (
              <div className="space-y-3">
                {sessions.slice(0, 5).map((s) => (
                  <div
                    key={s.id}
                    onClick={() => navigate(`/reports/${s.id}`)}
                    className="group bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow hover:border-slate-300 transition-all cursor-pointer flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                          {s.role}
                        </p>
                        <Badge variant={typeBadge(s.interviewType)} className="text-[10px]">
                          {s.interviewType}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span>{new Date(s.startedAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{s.questionCount} Questions</span>
                        <span>•</span>
                        <span className="capitalize">{s.difficulty} difficulty</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <ScoreBadge score={s.overallScore} />
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Readiness & Profile Highlights */}
        <div className="space-y-6">
          <Card padding="md" className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" /> Skill Competency Breakdown
            </h3>
            <div className="space-y-3">
              {progressAreas.map(({ label, value }) => (
                <ProgressBar
                  key={label}
                  label={label}
                  value={value}
                  max={10}
                  color={value >= 7.5 ? 'green' : value >= 5 ? 'indigo' : 'yellow'}
                />
              ))}
            </div>
          </Card>

          <Card padding="md" className="space-y-3 bg-gradient-to-br from-indigo-50/50 to-slate-50">
            <h3 className="text-sm font-bold text-slate-900">Active Profile</h3>
            {profile ? (
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Candidate</span>
                  <span className="font-semibold text-slate-800">{profile.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Role</span>
                  <span className="font-semibold text-slate-800">{profile.targetRole}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Experience</span>
                  <span className="capitalize font-semibold text-slate-800">{profile.experienceLevel}</span>
                </div>
                <div className="pt-2 border-t border-slate-200/60 flex flex-wrap gap-1">
                  {profile.skills.slice(0, 6).map((sk) => (
                    <span key={sk} className="bg-white border border-slate-200 px-2 py-0.5 rounded text-[10px] text-slate-700 font-medium">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">No profile configured yet.</p>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/profile')}
              className="w-full mt-2 text-xs"
            >
              Edit Candidate Details
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
