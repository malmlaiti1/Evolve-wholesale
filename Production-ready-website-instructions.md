# Evolve Wholesale — Production Build Plan

## Context

Musa wants a production-ready wholesale website for his phone business (Evolve Wireless LLC). The site has two sides: a **public customer storefront** (no auth) where local retailers browse used phone inventory and place local delivery orders, and a **Clerk-protected admin back office** for managing inventory, orders, and IMEI checking. This is a **brand new standalone project** at `/Users/musa.almlaiti/evolve-wholesale/`, completely separate from the PDF Cloak site.

A design prototype exists at `/tmp/design-handoff/evolve-wireless-wholesale/` — we reference its layout patterns, design tokens (cream + forest green), and component structures but adapt everything for the used phone wholesale use case.

---

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                   Next.js App Router                  │
│  ┌─────────────────┐    ┌──────────────────────────┐ │
│  │  (customer)/     │    │  (admin)/admin/          │ │
│  │  Public catalog  │    │  Clerk-protected         │ │
│  │  Cart + Checkout │    │  Inventory/Orders/IMEI   │ │
│  │  NO AUTH         │    │  Dashboard               │ │
│  └────────┬─────────┘    └────────┬─────────────────┘ │
│           │                       │                    │
│  ┌────────┴───────────────────────┴─────────────────┐ │
│  │              API Route Handlers                   │ │
│  │  /api/devices  /api/orders  /api/devices/imei-*   │ │
│  └────────┬──────────┬────────────┬─────────────────┘ │
│  ┌────────┴──┐ ┌─────┴────┐ ┌────┴────────────┐      │
│  │ Supabase  │ │  Resend  │ │ IMEI APIs       │      │
│  │ Postgres  │ │  Email   │ │ ImeiDB.xyz      │      │
│  │ + RLS     │ │          │ │ IMEI.org        │      │
│  └───────────┘ └──────────┘ └─────────────────┘      │
└──────────────────────────────────────────────────────┘
```

**Stack:** Next.js (App Router) + React 19 + TypeScript + Tailwind v4 (CSS-first) + shadcn/ui + Supabase (Postgres + RLS) + Clerk (admin auth, >=v5.7.6) + Resend (transactional email) + html5-qrcode (barcode scanner) + TanStack Table + nuqs (URL-synced filters) + zustand (cart) + Zod (validation) + @upstash/ratelimit (rate limiting)

**Key principles:**
- Customer side is public (no auth). Admin side requires Clerk.
- All IMEI API calls proxy through server-side route handlers to protect keys.
- All order creation goes through the API route (service role key) — anon key CANNOT write to orders/order_items.
- Checkout uses an atomic Postgres RPC function with `FOR UPDATE` row locking to prevent double-buy race conditions.
- All server-only modules use `import 'server-only'` guard to prevent accidental client bundling.

---

## Design System

Adapted from the prototype's warm cream + forest green theme. Mapped to shadcn/ui CSS variables in `globals.css`:

| Prototype | Production Variable | Value | Usage |
|-----------|-------------------|-------|-------|
| `--paper` | `--card` | `#FFFFFF` | Card surfaces |
| `--cream` | `--background` | `#FAF6EE` | Page background |
| `--cream-2` | `--secondary` | `#F5EEE1` | Tinted fills |
| `--ink` | `--foreground` | `#211E18` | Primary text |
| `--ink-2-solid` | `--muted-foreground` | `#6B6557` | Secondary text |
| `--accent` | `--primary` | `#1F4D3A` | Buttons, links |
| `--ok/warn/danger` | `--success/warning/destructive` | `#2C6B4F/#9C6A1E/#9E3B2C` | Status colors |

**Fonts:** Hanken Grotesk (UI, `--font-sans`) + JetBrains Mono (prices/IMEI/SKUs, `--font-mono`).
**Radii:** 7/11/16/22px. **Shadows:** Warm soft (`rgba(60,50,30,...)`). **No dark mode.**

---

## Database Schema

Three tables with RLS: devices (public read, admin write), orders (admin-only read/write via service role), order_items (admin-only read/write via service role).

**devices:** `id(uuid)`, `imei(unique)`, `brand`, `model`, `storage`, `color`, `carrier`, `grade(A+..C)`, `battery_health(0-100)`, `price`, `stock(>=0)`, `is_local(bool)`, `condition_notes`, timestamps

**orders:** `id(uuid)`, `order_number(EW-10001 auto-generated via sequence)`, `customer_name/email/phone/address`, `payment_method(cash|card)`, `status(pending→approved→on_the_way→delivered | pending→denied)`, `total`, `denial_reason`, `email_sent_at(nullable timestamptz)`, timestamps

**order_items:** `id(uuid)`, `order_id(FK CASCADE)`, `device_id(FK RESTRICT)`, `quantity`, `unit_price`

**CRITICAL SECURITY: No anon INSERT on orders/order_items.** All order creation goes through `POST /api/orders` using the service role key. This prevents clients from writing arbitrary prices/totals directly to the database via the Supabase anon key. RLS policies:
- `devices`: SELECT for everyone, ALL for service_role only
- `orders`: ALL for service_role only (no anon access)
- `order_items`: ALL for service_role only (no anon access)

**CRITICAL: Atomic checkout via Postgres RPC function `create_order()`:**
- Uses `SELECT ... FOR UPDATE` row-level locks on devices to prevent double-buy race conditions
- Validates stock availability, calculates total from current DB prices (never trusts client)
- Creates order + order_items + decrements stock in a single atomic transaction
- Called via `supabase.rpc('create_order', {...})` from the API route

Full SQL migration with indexes, triggers, RLS policies, and the `create_order` RPC function in `supabase/migrations/001_initial_schema.sql`.

---

## Project Structure

```
evolve-wholesale/
├── middleware.ts                     # Clerk: protect /admin/*
├── app/
│   ├── globals.css                  # Tailwind v4 + design tokens
│   ├── layout.tsx                   # ClerkProvider + fonts + Toaster
│   ├── (customer)/                  # Public storefront (no auth)
│   │   ├── layout.tsx               # Header + Footer
│   │   ├── page.tsx                 # Homepage = inventory catalog (ISR revalidate=60)
│   │   ├── devices/[id]/page.tsx    # Device detail (ISR revalidate=60)
│   │   ├── cart/page.tsx            # Cart (validates stock freshness on load)
│   │   ├── checkout/page.tsx        # Checkout form
│   │   ├── order-confirmation/page.tsx
│   │   └── orders/page.tsx          # Order lookup (order# + email → status)
│   ├── (admin)/admin/               # Clerk-protected admin
│   │   ├── layout.tsx               # Sidebar + Header shell
│   │   ├── page.tsx                 # Dashboard
│   │   ├── inventory/page.tsx       # Inventory table + CRUD
│   │   ├── orders/page.tsx          # Order management
│   │   ├── customers/page.tsx       # Customer search
│   │   ├── imei-checker/page.tsx    # IMEI blacklist checker
│   │   ├── settings/page.tsx        # Config stubs
│   │   ├── sign-in/[[...sign-in]]/page.tsx   # Clerk sign-in
│   │   └── sign-up/[[...sign-up]]/page.tsx   # Clerk sign-up
│   └── api/
│       ├── devices/route.ts         # GET (public) + POST (admin)
│       ├── devices/[id]/route.ts    # PATCH + DELETE (admin)
│       ├── devices/imei-lookup/route.ts  # Proxy ImeiDB.xyz
│       ├── devices/imei-check/route.ts   # Proxy IMEI.org
│       ├── orders/route.ts          # GET (admin) + POST (checkout via RPC)
│       ├── orders/[id]/status/route.ts   # PATCH status + email
│       ├── orders/lookup/route.ts   # POST: public order lookup (order# + email)
│       ├── devices/validate-cart/route.ts  # POST: validate cart stock/prices
│       └── health/route.ts          # GET: health check (pings Supabase)
├── components/
│   ├── ui/                          # shadcn/ui (button, badge, card, etc.)
│   ├── shared/                      # logo, stock-badge, grade-badge, etc.
│   ├── customer/                    # header, footer, device-card, filter-sidebar, cart, checkout
│   └── admin/                       # sidebar, header, device-table, order-table, drawers, scanner
├── lib/
│   ├── utils.ts                     # cn() helper
│   ├── env.ts                       # Zod env validation (runs at startup)
│   ├── rate-limit.ts                # @upstash/ratelimit helpers
│   ├── supabase/client.ts           # Browser client (anon key)
│   ├── supabase/server.ts           # Server client (service role + 'server-only' guard)
│   ├── supabase/types.ts            # TypeScript types from schema
│   ├── clerk/auth.ts                # requireAdmin() helper
│   ├── email/resend.ts              # Resend client + sendOrderEmail()
│   ├── email/templates/*.tsx        # 5 React Email templates
│   ├── imei/imeidb.ts               # ImeiDB.xyz client (typed errors)
│   ├── imei/imei-org.ts             # IMEI.org client (typed errors)
│   ├── validators/{device,order,checkout}.ts  # Zod schemas
│   └── constants.ts                 # Grades, statuses, brands
├── hooks/
│   ├── use-cart.ts                  # zustand + localStorage
│   └── use-debounce.ts
└── supabase/
    ├── migrations/001_initial_schema.sql
    └── seed.sql                     # Demo devices + orders
```

---

## Build Phases

### Phase 1: Scaffold + Design System + Database (~28 files)
1. `npx create-next-app@latest evolve-wholesale` (TS, Tailwind, App Router)
2. Install deps: `@supabase/supabase-js @clerk/nextjs resend react-email @tanstack/react-table nuqs zustand zod lucide-react html5-qrcode sonner @upstash/ratelimit @upstash/redis`
3. `npx shadcn@latest init` + add: button, badge, card, input, select, table, dialog, sheet, checkbox, dropdown-menu, separator, skeleton, label, textarea, slider, tabs
4. `globals.css` — full design token system mapped from prototype
5. `layout.tsx` — fonts (Hanken Grotesk + JetBrains Mono), ClerkProvider, Toaster
6. `middleware.ts` — Clerk protecting `/admin(.*)` (except `/admin/sign-in`, `/admin/sign-up`)
7. `lib/env.ts` — Zod schema validating ALL env vars at import time. Catches misconfiguration at build, not at first request.
8. `lib/supabase/client.ts` — browser client (anon key, public reads only)
9. `lib/supabase/server.ts` — server client (service role). **Must include `import 'server-only'`** to prevent accidental client bundling of the service role key.
10. `lib/supabase/types.ts` — TypeScript types matching schema
11. `lib/rate-limit.ts` — @upstash/ratelimit helper. Rate limits: `POST /api/orders` = 5 per IP per 10 min, IMEI endpoints = 30 per min.
12. `supabase/migrations/001_initial_schema.sql` — full schema + RLS + `create_order()` RPC function with `FOR UPDATE` locking. **No anon INSERT on orders/order_items.**
13. `supabase/seed.sql` — 15-20 real phone models (iPhone 14 Pro, Galaxy S23, etc.)
14. `next.config.ts` — security headers: CSP, HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy
15. `app/(admin)/admin/sign-in/[[...sign-in]]/page.tsx` — Clerk SignIn component
16. `app/(admin)/admin/sign-up/[[...sign-up]]/page.tsx` — Clerk SignUp component
17. Shared components: `logo`, `stock-badge`, `grade-badge`, `device-image-placeholder`, `money`, `empty-state`
18. `lib/constants.ts`, `lib/utils.ts`, `lib/validators/device.ts`
19. `app/api/health/route.ts` — pings Supabase `SELECT 1`, returns `{status: 'ok'|'error'}`
20. `.env.local` template, `CLAUDE.md`

**Verify:** `npm run dev` boots, `/` shows placeholder, `/admin` redirects to Clerk sign-in, `/api/health` returns ok.

### Phase 2: Admin Inventory CRUD (~12 files)
1. `app/(admin)/admin/layout.tsx` — sidebar + header shell
2. `admin-sidebar.tsx` — nav: Dashboard, Inventory, Orders, Customers, IMEI Checker, Settings. Low-stock badge count. User avatar from Clerk.
3. `admin-header.tsx` — title, search, notification bell, action buttons
4. `app/(admin)/admin/inventory/page.tsx` — stat tiles + device table
5. `device-table.tsx` + `device-table-columns.tsx` — TanStack Table with URL-synced filters via nuqs, search, category dropdown, status tabs (All/Available/Low/Out)
6. `add-device-drawer.tsx` — Sheet with form: IMEI + Scan button (stubbed), Brand, Model, Storage, Color, Carrier, Grade dropdown, Battery Health, Price, Stock, "List locally" checkbox, Condition notes. Zod validation.
7. `edit-device-drawer.tsx` — pre-populated edit form + delete with confirmation
8. `app/api/devices/route.ts` — GET (public, filtered) + POST (admin, validated)
9. `app/api/devices/[id]/route.ts` — PATCH + DELETE (admin only)
10. `lib/clerk/auth.ts` — `requireAdmin()` helper

**Stock thresholds:** 0 = Out of stock (danger), 1-10 = Low (warning), >10 = In stock (ok). Rows colored by status.

### Phase 3: Customer Catalog + Cart + Checkout (~20 files)
1. `app/(customer)/layout.tsx` + `customer-header.tsx` + `customer-footer.tsx`
2. `app/(customer)/page.tsx` — **Homepage = catalog** (NO landing page). URL-synced filters via nuqs. ISR `revalidate=60`. **Only shows `is_local = true` devices.**
3. `brand-quick-select.tsx` — pill buttons: All, iPhone, Samsung, Google, etc. (dynamic from DB distinct brands)
4. `filter-sidebar.tsx` — Brand checkboxes, Grade checkboxes, Price range, Availability. On mobile: collapses to bottom sheet.
5. `device-card.tsx` + `device-grid.tsx` + `sort-select.tsx`. Pagination: 24 items/page, server-side limit clamped to max 50.
6. `app/(customer)/devices/[id]/page.tsx` — detail page (IMEI hidden from customers). ISR `revalidate=60`.
7. `hooks/use-cart.ts` — zustand with localStorage persistence. Each item has `addedAt` timestamp. Items older than 7 days auto-removed.
8. `app/api/devices/validate-cart/route.ts` — POST accepts `[{deviceId, quantity}]`, returns current stock/price/availability for each. Called when cart page loads.
9. `app/(customer)/cart/page.tsx` + `cart-item.tsx` + `cart-summary.tsx` — On mount, calls validate-cart API. Shows inline warnings for out-of-stock or price-changed items.
10. `app/(customer)/checkout/page.tsx` + `checkout-form.tsx` — name, phone, email, address, payment (cash active, card grayed out). Rate limited: 5 orders per IP per 10 min.
11. `app/api/orders/route.ts` POST — calls `supabase.rpc('create_order', {...})` for atomic checkout with row locking. **Detects price changes**: if any item's current DB price differs from client-submitted price, returns `{ priceChanged: true, items: [...] }` instead of creating the order. Client shows "prices have changed" message.
12. `app/(customer)/order-confirmation/page.tsx`
13. `app/(customer)/orders/page.tsx` — Order lookup: enter order# + email → see status. Rate limited.
14. `app/api/orders/lookup/route.ts` — POST, rate limited, returns order status if order# + email match.

**Key security:**
- Cart is client-side only (zustand). API recalculates totals from DB prices via atomic Postgres RPC.
- Rate limiting via @upstash/ratelimit on `POST /api/orders` and `/api/orders/lookup`.
- Price change detection before order creation.
- Stock validated atomically with `FOR UPDATE` row locks — no double-buy.

### Phase 4: Order Management + Email (~14 files)
1. `app/(admin)/admin/orders/page.tsx` + `order-status-tabs.tsx`
2. `order-table.tsx` + `order-table-columns.tsx` — searchable, filterable
3. `order-detail-drawer.tsx` — customer info, items, total, timeline, action buttons
4. `order-status-timeline.tsx` — visual step timeline (placed → approved → on the way → delivered)
5. `status-change-buttons.tsx` — context-aware: pending→approve/deny, approved→on the way, etc.
6. `app/api/orders/[id]/status/route.ts` — validates legal transitions, updates status, sends email
7. `lib/email/resend.ts` + 5 templates: `order-received.tsx`, `order-approved.tsx`, `order-on-the-way.tsx`, `order-delivered.tsx`, `order-denied.tsx`
8. `app/(admin)/admin/customers/page.tsx` — search orders by email/phone

**Status machine:** `pending→approved|denied`, `approved→on_the_way`, `on_the_way→delivered`. Terminal: delivered, denied. Invalid transitions return 400.

**Email handling:**
- If Resend fails, status update still succeeds (don't block the order). Set `email_sent_at = NULL` on failure.
- Order detail drawer shows yellow "Email not sent" badge when `email_sent_at IS NULL` but status has changed. Includes a "Resend notification" button.
- From address: `"Evolve Wholesale <orders@evolvewholesale.com>"` (display name included).
- Email preview during dev: `"email:dev": "email dev --dir lib/email/templates"` in package.json scripts.

**Admin notification for new orders:** Admin layout polls `GET /api/orders/count?status=pending` every 30 seconds. Notification bell shows pending order count. (Supabase Realtime upgrade in v2.)

### Phase 5: IMEI Scanning + Blacklist (~7 files)
1. `imei-scanner-dialog.tsx` — html5-qrcode camera view for Code 128/Code 39 barcodes
2. `imei-scanner-button.tsx` — camera icon button in add-device form
3. `app/api/devices/imei-lookup/route.ts` — proxy ImeiDB.xyz (free metadata auto-fill)
4. `app/api/devices/imei-check/route.ts` — proxy IMEI.org (paid GSMA blacklist, ~$0.05/check)
5. `lib/imei/imeidb.ts` + `lib/imei/imei-org.ts` — API clients
6. `app/(admin)/admin/imei-checker/page.tsx` — standalone checker tool: input/scan IMEI → see device info + blacklist status
7. Update `add-device-drawer.tsx` — IMEI scan → auto-fill brand/model/storage/color

**IMEI validation:** 15 digits + Luhn check before any API call. Camera scanner uses rear camera (`facingMode: "environment"`).

### Phase 6: Dashboard (~6 files)
1. `app/(admin)/admin/page.tsx` — dashboard layout
2. `kpi-card.tsx` + `dashboard-stats.tsx` — 4 KPIs: inventory value, devices listed, orders today, monthly revenue
3. `revenue-chart.tsx` — CSS bar chart (12 months)
4. `low-stock-alerts.tsx` — devices with stock <= 10
5. `recent-orders-table.tsx` — last 5 orders

### Phase 7: Polish + Deploy (~12+ files)
1. **Customer mobile responsive:** filter sidebar → bottom sheet/dropdown, grid 3→2→1 col, hamburger menu, checkout full-width
2. **Admin mobile responsive:** sidebar collapses to hamburger menu on < 768px. IMEI Scanner dialog goes full-screen on mobile. At minimum, the scanning + add device flow must work on a phone.
3. Loading states (`loading.tsx` + Skeleton components per route). Distinguish "no devices found" vs "database error."
4. Error boundaries (`error.tsx` per route) with user-friendly messages + retry buttons
5. SEO: metadata, OG images, sitemap, robots. Device detail pages get dynamic metadata.
6. Animations: page fade-in (`screenIn` from prototype), drawer slide-in, card hover lift, button press
7. Toast notifications (sonner) for all user actions — styled to match prototype (dark bg, cream text, green check)
8. Camera permission UX: clear message when denied, guide to re-enable, graceful fallback to manual entry
9. **Deployment checklist:**
   - All env vars set in Vercel
   - Supabase project created, migrations run, seed data loaded
   - Clerk app configured, admin user(s) created
   - **Resend domain verified** (DNS: DKIM CNAME + SPF TXT + return-path MX for evolvewholesale.com)
   - IMEI API keys active
   - Upstash Redis for rate limiting (or use Vercel KV)
   - Test full flow end-to-end
   - Lighthouse audit: 90+ on customer pages

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=         # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=    # Supabase anon key (public reads only)
SUPABASE_SERVICE_ROLE_KEY=        # Supabase service role (admin writes, NEVER expose to client)

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY= # Clerk public key
CLERK_SECRET_KEY=                  # Clerk secret key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/admin/sign-in
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/admin

# Resend
RESEND_API_KEY=                    # Resend email API key
RESEND_FROM_EMAIL="Evolve Wholesale <orders@evolvewholesale.com>"

# IMEI APIs
IMEIDB_API_KEY=                    # ImeiDB.xyz API key (free)
IMEI_ORG_API_KEY=                  # IMEI.org API key (paid, ~$0.05/query)

# Rate Limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL=           # Upstash Redis URL
UPSTASH_REDIS_REST_TOKEN=         # Upstash Redis token

# App
NEXT_PUBLIC_APP_URL=https://evolvewholesale.com
```

All env vars validated at startup via `lib/env.ts` (Zod). Missing vars = build failure, not runtime crash.

---

## Verification

After each phase:
- `npm run dev` — no errors
- `npm run build` — clean production build
- `npm run lint` + `npm run typecheck` — zero issues

End-to-end tests (after all phases):

**Happy path:**
1. Customer: browse catalog → filter by iPhone → click device → add to cart → checkout with cash → see confirmation → check order status via lookup page
2. Admin: sign in → add device (scan IMEI → auto-fill → set grade/price) → see it in catalog
3. Admin: check IMEI blacklist status → see clean/blacklisted result
4. Admin: approve order → customer gets email → mark on the way → email → mark delivered → email
5. Admin: dashboard shows correct KPIs and recent orders
6. Mobile: catalog filters work, cart/checkout usable on phone, IMEI scanner works on mobile

**Security tests:**
7. Attempt to POST directly to Supabase orders table with anon key → should be DENIED by RLS
8. Two browsers: both add last-in-stock device to cart, both submit checkout simultaneously → only one succeeds, other gets "out of stock" error
9. Submit checkout with manipulated prices in request body → API recalculates from DB, ignores client prices
10. Rapid-fire POST /api/orders → rate limiter kicks in after 5 requests
11. Visit /admin without Clerk auth → redirected to sign-in
12. Device with `is_local = false` → does NOT appear in customer catalog

**Error handling:**
13. Disconnect Supabase → customer catalog shows friendly error, `/api/health` returns error
14. ImeiDB.xyz API key removed → add-device auto-fill fails gracefully with toast, manual entry works
15. Resend API down → order status update succeeds, "Email not sent" badge appears in order drawer

---

## Future (v2)
- Real device images (Supabase Storage upload in add-device drawer + next/image)
- Bulk CSV import for devices
- Stripe credit card payments (replace grayed-out card option)
- Supabase Realtime for live stock updates + instant new-order notifications (replace polling)
- SMS notifications (Twilio) alongside email
- Delivery radius enforcement (geocode addresses, reject out-of-area)
- Audit log for all admin actions (device edits, stock changes, order status)
- Print shipping labels from order detail
- Device soft-delete / archiving (instead of hard delete)
- Email retry queue for failed notifications
- Revenue analytics with Recharts
