import React from 'react';
import { Brain, Database, Cloud, Cpu } from 'lucide-react';
import { Card } from '../components/ui/Card';

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
          <Brain className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">About AI Interview Trainer</h1>
          <p className="text-sm text-slate-500">Problem Statement No. 22 — Interview Trainer Agent</p>
        </div>
      </div>

      <Card className="mb-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-2">Project Overview</h2>
        <p className="text-sm text-slate-600 leading-relaxed mb-3">
          AI Interview Trainer is a RAG-powered interview preparation platform that helps students, fresh graduates,
          and job seekers practice for technical, HR, behavioral, and mixed interviews. It uses the IBM watsonx
          Orchestrate Interview Trainer Agent as its AI reasoning layer.
        </p>
        <p className="text-sm text-slate-600 leading-relaxed">
          The system retrieves role-specific interview questions, industry expectations, behavioral scenarios,
          and HR guidelines from its knowledge base via Retrieval-Augmented Generation (RAG). It evaluates answers,
          provides scores across 5 dimensions, and generates a comprehensive performance report.
        </p>
      </Card>

      <Card className="mb-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">Technology Stack</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              icon: Brain,
              title: 'IBM watsonx Orchestrate',
              desc: 'Enterprise AI orchestration platform serving as the core AI reasoning and RAG layer. Powers question generation, answer evaluation, and coaching responses.',
              badge: 'AI Engine',
            },
            {
              icon: Database,
              title: 'RAG Knowledge Base',
              desc: 'IBM Interview Knowledge Base containing HR, technical, Python, SQL, and behavioral interview guidance. Used by the agent for retrieval-augmented generation.',
              badge: 'Knowledge',
            },
            {
              icon: Cloud,
              title: 'IBM Cloud',
              desc: 'IBM Cloud IAM authentication and cloud infrastructure powering the agent deployment, Speech to Text, and Text to Speech services.',
              badge: 'Cloud',
            },
            {
              icon: Cpu,
              title: 'Application Stack',
              desc: 'React 18 + TypeScript + Tailwind CSS frontend. Node.js + Express + TypeScript backend. SQLite database. pdf-parse + mammoth for resume parsing.',
              badge: 'Full Stack',
            },
          ].map(({ icon: Icon, title, desc, badge }) => (
            <div key={title} className="flex gap-3">
              <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-slate-900">{title}</p>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">{badge}</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="mb-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">How It Works</h2>
        <ol className="space-y-3">
          {[
            ['Profile Setup', 'You enter your name, target role, experience level, and skills. Optionally upload a resume (PDF/DOCX) for context-aware questions.'],
            ['Interview Configuration', 'Select interview type (Technical, HR, Behavioral, Mixed), difficulty, question count, and mode (Text or Voice).'],
            ['Question Generation', 'The IBM watsonx Orchestrate agent generates role-specific questions using the RAG knowledge base, tailored to your profile.'],
            ['Answer Evaluation', 'Each answer is evaluated by the IBM agent across 5 dimensions: Technical Accuracy, Relevance, Clarity, Completeness, and Communication.'],
            ['Performance Report', 'A final report is generated with overall scores, category breakdowns, strengths, weaknesses, and improvement recommendations.'],
          ].map(([title, desc], i) => (
            <li key={i} className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
              <div>
                <p className="text-sm font-medium text-slate-900">{title}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-slate-900 mb-3">Known Limitations & Future Plans</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-slate-700 mb-2">Current Limitations</p>
            <ul className="space-y-1">
              {[
                'No user authentication (session-based only)',
                'Voice interview requires IBM Speech credentials',
                'Single-user mode (no multi-user support)',
                'Resume parsing limited to text extraction',
              ].map((l) => <li key={l} className="text-xs text-slate-500 flex gap-1.5"><span>•</span>{l}</li>)}
            </ul>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-700 mb-2">Planned Enhancements</p>
            <ul className="space-y-1">
              {[
                'User authentication & accounts',
                'Full voice interview pipeline',
                'Email performance reports',
                'Company-specific preparation',
                'Advanced analytics dashboard',
              ].map((l) => <li key={l} className="text-xs text-slate-500 flex gap-1.5"><span>•</span>{l}</li>)}
            </ul>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-400">
            This application is powered by IBM watsonx Orchestrate technology. It is not an official IBM product.
            Built as an internship/portfolio project demonstrating Problem Statement No. 22 — Interview Trainer Agent.
          </p>
        </div>
      </Card>
    </div>
  );
}
