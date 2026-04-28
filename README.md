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

When you run `npm run dev`, Risktiq now starts on `0.0.0.0` and prints a LAN share link like `http://192.168.x.x:3000` so other devices on the same Wi-Fi can open it.

If you only want to print the LAN link without starting the app:

```bash
npm run dev:share-info
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

## Netlify Deployment

Netlify fully supports the Next.js App Router through its maintained adapter, and this project is now guarded so build-time page generation does not try to write to Prisma before runtime.

Use this setup on Netlify:

1. Create a hosted PostgreSQL database such as Neon or Supabase.
2. In Netlify site environment variables, add:
   - `DATABASE_PROVIDER=postgresql`
   - `DATABASE_URL=<your-hosted-postgres-connection-string>`
   - `NEXTAUTH_SECRET=<strong-random-secret>`
   - `NEXTAUTH_URL=https://your-site.netlify.app`
   - `APP_URL=https://your-site.netlify.app`
   - `SUPPORT_EMAIL=qaimation@gmail.com`
   - Optional: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SMTP_*`, `CLOUDINARY_*`
3. Redeploy the site after saving environment variables.
4. Run your database sync against the hosted database before using signup in production.
5. Open `/api/health` after deploy and confirm it returns `status: "ok"`.

Important:

- Do not rely on SQLite for live Netlify production data.
- Set database secrets in the Netlify UI. Netlify documents that variables declared only in `netlify.toml` are not available to Functions at runtime.

## Validation

```bash
npm run lint
npm run build
```
