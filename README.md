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

The project runs locally with SQLite by default and is now prepared specifically for Replit deployment.

Configure these values as needed:

- `DATABASE_PROVIDER`
- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `SUPPORT_EMAIL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `SMTP_*` values for password reset emails
- `CLOUDINARY_*` values for cloud screenshot storage

Replit notes:

- Keep `DATABASE_PROVIDER` empty unless you want to force a provider.
- When Replit provides a PostgreSQL `DATABASE_URL`, the Prisma setup script automatically switches to the PostgreSQL schema.
- `APP_URL` and `NEXTAUTH_URL` can stay empty because the app now detects `REPLIT_DOMAINS` and `REPLIT_DEV_DOMAIN` automatically.
- If Cloudinary is not configured, screenshot uploads fall back to inline image storage so the app does not depend on filesystem writes.

## Local Setup

```bash
npm install
npm run db:generate
npx prisma db push
npm run dev
```

When you run `npm run dev`, Risktiq starts on `0.0.0.0` and prints local, LAN, and Replit URLs when available.

If you only want to print the LAN link without starting the app:

```bash
npm run dev:share-info
```

## Replit Deployment

For production on Replit, use an Autoscale Deployment or Reserved VM Deployment because this app needs a running Next.js server. Do not publish it as a Static Deployment.

Before publishing:

1. Open the Replit Database tool and attach/create a PostgreSQL database for the app.
2. In Replit Secrets, set:
   - `DATABASE_URL=<your Replit database connection string>` if it is not already injected
   - `NEXTAUTH_SECRET=<strong-random-secret>`
   - Optional: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SMTP_*`, `CLOUDINARY_*`, `SUPPORT_EMAIL`
3. Replit uses `.replit` with:
   - Run command: `npm run dev`
   - Deployment build command: `npm install && npm run build`
   - Deployment run command: `npm run start`
4. Publish the app from Replit using a web server deployment.
5. After the first deploy, run `npm run db:push` against the PostgreSQL database if your schema has not been applied yet.
6. Open `/api/health` on the live `.replit.app` domain and confirm it returns `status: "ok"`.

Important:

- Do not rely on SQLite for live Replit deployment data. Replit documents that published apps should not rely on filesystem writes for persistence.
- If you use Google OAuth, add your live `.replit.app` domain to the Google OAuth allowed redirect URLs.
- If you use SMTP or Cloudinary, set them in Replit Secrets so both the workspace and deployment can read them.

## Validation

```bash
npm run lint
npm run build
```
