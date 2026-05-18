import { type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import { AppError } from './errorHandler.js';

type ZodSchema = z.ZodTypeAny;

export function validate(schema: ZodSchema, source: 'body' | 'query' = 'body') {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(source === 'body' ? req.body : req.query);
    if (!result.success) {
      const messages = result.error.issues.map((e: z.ZodIssue) => e.message).join(', ');
      throw new AppError(400, messages);
    }
    if (source === 'body') {
      req.body = result.data;
    }
    next();
  };
}
