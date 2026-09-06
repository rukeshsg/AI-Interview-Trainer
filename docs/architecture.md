# Architecture — AI Interview Trainer

## System Overview

```
Browser (React 18 + TypeScript + Vite)
         │
         │ HTTP /api/* (proxied in dev, direct in prod)
         ▼
Node.js + Express + TypeScript Backend (port 3001)
         │
         ├── /api/health      — health check
         ├── /api/profile     — candidate profiles (SQLite)
         ├── /api/resume      — resume upload + parsing
         ├── /api/interview   — session, questions, evaluation, summary
         └── /api/chat        — AI assistant
                    │
                    ▼
         orchestrateService.ts  ← ONLY IBM integration layer
                    │
                    │ IBM IAM token auth → Bearer token
                    │ POST /v1/agents/{agentId}/sessions
                    │ POST /v1/agents/{agentId}/sessions/{id}/message
                    ▼
         IBM watsonx Orchestrate
                    │
                    ▼
         Interview Trainer Agent (agentId: e3823416-...)
                    │
                    ▼
         RAG Knowledge Base (interview guidance PDFs)
                    │
                    ▼
         LLM Reasoning + Response
                    │
                    ▼ (back through the chain)
         Backend → Frontend → User
```

## Frontend Architecture

```
frontend/src/
├── api/            — HTTP client functions (one file per domain)
│   ├── client.ts   — Axios instance, proxy config, error interceptor
│   ├── profileApi.ts
│   ├── resumeApi.ts
│   ├── interviewApi.ts
│   └── chatApi.ts
├── components/     — Reusable UI components
│   ├── ui/         — Base components (Button, Card, Badge, Modal, etc.)
│   ├── interview/  — Interview-specific components
│   └── onboarding/ — Onboarding flow components
├── context/        — React Context for app state (profile, session, resume)
├── hooks/          — Custom hooks (useInterview state machine)
├── layouts/        — AppLayout (sidebar + outlet) and Sidebar
├── pages/          — Route pages (lazy-loaded)
├── services/       — Voice service (frontend side)
├── types/          — TypeScript interfaces (mirrors backend types)
└── utils/          — Utility functions
```

## Backend Architecture

```
backend/src/
├── app.ts          — Express app factory (middleware + routes)
├── server.ts       — Entry point (loads .env, starts DB, listens)
├── db/
│   ├── database.ts — @databases/sqlite singleton connection
│   ├── schema.ts   — CREATE TABLE migrations (run on startup)
│   └── repositories/
│       ├── profileRepository.ts
│       ├── sessionRepository.ts
│       ├── questionRepository.ts
│       ├── answerRepository.ts
│       └── evaluationRepository.ts
├── middleware/
│   ├── errorHandler.ts    — Global error handler (never leaks stack traces)
│   └── validateRequest.ts — Request body validator
├── parsers/
│   └── resumeParser.ts    — PDF (pdf-parse) + DOCX (mammoth) extraction
├── routes/
│   ├── health.ts
│   ├── profile.ts
│   ├── resume.ts
│   ├── interview.ts
│   └── chat.ts
├── services/
│   └── orchestrateService.ts ← All IBM API calls live here
├── types/
│   └── index.ts    — Shared TypeScript interfaces
└── utils/
    ├── promptBuilder.ts   — Clean prompt construction helpers
    └── scoreCalculator.ts — Score averaging utilities
```

## Database Schema

**SQLite** via `@databases/sqlite` (pure JS, no native compilation)

| Table | Purpose |
|---|---|
| `candidate_profiles` | Candidate name, role, skills, resume text |
| `interview_sessions` | Session metadata, status, overall score |
| `interview_questions` | Per-question details with topic + difficulty |
| `interview_answers` | Raw submitted answers |
| `interview_evaluations` | Multi-dimensional scores + strengths/improvements |

## IBM Integration Flow

1. Backend reads `IBM_ORCHESTRATE_API_KEY` from env
2. `orchestrateService.ts` calls IBM IAM to get a Bearer token (cached 50 min)
3. Creates an agent session: `POST {baseUrl}/v1/agents/{agentId}/sessions?env_id={agentEnvId}`
4. Sends message with prompt: `POST .../sessions/{sessionId}/message`
5. Parses response (tries JSON, falls back to natural language extraction)
6. Returns structured data to route handler
7. Route handler saves to SQLite and returns JSON to frontend

## Security Architecture

- API keys only in `.env` (server-side, never committed, never logged)
- Frontend has ZERO IBM credentials — all calls go through `/api/*` backend
- Multer validates MIME type + file size before parsing
- Error handler strips internal details from client responses
- `agentEnvironmentId` scopes requests to the "live" published agent version
