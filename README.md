# Company App

Multi-tenant business management app built with Next.js (App Router), Prisma, and PostgreSQL.

## Local Development

1. Install dependencies:
	npm install
2. Configure environment variables:
	cp .env.example .env
3. Run database migrations (if needed):
	npx prisma migrate deploy
4. Start the app:
	npm run dev

## Required Environment Variables

Set these in your local `.env` and in Vercel Project Settings -> Environment Variables:

- DATABASE_URL
- JWT_SECRET
- PAYMENT_SECRET

Use `.env.example` as the template.

## Deploy to Vercel

1. Push this repository to GitHub.
2. In Vercel, click New Project and import the repository.
3. In Project Settings -> Environment Variables, add:
	- DATABASE_URL
	- JWT_SECRET
	- PAYMENT_SECRET
4. In Project Settings -> Build & Development Settings, set Build Command to:
	npm run vercel-build
5. Keep the default Output Directory (do not set a custom one).
6. Deploy.

The `vercel-build` script runs Prisma client generation, applies migrations, and then builds Next.js.

## Notes

- This project uses PostgreSQL through Prisma, so your database must be publicly reachable from Vercel.
- If you use a managed Postgres provider, ensure SSL is enabled in DATABASE_URL.