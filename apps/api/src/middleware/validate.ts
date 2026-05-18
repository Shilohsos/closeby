import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AppError } from './errorHandler.js';

type ZodSchema = z.ZodTypeAny;

export function validate(schema: ZodSchema, source: 'body' | 'query' = 'body') {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(source === 'body' ? req.body : req.query);
    if (!result.success) {
      throw new AppError(400, result.error.errors.map((e) => e.message).join(', '));
    }
    if (source === 'body') {
      req.body = result.data;
    }
    next();
  };
}
