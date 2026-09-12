# Podium

GCSE/A-Level maths tutoring: an AI chat tutor, AI-marked homework ("snap and mark"), per-topic
lessons, and a tutor dashboard. Built with Next.js (App Router) and Supabase.

This is a working platform shell — navigation, screens, layout, and Supabase auth are real. The
AI chat replies and homework marking are currently mocked with static data; wiring those up to a
real model is a separate next step (not included here).

## Stack
- Next.js 14 (App Router, TypeScript)
- Supabase (auth + Postgres). `@supabase/ssr` for cookie-based sessions across server/client.
- Plain CSS (`app/globals.css`) — design tokens from the Industry design system, no Tailwind.
- Deploy target: Vercel.

## Getting started

1. Install dependencies:
   ```
   npm install
   ```
2. Create a Supabase project at https://supabase.com, then copy `.env.local.example` to
   `.env.local` and fill in your project URL and anon key (Project Settings → API).
3. Run the schema: open the Supabase SQL editor and run `supabase/schema.sql`. This creates
   `profiles`, `topics`, `lessons`, `chat_sessions`/`chat_messages`, `homework_submissions`, etc.,
   with row-level security policies (students see only their own data; tutors see only their
   assigned students').
4. Run the dev server:
   ```
   npm run dev
   ```
   Visit http://localhost:3000.

## Auth flow
`/login` handles both sign-up and log-in against Supabase Auth (email/password). On sign-up, a
trigger you'll want to add (or a server action) should also insert a row into `profiles` with the
`full_name`/`level` passed in `options.data` — this starter passes that metadata but does not yet
create the profile row automatically. `middleware.ts` protects `/dashboard`, `/lesson`, `/chat`,
`/homework`, `/progress`, `/tutor` — unauthenticated visitors are redirected to `/login`.

Tutor vs. student is not yet split at the auth/routing level (both roles currently land on the
same protected routes based on which link they click) — `profiles.role` is in the schema and ready
to gate this once you build tutor sign-up.

## What's mocked vs. real
- **Real:** Supabase auth (sign up / log in / session), route protection, full page layouts and
  navigation, all styling.
- **Mocked (static arrays in each page component):** subject mastery, chat history, homework
  history, tutor's student list and activity feed. Replace these with Supabase queries — the
  schema in `supabase/schema.sql` matches the shape of the mocked data 1:1, so swapping a static
  array for a `supabase.from('...').select()` call should be mechanical per page.
- **Not implemented:** the actual AI chat model call and the actual AI homework-marking pipeline
  (image upload to Storage + a vision-capable model call). The UI and state machine for both flows
  are built and ready to receive real responses.

## Deploying to Vercel
1. Push this repo to GitHub.
2. Import it in Vercel, set the two `NEXT_PUBLIC_SUPABASE_*` environment variables in the
   project's settings.
3. Deploy. `middleware.ts` and the Supabase SSR client work out of the box on Vercel's edge/node
   runtimes.

## Project structure
```
app/
  page.tsx              landing page
  login/page.tsx        sign up / log in
  (app)/layout.tsx       student app shell (sidebar)
  (app)/dashboard/       student dashboard
  (app)/lesson/          lesson (video + notes + AI chat)
  (app)/chat/            AI tutor chat
  (app)/homework/        snap-and-mark homework flow
  (app)/progress/        progress/history
  tutor/layout.tsx       tutor app shell
  tutor/page.tsx         tutor dashboard
  globals.css            design tokens + component styles
components/
  Sidebar.tsx, Blueprint.tsx, icons.tsx
lib/supabase/            browser + server Supabase clients
middleware.ts            session refresh + route protection
supabase/schema.sql       database schema + RLS policies
```
