# PropList — Technical Decision Document
 
**Project:** Mini Multi-Tenant Property Listing Platform
**Candidate Role:** Intern Staff Developer (Hybrid)
**Submitted by:** [Your Name]
 
---
 
## 1. Why NestJS?
 
NestJS was chosen over raw Express for three concrete reasons:
 
**Structure maps directly to the exam's requirements.** The exam asks for RBAC, JWT auth, DTO validation, and modular features (properties, favorites, admin). NestJS provides all of these as first-class concepts — controllers, guards, interceptors, and pipes — rather than requiring manual wiring. This reduces boilerplate and keeps the codebase auditable.
 
**Access control is declarative, not scattered.** The `@Roles()` and `@Public()` decorators make it immediately clear, at the route level, who can access what. With Express, this logic tends to drift into middleware chains that are harder to trace.
 
**TypeScript is a first-class citizen.** Combined with `class-validator` and `class-transformer`, request payloads are validated and typed automatically via DTOs. This catches invalid input at the boundary before it reaches service logic.
 
Express would have been acceptable but would have required manually assembling these patterns — adding time without adding learning value for a 7-day exam.
 
---
 
## 2. State Management: TanStack Query + React Context
 
**TanStack Query v5** was chosen over Redux Toolkit and Zustand for the following reasons:
 
The application is **server-state heavy**. Properties, favorites, admin metrics, and user data all originate from the API and need caching, background refetching, and invalidation. TanStack Query handles this natively. Implementing equivalent behavior in Redux would require `createAsyncThunk`, slice reducers, and manual cache invalidation — significant ceremony for no additional benefit.
 
**Favorites synced across tabs** was a specific exam requirement. TanStack Query's cache invalidation on `storage` events handles this cleanly without custom pub/sub logic.
 
**Optimistic UI** (favorite toggle) is a built-in pattern in TanStack Query via `onMutate` / `onError` rollback. This would require manual state patching in Redux or Zustand.
 
**React Context** handles authentication state only — a single user object that rarely changes and does not need the full cache management that Query provides. Mixing Query and a lightweight context avoids over-engineering the auth layer.
 
**Zustand** was considered but ruled out because it would duplicate what Query already solves for API data, without providing cross-tab sync out of the box.
 
---
 
## 3. How Access Control is Enforced
 
Access control is enforced at two layers. The backend is the source of truth; the frontend is a UX convenience only.
 
**Backend:**
 
- A global `JwtAuthGuard` protects all routes. Routes that should be public (e.g. browsing published listings) are explicitly marked with a `@Public()` decorator.
- A global `RolesGuard` checks `request.user.role` against the `@Roles()` decorator on each route. If the role does not match, a `403 Forbidden` is returned.
- Service-level checks enforce business rules that guards alone cannot: draft properties are hidden from non-owners; published properties reject edit attempts; status filters in queries are restricted based on role (e.g. regular users cannot query `draft` or `archived` listings).
**Frontend:**
 
- A `ProtectedRoute` wrapper redirects unauthenticated users to `/login` before rendering any dashboard layout.
- Role mismatches show an error toast and redirect to the home page.
- Auth state persists across refresh using a JWT stored in `localStorage` combined with a `/auth/me` call on mount to rehydrate the session.
- Public SSR pages (`/properties`, `/properties/[id]`) remain accessible without auth. Any write action (publish, favorite, contact) routes through the API, where guards enforce permissions regardless of what the frontend allows.
The key principle: the frontend never trusts itself to enforce permissions. It only improves UX for legitimate users.
 
---
 
## 4. Hardest Technical Challenge
 
**Publish workflow with concurrency safety on a free-tier MongoDB.**
 
Publishing a property requires: validating all required fields, ensuring at least one image is present, and atomically transitioning the status from `draft` to `published` so that two simultaneous publish requests cannot both succeed.
 
MongoDB transactions require a replica set. Free-tier MongoDB Atlas clusters (M0) do not provide transactions in the same way as paid tiers, making multi-document atomic operations unreliable in that environment.
 
The solution was to use `findOneAndUpdate({ _id, status: 'draft' })` as an optimistic lock. If two requests race, only one will find a document with `status: 'draft'`; the second receives a `null` result and returns a `409 Conflict`. This trades full multi-document rollback capability for practical deployability on a free-tier database — an acceptable trade-off for the scope of this exam.
 
---
 
## 5. What Would Break First at Scale?
 
In order of expected failure:
 
1. **Unindexed queries.** Location uses a regex search; price uses a range filter; both are combined with `status` and `deletedAt` checks on every listing page load. Without compound indexes on `(status, deletedAt, location, price)`, query performance degrades linearly as the property collection grows. This is the most immediate scaling risk.
2. **Synchronous Cloudinary uploads.** Images are uploaded inline with the request — the HTTP response waits for Cloudinary to confirm storage. Under high concurrency, this blocks request threads and increases response times. The fix is pre-signed upload URLs (S3 or Cloudinary direct upload) with background confirmation webhooks.
3. **Live admin metrics.** The admin dashboard runs aggregation pipelines on every page load to count properties by status, active users, and recent activity. At millions of documents, these pipelines would need to be cached (Redis TTL) or replaced with materialized views updated on write.
4. **Single Render instance.** The backend is deployed on a single Render free-tier instance with no horizontal scaling. A traffic spike would exhaust memory or CPU with no failover. Moving to a containerised deployment (Railway, Fly.io, or ECS) with auto-scaling would address this.
---
 
*Document version: 1.0 — submitted alongside GitHub repository and live deployment URLs.*