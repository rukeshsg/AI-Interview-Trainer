
import { useNavigate } from 'react-router-dom';
import {
  Brain, Target, FileText, Code2, Users, Star, BarChart3,
  ArrowRight, CheckCircle, Zap, Shield, Award,
} from 'lucide-react';
import { Button } from '../components/ui/Button';

const FEATURES = [
  { icon: Brain,    title: 'Personalized Questions',    desc: 'Interview questions tailored to your role, experience level, and skills — powered by IBM watsonx Orchestrate.' },
  { icon: FileText, title: 'Resume-Based Preparation', desc: 'Upload your PDF or DOCX resume for context-aware question generation aligned to your actual background.' },
  { icon: Code2,    title: 'Technical Assessment',     desc: 'Deep-dive technical questions covering algorithms, databases, APIs, system design, and your specific tech stack.' },
  { icon: Users,    title: 'HR & Behavioral Practice', desc: 'Comprehensive HR interview prep with STAR-method behavioral scenarios and soft skills evaluation.' },
  { icon: Star,     title: 'AI Answer Evaluation',     desc: 'Each answer scored across 5 dimensions with actionable feedback and a model answer from the AI coach.' },
  { icon: BarChart3, title: 'Performance Reports',    desc: 'Detailed session reports with category scores, strengths, weaknesses, and targeted improvement recommendations.' },
];

const STEPS = [
  { num: '1', title: 'Build Your Profile',    desc: 'Enter your name, target role, experience level, and key skills.' },
  { num: '2', title: 'Choose Interview Type', desc: 'Select Technical, HR, Behavioral, or Mixed — set difficulty and question count.' },
  { num: '3', title: 'Practice With AI',      desc: 'Answer questions one at a time in a focused mock interview workspace.' },
  { num: '4', title: 'Improve With Feedback', desc: 'Review your scores, model answers, and a complete performance report.' },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* ── Nav ────────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900">AI Interview Trainer</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>Dashboard</Button>
            <Button onClick={() => navigate('/prepare')}>Get Started</Button>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
              <Zap className="w-3 h-3" />
              Powered by IBM watsonx Orchestrate
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight mb-4">
              AI Interview Trainer
            </h1>
            <p className="text-xl text-indigo-600 font-medium mb-4">
              Prepare Smarter. Practice Better. Interview with Confidence.
            </p>
            <p className="text-slate-600 text-base leading-relaxed mb-8">
              A RAG-powered AI interview preparation platform that creates personalized interview questions,
              evaluates your answers, and helps you improve your technical, HR, and behavioral interview performance.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" onClick={() => navigate('/prepare')} icon={<ArrowRight className="w-5 h-5" />}>
                Start Preparing
              </Button>
              <Button size="lg" variant="secondary" onClick={() => navigate('/interview')} icon={<Target className="w-5 h-5" />}>
                Try Mock Interview
              </Button>
            </div>
            <div className="flex flex-wrap gap-4 mt-8">
              {['Free to use', 'No sign-up needed', 'IBM AI-powered'].map((t) => (
                <div key={t} className="flex items-center gap-1.5 text-sm text-slate-500">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  {t}
                </div>
              ))}
            </div>
          </div>

          {/* Product preview card */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <Brain className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Technical Interview</p>
                  <p className="text-xs text-slate-500">Python Developer • Fresher</p>
                </div>
                <span className="ml-auto bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">Live</span>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 mb-4">
                <p className="text-xs text-slate-500 mb-2">Question 2 of 5 • Medium</p>
                <p className="text-sm font-medium text-slate-800">
                  Explain the difference between a list and a tuple in Python. When would you use each?
                </p>
              </div>

              <div className="space-y-2 mb-4">
                {[
                  { label: 'Technical Accuracy', pct: 85 },
                  { label: 'Clarity',             pct: 90 },
                  { label: 'Completeness',        pct: 75 },
                ].map(({ label, pct }) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>{label}</span><span>{pct}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Overall Score</span>
                <span className="text-2xl font-bold text-indigo-600">8.2<span className="text-sm text-slate-400">/10</span></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────────── */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Everything You Need to Ace Your Interview</h2>
            <p className="text-slate-600 max-w-xl mx-auto">From personalized question generation to AI-powered evaluation — all in one platform.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-2">{title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">How It Works</h2>
            <p className="text-slate-600">Get interview-ready in four simple steps.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map(({ num, title, desc }) => (
              <div key={num} className="text-center">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">
                  {num}
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1">{title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Technology ─────────────────────────────────────────────────────── */}
      <section className="bg-indigo-600 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Shield className="w-10 h-10 text-indigo-200 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-3">Powered by Enterprise AI</h2>
          <p className="text-indigo-200 text-sm max-w-xl mx-auto mb-8">
            Built on IBM watsonx Orchestrate with a RAG (Retrieval-Augmented Generation) knowledge base
            containing expert interview guidance for technical, HR, and behavioral interviews.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {['IBM watsonx Orchestrate', 'RAG Knowledge Base', 'IBM Cloud'].map((t) => (
              <div key={t} className="bg-white/10 text-white text-sm font-medium px-4 py-2 rounded-xl">
                {t}
              </div>
            ))}
          </div>
          <p className="text-indigo-300 text-xs mt-6">
            This application is powered by IBM technology. It is not an official IBM product.
          </p>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <Award className="w-10 h-10 text-indigo-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Ready to Prepare?</h2>
          <p className="text-slate-600 mb-8">Start your first mock interview today and get personalized AI feedback.</p>
          <Button size="lg" onClick={() => navigate('/prepare')} icon={<ArrowRight className="w-5 h-5" />}>
            Start Preparing — It's Free
          </Button>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-100 py-6">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <span>© 2024 AI Interview Trainer — Problem Statement No. 22</span>
          <span>Powered by IBM watsonx Orchestrate</span>
        </div>
      </footer>
    </div>
  );
}
