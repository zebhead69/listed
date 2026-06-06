# Listed. — One snap. Four listings.

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to vercel.com → New Project → Import your repo
3. Add environment variables (copy from .env.example)
4. Deploy

## Local dev

```bash
npm install
cp .env.example .env.local
# Fill in your keys
npm run dev
```

## Run DB migration

Paste `supabase/migrations/001_enhancement_jobs.sql` into Supabase SQL editor.

## Environment variables

See `.env.example` for the full list.
