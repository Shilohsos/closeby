import { Router } from 'express';
import { eq, asc, count } from 'drizzle-orm';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import { db } from '../lib/db.js';
import { hushEvents, hushTickets, hushFees } from '@closeby/db';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { AppError } from '../middleware/errorHandler.js';
import { sendApprovalEmail } from '../services/email.js';

const router = Router();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const hushEventSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().optional(),
  flyerUrl: z.string().url().optional(),
  paymentProofUrl: z.string().url().optional(),
  bankName: z.string().min(1),
  accountNumber: z.string().min(1),
  accountName: z.string().min(1),
  ticketPrice: z.number().int().positive(),
  eventDate: z.string().datetime(),
  location: z.string().min(1),
  capacity: z.number().int().positive(),
});

function approvalHtml(title: string, body: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>${title}</title></head>
<body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#030712;color:#fff;">
  <div style="text-align:center;padding:2rem;max-width:480px;">
    <div style="font-size:3rem;margin-bottom:1rem;">✅</div>
    <h1 style="color:#15803d;font-size:2rem;margin-bottom:.5rem;">${title}</h1>
    <p style="color:#9ca3af;font-size:1.1rem;">${body}</p>
  </div>
</body>
</html>`;
}

// POST /api/hush/events — create event (organizer only)
router.post('/events', requireAuth, requireRole('organizer'), validate(hushEventSchema), async (req, res) => {
  const [event] = await db.insert(hushEvents).values({
    organizerId: req.user!.id,
    title: req.body.title,
    description: req.body.description ?? null,
    flyerUrl: req.body.flyerUrl ?? null,
    paymentProofUrl: req.body.paymentProofUrl ?? null,
    bankName: req.body.bankName,
    accountNumber: req.body.accountNumber,
    accountName: req.body.accountName,
    ticketPrice: req.body.ticketPrice,
    eventDate: new Date(req.body.eventDate),
    location: req.body.location,
    capacity: req.body.capacity,
    status: 'pending',
  }).returning();

  const approveUrl = `${req.protocol}://${req.get('host')}/api/hush/events/${event.id}/approve?token=${event.adminToken}`;

  try {
    await sendApprovalEmail({
      to: process.env.ADMIN_EMAIL!,
      eventTitle: event.title,
      eventDate: new Date(event.eventDate).toLocaleDateString('en-NG', { dateStyle: 'full' }),
      organizerName: req.user!.email,
      paymentProofUrl: event.paymentProofUrl ?? '',
      approveUrl,
    });
  } catch (e) {
    console.error('[hush] Failed to send approval email:', e);
  }

  res.status(201).json({ data: event });
});

// GET /api/hush/events — approved events (public)
router.get('/events', async (_req, res) => {
  const events = await db.select().from(hushEvents)
    .where(eq(hushEvents.status, 'approved'))
    .orderBy(asc(hushEvents.eventDate));
  res.json({ data: events });
});

// GET /api/hush/events/:id/approve?token=X — one-click admin approval
// Registered BEFORE /:id to avoid route param capture
router.get('/events/:id/approve', async (req, res) => {
  const { id } = req.params;
  const { token } = req.query as { token?: string };

  const [event] = await db.select().from(hushEvents).where(eq(hushEvents.id, id));

  if (!event) {
    return res.status(404).send(approvalHtml('Not Found', 'Event not found.'));
  }
  if (event.status === 'approved') {
    return res.send(approvalHtml('Already Approved', `"${event.title}" was already approved.`));
  }
  if (!token || event.adminToken !== token) {
    return res.status(403).send(approvalHtml('Invalid Token', 'This approval link is invalid or expired.'));
  }

  await db.update(hushEvents)
    .set({ status: 'approved', adminToken: randomUUID() })
    .where(eq(hushEvents.id, id));

  return res.send(approvalHtml('Event is now live!', `🎉 "${event.title}" is approved and visible to the public.`));
});

// GET /api/hush/events/:id — single event (public if approved; own-pending requires auth)
router.get('/events/:id', async (req, res) => {
  const [event] = await db.select().from(hushEvents).where(eq(hushEvents.id, req.params.id));
  if (!event) throw new AppError(404, 'Event not found');

  if (event.status === 'pending') {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) throw new AppError(404, 'Event not found');
    const { data: { user }, error } = await supabase.auth.getUser(authHeader.slice(7));
    if (error || !user || user.id !== event.organizerId) throw new AppError(404, 'Event not found');
  }

  const [{ soldTickets }] = await db
    .select({ soldTickets: count() })
    .from(hushTickets)
    .where(eq(hushTickets.eventId, req.params.id));

  res.json({ data: { ...event, soldTickets: Number(soldTickets) } });
});

// POST /api/hush/tickets — buy ticket (auth required)
router.post('/tickets', requireAuth, async (req, res) => {
  const parsed = z.object({
    eventId: z.string().uuid(),
    buyerName: z.string().min(1).max(100),
  }).safeParse(req.body);

  if (!parsed.success) {
    throw new AppError(400, parsed.error.issues.map((i) => i.message).join(', '));
  }
  const { eventId, buyerName } = parsed.data;

  const [event] = await db.select().from(hushEvents).where(eq(hushEvents.id, eventId));
  if (!event || event.status !== 'approved') throw new AppError(404, 'Event not found');

  const [{ ticketCount }] = await db
    .select({ ticketCount: count() })
    .from(hushTickets)
    .where(eq(hushTickets.eventId, eventId));

  if (Number(ticketCount) >= event.capacity) throw new AppError(400, 'Sold out');

  const referenceCode = randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase();

  const [ticket] = await db.insert(hushTickets).values({
    eventId,
    buyerId: req.user!.id,
    buyerName,
    referenceCode,
  }).returning();

  const fee = Math.round(event.ticketPrice * 0.1);
  await db.insert(hushFees).values({ ticketId: ticket.id, amount: fee });

  res.status(201).json({ referenceCode });
});

// GET /api/hush/tickets/:ref — public receipt
router.get('/tickets/:ref', async (req, res) => {
  const [ticket] = await db.select().from(hushTickets)
    .where(eq(hushTickets.referenceCode, req.params.ref));
  if (!ticket) throw new AppError(404, 'Ticket not found');

  const [event] = await db.select().from(hushEvents)
    .where(eq(hushEvents.id, ticket.eventId));

  res.json({ data: { ticket, event } });
});

export default router;
