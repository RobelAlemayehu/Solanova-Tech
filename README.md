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


## Features Checklist

### User Roles
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

### Frontend (Vercel)- **Admin** — view all properties, disable (archive) any property, system metrics


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
