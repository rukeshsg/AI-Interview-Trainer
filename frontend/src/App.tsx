import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider, useApp } from './context/AppContext';
import { AppLayout } from './layouts/AppLayout';
import { Spinner } from './components/ui/Feedback';

// Pages — lazy loaded
const LandingPage        = lazy(() => import('./pages/LandingPage'));
const DashboardPage      = lazy(() => import('./pages/DashboardPage'));
const ProfileSetupPage   = lazy(() => import('./pages/ProfileSetupPage'));
const ResumeUploadPage   = lazy(() => import('./pages/ResumeUploadPage'));
const InterviewSetupPage = lazy(() => import('./pages/InterviewSetupPage'));
const MockInterviewPage  = lazy(() => import('./pages/MockInterviewPage'));
const ReportPage         = lazy(() => import('./pages/ReportPage'));
const HistoryPage        = lazy(() => import('./pages/HistoryPage'));
const AIChatPage         = lazy(() => import('./pages/AIChatPage'));
const ProfilePage        = lazy(() => import('./pages/ProfilePage'));
const AboutPage          = lazy(() => import('./pages/AboutPage'));
const NotFoundPage       = lazy(() => import('./pages/NotFoundPage'));

const PageLoader = () => (
  <div className="flex items-center justify-center h-72">
    <Spinner text="Loading..." />
  </div>
);

function SmartInterviewRedirect() {
  const { currentSession, profile } = useApp();
  if (currentSession?.id && currentSession.status === 'active') {
    return <Navigate to={`/interview/${currentSession.id}`} replace />;
  }
  if (profile) {
    return <Navigate to="/prepare/setup" replace />;
  }
  return <Navigate to="/prepare" replace />;
}

function SmartReportRedirect() {
  const { currentSession } = useApp();
  if (currentSession?.id) {
    return <Navigate to={`/reports/${currentSession.id}`} replace />;
  }
  return <Navigate to="/history" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 500,
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            },
          }}
        />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public landing */}
            <Route path="/" element={<LandingPage />} />

            {/* App routes with sidebar layout */}
            <Route element={<AppLayout />}>
              <Route path="/dashboard"            element={<DashboardPage />} />
              <Route path="/prepare"              element={<ProfileSetupPage />} />
              <Route path="/prepare/resume"       element={<ResumeUploadPage />} />
              <Route path="/prepare/setup"        element={<InterviewSetupPage />} />
              <Route path="/interview/:sessionId" element={<MockInterviewPage />} />
              <Route path="/interview"            element={<SmartInterviewRedirect />} />
              <Route path="/reports/:sessionId"   element={<ReportPage />} />
              <Route path="/reports"              element={<SmartReportRedirect />} />
              <Route path="/history"              element={<HistoryPage />} />
              <Route path="/chat"                 element={<AIChatPage />} />
              <Route path="/profile"              element={<ProfilePage />} />
              <Route path="/about"                element={<AboutPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </AppProvider>
    </BrowserRouter>
  );
}
