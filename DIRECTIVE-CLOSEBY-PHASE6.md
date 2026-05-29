# Phase 6 — Production Deployment

**IMPORTANT: Merge master into your feature branch before starting.**

Prepare the codebase for production deployment on a VPS (173.249.16.116). Two changes needed before Wizard deploys:

---

## 1. Express — Serve built frontend in production

Modify `apps/api/src/index.ts`:

After the API routes (`/api/*`) and before the error handler, add:

```ts
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
```

Then serve the built Vite frontend:

```ts
// Serve built frontend in production
const webDist = path.resolve(__dirname, '../../web/dist');
app.use(express.static(webDist));

// SPA fallback — all non-API routes serve index.html
app.get('*', (_req, res) => {
  res.sendFile(path.join(webDist, 'index.html'));
});
```

**Order matters:** static middleware must be registered AFTER API routes (so `/api/*` is caught first) but BEFORE the error handler.

Make sure `helmet` doesn't block the frontend — it's fine since we're serving same-origin.

Also add `path` and `url` to the top imports:

```ts
import 'dotenv/config';
import express, { type Express } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import helmet from 'helmet';
```

---

## 2. Configurable API base URL (optional improvement)

In `apps/web/src/lib/api.ts`, change:

```ts
const BASE = '/api';
```

to:

```ts
const BASE = import.meta.env.VITE_API_BASE || '/api';
```

This lets us configure the API path via env var at build time (e.g. `VITE_API_BASE=/closeby/api` for path-based reverse proxy).

No other frontend changes needed — the React SPA handles its own routing.

---

## 3. Build verification

```bash
pnpm build
```

Must pass cleanly across all packages.

---

## 4. Files changed

| File | Action |
|------|--------|
| `apps/api/src/index.ts` | **Update** — add static file serving + SPA fallback + path/url imports |
| `apps/web/src/lib/api.ts` | **Update** — use VITE_API_BASE env var with fallback to `/api` |

Do NOT modify:
- Database schema
- Any router files
- Any page components
- Auth middleware

---

## Branch Name

`claude/phase6-deploy-XXXXX` (replace XXXXX with random suffix)
