import { Router, type Router as RouterType } from 'express';

const router: RouterType = Router();

// GET /api/hush/events — approved only, public
router.get('/events', (_req, res) => {
  res.json({ data: [] });
});

// GET /api/hush/events/:id — approved public OR own pending
router.get('/events/:id', (_req, res) => {
  res.json({ data: null });
});

// POST /api/hush/events — create event (organizer only)
router.post('/events', (_req, res) => {
  res.status(201).json({ data: null });
});

// GET /api/hush/events/:id/approve?token=X — admin approval
router.get('/events/:id/approve', (_req, res) => {
  res.send('<h1>Event approved</h1>');
});

// POST /api/hush/tickets — buy ticket
router.post('/tickets', (_req, res) => {
  res.status(201).json({ referenceCode: '' });
});

// GET /api/hush/tickets/:ref — public receipt
router.get('/tickets/:ref', (_req, res) => {
  res.json({ data: null });
});

export default router;
