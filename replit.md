# FindIt — Lost & Found Platform

A community-powered Lost & Found web platform where people report lost items or items they've found, helping reunite belongings with their owners.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/lost-and-found run dev` — run the frontend (port assigned by workflow)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, shadcn/ui, wouter routing, TanStack Query
- API: Express 5, OpenAPI-first with Orval codegen
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (v4), drizzle-zod
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- File uploads: multipart/form-data, stored in `artifacts/api-server/uploads/`

## Where things live

- `lib/api-spec/openapi.yaml` — single source of truth for API contracts
- `lib/db/src/schema/items.ts` — items table definition (Drizzle ORM)
- `artifacts/api-server/src/routes/items.ts` — CRUD + stats + resolve endpoints
- `artifacts/api-server/src/routes/upload.ts` — image upload endpoint (POST /api/upload)
- `artifacts/api-server/src/app.ts` — Express app, serves `/api/uploads/` as static
- `artifacts/lost-and-found/src/` — React frontend

## Architecture decisions

- OpenAPI-first: all API contracts live in `openapi.yaml`; never hand-write types the codegen produces
- Image uploads are stored on the server filesystem in `artifacts/api-server/uploads/` and served via `/api/uploads/`
- Integer types use `number` in the OpenAPI spec (not `integer`) because the installed Zod v3 doesn't have `zod.int()` — Orval would generate invalid code with `type: integer`
- Stats and recent endpoints defined as `/items/stats` and `/items/recent` (before `/:id` in router) to avoid param capture

## Product

- Home feed with filter sidebar (type: lost/found, category, color, brand, status)
- Stats bar showing live totals (lost, found, reunited)
- Report form with toggle between "Lost" and "Found", photo upload support
- Item detail page with full info, reporter contact, and "Mark as Resolved" action
- 7 example items seeded on first run

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Use `number` not `integer` for numeric fields in OpenAPI spec (Zod v3 limitation)
- Routes `/items/stats` and `/items/recent` must be declared before `/items/:id` in Express to avoid param capture
- After any OpenAPI spec change, always run codegen: `pnpm --filter @workspace/api-spec run codegen`
- Uploaded files land in `artifacts/api-server/uploads/` — this directory is created at runtime; it's not committed

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
