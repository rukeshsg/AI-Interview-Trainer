# AI Interview Trainer — Project Plan

## Top-Level Overview

Build a complete, production-style full-stack web application called **AI Interview Trainer** that integrates with an existing IBM watsonx Orchestrate Interview Trainer Agent (RAG-powered). The project starts from a blank workspace (existing Python venv is an artifact, not used).

**Stack:**
- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS
- **Backend:** Node.js + Express + TypeScript
- **Database:** SQLite via `better-sqlite3`
- **IBM Integration:** IBM watsonx Orchestrate (HTTP/REST) via isolated backend service
- **Resume Parsing:** `pdf-parse` + `mammoth`
- **File Upload:** `multer`

**Architecture:**
```
Browser (React + Vite)
  → Backend API (Express + TypeScript)
    → orchestrateService.ts
      → IBM watsonx Orchestrate
        → Interview Trainer Agent
          → RAG Knowledge Base
```

**IBM credentials are NOT available yet.** The app is built with placeholder env vars and a clearly labeled dev mock mode (`ENABLE_MOCK_AI=false`). The IBM integration adapter is wired up and ready — only real credentials need to be supplied to go live.

**No credentials are ever committed to git.**

---

## Sub-Tasks

---

### Sub-Task 1 — Repository Scaffold & Root Configuration

**Status:** [ ] pending

**Intent:**
Establish the top-level project structure, root `package.json` (workspace), `.gitignore`, `.env.example`, and all root-level configuration so both frontend and backend can be initialized cleanly. This is the foundation every subsequent sub-task depends on.

**Expected Outcomes:**
- Root directory has `package.json` with workspace scripts to run both frontend and backend
- `.gitignore` covers `node_modules`, `dist`, `.env`, `uploads/`, `*.db`, `logs/`
- `.env.example` has ALL environment variables used by the backend (IBM placeholders + app config)
- `README.md` shell exists with project title and section headings (filled out in Sub-Task 13)
- `docs/` directory created with placeholder files for `architecture.md`, `api.md`, `project-overview.md`
- `screenshots/` directory created (empty placeholder)

**Todo List:**
1. Create root `package.json` with `name: "ai-interview-trainer"`, workspace `scripts` (`dev`, `build`, `start`) that concurrently start frontend and backend
2. Create `.gitignore` (node_modules, dist, .env, uploads/, *.db, venv/, logs/, *.log)
3. Create `.env.example` with sections: IBM Config, App Config, Mock Mode
4. Create `README.md` shell (title, badges, sections only — content in Sub-Task 13)
5. Create `docs/architecture.md`, `docs/api.md`, `docs/project-overview.md` shells
6. Create `screenshots/.gitkeep`

**Relevant Context:**
- Root is `r:\project\AI-Interview-Coach`
- Python `venv/` exists — do not delete it, just ignore it in `.gitignore`
- All IBM env var names: `IBM_ORCHESTRATE_BASE_URL`, `IBM_ORCHESTRATE_API_KEY`, `IBM_ORCHESTRATE_AGENT_ID`, `IBM_ORCHESTRATE_AGENT_VERSION`, `IBM_ORCHESTRATE_ENVIRONMENT`
- Mock mode var: `ENABLE_MOCK_AI=false`
- App vars: `PORT=3001`, `NODE_ENV=development`, `MAX_FILE_SIZE_MB=10`, `UPLOAD_DIR=uploads`

---

### Sub-Task 2 — Backend: Project Init & Express Skeleton

**Status:** [ ] pending

**Intent:**
Initialize the Node.js/Express/TypeScript backend with proper folder structure, middleware, error handling, and health endpoint. This gives every subsequent backend sub-task a clean base to add routes into.

**Expected Outcomes:**
- `backend/` directory with `package.json`, `tsconfig.json`
- Express app starts on `PORT` from env, defaults to `3001`
- Folder structure: `src/routes/`, `src/services/`, `src/middleware/`, `src/parsers/`, `src/utils/`, `src/types/`, `src/db/`
- CORS configured (allow frontend origin)
- Request body parsing (JSON + multipart via multer)
- Global error handler middleware
- `GET /api/health` returns `{ status: "ok", timestamp, mockMode: bool }`
- TypeScript compiles with no errors
- `npm run dev` starts with `ts-node-dev` (hot reload)
- `npm run build` compiles to `dist/`

**Todo List:**
1. Create `backend/package.json` with all dependencies: `express`, `cors`, `multer`, `pdf-parse`, `mammoth`, `better-sqlite3`, `uuid`, `dotenv`; devDeps: `typescript`, `ts-node-dev`, `@types/*`
2. Create `backend/tsconfig.json` (strict mode, ESM-compatible, outDir `dist/`)
3. Create `backend/src/app.ts` — Express app factory (no `listen` call here)
4. Create `backend/src/server.ts` — entry point, loads `.env`, calls `app.listen`
5. Create `backend/src/middleware/errorHandler.ts` — global error handler, never leaks stack traces to client
6. Create `backend/src/middleware/validateRequest.ts` — request body validator helper
7. Create `backend/src/types/index.ts` — all shared TypeScript interfaces (`CandidateProfile`, `InterviewSession`, `InterviewQuestion`, `InterviewAnswer`, `Evaluation`)
8. Create `backend/src/routes/health.ts` — `GET /api/health`
9. Register routes in `app.ts`
10. Confirm `npm run dev` starts without errors

**Relevant Context:**
- Dependency versions: Express 4.x, better-sqlite3 9.x, multer 1.x, pdf-parse 1.x, mammoth 1.x
- TypeScript interfaces must match the spec in Section 25 of the project brief
- `CandidateProfile`, `InterviewSession`, `InterviewQuestion`, `InterviewAnswer`, `Evaluation` are the five core types
- `NODE_ENV`, `PORT`, `ENABLE_MOCK_AI`, `UPLOAD_DIR`, `MAX_FILE_SIZE_MB` are env vars used in this sub-task

---

### Sub-Task 3 — Backend: SQLite Database Layer

**Status:** [ ] pending

**Intent:**
Set up the SQLite database with schema migrations for candidate profiles, interview sessions, questions, answers, and evaluations. This gives the backend persistent storage so interview history survives restarts.

**Expected Outcomes:**
- `backend/src/db/database.ts` — singleton DB connection using `better-sqlite3`
- `backend/src/db/schema.ts` — all CREATE TABLE statements run on startup
- Tables: `candidate_profiles`, `interview_sessions`, `interview_questions`, `interview_answers`, `interview_evaluations`
- `backend/src/db/repositories/` — one file per entity with typed CRUD helpers
- Database file stored at `./data/interview-trainer.db` (in `.gitignore`)
- DB initializes cleanly on first run (auto-creates tables)
- No ORM required — use raw SQL with typed wrappers

**Todo List:**
1. Create `backend/src/db/database.ts` — open/create SQLite file, export `db` singleton
2. Create `backend/src/db/schema.ts` — all five tables with proper columns matching the TypeScript interfaces; run `initializeDatabase()` on import
3. Create `backend/src/db/repositories/profileRepository.ts` — `createProfile`, `getProfileById`, `updateProfile`, `getAllProfiles`
4. Create `backend/src/db/repositories/sessionRepository.ts` — `createSession`, `getSessionById`, `updateSession`, `getSessionsByProfile`, `getAllSessions`
5. Create `backend/src/db/repositories/questionRepository.ts` — `saveQuestions`, `getQuestionsBySession`
6. Create `backend/src/db/repositories/answerRepository.ts` — `saveAnswer`, `getAnswersBySession`
7. Create `backend/src/db/repositories/evaluationRepository.ts` — `saveEvaluation`, `getEvaluationsBySession`
8. Call `initializeDatabase()` in `server.ts` before app starts
9. Create `data/` directory with `.gitkeep` (database file is gitignored)

**Relevant Context:**
- `better-sqlite3` is synchronous (not async) — this is intentional for simplicity
- Primary keys: use `uuid` for all IDs
- `interview_sessions.status` column: `"active" | "completed" | "abandoned"`
- Store `questions`, `answers`, `scores` as JSON strings in session for quick retrieval
- Separate normalized tables for answers/evaluations allow per-question detail views

---

### Sub-Task 4 — Backend: IBM watsonx Orchestrate Integration Adapter

**Status:** [ ] pending

**Intent:**
Build the isolated IBM watsonx Orchestrate service adapter. This is the single point of contact between the Node.js backend and the IBM agent. Everything IBM-specific lives here. The rest of the app calls this service without knowing IBM internals.

**Expected Outcomes:**
- `backend/src/services/orchestrateService.ts` — complete IBM adapter with all six operating modes
- Mock mode fully implemented and toggled by `ENABLE_MOCK_AI=true`
- Mock mode is clearly labeled, returns realistic but obviously fake responses
- Real IBM mode constructs proper HTTP requests to the Orchestrate API
- Config validation on startup: if IBM vars are missing and mock is off, throws a clear `ConfigurationError`
- All six agent modes supported: `generateQuestions`, `evaluateAnswer`, `getMockInterviewQuestion`, `getModelAnswer`, `getPreparationStrategy`, `generateFinalSummary`
- Response parsing handles both structured JSON and natural language fallback
- TypeScript-typed request/response contracts for all six modes

**Todo List:**
1. Create `backend/src/services/orchestrateService.ts` with exported class `OrchestrateService`
2. Implement `validateConfig()` — checks all required IBM env vars; throws `ConfigurationError` with instructions if missing and `ENABLE_MOCK_AI=false`
3. Implement `generateQuestions(params)` — builds prompt: "Generate N [type] interview questions for a [role] [level]..." — calls IBM agent or returns mock
4. Implement `evaluateAnswer(params)` — builds evaluation prompt with question + candidate answer + profile context — returns `Evaluation` object
5. Implement `getMockInterviewQuestion(params)` — gets single next question in sequence
6. Implement `getModelAnswer(params)` — gets model answer for a specific question
7. Implement `getPreparationStrategy(params)` — gets 7-day plan or study strategy
8. Implement `generateFinalSummary(params)` — sends all Q&A pairs, gets final performance summary
9. Implement `chat(message, context)` — general-purpose assistant endpoint
10. Implement `parseAgentResponse(raw)` — attempts JSON parse first, falls back to structured extraction from natural language, preserves raw on failure
11. Create `backend/src/utils/promptBuilder.ts` — clean prompt construction helpers (one function per mode, no inline string templates in service)
12. Add `.env.example` IBM section comment explaining exactly what to collect from IBM Console

**Relevant Context:**
- IBM watsonx Orchestrate API: REST-based, requires `Authorization: Bearer <token>` or `apikey` auth — exact format goes in env var comments
- The Orchestrate agent will be called via HTTP POST to the agent session endpoint
- Response parsing: try `JSON.parse`, if it fails extract key fields with regex/heuristics
- Mock responses must have all fields of the real response shape (same TypeScript type)
- `ENABLE_MOCK_AI=false` by default — developer must explicitly enable mock
- Prompt templates must include: `candidate_name`, `target_role`, `experience_level`, `skills`, `interview_type`, `difficulty`, `question_count`, `resume_context`
- Include a `README-IBM-INTEGRATION.md` that lists exactly what the developer needs to collect from their IBM Console

---

### Sub-Task 5 — Backend: API Routes (Profile, Resume, Interview, Chat)

**Status:** [ ] pending

**Intent:**
Implement all backend API endpoints. These are the HTTP surface the frontend calls. They validate input, coordinate DB and IBM service calls, and return structured JSON.

**Expected Outcomes:**
- All endpoints from Section 26 of the brief are implemented
- Request validation rejects malformed bodies with clear error messages
- Resume upload accepts PDF/DOCX, validates MIME type + size, extracts text
- IBM service errors are caught and returned as structured API errors (never raw)
- All responses are typed JSON
- `GET /api/health` already exists (Sub-Task 2)

**Todo List:**
1. Create `backend/src/routes/profile.ts` — `POST /api/profile` (create/update), `GET /api/profile/:id`
2. Create `backend/src/routes/resume.ts` — `POST /api/resume/upload` with multer, file validation (PDF/DOCX only, max 10MB), calls `resumeParser.ts`, returns extracted summary
3. Create `backend/src/parsers/resumeParser.ts` — `parseResume(filePath, mimeType)` using `pdf-parse` for PDFs and `mammoth` for DOCX; returns `{ skills, experience, education, projects, certifications, rawText }`
4. Create `backend/src/routes/interview.ts`:
   - `POST /api/interview/start` — creates session in DB, returns session ID
   - `POST /api/interview/question` — calls `orchestrateService.generateQuestions()` or `getMockInterviewQuestion()`
   - `POST /api/interview/evaluate` — submits answer, calls `orchestrateService.evaluateAnswer()`, saves to DB
   - `POST /api/interview/model-answer` — calls `orchestrateService.getModelAnswer()`
   - `POST /api/interview/summary` — calls `orchestrateService.generateFinalSummary()`, saves completed session
   - `GET /api/interviews` — list all sessions (with pagination)
   - `GET /api/interviews/:id` — get full session detail including all Q&A
5. Create `backend/src/routes/chat.ts` — `POST /api/chat` — calls `orchestrateService.chat()`
6. Register all new routes in `app.ts`
7. Ensure uploaded files are stored in `uploads/` (temp), cleaned up after parsing

**Relevant Context:**
- Use `uuid` for all generated IDs
- multer config: `dest: process.env.UPLOAD_DIR || 'uploads/'`, `limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 }`
- MIME type whitelist: `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- Resume parser must NOT invent information — only return what it actually extracts
- `POST /api/interview/evaluate` must validate that `sessionId` and `questionId` exist before calling IBM

---

### Sub-Task 6 — Frontend: Project Init & Global Layout

**Status:** [ ] pending

**Intent:**
Initialize the React/TypeScript/Vite frontend with Tailwind CSS, global layout (sidebar navigation + responsive shell), routing, and the core design system (colors, typography, spacing tokens). This is the visual foundation all page sub-tasks build on.

**Expected Outcomes:**
- `frontend/` initialized with `npm create vite@latest` (React + TypeScript template)
- Tailwind CSS configured
- `lucide-react` installed for icons
- `react-router-dom` installed for routing
- `axios` installed for API calls (or `fetch` wrapper)
- Global CSS variables: indigo/blue color palette, neutral backgrounds
- `AppLayout.tsx` — sidebar (desktop) + hamburger menu (mobile) + top bar
- Navigation links: Dashboard, Prepare, Mock Interview, Interview History, Reports, AI Assistant, Profile, About
- Active route highlighting
- Responsive: sidebar on desktop, bottom nav or slide-out on mobile
- App loads at `http://localhost:5173` with no console errors
- Vite proxy configured to forward `/api/*` to `http://localhost:3001`

**Todo List:**
1. Run `npm create vite@latest frontend -- --template react-ts` (or create equivalent manually)
2. Install: `tailwindcss`, `postcss`, `autoprefixer`, `lucide-react`, `react-router-dom`, `axios`, `react-hot-toast`, `clsx`
3. Configure Tailwind (`tailwind.config.js`, `postcss.config.js`, inject into `index.css`)
4. Set up custom Tailwind theme: primary indigo palette, neutral grays, font Inter
5. Create `frontend/src/types/index.ts` — mirror all TypeScript interfaces from backend
6. Create `frontend/src/api/client.ts` — axios instance with base URL, interceptors for error handling
7. Create `frontend/src/api/` — one file per domain: `profileApi.ts`, `resumeApi.ts`, `interviewApi.ts`, `chatApi.ts`
8. Create `frontend/src/layouts/AppLayout.tsx` — sidebar + outlet for nested routes
9. Create `frontend/src/layouts/Sidebar.tsx` — nav items with icons, active state, collapse on mobile
10. Create `frontend/src/components/ui/` — base components: `Button.tsx`, `Card.tsx`, `Badge.tsx`, `Input.tsx`, `Textarea.tsx`, `Select.tsx`, `Modal.tsx`, `Toast.tsx`, `Spinner.tsx`, `SkeletonLoader.tsx`, `ProgressBar.tsx`, `EmptyState.tsx`, `ErrorBoundary.tsx`
11. Set up `App.tsx` with `react-router-dom` routes (all page placeholders)
12. Configure `vite.config.ts` proxy: `/api` → `http://localhost:3001`
13. Add `frontend/package.json` dev script

**Relevant Context:**
- Design language: indigo/blue primary, white/neutral-50 backgrounds, generous padding, rounded-xl cards, subtle shadows
- Font: Inter (Google Fonts or Tailwind default)
- Do not use `@apply` excessively — prefer Tailwind utility classes directly in JSX
- `clsx` for conditional class names
- `react-hot-toast` for toast notifications (top-right position)
- All UI components in `src/components/ui/` are purely presentational, no API calls

---

### Sub-Task 7 — Frontend: Landing Page

**Status:** [ ] pending

**Intent:**
Build the polished public-facing landing page that immediately communicates the product value and drives users to start. This is the first impression and must look premium.

**Expected Outcomes:**
- `frontend/src/pages/LandingPage.tsx` — complete, visually polished landing page
- Hero section with headline, tagline, supporting text, two CTA buttons
- Feature cards (6 cards from Section 7)
- "How It Works" 4-step section
- "Powered By" technology strip (IBM watsonx Orchestrate, RAG, IBM Cloud)
- Responsive: stacked on mobile, side-by-side hero on desktop
- "Start Preparing" routes to `/prepare` (profile setup flow)
- "Try Mock Interview" routes to `/mock-interview`
- No broken links, no placeholder Lorem ipsum

**Todo List:**
1. Create `frontend/src/pages/LandingPage.tsx`
2. Build `HeroSection` — headline "AI Interview Trainer", tagline, supporting paragraph, two buttons, right-side product preview card
3. Build `FeaturesSection` — 6 feature cards with icons and short descriptions
4. Build `HowItWorksSection` — 4 numbered steps with icons
5. Build `TechStackSection` — IBM logos/badges with brief description (do not claim it is an official IBM product)
6. Add page to router at route `/` (or `/home`)
7. Ensure all navigation links from hero work

**Relevant Context:**
- Feature cards from brief: Personalized Questions, Resume-Based Preparation, Technical Assessment, HR & Behavioral Practice, AI Answer Evaluation, Performance Reports
- IBM mention must be honest: "Powered by IBM watsonx Orchestrate" — not "An IBM Product"
- Use Lucide icons throughout (e.g., `Brain`, `FileText`, `Target`, `TrendingUp`, `Award`, `MessageSquare`)

---

### Sub-Task 8 — Frontend: Onboarding Flow (Profile + Resume + Setup)

**Status:** [ ] pending

**Intent:**
Build the three-step onboarding wizard: Candidate Profile → Resume Upload → Interview Setup. This collects all the information needed to generate personalized interview questions.

**Expected Outcomes:**
- `frontend/src/pages/ProfileSetupPage.tsx` — candidate profile form
- `frontend/src/pages/ResumeUploadPage.tsx` — drag-and-drop upload with preview/summary
- `frontend/src/pages/InterviewSetupPage.tsx` — interview configuration with preview summary
- Progress stepper showing steps 1–3 at the top of each page
- All forms have client-side validation with clear error messages
- Profile is saved via `POST /api/profile` and stored in app context
- Resume is uploaded via `POST /api/resume/upload`; extracted summary displayed
- Resume upload failure shows friendly error; user can continue without resume
- Interview setup form calls `POST /api/interview/start` to create session
- Setup page shows live preview card updating as user changes selections
- "Continue" / "Back" navigation between steps

**Todo List:**
1. Create `frontend/src/context/AppContext.tsx` — React context for `candidateProfile`, `currentSession`, `resumeData`; persisted to `sessionStorage`
2. Create `frontend/src/pages/ProfileSetupPage.tsx` — all fields from Section 8; dropdowns for experience level + interview type; optional fields in collapsible section
3. Create `frontend/src/pages/ResumeUploadPage.tsx` — drag-and-drop zone using native HTML5 drag events (no extra lib); file info display; upload progress bar; extracted summary card; "Use Resume" / "Skip" buttons
4. Create `frontend/src/pages/InterviewSetupPage.tsx` — interview type selector (cards, not dropdown), difficulty selector, question count selector (5/10/15), preparation mode toggle, live preview card
5. Create `frontend/src/components/onboarding/StepProgress.tsx` — step indicator
6. Create `frontend/src/components/onboarding/ResumeDropZone.tsx`
7. Create `frontend/src/components/onboarding/SetupPreviewCard.tsx`
8. Wire up all three pages in router with navigation guards (can't reach setup if no profile)
9. After setup form submits successfully, redirect to `/interview/:sessionId`

**Relevant Context:**
- AppContext must be accessible from all pages — wrap `App.tsx` in the provider
- Experience levels: Fresher, Entry Level, Intermediate, Experienced
- Interview types: Technical, HR, Behavioral, Mixed
- Difficulties: Easy, Medium, Hard, Adaptive
- Target company is optional — do not require it
- Resume summary must only show fields that came back from the backend parser — do not invent

---

### Sub-Task 9 — Frontend: Mock Interview Workspace

**Status:** [ ] pending

**Intent:**
Build the core interview experience — a focused, distraction-free workspace where the AI interviewer asks one question at a time, the user answers, and the app evaluates each response in sequence.

**Expected Outcomes:**
- `frontend/src/pages/MockInterviewPage.tsx` — full interview workspace
- Top bar: interview title, role, type, progress indicator (Question X of N)
- Center: AI interviewer message bubble + current question card
- Bottom: answer textarea + Submit button (disabled while evaluating)
- After answer submission: evaluation result slides in — score, strengths, improvements, model answer (hidden until user clicks "Show Model Answer")
- "Next Question" button after evaluation is shown
- After final question: "View Report" button
- Loading states: "Generating question...", "Evaluating your answer...", "Preparing feedback..."
- Exit interview button with confirmation modal
- Interview state machine: `idle → loading_question → answering → evaluating → showing_feedback → next | complete`
- All interview state persisted in context so page refresh doesn't lose session

**Todo List:**
1. Create `frontend/src/pages/MockInterviewPage.tsx` — main orchestrator
2. Create `frontend/src/hooks/useInterview.ts` — custom hook managing interview state machine, API calls, question progression
3. Create `frontend/src/components/interview/QuestionCard.tsx` — displays question number, topic badge, difficulty badge, question text
4. Create `frontend/src/components/interview/AnswerInput.tsx` — textarea with character count, submit button, keyboard shortcut hint
5. Create `frontend/src/components/interview/EvaluationPanel.tsx` — animated reveal of scores, strengths, improvements, model answer toggle
6. Create `frontend/src/components/interview/InterviewProgress.tsx` — top progress bar + step indicators
7. Create `frontend/src/components/interview/InterviewerBubble.tsx` — AI "interviewer" message card with avatar icon
8. Add exit confirmation modal using the `Modal` UI component
9. Wire `useInterview` hook to `POST /api/interview/question` and `POST /api/interview/evaluate`
10. On completion, call `POST /api/interview/summary`, then redirect to `/reports/:sessionId`

**Relevant Context:**
- Questions are loaded one at a time (not all upfront) to match mock interview feel
- Model answer is HIDDEN until user explicitly clicks "Show Model Answer" after evaluation
- `useInterview` hook owns: `currentQuestion`, `answers[]`, `evaluations[]`, `questionIndex`, `isLoading`, `isEvaluating`, `isComplete`
- Disable submit button: when `isEvaluating` is true, when answer textarea is empty
- Show `SkeletonLoader` while fetching next question

---

### Sub-Task 10 — Frontend: Score Visualization & Final Report

**Status:** [ ] pending

**Intent:**
Build the polished performance report page that shows after a completed interview — the professional summary that makes the app feel like a real product.

**Expected Outcomes:**
- `frontend/src/pages/ReportPage.tsx` — complete interview performance report
- Sections: Candidate Info, Interview Info, Overall Score (large circular/card display), Category Scores (5 bars), Strong Areas, Weak Areas, Question-by-Question Summary, Recommendations, Next Steps
- Overall score calculated from actual evaluation data (never fabricated)
- Category bars use real averaged scores from evaluations
- Question summary table: question number, topic, score, key feedback
- "Practice Again", "New Interview", "Download Report" buttons
- Download Report generates a clean text summary (plain download — no PDF lib required)
- Breadcrumb navigation back to Dashboard
- `frontend/src/pages/DashboardPage.tsx` — welcome, quick stats, recent sessions, quick actions, preparation progress bars

**Todo List:**
1. Create `frontend/src/pages/ReportPage.tsx` — loads session from `GET /api/interviews/:id`
2. Create `frontend/src/components/report/OverallScoreCard.tsx` — large score display with color coding (green ≥8, yellow 6–8, red <6)
3. Create `frontend/src/components/report/CategoryScoreBars.tsx` — 5 horizontal progress bars with labels and scores
4. Create `frontend/src/components/report/QuestionSummaryTable.tsx` — expandable rows per question
5. Create `frontend/src/components/report/RecommendationsList.tsx` — improvement recommendations with icons
6. Implement `downloadReport(session)` utility — formats session data into plain text, triggers browser download
7. Create `frontend/src/pages/DashboardPage.tsx`:
   - Welcome header with candidate name
   - 4 stat cards: Interviews Completed, Average Score, Best Score, Questions Practiced
   - Recent Sessions list (last 5) with role, type, date, score
   - Quick Actions grid: Start Interview, Practice Technical/HR/Behavioral, Upload Resume
   - Preparation Progress bars (4 categories — sourced from aggregated session history)
8. Wire Dashboard to `GET /api/interviews` for stats and recent sessions
9. Add `SkeletonLoader` for all async data on Dashboard and Report pages

**Relevant Context:**
- Score color: ≥8 = green-600, 6–7.9 = yellow-500, <6 = red-500
- "Preparation Progress" bars are calculated from the average category scores across all sessions
- Download is a `.txt` file trigger — no PDF generation library needed
- `ReportPage` gets `sessionId` from route param `useParams()`

---

### Sub-Task 11 — Frontend: Interview History, AI Assistant & Supporting Pages

**Status:** [ ] pending

**Intent:**
Build the remaining pages: Interview History (browsable session list), AI Assistant (free-form chat with the IBM agent), Profile page (view/edit), and About page. These complete the full navigation structure.

**Expected Outcomes:**
- `frontend/src/pages/HistoryPage.tsx` — searchable, filterable list of all interview sessions
- `frontend/src/pages/AIChatPage.tsx` — chat interface connected to `POST /api/chat`
- `frontend/src/pages/ProfilePage.tsx` — view and edit candidate profile
- `frontend/src/pages/AboutPage.tsx` — project info, IBM technology acknowledgment, feature explanation
- All pages linked from sidebar navigation
- History page: search by role, filter by type (Technical/HR/Behavioral/Mixed), sort by date/score, click to open report
- AI Chat: message input, send button, message history, loading indicator, suggestion chips ("Give me a Python question", "How can I improve this answer?")
- Empty states on History page when no sessions exist

**Todo List:**
1. Create `frontend/src/pages/HistoryPage.tsx` — loads `GET /api/interviews`, renders session cards, search + filter bar, click → navigate to `/reports/:id`
2. Create `frontend/src/components/history/SessionCard.tsx` — date, role, type badge, difficulty, score, status
3. Create `frontend/src/components/history/FilterBar.tsx` — search input, type filter pills, sort dropdown
4. Create `frontend/src/pages/AIChatPage.tsx` — chat UI with message list, input bar, send on Enter, loading indicator
5. Create `frontend/src/hooks/useChat.ts` — manages chat message history, calls `POST /api/chat`, handles loading/error
6. Create `frontend/src/components/chat/MessageBubble.tsx` — user vs AI styling
7. Create `frontend/src/components/chat/SuggestionChips.tsx` — pre-defined quick prompts
8. Create `frontend/src/pages/ProfilePage.tsx` — loads profile from context, form to update, calls `POST /api/profile`
9. Create `frontend/src/pages/AboutPage.tsx` — problem statement, architecture explanation, IBM tech credits, honest capability description
10. Ensure all routes are registered in `App.tsx` and all nav links resolve correctly

**Relevant Context:**
- AI Chat must pass current profile context to `POST /api/chat` for personalized responses
- "Suggestion chips" are pre-set questions that populate the input on click
- About page must credit IBM watsonx Orchestrate without claiming the app is an official IBM product
- History page `EmptyState`: "No interview sessions yet. Start your first mock interview and your performance history will appear here."

---

### Sub-Task 12 — Testing, Error Handling & Polish

**Status:** [ ] pending

**Intent:**
Add the validation, error handling, loading states, and UX polish that make the app feel production-grade. Also add basic backend tests for critical paths.

**Expected Outcomes:**
- All API error responses are caught and shown as toast notifications (never raw errors)
- IBM agent unavailable → clear message "Interview generation is temporarily unavailable. Please try again."
- Resume parse failure → friendly inline error, "Continue without resume" option remains accessible
- Rate-limit-ready architecture: request deduplication in `useInterview` (no double submissions)
- Backend unit tests for: profile validation, resume file type validation, score calculation utility, `parseAgentResponse` with malformed input
- Frontend: disabled states during all async operations
- All forms: client-side validation before API call
- 404 page for unknown routes
- Mobile layout verified (sticky bottom CTA on mock interview page)

**Todo List:**
1. Create `backend/src/utils/validation.ts` — request body validators for all endpoints
2. Create `backend/src/utils/scoreCalculator.ts` — `calculateCategoryAverages(evaluations[])`, `calculateOverallScore(evaluations[])`
3. Add `isSubmitting` guard to all form submit handlers in frontend (prevent double-click)
4. Create `frontend/src/pages/NotFoundPage.tsx` — 404 with "Back to Dashboard" button
5. Add `ErrorBoundary` wrapper in `App.tsx`
6. Create `backend/tests/` directory with `validation.test.ts`, `scoreCalculator.test.ts`, `responseParser.test.ts`
7. Add `jest` + `ts-jest` to backend devDeps; add `test` script to `backend/package.json`
8. Verify mobile layouts: LandingPage, MockInterviewPage, ReportPage — fix any overflow/truncation issues
9. Add `aria-label`, `role`, and focus-visible styles to all interactive elements
10. Run `npm run build` on both frontend and backend — resolve all TypeScript errors
11. Run backend tests — confirm they pass

**Relevant Context:**
- `parseAgentResponse` test cases: valid JSON, JSON embedded in markdown code fence, plain text, empty string, `null`
- Score calculator: test with all 10s, all 0s, mixed values, empty array
- `isSubmitting` pattern: `const [isSubmitting, setIsSubmitting] = useState(false)` + try/finally reset

---

### Sub-Task 13 — Documentation & Final Verification

**Status:** [ ] pending

**Intent:**
Complete all documentation, perform a full end-to-end manual test of the application flow, and produce the IBM integration guide. This is the final quality gate before the project is considered complete.

**Expected Outcomes:**
- `README.md` — fully complete professional README with all sections from Section 42 of the brief
- `docs/architecture.md` — system architecture with text diagram
- `docs/api.md` — all endpoints documented with request/response shapes
- `docs/project-overview.md` — problem, solution, features, workflow, technology
- `IBM-INTEGRATION.md` at root — exact step-by-step guide of what IBM Console values to collect and where to put them
- `.env.example` — all variables documented with inline comments
- Manual test confirms: landing → profile → resume → setup → mock interview → evaluation → report → history → chat → profile page — all navigate without error
- `npm run dev` works in both frontend and backend directories
- No TypeScript errors in either project
- No secrets in any tracked file

**Todo List:**
1. Write complete `README.md` (title, badges, overview, features, architecture Mermaid diagram, tech stack, setup instructions, env vars table, run commands, IBM integration section, known limitations, future enhancements, credits)
2. Write `docs/architecture.md` — frontend, backend, IBM adapter, RAG, resume processing, evaluation flow
3. Write `docs/api.md` — each endpoint: method, path, request body, response body, error codes
4. Write `docs/project-overview.md` — problem statement, solution narrative, user workflow, expected outcome
5. Write `IBM-INTEGRATION.md`:
   - What to collect from IBM Console: Base URL, API Key, Agent ID, Agent Version ID, Environment (live/draft)
   - Where each value goes in `.env`
   - How to test the connection (health check + first question generation)
   - How to switch from mock mode to live mode
6. Final review of `.env.example` — ensure every variable is present and commented
7. Run full manual test of the complete user journey
8. Run `npm run build` on both projects — confirm clean builds
9. Confirm `.gitignore` covers all secrets and generated files
10. Add `screenshots/README.md` placeholder with instructions for adding screenshots

**Relevant Context:**
- README Mermaid diagram should show: User → Frontend → Backend → orchestrateService → IBM watsonx Orchestrate → Agent → RAG KB → LLM → Response → Backend → Frontend
- IBM-INTEGRATION.md is the key handoff document — must be clear enough for someone with no code knowledge to follow
- The "Known Limitations" section should honestly note: IBM credentials not yet configured; voice input is future enhancement; no authentication system (future)

---

## IBM Integration — What To Collect From IBM Console

When you are ready to connect the real IBM agent, you will need to supply these values in your `.env` file:

| Variable | Where to Find It |
|---|---|
| `IBM_ORCHESTRATE_BASE_URL` | IBM watsonx Orchestrate instance URL (e.g. `https://<region>.assistant.watson.cloud.ibm.com`) |
| `IBM_ORCHESTRATE_API_KEY` | IBM Cloud IAM API Key (from IBM Cloud Console → Manage → Access → API Keys) |
| `IBM_ORCHESTRATE_AGENT_ID` | Agent ID from your watsonx Orchestrate workspace (Agent settings page) |
| `IBM_ORCHESTRATE_AGENT_VERSION` | "live" for deployed version, or a specific draft version ID |
| `IBM_ORCHESTRATE_ENVIRONMENT` | `live` or `draft` |

The `orchestrateService.ts` adapter will be built to accept these values without any code changes.

---

## Architecture Diagram (Reference)

```
┌──────────────────────────────────────────┐
│              Browser (React)             │
│  Landing │ Profile │ Interview │ Report  │
└─────────────────┬────────────────────────┘
                  │ HTTP /api/*
┌─────────────────▼────────────────────────┐
│         Express Backend (Node.js)        │
│  routes/ │ middleware/ │ parsers/ │ db/  │
└──────┬───────────────────────┬───────────┘
       │                       │
  SQLite DB            orchestrateService.ts
  (better-sqlite3)             │
                     ┌─────────▼──────────┐
                     │ IBM watsonx        │
                     │ Orchestrate        │
                     │ Interview Agent    │
                     │ + RAG Knowledge    │
                     │   Base             │
                     └────────────────────┘
```
