# PRD - CodeStreak

## Product summary

A lightweight accountability web app for one small private DSA study group. Members solve problems on LeetCode or another external platform, then use this app to record completion, see group consistency, and discuss a problem briefly.

Core loop:

`See problem -> Solve externally -> Mark done -> See group progress -> Stay consistent`

The app is not a coding platform and must not attempt to replace LeetCode.

## Problem

Progress in WhatsApp, Reddit, or Discord study groups gets buried in chat. Members cannot quickly see who completed the daily problem, whether the group is staying consistent, or who has silently dropped off. Admins must post and track progress manually.

## Target users

- Initial test group: 10-15 existing members.
- Prototype capacity: 10-50 users.
- Roles: one group owner/admin and regular members.

## Prototype goal

Test one assumption: will a small DSA group voluntarily use a dedicated accountability page for 2-4 weeks instead of posting only "Done" in chat?

## Required features

1. **Authentication** - Google sign-in preferred; email/password is an acceptable fallback. Sessions persist.
2. **Private group** - An admin creates a group. Members join using an invite code or link. Only members can access group data.
3. **Today's problem** - The admin publishes one problem for a date with title, URL, platform, difficulty, and optional note.
4. **Completion** - A member marks or unmarks their own completion. State persists after refresh.
5. **Daily progress** - Show completed count, total member count, and each member's status.
6. **Weekly heatmap** - Show members as rows and the last seven dates as columns. Values are derived from problems and completions.
7. **Minimal discussion** - Short chronological text comments per problem. Build this only after the core loop works.
8. **Admin controls** - Create, edit, or delete a problem and copy the invite code/link.

## Main screens

- Sign in
- Create or join group
- Group dashboard with today's problem and progress
- Seven-day progress view
- Problem discussion
- Minimal admin problem form

## Experience direction

- Mobile-first because most users will open the link from chat.
- Clean and modern, but not a dense corporate admin panel.
- Today's problem and completion state dominate the dashboard.
- Completion progress is visible without navigating elsewhere.
- The heatmap may take visual inspiration from GitHub contribution activity.
- Use cards and animation sparingly. Prioritize clear states and fast interaction.

## Out of scope

- Code editor, compiler, code execution, submissions, or solutions
- LeetCode account integration or automatic completion detection
- AI hints, AI chat, or AI APIs
- Rankings, points, badges, rewards, or competitive leaderboards
- Notifications, reminders, WhatsApp/Discord integrations, or email campaigns
- Public groups, group discovery, friends, direct messages, or multiple admin roles
- Rich profiles, file/image uploads, reactions, mentions, or threaded comments
- Native mobile apps, subscriptions, payments, analytics platforms, or complex moderation

Do not implement out-of-scope items even if they appear easy.

## Success signals

- More than 60% of invited users register.
- Roughly 40-50% or more of members regularly mark completion.
- Members still use the app after two weeks.
- Members open it without repeated reminders.
- Users can understand the core loop with little explanation.

## Product decision rule

After 2-4 weeks, continue only if visible group accountability improves consistency or users clearly value the shared progress view. Improve, reposition, or stop based on observed behavior rather than adding features automatically.
