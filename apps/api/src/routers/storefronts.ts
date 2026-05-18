import { Router, type Router as RouterType } from 'express';

const router: RouterType = Router();

// GET /api/storefronts/:userId — public storefront
router.get('/:userId', (_req, res) => {
  res.json({ data: null });
});

// PUT /api/storefronts/me — upsert own storefront
router.put('/me', (_req, res) => {
  res.json({ data: null });
});

export default router;
