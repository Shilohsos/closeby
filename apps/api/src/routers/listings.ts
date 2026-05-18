import { Router, type Router as RouterType } from 'express';

const router: RouterType = Router();

// GET /api/listings — search + filter + paginate
router.get('/', (_req, res) => {
  res.json({ data: [], total: 0, page: 1 });
});

// GET /api/listings/:id
router.get('/:id', (_req, res) => {
  res.json({ data: null });
});

// POST /api/listings — create (seller only)
router.post('/', (_req, res) => {
  res.status(201).json({ data: null });
});

// PATCH /api/listings/:id — update (owner only)
router.patch('/:id', (_req, res) => {
  res.json({ data: null });
});

// DELETE /api/listings/:id — delete (owner only)
router.delete('/:id', (_req, res) => {
  res.status(204).send();
});

export default router;
