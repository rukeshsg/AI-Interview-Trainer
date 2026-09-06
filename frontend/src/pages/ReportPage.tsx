import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Award, ArrowLeft, RefreshCw, Download, ChevronDown, ChevronUp,
  CheckCircle, AlertTriangle, TrendingUp, Sparkles, Brain, LayoutDashboard,
  Calendar, Clock, Target, HelpCircle
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge, difficultyBadge, typeBadge } from '../components/ui/Badge';
import { Spinner, ProgressBar } from '../components/ui/Feedback';
import { getSessionDetail } from '../api/interviewApi';
import type { CategoryAverages } from '../types';

function ScoreCircle({ score }: { score: number }) {
  const color = score >= 8 ? 'text-emerald-600' : score >= 6 ? 'text-amber-600' : 'text-rose-600';
  const bg = score >= 8 ? 'bg-emerald-50 border-emerald-200' : score >= 6 ? 'bg-amber-50 border-amber-200' : 'bg-rose-50 border-rose-200';
  return (
    <div className={`w-28 h-28 rounded-3xl ${bg} border-2 flex flex-col items-center justify-center shadow-xs flex-shrink-0`}>
      <span className={`text-4xl font-black ${color} tracking-tight`}>{score.toFixed(1)}</span>
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Out of 10</span>
    </div>
  );
}

function downloadReportTxt(session: any) {
  const lines: string[] = [
    '===============================================================',
    '       AI INTERVIEW TRAINER — CANDIDATE PERFORMANCE REPORT',
    '===============================================================',
    '',
    `Candidate Profile : ${session.profile?.name || 'N/A'}`,
    `Role Target       : ${session.role}`,
    `Interview Type    : ${session.interviewType}`,
    `Difficulty Level  : ${session.difficulty}`,
    `Mode              : ${session.interviewMode === 'voice' ? 'Voice Interactive' : 'Text Written'}`,
    `Session Date      : ${new Date(session.startedAt).toLocaleString()}`,
    `Status            : ${session.status}`,
    '',
    `OVERALL PERFORMANCE SCORE: ${(session.overallScore ?? 0).toFixed(1)} / 10`,
    '',
    '--- CATEGORY RUBRIC BREAKDOWN ---',
    ...(session.categoryAverages ? Object.entries(session.categoryAverages).map(
      ([k, v]) => `  • ${k.replace(/([A-Z])/g, ' $1').trim()}: ${(v as number).toFixed(1)}/10`
    ) : ['  No rubric breakdown available']),
    '',
    '--- CANDIDATE STRENGTHS ---',
    ...(session.strongAreas && session.strongAreas.length > 0
      ? session.strongAreas.map((s: string) => `  [+] ${s}`)
      : ['  Consistent technical structure']),
    '',
    '--- TARGETED AREAS TO IMPROVE ---',
    ...(session.weakAreas && session.weakAreas.length > 0
      ? session.weakAreas.map((s: string) => `  [-] ${s}`)
      : ['  Deepen concrete metrics and live examples']),
    '',
    '--- STRATEGIC ACTION RECOMMENDATIONS ---',
    ...(session.recommendations && session.recommendations.length > 0
      ? session.recommendations.map((r: string, i: number) => `  ${i + 1}. ${r}`)
      : ['  Continue regular role-specific practice']),
    '',
    `Readiness Summary: ${session.readinessSummary || 'Completed session evaluations.'}`,
    '',
    '--- QUESTION-BY-QUESTION BREAKDOWN ---',
    ...(session.questions || []).map((q: any, i: number) => {
      const ev = session.evaluations?.find((e: any) => e.questionId === q.id);
      const ans = session.answers?.find((a: any) => a.questionId === q.id);
      return [
        `Q${i + 1} (${q.topic} - ${q.difficulty}):`,
        `Question: ${q.question}`,
        `Candidate Response: ${ans?.answer || 'No response recorded'}`,
        `Score: ${ev?.overallScore?.toFixed(1) ?? 'N/A'}/10`,
        `Feedback: ${ev?.feedback || 'Evaluated against IBM watsonx rubrics'}`,
        '---------------------------------------------------------------',
      ].join('\n');
    }),
    '',
    '===============================================================',
    'Powered by IBM watsonx Orchestrate & Granite AI Models',
    '===============================================================',
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `interview-report-${session.role.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${session.id?.substring(0, 8)}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function ReportPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedQ, setExpandedQ] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    getSessionDetail(sessionId)
      .then(setSession)
      .catch(() => navigate('/history'))
      .finally(() => setLoading(false));
  }, [sessionId, navigate]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Spinner size="lg" text="Loading comprehensive performance report..." />
      </div>
    );
  }
  if (!session) return null;

  const ca: CategoryAverages = session.categoryAverages || {
    technicalAccuracy: 0,
    relevance: 0,
    clarity: 0,
    completeness: 0,
    communication: 0,
  };
  const overallScore = session.overallScore ?? 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Action Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/history')}
          icon={<ArrowLeft className="w-4 h-4" />}
        >
          Back to History
        </Button>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => downloadReportTxt(session)}
            icon={<Download className="w-4 h-4" />}
          >
            Download TXT Report
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/prepare/setup')}
            icon={<RefreshCw className="w-4 h-4" />}
          >
            Setup New Session
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/dashboard')}
            icon={<LayoutDashboard className="w-4 h-4" />}
          >
            Dashboard
          </Button>
        </div>
      </div>

      {/* Main Hero Card */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle className="w-3.5 h-3.5" />
                Interview Completed
              </span>
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(session.startedAt).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {session.role} Performance Report
            </h1>
            <p className="text-sm text-slate-500">
              Candidate: <span className="font-semibold text-slate-800">{session.profile?.name || 'RUKESH S G'}</span> · Session ID: <span className="font-mono text-xs">{session.id.slice(0, 8)}</span>
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Badge variant={typeBadge(session.interviewType)}>{session.interviewType}</Badge>
              <Badge variant={difficultyBadge(session.difficulty)}>{session.difficulty}</Badge>
              <Badge variant={session.interviewMode === 'voice' ? 'purple' : 'info'}>
                {session.interviewMode === 'voice' ? '🎙️ Voice Mode' : '💬 Text Mode'}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-5 bg-slate-50/80 p-4 sm:p-5 rounded-2xl border border-slate-200/60">
            <ScoreCircle score={overallScore} />
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Verdict</span>
              <p className="text-lg font-extrabold text-slate-900">
                {overallScore >= 8 ? 'Interview Ready' : overallScore >= 6 ? 'Competent / Ready to Polish' : 'Needs Targeted Practice'}
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-[200px] leading-relaxed">
                {session.readinessSummary || `Successfully evaluated across ${session.questions?.length || 0} rubric questions.`}
              </p>
            </div>
          </div>
        </div>

        {/* Category Rubrics */}
        <div className="pt-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-indigo-600" />
            Performance by Competency Area
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(ca).map(([key, val]) => (
              <div key={key} className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
                <ProgressBar
                  label={key.replace(/([A-Z])/g, ' $1').trim()}
                  value={val as number}
                  max={10}
                  color={(val as number) >= 8 ? 'green' : (val as number) >= 6 ? 'indigo' : 'yellow'}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Strengths and Weaknesses Grid */}
      {(session.strongAreas?.length > 0 || session.weakAreas?.length > 0) && (
        <div className="grid sm:grid-cols-2 gap-5 mb-6">
          {session.strongAreas?.length > 0 && (
            <Card className="border-emerald-200/70 bg-white">
              <p className="text-sm font-bold text-emerald-800 flex items-center gap-2 mb-3">
                <CheckCircle className="w-4 h-4 text-emerald-600" /> Demonstrated Strengths
              </p>
              <ul className="space-y-2">
                {session.strongAreas.map((s: string, i: number) => (
                  <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                    <span className="text-emerald-500 font-bold mt-0.5">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {session.weakAreas?.length > 0 && (
            <Card className="border-amber-200/70 bg-white">
              <p className="text-sm font-bold text-amber-800 flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> Key Growth Areas
              </p>
              <ul className="space-y-2">
                {session.weakAreas.map((s: string, i: number) => (
                  <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                    <span className="text-amber-500 font-bold mt-0.5">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}

      {/* AI Recommendations */}
      {session.recommendations?.length > 0 && (
        <Card className="mb-6 border-indigo-100 bg-gradient-to-br from-indigo-50/30 to-white">
          <p className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-indigo-600" /> Strategic Action Plan & Tips
          </p>
          <div className="space-y-3">
            {session.recommendations.map((r: string, i: number) => (
              <div key={i} className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-indigo-100/60 shadow-2xs">
                <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {i + 1}
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">{r}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Detailed Question Review */}
      {session.questions?.length > 0 && (
        <Card className="mb-6">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-slate-500" />
            Detailed Question & Answer Audit ({session.questions.length})
          </h2>
          <div className="space-y-3">
            {session.questions.map((q: any) => {
              const ev = session.evaluations?.find((e: any) => e.questionId === q.id);
              const answer = session.answers?.find((a: any) => a.questionId === q.id);
              const isOpen = expandedQ === q.id;
              const score = ev?.overallScore;
              const scoreColor = !score ? 'text-slate-400' : score >= 8 ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : score >= 6 ? 'text-amber-600 bg-amber-50 border-amber-200' : 'text-rose-600 bg-rose-50 border-rose-200';
              return (
                <div key={q.id} className="border border-slate-200 rounded-2xl overflow-hidden transition-all">
                  <button
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50/80 transition-colors"
                    onClick={() => setExpandedQ(isOpen ? null : q.id)}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <span className="text-xs font-bold px-2 py-1 rounded-md bg-slate-100 text-slate-600 flex-shrink-0">
                        Q{q.questionNumber}
                      </span>
                      <Badge variant={typeBadge(q.type)}>{q.topic}</Badge>
                      <span className="text-sm font-semibold text-slate-800 truncate">{q.question}</span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {score !== undefined && (
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${scoreColor}`}>
                          {score.toFixed(1)} / 10
                        </span>
                      )}
                      {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </button>
                  {isOpen && (
                    <div className="p-4 border-t border-slate-100 bg-slate-50/60 space-y-4">
                      {answer && (
                        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80">
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Candidate Response</p>
                          <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line">{answer.answer}</p>
                        </div>
                      )}
                      {ev && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                            {[
                              { label: 'Technical', val: ev.technicalAccuracy },
                              { label: 'Relevance', val: ev.relevance },
                              { label: 'Clarity', val: ev.clarity },
                              { label: 'Complete', val: ev.completeness },
                              { label: 'Comm', val: ev.communication },
                            ].map((s) => (
                              <div key={s.label} className="bg-white p-2 rounded-lg border border-slate-100 text-center">
                                <span className="text-[10px] text-slate-400 uppercase font-semibold">{s.label}</span>
                                <p className="text-xs font-bold text-slate-800">{s.val}/10</p>
                              </div>
                            ))}
                          </div>
                          {ev.strengths?.length > 0 && (
                            <div>
                              <p className="text-xs font-bold text-emerald-700 mb-1">Strengths:</p>
                              <ul className="space-y-1">
                                {ev.strengths.map((s: string, i: number) => (
                                  <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                                    <span className="text-emerald-500">•</span>{s}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {ev.improvements?.length > 0 && (
                            <div>
                              <p className="text-xs font-bold text-amber-700 mb-1">Improvement Points:</p>
                              <ul className="space-y-1">
                                {ev.improvements.map((s: string, i: number) => (
                                  <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                                    <span className="text-amber-500">•</span>{s}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Footer Navigation CTAs */}
      <div className="flex flex-wrap items-center justify-center gap-3 py-4">
        <Button
          variant="primary"
          onClick={() => navigate('/prepare/setup')}
          icon={<RefreshCw className="w-4 h-4" />}
          size="lg"
        >
          Practice Another Interview
        </Button>
        <Button
          variant="secondary"
          onClick={() => navigate('/chat')}
          icon={<Brain className="w-4 h-4" />}
          size="lg"
        >
          Discuss Report with AI Coach
        </Button>
      </div>
    </div>
  );
}
