
Backend README
---------------
API endpoints include:
- GET /api/admin/merchants  -> list merchants (pagination)
- POST /api/admin/merchant/:id/approve -> approve merchant
- POST /api/admin/merchant/:id/reject  -> reject merchant
- GET /api/admin/orders -> list orders (includes product info)

Run seed to populate merchants and products:
  cd backend
  npm install
  npx prisma migrate dev --name init
  node prisma/seed.js
  npm start


Admin credentials (demo)
-----------------------
- email: admin@tks.com
- password: Admin123!

Postgres (Docker) quick start
-----------------------------
- docker compose -f ../docker-compose.postgres.yml up --build
- Then run prisma migrations with DATABASE_URL set to postgres connection.
