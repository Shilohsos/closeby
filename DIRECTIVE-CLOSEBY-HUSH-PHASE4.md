# Phase 4 — Hush Event Platform

**IMPORTANT: Merge main into your feature branch before starting.** Main has Phase 3 merged (listings CRUD, browse, storefront, profile).

Build the full Hush event platform — event CRUD, admin approval email, ticketing, receipts.

---

## 1. Hush API — `apps/api/src/routers/hush.ts`

Replace the stubs with real implementations. Import `db` from `@closeby/db` schema, `requireAuth` and `requireRole` from middleware, `validate` from middleware, `z` from zod v4.

### 1a. POST /api/hush/events — Create event (organizer only)

Middleware chain: `requireAuth`, `requireRole('organizer')`, `validate(hushEventSchema)`.

Schema (Zod v4 — use `z.object`):
- title: z.string().min(3).max(200)
- description: z.string().optional()
- flyerUrl: z.string().url().optional()
- paymentProofUrl: z.string().url().optional()
- bankName: z.string().min(1)
- accountNumber: z.string().min(1)
- accountName: z.string().min(1)
- ticketPrice: z.number().int().positive()
- eventDate: z.string().datetime() (ISO string)
- location: z.string().min(1)
- capacity: z.number().int().positive()

**Logic:**
1. Insert into `hushEvents` table with `organizerId = req.user.id`, `status = 'pending'`
2. After insert, call `sendApprovalEmail(...)` from `../services/email.js`
3. Return 201 with the created event

### 1b. GET /api/hush/events — List approved events (public)

**Logic:**
1. Query `hushEvents` where `status = 'approved'`, ordered by `eventDate` ascending
2. Return `{ data: events }`

### 1c. GET /api/hush/events/:id — Single event

**Logic:**
1. Fetch by id
2. If not found → 404
3. If `status = 'approved'` → return event (public)
4. If `status = 'pending'` AND `req.user?.id === event.organizerId` → return event (own pending)
5. If `status = 'pending'` AND not owner → 404 (don't reveal pending events)
6. Include sold ticket count: `select count(*) from hush_tickets where event_id = :id`
7. Return `{ data: { ...event, soldTickets: count } }`

### 1d. GET /api/hush/events/:id/approve?token=X — Admin approval

**Logic:**
1. Find event by id
2. If not found → HTML: "Event not found"
3. If `adminToken !== token` → HTML: "Invalid approval token"
4. If already approved → HTML: "Event was already approved"
5. Update: `status = 'approved'`, `adminToken = null` (single-use)
6. Return styled HTML confirmation page (green theme, "Event is now live!")

### 1e. POST /api/hush/tickets — Buy ticket (auth required)

Middleware chain: `requireAuth`.

**Schema:**
- eventId: z.string().uuid()
- buyerName: z.string().min(1).max(100)

**Logic:**
1. Fetch event — must exist and be approved
2. Count existing tickets — if `count >= event.capacity` → 400 "Sold out"
3. Generate `referenceCode`: uuid v4, take first 8 chars, uppercase
4. Insert into `hushTickets`: `{ eventId, buyerId: req.user.id, buyerName, referenceCode }`
5. Calculate fee: `Math.round(ticketPrice * 0.1)` (10% in kobo)
6. Insert into `hushFees`: `{ ticketId, amount: fee }`
7. Return 201 with `{ referenceCode }`

### 1f. GET /api/hush/tickets/:ref — Public receipt

**Logic:**
1. Find ticket by `referenceCode`
2. Join with event to get event title, date, location, flyerUrl
3. If not found → 404
4. Return `{ data: { ticket, event } }`

---

## 2. Supabase Storage — profiles bucket

Create `profiles` bucket in Supabase (via dashboard or API):
- Public read
- Authenticated upload only
- Path must start with user UID

Claude: Do NOT create the bucket in code. Add a one-time setup note:
```
Supabase Storage setup (manual — run once in Supabase Dashboard):
- Create "profiles" bucket (public)
- Policy: INSERT for authenticated users WHERE (storage.foldername(name))[1] = auth.uid()::text
- Policy: SELECT for everyone
```

---

## 3. Frontend — Hush Pages (`apps/web/src/pages/`)

### 3a. HushLanding.tsx — `/hush`

Fully implement:
- Branded hero section: dark gradient bg, "Hush" in large gold text, "Campus events, parties, and experiences. Get your ticket." subtitle
- Fetch from `/api/hush/events` on mount (use `get<{data: Event[]}>('/hush/events')` directly, no React Query needed for simplicity — or use `useQuery` from `@tanstack/react-query`)
- Grid of event cards (1-col mobile, 2-col tablet, 3-col desktop)
- Each card: flyer image (rounded), event name, date formatted nicely, location, ticket price in ₦
- Loading: skeleton grid (6 skeleton cards)
- Empty: "No upcoming events yet. Check back soon." with a music emoji
- Error: error state with retry button

### 3b. EventDetail.tsx — `/hush/event/:id`

- Fetch event with `get<{data: Event}>(`/hush/events/${id}`)`
- Full-width flyer image at top (max-h-96 object-cover)
- Event title (h1), date/time, location badges
- Description section
- Ticket price prominently displayed
- "Buy Ticket" button → navigates to `/hush/event/:id/buy`
- If current user is the organizer AND event is pending → show yellow "⏳ Under Review" banner
- Loading skeleton
- 404 state

### 3c. PostEvent.tsx — `/hush/post` (organizer only)

Full form:
- Event name (text input)
- Description (textarea)
- Date/time (datetime-local input)
- Venue/location (text input)
- Capacity (number input)
- Ticket price in ₦ (number input — stored in kobo, multiply by 100)
- Bank name (text input)
- Account number (text input)
- Account name (text input)
- Flyer image URL (text input — paste URL, no file upload in v1)
- Payment proof URL (text input — paste URL)

Form notes:
- ₦10,000 listing fee — show a notice: "Listing fee: ₦10,000. Transfer to Fidelity Bank account 6312425396 (Hush) and upload proof of payment."
- Server-side validates all fields
- On success → redirect to `/hush` with success toast
- All inputs controlled, Zod client-side validation via react-hook-form

### 3d. BuyTicket.tsx — `/hush/event/:id/buy`

- Fetch event details
- Show organizer bank details prominently in a card:
  - Bank name
  - Account number
  - Account name
  - Note: "Transfer the ticket price to the account above. Your ticket will be issued after payment confirmation."
- Buyer name input (pre-filled from Supabase user metadata if available)
- "Confirm & Get Ticket" button
- On submit: POST to `/api/hush/tickets` with `{ eventId, buyerName }`
- On success → redirect to `/hush/ticket/:referenceCode`

### 3e. TicketReceipt.tsx — `/hush/ticket/:referenceCode`

- Fetch ticket + event data from `/api/hush/tickets/:ref`
- Display:
  - Event name, date, venue
  - Buyer name
  - Reference code in large monospace font (like `X7K9M2P1`)
  - QR code (install `qrcode` package — `import QRCode from 'qrcode'` and render as data URI `<img>`)
  - "Add to Home Screen" meta (just add a note, mobile handles this natively)
- Printable: add `@media print` styles — white bg, centered, no nav/buttons
- Loading skeleton
- Error / not found state

---

## 4. Navbar Update

In `apps/web/src/components/Navbar.tsx`:
- Add "Hush" nav link (already likely there from scaffold)
- Ensure it shows for all users (public page)
- On mobile bottom tab, show Hush icon (🎵 or Music icon from lucide-react)

---

## 5. Dependencies to Install

**API side:**
- None — nodemailer already in package.json

**Web side:**
- `qrcode` — `pnpm add qrcode` + `pnpm add -D @types/qrcode`

From root: `pnpm add qrcode --filter @closeby/web && pnpm add -D @types/qrcode --filter @closeby/web`

---

## 6. Build Verification

After implementing:
```bash
pnpm build
```
Must pass across all packages (shared, db, api, web).

---

## Files You Will Modify/Create

| File | Action |
|------|--------|
| `apps/api/src/routers/hush.ts` | Rewrite — full implementation |
| `apps/web/src/pages/HushLanding.tsx` | Rewrite — full implementation |
| `apps/web/src/pages/EventDetail.tsx` | Rewrite — full implementation |
| `apps/web/src/pages/PostEvent.tsx` | Rewrite — full form with validation |
| `apps/web/src/pages/BuyTicket.tsx` | Rewrite — buyer flow |
| `apps/web/src/pages/TicketReceipt.tsx` | Rewrite — receipt with QR |
| `apps/web/src/components/Navbar.tsx` | Update — Hush link |
| `apps/api/src/services/email.ts` | Already wired — no changes needed |

Do NOT modify:
- Database schema (`packages/db/src/schema.ts`) — hush tables already exist
- `App.tsx` — routes already exist
- `api/src/index.ts` — hush router already mounted
- Auth middleware

Create a branch: `claude/hush-phase4-XXXXX` (replace XXXXX with a random suffix).
