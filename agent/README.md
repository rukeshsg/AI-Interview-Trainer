# 🤖 Interview Trainer Agent — IBM watsonx Orchestrate

## Overview

The **Interview Trainer Agent** is the intelligent core of the AI Interview Trainer platform, configured and orchestrated via **IBM watsonx Orchestrate** and powered by **IBM watsonx.ai (Granite / Foundation LLMs)** with grounded **RAG (Retrieval-Augmented Generation)** knowledge.

---

## 🏛️ Agent Specification & Configuration

| Parameter | Value |
| :--- | :--- |
| **Agent Name** | `Interview Trainer Agent` |
| **Agent ID** | `e3823416-2b52-48ed-8c8a-853e3b0e39d1` |
| **Environment ID** | `806c2d20-a62e-4668-b0b2-1f860c72750a` |
| **Version** | `v2.0` |
| **Environment** | `live` |
| **Region / Host** | `jp-tok.watson-orchestrate.cloud.ibm.com` |
| **Interface Protocol** | IBM watsonx Orchestrate REST API (`/v1/orchestrate/{agentId}/chat/completions`) |
| **Authentication** | IBM Cloud IAM OAuth2 Bearer Token (`https://iam.cloud.ibm.com/identity/token`) |

---

## 📂 Folder Structure

```
agent/
├── README.md                          # This architecture & usage guide
├── agent_spec.json                    # Formal agent definition & parameters
├── skills/
│   └── tools_schema.json              # OpenAPI & Tool specifications for agent actions
├── prompts/
│   ├── system_prompt.md               # Core persona & behavioral guidelines
│   ├── question_generator.md          # Adaptive question generation prompt
│   ├── answer_evaluator.md            # 5-dimension rubric evaluation prompt
│   ├── model_answer.md                # Reference model answer prompt
│   └── coaching_strategy.md           # Career coaching & performance dossier prompt
└── knowledge_base/
    ├── interview_rubrics.json         # Weighted scoring matrices (30/25/20/15/10)
    ├── star_methodology.md            # Behavioral STAR evaluation benchmarks
    └── technical_domains.md           # Core technical interview rubrics
```

---

## ⚡ Agent Capabilities & Operations

### 1. Adaptive Question Generation
- Generates dynamic, context-aware interview questions tailored to:
  - **Candidate Profile:** Target Role, Experience Tier (*Fresher, Entry, Intermediate, Experienced*), Target Company.
  - **Resume Context:** Extracted skills, past experience, and projects.
  - **Interview Mode:** Technical, HR, Behavioral (STAR), or Mixed.
  - **Difficulty Scaling:** Easy, Medium, Hard, or Adaptive.

### 2. Multi-Rubric Answer Evaluation
- Instant evaluation across **5 core standardized competencies**:
  1. **Technical Accuracy (30%)** — Conceptual correctness, architectural rigor, and domain depth.
  2. **Relevance (25%)** — Direct alignment with the question without fluff or evasion.
  3. **Clarity (20%)** — Logical sequencing, conciseness, and terminology precision.
  4. **Completeness (15%)** — Coverage of edge cases, trade-offs, and examples.
  5. **Communication (10%)** — Articulate tone, confidence, and professionalism.

### 3. Reference Model Answer Generation
- Produces exemplary expert answers with key talking points, STAR breakdowns, and code snippets.

### 4. Career Strategy & Comprehensive Performance Dossier
- Synthesizes session Q&As into holistic performance dossiers, actionable improvement roadmaps, and readiness verdicts.
