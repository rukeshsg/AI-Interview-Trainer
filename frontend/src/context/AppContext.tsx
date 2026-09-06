import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { CandidateProfile, ResumeData, InterviewSession } from '../types';

export type ThemeMode = 'dark' | 'light';

interface AppContextValue {
  profile: CandidateProfile | null;
  setProfile: (p: CandidateProfile | null) => void;
  resumeData: ResumeData | null;
  setResumeData: (r: ResumeData | null) => void;
  currentSession: InterviewSession | null;
  setCurrentSession: (s: InterviewSession | null) => void;
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const SESSION_KEY = 'ait_app_state';
const THEME_KEY = 'ait_app_theme';

function loadFromSession(): Partial<Pick<AppContextValue, 'profile' | 'resumeData' | 'currentSession'>> {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return {};
}

function loadInitialTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {}
  return 'dark'; // default to modern dark AI UI
}

export function AppProvider({ children }: { children: ReactNode }) {
  const saved = loadFromSession();

  const [profile, setProfileState] = useState<CandidateProfile | null>(saved.profile || null);
  const [resumeData, setResumeDataState] = useState<ResumeData | null>(saved.resumeData || null);
  const [currentSession, setCurrentSessionState] = useState<InterviewSession | null>(saved.currentSession || null);
  const [theme, setThemeState] = useState<ThemeMode>(loadInitialTheme);

  const setTheme = useCallback((t: ThemeMode) => {
    setThemeState(t);
    try {
      localStorage.setItem(THEME_KEY, t);
    } catch {}
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {}
      return next;
    });
  }, []);

  const setProfile = useCallback((p: CandidateProfile | null) => {
    setProfileState(p);
    const current = loadFromSession();
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...current, profile: p }));
    } catch { /* ignore */ }
  }, []);

  const setResumeData = useCallback((r: ResumeData | null) => {
    setResumeDataState(r);
    const current = loadFromSession();
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...current, resumeData: r }));
    } catch { /* ignore */ }
  }, []);

  const setCurrentSession = useCallback((s: InterviewSession | null) => {
    setCurrentSessionState(s);
    const current = loadFromSession();
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...current, currentSession: s }));
    } catch { /* ignore */ }
  }, []);

  return (
    <AppContext.Provider
      value={{
        profile,
        setProfile,
        resumeData,
        setResumeData,
        currentSession,
        setCurrentSession,
        theme,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
