import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { createError } from '../middleware/errorHandler';
import { parseResume } from '../parsers/resumeParser';

const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
const MAX_FILE_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10);

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (req, file, cb) => {
    const safeName = `${Date.now()}-${Math.random().toString(36).substring(2)}${path.extname(file.originalname)}`;
    cb(null, safeName);
  },
});

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are supported.'));
    }
  },
});

const router = Router();

// POST /api/resume/upload
router.post('/upload', (req: Request, res: Response, next: NextFunction) => {
  upload.single('resume')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(createError(`File size must be under ${MAX_FILE_SIZE_MB}MB.`, 400, 'FILE_TOO_LARGE'));
      }
      return next(createError(err.message, 400, 'UPLOAD_ERROR'));
    }
    if (err) {
      return next(createError(err.message, 400, 'UPLOAD_ERROR'));
    }

    const file = req.file;
    if (!file) {
      return next(createError('No file uploaded.', 400, 'NO_FILE'));
    }

    try {
      const resumeData = await parseResume(file.path, file.mimetype);

      // Clean up temp file after parsing
      fs.unlink(file.path, () => {});

      res.json({
        success: true,
        filename: file.originalname,
        size: file.size,
        data: resumeData,
      });
    } catch (parseErr: unknown) {
      // Clean up file even on error
      if (file.path) fs.unlink(file.path, () => {});

      console.error('[Resume] Parse error:', (parseErr as Error).message);
      res.status(422).json({
        success: false,
        error: 'PARSE_ERROR',
        message: 'Could not extract information from this file. You can continue without a resume.',
      });
    }
  });
});

export default router;
