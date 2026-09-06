import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

import { Badge, typeBadge, difficultyBadge } from '../components/ui/Badge';
import { Spinner, EmptyState } from '../components/ui/Feedback';
import { Button } from '../components/ui/Button';
import { getAllSessions } from '../api/interviewApi';
import type { InterviewSession } from '../types';

const TYPE_FILTERS: { value: string; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'technical', label: 'Technical' },
  { value: 'hr', label: 'HR' },
  { value: 'behavioral', label: 'Behavioral' },
  { value: 'mixed', label: 'Mixed' },
];

export default function HistoryPage() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');

  useEffect(() => {
    getAllSessions().then(setSessions).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = sessions
    .filter((s) => typeFilter === 'all' || s.interviewType === typeFilter)
    .filter((s) => !search || s.role.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'score') return (b.overallScore ?? 0) - (a.overallScore ?? 0);
      return new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime();
    });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Interview History</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Search by role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {TYPE_FILTERS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setTypeFilter(value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                typeFilter === value
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <select
          className="input w-auto text-sm"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'date' | 'score')}
        >
          <option value="date">Sort: Date</option>
          <option value="score">Sort: Score</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner text="Loading history..." /></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No interview sessions yet"
          description="Start your first mock interview and your performance history will appear here."
          action={<Button onClick={() => navigate('/prepare')}>Start Interview</Button>}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => {
            const score = s.overallScore;
            const scoreColor = !score ? 'text-slate-400' : score >= 8 ? 'text-green-600' : score >= 6 ? 'text-yellow-500' : 'text-red-500';
            return (
              <div
                key={s.id}
                onClick={() => navigate(`/reports/${s.id}`)}
                className="card px-5 py-4 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 truncate">{s.role}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <Badge variant={typeBadge(s.interviewType)}>{s.interviewType}</Badge>
                    <Badge variant={difficultyBadge(s.difficulty)}>{s.difficulty}</Badge>
                    <span className="text-xs text-slate-400">{new Date(s.startedAt).toLocaleDateString()}</span>
                    <Badge variant={s.status === 'completed' ? 'success' : 'warning'}>{s.status}</Badge>
                  </div>
                </div>
                <div className="flex-shrink-0 ml-4 text-right">
                  {score !== undefined && (
                    <p className={`text-xl font-bold ${scoreColor}`}>{score.toFixed(1)}</p>
                  )}
                  <p className="text-xs text-slate-400">{s.questionCount}Q</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
