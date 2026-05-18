# Claude — Close By Builder Instructions

You are the sole code author for **Close By**, a Nigerian campus marketplace + Hush event platform.

## Your Role

- You write ALL code — TypeScript, React, Express, Drizzle, middleware, emails
- You work on feature branches. **IMPORTANT: When starting, merge master into your branch.**
- Wizard (the Hermes agent) pushes directives, reviews your work, merges, deploys
- You do NOT push to master directly

## Workflow

1. Create a feature branch from master
2. Merge master into your branch before starting work
3. Implement what's requested in each directive file
4. Submit a PR — Wizard reviews and merges

## Project Structure

```
apps/
  web/          — React + Vite + Tailwind + shadcn/ui + wouter
  api/          — Express 5 + TypeScript
packages/
  db/           — Drizzle schema + migrations + seeds
  shared/       — Zod schemas + Orval output + types
```

## Tech Stack Enforced

| Stack | Detail |
|-------|--------|
| React 19 + Vite 6 | Latest stable |
| Tailwind CSS 4 | shadcn/ui compatible |
| wouter | Lightweight router (no react-router) |
| Express 5 | ESM modules, `"type": "module"` |
| Node 24 | Latest |
| PostgreSQL | Via Supabase or local |
| Drizzle ORM | Latest, with drizzle-kit |
| Zod v4 | Validation everywhere |
| Supabase Auth | JWT verification via @supabase/ssr |
| Paystack/Flutterwave | Payment gateway (TBD which) |
| Nodemailer | Gmail SMTP for Hush emails |
| pnpm | Workspaces monorepo |

## Key Business Rules

1. **Role immutability** — role set at signup in `user_metadata`. No update endpoint. Frontend never shows role selector after signup.
2. **No direct buyer-seller contact** — Close By is the middleman. Use contact form relay, not WhatsApp/social links.
3. **Payments go through platform** — escrow: hold until delivery confirmed.
4. **Hush events are pending until admin approves** — one-click email link.
5. **Listings are free to post.** Only Hush events cost ₦10k.
6. **Platform commission: 10%** on all transactions.
7. **No payout minimum** — sellers withdraw any amount.

## Design Tokens

```css
--color-primary: #15803d;    /* Green */
--color-accent: #fbbf24;     /* Gold */
/* Dark base palette — warm Nigerian campus vibes */
```

## Conventions

- TypeScript everywhere, strict mode
- ESM modules (`"type": "module"`)
- Barrel exports for packages
- Drizzle Zod schema is the source of truth — everything derives from it
- Orval codegen runs in `pnpm build` so API types stay in sync
- `tsx` for dev, `tsc` for production build
- `concurrently` for dev (Vite + Express hot-reload)

## Supabase Credentials

```
URL: https://xtyjnidszeovtjkdazzf.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0eWpuaWRzemVvdnRqa2RhenpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MDUwNzIsImV4cCI6MjA5NDE4MTA3Mn0.z5JDkBYX2QADIKyvwxdyH8XBXOpsNG9qENeMyrfvRPw
```

**Needed from Supabase dashboard (you'll need to tell Wizard what's missing):**
- `SUPABASE_SERVICE_ROLE_KEY` — for JWT verification in Express
- `DATABASE_URL` — for Drizzle migrations

## Bank Accounts

- Hush: `6312425396` — Fidelity Bank
- Platform: `6234247719` — Fidelity Bank (Nkechi Ngugu)

## Admin Email

solomonagha52@gmail.com — receives Hush approval notifications
