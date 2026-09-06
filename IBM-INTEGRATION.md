# IBM watsonx Orchestrate Integration Guide

## Overview

This document explains how to connect the AI Interview Trainer to your IBM watsonx Orchestrate deployment.

The application uses the **Interview Trainer Agent** (RAG-powered) as its AI reasoning layer.

---

## Step 1 — Collect These Values From IBM Console

You need the following from your IBM Cloud / watsonx Orchestrate environment:

### 1.1 IBM Cloud IAM API Key

**Where:** IBM Cloud Console → Manage → Access (IAM) → API keys → Create

**Used for:** Authenticating all requests to IBM watsonx Orchestrate

**Variable:** `IBM_ORCHESTRATE_API_KEY`

### 1.2 watsonx Orchestrate Instance URL

**Where:** IBM watsonx Orchestrate service page → Service credentials or URL

**Format:** `https://api.<region>.watson-orchestrate.cloud.ibm.com/instances/<instance-id>`

**Variable:** `IBM_ORCHESTRATE_BASE_URL`

### 1.3 Agent ID

**Where:** IBM watsonx Orchestrate workspace → Your agent → Settings/Details

**Known value:** `e3823416-2b52-48ed-8c8a-853e3b0e39d1`

**Variable:** `IBM_ORCHESTRATE_AGENT_ID`

### 1.4 Agent Version

**Value:** `v2.0`

**Variable:** `IBM_ORCHESTRATE_AGENT_VERSION`

### 1.5 Environment

**Value:** `live` (for the deployed/published agent version)

**Variable:** `IBM_ORCHESTRATE_ENVIRONMENT`

---

## Step 2 — Configure .env

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

Edit `.env`:

```
IBM_ORCHESTRATE_BASE_URL=https://api.jp-tok.watson-orchestrate.cloud.ibm.com/instances/d9911a40-8cc3-40fd-830a-4ce5990442c0
IBM_ORCHESTRATE_API_KEY=<your-real-api-key>
IBM_ORCHESTRATE_AGENT_ID=e3823416-2b52-48ed-8c8a-853e3b0e39d1
IBM_ORCHESTRATE_AGENT_VERSION=v2.0
IBM_ORCHESTRATE_ENVIRONMENT=live
ENABLE_MOCK_AI=false
```

**NEVER commit `.env` to Git.**

---

## Step 3 — Voice Services (Optional)

If you want to enable voice interview mode:

```
IBM_STT_API_URL=https://api.<region>.speech-to-text.watson.cloud.ibm.com
IBM_STT_API_KEY=<speech-to-text-api-key>
IBM_TTS_API_URL=https://api.<region>.text-to-speech.watson.cloud.ibm.com
IBM_TTS_API_KEY=<text-to-speech-api-key>
```

**Where to get:** IBM Cloud → Watson services → Speech to Text / Text to Speech → Service credentials

---

## Step 4 — Start the Application

```bash
npm run dev
```

---

## Step 5 — Test the Connection

Visit: `http://localhost:3001/api/health`

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "mockMode": false,
  "ibmConfigured": true
}
```

If `ibmConfigured: false`, check your `.env` values.

---

## Step 6 — How It Works

```
Frontend (React)
  → POST /api/interview/question
    → backend/src/services/orchestrateService.ts
      → IBM watsonx Orchestrate API
        → Interview Trainer Agent
          → RAG Knowledge Base
            → LLM Response
      → Parsed response
    → JSON response to frontend
  → Question displayed to user
```

---

## Architecture — IBM Integration Layer

All IBM API calls are isolated in:

```
backend/src/services/orchestrateService.ts
```

The service handles:
- IBM IAM token acquisition
- Request construction
- Response parsing (JSON + natural language fallback)
- Error handling and friendly error messages

---

## Switching From Mock to Live Mode

1. Ensure `.env` has real IBM credentials
2. Ensure `ENABLE_MOCK_AI=false`
3. Restart the backend: `npm run dev --prefix backend`

The application will automatically use the real IBM agent.

---

## Security Notes

- API key is only in `.env` (server-side)
- Never logged, never sent to browser
- Not in any source file
- Not in README or documentation
- `.gitignore` covers `.env`
