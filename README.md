# Multi-tenant Notes SaaS (Assignment)

## Summary
Simple multi-tenant notes app with JWT auth, tenant isolation (shared-schema), role-based access, subscription gating (Free vs Pro), deployed to Vercel.

## Design
- Tenant strategy: **Shared schema** with `tenantId` on documents.
- Auth: JWT stored client-side. JWT payload: `{ userId, tenantId, role }`.
- Roles: `Admin`, `Member`.
- Free plan: 3 notes max per tenant. Pro plan: unlimited.
- Pre-seeded accounts (password: password):
  - admin@acme.test (Admin, tenant: acme)
  - user@acme.test (Member, tenant: acme)
  - admin@globex.test (Admin, tenant: globex)
  - user@globex.test (Member, tenant: globex)

## Endpoints
- `GET /health` → `{ "status": "ok" }`
- `POST /auth/login` → `{ token, tenant }`
- `POST /tenants/:slug/upgrade` → Admin only
- `POST /tenants/:slug/invite` → Admin only (creates user, password: password)
- Notes:
  - `POST /notes` → Create
  - `GET /notes` → List
  - `GET /notes/:id` → Retrieve
  - `PUT /notes/:id` → Update
  - `DELETE /notes/:id` → Delete

## Run locally
1. `git clone ...` (backend)
2. copy `.env.example` to `.env` and set `MONGODB_URI`, `JWT_SECRET`.
3. `npm install`
4. `node scripts/seed.js` (seeds tenants & users)
5. `npm start`

Frontend:
1. `git clone ...` (frontend)
2. set `NEXT_PUBLIC_API_BASE` to backend URL
3. `npm install`
4. `npm run dev`

## Deployment
- Deploy both repos to Vercel. Set env vars on Vercel dashboard.
