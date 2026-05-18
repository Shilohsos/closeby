# Close By 🎯

**Nigerian campus marketplace + Hush event platform**

A full-stack web app where Nigerian university students can buy, sell, and connect. Covers housing, jobs, services, food, electronics, fashion, and events — all filtered by location. Plus **Hush**, a sub-platform for campus events with ticketing and admin approval.

**Brand:** Green `#15803d` + Gold `#fbbf24` on dark backgrounds — warm Nigerian campus vibes.

---

## Business Model

| Aspect | Detail |
|--------|--------|
| Marketplace listings | Free to post |
| Hush event listing | ₦10,000 per event |
| Platform commission | 10% on all transactions |
| Payout threshold | No minimum — sellers withdraw any amount |
| Buyer | Pays through Close By for products |
| Delivery | Free (buyer's perception) |

**Bank accounts:**
- Hush: `6312425396` — Fidelity Bank
- Platform: `6234247719` — Fidelity Bank (Nkechi Ngugu)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite, Tailwind CSS, shadcn/ui, wouter |
| Backend | Express 5 (Node 24) |
| Database | PostgreSQL + Drizzle ORM |
| Auth | Supabase Auth (Google OAuth + email/password) |
| Storage | Supabase Storage (bucket: `profiles`) |
| Email | Nodemailer + Gmail SMTP |
| Payments | Paystack or Flutterwave (TBD) |
| Monorepo | pnpm workspaces |
| Validation | Zod v4 + drizzle-zod |
| API Codegen | Orval (OpenAPI → React Query hooks) |

---

## Pages (14)

1. **Home** `/` — Hero banner, category browser, featured listings, live stats
2. **Browse** `/browse` — Search + filter sidebar, listing card grid, pagination
3. **Listing Detail** `/listing/:id` — Full info, seller card, contact form (not WhatsApp)
4. **Create Listing** `/create` — Form for sellers (seller role guard)
5. **Storefront** `/store/:userId` — Seller avatar, bio, socials, all their listings
6. **Profile** `/profile` — My Listings, Edit Storefront, Stats
7. **Hush Landing** `/hush` — Sub-brand, grid of approved upcoming events
8. **Event Detail** `/hush/event/:id` — Flyer, info, bank details, Buy Ticket CTA
9. **Post Event** `/hush/post` — Organizer form with flyer + payment proof upload (organizer role guard)
10. **Buy Ticket** `/hush/event/:id/buy` — Bank transfer instructions, name, confirm
11. **Ticket Receipt** `/hush/ticket/:referenceCode` — Digital ticket, QR code, printable
12. **Sign In** `/signin` — Email/password + Google OAuth + forgot password
13. **Sign Up** `/signup` — Email/password + role selector (buyer/seller/organizer) + Google OAuth
14. **Reset Password** `/reset-password` — Reads token from URL hash

---

## Database Tables

### `listings`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK, defaultRandom |
| user_id | text | Supabase user ID |
| title | text | not null |
| description | text | nullable |
| category | enum | housing, jobs, services, food_restaurants, electronics, fashion, events |
| location | text | not null |
| price | integer | in kobo (₦ × 100) |
| image_url | text | nullable |
| created_at | timestamp | default now |

### `storefronts`
| Column | Type | Notes |
|--------|------|-------|
| user_id | text | PK, upsert pattern |
| bio | text | nullable |
| avatar_url | text | nullable |
| phone | text | nullable — for contact form relay |
| social_links | jsonb | default [] |

### `hush_events`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK, defaultRandom |
| organizer_id | text | Supabase user ID |
| title | text | not null |
| description | text | nullable |
| flyer_url | text | nullable |
| payment_proof_url | text | nullable |
| bank_name | text | not null |
| account_number | text | not null |
| account_name | text | not null |
| ticket_price | integer | kobo |
| event_date | timestamp | not null |
| location | text | not null |
| status | enum | pending / approved |
| admin_token | UUID | load-bearing for approval flow |
| capacity | integer | not null |

### `hush_tickets`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| event_id | UUID | FK → hush_events |
| buyer_id | text | Supabase user ID |
| buyer_name | text | not null |
| reference_code | text | unique, first 8 chars of UUID uppercased |
| created_at | timestamp | default now |

### `hush_fees`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| ticket_id | UUID | FK → hush_tickets |
| amount | integer | kobo |
| created_at | timestamp | default now |

### `transactions` (future)
Payments table — payment_id, buyer_id, seller_id, listing_id, amount, platform_fee, status (pending/held/released/disputed)

---

## Supabase Config

**Project URL:** `https://xtyjnidszeovtjkdazzf.supabase.co`
**Anon Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0eWpuaWRzemVvdnRqa2RhenpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MDUwNzIsImV4cCI6MjA5NDE4MTA3Mn0.z5JDkBYX2QADIKyvwxdyH8XBXOpsNG9qENeMyrfvRPw`

**To do (UI):**
- Enable Google OAuth provider
- Enable email/password sign-in
- Set redirect URLs: `http://localhost:5173/**`

**Storage:** `profiles` bucket — public read, auth-only upload, path starts with user UID

---

## Environment Variables

```env
DATABASE_URL=postgresql://...
SUPABASE_URL=https://xtyjnidszeovtjkdazzf.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=<from supabase dashboard>
GMAIL_USER=<gmail address>
GMAIL_APP_PASSWORD=<app password>
ADMIN_EMAIL=solomonagha52@gmail.com
```

---

## Architecture

```
closeby/
├── apps/
│   ├── web/          # React + Vite + Tailwind + shadcn/ui
│   └── api/          # Express 5 + TypeScript
└── packages/
    ├── db/           # Drizzle schema + migrations + seeds
    └── shared/       # Zod schemas + Orval output + types
```

**Key rules:**
- Role immutability — role set at signup, never changeable. No API endpoint for it. Frontend never shows it after signup.
- No direct buyer-seller contact — Close By is the middleman. Contact form or in-app messaging routed through platform.
- Escrow on payments — hold money until delivery confirmed (Phase 2 feature).
- Hush events — only go live after admin approves via one-click email link.

---

## Hush Approval Flow

1. Organizer submits event → saved as `pending` in DB
2. Email sent to `solomonagha52@gmail.com` with event details + payment proof + Approve button
3. Admin clicks Approve → `GET /api/hush/events/:id/approve?token=X` → status flips to `approved`
4. Token is single-use — cleared after approval
5. Event goes live publicly on `/hush`

---

## Deployment

**Host:** Replit
**Build:** `pnpm build` → Orval codegen → tsc API → Vite build web
**Start:** `pnpm start` → Express serves API + static files
**Secrets:** All env vars in Replit Secrets tab
