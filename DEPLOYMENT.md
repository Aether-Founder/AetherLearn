# Vercel deployment

1. Create a Supabase project and run the migrations in `supabase/migrations` in numeric order, including `027_global_catalog_seed_and_observability.sql`.
2. Copy `.env.example` to `.env.local` for local development. Never commit `.env.local`.
3. In Vercel, import this repository and set Node.js to **20.x**. Vercel uses `npm ci`, then `npm run ci && npm run build`.
4. Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_USER_ID`, `WEBHOOK_SECRET`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `UPSTASH_REDIS_REST_URL`, and `UPSTASH_REDIS_REST_TOKEN` in Vercel Project Settings.
5. Create an Upstash Redis database. The app applies 100 requests/minute generally, 10/minute to admin authentication, and 5/hour to AI routes when credentials are configured.
6. Create a Sentry Next.js project and copy its DSN values. Error boundaries report rendering failures and `/api/errors` writes a privacy-safe record to Supabase when the service-role key is configured.
7. Deploy, then check `https://your-domain/api/health`. It should return `{ "success": true, "status": "ok" }`.

## Local check

Run `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build`. Use `npm run dev` for localhost. The catalog seed is global; personal study sets and achievement unlocks remain private under Supabase RLS.
