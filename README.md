# CodeStreak

CodeStreak is a mobile-first accountability app for small private DSA groups. An owner posts daily problems, members solve them on the original platform, honestly check in, and see shared consistency without chat noise.

## Included prototype

- One-tap Google sign-in plus email/password fallback with persistent Supabase sessions
- Private group creation and invite-code joining
- Owner-only daily problem creation, including multiple assignments on the same date, editing, and deletion
- Automatic Day 13-102 roadmap publishing at midnight in Asia/Kolkata, including recovery, revision, and mock days
- Owner-only member removal with database-enforced authorization
- Honest member check-ins with not started, attempted, need help, and solved states
- Daily status breakdowns and a derived seven-day heatmap
- Rich problem discussion with text, private image attachments, and readable code sections
- Owner moderation for deleting discussion posts
- PostgreSQL constraints, atomic group RPCs, and Row Level Security policies
- Responsive Vite/React interface and Vercel SPA routing

## Local setup

1. Create a Supabase project.
2. Apply every SQL file in [`supabase/migrations`](supabase/migrations) in timestamp order.
3. Install the roadmap for the target group from the Supabase SQL editor after that group exists:

   ```sql
   select * from private.install_dsa_roadmap(
     (select id from public.groups where name = 'DSA - Daily Sprint' limit 1),
     date '2026-08-24'
   );
   ```
4. Enable Email authentication in Supabase Auth.
5. Enable the Google provider under **Authentication -> Sign In / Providers**, add the Google client ID and secret, and follow Supabase's displayed callback-URL instructions.
5. Under **Authentication -> URL Configuration**, add both the local login URL and deployed login URL to the redirect allow list (for example, `http://localhost:5173/login` and `https://your-app.vercel.app/login`).
6. Copy `.env.example` to `.env.local` and set:

   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
   ```

7. Install and run:

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

Share the deployed link with the existing 10–15 person DSA group. Measure invited users who register, regular status check-ins, help requests that receive useful replies, continued use after two weeks, and where the flow causes confusion. Improve only from observed usage.
