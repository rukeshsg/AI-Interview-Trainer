import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const statusCode = err.statusCode || 500;

  // Never expose internal stack traces to clients; preserve descriptive human-friendly messages
  const message =
    err.message && !err.message.includes('\n') && !err.message.includes('at ')
      ? err.message
      : 'Interview generation is temporarily unavailable. Please try again.';

  // Log internally (without sensitive credentials)
  console.error(`[ERROR] ${req.method} ${req.path} — ${err.message}`);

  res.status(statusCode).json({
    error: err.code || (statusCode >= 500 ? 'IBM_SERVICE_ERROR' : 'REQUEST_ERROR'),
    message,
  });
}

export function createError(message: string, statusCode = 500, code?: string): AppError {
  const err = new Error(message) as AppError;
  err.statusCode = statusCode;
  err.code = code;
  return err;
}
