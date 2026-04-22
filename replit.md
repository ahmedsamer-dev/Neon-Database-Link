# Peace — Clothing Brand E-commerce

## Overview

A production-style e-commerce store for a clothing brand called "Peace" with:
- Storefront (home, product detail, checkout, order confirmation)
- Admin dashboard (login, stats, orders list, order detail, notifications)
- Manual WhatsApp payment flow
- In-app notifications for new orders and confirmed payments

## Stack

- **Monorepo**: pnpm workspaces, TypeScript 5.9
- **API framework**: Express 5 (`artifacts/api-server`)
- **Frontend**: React + Vite + Tailwind + shadcn/ui (`artifacts/peace`)
- **Database**: PostgreSQL (Replit-managed) + Drizzle ORM (`lib/db`)
- **Validation**: Zod (`lib/api-zod`, generated from OpenAPI)
- **API contract**: OpenAPI in `lib/api-spec/openapi.yaml`
- **Codegen**: Orval (React Query hooks + Zod)

## Business Rules

- Orders are created with `paymentStatus = "Pending"`. Stock is **not** reduced at order creation.
- Stock is reduced **only** when admin confirms payment via `POST /api/admin/orders/:id/confirm-payment`.
- A `NewOrder` notification is created on order placement; a `PaymentReceived` notification is created on payment confirmation.

## Admin

- URL: `/admin/login`
- Username: `admin`
- Password: `admin123`
- Token stored in `localStorage` as `peace_admin_token`.

## Key Commands

- `pnpm run typecheck` — full typecheck
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks/Zod
- `pnpm --filter @workspace/db run push` — push DB schema
- `pnpm --filter @workspace/api-server exec tsx src/seed.ts` — seed products
