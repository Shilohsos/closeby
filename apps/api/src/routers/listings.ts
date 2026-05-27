import { Router, type Router as RouterType } from 'express';
import { eq, ilike, and, gte, lte, count, desc } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../lib/db.js';
import { listings, storefronts } from '@closeby/db';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router: RouterType = Router();

const CATEGORIES = ['housing', 'jobs', 'services', 'food_restaurants', 'electronics', 'fashion', 'events'] as const;

const querySchema = z.object({
  q: z.string().optional(),
  category: z.enum(CATEGORIES).optional(),
  location: z.string().optional(),
  minPrice: z.coerce.number().int().nonnegative().optional(),
  maxPrice: z.coerce.number().int().nonnegative().optional(),
  userId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

const bodySchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  category: z.enum(CATEGORIES),
  location: z.string().min(1),
  price: z.number().int().nonnegative(),
  imageUrl: z.string().url().optional().nullable(),
});

// GET /api/listings
router.get('/', async (req, res) => {
  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) throw new AppError(400, parsed.error.issues.map((e: z.ZodIssue) => e.message).join(', '));

  const { q, category, location, minPrice, maxPrice, userId, page, limit } = parsed.data;

  const conditions: any[] = [];
  if (q) conditions.push(ilike(listings.title, `%${q}%`));
  if (category) conditions.push(eq(listings.category, category));
  if (location) conditions.push(eq(listings.location, location));
  if (minPrice !== undefined) conditions.push(gte(listings.price, minPrice));
  if (maxPrice !== undefined) conditions.push(lte(listings.price, maxPrice));
  if (userId) conditions.push(eq(listings.userId, userId));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [data, [{ total }]] = await Promise.all([
    db.select().from(listings).where(where).orderBy(desc(listings.createdAt)).limit(limit).offset((page - 1) * limit),
    db.select({ total: count() }).from(listings).where(where),
  ]);

  res.json({ data, total: Number(total), page });
});

// GET /api/listings/:id
router.get('/:id', async (req, res) => {
  const id = req.params.id as string;
  const rows = await db
    .select({ listing: listings, seller: storefronts })
    .from(listings)
    .leftJoin(storefronts, eq(listings.userId, storefronts.userId))
    .where(eq(listings.id, id))
    .limit(1);

  if (!rows.length) throw new AppError(404, 'Listing not found');
  const { listing, seller } = rows[0];
  res.json({ data: { ...listing, seller } });
});

// POST /api/listings
router.post('/', requireAuth, requireRole('seller'), async (req, res) => {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(400, parsed.error.issues.map((e: z.ZodIssue) => e.message).join(', '));

  const [created] = await db
    .insert(listings)
    .values({ ...parsed.data, userId: req.user!.id })
    .returning();

  res.status(201).json({ data: created });
});

// PATCH /api/listings/:id
router.patch('/:id', requireAuth, async (req, res) => {
  const id = req.params.id as string;
  const [existing] = await db.select().from(listings).where(eq(listings.id, id)).limit(1);
  if (!existing) throw new AppError(404, 'Listing not found');
  if (existing.userId !== req.user!.id) throw new AppError(403, 'Not your listing');

  const parsed = bodySchema.partial().safeParse(req.body);
  if (!parsed.success) throw new AppError(400, parsed.error.issues.map((e: z.ZodIssue) => e.message).join(', '));

  const [updated] = await db
    .update(listings)
    .set(parsed.data)
    .where(eq(listings.id, id))
    .returning();

  res.json({ data: updated });
});

// DELETE /api/listings/:id
router.delete('/:id', requireAuth, async (req, res) => {
  const id = req.params.id as string;
  const [existing] = await db.select().from(listings).where(eq(listings.id, id)).limit(1);
  if (!existing) throw new AppError(404, 'Listing not found');
  if (existing.userId !== req.user!.id) throw new AppError(403, 'Not your listing');

  await db.delete(listings).where(eq(listings.id, id));
  res.status(204).send();
});

export default router;
