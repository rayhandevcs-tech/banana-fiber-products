# Sprint 0 — Project Audit & Implementation Plan

**Project:** Banana Fiber Products — mobile-first bilingual (বাংলা / English) e-commerce platform
**Date:** 2026-09-11
**Status:** Audit complete — awaiting approval before implementation

---

## A. Current Architecture

**There is none. This repository is empty.**

Verified findings:

| Check | Result |
|---|---|
| Tracked files | `README.md` only (23 bytes, one heading) |
| Commits | 1 (`e2a1207 Initial commit`) |
| `main` vs working branch | Identical — no hidden work anywhere |
| Framework | None |
| `package.json` / lockfile | None |
| Frontend | None |
| Backend | None |
| Database / migrations / schema | None |
| Routes, components, API layer | None |
| Authentication | None |
| Styling system | None |
| State management | None |
| Dependencies | None |
| Env configuration (`.env*`, `.env.example`) | None |
| CI (`.github/`), Docker, linting, tests | None |

**Environment available:** Node v22.22.2, npm 10.9.7, pnpm 10.33.0, yarn 1.22.22, Python 3.11.15.
npm registry (`registry.npmjs.org`) is reachable from this environment.

### Consequences of a greenfield start

- **Nothing to reuse** — the instruction "do not rewrite working code" is trivially satisfied; there is no working code.
- **Nothing to preserve** — no legacy constraints, no migration risk, no compatibility debt.
- **Every architectural decision is still open** — which makes the stack decision in Section C the single highest-leverage choice in the entire project. Once Sprint 1 lands, changing it costs the whole build.

---

## B. Problems Found

Because there is no code, "problems" here means **risks in the specification** that will cause rework if not resolved before Sprint 1.

### B1. Reference images were never received (blocking for visual fidelity)
The brief repeatedly cites "the attached banana-fiber product images" as the visual reference for photography style, colours, textures, and brand mood. **No images arrived in this session.** Without them the design system will be built from the written palette and adjectives alone. This is workable, but the resulting look is an interpretation, not a match. Images should be supplied before Sprint 1 (design system) and are essential before Sprint 2 (homepage hero).

### B2. SEO requirements conflict with a client-rendered SPA
Section 28 asks for per-product titles, meta descriptions, Open Graph metadata, and Product structured data. A plain Vite/React SPA renders all of this after JavaScript executes. Social crawlers (Facebook, WhatsApp — the dominant sharing channels in Bangladesh) do **not** run JavaScript, so shared product links would show no preview at all. This is a genuine architectural conflict, not a detail; it drives the recommendation in Section C.

### B3. Performance targets conflict with a large client bundle
Section 27 targets low-end Android on slow connections and the stated priority order puts mobile experience second overall. An SPA must ship, parse, and execute the router, i18n catalogues, state layer, and every page component before the first product is visible. Server-rendered HTML with selective hydration is materially faster on exactly the devices that matter here.

### B4. Customer authentication is under-specified
The header spec lists an **Account** item and Section 13 requires customers to track order progress, but checkout collects only **Name + Phone** with no password, no email, and no account step. These cannot all be true simultaneously. Three coherent readings exist (guest-only + phone/order-ID lookup; OTP accounts; password accounts) and they produce materially different work in Sprint 8. See Open Decisions.

### B5. Bengali typography will break layouts if treated as a translation pass
Bengali strings run 20–40% longer than their English equivalents and Noto Sans Bengali needs ~1.7 line-height where Inter needs ~1.5. Deferring i18n to Sprint 7 means every button, card, table header, and admin label built in Sprints 1–6 gets laid out against short English strings and then breaks. **Mitigation:** build the i18n *plumbing* in Sprint 1 and author every string as a translation key from the first component onward; Sprint 7 then becomes "complete and audit the catalogues", not "retrofit bilingualism". This is a deliberate, and I think necessary, adjustment to the proposed sprint order.

### B6. Money must not be stored as floating point
Bangladeshi Taka amounts, discounts, and delivery charges accumulate rounding errors as `float`. All monetary values should be stored as **integers in poisha** (1 ৳ = 100 poisha) or as SQL `DECIMAL`. Deciding this after orders exist means a data migration.

### B7. Mobile payment gateways are not drop-in
bKash, Nagad, and Rocket each require merchant onboarding, sandbox credentials, and (for bKash Checkout) a server-side token grant flow. None can be truly integrated without merchant accounts. Sprint 13 should therefore build a **provider-abstracted payment layer** with Cash on Delivery fully live and a manual-verification path (customer submits the bKash/Nagad transaction ID, admin confirms) as the shipping default — with real gateway drivers slotting in behind the same interface once credentials exist. This keeps the platform launchable.

### B8. Admin operated by non-technical users implies a stricter auth model than "protect the routes"
Section 29 asks for authenticated admin routes; Section 23 says operators may have limited technical experience. Those combine into practical requirements the brief does not state: sessions that do not expire mid-task, password reset that does not depend on email the operator may not have, and destructive actions that are soft-deletes rather than hard deletes so a mis-tap is recoverable. Worth building in from the start.

### B9. Image pipeline is unspecified but load-bearing
Product photography is called "very important" and the platform targets slow connections. Uploading a 4 MB phone photo and serving it unprocessed would dominate page weight. An upload path that stores originals and serves resized, modern-format (AVIF/WebP), responsive variants is required — this is a decision, not an implementation detail.

### B10. No definition of done for "delivery charges configurable from admin"
Section 13 requires admin-editable delivery pricing with no code changes, and gives two different models as examples (zone-based: Inside/Outside Dhaka; method-based: Home Delivery/Pickup). These need to compose, not compete — a delivery **method** and a delivery **zone** are separate axes, and the price is a function of both. Modelling only one axis now means rework later.

---

## C. Recommended Architecture

### C1. Stack recommendation: Next.js (App Router) full-stack

**Recommended:**

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router), TypeScript, React 19 |
| Rendering | Server Components by default; Client Components only where interactivity requires |
| Styling | Tailwind CSS v4 with design tokens as CSS custom properties |
| Database | PostgreSQL + Prisma ORM |
| Auth | Auth.js (NextAuth) credentials provider, or `iron-session` — admin sessions, HTTP-only cookies |
| Validation | Zod schemas shared verbatim between client and server |
| i18n | `next-intl` — locale-prefixed routes (`/bn/...`, `/en/...`), instant switch, persisted |
| Images | `next/image` + Cloudinary (or Supabase Storage) — responsive AVIF/WebP variants |
| Cart state | Zustand + `localStorage` persistence |
| Server state | React Server Components + Server Actions; TanStack Query only in admin where needed |

**Why this, given the stated priorities:**

1. **It solves B2 and B3 together.** Server-rendered HTML means product pages arrive with title, meta description, OG tags, and JSON-LD already in the markup — WhatsApp and Facebook previews work, Google indexes properly, and the first product image paints before most of the JavaScript has loaded. On a low-end Android over 3G this is the difference between a usable shop and an abandoned one. No amount of SPA optimisation reaches parity here.
2. **`next/image` is the B9 answer for free** — responsive `srcset`, modern formats, lazy loading, and no layout shift, without building a pipeline.
3. **One codebase, one deploy.** A rural business does not want two services, two hosts, and a CORS configuration to maintain. Route Handlers and Server Actions provide the API layer without a second process.
4. **The clean backend layering the brief asks for is fully preserved** — see the folder structure in Section D. Routes, controllers, services, models, middleware, and validation all exist as real directories; they simply live inside one deployable.

**The honest trade-off:** the brief's Section 30 sketches React + Vite + a separate Express backend, and that is a perfectly legitimate architecture. It is also the one that makes Section 28 (SEO) and Section 27 (low-end performance) hardest to deliver. Since the repository is empty, there is no existing Vite setup to respect — so the "reuse what exists" principle does not favour it here.

**Alternative if you prefer the brief's original shape:** Vite + React + React Router SPA, Express + TypeScript API, same Postgres/Prisma. Add `vite-plugin-ssr`/prerendering for product pages to partially address SEO. Choose this if the team already knows Express well, or if deployment must be a plain Node VPS rather than a serverless host. I will build it this way without objection if you prefer — the decision is yours, and the sprint plan below is stack-agnostic in structure.

### C2. Data model (core tables)

```
User            id, phone (unique), name, role (CUSTOMER|ADMIN|STAFF),
                passwordHash?, isActive, createdAt
Category        id, slug, nameEn, nameBn, descriptionEn, descriptionBn,
                image, sortOrder, isActive
Product         id, slug, sku (unique), categoryId, nameEn, nameBn,
                descEn, descBn, materialsEn, materialsBn, careEn, careBn,
                dimensions, weightGrams, pricePoisha, discountPoisha,
                stock, lowStockThreshold, isFeatured, isActive, deletedAt
ProductImage    id, productId, url, altEn, altBn, sortOrder
StockMovement   id, productId, delta, reason (SALE|RESTOCK|ADJUSTMENT|RETURN|DAMAGE),
                note, userId, createdAt          ← append-only audit trail
Order           id, orderNumber (human-readable, e.g. BF-2026-00142),
                customerName, customerPhone, districtId, upazila, area, address,
                deliveryMethodId, deliveryZoneId, deliveryChargePoisha,
                subtotalPoisha, discountPoisha, totalPoisha,
                status, paymentMethod, paymentStatus, note, createdAt
OrderItem       id, orderId, productId, nameEnSnapshot, nameBnSnapshot,
                unitPricePoisha, quantity, lineTotalPoisha   ← price snapshot at order time
Payment         id, orderId, method (COD|BKASH|NAGAD|ROCKET|CARD),
                status (PENDING|PAID|FAILED|CANCELLED|REFUNDED),
                amountPoisha, transactionId, verifiedBy, verifiedAt, rawPayload
DeliveryMethod  id, nameEn, nameBn, isActive, sortOrder        ← Home Delivery / Pickup
DeliveryZone    id, nameEn, nameBn, isActive, sortOrder        ← Inside Dhaka / Outside Dhaka
DeliveryRate    id, methodId, zoneId, chargePoisha, freeAboveP ← the (method × zone) price grid
District        id, nameEn, nameBn, zoneId                     ← seeded, 64 districts
Setting         key, value (JSON)                              ← store name, contact, social, flags
ContactMessage  id, name, phone, message, isRead, createdAt
```

Notes on deliberate choices:
- **`pricePoisha` as integer** resolves B6 — no floats touch money anywhere.
- **`OrderItem` snapshots name and price** so historical orders stay correct when a product is renamed, repriced, or deleted.
- **`StockMovement` is append-only** — `Product.stock` is the running total, every change has a row explaining who changed it and why. This is what makes "Track stock changes" (Section 14) real rather than cosmetic, and it lets an operator's mistake be understood after the fact.
- **`deletedAt` soft-delete on Product** addresses B8 — a mis-tapped delete is recoverable and does not orphan order history.
- **`DeliveryRate` as a method × zone grid** resolves B10 — both axes are modelled, admin edits the grid, no code changes.

### C3. Bilingual architecture

- Locale-prefixed routes: `/bn/products/kolar-achar-basket`, `/en/products/banana-fiber-basket`.
- Every UI string lives in `messages/en.json` / `messages/bn.json` — **no hardcoded user-facing text, in customer UI or admin UI, from the first component onward** (mitigates B5).
- Content strings (product name, description, category) are bilingual **columns on the row**, not a translation file — the admin types both.
- Bengali is the **default** locale. The audience is Bangladeshi; English is the alternate.
- Locale persists in a cookie and is honoured server-side on first render, so a Bengali user never sees an English flash.
- `<html lang>` set correctly per locale for screen readers (Section 21).

### C4. Security posture

- All secrets server-side only; no `NEXT_PUBLIC_*` key ever holds a credential.
- `.env.example` committed with placeholder values; real `.env` git-ignored from commit one.
- Admin routes gated by middleware **and** re-checked in every mutating server action — never by UI-hiding alone.
- Zod validation on every input, server-side, regardless of client validation.
- Bangladeshi phone validation: `^(?:\+?88)?01[3-9]\d{8}$`.
- Rate limiting on login and order placement.
- Passwords hashed with bcrypt (cost 12); admin sessions long-lived with sliding renewal (B8).

---

## D. Recommended Folder Structure

```
banana-fiber-products/
├── docs/
│   └── SPRINT-0-AUDIT.md
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts                     # districts, categories, demo products, admin user
├── messages/
│   ├── en.json
│   └── bn.json
├── public/
│   └── images/
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── (shop)/             # customer-facing
│   │   │   │   ├── page.tsx                     # homepage
│   │   │   │   ├── shop/page.tsx
│   │   │   │   ├── categories/[slug]/page.tsx
│   │   │   │   ├── products/[slug]/page.tsx
│   │   │   │   ├── cart/page.tsx
│   │   │   │   ├── checkout/page.tsx
│   │   │   │   ├── orders/[orderNumber]/page.tsx
│   │   │   │   ├── about|how-its-made|contact/page.tsx
│   │   │   │   └── layout.tsx                   # Header + Footer + MobileNav
│   │   │   ├── admin/
│   │   │   │   ├── page.tsx                     # dashboard
│   │   │   │   ├── products/ categories/ inventory/
│   │   │   │   ├── orders/ customers/ payments/
│   │   │   │   ├── delivery/ messages/ reports/ settings/
│   │   │   │   └── layout.tsx                   # AdminSidebar + AdminHeader
│   │   │   └── login/page.tsx
│   │   ├── api/                    # Route Handlers (webhooks, uploads, health)
│   │   ├── sitemap.ts  robots.ts  opengraph-image.tsx
│   │   └── globals.css             # design tokens
│   ├── components/
│   │   ├── ui/                     # design system — Button, Input, Select, Textarea,
│   │   │                           #   Checkbox, Radio, Badge, Tag, Card, Modal, Drawer,
│   │   │                           #   Toast, Alert, EmptyState, LoadingState, Skeleton,
│   │   │                           #   Pagination, Breadcrumb, ConfirmDialog,
│   │   │                           #   QuantitySelector, PriceDisplay, StatusBadge
│   │   ├── layout/                 # Header, Footer, MobileNav, LanguageSwitcher, SearchBar
│   │   ├── product/                # ProductCard, ProductGrid, ProductGallery, ProductInfo
│   │   ├── cart/                    # CartItem, CartSummary, CartDrawer, EmptyCart
│   │   ├── checkout/               # CheckoutForm, AddressForm, DeliverySelector, PaymentSelector
│   │   ├── home/                   # Hero, FeaturedCategories, WhyChooseUs, HowItsMade, …
│   │   └── admin/                  # AdminSidebar, AdminHeader, StatCard, ProductForm,
│   │                               #   InventoryCard, OrderCard, StockAdjuster, DataList
│   ├── server/
│   │   ├── actions/                # Server Actions — the "controllers"
│   │   ├── services/               # business logic: orders, inventory, pricing, payments
│   │   │   └── payments/           # provider interface + cod/bkash/nagad/rocket drivers
│   │   ├── repositories/           # Prisma data access
│   │   ├── auth/                   # session, guards, password hashing
│   │   └── middleware/
│   ├── lib/
│   │   ├── validation/             # Zod schemas shared client + server
│   │   ├── i18n/                   # next-intl config, locale detection
│   │   ├── format/                 # ৳ currency, Bengali numerals, dates
│   │   └── utils/
│   ├── store/                      # Zustand cart store
│   ├── hooks/
│   ├── types/
│   └── config/                     # design tokens (TS), order statuses, constants
├── .env.example
├── middleware.ts                   # locale routing + admin auth gate
├── tailwind.config.ts
└── package.json
```

Principle: `components/ui` never imports from `server/`; `server/services` never imports React. Pages compose, services decide, repositories persist.

---

## E. Sprint Roadmap

Your proposed order is sound. I recommend **two adjustments**, both to prevent rework:

1. **i18n plumbing moves into Sprint 1** (catalogues completed in Sprint 7). Reason: B5 — retrofitting bilingual text into six sprints of components means re-laying-out every screen.
2. **Auth + database foundation moves before the admin sprints** (it already does at Sprint 8) — but the Prisma schema and seed data land in Sprint 1, because Sprints 3–6 need real product data to build against, and mock data thrown away later is wasted work.

| Sprint | Scope | Key deliverable |
|---|---|---|
| **0** | Audit & architecture | This document · **awaiting approval** |
| **1** | Design system + global layout + i18n plumbing + DB schema/seed | Tokens, ~25 UI components, Header/Footer/MobileNav, LanguageSwitcher, Prisma schema, seeded demo data |
| **2** | Homepage | All 10 sections, responsive, real content |
| **3** | Shop, categories, search, filters, sorting | Product grid 2/3/4 cols, mobile filter drawer, pagination |
| **4** | Product details | Gallery, info, specs, quantity, Add to Cart / Buy Now, JSON-LD |
| **5** | Cart | Cart page + drawer, quantity editing, summary, empty state |
| **6** | Checkout + delivery | 5-step flow, district/upazila, delivery method × zone pricing, order placement |
| **7** | Bilingual completion | Full bn/en catalogues, Bengali typography audit, long-string layout QA |
| **8** | Authentication | Admin login, sessions, route guards, customer order lookup |
| **9** | Admin dashboard | Stats, recent orders, low stock, quick actions — mobile-first |
| **10** | Product & category CRUD | Grouped form, multi-image upload with preview, soft delete + confirm |
| **11** | Warehouse & inventory | Stock dashboard, `[−] 12 [+]` mobile stock updater, movement history, low-stock alerts |
| **12** | Order management | Order list/cards, filters, detail view, status transitions |
| **13** | Payment + delivery config | Provider-abstracted payment layer, COD live, manual bKash/Nagad/Rocket verification, admin-editable delivery rate grid |
| **14** | Customers + reports | Customer list, sales/orders/top-products/inventory reports |
| **15** | Mobile hardening, performance, security | 320→1440 sweep, Lighthouse, bundle budget, security review |
| **16** | Final QA + production polish | Four-persona walkthrough, a11y audit, deploy readiness |

Each sprint ends with: run the app, fix errors, responsive QA, report files created/modified — and **stop**.

---

## F. Dependencies

**To add (Sprint 1):**

| Package | Purpose |
|---|---|
| `next` · `react` · `react-dom` · `typescript` | Framework |
| `tailwindcss` · `@tailwindcss/postcss` | Styling |
| `next-intl` | i18n with locale routing |
| `@prisma/client` · `prisma` | Database |
| `zod` | Shared validation |
| `zustand` | Cart state |
| `lucide-react` | Icons (tree-shakeable, ~1 KB per icon used) |
| `clsx` · `tailwind-merge` | Class composition |
| `bcryptjs` | Password hashing (Sprint 8) |
| `next-auth` *or* `iron-session` | Sessions (Sprint 8) |
| `sonner` | Toasts (small; or hand-rolled if bundle budget is tight) |
| `eslint` · `prettier` · `prettier-plugin-tailwindcss` | Tooling |

Fonts: **Inter** (Latin) + **Noto Sans Bengali** via `next/font/google`, self-hosted at build time, subset — no render-blocking external request.

**Deliberately NOT adding** (Section 27 — "do not load huge libraries for simple features"):
- No component library (MUI / Chakra / Ant) — we are building a bespoke design system; these add 100 KB+ and fight the brand.
- No `moment` / `date-fns` initially — `Intl.DateTimeFormat` is built in and handles Bengali locales.
- No `axios` — `fetch` is native.
- No Redux — Zustand covers cart; server state lives on the server.
- No animation library (Framer Motion ~40 KB) — CSS transitions cover the subtle animation brief.
- No chart library until Sprint 14, and then the lightest option that works.

**To remove:** nothing — there are no dependencies.

---

## G. Risks & Recommendations

| # | Risk | Impact | Mitigation |
|---|---|---|---|
| R1 | Reference images never supplied | Brand look is an interpretation, not a match | **Send the images before Sprint 1.** If unavailable, I will build to the written palette and we adjust at Sprint 2. |
| R2 | Stack chosen wrong, discovered at Sprint 10 | Catastrophic — full rebuild | Decide now, in this approval step. This is why Section C leads with it. |
| R3 | Bengali text overflows components built against English | Layout breakage across every screen | i18n keys from Sprint 1; every component QA'd with the longest Bengali string, not the English one |
| R4 | bKash/Nagad/Rocket credentials unavailable at Sprint 13 | Payment sprint blocked | Provider abstraction + COD live + manual transaction-ID verification ships a working store regardless |
| R5 | Product photography unavailable at launch | Shop looks unfinished | Agree an image sourcing plan by Sprint 3; enforce one aspect ratio so substitutions are drop-in |
| R6 | Admin complexity creeps past rural-operator usability | Primary stated failure mode | Every admin screen validated against "can this be done one-handed on a phone in under 30 seconds?" Bengali-first labels, plain words, confirm dialogs on every destructive action |
| R7 | Money stored as float | Silent accumulating errors in real orders | Integer poisha from the schema's first migration |
| R8 | Hosting/deploy target unknown | Sprint 15–16 surprises | Confirm target (Vercel vs VPS) — it constrains image handling and the DB choice |
| R9 | Scope is very large for sequential sprints | Fatigue, half-finished areas | Strict one-sprint-at-a-time, each ending in a runnable, QA'd state — as you specified |

### Open decisions I need from you

1. **Stack** — Next.js full-stack (recommended) vs Vite SPA + Express API (the brief's original sketch).
2. **Database** — PostgreSQL + Prisma (recommended) vs Supabase (Postgres + storage + auth managed) vs MongoDB + Mongoose.
3. **Image hosting** — Cloudinary (the brief mentions Cloudinary secrets) vs Supabase Storage vs local filesystem.
4. **Customer accounts** — guest checkout + phone/order-number tracking (simplest, recommended) vs OTP login vs password accounts. This resolves B4.

---

**Sprint 0 is complete. No application code has been written. Awaiting approval to begin Sprint 1.**
