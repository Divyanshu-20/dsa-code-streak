# CodeStreak

CodeStreak is a mobile-first accountability app for small private DSA groups. An owner posts one daily problem, members solve it on the original platform, mark completion, and see shared consistency without chat noise.

## Included prototype

- Email/password authentication with persistent Supabase sessions
- Private group creation and invite-code joining
- Owner-only daily problem creation, editing, and deletion
- Member completion and undo with persisted shared status
- Daily member progress and a derived seven-day heatmap
- Short chronological problem discussion
- PostgreSQL constraints, atomic group RPCs, and Row Level Security policies
- Responsive Vite/React interface and Vercel SPA routing

## Local setup

1. Create a Supabase project.
2. Apply [`supabase/migrations/20260810202905_initial_codestreak.sql`](supabase/migrations/20260810202905_initial_codestreak.sql).
3. Enable Email authentication in Supabase Auth.
4. Copy `.env.example` to `.env.local` and set:

   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
   ```

5. Install and run:

   ```bash
   npm install
   npm run dev
   ```

## Verification

```bash
npm run lint
npm run build
```

Before sharing, test with separate owner and member accounts and complete the checks in [`ACCEPTANCE_CRITERIA.md`](ACCEPTANCE_CRITERIA.md).

## Product documentation

- [`PRD.md`](PRD.md)
- [`IMPLEMENTATION.md`](IMPLEMENTATION.md)
- [`DATABASE.md`](DATABASE.md)
- [`USER_FLOWS.md`](USER_FLOWS.md)
- [`ACCEPTANCE_CRITERIA.md`](ACCEPTANCE_CRITERIA.md)

## One-week market test

Share the deployed link with the existing 10–15 person DSA group. Measure invited users who register, regular completion check-ins, continued use after two weeks, and where the flow causes confusion. Improve only from observed usage.
