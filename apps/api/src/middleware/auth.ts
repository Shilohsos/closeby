import type { Request, Response, NextFunction } from 'express';
import { createServerClient } from '@supabase/ssr';
import { AppError } from './errorHandler.js';

// Extend Express Request
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

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError(401, 'Missing or invalid authorization header');
  }

  const token = authHeader.slice(7);

  try {
    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

    // Create minimal supabase client for verification
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        detectSessionInUrl: false,
      },
      cookies: {
        get: () => undefined,
        set: () => {},
        remove: () => {},
      },
    });

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      throw new AppError(401, 'Invalid or expired token');
    }

    req.user = {
      id: data.user.id,
      email: data.user.email!,
      role: data.user.user_metadata?.role || 'buyer',
    };

    next();
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(401, 'Authentication failed');
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError(401, 'Not authenticated');
    }
    if (!roles.includes(req.user.role)) {
      throw new AppError(403, `Requires role: ${roles.join(' or ')}`);
    }
    next();
  };
}
