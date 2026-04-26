# Peace — Clothing Brand E-commerce

## Overview

A production-style e-commerce store for a clothing brand called "Peace" with:
- Storefront (home, product detail, checkout, order confirmation, about)
- Admin dashboard (login, stats, orders list, order detail, notifications, product management)
- Manual WhatsApp payment flow
- In-app notifications for new orders and confirmed payments
- Full Arabic RTL UI

## Stack

- **Monorepo**: pnpm workspaces, TypeScript 5.9
- **API framework**: Express 5 (`artifacts/api-server`)
- **Frontend**: React + Vite + Tailwind + shadcn/ui (`artifacts/peace`)
- **Database**: PostgreSQL (Neon, via `DATABASE_URL` secret) + Drizzle ORM (`lib/db`)
- **Validation**: Zod (`lib/api-zod`, generated from OpenAPI)
- **API contract**: OpenAPI in `lib/api-spec/openapi.yaml`
- **Codegen**: Orval (React Query hooks + Zod)

## Business Rules

- Orders are created with `paymentStatus = "Pending"`. Stock is **not** reduced at order creation.
- Stock is reduced **only** when admin confirms payment via `POST /api/admin/orders/:id/confirm-payment`.
- A `NewOrder` notification is created on order placement; a `PaymentReceived` notification on payment confirmation.
- Out-of-stock products still appear in the shop with a "نفذت الكمية" badge.

## Admin

- URL: `/admin/login`
- Username: `admin`
- Password: `admin123`
- Token stored in `localStorage` as `peace_admin_token`.

## Admin API Endpoints (full CRUD for products)

- `GET /api/admin/products` — list all products
- `POST /api/admin/products` — create product (with variants)
- `PUT /api/admin/products/:id` — update name/description/basePrice
- `PUT /api/admin/products/:id/images` — update images array
- `PUT /api/admin/products/:id/toggle` — toggle isActive
- `DELETE /api/admin/products/:id` — delete product
- `POST /api/admin/products/:id/variants` — add variant
- `PUT /api/admin/products/:id/variants/:variantId` — update variant
- `DELETE /api/admin/products/:id/variants/:variantId` — delete variant

## API Server Architecture

The API server (`artifacts/api-server/src/`) follows a layered architecture organized by domain modules:

```
src/
├── modules/
│   ├── orders/             # Public order placement & tracking
│   ├── products/           # Public product catalog
│   ├── notifications/      # Admin notifications
│   ├── settings/           # Public + admin store settings
│   ├── admin/              # Admin auth, orders, payment confirmation, stats
│   └── admin-products/     # Admin product/variant CRUD
├── routes/
│   ├── health.ts           # Liveness probe
│   └── index.ts            # Router aggregator
├── lib/                    # Shared helpers (admin auth, formatters)
├── server.ts / handler.ts  # Express bootstrap (local + Vercel serverless)
└── index.ts                # Entry point
```

Each module follows the same three-layer pattern:
- `<name>.repository.ts` — Drizzle DB queries only, no business logic
- `<name>.service.ts` — Business rules; returns discriminated unions (`{ kind: "ok" | "not_found" | ... }`)
- `<name>.routes.ts` — Express handlers; map service results to HTTP responses
- `index.ts` — Re-exports the router

## Key Commands

- `pnpm run typecheck` — full typecheck
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks/Zod
- `pnpm --filter @workspace/db run push` — push DB schema
- `pnpm --filter @workspace/api-server exec tsx src/seed.ts` — seed products

## Vercel Deployment

- `vercel.json` at root configures the build
- Build command: `pnpm install && PORT=3000 BASE_PATH=/ pnpm --filter @workspace/peace run build`
- Output: `artifacts/peace/dist/public`
- Set `VITE_API_BASE_URL` env var in Vercel to point to the deployed API server
- The API server (`artifacts/api-server`) should be deployed separately (Railway, Render, Fly.io)
- `DATABASE_URL` secret must be set in the API server environment

## Environment

- `DATABASE_URL` — PostgreSQL connection string (Replit secret)
- `VITE_API_BASE_URL` — optional, set in Vercel to point to deployed API server
