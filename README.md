# Risktiq

Premium trading journal web application built with Next.js, Prisma, NextAuth, chart analytics, report exports, and private per-user workspaces.

## Stack

- Next.js 14 + TypeScript
- Prisma ORM
- NextAuth credentials + Google OAuth
- Self-contained SQLite database by default
- Tailwind CSS
- Recharts
- PDF + Excel report export
- Cloudinary-ready screenshot uploads with local fallback

## Features

- Email/password signup and login
- Google login
- Email verification before credential login
- Forgot password and secure reset flow
- Secure logout
- Private user data isolation
- Trader profile onboarding
- Trade entry with screenshot upload
- Auto P&L and risk-reward calculation
- Win/loss detection
- Overtrading, revenge trading, and emotional-trading detection
- Dashboard analytics, heatmap, habit tracking, and AI-style coaching insights
- Daily reflections and goals
- Weekly and monthly reports with PDF/Excel download
- Light and dark mode

## Environment

The project now runs locally without requiring PostgreSQL. The checked-in `.env` defaults to SQLite.

If you want custom credentials or external services, configure:

- `DATABASE_PROVIDER`
- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `SUPPORT_EMAIL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `SMTP_*` values for password reset emails
- `CLOUDINARY_*` values for cloud screenshot storage

If Cloudinary is not configured, screenshot uploads fall back to inline image storage so the app still works on Vercel without filesystem writes.

## Local Setup

```bash
npm install
npm run db:generate
npx prisma db push
npm run dev
```

## Vercel Deployment

For production on Vercel, do not deploy with SQLite as your live database. SQLite is fine for local development, but Vercel needs a hosted database for persistent user accounts and trade data.

Use this setup:

1. Create a hosted PostgreSQL database such as Neon, Supabase, or Vercel Postgres.
2. In Vercel environment variables, set:
   - `DATABASE_PROVIDER=postgresql`
   - `DATABASE_URL=<your-hosted-postgres-connection-string>`
   - `NEXTAUTH_SECRET=<strong-random-secret>`
   - `NEXTAUTH_URL=https://your-domain.vercel.app`
   - `APP_URL=https://your-domain.vercel.app`
   - `SUPPORT_EMAIL=<your-support-inbox>`
   - Optional: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SMTP_*`, `CLOUDINARY_*`
3. Deploy normally to Vercel. The build now auto-selects the Prisma schema for SQLite or PostgreSQL based on `DATABASE_PROVIDER`.
4. After the first deployment, run a database sync against your hosted database before opening signup to users.
5. After deployment, open `/api/health` on your live domain. It should return `status: "ok"` if the database and server runtime are working correctly.

Recommended production services:

- PostgreSQL: Neon or Vercel Postgres
- Email: SMTP provider such as Brevo, Resend SMTP, or Gmail SMTP
- Screenshots: Cloudinary for persistent image storage

## Validation

```bash
npm run lint
npm run build
```
