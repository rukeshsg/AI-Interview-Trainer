# Project Overview — AI Interview Trainer

## Problem Statement

**Problem Statement No. 22 — Interview Trainer Agent**

Challenge: Build an Interview Trainer Agent powered by RAG (Retrieval-Augmented Generation) that prepares users for job interviews by generating tailored question sets and preparation strategies based on their profile, experience level, and job role.

## Solution

AI Interview Trainer is a complete full-stack web application that wraps the IBM watsonx Orchestrate Interview Trainer Agent in a professional, portfolio-quality SaaS interface. It provides:

1. **End-to-end interview preparation workflow** — from profile creation to final performance report
2. **IBM watsonx Orchestrate integration** — the actual AI reasoning and RAG retrieval happen inside IBM's agent
3. **One-question-at-a-time mock interview** — realistic interview simulation
4. **Multi-dimensional answer evaluation** — 5 scoring categories with actionable feedback
5. **Interview history and performance tracking** — persistent SQLite database

## User Workflow

```
1. Landing Page
   ↓ "Start Preparing"
2. Candidate Profile
   Enter name, role, experience, skills
   ↓
3. Resume Upload (optional)
   Upload PDF/DOCX → extracted skills and context
   ↓
4. Interview Setup
   Choose type (Technical/HR/Behavioral/Mixed)
   Choose difficulty (Easy/Medium/Hard/Adaptive)
   Choose question count (5/10/15)
   Choose mode (Text/Voice)
   ↓
5. Mock Interview
   IBM agent generates Question 1
   Candidate types/speaks answer
   IBM agent evaluates answer → scores + feedback
   ↓ Next Question (×N)
6. Final Summary
   IBM agent generates performance summary
   ↓
7. Performance Report
   Overall score, category scores, strengths, weaknesses, recommendations
   ↓
8. Interview History
   Browse previous sessions, view reports
   ↓
9. AI Assistant
   Free-form coaching chat with IBM agent
```

## Features

- **Personalized Questions** — role + skills + experience + resume context
- **Technical Interviews** — algorithms, data structures, databases, APIs, OOP, Git, CI/CD
- **HR Interviews** — self-introduction, strengths/weaknesses, career goals, teamwork
- **Behavioral Interviews** — STAR-method scenarios (conflict, leadership, failure, adaptation)
- **Mixed Interviews** — intelligent combination based on target role
- **Answer Evaluation** — Technical Accuracy, Relevance, Clarity, Completeness, Communication
- **Model Answers** — hidden until user requests, then shown with key points
- **Performance Reports** — question-by-question, category averages, recommendations
- **Resume Upload** — PDF and DOCX, extracts skills/experience/education
- **AI Chat Assistant** — free-form coaching with suggestion chips
- **Voice Interview UI** — architecture ready; requires IBM Speech credentials

## Technology

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Lucide React |
| State | React Context + sessionStorage |
| Backend | Node.js 20, Express 4, TypeScript |
| Database | SQLite via @databases/sqlite |
| Resume | pdf-parse + mammoth |
| AI Layer | IBM watsonx Orchestrate |
| Agent | Interview Trainer Agent (RAG-powered) |
| Auth | IBM IAM API Key → Bearer token |
| Hosting | Any Node.js host (self-contained) |

## Expected Outcome

A user can complete a full interview preparation session — from profile creation through mock interview to detailed performance report — with all AI functionality powered by the real IBM watsonx Orchestrate Interview Trainer Agent and its RAG knowledge base.
