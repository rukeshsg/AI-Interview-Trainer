# API Documentation — AI Interview Trainer

Base URL: `http://localhost:3001/api`

All responses are JSON. All error responses follow:
```json
{ "error": "ERROR_CODE", "message": "Human-readable description" }
```

---

## GET /api/health

Health check.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "mockMode": false,
  "ibmConfigured": true,
  "version": "1.0.0"
}
```

---

## POST /api/profile

Create or update a candidate profile. Send `id` in body to update.

**Request:**
```json
{
  "name": "Priya Sharma",
  "targetRole": "Python Developer",
  "experienceLevel": "fresher",
  "skills": ["Python", "SQL", "Django"],
  "yearsExperience": 0,
  "targetCompany": "TCS",
  "industry": "Software",
  "careerGoal": "Full-stack developer"
}
```

**Response:** `CandidateProfile` object with `id`, `createdAt`, `updatedAt`.

---

## GET /api/profile/:id

Get a candidate profile by ID.

**Response:** `CandidateProfile` object or 404.

---

## POST /api/resume/upload

Upload and parse a resume file (PDF or DOCX, max 10MB).

**Request:** `multipart/form-data` with field `resume`.

**Response:**
```json
{
  "success": true,
  "filename": "resume.pdf",
  "size": 102400,
  "data": {
    "skills": ["Python", "SQL"],
    "experience": ["Software Developer at XYZ"],
    "education": ["B.Tech CS, ABC University"],
    "projects": ["E-commerce platform"],
    "certifications": ["AWS Cloud Practitioner"],
    "rawText": "..."
  }
}
```

On parse failure returns HTTP 422:
```json
{ "success": false, "error": "PARSE_ERROR", "message": "Could not extract..." }
```

---

## POST /api/interview/start

Start a new interview session.

**Request:**
```json
{
  "candidateId": "uuid",
  "role": "Python Developer",
  "experienceLevel": "fresher",
  "interviewType": "technical",
  "difficulty": "medium",
  "questionCount": 5,
  "interviewMode": "text"
}
```

**Response:** `InterviewSession` object with `id`, `status: "active"`.

---

## POST /api/interview/question

Get the next question for a session (generated one at a time from IBM agent).

**Request:**
```json
{ "sessionId": "uuid", "questionNumber": 1 }
```

**Response:**
```json
{
  "id": "uuid",
  "sessionId": "uuid",
  "questionNumber": 1,
  "question": "What is a Python list comprehension?",
  "topic": "Python",
  "difficulty": "easy",
  "type": "technical"
}
```

---

## POST /api/interview/evaluate

Submit an answer and receive AI evaluation.

**Request:**
```json
{
  "sessionId": "uuid",
  "questionId": "uuid",
  "answer": "A list comprehension is..."
}
```

**Response:**
```json
{
  "answer": { "id": "...", "answer": "...", "submittedAt": "..." },
  "evaluation": {
    "technicalAccuracy": 8,
    "relevance": 9,
    "clarity": 8,
    "completeness": 7,
    "communication": 8,
    "overallScore": 8,
    "strengths": ["Clear explanation", "Good example"],
    "improvements": ["Could be more complete"],
    "suggestions": ["Mention edge cases"],
    "modelAnswer": "..."
  }
}
```

---

## POST /api/interview/model-answer

Get a detailed model answer for a question.

**Request:** `{ "sessionId": "uuid", "questionId": "uuid" }`

**Response:**
```json
{
  "modelAnswer": "A comprehensive model answer...",
  "keyPoints": ["Point 1", "Point 2"],
  "tips": ["Be concise", "Use examples"]
}
```

---

## POST /api/interview/summary

Finalize session and generate AI performance summary.

**Request:** `{ "sessionId": "uuid" }`

**Response:** Full summary including `overallScore`, `categoryAverages`, `strongAreas`, `weakAreas`, `recommendations`, `questions`, `answers`, `evaluations`.

---

## GET /api/interviews

List all interview sessions (most recent first).

**Response:** Array of `InterviewSession` objects.

---

## GET /api/interviews/:id

Get full session detail including profile, questions, answers, evaluations, and summary.

**Response:** Complete session object with all related data.

---

## POST /api/chat

Send a message to the IBM Interview Trainer AI assistant.

**Request:**
```json
{
  "message": "Give me a Python question",
  "profileId": "uuid",
  "history": [{ "role": "user", "content": "..." }, { "role": "assistant", "content": "..." }]
}
```

**Response:**
```json
{ "reply": "Here is a Python question: ..." }
```

---

## Error Codes

| Code | HTTP | Meaning |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Invalid request body |
| `NOT_FOUND` | 404 | Resource not found |
| `PROFILE_NOT_FOUND` | 404 | Profile ID not found |
| `SESSION_NOT_FOUND` | 404 | Session ID not found |
| `QUESTION_NOT_FOUND` | 404 | Question ID not found |
| `SESSION_INACTIVE` | 400 | Session is not in active state |
| `FILE_TOO_LARGE` | 400 | Uploaded file exceeds limit |
| `UPLOAD_ERROR` | 400 | File upload/validation error |
| `PARSE_ERROR` | 422 | Resume could not be parsed |
| `SERVER_ERROR` | 500 | Internal server error |
