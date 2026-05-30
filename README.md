# PropList — Multi-Tenant Property Listing Platform

A full-stack property listing platform built for the Intern Staff Developer practical exam. Users can browse published listings, save favorites, and contact owners. Property owners manage drafts through a publish workflow. Admins monitor system metrics and disable listings.

## Live URLs

| Service  | URL |
|----------|-----|
| Frontend | [https://solanovatech.vercel.app](https://solanovatech.vercel.app) |
| Backend  | [https://solanova-tech-10.onrender.com/api](https://solanova-tech-10.onrender.com/api) |
| API Docs | [https://solanova-tech-10.onrender.com/api/docs](https://solanova-tech-10.onrender.com/api/docs) (Swagger UI) |

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Backend | **NestJS 10** + TypeScript |
| Frontend | **Next.js 14** (App Router) |
| Database | **MongoDB** (MongoDB Atlas in production) |
| State Management | **TanStack Query v5** + React Context |
| Auth | JWT + role-based guards |
| Images | **Cloudinary** |
| Styling | Tailwind CSS |

---

## Technical Decisions

### Why NestJS?

NestJS provides a structured, modular architecture out of the box — controllers, services, guards, and DTO validation map directly to the exam's RBAC and API requirements. Compared to raw Express, NestJS reduces boilerplate for JWT auth, global validation pipes, and dependency injection. The decorator-based `@Roles()` / `@Public()` pattern makes access control explicit and auditable.

### Why TanStack Query (not Redux/Zustand)?

This app is **server-state heavy** (properties, favorites, admin metrics) with minimal client-only global state (auth session). TanStack Query handles caching, background refetch, optimistic updates, and cross-tab cache invalidation natively — which is exactly what favorites need. Auth uses a lightweight React Context since it's a single user object. Redux would add ceremony without benefit; Zustand would duplicate what Query already solves for API data.

### How is access control enforced?

**Backend (source of truth):**
- Global `JwtAuthGuard` — all routes require JWT unless marked `@Public()`
- Global `RolesGuard` — routes with `@Roles('owner')` etc. check `request.user.role`
- Service-layer checks — e.g. draft properties hidden from non-owners, published properties cannot be edited, status filters restricted to admins

**Frontend (UX layer):**
- `ProtectedRoute` wraps dashboard layouts — redirects unauthenticated users to `/login`
- Role mismatch shows a toast and redirects home
- Public SSR pages (`/properties`) remain accessible; write actions always go through the API where guards enforce permissions

### Hardest technical challenge

**Publish workflow with concurrency safety.** Publishing requires validating all fields + at least one image, then atomically transitioning `draft → published`. MongoDB transactions need a replica set, which many free-tier databases don't provide. The solution uses `findOneAndUpdate({ status: 'draft' })` as an optimistic lock — if two requests race, one gets a `409 Conflict`. This trades multi-document rollback for practical deployability on standalone MongoDB.

### What would break first at scale?

1. **Unindexed property queries** — location regex search and price-range filters on a growing collection would slow down without compound indexes on `(status, deletedAt, location, price)`.
2. **Cloudinary upload throughput** — synchronous image uploads block the request; high traffic would need a queue (S3 pre-signed URLs + background processing).
3. **Admin property listing** — currently paginated but metrics are live counts; at millions of documents, aggregation pipelines would need caching or materialized views.

---

## Features Checklist

### User Roles
- **Admin** — view all properties, disable (archive) any property, system metrics
- **Owner** — create/edit drafts, upload images, publish, soft-delete own properties
- **User** — browse published properties, save favorites, contact owners via email

### Backend
- JWT authentication with role-based access control
- Pagination & filtering (location, price range, status for admins)
- Soft deletes via `deletedAt`
- Transactional publish logic (optimistic locking)
- Environment-based configuration (dev vs prod)
- Swagger API docs at `/api/docs`
- Health check at `/api/health`

### Frontend
- Login / Register pages
- SSR public property listing with filters & pagination
- SSR property detail page
- User, Owner, and Admin dashboards (client-rendered)
- Auth persists across refresh (JWT in localStorage + `/auth/me`)
- Favorites synced across tabs (storage event + React Query invalidation)
- Optimistic favorite toggle
- Protected routes with loading/error states

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account (for image uploads)

### Setup

1. Clone the repository
2. Copy environment variables:
   ```bash
   cp env.example .env
   ```
3. Fill in `DATABASE_URL`, `JWT_SECRET`, and `CLOUDINARY_URL`
4. Install dependencies:
   ```bash
   cd apps/backend && npm install
   cd ../frontend && npm install
   ```
5. Seed an admin user (optional):
   ```bash
   cd apps/backend && npm run seed:admin
   ```
   Default credentials: `admin@proplist.dev` / `Admin1234!`

### Development

Run both apps from the monorepo root:

```bash
# Terminal 1 — Backend (port 5000)
cd apps/backend && npm run dev

# Terminal 2 — Frontend (port 3000)
cd apps/frontend && npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

API docs: [http://localhost:5000/api/docs](http://localhost:5000/api/docs)

---

## API Documentation

- **Swagger UI:** `{BACKEND_URL}/api/docs`
- **Postman guide:** [`apps/backend/API_TESTING.md`](apps/backend/API_TESTING.md)

All API routes are prefixed with `/api`.

---

## Deployment

### Backend (Render)

**Live:** [https://solanova-tech-10.onrender.com/api](https://solanova-tech-10.onrender.com/api)

1. Create a new **Web Service** on Render pointing to this repo
2. Set environment variables:
   - `NODE_ENV=production`
   - `DATABASE_URL` — MongoDB Atlas connection string
   - `JWT_SECRET` — long random string
   - `CLOUDINARY_URL` — Cloudinary credentials
   - `PORT` — Render sets this automatically
3. Build command: `cd apps/backend && npm install && npm run build`
4. Start command: `cd apps/backend && npm run start:prod`
5. Run `npm run seed:admin` once to create the admin user

A `railway.toml` is also included at the repo root for Railway deployments.

### Frontend (Vercel)

**Live:** [https://solanovatech.vercel.app](https://solanovatech.vercel.app)

1. Import the repo and set the **Root Directory** to `apps/frontend` in Vercel project settings
2. Set environment variable:
   - `NEXT_PUBLIC_API_URL=https://solanova-tech-10.onrender.com/api`
3. Deploy — Vercel auto-detects pnpm from `pnpm-lock.yaml` and installs dependencies correctly

### Database (MongoDB Atlas)

1. Create a free M0 cluster
2. Add your deployment IP to the allowlist (or `0.0.0.0/0` for development)
3. Copy the connection string to `DATABASE_URL`

### Images (Cloudinary)

Images are uploaded to Cloudinary (`proplist/properties` folder). Free tier is sufficient for the exam. Alternative: pre-signed S3 URLs would scale better but add infrastructure complexity — Cloudinary was chosen for speed-to-production.

---

## Project Structure

```
├── apps/
│   ├── backend/          NestJS API
│   │   ├── src/
│   │   │   ├── auth/     JWT auth, guards, decorators
│   │   │   ├── properties/
│   │   │   ├── favorites/
│   │   │   ├── admin/    System metrics
│   │   │   ├── upload/   Cloudinary integration
│   │   │   └── health/   Health check
│   │   └── scripts/      Admin seed script
│   └── frontend/         Next.js 14 App Router
│       └── src/
│           ├── app/      Pages (auth, properties, dashboards)
│           ├── components/
│           ├── contexts/ Auth provider
│           └── lib/      Axios client
├── env.example           Environment variable template
└── railway.toml          Railway deployment config
```

---

## License

Built as a practical exam submission. All rights reserved.
