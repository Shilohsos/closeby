# DIRECTIVE-CLOSEBY-SCAFFOLD

**IMPORTANT: Merge master into your branch first.** Then start a feature branch called `scaffold-monorepo`.

## Goal

Scaffold the full Close By monorepo — pnpm workspaces, Vite + React app, Express 5 API, Drizzle DB package, shared types package. `pnpm dev` must start both Vite and Express with hot-reload.

## Steps

### 1. Root monorepo

- `/root/closeby/` as project root
- `pnpm init` at root
- `pnpm-workspace.yaml`:
  ```yaml
  packages:
    - 'apps/*'
    - 'packages/*'
  ```
- Root `package.json` scripts:
  ```json
  {
    "dev": "concurrently \"pnpm --filter @closeby/api dev\" \"pnpm --filter @closeby/web dev\"",
    "build": "pnpm --filter @closeby/shared build && pnpm --filter @closeby/db build && pnpm --filter @closeby/api build && pnpm --filter @closeby/web build",
    "start": "pnpm --filter @closeby/api start"
  }
  ```
- Root `tsconfig.base.json` with strict mode, path aliases, `@/*` -> `./src/*`

### 2. packages/db

- `package.json` with `@closeby/db` name
- Dependencies: `drizzle-orm`, `drizzle-kit`, `postgres`, `tsx`
- `schema.ts` — define ALL 5 tables (listings, storefronts, hush_events, hush_tickets, hush_fees) as specified in README.md
- `drizzle.config.ts` pointing to schema.ts
- Scripts: `db:generate`, `db:migrate`, `db:studio`, `db:seed`
- `index.ts` — re-export all tables
- `seed.ts` — 5 dummy listings, 2 storefronts, 1 approved event, 1 pending event

### 3. packages/shared

- `package.json` with `@closeby/shared` name
- `drizzle-zod` for schema-derived validation schemas
- Empty `src/api/` directory (Orval output goes here later)

### 4. apps/api

- `package.json` with `"type": "module"`, `@closeby/api` name
- Dependencies: `express@5`, `cors`, `helmet`, `zod`, `@supabase/supabase-js`, `@supabase/ssr`, `nodemailer`, `drizzle-orm`, `postgres`
- Dev deps: `tsx`, `typescript`, `@types/express`, `@types/cors`, `@types/nodemailer`
- `src/index.ts` — Express 5 app shell:
  - CORS configured for localhost:5173
  - JSON body parser
  - `GET /api/health`
  - Global error handler middleware
  - Mount placeholder routers for `/api/listings`, `/api/storefronts`, `/api/hush`
- `src/middleware/errorHandler.ts` — catches errors, returns `{ error: message }`
- `src/middleware/auth.ts` — Supabase JWT verification placeholder (implement deeper in Phase 2)
- `src/middleware/validate.ts` — Zod request validation middleware
- `src/routers/listings.ts` — placeholder
- `src/routers/storefronts.ts` — placeholder
- `src/routers/hush.ts` — placeholder
- Script: `"dev": "tsx watch src/index.ts"`, `"start": "node dist/index.js"`

### 5. apps/web

- Scaffold with Vite + React TypeScript template
- `package.json` with `@closeby/web` name
- Dependencies: `wouter`, `@supabase/supabase-js`, `@tanstack/react-query`, `zod`
- Dev deps: `tailwindcss`, `postcss`, `autoprefixer`, `typescript`
- `tailwind.config.ts` with brand tokens:
  - `primary: #15803d` (green)
  - `accent: #fbbf24` (gold)
  - Dark base palette
- `src/App.tsx` — wouter router shell with ALL 14 routes (placeholder components for each):
  - `/` → Home
  - `/browse` → Browse
  - `/listing/:id` → ListingDetail
  - `/create` → CreateListing
  - `/store/:userId` → Storefront
  - `/profile` → Profile
  - `/hush` → HushLanding
  - `/hush/event/:id` → EventDetail
  - `/hush/event/:id/buy` → BuyTicket
  - `/hush/ticket/:referenceCode` → TicketReceipt
  - `/hush/post` → PostEvent
  - `/signin` → SignIn
  - `/signup` → SignUp
  - `/reset-password` → ResetPassword
- Each route component is a stub: `<div>Page Name</div>` with proper exports
- `src/lib/supabase.ts` — Supabase client init with env vars
- `vite.config.ts` with `@` alias

### 6. shadcn/ui

- Init shadcn/ui in apps/web
- Install components: button, card, dialog, form, badge, tabs, input, select, textarea, toast, skeleton

### 7. .env files

- `apps/web/.env` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- `apps/api/.env` with `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `ADMIN_EMAIL`
- Root `.env.example` with all vars documented, no real values

### 8. dev verification

- `pnpm dev` must start both Vite (port 5173) and Express (port 3000) via concurrently
- Visiting `http://localhost:5173` shows the React app
- `curl http://localhost:3000/api/health` returns `{ "status": "ok" }`

## Do NOT

- Do not implement actual page content yet — just stubs and routing
- Do not implement API business logic yet — just placeholders
- Do not configure real database connections — just set up the infrastructure
- Do not implement auth flows yet — those come in Phase 2 directive
