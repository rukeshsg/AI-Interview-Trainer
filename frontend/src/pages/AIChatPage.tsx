import React, { useState, useRef, useEffect } from 'react';
import {
  Send, Sparkles, RefreshCw, AlertCircle, Plus,
  Code2, Users, Brain, Calendar, ArrowRight,
  Mic, MicOff, Copy, Check, Sun, Moon, Zap, MessageSquare
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAgentStatus } from '../hooks/useAgentStatus';
import { sendChatMessage } from '../api/chatApi';
import { startSpeechRecognition, isSpeechRecognitionSupported } from '../services/voiceService';
import { MarkdownRenderer } from '../components/ui/MarkdownRenderer';
import { v4 as uuidv4 } from 'uuid';
import type { ChatMessage } from '../types';
import toast from 'react-hot-toast';

const CHAT_STORAGE_KEY = 'ait_trainer_chat_messages';

const QUICK_TOPICS = [
  {
    icon: Code2,
    label: 'Technical Challenge',
    prompt: 'Give me a challenging technical interview question for my target role.',
  },
  {
    icon: Users,
    label: 'HR Interview',
    prompt: 'How should I structure my answer to "Tell me about yourself"?',
  },
  {
    icon: Brain,
    label: 'Behavioral STAR',
    prompt: 'Give me a behavioral interview scenario using the STAR framework.',
  },
  {
    icon: Calendar,
    label: '3-Day Plan',
    prompt: 'Create a focused 3-day interview preparation plan for my target role.',
  },
];

const HERO_CARDS = [
  {
    icon: Code2,
    title: 'Role-Specific Technical Questions',
    desc: 'Targeted algorithmic, framework, and machine learning / system design challenges calibrated for your profile.',
    prompt: 'Give me a challenging technical interview question for my target role with evaluation criteria.',
    darkGradient: 'from-indigo-950/40 to-slate-900/60 border-indigo-500/20 hover:border-indigo-500/40',
    lightGradient: 'from-indigo-50/70 to-white border-indigo-200/80 hover:border-indigo-400',
    iconDark: 'text-indigo-400 bg-indigo-500/10',
    iconLight: 'text-indigo-600 bg-indigo-100',
  },
  {
    icon: Zap,
    title: 'Personalized 3-Day Preparation Strategy',
    desc: 'Structured daily roadmap with high-priority topics, review checklists, and interview execution tips.',
    prompt: 'Create a 3-day intensive interview preparation strategy for my upcoming interview.',
    darkGradient: 'from-teal-950/30 to-slate-900/60 border-teal-500/20 hover:border-teal-500/40',
    lightGradient: 'from-teal-50/70 to-white border-teal-200/80 hover:border-teal-400',
    iconDark: 'text-teal-400 bg-teal-500/10',
    iconLight: 'text-teal-600 bg-teal-100',
  },
  {
    icon: Brain,
    title: 'STAR Behavioral Answer Refiner',
    desc: 'Transform raw past experiences into impactful Situation, Task, Action, and Result responses.',
    prompt: 'How do I structure and refine my answer to: "Tell me about a time you handled a difficult technical obstacle under tight deadlines"?',
    darkGradient: 'from-violet-950/30 to-slate-900/60 border-violet-500/20 hover:border-violet-500/40',
    lightGradient: 'from-violet-50/70 to-white border-violet-200/80 hover:border-violet-400',
    iconDark: 'text-violet-400 bg-violet-500/10',
    iconLight: 'text-violet-600 bg-violet-100',
  },
];

const SUGGESTED_CHIPS = [
  'Explain gradient descent and optimization',
  'How to handle "What is your biggest weakness?"',
  'System design for high-scale microservices',
  'Common red flags interviewers look for',
];

export default function AIChatPage() {
  const { profile, theme, toggleTheme } = useApp();
  const { status: agentStatus, info: agentInfo, refreshStatus } = useAgentStatus();

  const getInitialMessages = (): ChatMessage[] => {
    try {
      const saved = sessionStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  };

  const [messages, setMessages] = useState<ChatMessage[]>(getInitialMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const isSendingRef = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const stopRecordingRef = useRef<(() => void) | null>(null);

  const isDark = theme === 'dark';

  // Persist messages to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // ignore
    }
    if (messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  // Adjust textarea height dynamically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  const candidateName = profile?.name || 'Candidate';
  const candidateRole = profile?.targetRole || 'Software Engineer';
  const candidateInitials = candidateName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'YOU';

  async function sendMessage(text?: string) {
    const msg = (text || input).trim();
    if (!msg || isSendingRef.current) return;

    if (isRecording && stopRecordingRef.current) {
      stopRecordingRef.current();
      setIsRecording(false);
    }

    isSendingRef.current = true;
    setLoading(true);
    setInput('');
    setLastFailedMessage(null);

    const userMsg: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: msg,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);

    try {
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .slice(-6)
        .map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }));

      // Send exact current profile object to guarantee correct name and role
      const currentProfilePayload = profile
        ? {
            name: profile.name,
            targetRole: profile.targetRole,
            experienceLevel: profile.experienceLevel,
            skills: profile.skills,
          }
        : undefined;

      const { reply } = await sendChatMessage(msg, profile?.id, history, currentProfilePayload);

      const aiMsg: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: reply,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setLastFailedMessage(msg);
      const errMsg =
        err.response?.data?.message ||
        'The AI Interview Trainer is temporarily unavailable. Please try again.';
      toast.error(errMsg, { id: 'chat-error' });
    } finally {
      setLoading(false);
      isSendingRef.current = false;
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!loading && input.trim()) {
        sendMessage();
      }
    }
  }

  function handleNewChat() {
    setMessages([]);
    setLastFailedMessage(null);
    setInput('');
    try {
      sessionStorage.removeItem(CHAT_STORAGE_KEY);
    } catch {
      // ignore
    }
  }

  function handleCopy(id: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied to clipboard', { duration: 1500 });
    setTimeout(() => setCopiedId(null), 2000);
  }

  function toggleVoiceInput() {
    if (isRecording) {
      if (stopRecordingRef.current) stopRecordingRef.current();
      setIsRecording(false);
      return;
    }

    if (!isSpeechRecognitionSupported()) {
      toast.error('Voice input is not supported in this browser.');
      return;
    }

    try {
      setIsRecording(true);
      const stop = startSpeechRecognition(
        (transcript) => {
          setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        },
        (err) => {
          setIsRecording(false);
          toast.error(err);
        },
        () => {
          setIsRecording(false);
        }
      );
      stopRecordingRef.current = stop;
    } catch {
      setIsRecording(false);
    }
  }

  const isInitialState = messages.length === 0;

  return (
    <div
      className={`min-h-[calc(100vh-4rem)] flex flex-col justify-between transition-colors duration-200 ${
        isDark ? 'bg-[#0e1017] text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Top Bar */}
      <header
        className={`px-6 py-4 border-b sticky top-0 z-20 flex items-center justify-between backdrop-blur-md transition-colors ${
          isDark
            ? 'bg-[#0e1017]/85 border-white/5 text-white'
            : 'bg-white/85 border-slate-200/80 text-slate-900'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-900/30">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-tight">AI Interview Trainer</span>
              {agentStatus === 'connected' ? (
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    isDark
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  IBM Agent Live
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <AlertCircle className="w-2.5 h-2.5" />
                  Connecting...
                </span>
              )}
            </div>
            <p className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Candidate: <span className="font-bold text-indigo-400">{candidateName}</span> · {candidateRole}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Light / Dark Mode Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className={`p-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              isDark
                ? 'bg-white/5 hover:bg-white/10 text-amber-300 border-white/10'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
            }`}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          <button
            type="button"
            onClick={handleNewChat}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              isDark
                ? 'bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border-white/10'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>
        </div>
      </header>

      {/* Main Canvas */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 flex flex-col justify-center">
        {isInitialState ? (
          /* Hero Prompt Capsule State */
          <div className="flex flex-col items-center justify-center my-auto py-8 text-center space-y-8 animate-fadeIn">
            <div>
              <div
                className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold mb-4 border ${
                  isDark
                    ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300'
                    : 'bg-indigo-50 border-indigo-200 text-indigo-700'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                IBM watsonx Orchestrate AI Trainer
              </div>
              <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                What do you want to practice, {candidateName}?
              </h2>
              <p className={`text-sm mt-2 max-w-lg mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Ask for live technical challenges, answer evaluations, STAR frameworks, or tailored interview plans for a{' '}
                <span className="font-semibold text-indigo-500">{candidateRole}</span>.
              </p>
            </div>

            {/* Central Unified Prompt Capsule */}
            <div
              className={`w-full max-w-3xl border rounded-3xl p-4 shadow-2xl transition-all text-left ${
                isDark
                  ? 'bg-[#161822] border-white/10 focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/20'
                  : 'bg-white border-slate-300 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200'
              }`}
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Ask for practice questions, evaluate an answer, or request prep strategies for ${candidateRole}...`}
                rows={2}
                className={`w-full bg-transparent text-sm sm:text-base outline-none resize-none px-2 py-1 ${
                  isDark ? 'text-slate-100 placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'
                }`}
              />

              {/* Bottom Row inside capsule */}
              <div
                className={`flex flex-wrap items-center justify-between gap-3 pt-3 mt-2 border-t ${
                  isDark ? 'border-white/5' : 'border-slate-100'
                }`}
              >
                <div className="flex flex-wrap items-center gap-1.5">
                  {QUICK_TOPICS.map((topic) => {
                    const Icon = topic.icon;
                    return (
                      <button
                        key={topic.label}
                        type="button"
                        onClick={() => sendMessage(topic.prompt)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                          isDark
                            ? 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border-white/5'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-200'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{topic.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleVoiceInput}
                    className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                      isRecording
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                        : isDark
                        ? 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200'
                    }`}
                    title={isRecording ? 'Listening... click to stop' : 'Voice Input'}
                  >
                    {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || loading}
                    className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 disabled:pointer-events-none transition-all shadow-md shadow-indigo-950 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* 3 Capability Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full max-w-3xl text-left">
              {HERO_CARDS.map((card) => {
                const Icon = card.icon;
                return (
                  <button
                    key={card.title}
                    type="button"
                    onClick={() => sendMessage(card.prompt)}
                    className={`p-4.5 rounded-2xl border bg-gradient-to-b transition-all duration-200 group flex flex-col justify-between text-left cursor-pointer ${
                      isDark ? card.darkGradient : card.lightGradient
                    }`}
                  >
                    <div>
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 ${isDark ? card.iconDark : card.iconLight}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <h4 className={`text-xs font-bold transition-colors ${isDark ? 'text-white group-hover:text-indigo-300' : 'text-slate-900 group-hover:text-indigo-600'}`}>
                        {card.title}
                      </h4>
                      <p className={`text-[11px] mt-1 leading-relaxed line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {card.desc}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-500 mt-3">
                      <span>Launch Prompt</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Active Thread Stream State */
          <div className="space-y-6 pb-24">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 mt-1 shadow-md shadow-indigo-900/30">
                    <Brain className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`relative group max-w-[90%] sm:max-w-[80%] rounded-3xl px-5 py-4 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? isDark
                        ? 'bg-[#1c1f2b] text-white border border-white/10 rounded-tr-md'
                        : 'bg-indigo-600 text-white rounded-tr-md shadow-sm'
                      : isDark
                      ? 'bg-[#14161f] text-slate-200 border border-white/5 rounded-tl-md shadow-sm'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-tl-md shadow-xs'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div
                      className={`flex items-center justify-between gap-3 text-[11px] font-bold uppercase tracking-wider mb-2.5 pb-2 border-b ${
                        isDark
                          ? 'text-indigo-400 border-white/5'
                          : 'text-indigo-600 border-slate-100'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        IBM watsonx Orchestrate Trainer
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded cursor-pointer ${
                          isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                        }`}
                        title="Copy message"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}

                  {/* Render formatted Markdown without raw asterisks or dashes */}
                  {msg.role === 'assistant' ? (
                    <MarkdownRenderer content={msg.content} isDark={isDark} />
                  ) : (
                    <div className="whitespace-pre-line text-sm leading-relaxed">{msg.content}</div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div
                    className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center flex-shrink-0 mt-1 border ${
                      isDark
                        ? 'bg-slate-800 text-white border-white/10'
                        : 'bg-indigo-100 text-indigo-800 border-indigo-200'
                    }`}
                  >
                    {candidateInitials}
                  </div>
                )}
              </div>
            ))}

            {/* Reasoning / Loading State */}
            {loading && (
              <div className="flex items-start gap-3.5 animate-fadeIn">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 mt-1 shadow-md shadow-indigo-900/30">
                  <Brain className="w-4 h-4" />
                </div>
                <div
                  className={`border rounded-3xl rounded-tl-md px-5 py-4 text-sm ${
                    isDark ? 'bg-[#14161f] border-white/5' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <div className="flex gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                    <span>IBM Interview Trainer is reasoning...</span>
                  </div>
                </div>
              </div>
            )}

            {/* Error Retry Card */}
            {lastFailedMessage && !loading && (
              <div
                className={`border rounded-2xl p-4 text-xs flex items-center justify-between gap-4 ${
                  isDark
                    ? 'bg-rose-950/40 border-rose-500/30 text-rose-300'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                  <span>The AI Interview Trainer encountered an issue reaching IBM.</span>
                </div>
                <button
                  type="button"
                  onClick={() => sendMessage(lastFailedMessage)}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer"
                >
                  Retry Request
                </button>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </main>

      {/* Floating Bottom Input Bar (Active Thread) */}
      {!isInitialState && (
        <div
          className={`sticky bottom-0 border-t p-4 z-20 backdrop-blur-lg transition-colors ${
            isDark ? 'bg-[#0e1017]/90 border-white/5' : 'bg-slate-50/90 border-slate-200'
          }`}
        >
          <div className="max-w-4xl mx-auto space-y-2">
            {/* Suggested Chips */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 text-xs sm:text-sm">
              <span className={`text-xs font-bold whitespace-nowrap uppercase tracking-wider ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                Suggested:
              </span>
              <div className="flex items-center gap-2 flex-nowrap overflow-x-auto no-scrollbar">
                {SUGGESTED_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => sendMessage(chip)}
                    className={`px-3.5 py-1.5 rounded-xl border text-xs sm:text-sm font-medium whitespace-nowrap transition-all shadow-xs cursor-pointer ${
                      isDark
                        ? 'bg-[#181a24] hover:bg-white/10 text-slate-200 hover:text-white border-white/10'
                        : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Capsule */}
            <div
              className={`border rounded-2xl p-2.5 shadow-xl flex items-center gap-3 transition-all ${
                isDark
                  ? 'bg-[#161822] border-white/10 focus-within:border-indigo-500/50'
                  : 'bg-white border-slate-300 focus-within:border-indigo-500'
              }`}
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Ask follow-up questions or practice answers as ${candidateName}...`}
                rows={1}
                className={`flex-1 bg-transparent text-sm outline-none resize-none px-3 py-1.5 ${
                  isDark ? 'text-slate-100 placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'
                }`}
              />

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  className={`p-2 rounded-xl transition-all cursor-pointer ${
                    isRecording
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                      : isDark
                      ? 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                  title={isRecording ? 'Listening... click to stop' : 'Voice Input'}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 disabled:pointer-events-none transition-all shadow-md shadow-indigo-950 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
