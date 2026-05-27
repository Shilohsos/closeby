# Phase 5 — OpenAPI, UX Audit, SEO, Deployment Prep

**IMPORTANT: Merge master into your feature branch before starting.** Main has Phases 1–4 merged.

This is a polish/infra phase. Covers four areas: OpenAPI spec + Orval codegen, loading/error/empty state audit, SEO meta tags, and mobile responsiveness. Do them in this order.

---

## 1. OpenAPI Spec + Orval Codegen

### 1a. Write `openapi.yaml`

Create `packages/shared/openapi.yaml` covering ALL endpoints with request/response schemas. This is the source of truth for Orval output.

**Endpoints to document:**

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | /api/health | — | { status: string, timestamp: string } |
| GET | /api/stats | — | { totalListings, activeSellers, supportedLocations } |
| GET | /api/listings | — | Paginated: q, category, location, minPrice, maxPrice, userId, page, limit |
| GET | /api/listings/:id | — | Returns listing with joined seller |
| POST | /api/listings | Seller | Create listing |
| PATCH | /api/listings/:id | Owner | Update listing |
| DELETE | /api/listings/:id | Owner | 204 |
| GET | /api/storefronts/:userId | — | Returns storefront + listings |
| PUT | /api/storefronts/me | Auth | Upsert |
| GET | /api/hush/events | — | Approved only, sorted by date |
| GET | /api/hush/events/:id | — | Public approved OR own-pending |
| POST | /api/hush/events | Organizer | Create event (sends email) |
| GET | /api/hush/events/:id/approve | — | ?token, returns HTML |
| POST | /api/hush/tickets | Auth | Buy ticket |
| GET | /api/hush/tickets/:ref | — | Public receipt |

Use `application/json` for all (except approval which returns `text/html`). Reference shared schemas to avoid duplication.

Define component schemas:
- `Listing` — all fields including seller join
- `Storefront` — all fields
- `HushEvent` — all fields including computed soldTickets
- `Ticket` — with nested event
- `PaginatedResponse<T>` — generic wrapper with data, total, page
- `ErrorResponse` — { error: string }

### 1b. Install & Configure Orval

```bash
pnpm add -D orval --filter @closeby/shared
```

Create `packages/shared/orval.config.ts`:

```ts
import { defineConfig } from 'orval';

export default defineConfig({
  closeby: {
    input: './openapi.yaml',
    output: {
      target: './src/api/',
      client: 'react-query',
      mode: 'tags',
    },
    hooks: {
      afterAllFilesWrite: 'prettier --write',
    },
  },
});
```

Output goes to `packages/shared/src/api/` — this is where the generated React Query hooks will live.

### 1c. Add Codegen to Build Pipeline

In `packages/shared/package.json`:
```json
"scripts": {
  "codegen": "orval",
  "build": "orval && tsc"
}
```

This means every `pnpm build` for shared package will regenerate hooks from the spec.

Add `packages/shared/src/api/` to `.gitignore` if desired (Orval regenerates on every build) — your choice. I recommend **not** ignoring it so the generated code is visible in code review.

### 1d. Note on Usage

After codegen, frontend code CAN use the generated hooks but does NOT need to migrate immediately. The existing `hooks/useListings.ts`, `hooks/useStorefront.ts` etc. still work. The Orval output is additive — teams can migrate page by page. For this phase, just get the pipeline working.

---

## 2. UX Audit — Loading, Empty, Error States

Audit every page in `apps/web/src/pages/`. Some are already well-covered by Phases 3–4, but several gaps remain.

### 2a. Error Boundary Component

Create `apps/web/src/components/ErrorBoundary.tsx`:

React class component that catches `componentDidCatch` errors. Shows a centered card with:
- ⚠️ icon
- "Something went wrong" heading
- Error message (only in dev mode)
- "Try Again" button that resets the boundary

Wrap `<App />` in `main.tsx` with the error boundary.

### 2b. Toast System

shadcn/ui's Toast (`@radix-ui/react-toast`) is already in `package.json` and `components/ui/toast.tsx`.

Create `apps/web/src/providers/ToastProvider.tsx` that wraps children with shadcn's ToastProvider/ToastViewport/Toaster. Add it to `main.tsx` wrapping the app.

Add a `useToast()` hook (if not already present — check `components/ui/toast.tsx` first; it may already export one). If not, create a simple one using the shadcn pattern.

Then add toasts on these mutations:
- **CreateListing.tsx** — success toast "Listing posted!" + redirect
- **PostEvent.tsx** — success toast "Event submitted for review!" + redirect
- **BuyTicket.tsx** — success toast "Ticket issued!" + redirect
- **Profile.tsx** (delete) — success toast "Listing deleted"
- **Profile.tsx** (storefront save) — success toast "Storefront saved"

### 2c. Missing States

| Page | Gap | Fix |
|------|-----|-----|
| Home | No error state for featured listings or stats | Wrap both queries: if error, show inline "Could not load" with retry |
| Profile | No error state in My Listings tab | Show error alert with retry |
| CreateListing | Edit mode: no loading skeleton while existing listing loads | Show skeleton while `isLoading` is true |
| PostEvent | No loading skeleton (form has no external fetch) | Already fine — form only |
| SignIn / SignUp / ResetPassword | No loading/error states | Add `isPending` on button, show error text below form |

### 2d. Audit Checklist (verify each):

- [ ] Every page has a loading skeleton (or spinner for forms)
- [ ] Every data-fetching page has an error state with retry
- [ ] Every list page has an empty state with a CTA
- [ ] Every mutation shows a toast on success
- [ ] Every mutation shows inline error text on failure
- [ ] Error boundary catches uncaught rendering errors

---

## 3. SEO & Meta Tags

### 3a. Dynamic `<title>` Tag

Create `apps/web/src/hooks/usePageTitle.ts`:

```ts
function usePageTitle(title: string) {
  useEffect(() => { document.title = `Close By — ${title}`; }, [title]);
}
```

Add to every page:
- `/` → "Campus Marketplace"
- `/browse` → "Browse Listings"
- `/listing/:id` → "Listing: {title}"
- `/store/:userId` → "Storefront"
- `/hush` → "Hush — Campus Events"
- `/hush/event/:id` → event title
- `/hush/ticket/:ref` → "Ticket Receipt"
- `/create` → "Post a Listing"
- `/hush/post` → "Post an Event"
- `/profile` → "My Profile"
- `/signin` → "Sign In"
- `/signup` → "Sign Up"

### 3b. Open Graph Meta Tags

Add OG meta tags to key pages for social sharing. The simplest approach in Vite/wouter:

Create `apps/web/src/components/SEOHead.tsx`:

```tsx
export function SEOHead({ title, description, image, url }: {
  title: string;
  description?: string;
  image?: string;
  url?: string;
}) {
  useEffect(() => {
    const tags = [
      ['og:title', `Close By — ${title}`],
      ['og:description', description ?? "Nigeria's campus marketplace"],
      ['og:image', image ?? '/og-default.png'],
      ['og:url', url ?? window.location.href],
      ['og:type', 'website'],
      ['twitter:card', 'summary_large_image'],
    ];
    // Set or create meta tags
    tags.forEach(([property, content]) => {
      let el = document.querySelector(`meta[property="${property}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute('property', property); document.head.appendChild(el); }
      el.setAttribute('content', content);
    });
  }, [title, description, image, url]);

  return null; // renders nothing
}
```

Add `<SEOHead ... />` to:
- **ListingDetail** — with listing title, description, image, URL
- **EventDetail** — with event title, description, flyer image, URL
- **HushLanding** — with site description and default OG image
- **Home** — with site description and default OG image

### 3c. robots.txt

Create `apps/web/public/robots.txt`:

```
User-agent: *
Allow: /
Sitemap: https://closeby.ng/sitemap.xml
```

(We'll add sitemap later — the robots.txt path is fine as a placeholder.)

### 3d. Default OG Image

Create `apps/web/public/og-default.png` — a simple branded image. Since we can't generate images here, just add a note:

```
// A simple green/gold OG image will be added before deployment.
// For now, the OG tags will work without a custom image.
```

---

## 4. Mobile Responsiveness Audit

### 4a. CSS Breakpoints

Tailwind v4 defaults are already responsive. Verify these patterns are applied:

**Grid patterns (check every grid across all pages):**
- Listing grids: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- Event grids (Hush): `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Category grid (Home): `grid-cols-2 md:grid-cols-4`
- Browse sidebar: `grid-cols-1 lg:grid-cols-4` (sidebar collapses above content on mobile)

**Fix known issues from codebase audit:**
- Browse sidebar: On mobile (<1024px), the filter sidebar stacks above results — verify it does this correctly and doesn't overflow
- All `<select>` elements: ensure they use full width on mobile (they use `w-full` already)
- All form inputs: they wrap correctly in 2-col grids → collapse to 1-col on mobile

### 4b. Navbar

Mobile Navbar needs a hamburger menu or bottom tab bar. The current Navbar has desktop links only.

Update `Navbar.tsx`:
- On mobile (<768px): replace desktop links with a hamburger menu (or use shadcn Sheet/Drawer)
- Bottom tab bar: show Home, Browse, Hush, Profile icons on mobile
- Ensure "Post Listing" and "Post Event" CTAs are accessible on mobile (they're currently in the desktop nav only)

### 4c. Touch Targets

- All buttons: minimum 44px height for touch targets (shadcn Button has `h-10` which is ~40px — bump to `h-11` or ensure padding compensates)
- All links in navigation: minimum tap area
- Pagination buttons: ensure they're not too small to tap

### 4d. Font & Text

- No text smaller than 12px on mobile
- Heading sizes scale down on mobile (use `text-3xl md:text-5xl` pattern for hero headings)
- Line-clamp for listing titles on cards prevents overflow

### 4e. Print Styles

The Hush TicketReceipt already has `@media print` styles. Verify they work:
- White background
- No nav/buttons printed
- QR code visible
- All text black on white

---

## 5. Files to Create/Modify

| File | Action |
|------|--------|
| `packages/shared/openapi.yaml` | **Create** — full spec |
| `packages/shared/orval.config.ts` | **Create** — Orval config |
| `packages/shared/package.json` | **Update** — add `orval` dep and codegen script |
| `apps/web/src/components/ErrorBoundary.tsx` | **Create** |
| `apps/web/src/components/SEOHead.tsx` | **Create** — OG/title meta manager |
| `apps/web/src/hooks/usePageTitle.ts` | **Create** |
| `apps/web/src/providers/ToastProvider.tsx` | **Create** — if not already functional |
| `apps/web/src/main.tsx` | **Update** — wrap with ErrorBoundary + ToastProvider |
| `apps/web/public/robots.txt` | **Create** |
| `apps/web/src/components/Navbar.tsx` | **Update** — mobile hamburger/bottom tabs |
| `apps/web/src/pages/Home.tsx` | **Update** — add error states, OG tags, page title |
| `apps/web/src/pages/Browse.tsx` | **Update** — page title, mobile grid audit |
| `apps/web/src/pages/ListingDetail.tsx` | **Update** — SEOHead, page title |
| `apps/web/src/pages/CreateListing.tsx` | **Update** — loading skeleton for edit, toast, page title |
| `apps/web/src/pages/Storefront.tsx` | **Update** — page title |
| `apps/web/src/pages/Profile.tsx` | **Update** — error state for listings tab, toasts, page title |
| `apps/web/src/pages/HushLanding.tsx` | **Update** — SEOHead, page title |
| `apps/web/src/pages/EventDetail.tsx` | **Update** — SEOHead, page title |
| `apps/web/src/pages/PostEvent.tsx` | **Update** — toast on success, page title |
| `apps/web/src/pages/BuyTicket.tsx` | **Update** — toast on success, page title |
| `apps/web/src/pages/TicketReceipt.tsx` | **Update** — SEOHead, page title |
| `apps/web/src/pages/SignIn.tsx` | **Update** — loading/error states, page title |
| `apps/web/src/pages/SignUp.tsx` | **Update** — loading/error states, page title |
| `apps/web/src/pages/ResetPassword.tsx` | **Update** — loading/error states, page title |

Do NOT modify:
- Database schema
- API routers (listings, storefronts, hush)
- `packages/db/`
- Auth middleware

---

## 6. Build Verification

```bash
pnpm build
```

Must pass cleanly across all packages (shared codegen → API → web).

---

## Branch Name

`claude/phase5-polish-XXXXX` (replace XXXXX with random suffix)
