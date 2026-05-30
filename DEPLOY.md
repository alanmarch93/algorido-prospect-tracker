# Algorido AI Prospect Tracker — Deploy Guide

## 1. Set up Supabase (free)

1. Go to https://supabase.com → New project
2. Note your **Project URL** and **anon public key** (Settings → API)
3. Go to **SQL Editor** → paste everything from `supabase-schema.sql` → Run
4. Go to **Authentication → Users** → Create a new user with your email & password

## 2. Deploy to Vercel (free)

### Option A — GitHub (recommended)
1. Push this folder to a GitHub repo:
   ```
   git init
   git add .
   git commit -m "Initial commit"
   gh repo create algorido-prospect-tracker --public --push
   ```
2. Go to https://vercel.com → New Project → Import your GitHub repo
3. Add Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
4. Click **Deploy** — your app is live in ~60 seconds!

### Option B — Vercel CLI
```bash
npm i -g vercel
vercel
# Follow prompts, add env vars when asked
```

## 3. Log in to your app

- Visit your Vercel URL (e.g. `https://algorido-prospect-tracker.vercel.app`)
- Log in with the email/password you created in Supabase
- Start adding prospects!

## Local development

```bash
cp .env.local.example .env.local
# Fill in your Supabase URL and anon key

npm run dev
# Visit http://localhost:3000
```
