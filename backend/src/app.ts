import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler';
import healthRouter from './routes/health';
import profileRouter from './routes/profile';
import resumeRouter from './routes/resume';
import interviewRouter from './routes/interview';
import chatRouter from './routes/chat';
import voiceRouter from './routes/voice';

const app = express();

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/health', healthRouter);
app.use('/api/ai/status', healthRouter);
app.use('/api/profile', profileRouter);
app.use('/api/resume', resumeRouter);
app.use('/api/interview', interviewRouter);
app.use('/api/interviews', interviewRouter);
app.use('/api/chat', chatRouter);
app.use('/api/voice', voiceRouter);

// ── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'NOT_FOUND', message: `Route ${req.path} not found.` });
});

// ── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

export default app;
