# Evolve Wholesale Platform

_Started 2026-06-09 15:38 UTC_

---

## User

I want to build a wholesale website for my bussiness. I want the website design to be clean and modern to have a customer facing and a admin face site. I want to be able to track all my inventory on it and I want the theme to be something white and cream which will be easy for the people to read it. my company name is evolve wireless LLC but I do not want to make that the name of the website maybe something like Evolve wholesale 

I want mockups and something I can hand off to claude code

## Assistant

_[tool: questions_v2]_

I'd love to build this out for you. Before I start designing, let me ask some focused questions so I nail the right direction — getting these right up front prevents a lot of rework.

## User

Questions timed out; go with defaults

## Assistant

_[tool: update_todos]_

Defaults it is. I'll build **Evolve Wholesale** — a clickable, interactive prototype with both a customer-facing storefront and an admin back office, in a clean white & cream theme with a forest-green accent. It'll be structured so it hands off cleanly to Claude Code.

Let me lay out the plan and start building.

_[tool: write_file]_

Starting with the mock data — a realistic wholesale catalog of phones + accessories, plus inventory, orders, and customers.

_[tool: write_file]_

Now the design system — tokens, fonts, base styles. Putting it in a CSS file.

_[tool: write_file]_

Now the icon set + shared UI primitives.

_[tool: write_file]_

Now the customer storefront — header, footer, home, and catalog.

_[tool: write_file]_

Now the catalog, product detail, and cart screens.

_[tool: write_file]_

Now the admin back office — shell, sidebar, and dashboard.

_[tool: write_file]_

Now admin inventory + orders, with interactive drawers.

_[tool: str_replace_edit]_

Now the router, site switcher, cart state, and the HTML entry. First a couple of keyframes the drawer needs.

_[tool: write_file]_

_[tool: write_file]_

Now the HTML entry that wires it all together.Let me check it renders cleanly.

_[tool: show_html]_

_[tool: show_html]_

_[tool: get_webview_logs]_

_[tool: save_screenshot]_

No errors — likely a timing issue with Babel. Let me re-capture.

_[tool: save_screenshot]_

_[tool: save_screenshot]_

_[tool: eval_js]_

_[tool: eval_js]_

The content is there (h1 exists, 123KB rendered) — the screenshot tool just isn't capturing it. Let me verify the hero's actual position.

_[tool: done]_

Everything is rendering correctly in the real DOM — the h1 is visible and positioned right; the screenshot tool (DOM re-render) just struggles with the `backdrop-filter` and pattern backgrounds. The actual browser view is fine. Let me surface it to you.

_[tool: update_todos]_

Now the handoff package for Claude Code — a spec doc Claude Code can build against.

_[tool: write_file]_

_[tool: update_todos]_

_[tool: fork_verifier_agent]_

Done. **Evolve Wholesale** is built and live — flip between the **Customer site** and **Admin** using the toggle in the top ribbon.

**Customer storefront**
- Home with hero, value props, shop-by-category, best sellers, and a volume-pricing band
- Catalog with working filters (category/brand/availability) + sort
- Product detail with tiered pricing, MOQ-aware quantity stepper, add-to-cart
- Cart with live totals, free-freight rule, MOQ warnings, and order submission
- Wholesale account application + a volume-pricing comparison page

**Admin back office**
- Dashboard: KPIs, 12-month revenue chart, stock alerts, recent orders, top products
- Inventory: searchable/filterable table with an "Adjust stock" drawer that updates status live
- Orders: status tabs + an order drawer with a fulfillment timeline
- Customers table with account tiers

Theme is warm white & cream with a forest-green accent, Hanken Grotesk + mono numerals — clean and high-contrast for readability.

**For Claude Code:** `HANDOFF.md` is a full build spec — design tokens, file map, routes, data model, and a prioritized build plan (Next.js + Postgres + auth) so it can take this straight to a real app.

A few things I made default calls on (all easy to change): product images are labeled placeholders, search is UI-only in the prototype, and I used invented brand names (Apexa, Voltcraft, etc.) so nothing's trademarked.

Want me to explore a couple of visual directions for the homepage or catalog side-by-side, add real categories/SKUs you actually carry, or drop in your logo?

