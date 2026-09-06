import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { isSTTConfigured, isTTSConfigured, synthesizeSpeech, recognizeSpeech } from '../services/voiceService';
import { createError } from '../middleware/errorHandler';

const router = Router();
const upload = multer({
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
});

// GET /api/voice/status — check availability of voice services
router.get('/status', (req: Request, res: Response) => {
  const stt = isSTTConfigured();
  const tts = isTTSConfigured();
  res.json({
    available: stt || tts,
    stt,
    tts,
    sttConfigured: stt,
    ttsConfigured: tts,
    provider: 'IBM Watson Speech Services',
  });
});

// POST /api/voice/synthesize — Text-to-Speech
router.post('/synthesize', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string' || !text.trim()) {
      throw createError('Text is required for speech synthesis.', 400, 'VALIDATION_ERROR');
    }

    if (!isTTSConfigured()) {
      return res.status(503).json({
        error: 'VOICE_NOT_CONFIGURED',
        message: 'IBM Text to Speech is not configured on the server. Falling back to browser speech synthesis.',
      });
    }

    const { data, contentType } = await synthesizeSpeech(text.trim());
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', data.length);
    res.send(data);
  } catch (err) {
    next(err);
  }
});

// POST /api/voice/recognize — Speech-to-Text
router.post('/recognize', upload.single('audio'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!isSTTConfigured()) {
      return res.status(503).json({
        error: 'VOICE_NOT_CONFIGURED',
        message: 'IBM Speech to Text is not configured on the server. Falling back to browser speech recognition.',
      });
    }

    const file = req.file;
    if (!file) {
      throw createError('No audio file provided.', 400, 'NO_FILE');
    }

    const transcript = await recognizeSpeech(file.buffer, file.mimetype);
    res.json({ transcript });
  } catch (err) {
    next(err);
  }
});

export default router;
