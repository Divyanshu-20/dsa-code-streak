# Implementation Brief

## Objective

Build the simplest production-usable prototype for 10-50 users. Optimize for a reliable core loop, fast mobile use, and easy deployment - not scale or architectural sophistication.

## Required architecture

- UI and app generation: Lovable.
- Frontend: use Lovable's generated React stack; do not rewrite the framework without a clear blocker.
- Backend services: Supabase Auth, PostgreSQL, generated APIs, and Row Level Security.
- Hosting: deployable to Vercel.
- Separate Node, Express, Nest, Java, or other backend server: prohibited for this prototype.
- Secrets: never place a Supabase service-role key in browser code. The public anonymous key is acceptable only with correct Row Level Security.

## Simplicity constraints

- Use the existing Lovable/Supabase client and component patterns.
- Keep dependencies minimal and avoid abstraction layers for hypothetical growth.
- Use direct Supabase queries from the app where Row Level Security safely permits them.
- Do not store derived daily counts, percentages, streaks, or heatmap cells. Store only one status row per member/problem.
- Do not add real-time subscriptions unless the basic query-and-refresh behavior is already correct and the addition is trivial.
- Do not add external analytics, queues, background jobs, storage buckets, or edge functions unless a documented requirement cannot work without one.
- Pre-schedule the fixed Day 13-102 roadmap and gate rows with `publish_at`; do not add a Cron job for deterministic calendar data.
- Show useful loading, empty, and error states. Avoid silent failures.

## Suggested routes

Route names may follow the generated project conventions, but the product needs these destinations:

- `/login`
- `/onboarding` for create/join group
- `/group/:groupId` for today's problems and daily progress
- `/group/:groupId/progress` for the seven-day heatmap
- `/group/:groupId/problem/:problemId` for discussion
- `/group/:groupId/admin/problem` for create/edit

Protected pages redirect unauthenticated users to sign in. Non-members must receive no group data.

## Build order

1. Connect Supabase and authentication.
2. Create schema, constraints, indexes, and Row Level Security policies.
3. Create/join group and membership checks.
4. Install the canonical roadmap for the target group while preserving owner-added problems.
5. Member records not started, attempted, need help, or solved for each problem.
6. Render the daily four-state breakdown and member statuses from check-in records.
7. Render the seven-day heatmap from problems and check-ins.
8. Add discussion posts with private image storage, formatted code sections, and owner moderation.
9. Add loading, empty, validation, and error states.
10. Verify mobile layout, access isolation, refresh persistence, and Vercel production build.

## UI behavior

- Use `Asia/Kolkata` for today's date and midnight rollover while storing assignment dates as PostgreSQL `date` values.
- Difficulty values: `Basic`, `Easy`, `Medium`, or `Hard`.
- External problem links open safely in a new tab; URL-free drills render a self-contained in-app prompt.
- Rest, revision, and zero-problem mock days render their schedule instructions rather than a generic empty state.
- The check-in control must clearly distinguish not started, attempted, need help, solved, saving, and error states.
- Disable duplicate form submission while a request is pending.
- Confirm before deleting a problem because its check-ins and comments will also be removed.
- Empty states should tell the user what to do next.

## Environment and deployment

- Use the environment-variable names produced by the Lovable project for the Supabase project URL and public anonymous key.
- Configure the production Vercel URL as an allowed Supabase Auth redirect URL.
- Confirm client-side routing works on a direct page load in production.
- Do not expose private keys in the repository or Vercel client bundle.

## Verification

- Run lint/type checks and the production build used by the generated stack.
- Test with at least two accounts: owner and member.
- Test a non-member attempting to access the group.
- Test at approximately 390 px mobile width and a desktop width.
- Complete every item in `ACCEPTANCE_CRITERIA.md` before sharing.

## Definition of prototype complete

The app is complete when the required core flow works on the deployed Vercel URL, Supabase policies prevent cross-group access and unauthorized writes, and the acceptance criteria pass. Visual extras and future features do not count toward completion.
