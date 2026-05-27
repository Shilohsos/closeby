# DIRECTIVE-CLOSEBY-MARKETPLACE-PHASE3

**IMPORTANT: Merge main into your branch first.** Then create a feature branch called `marketplace-phase3`.

**Context:**
- Auth (Phase 2) is complete — AuthProvider, signup/signin, JWT middleware, route guards all working
- Database is live on Supabase with all 5 tables
- All placeholder stubs and placeholder routers exist from the scaffold

## Goal

Replace all placeholder API endpoints and page stubs with real implementations. After this phase, users can browse listings, view details, create/edit listings, visit storefronts, and manage their profile.

---

## 1. Listings API — `apps/api/src/routers/listings.ts`

Replace the placeholder with real Drizzle queries against the Supabase database.

### GET /api/listings — Search + filter + paginate

Accept query params (all optional, Zod-validated):
- `q` — text search on title (case-insensitive ILIKE)
- `category` — enum filter
- `location` — exact match filter
- `minPrice` / `maxPrice` — integer range in kobo
- `userId` — filter by seller
- `page` — default 1
- `limit` — default 20, max 50

Returns:
```json
{
  "data": [ { "id": "...", "title": "...", "price": 15000000, "category": "housing", "location": "University of Lagos", "imageUrl": "...", "createdAt": "..." } ],
  "total": 42,
  "page": 1
}
```

Use the Drizzle query builder — not raw SQL. Import db from `@closeby/db`.

### GET /api/listings/:id — Single listing

Returns full listing object including seller info (join with storefronts to get seller name/avatar).

### POST /api/listings — Create listing

- Auth required + `requireRole('seller')`
- Validate body with Zod
- Insert into listings table
- Return created listing with 201 status

### PATCH /api/listings/:id — Update listing

- Auth required
- Owner-only: compare `req.user.id` against listing's `userId`
- Only allow updating: title, description, category, location, price, imageUrl
- Return updated listing

### DELETE /api/listings/:id — Delete listing

- Auth required
- Owner-only
- Return 204

---

## 2. Storefronts API — `apps/api/src/routers/storefronts.ts`

### GET /api/storefronts/:userId — Public storefront

Returns storefront data with the user's active listings.

### PUT /api/storefronts/me — Upsert own storefront

- Auth required
- Upsert pattern: insert if not exists, update if exists
- Fields: bio, avatarUrl, phone, socialLinks
- Return updated storefront

---

## 3. Stats API — Add to `apps/api/src/index.ts`

### GET /api/stats

Returns:
```json
{
  "totalListings": 150,
  "activeSellers": 42,
  "supportedLocations": 8
}
```

Query from DB for real counts. `supportedLocations` can be a count of distinct locations from listings.

---

## 4. Home Page — `apps/web/src/pages/Home.tsx`

Replace the placeholder with a real homepage.

### Hero Banner
- Full-width, centered
- Headline: "Welcome to **Close By**" (green accent on Close By)
- Subheadline: "Nigeria's campus marketplace — buy, sell, and connect with students near you."
- Two CTAs: "Browse Listings" (green, primary) and "Post an Item" (outlined)
- Use React Query to keep it alive

### Category Browser
- Grid (2-col mobile, 4-col desktop) of 7 category cards:
  - Housing, Jobs, Services, Food & Restaurants, Electronics, Fashion, Events
- Each has an emoji icon and links to `/browse?category=slug`

### Featured Listings
- Fetch from `GET /api/listings?limit=6&sort=newest`
- Horizontal scroll row of listing cards
- Each card: image (aspect-ratio), title, ₦price, location badge, category badge
- Loading state: skeleton cards (use shadcn Skeleton)
- Empty state: "No listings yet. Be the first to post!"

### Live Stats (optional, nice-to-have)
- Fetch from `GET /api/stats`
- Animated counters for total listings, active sellers, supported universities

---

## 5. Browse Page — `apps/web/src/pages/Browse.tsx`

### Filters Sidebar
- **Text search** — input field, debounced 300ms, syncs to URL `?q=`
- **Category** — multi-select (checkboxes) or single select dropdown, syncs to `?category=`
- **Location** — dropdown of Nigerian universities + areas, syncs to `?location=`
- **Price range** — min/max inputs, syncs to `?minPrice=&maxPrice=`
- All filters sync to URL query params so results are shareable

### Listing Card Grid
- Responsive: 1-col mobile → 2-col tablet → 3-col desktop
- Each card: image, title, price, location badge, category badge
- Click → navigate to `/listing/:id`
- Implement with React Query: `useQuery(['listings', filters], ...)`

### Pagination
- Show page numbers at bottom
- "Previous" / "Next" buttons
- Disabled on first/last page

### States
- **Loading**: skeleton grid (6 skeleton cards)
- **Empty**: "No listings found" with an SVG illustration and "Try adjusting your filters" message
- **Error**: "Something went wrong" with retry button

---

## 6. Listing Detail Page — `apps/web/src/pages/ListingDetail.tsx`

- Fetch listing by ID with `useQuery`
- Full-width image (hero style)
- Title, price (₦ formatted), category badge, location badge
- Description below
- **Seller card** on the side: avatar, name, link to `/store/:userId`
- **"Contact Seller" button** — modal or form that submits to a simple contact endpoint (or shows seller's contact info if they opted in)
- Loading state: skeleton page
- Not found state: "This listing doesn't exist"

---

## 7. Create Listing Page — `apps/web/src/pages/CreateListing.tsx`

- Route guard: `requireAuth(CreateListing, ['seller'])`
- Form fields:
  - Title (text input)
  - Description (textarea)
  - Category (select dropdown with all 7 categories)
  - Location (select dropdown with Nigerian universities list)
  - Price (number input, in ₦ — convert to kobo on submit)
  - Image URL (text input — paste a URL)

- Zod client-side validation
- On submit: `POST /api/listings` → redirect to `/listing/:id`
- Loading state on submit button (spinner + "Posting...")
- Error toast on failure

---

## 8. Storefront Page — `apps/web/src/pages/Storefront.tsx`

- Route: `/store/:userId`
- Fetch `GET /api/storefronts/:userId` and `GET /api/listings?userId=X`
- Header section: avatar (large circle), seller name/bio, social links
- Grid of seller's listings (same card component as Browse)
- States: loading (skeleton), not found ("This seller doesn't exist"), empty ("No listings yet")

---

## 9. Profile / Dashboard — `apps/web/src/pages/Profile.tsx`

- Route guard: `requireAuth(Profile)`
- **Tabs** using shadcn Tabs component:
  1. **My Listings** — table/grid of user's listings with edit/delete actions. Edit opens the create listing form pre-filled. Delete confirms then removes.
  2. **Edit Storefront** — form to update bio, avatar URL, phone, social links. Calls `PUT /api/storefronts/me`.
  3. **Stats** — total listings, total views (or just listing count for v1)

---

## 10. Navbar update — `apps/web/src/components/Navbar.tsx`

Already has conditional auth rendering from Phase 2. Make sure:
- "Post Listing" button only visible to sellers (already done)
- "Hush" link visible to all
- Avatar dropdown menu with: Profile, My Storefront (sellers only), Sign Out

---

## 11. Dependencies to add

In `apps/web/package.json`, add:
- `@tanstack/react-query` (already there — use it for all API calls)

Use `fetch()` for API calls wrapped in React Query — no axios needed.

---

## Key Implementation Notes

- **All API calls go through React Query** — no raw fetch in components. Create hooks like `useListings(filters)`, `useListing(id)`, `useCreateListing()`, `useStorefront(userId)` etc.
- **Price is stored in kobo** (integer). Display in ₦ by dividing by 100 and formatting with commas. Example: `₦150,000` for `15000000` kobo.
- **Location values**: "University of Lagos", "Obafemi Awolowo University", "University of Nigeria Nsukka", "University of Ibadan", "University of Benin", "Ahmadu Bello University", "University of Calabar", "Lagos State University"
- **Category values** (lowercase, underscore): `housing`, `jobs`, `services`, `food_restaurants`, `electronics`, `fashion`, `events`

## Do NOT

- Do NOT modify the auth provider, auth pages, or middleware (Phase 2 is complete and stable)
- Do NOT implement Hush event features yet (Phase 4)
- Do NOT set up paystack/flutterwave yet
- Do NOT remove `AGENTS.md`, `AGENTS.md`, or the directives from the repo
- Do NOT commit any .env files
