# notes-saas-backend

Shared-schema multi-tenant notes backend.

See .env.example. Set MONGODB_URI and JWT_SECRET.

Endpoints:
- GET /health
- POST /auth/login
- POST /tenants/:slug/upgrade
- POST /tenants/:slug/invite
- Notes CRUD at /notes

Seed:
npm install
copy .env.example to .env
node scripts/seed.js