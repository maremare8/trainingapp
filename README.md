# Tabata Timer

A mobile-first, installable (PWA) interval/Tabata timer. Create workouts with
timed or rep-based exercises, add rest between them, loop rounds, and run them
with voice cues. Data is stored durably in Supabase and syncs across devices.

## Tech stack

- **Next.js (App Router) + TypeScript**
- **shadcn/ui + Tailwind CSS** (mobile-first)
- **Supabase** — Postgres + passwordless (magic-link) auth, Row Level Security
- **PWA** — installable to the iOS/Android home screen, runs saved workouts offline
- Deployed free on **Vercel**

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project (free)

1. Sign up at https://supabase.com and create a new project.
2. In the SQL editor, run the contents of [`supabase/schema.sql`](supabase/schema.sql)
   to create the tables and Row Level Security policies.
3. In **Authentication → Providers → Email**, make sure "Email" is enabled and
   that magic links are allowed (the default).
4. In **Authentication → URL Configuration**, add your dev and production URLs to
   the redirect allow-list:
   - `http://localhost:3000/auth/confirm`
   - `https://<your-vercel-app>.vercel.app/auth/confirm`

### 3. Configure environment variables

Copy the example file and fill in the values from **Project Settings → API**:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ey...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> The anon key is safe to expose in the browser. RLS protects the data.

### 4. Run the dev server

```bash
npm run dev
```

Open http://localhost:3000. Without Supabase configured the app still boots, but
auth and data won't work until the env vars are set.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — lint

## Project structure

```
src/
  app/
    (app)/              Authenticated shell (bottom nav): workouts, history, settings
    login/              Magic-link sign in
    auth/confirm/       Magic-link redirect handler
  components/
    layout/             App shell pieces (bottom nav, page header)
    pwa/                Service worker registration
    ui/                 shadcn/ui components
  lib/supabase/         Browser + server Supabase clients, session proxy helper
  types/                Domain types (mirror supabase/schema.sql)
supabase/schema.sql     Database schema + RLS (run in Supabase)
public/
  manifest.webmanifest  PWA manifest
  sw.js                 Service worker
  icons/                App icons
```

## Deploying

Push to GitHub and import the repo on https://vercel.com. Add the three
environment variables in the Vercel project settings, set `NEXT_PUBLIC_SITE_URL`
to your Vercel URL, and deploy.
