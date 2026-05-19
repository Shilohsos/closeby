import type { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { AppError } from './errorHandler.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(new AppError(401, 'Missing or invalid authorization header'));
  }

  const { data: { user }, error } = await supabase.auth.getUser(authHeader.slice(7));

  if (error || !user) {
    return next(new AppError(401, 'Invalid or expired token'));
  }

  req.user = {
    id: user.id,
    email: user.email!,
    role: user.user_metadata?.role || 'buyer',
  };

  next();
}

export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new AppError(401, 'Not authenticated'));
    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, `Requires role: ${roles.join(' or ')}`));
    }
    next();
  };
}
