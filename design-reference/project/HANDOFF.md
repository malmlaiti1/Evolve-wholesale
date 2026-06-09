# Evolve Wholesale — Build Spec & Claude Code Handoff

> Wholesale storefront + admin back office for **Evolve Wireless LLC**, marketed as **Evolve Wholesale**.
> This repo contains a clickable HTML/React prototype. Use it as the source of truth for layout, copy, and behavior.

---

## 1. What this is

A two-sided B2B web app:

- **Customer storefront** — retailers/repair shops/resellers browse a wholesale catalog, see tiered volume pricing + live stock, build a bulk order, and apply for a wholesale account.
- **Admin back office** — the Evolve team tracks inventory, manages orders, and views customers + sales analytics.

The prototype fakes both behind a top "mode switch" ribbon. **In production these are two separate surfaces** (public storefront + authenticated admin), not a toggle.

---

## 2. Design system (already implemented in `app/styles.css`)

**Theme:** warm white & cream, forest-green accent. All tokens are CSS variables in `:root`.

| Token | Value | Use |
|---|---|---|
| `--paper` | `#FFFFFF` | cards, primary surfaces |
| `--cream` | `#FAF6EE` | app background, hero |
| `--cream-2` / `--cream-deep` | `#F5EEE1` / `#EFE6D6` | tinted fills |
| `--ink` | `#211E18` | primary text |
| `--ink-2-solid` | `#6B6557` | secondary text |
| `--ink-3` | `#9A9282` | faint/meta text |
| `--line` / `--line-2` | `#EAE2D3` / `#E0D6C4` | borders |
| `--accent` | `#1F4D3A` | buttons, links, highlights |
| `--accent-soft` | `#E7EFE9` | accent tint backgrounds |
| semantic | `--ok` `--warn` `--danger` (+ `-soft`) | stock + order status |

**Type:** `Hanken Grotesk` (UI), `JetBrains Mono` (numbers, SKUs, prices — class `.mono`, tabular).
**Radii:** 7 / 11 / 16 / 22px. **Shadows:** warm, soft (`--sh-sm` → `--sh-lg`).

---

## 3. Tech in the prototype

- React 18 (UMD) + Babel standalone, inline JSX. **Migrate to a real build** (Next.js / Vite + React) for production.
- No backend — all data is mocked in `app/data.js` (`window.DATA`).
- State is in-memory React (`app/main.jsx`): router, cart, toast.

### File map
| File | Contains |
|---|---|
| `app/data.js` | mock catalog, orders, customers, KPIs |
| `app/styles.css` | design tokens + base CSS |
| `app/ui.jsx` | icons, Logo, Btn, Badge, ImgPH, money helpers, Sparkbars |
| `app/customer.jsx` | CustHeader, CustFooter, HomeScreen, ProductCard |
| `app/customer-detail.jsx` | CatalogScreen, ProductScreen, CartScreen, ApplyScreen |
| `app/admin.jsx` | AdminShell, Kpi, DashboardScreen |
| `app/admin-screens.jsx` | InventoryScreen, OrdersScreen, CustomersScreen, Drawer |
| `app/main.jsx` | App router, cart logic, mode switch, PricingScreen, SettingsScreen |

---

## 4. Screens & routes

### Customer (`/`)
- `home` — hero, value props, categories, best sellers, volume-pricing band
- `catalog` — filter sidebar (category/brand/availability), sort, product grid
- `product/:id` — gallery, tiered pricing table, qty stepper w/ MOQ, add to cart, related
- `cart` — line items, qty edit, MOQ warnings, freight rule (free > $5,000), submit order
- `apply` — wholesale account application form
- `deals` — volume pricing comparison table

### Admin (`/admin`)
- `dashboard` — KPI cards, 12-mo revenue chart, stock alerts, recent orders, top products
- `inventory` — stat tiles, search/filter, table, **Adjust stock drawer** (edits update status live)
- `orders` — status tabs, table, **order drawer** with fulfillment timeline
- `customers` — accounts table with tiers + lifetime spend
- `settings` — configuration menu (stub)

---

## 5. Data model (build your DB/API around these)

**Product**: `id, name, brand, category, sku, msrp, price, tiers[{min, price}], moq, stock, status(in|low|out), tag, color, desc`
**Order**: `id, customer, contact, date, items, units, total, status, channel`
**Customer**: `id, name, tier(Platinum|Gold|Silver), since, orders, spend, status`

Stock status is derived: `0 → out`, `≤100 → low`, else `in` (see `statusOf` in `app/admin-screens.jsx`). Make the threshold configurable per-SKU in production.

---

## 6. Build priorities for Claude Code

1. **Scaffold** Next.js (App Router) + Postgres (Prisma) + auth (storefront accounts vs. admin roles).
2. **Port the design tokens** from `styles.css` into your styling layer (CSS vars or Tailwind theme) verbatim.
3. **Models & API**: Product, Inventory, Order, Customer, PricingTier. CRUD + auth guards on admin.
4. **Storefront**: catalog w/ real filtering/search, tiered pricing engine, cart → order submission, account application → admin review queue.
5. **Admin**: inventory adjustments (audit-logged), order fulfillment state machine, dashboard analytics from real data.
6. **Replace `ImgPH` placeholders** with a real image pipeline (product photos, CDN).

### Notes / decisions still open
- Payment + Net-30 invoicing integration (Stripe? manual?) — not built.
- Auth provider for wholesale buyers vs. staff — not chosen.
- Real product imagery — all placeholders today.
- Search is UI-only in the prototype.

Keep all copy, layout proportions, and the white/cream + forest-green system intact — they're approved.
