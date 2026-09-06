import { Request, Response, NextFunction } from 'express';
import { createError } from './errorHandler';

type ValidationRule = {
  field: string;
  type?: 'string' | 'number' | 'boolean' | 'array';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  enum?: string[];
};

export function validateBody(rules: ValidationRule[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: string[] = [];
    const body = req.body;

    for (const rule of rules) {
      const value = body[rule.field];

      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(`Field '${rule.field}' is required.`);
        continue;
      }

      if (value === undefined || value === null) continue;

      if (rule.type === 'string' && typeof value !== 'string') {
        errors.push(`Field '${rule.field}' must be a string.`);
      }
      if (rule.type === 'number' && typeof value !== 'number') {
        errors.push(`Field '${rule.field}' must be a number.`);
      }
      if (rule.type === 'array' && !Array.isArray(value)) {
        errors.push(`Field '${rule.field}' must be an array.`);
      }
      if (rule.type === 'string' && rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
        errors.push(`Field '${rule.field}' must be at least ${rule.minLength} characters.`);
      }
      if (rule.type === 'string' && rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
        errors.push(`Field '${rule.field}' must be no more than ${rule.maxLength} characters.`);
      }
      if (rule.enum && !rule.enum.includes(String(value))) {
        errors.push(`Field '${rule.field}' must be one of: ${rule.enum.join(', ')}.`);
      }
    }

    if (errors.length > 0) {
      next(createError(errors.join(' '), 400, 'VALIDATION_ERROR'));
      return;
    }

    next();
  };
}
