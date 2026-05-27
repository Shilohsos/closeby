import { Router, type Router as RouterType } from 'express';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../lib/db.js';
import { storefronts, listings } from '@closeby/db';
import { requireAuth } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router: RouterType = Router();

const storefrontSchema = z.object({
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional().nullable(),
  phone: z.string().optional(),
  socialLinks: z.array(z.string()).default([]),
});

// PUT /api/storefronts/me — must be registered before /:userId to avoid conflict
router.put('/me', requireAuth, async (req, res) => {
  const parsed = storefrontSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(400, parsed.error.issues.map((e: z.ZodIssue) => e.message).join(', '));

  const [result] = await db
    .insert(storefronts)
    .values({ userId: req.user!.id, ...parsed.data })
    .onConflictDoUpdate({ target: storefronts.userId, set: parsed.data })
    .returning();

  res.json({ data: result });
});

// GET /api/storefronts/:userId
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  const [storefrontRows, sellerListings] = await Promise.all([
    db.select().from(storefronts).where(eq(storefronts.userId, userId)).limit(1),
    db.select().from(listings).where(eq(listings.userId, userId)).orderBy(desc(listings.createdAt)),
  ]);

  res.json({ data: storefrontRows[0] ?? null, listings: sellerListings });
});

export default router;
